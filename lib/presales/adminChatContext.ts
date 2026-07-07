import { prisma } from "@/lib/presales/db";

const MAX_JOURNEYS = 150;
const MAX_ANSWER_CHARS = 400;

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
          selections: { include: { response: true }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "asc" },
      },
      documents: true,
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
      lines.push(`  - ${stage.name}: durum=${stage.status}${stage.isActive ? "" : " (bu case'te gizli)"}`);
    }

    for (const survey of journey.surveyInstances) {
      lines.push(`Anket "${survey.title}" (aşama: ${survey.stage.name}, durum: ${survey.status}):`);
      for (const sel of survey.selections) {
        const raw = sel.response?.answerText ?? (sel.response?.answerJson ? JSON.stringify(sel.response.answerJson) : null);
        const answer = raw ? raw.slice(0, MAX_ANSWER_CHARS) : null;
        lines.push(`  - Soru: ${sel.text}`);
        lines.push(`    Cevap: ${answer ?? "(henüz cevaplanmadı)"}`);
      }
    }

    if (journey.documents.length > 0) {
      lines.push("Yüklenen belgeler:");
      for (const doc of journey.documents) {
        lines.push(`  - [${doc.type}] ${doc.title}`);
      }
    }

    return lines.join("\n");
  });

  return blocks.join("\n\n");
}
