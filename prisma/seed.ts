import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateAccessToken } from "../lib/presales/tokens";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const stages = [
  {
    key: "initial_survey",
    name: "İlk Anket",
    description: "Müşterinin olumlu dönüşü sonrası ilk anket gönderilir.",
    customerDescription: "Sizi ve ihtiyaçlarınızı daha iyi tanımak için birkaç kısa soru hazırladık.",
    customerVisible: true,
    estimatedDays: 2,
    order: 1,
  },
  {
    key: "first_meeting",
    name: "İlk Toplantı",
    description: "Şirket sunumu, FP&A sunumu ve PA kısa demosu.",
    customerDescription: "Ekibimizle tanışacak, şirketimizi ve çözümlerimizi kısa bir demo eşliğinde konuşacağız.",
    customerVisible: true,
    surveysEnabled: false,
    estimatedDays: 3,
    order: 2,
  },
  {
    key: "technical_demo_questions",
    name: "Teknik Demo Soruları",
    description: "Detaylı demo için soru listesinin gönderilmesi.",
    customerDescription: "Size özel bir teknik demo hazırlayabilmemiz için birkaç detaya ihtiyacımız var.",
    customerVisible: true,
    estimatedDays: 5,
    order: 3,
  },
  {
    key: "scoping_questions",
    name: "Kapsam Soruları",
    description: "Kapsam çıkarmak için soru listesinin gönderilmesi.",
    customerDescription: "Projenin kapsamını netleştirmek için birkaç soru daha.",
    customerVisible: true,
    estimatedDays: 4,
    order: 4,
  },
  {
    key: "proposal_shared",
    name: "Teklifin Paylaşılması",
    description: "Teklifin müşteriyle paylaşılması.",
    customerDescription: "Hazırladığımız teklifi burada paylaşacağız.",
    customerVisible: true,
    surveysEnabled: false,
    estimatedDays: 3,
    order: 5,
  },
  {
    key: "archived",
    name: "Arşivleme",
    description: "Tüm bilgi/belgelerin presales sistemine yüklenmesi.",
    customerDescription: null,
    customerVisible: false,
    order: 6,
  },
];

// Standalone, named survey templates — not tied to a stage; the name conveys
// what they're for. Loaded as an optional starting point when building a
// survey for a case.
const surveyTemplates = [
  {
    name: "İlk Anket Soruları",
    questions: [
      { text: "Şirketinizin bulunduğu sektör nedir?", type: "short_text" },
      { text: "Halihazırda kullandığınız finans/raporlama araçları neler?", type: "long_text" },
      { text: "Bu görüşmeyi talep etme sebebiniz nedir?", type: "long_text" },
    ],
  },
  {
    name: "Teknik Demo Soruları",
    questions: [
      { text: "Veri kaynaklarınız (ERP, veritabanı vb.) nelerdir?", type: "long_text" },
      { text: "Kaç kullanıcı bu sistemi aktif olarak kullanacak?", type: "short_text" },
      { text: "Mevcut altyapınız bulut mu, on-premise mi?", type: "single_choice", options: ["Bulut", "On-premise", "Hibrit"] },
    ],
  },
  {
    name: "Kapsam Soruları",
    questions: [
      { text: "Öncelikli olarak hangi raporlar/analizler ihtiyacınız?", type: "long_text" },
      { text: "Hedeflenen proje başlangıç/bitiş tarihleri nedir?", type: "short_text" },
      { text: "Bütçe aralığınız nedir?", type: "short_text" },
    ],
  },
];

async function main() {
  const stageRecords: Record<string, string> = {};

  let defaultTemplate = await prisma.stageTemplate.findFirst({ where: { name: "Varsayılan" } });
  if (!defaultTemplate) {
    defaultTemplate = await prisma.stageTemplate.create({ data: { name: "Varsayılan" } });
  }
  const stageTemplateId = defaultTemplate.id;

  for (const stage of stages) {
    const record = await prisma.stageDefinition.upsert({
      where: { stageTemplateId_key: { stageTemplateId, key: stage.key } },
      update: {
        name: stage.name,
        description: stage.description,
        customerDescription: stage.customerDescription,
        customerVisible: stage.customerVisible,
        surveysEnabled: stage.surveysEnabled ?? true,
        estimatedDays: stage.estimatedDays ?? null,
        order: stage.order,
      },
      create: {
        stageTemplateId,
        key: stage.key,
        name: stage.name,
        description: stage.description,
        customerDescription: stage.customerDescription,
        customerVisible: stage.customerVisible,
        surveysEnabled: stage.surveysEnabled ?? true,
        estimatedDays: stage.estimatedDays ?? null,
        order: stage.order,
      },
    });
    stageRecords[stage.key] = record.id;
  }

  for (const template of surveyTemplates) {
    const existing = await prisma.surveyTemplate.findFirst({ where: { name: template.name } });
    if (!existing) {
      await prisma.surveyTemplate.create({
        data: {
          name: template.name,
          items: {
            create: template.questions.map((q, index) => ({
              text: q.text,
              type: q.type,
              options: q.options ?? undefined,
              order: index,
            })),
          },
        },
      });
    }
  }

  let demoSalesRep = await prisma.salesRep.findFirst({ where: { email: "sales@ereteam.com" } });
  if (!demoSalesRep) {
    demoSalesRep = await prisma.salesRep.create({
      data: {
        name: "Mehmet Satışçı",
        email: "sales@ereteam.com",
        phone: "+90 555 000 00 00",
        title: "Account Executive",
      },
    });
  }

  let demoProspect = await prisma.prospect.findFirst({
    where: { contactEmail: "demo@example.com" },
  });

  if (!demoProspect) {
    demoProspect = await prisma.prospect.create({
      data: {
        companyName: "Demo A.Ş.",
        contactName: "Ayşe Demo",
        contactEmail: "demo@example.com",
      },
    });
  }

  const existingJourney = await prisma.journey.findFirst({
    where: { prospectId: demoProspect.id },
  });

  if (!existingJourney) {
    const activeStageDefs = await prisma.stageDefinition.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const journeyCreatedAt = new Date();
    const journeyDateLabel = journeyCreatedAt.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const journey = await prisma.journey.create({
      data: {
        prospectId: demoProspect.id,
        accessToken: generateAccessToken(),
        salesRepId: demoSalesRep.id,
        name: `${demoProspect.companyName} - Ürün atanmadı - ${journeyDateLabel}`,
        createdAt: journeyCreatedAt,
      },
    });

    const journeyStages = [];
    for (const def of activeStageDefs) {
      const journeyStage = await prisma.journeyStage.create({
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
          status: def.key === "initial_survey" ? "active" : "pending",
        },
      });
      journeyStages.push(journeyStage);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
