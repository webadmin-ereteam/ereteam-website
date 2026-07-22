"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/presales/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { generateAccessToken } from "@/lib/presales/tokens";
import { uploadFileToDrive, copyExistingDriveFile, extractDriveFileId, uploadLogoToDrive, trashDriveFile } from "@/lib/presales/drive";
import { findCurrentStage } from "@/lib/presales/stageProgress";
import { encodeOtherOption } from "@/lib/presales/surveyOptions";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/presales/fileUpload";
import { hashPassword } from "@/lib/presales/passwordHash";

// "Firma - Ürün - 06.07.2026" — the fixed format used for both a journey's own
// `name` and the Drive folder created for it, so the two always match.
// Pinned to Istanbul time — Vercel's serverless functions run in UTC, so a
// journey created between 00:00-03:00 Istanbul time would otherwise get
// stamped with the previous UTC day's date.
function formatJourneyDate(date: Date) {
  return date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Istanbul" });
}

export async function createProspectAndJourney(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const salesRepId = String(formData.get("salesRepId") ?? "").trim() || null;
  const productId = String(formData.get("productId") ?? "").trim() || null;
  const technicalLeadId = String(formData.get("technicalLeadId") ?? "").trim() || null;
  const stageTemplateId = String(formData.get("stageTemplateId") ?? "").trim();

  if (!companyName || !contactName || !contactEmail) {
    throw new Error("Şirket adı, kişi adı ve e-posta zorunludur.");
  }
  if (!salesRepId || !productId || !technicalLeadId) {
    throw new Error("Satışçı, teknik sorumlu ve ürün/uzmanlık seçimi zorunludur.");
  }
  if (!stageTemplateId) {
    throw new Error("Hangi aşama şablonuyla başlanacağı zorunludur.");
  }

  // Logo is optional here — admin may not have the file on hand yet and can
  // always add it later from the journey's Ayarlar tab.
  const logoFile = formData.get("logo") as File | null;
  let logoDriveFileId: string | null = null;
  let logoUrl: string | null = null;
  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > MAX_UPLOAD_BYTES) {
      throw new Error(`Logo dosyası çok büyük (maksimum ${MAX_UPLOAD_LABEL}).`);
    }
    if (!logoFile.type.startsWith("image/")) {
      throw new Error("Logo bir resim dosyası olmalı (PNG, JPG, SVG vb.).");
    }
    const uploaded = await uploadLogoToDrive({ file: logoFile, fileName: logoFile.name });
    logoDriveFileId = uploaded.driveFileId;
    logoUrl = uploaded.thumbnailUrl;
  }

  const stageDefs = await prisma.stageDefinition.findMany({
    where: { stageTemplateId, isActive: true },
    orderBy: { order: "asc" },
  });

  const product = await prisma.product.findUnique({ where: { id: productId } });

  const prospect = await prisma.prospect.create({
    data: { companyName, contactName, contactEmail, contactPhone, logoDriveFileId, logoUrl },
  });

  const createdAt = new Date();
  const name = `${companyName} - ${product?.name ?? "Ürün atanmadı"} - ${formatJourneyDate(createdAt)}`;

  const journey = await prisma.journey.create({
    data: {
      prospectId: prospect.id,
      accessToken: generateAccessToken(),
      salesRepId,
      productId,
      technicalLeadId,
      name,
      createdAt,
    },
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
        customerWaitingMessage: def.customerWaitingMessage,
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
// advanced. Normally that requires any survey already sent for it to have been
// answered first (completeCurrentStage); forceCompleteCurrentStage below is the
// escape hatch for when the answer came in some other way. A case that genuinely
// needs a different flow should be built that way directly (reorder/hide
// stages), not by jumping a later stage ahead while earlier ones are still open.

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

// Same as completeCurrentStage but for when the customer answered outside the
// tool (phone, email) and the admin wants to move on without waiting on a
// sent-but-unanswered survey. Any such surveys on the current stage are
// deleted outright rather than left dangling: the customer page lists every
// "sent" survey regardless of which stage it's attached to, so leaving one
// pending on a stage the journey has already moved past would let the
// customer answer it later and re-trigger that stage's own auto-advance
// logic (`submitSurveyResponses` in j/[token]/actions.ts) against a "next
// pending stage" that's no longer the right one, since this already
// activated it out of band.
export async function forceCompleteCurrentStage(journeyId: string) {
  const [stages, journey] = await Promise.all([
    prisma.journeyStage.findMany({ where: { journeyId, isActive: true }, orderBy: { order: "asc" } }),
    prisma.journey.findUniqueOrThrow({ where: { id: journeyId }, select: { accessToken: true } }),
  ]);

  const current = findCurrentStage(stages);
  if (!current) {
    throw new Error("Tamamlanacak bir aşama kalmadı.");
  }

  const next = stages.find((s) => s.order > current.order);

  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({
      where: { surveyQuestionSelection: { surveyInstance: { stageId: current.id, status: "sent" } } },
    }),
    prisma.surveyQuestionSelection.deleteMany({
      where: { surveyInstance: { stageId: current.id, status: "sent" } },
    }),
    prisma.surveyInstance.deleteMany({ where: { stageId: current.id, status: "sent" } }),
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
  revalidatePath(`/presales/admin/journeys/${journeyId}/surveys`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
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
  revalidatePath("/presales/admin");
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

// Deletes a journey and everything in Postgres tied to it — but deliberately
// never touches Drive. The journey's Drive folder has real business files in
// it (proposals, recordings, survey exports); an automated delete there is
// unrecoverable if anything ever pointed at the wrong folder, unlike a DB
// row. So Drive cleanup stays a manual step — the Ayarlar tab links straight
// to the folder and warns about this before the delete, and again in the
// confirm prompt itself. `Prospect` is left alone too (a company record can
// outlive any one journey).
export async function deleteJourney(journeyId: string) {
  await prisma.$transaction([
    prisma.document.deleteMany({ where: { journeyId } }),
    prisma.surveyResponse.deleteMany({
      where: { surveyQuestionSelection: { surveyInstance: { journeyId } } },
    }),
    prisma.surveyQuestionSelection.deleteMany({ where: { surveyInstance: { journeyId } } }),
    prisma.surveyInstance.deleteMany({ where: { journeyId } }),
    prisma.journeyStage.deleteMany({ where: { journeyId } }),
    prisma.journey.delete({ where: { id: journeyId } }),
  ]);
  revalidatePath("/presales/admin");
  redirect("/presales/admin");
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

// Every stage-template mutation also revalidates /presales/admin/prospects/new
// — that page reads the same `stageTemplate` table independently, and without
// this it kept showing a stale list (a newly created template wouldn't appear
// there until something else happened to revalidate that specific route).

export async function createStageTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Şablon adı zorunludur.");
  }
  const template = await prisma.stageTemplate.create({ data: { name } });
  revalidatePath("/presales/admin/stages");
  revalidatePath("/presales/admin/prospects/new");
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
  revalidatePath("/presales/admin/prospects/new");
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
      customerWaitingMessage: s.customerWaitingMessage,
      customerVisible: s.customerVisible,
      surveysEnabled: s.surveysEnabled,
      estimatedDays: s.estimatedDays,
      order: s.order,
      isActive: s.isActive,
    })),
  });

  revalidatePath("/presales/admin/stages");
  revalidatePath("/presales/admin/prospects/new");
}

export async function deleteStageTemplate(id: string) {
  const templateCount = await prisma.stageTemplate.count();

  if (templateCount <= 1) {
    throw new Error("Son kalan şablon silinemez — en az bir şablon olmalı.");
  }

  await prisma.stageTemplate.delete({ where: { id } });
  revalidatePath("/presales/admin/stages");
  revalidatePath("/presales/admin/prospects/new");
}

export async function upsertStageDefinition(stageTemplateId: string, formData: FormData) {
  const id = String(formData.get("id") ?? "").trim() || undefined;
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const customerDescription = String(formData.get("customerDescription") ?? "").trim() || null;
  const customerWaitingMessage = String(formData.get("customerWaitingMessage") ?? "").trim() || null;
  const customerVisible = formData.get("customerVisible") === "on";
  const surveysEnabled = formData.get("surveysEnabled") === "on";
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "").trim();
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!key || !name) {
    throw new Error("Aşama anahtarı (key) ve adı zorunludur.");
  }

  const data = {
    key,
    name,
    customerDescription,
    customerWaitingMessage,
    customerVisible,
    surveysEnabled,
    estimatedDays,
  };

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

// Deletes one stage out of a template. `JourneyStage.sourceStageDefinitionId`
// is only a lineage pointer back to the template row it was copied from —
// journeys that already copied this stage keep their own independent name/
// description/etc regardless, so it's nulled out (not restricted) before the
// delete rather than blocking it.
export async function deleteStageDefinition(id: string, stageTemplateId: string) {
  await prisma.$transaction([
    prisma.journeyStage.updateMany({
      where: { sourceStageDefinitionId: id },
      data: { sourceStageDefinitionId: null },
    }),
    prisma.stageDefinition.delete({ where: { id } }),
  ]);
  revalidatePath(`/presales/admin/stages/${stageTemplateId}`);
}

// Saves every stage card on the template editor in one call — editing several
// stages used to mean clicking "Kaydet" once per card, which got tedious fast.
// Fields are named `stage_{index}_*` (same convention as QuestionListEditor's
// `question_{index}_*`), read back here and applied in a single transaction.
export async function saveAllStageDefinitions(stageTemplateId: string, formData: FormData) {
  const count = Number(formData.get("stageCount") ?? 0);

  const updates = [];
  for (let i = 0; i < count; i++) {
    const id = String(formData.get(`stage_${i}_id`) ?? "").trim();
    if (!id) continue;

    const key = String(formData.get(`stage_${i}_key`) ?? "").trim();
    const name = String(formData.get(`stage_${i}_name`) ?? "").trim();
    if (!key || !name) {
      throw new Error(`Aşama ${i + 1}: anahtar (key) ve ad zorunludur.`);
    }

    const estimatedDaysRaw = String(formData.get(`stage_${i}_estimatedDays`) ?? "").trim();

    updates.push(
      prisma.stageDefinition.update({
        where: { id },
        data: {
          key,
          name,
          customerDescription: String(formData.get(`stage_${i}_customerDescription`) ?? "").trim() || null,
          customerWaitingMessage: String(formData.get(`stage_${i}_customerWaitingMessage`) ?? "").trim() || null,
          customerVisible: formData.get(`stage_${i}_customerVisible`) === "on",
          surveysEnabled: formData.get(`stage_${i}_surveysEnabled`) === "on",
          estimatedDays: estimatedDaysRaw ? Number(estimatedDaysRaw) : null,
        },
      })
    );
  }

  await prisma.$transaction(updates);
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
  const customerWaitingMessage = String(formData.get("customerWaitingMessage") ?? "").trim() || null;
  const customerVisible = formData.get("customerVisible") === "on";
  const surveysEnabled = formData.get("surveysEnabled") === "on";
  const estimatedDaysRaw = String(formData.get("estimatedDays") ?? "").trim();
  const estimatedDays = estimatedDaysRaw ? Number(estimatedDaysRaw) : null;

  if (!id || !name) {
    throw new Error("Aşama adı zorunludur.");
  }

  await prisma.journeyStage.update({
    where: { id },
    data: {
      name,
      description,
      customerDescription,
      customerWaitingMessage,
      customerVisible,
      surveysEnabled,
      estimatedDays,
    },
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

// Unlike a template stage, a JourneyStage can have real history (sent
// surveys) — `SurveyInstance.stageId` is required, so deleting a stage that
// already has one would leave it dangling. Refuse in that case ("Bu case'te
// gizle" is the safe way to remove a stage that's already been used) rather
// than silently cascading; any Documents scoped to the stage instead just
// lose that scoping (Document.stageId is optional) and become "genel".
export async function deleteJourneyStage(id: string, journeyId: string) {
  const surveyCount = await prisma.surveyInstance.count({ where: { stageId: id } });
  if (surveyCount > 0) {
    throw new Error(
      "Bu aşamaya bağlı anket(ler) olduğu için silinemez — bunun yerine \"Bu case'te gizle\" kullanabilirsin."
    );
  }

  await prisma.$transaction([
    prisma.document.updateMany({ where: { stageId: id }, data: { stageId: null } }),
    prisma.journeyStage.delete({ where: { id } }),
  ]);

  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/admin/journeys/${journeyId}/stages`);
}

// Saves every stage card on a case's "Aşamalar" tab in one call — same fix as
// the stage template editor's "Tüm Değişiklikleri Kaydet": editing several
// stages used to mean clicking "Kaydet" once per card.
export async function saveAllJourneyStages(journeyId: string, formData: FormData) {
  const count = Number(formData.get("stageCount") ?? 0);

  const updates = [];
  for (let i = 0; i < count; i++) {
    const id = String(formData.get(`stage_${i}_id`) ?? "").trim();
    if (!id) continue;

    const name = String(formData.get(`stage_${i}_name`) ?? "").trim();
    if (!name) {
      throw new Error(`Aşama ${i + 1}: adı zorunludur.`);
    }

    const estimatedDaysRaw = String(formData.get(`stage_${i}_estimatedDays`) ?? "").trim();

    updates.push(
      prisma.journeyStage.update({
        where: { id },
        data: {
          name,
          customerDescription: String(formData.get(`stage_${i}_customerDescription`) ?? "").trim() || null,
          customerWaitingMessage: String(formData.get(`stage_${i}_customerWaitingMessage`) ?? "").trim() || null,
          customerVisible: formData.get(`stage_${i}_customerVisible`) === "on",
          surveysEnabled: formData.get(`stage_${i}_surveysEnabled`) === "on",
          estimatedDays: estimatedDaysRaw ? Number(estimatedDaysRaw) : null,
        },
      })
    );
  }

  await prisma.$transaction(updates);
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

// Mirrors duplicateStageTemplate — same fixed "(kopya)" suffix rather than a
// counter, so duplicating the same template repeatedly just keeps stacking
// "(kopya) (kopya)"; nothing currently enforces unique template names (no
// DB constraint), this is purely so two templates never look identical in
// the list by accident.
export async function duplicateSurveyTemplate(id: string) {
  const source = await prisma.surveyTemplate.findUniqueOrThrow({
    where: { id },
    include: { items: { orderBy: { order: "asc" } } },
  });

  const copy = await prisma.surveyTemplate.create({ data: { name: `${source.name} (kopya)` } });

  await prisma.surveyTemplateItem.createMany({
    data: source.items.map((item) => ({
      surveyTemplateId: copy.id,
      text: item.text,
      type: item.type,
      options: item.options ?? Prisma.JsonNull,
      required: item.required,
      order: item.order,
      conditionOnOrder: item.conditionOnOrder,
      conditionValues: item.conditionValues ?? Prisma.JsonNull,
    })),
  });

  revalidatePath("/presales/admin/survey-templates");
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

  revalidatePath(`/presales/admin/journeys/${journeyId}/surveys`);
  redirect(`/presales/admin/journeys/${journeyId}/surveys`);
}

export async function sendSurveyInstance(surveyInstanceId: string, journeyId: string) {
  await prisma.surveyInstance.update({
    where: { id: surveyInstanceId },
    data: { status: "sent", sentAt: new Date() },
  });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
}

// Only draft surveys are editable — once sent, a customer may already be
// looking at (or have answered) the questions, so changing them afterward
// would silently invalidate their answers. Mirrors updateSurveyTemplate's
// delete-and-recreate approach; safe here too since a draft survey can't yet
// have any SurveyResponse rows (those only exist once a customer has seen it).
export async function updateSurveyInstance(surveyInstanceId: string, journeyId: string, formData: FormData) {
  const survey = await prisma.surveyInstance.findUniqueOrThrow({ where: { id: surveyInstanceId } });
  if (survey.status !== "draft") {
    throw new Error("Sadece taslak durumundaki anketler düzenlenebilir.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const questions = parseQuestionSlots(formData);

  if (!title || questions.length === 0) {
    throw new Error("Başlık ve en az bir soru zorunludur.");
  }

  await prisma.$transaction([
    prisma.surveyQuestionSelection.deleteMany({ where: { surveyInstanceId } }),
    prisma.surveyInstance.update({
      where: { id: surveyInstanceId },
      data: { title, selections: { create: questions } },
    }),
  ]);

  revalidatePath(`/presales/admin/journeys/${journeyId}/surveys`);
  redirect(`/presales/admin/journeys/${journeyId}/surveys`);
}

// Deletes a sent or completed survey — e.g. it was sent to the wrong stage,
// or the customer no longer needs to answer it. This also removes it from
// the customer's screen (it's just gone from `journey.surveyInstances`, same
// mechanism the customer page already filters on). If the survey had been
// answered, the auto-archived Excel snapshot in Drive (`survey_export`
// Document, created in j/[token]/actions.ts on completion) is deliberately
// left untouched — same "never touch Drive automatically" rule as
// deleteJourney — so the answers survive in Drive even after the DB rows
// (SurveyResponse/SurveyQuestionSelection/SurveyInstance) are gone.
export async function deleteSurveyInstance(surveyInstanceId: string, journeyId: string) {
  const survey = await prisma.surveyInstance.findUniqueOrThrow({
    where: { id: surveyInstanceId },
    include: { journey: { select: { accessToken: true } } },
  });

  await prisma.$transaction([
    prisma.surveyResponse.deleteMany({ where: { surveyQuestionSelection: { surveyInstanceId } } }),
    prisma.surveyQuestionSelection.deleteMany({ where: { surveyInstanceId } }),
    prisma.surveyInstance.delete({ where: { id: surveyInstanceId } }),
  ]);

  revalidatePath(`/presales/admin/journeys/${journeyId}/surveys`);
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath(`/presales/j/${survey.journey.accessToken}`);
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
  revalidatePath("/presales/admin/prospects/new");
}

export async function setSalesRepActive(id: string, isActive: boolean) {
  await prisma.salesRep.update({ where: { id }, data: { isActive } });
  revalidatePath("/presales/admin/sales-reps");
  revalidatePath("/presales/admin/prospects/new");
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
  revalidatePath("/presales/admin/prospects/new");
  revalidatePath("/presales/admin");
}

export async function deleteSalesRep(id: string) {
  // Journey.salesRepId -> SalesRep has ON DELETE SET NULL, so any case currently
  // assigned to this rep is simply left unassigned rather than blocking deletion.
  await prisma.salesRep.delete({ where: { id } });
  revalidatePath("/presales/admin/sales-reps");
  revalidatePath("/presales/admin/prospects/new");
}

// --- Technical leads (mirrors sales reps exactly — see TechnicalLead in
// schema.prisma for why this is a separate, customer-invisible role) ---

export async function createTechnicalLead(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email) {
    throw new Error("Ad ve e-posta zorunludur.");
  }

  await prisma.technicalLead.create({ data: { name, email, phone, title } });
  revalidatePath("/presales/admin/technical-leads");
  revalidatePath("/presales/admin/prospects/new");
}

export async function setTechnicalLeadActive(id: string, isActive: boolean) {
  await prisma.technicalLead.update({ where: { id }, data: { isActive } });
  revalidatePath("/presales/admin/technical-leads");
  revalidatePath("/presales/admin/prospects/new");
}

export async function updateTechnicalLead(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;

  if (!name || !email) {
    throw new Error("Ad ve e-posta zorunludur.");
  }

  await prisma.technicalLead.update({ where: { id }, data: { name, email, phone, title } });
  revalidatePath("/presales/admin/technical-leads");
  revalidatePath("/presales/admin/prospects/new");
  revalidatePath("/presales/admin");
}

export async function deleteTechnicalLead(id: string) {
  // Journey.technicalLeadId -> TechnicalLead has ON DELETE SET NULL, same as
  // deleteSalesRep — any case currently assigned is simply left unassigned.
  await prisma.technicalLead.delete({ where: { id } });
  revalidatePath("/presales/admin/technical-leads");
  revalidatePath("/presales/admin/prospects/new");
}

export async function assignTechnicalLead(journeyId: string, formData: FormData) {
  const technicalLeadId = String(formData.get("technicalLeadId") ?? "").trim() || null;
  await prisma.journey.update({ where: { id: journeyId }, data: { technicalLeadId } });
  revalidatePath(`/presales/admin/journeys/${journeyId}`);
  revalidatePath("/presales/admin");
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
  revalidatePath("/presales/admin/prospects/new");
}

export async function setProductActive(id: string, isActive: boolean) {
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/presales/admin/products");
  revalidatePath("/presales/admin/prospects/new");
}

export async function deleteProduct(id: string) {
  // Journey.productId -> Product has ON DELETE SET NULL, so any case currently
  // assigned to this product is simply left unassigned rather than blocking
  // deletion — mirrors deleteSalesRep.
  await prisma.product.delete({ where: { id } });
  revalidatePath("/presales/admin/products");
  revalidatePath("/presales/admin/prospects/new");
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

// Company logo — belongs to the Prospect (the company), not the journey, but
// is uploaded from a journey's Ayarlar tab since that's the only place an
// admin is looking at one specific company at a time.
export async function uploadCompanyLogo(journeyId: string, formData: FormData) {
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    throw new Error("Bir logo dosyası seçmelisin.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Dosya çok büyük (maksimum ${MAX_UPLOAD_LABEL}).`);
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Logo bir resim dosyası olmalı (PNG, JPG, SVG vb.).");
  }

  const journey = await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } });

  const { driveFileId, thumbnailUrl } = await uploadLogoToDrive({ file, fileName: file.name });

  await prisma.prospect.update({
    where: { id: journey.prospectId },
    data: { logoDriveFileId: driveFileId, logoUrl: thumbnailUrl },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}/settings`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

export async function removeCompanyLogo(journeyId: string) {
  const journey = await prisma.journey.findUniqueOrThrow({
    where: { id: journeyId },
    include: { prospect: true },
  });

  if (journey.prospect.logoDriveFileId) {
    await trashDriveFile(journey.prospect.logoDriveFileId);
  }

  await prisma.prospect.update({
    where: { id: journey.prospectId },
    data: { logoDriveFileId: null, logoUrl: null },
  });

  revalidatePath(`/presales/admin/journeys/${journeyId}/settings`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

// Different logos crop differently against the fixed-height logo box on the
// customer page depending on their own aspect ratio/whitespace — this lets
// an admin nudge the visible portion left/center/right per company instead
// of every logo being forced to the same fixed position.
export async function setProspectLogoAlign(journeyId: string, formData: FormData) {
  const logoAlign = String(formData.get("logoAlign") ?? "left").trim();
  if (!["left", "center", "right"].includes(logoAlign)) {
    throw new Error("Geçersiz hizalama.");
  }

  const journey = await prisma.journey.findUniqueOrThrow({ where: { id: journeyId } });
  await prisma.prospect.update({ where: { id: journey.prospectId }, data: { logoAlign } });

  revalidatePath(`/presales/admin/journeys/${journeyId}/settings`);
  revalidatePath(`/presales/j/${journey.accessToken}`);
}

// --- Admin login (shared Basic-Auth credentials, editable from the panel) ---

// Password is optional here — left blank, the existing one (hashed, never
// read back out) stays unchanged, so changing just the username doesn't
// force a password reset too. Whatever is typed gets hashed before it ever
// touches the database.
export async function updateAdminCredentials(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!username) {
    throw new Error("Kullanıcı adı zorunludur.");
  }

  const existing = await prisma.adminCredential.findFirst();

  if (existing) {
    await prisma.adminCredential.update({
      where: { id: existing.id },
      data: { username, ...(password ? { password: await hashPassword(password) } : {}) },
    });
  } else {
    if (!password) {
      throw new Error("İlk kayıtta şifre zorunludur.");
    }
    await prisma.adminCredential.create({ data: { username, password: await hashPassword(password) } });
  }

  revalidatePath("/presales/admin/account");
}
