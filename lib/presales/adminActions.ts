"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { generateAccessToken } from "@/lib/presales/tokens";
import { uploadFileToDrive, copyExistingDriveFile, extractDriveFileId } from "@/lib/presales/drive";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { encodeOtherOption } from "@/lib/presales/surveyOptions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/presales/fileUpload";

// "Firma - Ürün - 06.07.2026" — the fixed format used for both a journey's own
// `name` and the Drive folder created for it, so the two always match.
function formatJourneyDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export async function createProspectAndJourney(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const salesRepId = String(formData.get("salesRepId") ?? "").trim() || null;
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const stageTemplateId = String(formData.get("stageTemplateId") ?? "").trim();

  if (!companyName || !contactName || !contactEmail) {
    throw new Error("Şirket adı, kişi adı ve e-posta zorunludur.");
  }
  if (!salesRepId || !productId) {
    throw new Error("Satışçı ve ürün/uzmanlık seçimi zorunludur.");
  }
  if (!stageTemplateId) {
    throw new Error("Hangi aşama şablonuyla başlanacağı zorunludur.");
  }

  const stageDefs = await prisma.stageDefinition.findMany({
    where: { stageTemplateId, isActive: true },
    orderBy: { order: "asc" },
  });

  const product = await prisma.product.findUnique({ where: { id: productId } });

  const prospect = await prisma.prospect.create({
    data: { companyName, contactName, contactEmail, contactPhone },
  });

  const createdAt = new Date();
  const name = `${companyName} - ${product?.name ?? "Ürün atanmadı"} - ${formatJourneyDate(createdAt)}`;

  const journey = await prisma.journey.create({
    data: { prospectId: prospect.id, accessToken: generateAccessToken(), salesRepId, productId, name, createdAt },
  });

  const journeyStages: { id: string }[] = [];
  for (const def of stageDefs) {
    const stage = await prisma.journeyStage.create({
      data: {
        journeyId: journey.id,
        sourceStageDefinitionId: def.id,
        key: def.key,
        name: def.name,
        description: def.description,
        customerDescription: def.customerDescription,
        customerVisible: def.customerVisible,
        surveysEnabled: def.surveysEnabled,
        estimatedDays: def.estimatedDays,
        order: def.order,
        status: journeyStages.length === 0 ? "active" : "pending",
      },
    });
    journeyStages.push(stage);
  }

  revalidatePath("/presales/admin");
  redirect(`/presales/admin/journeys/${journey.id}`);
}

// Stages always proceed strictly in order — there is no free-form status picker.
// Only the single derived "current" stage (lib/presales/stageProgress.ts) can be
// advanced, and only once any survey already sent for it has been answered. A
// case that genuinely needs a different flow should be built that way directly
// (reorder/hide stages), not by jumping a later stage ahead while earlier ones
// are still open.

export async function completeCurrentStage(journeyId: string) {
  const stages = await prisma.journeyStage.findMany({
    where: { journeyId, isActive: true },
    orderBy: { order: "asc" },
  });

  const current = findCurrentStage(stages);
  if (!current) {
    throw new Error("Tamamlanacak bir aşama kalmadı.");
  }

  const pendingSurveys = await prisma.surveyInstance.count({
    where: { stageId: current.id, status: "sent" },
  });
  if (pendingSurveys > 0) {
    throw new Error(
      "Bu aşamada müşteriye gönderilmiş ama henüz cevaplanmamış bir anket var — önce onun tamamlanmasını bekle."
    );
  }

  const next = stages.find((s) => s.order > current.order);

  await prisma.$transaction([
    prisma.journeyStage.update({
      where: { id: current.id },
      data: { status: "completed", completedAt: new Date() },
    }),
    ...(next
      ? [
          prisma.journeyStage.update({
            where: { id: next.id },
            data: { status: "active", enteredAt: new Date() },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

export async function reopenLastCompletedStage(journeyId: string) {
  const stages = await prisma.journeyStage.findMany({
    where: { journeyId, isActive: true },
    orderBy: { order: "asc" },
  });

  const current = findCurrentStage(stages);
  const currentIndex = current ? stages.findIndex((s) => s.id === current.id) : stages.length;
  const previous = currentIndex > 0 ? stages[currentIndex - 1] : undefined;

  if (!previous || previous.status !== "completed") {
    throw new Error("Geri alınacak tamamlanmış bir aşama yok.");
  }

  await prisma.$transaction([
    prisma.journeyStage.update({
      where: { id: previous.id },
      data: { status: "active", completedAt: null, enteredAt: new Date() },
    }),
    ...(current
      ? [
          prisma.journeyStage.update({
            where: { id: current.id },
            data: { status: "pending", enteredAt: null },
          }),
        ]
      : []),
  ]);

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

export async function toggleProposalRequested(journeyId: string, requested: boolean) {
  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      proposalRequested: requested,
      proposalRequestedAt: requested ? new Date() : null,
    },
  });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
}

export async function setJourneyOutcome(journeyId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "active");
  const outcomeReason = String(formData.get("outcomeReason") ?? "").trim() || null;
  const closeDateRaw = String(formData.get("outcomeSetAt") ?? "").trim();
  const isClosed = status === "won" || status === "lost";

  await prisma.journey.update({
    where: { id: journeyId },
    data: {
      status,
      outcomeReason,
      outcomeSetAt: isClosed ? (closeDateRaw ? new Date(closeDateRaw) : new Date()) : null,
    },
  });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath("/presales/admin");
}

export async function assignSalesRep(journeyId: string, formData: FormData) {
  const salesRepId = String(formData.get("salesRepId") ?? "").trim() || null;
  const journey = await prisma.journey.update({
    where: { id: journeyId },
    data: { salesRepId },
    select: { accessToken: true },
  });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath("/presales/admin");
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

export async function setJourneyLinkDisabled(journeyId: string, linkDisabled: boolean) {
  await prisma.journey.update({ where: { id: journeyId }, data: { linkDisabled } });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath("/presales/admin");
}

// Independent of status/outcome — a won or lost journey can also be archived.
export async function setJourneyArchived(journeyId: string, archived: boolean) {
  await prisma.journey.update({ where: { id: journeyId }, data: { archived } });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath("/presales/admin");
}

// --- Bulk actions (Dashboard: select several journeys, apply one change to all) ---

function revalidateJourneys(journeyIds: string[]) {
  revalidatePath("/presales/admin");
  for (const id of journeyIds) revalidatePath(`/presales/admin/journeys/${id}`);
}

export async function bulkSetJourneyStatus(journeyIds: string[], status: string) {
  if (journeyIds.length === 0) return;
  await prisma.journey.updateMany({
    where: { id: { in: journeyIds } },
    data: {
      status,
      outcomeSetAt: status === "won" || status === "lost" ? new Date() : null,
    },
  });
  revalidateJourneys(journeyIds);
}

export async function bulkAssignSalesRep(journeyIds: string[], salesRepId: string | null) {
  if (journeyIds.length === 0) return;
  const journeys = await prisma.journey.findMany({
    where: { id: { in: journeyIds } },
    select: { accessToken: true },
  });
  await prisma.journey.updateMany({ where: { id: { in: journeyIds } }, data: { salesRepId } });
  revalidateJourneys(journeyIds);
  for (const j of journeys) revalidatePath(`/presales/j/${j.accessToken}`);
}

export async function bulkSetJourneyLinkDisabled(journeyIds: string[], linkDisabled: boolean) {
  if (journeyIds.length === 0) return;
  await prisma.journey.updateMany({ where: { id: { in: journeyIds } }, data: { linkDisabled } });
  revalidateJourneys(journeyIds);
}

export async function bulkSetJourneyArchived(journeyIds: string[], archived: boolean) {
  if (journeyIds.length === 0) return;
  await prisma.journey.updateMany({ where: { id: { in: journeyIds } }, data: { archived } });
  revalidateJourneys(journeyIds);
}

// --- Stage templates (named, reusable stage flows a journey can start from) ---

export async function createStageTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Şablon adı zorunludur.");
  }
  const template = await prisma.stageTemplate.create({ data: { name } });
  revalidatePath("/presales/admin/stages");
  redirect(`/presales/admin/stages/${template.id}`);
}

export async function renameStageTemplate(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Şablon adı zorunludur.");
  }
  await prisma.stageTemplate.update({ where: { id }, data: { name } });
  revalidatePath("/presales/admin/stages");
  revalidatePath(`/presales/admin/stages/${id}`);
}

export async function setDefaultStageTemplate(id: string) {
  await prisma.$transaction([
    prisma.stageTemplate.updateMany({ data: { isDefault: false }, where: { NOT: { id } } }),
    prisma.stageTemplate.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/presales/admin/stages");
}

export async function duplicateStageTemplate(id: string) {
  const source = await prisma.stageTemplate.findUniqueOrThrow({
    where: { id },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  const copy = await prisma.stageTemplate.create({ data: { name: `${source.name} (kopya)` } });

  await prisma.stageDefinition.createMany({
    data: source.stages.map((s) => ({
      stageTemplateId: copy.id,
      key: s.key,
      name: s.name,
      description: s.description,
      customerDescription: s.customerDescription,
      customerVisible: s.customerVisible,
      surveysEnabled: s.surveysEnabled,
      estimatedDays: s.estimatedDays,
      order: s.order,
      isActive: s.isActive,
    })),
  });

  revalidatePath("/presales/admin/stages");
}

export async function deleteStageTemplate(id: string) {
  const [template, templateCount] = await Promise.all([
    prisma.stageTemplate.findUniqueOrThrow({ where: { id } }),
    prisma.stageTemplate.count(),
  ]);

  if (templateCount <= 1) {
    throw new Error("Son kalan şablon silinemez — en az bir şablon olmalı.");
  }
  if (template.isDefault) {
    throw new Error("Varsayılan şablon silinemez — önce başka bir şablonu varsayılan yap.");
  }

  await prisma.stageTemplate.delete({ where: { id } });
  revalidatePath("/presales/admin/stages");
}

export async function upsertStageDefinition(stageTemplateId: string, formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const customerDescription = String(formData.get("customerDescription") ?? "").trim() || null;
  const customerVisible = formData.get("customerVisible") === "on";
  const surveysEnabled = formData.get("surveysEnabled") === "on";
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "").trim();
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!key || !name) {
    throw new Error("Aşama anahtarı (key) ve adı zorunludur.");
  }

  const data = { key, name, description, customerDescription, customerVisible, surveysEnabled, estimatedDays };

  if (id) {
    await prisma.stageDefinition.update({ where: { id }, data });
  } else {
    const last = await prisma.stageDefinition.findFirst({ where: { stageTemplateId }, orderBy: { order: "desc" } });
    await prisma.stageDefinition.create({ data: { ...data, stageTemplateId, order: (last?.order ?? -1) + 1 } });
  }

  revalidatePath(`/presales/admin/stages/${stageTemplateId}`);
}

export async function setStageActive(id: string, stageTemplateId: string, isActive: boolean) {
  await prisma.stageDefinition.update({ where: { id }, data: { isActive } });
  revalidatePath(`/presales/admin/stages/${stageTemplateId}`);
}

export async function reorderStageDefinitions(stageTemplateId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.stageDefinition.update({ where: { id }, data: { order: index } }))
  );
  revalidatePath(`/presales/admin/stages/${stageTemplateId}`);
}

// --- Per-case stages (JourneyStage): freely editable copies scoped to one journey ---

export async function createJourneyStage(formData: FormData) {
  const journeyId = String(formData.get("journeyId") ?? "").trim();
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "").trim();
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!journeyId || !key || !name) {
    throw new Error("Key ve aşama adı zorunludur.");
  }

  const last = await prisma.journeyStage.findFirst({ where: { journeyId }, orderBy: { order: "desc" } });

  await prisma.journeyStage.create({
    data: { journeyId, key, name, description, estimatedDays, order: (last?.order ?? -1) + 1 },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

export async function updateJourneyStage(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const journeyId = String(formData.get("journeyId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const customerDescription = String(formData.get("customerDescription") ?? "").trim() || null;
  const customerVisible = formData.get("customerVisible") === "on";
  const surveysEnabled = formData.get("surveysEnabled") === "on";
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "").trim();
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!id || !name) {
    throw new Error("Aşama adı zorunludur.");
  }

  await prisma.journeyStage.update({
    where: { id },
    data: { name, description, customerDescription, customerVisible, surveysEnabled, estimatedDays },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

export async function setJourneyStageActive(id: string, journeyId: string, isActive: boolean) {
  await prisma.journeyStage.update({ where: { id }, data: { isActive } });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

export async function reorderJourneyStages(journeyId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) => prisma.journeyStage.update({ where: { id }, data: { order: index } }))
  );
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

// --- Shared question parsing (used by both survey templates and per-case surveys) ---

function parseQuestionSlots(formData: FormData) {
  const count = Number(formData.get("questionCount") ?? 0);

  type RawQuestion = {
    text: string;
    type: string;
    options: string[];
    required: boolean;
    conditionOnIndex: number | null;
    conditionValues: string[];
  };

  // First pass: read each slot as authored in the editor. Blank slots (no text)
  // are kept as `null` placeholders so we can still translate an editor-index
  // condition reference (e.g. "depends on slot 3") into the right final `order`
  // even when an earlier slot was left empty and therefore dropped below.
  const rawSlots: (RawQuestion | null)[] = [];
  for (let i = 0; i < count; i++) {
    const text = String(formData.get(`question_${i}_text`) ?? "").trim();
    if (!text) {
      rawSlots.push(null);
      continue;
    }

    const optionTexts = formData.getAll(`question_${i}_option`).map((o) => String(o));
    const optionOtherFlags = formData.getAll(`question_${i}_option_isOther`).map((o) => String(o));
    const options: string[] = [];
    optionTexts.forEach((raw, idx) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      options.push(optionOtherFlags[idx] === "1" ? encodeOtherOption(trimmed) : trimmed);
    });

    const conditionOnRaw = String(formData.get(`question_${i}_conditionOn`) ?? "").trim();
    const conditionOnIndex = conditionOnRaw !== "" && !Number.isNaN(Number(conditionOnRaw)) ? Number(conditionOnRaw) : null;
    const conditionValues = formData.getAll(`question_${i}_conditionValue`).map((v) => String(v)).filter(Boolean);

    rawSlots.push({
      text,
      type: String(formData.get(`question_${i}_type`) ?? "short_text"),
      options,
      required: formData.get(`question_${i}_required`) === "on",
      conditionOnIndex,
      conditionValues,
    });
  }

  // Map original editor slot index -> final order (blank slots are skipped).
  const slotToOrder = new Map<number, number>();
  let order = 0;
  rawSlots.forEach((slot, i) => {
    if (slot) {
      slotToOrder.set(i, order);
      order++;
    }
  });

  const questions = rawSlots
    .map((slot, i) => {
      if (!slot) return null;
      const conditionOnOrder =
        slot.conditionOnIndex !== null && slotToOrder.has(slot.conditionOnIndex)
          ? slotToOrder.get(slot.conditionOnIndex)!
          : null;

      return {
        text: slot.text,
        type: slot.type,
        options: slot.options.length > 0 ? slot.options : undefined,
        required: slot.required,
        order: slotToOrder.get(i)!,
        conditionOnOrder,
        conditionValues:
          conditionOnOrder !== null && slot.conditionValues.length > 0 ? slot.conditionValues : undefined,
      };
    })
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return questions;
}

// --- Survey templates (named, reusable question lists — not tied to a stage) ---

export async function createSurveyTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Şablon adı zorunludur.");
  }

  const template = await prisma.surveyTemplate.create({ data: { name } });
  revalidatePath("/presales/admin/survey-templates");
  redirect(`/presales/admin/survey-templates/${template.id}`);
}

export async function renameSurveyTemplate(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Şablon adı zorunludur.");
  }
  await prisma.surveyTemplate.update({ where: { id }, data: { name } });
  revalidatePath(`/presales/admin/survey-templates/${id}`);
  revalidatePath("/presales/admin/survey-templates");
}

export async function updateSurveyTemplate(id: string, formData: FormData) {
  // Renaming is handled entirely by the separate `renameSurveyTemplate` form
  // above this one on the page — this form only ever submits question fields,
  // so `name` is deliberately not read or required here.
  const questions = parseQuestionSlots(formData);

  await prisma.$transaction([
    prisma.surveyTemplateItem.deleteMany({ where: { surveyTemplateId: id } }),
    prisma.surveyTemplate.update({
      where: { id },
      data: { items: { create: questions } },
    }),
  ]);

  revalidatePath(`/presales/admin/survey-templates/${id}`);
  revalidatePath("/presales/admin/survey-templates");
}

export async function deleteSurveyTemplate(id: string) {
  await prisma.surveyTemplate.delete({ where: { id } });
  revalidatePath("/presales/admin/survey-templates");
}

// --- Surveys (per-case, optionally started from a template, then customized) ---

export async function createSurveyInstance(formData: FormData) {
  const journeyId = String(formData.get("journeyId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const questions = parseQuestionSlots(formData);

  if (!journeyId || !stageId || !title || questions.length === 0) {
    throw new Error("Journey, aşama, başlık ve en az bir soru zorunludur.");
  }

  await prisma.surveyInstance.create({
    data: { journeyId, stageId, title, selections: { create: questions } },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  redirect(`/presales/admin/journeys/${journeyId}`);
}

export async function sendSurveyInstance(surveyInstanceId: string, journeyId: string) {
  await prisma.surveyInstance.update({
    where: { id: surveyInstanceId },
    data: { status: "sent", sentAt: new Date() },
  });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
}

// --- Documents ---

export async function uploadDocument(formData: FormData) {
  const journeyId = String(formData.get("journeyId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "other").trim();
  const title = String(formData.get("title") ?? "").trim();
  const customerVisible = formData.get("customerVisible") === "on";
  const file = formData.get("file") as File | null;

  if (!journeyId || !title || !file || file.size === 0) {
    throw new Error("Journey, başlık ve dosya zorunludur.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}).`);
  }

  const journey = await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } });

  const { driveFileId, webViewLink, folderId } = await uploadFileToDrive({
    file,
    fileName: file.name,
    journeyName: journey.name,
    documentType: type,
    existingFolderId: journey.driveFolderId,
  });

  if (!journey.driveFolderId) {
    await prisma.journey.update({ where: { id: journeyId }, data: { driveFolderId: folderId } });
  }

  await prisma.document.create({
    data: {
      journeyId,
      stageId,
      type,
      title,
      driveFileId,
      driveWebViewLink: webViewLink,
      customerVisible,
      uploadedBy: "admin",
    },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}/documents`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

// For files that already exist elsewhere in Drive (typically meeting
// recordings, ~40-50MB each, already saved there as a matter of course) —
// copies the file server-to-server instead of downloading and re-uploading
// it through the browser, which would also hit the 4MB upload guard above.
// Requires the service account to already have read access to the source
// file (e.g. it lives in the same Shared Drive, or is shared with the
// service account's email directly) — otherwise the copy fails with a 404.
export async function linkExistingDriveFile(formData: FormData) {
  const journeyId = String(formData.get("journeyId") ?? "").trim();
  const stageId = String(formData.get("stageId") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "meeting_note").trim();
  const title = String(formData.get("title") ?? "").trim();
  const customerVisible = formData.get("customerVisible") === "on";
  const driveSource = String(formData.get("driveSource") ?? "").trim();

  if (!journeyId || !title || !driveSource) {
    throw new Error("Journey, başlık ve Drive dosya linki/ID'si zorunludur.");
  }

  const journey = await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } });

  const { driveFileId, webViewLink, folderId } = await copyExistingDriveFile({
    sourceFileId: extractDriveFileId(driveSource),
    fileName: title,
    journeyName: journey.name,
    documentType: type,
    existingFolderId: journey.driveFolderId,
  });

  if (!journey.driveFolderId) {
    await prisma.journey.update({ where: { id: journeyId }, data: { driveFolderId: folderId } });
  }

  await prisma.document.create({
    data: {
      journeyId,
      stageId,
      type,
      title,
      driveFileId,
      driveWebViewLink: webViewLink,
      customerVisible,
      uploadedBy: "admin",
    },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}/documents`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

// --- Sales reps ---

export async function createSalesRep(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email) {
    throw new Error("Ad ve e-posta zorunludur.");
  }

  await prisma.salesRep.create({ data: { name, email, phone, title } });
  revalidatePath("/presales/admin/sales-reps");
}

export async function setSalesRepActive(id: string, isActive: boolean) {
  await prisma.salesRep.update({ where: { id }, data: { isActive } });
  revalidatePath("/presales/admin/sales-reps");
}

export async function updateSalesRep(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email) {
    throw new Error("Ad ve e-posta zorunludur.");
  }

  await prisma.salesRep.update({ where: { id }, data: { name, email, phone, title } });
  revalidatePath("/presales/admin/sales-reps");
  revalidatePath("/presales/admin");
}

export async function deleteSalesRep(id: string) {
  // Journey.salesRepId -> SalesRep has ON DELETE SET NULL, so any case currently
  // assigned to this rep is simply left unassigned rather than blocking deletion.
  await prisma.salesRep.delete({ where: { id } });
  revalidatePath("/presales/admin/sales-reps");
}

// --- Products / expertise areas ---

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) {
    throw new Error("Ürün/uzmanlık adı zorunludur.");
  }

  await prisma.product.create({ data: { name, description } });
  revalidatePath("/presales/admin/products");
}

export async function setProductActive(id: string, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/presales/admin/products");
}

export async function assignProduct(journeyId: string, formData: FormData) {
  const existing = await prisma.journey.findUnique({ where: { id: journeyId }, select: { productId: true } });
  if (existing?.productId) {
    throw new Error("Ürün, journey oluşturulduktan sonra değiştirilemez.");
  }
  const productId = String(formData.get("productId") ?? "").trim() || null;
  await prisma.journey.update({ where: { id: journeyId }, data: { productId } });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
}

// --- Admin login (shared Basic-Auth credentials, editable from the panel) ---

export async function updateAdminCredentials(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!username || !password) {
    throw new Error("Kullanıcı adı ve şifre zorunludur.");
  }

  const existing = await prisma.adminCredential.findFirst();
  if (existing) {
    await prisma.adminCredential.update({ where: { id: existing.id }, data: { username, password } });
  } else {
    await prisma.adminCredential.create({ data: { username, password } });
  }

  revalidatePath("/presales/admin/account");
}
