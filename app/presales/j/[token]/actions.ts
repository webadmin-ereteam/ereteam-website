"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/presales/db";
import { uploadFileToDrive } from "@/lib/presales/drive";
import { notifySalesRep } from "@/lib/presales/notify";
import { buildSurveyExportBuffer, surveyExportFileName } from "@/lib/presales/surveyExcel";
import { decodeOptions } from "@/lib/presales/surveyOptions";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, ALLOWED_UPLOAD_MIME_TYPES, ALLOWED_UPLOAD_LABEL } from "@/lib/presales/fileUpload";
import { escapeHtml } from "@/lib/presales/escapeHtml";
import { Prisma } from "@/lib/generated/prisma/client";

type SurveyWithSelections = Prisma.SurveyInstanceGetPayload<{
  include: {
    selections: true;
    journey: { include: { prospect: true; salesRep: true } };
    stage: true;
  };
}>;

async function loadPendingSurvey(token: string, surveyInstanceId: string): Promise<SurveyWithSelections> {
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

  return survey;
}

// Every file answer is validated (size) and uploaded to Drive *before* the DB
// transaction, same for a draft save as for a final submit — external I/O has
// no place inside a Prisma transaction. A question left untouched this time
// (no new file chosen) simply isn't in the returned map, so `persistAnswers`
// leaves whatever was saved earlier for it alone.
async function uploadNewFileAnswers(survey: SurveyWithSelections, formData: FormData) {
  for (const selection of survey.selections) {
    if (selection.type !== "file_upload") continue;
    const file = formData.get(`answer_${selection.id}`) as File | null;
    if (file && file.size > MAX_UPLOAD_BYTES) {
      throw new Error(
        `"${selection.text}" için yüklenen dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}). Lütfen daha küçük bir dosya seçip tekrar gönderin.`
      );
    }
    if (file && file.size > 0 && !ALLOWED_UPLOAD_MIME_TYPES.includes(file.type)) {
      throw new Error(
        `"${selection.text}" için desteklenmeyen dosya türü — izin verilenler: ${ALLOWED_UPLOAD_LABEL}.`
      );
    }
  }

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

  return { uploadedFiles, folderId };
}

// Shared by both the draft save and the final submit — writes/updates one
// `SurveyResponse` row per question via upsert (not create) since a draft
// save may already have written a row the final submit now needs to revise.
async function persistAnswers(
  tx: Prisma.TransactionClient,
  survey: SurveyWithSelections,
  formData: FormData,
  uploadedFiles: Map<string, { driveFileId: string; webViewLink: string }>
) {
  for (const selection of survey.selections) {
    if (selection.type === "file_upload") {
      const uploaded = uploadedFiles.get(selection.id);
      if (!uploaded) continue;

      const response = await tx.surveyResponse.upsert({
        where: { surveyQuestionSelectionId: selection.id },
        create: { surveyQuestionSelectionId: selection.id, answerText: uploaded.driveFileId },
        update: { answerText: uploaded.driveFileId },
      });

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
      await tx.surveyResponse.upsert({
        where: { surveyQuestionSelectionId: selection.id },
        create: { surveyQuestionSelectionId: selection.id, answerJson: values },
        update: { answerJson: values, answerText: null },
      });
      continue;
    }

    const value = formData.get(`answer_${selection.id}`);
    const answerText =
      typeof value === "string" ? (otherLabels.has(value) && otherText ? `${value}: ${otherText}` : value) : null;
    await tx.surveyResponse.upsert({
      where: { surveyQuestionSelectionId: selection.id },
      create: { surveyQuestionSelectionId: selection.id, answerText },
      update: { answerText, answerJson: Prisma.JsonNull },
    });
  }
}

// Saves whatever the customer has filled in so far without submitting —
// required fields aren't enforced (the button uses `formNoValidate`), the
// survey stays "sent", and none of the completion side-effects (stage
// auto-advance, sales-rep notification, Excel archive) run. They can come
// back to the same link later and keep editing before the real "Gönder".
export async function saveSurveyDraft(token: string, surveyInstanceId: string, formData: FormData) {
  const survey = await loadPendingSurvey(token, surveyInstanceId);
  const { uploadedFiles, folderId } = await uploadNewFileAnswers(survey, formData);

  if (folderId && folderId !== survey.journey.driveFolderId) {
    await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: folderId } });
  }

  await prisma.$transaction((tx) => persistAnswers(tx, survey, formData, uploadedFiles));

  revalidatePath(`/presales/j/${token}`);
}

export async function submitSurveyResponses(
  token: string,
  surveyInstanceId: string,
  formData: FormData
) {
  const survey = await loadPendingSurvey(token, surveyInstanceId);
  const { uploadedFiles, folderId } = await uploadNewFileAnswers(survey, formData);

  if (folderId && folderId !== survey.journey.driveFolderId) {
    await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: folderId } });
  }

  const advanced = await prisma.$transaction(async (tx) => {
    await persistAnswers(tx, survey, formData, uploadedFiles);

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
    const companyNameHtml = escapeHtml(survey.journey.prospect.companyName);
    const surveyTitleHtml = escapeHtml(survey.title);
    const actionSummary = advanced.nextStageName
      ? `<strong>${companyNameHtml}</strong>, "${surveyTitleHtml}" anketini tamamladı. Süreç otomatik olarak "${escapeHtml(advanced.nextStageName)}" aşamasına geçti.`
      : `<strong>${companyNameHtml}</strong>, "${surveyTitleHtml}" anketini tamamladı.`;

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
