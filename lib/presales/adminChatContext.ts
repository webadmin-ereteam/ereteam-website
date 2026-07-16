import { prisma } from "@/lib/presales/db";
import { Prisma } from "@/lib/generated/prisma/client";

const MAX_JOURNEYS = 150;
const MAX_ANSWER_CHARS = 400;

type SelectionWithResponse = Prisma.SurveyQuestionSelectionGetPayload<{
  include: { response: { include: { document: true } } };
}>;

// `SurveyResponse.answerText` holds the raw Google Drive file id for a
// file_upload answer (that's what the customer-facing submit flow writes) —
// showing that id to the assistant is meaningless. The uploaded file's real
// title lives on the linked `Document` row instead (joined via
// `SurveyResponse.document`), so that's what a file_upload question
// resolves to here.
function formatAnswer(sel: SelectionWithResponse): string {
  if (!sel.response) return "(henüz cevaplanmadı)";

  if (sel.type === "file_upload") {
    return sel.response.document ? `Dosya yüklendi: ${sel.response.document.title}` : "(dosya kaydı bulunamadı)";
  }

  if (sel.type === "multi_choice" && Array.isArray(sel.response.answerJson)) {
    return (sel.response.answerJson as unknown[]).map(String).join(", ") || "(henüz cevaplanmadı)";
  }

  const raw = sel.response.answerText ?? (sel.response.answerJson ? JSON.stringify(sel.response.answerJson) : null);
  return raw ? raw.slice(0, MAX_ANSWER_CHARS) : "(henüz cevaplanmadı)";
}

export async function buildAdminChatContext(): Promise<string> {
  const journeys = await prisma.journey.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_JOURNEYS,
    include: {
      prospect: true,
      salesRep: true,
      product: true,
      stages: { orderBy: { order: "asc" } },
      surveyInstances: {
        include: {
          stage: true,
          selections: { include: { response: { include: { document: true } } }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
      documents: { include: { stage: true } },
    },
  });

  if (journeys.length === 0) {
    return "Veritabanında henüz hiç prospect/journey kaydı yok.";
  }

  const blocks = journeys.map((journey) => {
    const lines: string[] = [];
    lines.push(`### Firma: ${journey.prospect.companyName} (journeyId: ${journey.id})`);
    lines.push(
      `İletişim kişisi: ${journey.prospect.contactName} <${journey.prospect.contactEmail}>${
        journey.prospect.contactPhone ? ", tel: " + journey.prospect.contactPhone : ""
      }`
    );
    lines.push(`Journey durumu: ${journey.status}${journey.outcomeReason ? " — sebep: " + journey.outcomeReason : ""}`);
    if (journey.salesRep) lines.push(`Satışçı: ${journey.salesRep.name} (${journey.salesRep.email})`);
    if (journey.product) lines.push(`Ürün/Uzmanlık: ${journey.product.name}`);
    lines.push(`Teklif talep edildi mi: ${journey.proposalRequested ? "evet" : "hayır"}`);
    lines.push(`Oluşturulma tarihi: ${journey.createdAt.toISOString().slice(0, 10)}`);

    lines.push("Aşamalar:");
    for (const stage of journey.stages) {
      lines.push(
        `  - ${stage.name}: durum=${stage.status}${stage.isActive ? "" : " (bu case'te gizli)"}${
          stage.notes ? ` — not: ${stage.notes}` : ""
        }`
      );
    }

    for (const survey of journey.surveyInstances) {
      lines.push(`Anket "${survey.title}" (aşama: ${survey.stage.name}, durum: ${survey.status}):`);
      for (const sel of survey.selections) {
        lines.push(`  - Soru: ${sel.text}`);
        lines.push(`    Cevap: ${formatAnswer(sel)}`);
      }
    }

    if (journey.documents.length > 0) {
      lines.push("Yüklenen belgeler:");
      for (const doc of journey.documents) {
        // Multiple documents can share the exact same auto-generated title
        // (e.g. two completed surveys both named "İlk Anket Soruları" each
        // export a "İlk-Anket-Soruları-cevaplari.xlsx") — the stage name is
        // what actually tells them apart.
        const stageSuffix = doc.stage ? ` (aşama: ${doc.stage.name})` : "";
        const noteSuffix = doc.notes ? ` — not: ${doc.notes}` : "";
        lines.push(`  - [${doc.type}] ${doc.title}${stageSuffix}${noteSuffix}`);
      }
    }

    return lines.join("\n");
  });

  return blocks.join("\n\n");
}
