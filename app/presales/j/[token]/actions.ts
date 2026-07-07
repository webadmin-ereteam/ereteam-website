"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/presales/db";
import { uploadFileToDrive } from "@/lib/presales/drive";
import { notifySalesRep } from "@/lib/presales/notify";
import { buildSurveyExportBuffer, surveyExportFileName } from "@/lib/presales/surveyExcel";
import { decodeOptions } from "@/lib/presales/surveyOptions";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/presales/fileUpload";

export async function submitSurveyResponses(
  token: string,
  surveyInstanceId: string,
  formData: FormData
) {
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: surveyInstanceId, status: "sent", journey: { accessToken: token } },
    include: {
      selections: true,
      journey: { include: { prospect: true, salesRep: true } },
      stage: true,
    },
  });

  if (!survey || !isJourneyLinkActive(survey.journey)) {
    throw new Error("Anket bulunamadı veya artık aktif değil.");
  }

  // Validate every file's size upfront so a submission either uploads nothing
  // or uploads everything — never fails partway through with some files
  // already sitting in Drive and others rejected.
  for (const selection of survey.selections) {
    if (selection.type !== "file_upload") continue;
    const file = formData.get(`answer_${selection.id}`) as File | null;
    if (file && file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `"${selection.text}" için yüklenen dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}). Lütfen daha küçük bir dosya seçip tekrar gönderin.`
      );
    }
  }

  // File uploads go to Google Drive first (external I/O, kept outside the DB transaction).
  let folderId = survey.journey.driveFolderId;
  const uploadedFiles = new Map<string, { driveFileId: string; webViewLink: string }>();

  for (const selection of survey.selections) {
    if (selection.type !== "file_upload") continue;
    const file = formData.get(`answer_${selection.id}`) as File | null;
    if (!file || file.size === 0) continue;

    const uploaded = await uploadFileToDrive({
      file,
      fileName: file.name,
      journeyName: survey.journey.name,
      documentType: "customer_upload",
      existingFolderId: folderId,
    });
    folderId = uploaded.folderId;
    uploadedFiles.set(selection.id, uploaded);
  }

  if (folderId && folderId !== survey.journey.driveFolderId) {
    await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: folderId } });
  }

  const advanced = await prisma.$transaction(async (tx) => {
    for (const selection of survey.selections) {
      if (selection.type === "file_upload") {
        const uploaded = uploadedFiles.get(selection.id);
        const response = await tx.surveyResponse.create({
          data: {
            surveyQuestionSelectionId: selection.id,
            answerText: uploaded ? uploaded.driveFileId : null,
          },
        });
        if (uploaded) {
          await tx.document.create({
            data: {
              journeyId: survey.journeyId,
              stageId: survey.stageId,
              type: "customer_upload",
              title: selection.text || "Müşteri dosyası",
              driveFileId: uploaded.driveFileId,
              driveWebViewLink: uploaded.webViewLink,
              customerVisible: false,
              source: "customer_survey_upload",
              uploadedBy: "customer",
              surveyResponseId: response.id,
            },
          });
        }
        continue;
      }

      // A choice marked "Diğer" submits its plain label as the selected value;
      // if the customer also filled the companion free-text field, fold it into
      // a human-readable "label: detail" answer instead of storing them apart.
      const otherLabels = new Set(
        decodeOptions(selection.options)
          .filter((o) => o.isOther)
          .map((o) => o.text)
      );
      const otherText = String(formData.get(`answer_${selection.id}_other`) ?? "").trim();

      if (selection.type === "multi_choice") {
        const values = formData
          .getAll(`answer_${selection.id}`)
          .map(String)
          .map((v) => (otherLabels.has(v) && otherText ? `${v}: ${otherText}` : v));
        await tx.surveyResponse.create({
          data: { surveyQuestionSelectionId: selection.id, answerJson: values },
        });
        continue;
      }

      const value = formData.get(`answer_${selection.id}`);
      const answerText =
        typeof value === "string" ? (otherLabels.has(value) && otherText ? `${value}: ${otherText}` : value) : null;
      await tx.surveyResponse.create({
        data: {
          surveyQuestionSelectionId: selection.id,
          answerText,
        },
      });
    }

    await tx.surveyInstance.update({
      where: { id: survey.id },
      data: { status: "completed", completedAt: new Date() },
    });

    // If this was the last pending survey for this stage, auto-advance:
    // mark the stage completed and activate the next pending stage in order.
    const otherPendingSurveys = await tx.surveyInstance.count({
      where: { stageId: survey.stageId, status: "sent", id: { not: survey.id } },
    });

    if (otherPendingSurveys === 0) {
      await tx.journeyStage.update({
        where: { id: survey.stageId },
        data: { status: "completed", completedAt: new Date() },
      });

      const nextStage = await tx.journeyStage.findFirst({
        where: {
          journeyId: survey.journeyId,
          isActive: true,
          status: "pending",
          order: { gt: survey.stage.order },
        },
        orderBy: { order: "asc" },
      });

      if (nextStage) {
        await tx.journeyStage.update({
          where: { id: nextStage.id },
          data: { status: "active", enteredAt: new Date() },
        });

        return { nextStageName: nextStage.name };
      }
    }

    return { nextStageName: null };
  });

  // Archive the completed survey as an Excel file in the journey's Drive folder,
  // alongside the manual "Excel İndir" download — best-effort, must never break
  // the customer's actual submission (e.g. Drive isn't configured yet).
  try {
    const completedSurvey = await prisma.surveyInstance.findUniqueOrThrow({
      where: { id: survey.id },
      include: { selections: { include: { response: true }, orderBy: { order: "asc" } } },
    });
    const buffer = buildSurveyExportBuffer(completedSurvey);
    const fileName = surveyExportFileName(completedSurvey.title);
    const exportFile = new File([buffer], fileName, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const uploaded = await uploadFileToDrive({
      file: exportFile,
      fileName,
      journeyName: survey.journey.name,
      documentType: "survey_export",
      existingFolderId: folderId,
    });

    if (uploaded.folderId !== survey.journey.driveFolderId) {
      await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: uploaded.folderId } });
    }

    await prisma.document.create({
      data: {
        journeyId: survey.journeyId,
        stageId: survey.stageId,
        type: "survey_export",
        title: fileName,
        driveFileId: uploaded.driveFileId,
        driveWebViewLink: uploaded.webViewLink,
        customerVisible: false,
        source: "system_generated",
        uploadedBy: "system",
      },
    });
  } catch (err) {
    console.error("Survey Excel export to Drive failed:", err);
  }

  revalidatePath(`/presales/j/${token}`);
  revalidatePath(`/presales/admin/journeys/${survey.journeyId}`);

  if (survey.journey.salesRep) {
    const actionSummary = advanced.nextStageName
      ? `<strong>${survey.journey.prospect.companyName}</strong>, "${survey.title}" anketini tamamladı. Süreç otomatik olarak "${advanced.nextStageName}" aşamasına geçti.`
      : `<strong>${survey.journey.prospect.companyName}</strong>, "${survey.title}" anketini tamamladı.`;

    await notifySalesRep({
      salesRepEmail: survey.journey.salesRep.email,
      salesRepName: survey.journey.salesRep.name,
      companyName: survey.journey.prospect.companyName,
      contactName: survey.journey.prospect.contactName,
      subject: `${survey.journey.prospect.companyName} anketi tamamladı: ${survey.title}`,
      actionSummary,
      journeyId: survey.journeyId,
    });
  }
}
