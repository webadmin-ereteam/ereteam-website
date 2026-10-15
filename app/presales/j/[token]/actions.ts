"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/presales/db";
import { uploadFileToDrive } from "@/lib/presales/drive";
import { notifySalesRep, notifyTechnicalLead } from "@/lib/presales/notify";
import { buildSurveyExportBuffer, surveyExportFileName } from "@/lib/presales/surveyExcel";
import { isJourneyLinkActive } from "@/lib/presales/journeyLink";
import {
  NormalizedSurveyAnswer,
  ParsedSurveyAnswers,
  parseSurveyAnswers,
  validateSurveyAnswerFiles,
} from "@/lib/presales/surveyAnswers";
import { escapeHtml } from "@/lib/presales/escapeHtml";
import { Prisma } from "@/lib/generated/prisma/client";

type SurveyWithSelections = Prisma.SurveyInstanceGetPayload<{
  include: {
    selections: { include: { response: { include: { document: true } } } };
    journey: { include: { prospect: true; salesRep: true; technicalLead: true } };
    stage: true;
  };
}>;

async function loadSurvey(token: string, surveyInstanceId: string): Promise<SurveyWithSelections> {
  const survey = await prisma.surveyInstance.findFirst({
    where: { id: surveyInstanceId, journey: { accessToken: token } },
    include: {
      selections: { include: { response: { include: { document: true } } } },
      journey: { include: { prospect: true, salesRep: true, technicalLead: true } },
      stage: true,
    },
  });

  if (!survey) throw new Error("Anket bulunamadı veya artık aktif değil.");
  return survey;
}

async function acquireWriteClaim(
  token: string,
  surveyInstanceId: string,
  mode: "draft" | "submit",
): Promise<{ survey: SurveyWithSelections; claim: string } | null> {
  const survey = await loadSurvey(token, surveyInstanceId);
  if (mode === "submit" && survey.status === "completed") return null;
  if (survey.status !== "sent" || !isJourneyLinkActive(survey.journey)) {
    throw new Error("Anket bulunamadı veya artık aktif değil.");
  }

  const claim = randomUUID();
  const acquired = await prisma.surveyInstance.updateMany({
    where: { id: survey.id, status: "sent", responseWriteToken: null },
    data: { responseWriteToken: claim, responseWriteStartedAt: new Date() },
  });
  if (acquired.count !== 1) {
    if (mode === "submit") {
      const latest = await prisma.surveyInstance.findUnique({ where: { id: survey.id }, select: { status: true } });
      if (latest?.status === "completed") return null;
    }
    throw new Error("Anket şu anda kaydediliyor. Lütfen kısa bir süre sonra tekrar deneyin.");
  }
  try {
    // The first read may have raced with a write that released its claim just
    // before ours was acquired. Reload responses so file satisfaction and
    // hidden-response cleanup always use the state protected by our claim.
    return { survey: await loadSurvey(token, surveyInstanceId), claim };
  } catch (error) {
    await releaseWriteClaim(survey.id, claim);
    throw error;
  }
}

async function releaseWriteClaim(surveyId: string, claim: string) {
  await prisma.surveyInstance.updateMany({
    where: { id: surveyId, responseWriteToken: claim },
    data: { responseWriteToken: null, responseWriteStartedAt: null },
  });
}

async function uploadNewFileAnswers(survey: SurveyWithSelections, parsed: ParsedSurveyAnswers) {
  let folderId = survey.journey.driveFolderId;
  const uploadedFiles = new Map<string, { driveFileId: string; webViewLink: string }>();

  for (const selection of survey.selections) {
    const answer = parsed.answers.get(selection.id);
    if (answer?.kind !== "file" || !answer.file) continue;
    const uploaded = await uploadFileToDrive({
      file: answer.file,
      fileName: answer.file.name,
      journeyName: survey.journey.name,
      documentType: "customer_upload",
      existingFolderId: folderId,
    });
    folderId = uploaded.folderId;
    uploadedFiles.set(selection.id, uploaded);
  }

  return { uploadedFiles, folderId };
}

async function upsertResponse(
  tx: Prisma.TransactionClient,
  selectionId: string,
  answer: Exclude<NormalizedSurveyAnswer, { kind: "file" }>,
) {
  if (answer.kind === "multi") {
    return tx.surveyResponse.upsert({
      where: { surveyQuestionSelectionId: selectionId },
      create: { surveyQuestionSelectionId: selectionId, answerJson: answer.answerJson },
      update: { answerJson: answer.answerJson, answerText: null },
    });
  }
  return tx.surveyResponse.upsert({
    where: { surveyQuestionSelectionId: selectionId },
    create: { surveyQuestionSelectionId: selectionId, answerText: answer.answerText },
    update: { answerText: answer.answerText, answerJson: Prisma.JsonNull },
  });
}

async function persistAnswers(
  tx: Prisma.TransactionClient,
  survey: SurveyWithSelections,
  parsed: ParsedSurveyAnswers,
  uploadedFiles: Map<string, { driveFileId: string; webViewLink: string }>,
  removeHidden: boolean,
) {
  if (removeHidden && parsed.hiddenSelectionIds.length > 0) {
    const hiddenResponseIds = survey.selections
      .filter((selection) => parsed.hiddenSelectionIds.includes(selection.id) && selection.response)
      .map((selection) => selection.response!.id);
    if (hiddenResponseIds.length > 0) {
      await tx.document.deleteMany({ where: { surveyResponseId: { in: hiddenResponseIds } } });
    }
    await tx.surveyResponse.deleteMany({
      where: { surveyQuestionSelectionId: { in: parsed.hiddenSelectionIds } },
    });
  }

  for (const selection of survey.selections) {
    const answer = parsed.answers.get(selection.id);
    if (!answer) continue;
    if (answer.kind !== "file") {
      await upsertResponse(tx, selection.id, answer);
      continue;
    }

    const uploaded = uploadedFiles.get(selection.id);
    if (!uploaded) continue;
    const response = await tx.surveyResponse.upsert({
      where: { surveyQuestionSelectionId: selection.id },
      create: { surveyQuestionSelectionId: selection.id, answerText: uploaded.driveFileId },
      update: { answerText: uploaded.driveFileId, answerJson: Prisma.JsonNull },
    });
    await tx.document.upsert({
      where: { surveyResponseId: response.id },
      create: {
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
      update: {
        title: selection.text || "Müşteri dosyası",
        driveFileId: uploaded.driveFileId,
        driveWebViewLink: uploaded.webViewLink,
      },
    });
  }
}

async function prepareWrite(survey: SurveyWithSelections, formData: FormData, mode: "draft" | "submit") {
  const parsed = parseSurveyAnswers(survey.selections, formData, mode);
  await validateSurveyAnswerFiles(parsed);
  const uploaded = await uploadNewFileAnswers(survey, parsed);
  if (uploaded.folderId && uploaded.folderId !== survey.journey.driveFolderId) {
    await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: uploaded.folderId } });
  }
  return { parsed, ...uploaded };
}

export async function saveSurveyDraft(token: string, surveyInstanceId: string, formData: FormData) {
  const acquired = await acquireWriteClaim(token, surveyInstanceId, "draft");
  if (!acquired) return;
  const { survey, claim } = acquired;
  try {
    const { parsed, uploadedFiles } = await prepareWrite(survey, formData, "draft");
    await prisma.$transaction(async (tx) => {
      const current = await tx.surveyInstance.findUnique({
        where: { id: survey.id },
        select: { status: true, responseWriteToken: true },
      });
      if (current?.status !== "sent" || current.responseWriteToken !== claim) {
        throw new Error("Anket artık kaydedilemiyor.");
      }
      await persistAnswers(tx, survey, parsed, uploadedFiles, false);
      await tx.surveyInstance.updateMany({
        where: { id: survey.id, status: "sent", responseWriteToken: claim },
        data: { responseWriteToken: null, responseWriteStartedAt: null },
      });
    });
  } catch (error) {
    await releaseWriteClaim(survey.id, claim).catch((releaseError) => {
      console.error("Survey write claim release failed:", releaseError);
    });
    throw error;
  }
  revalidatePath(`/presales/j/${token}`);
}

export async function submitSurveyResponses(token: string, surveyInstanceId: string, formData: FormData) {
  const acquired = await acquireWriteClaim(token, surveyInstanceId, "submit");
  if (!acquired) return;
  const { survey, claim } = acquired;

  let prepared: Awaited<ReturnType<typeof prepareWrite>>;
  let advanced: { nextStageName: string | null };
  try {
    prepared = await prepareWrite(survey, formData, "submit");
    advanced = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "JourneyStage" WHERE "id" = ${survey.stageId} FOR UPDATE`;
      const current = await tx.surveyInstance.findUnique({
        where: { id: survey.id },
        select: { status: true, responseWriteToken: true },
      });
      if (current?.status !== "sent" || current.responseWriteToken !== claim) {
        throw new Error("Anket artık gönderilemiyor.");
      }

      await persistAnswers(tx, survey, prepared.parsed, prepared.uploadedFiles, true);
      const completed = await tx.surveyInstance.updateMany({
        where: { id: survey.id, status: "sent", responseWriteToken: claim },
        data: {
          status: "completed",
          completedAt: new Date(),
          responseWriteToken: null,
          responseWriteStartedAt: null,
        },
      });
      if (completed.count !== 1) throw new Error("Anket artık gönderilemiyor.");

      const otherPendingSurveys = await tx.surveyInstance.count({
        where: { stageId: survey.stageId, status: "sent", id: { not: survey.id } },
      });
      if (otherPendingSurveys !== 0) return { nextStageName: null };

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
      if (!nextStage) return { nextStageName: null };
      await tx.journeyStage.update({
        where: { id: nextStage.id },
        data: { status: "active", enteredAt: new Date() },
      });
      return { nextStageName: nextStage.name };
    });
  } catch (error) {
    await releaseWriteClaim(survey.id, claim).catch((releaseError) => {
      console.error("Survey write claim release failed:", releaseError);
    });
    throw error;
  }

  const [exportClaim, salesClaim, technicalClaim] = await Promise.all([
    prisma.surveyInstance.updateMany({
      where: { id: survey.id, status: "completed", exportAttemptedAt: null },
      data: { exportAttemptedAt: new Date() },
    }),
    survey.journey.salesRep
      ? prisma.surveyInstance.updateMany({
          where: { id: survey.id, status: "completed", salesNotificationAttemptedAt: null },
          data: { salesNotificationAttemptedAt: new Date() },
        })
      : Promise.resolve({ count: 0 }),
    survey.journey.technicalLead
      ? prisma.surveyInstance.updateMany({
          where: { id: survey.id, status: "completed", technicalLeadNotificationAttemptedAt: null },
          data: { technicalLeadNotificationAttemptedAt: new Date() },
        })
      : Promise.resolve({ count: 0 }),
  ]);

  let exportBuffer: ArrayBuffer | null = null;
  let exportFileName: string | null = null;
  if (exportClaim.count === 1 || technicalClaim.count === 1) {
    try {
      const completedSurvey = await prisma.surveyInstance.findUniqueOrThrow({
        where: { id: survey.id },
        include: { selections: { include: { response: true }, orderBy: { order: "asc" } } },
      });
      exportBuffer = buildSurveyExportBuffer(completedSurvey);
      exportFileName = surveyExportFileName(completedSurvey.title);
    } catch (error) {
      console.error("Survey Excel export build failed:", error);
    }
  }

  if (exportClaim.count === 1 && exportBuffer && exportFileName) {
    try {
      const exportFile = new File([exportBuffer], exportFileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const uploaded = await uploadFileToDrive({
        file: exportFile,
        fileName: exportFileName,
        journeyName: survey.journey.name,
        documentType: "survey_export",
        existingFolderId: prepared.folderId,
      });
      if (uploaded.folderId !== survey.journey.driveFolderId) {
        await prisma.journey.update({ where: { id: survey.journeyId }, data: { driveFolderId: uploaded.folderId } });
      }
      await prisma.document.upsert({
        where: { surveyExportForId: survey.id },
        create: {
          journeyId: survey.journeyId,
          stageId: survey.stageId,
          type: "survey_export",
          title: exportFileName,
          driveFileId: uploaded.driveFileId,
          driveWebViewLink: uploaded.webViewLink,
          customerVisible: false,
          source: "system_generated",
          uploadedBy: "system",
          surveyExportForId: survey.id,
        },
        update: {
          title: exportFileName,
          driveFileId: uploaded.driveFileId,
          driveWebViewLink: uploaded.webViewLink,
        },
      });
    } catch (error) {
      console.error("Survey Excel export to Drive failed:", error);
    }
  }

  revalidatePath(`/presales/j/${token}`);
  revalidatePath(`/presales/admin/journeys/${survey.journeyId}`);

  if (salesClaim.count === 1 && survey.journey.salesRep) {
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

  if (technicalClaim.count === 1 && survey.journey.technicalLead && exportBuffer && exportFileName) {
    await notifyTechnicalLead({
      technicalLeadEmail: survey.journey.technicalLead.email,
      technicalLeadName: survey.journey.technicalLead.name,
      companyName: survey.journey.prospect.companyName,
      contactName: survey.journey.prospect.contactName,
      surveyTitle: survey.title,
      attachment: { fileName: exportFileName, buffer: exportBuffer },
    });
  }
}
