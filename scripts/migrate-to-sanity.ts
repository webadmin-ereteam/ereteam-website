/**
 * Migration Script — Existing data → Sanity
 *
 * Çalıştırmak için:
 *   1. sanity.io/manage → API → Tokens → "Editor" izinli token oluştur
 *   2. Aşağıya token'ı yaz
 *   3. Terminal: npx ts-node --esm scripts/migrate-to-sanity.ts
 *
 * NOT: Bu script idempotent'tir — ikinci çalıştırmada yeni doküman oluşturmaz,
 *       mevcut olanları günceller.
 */

import { createClient } from "@sanity/client";
import { useCases } from "../lib/data/usecases";

const SANITY_TOKEN = "skEDqZV4mUe6k2wleb9dFLCRlZ8kgcGpUAxs3gNewQUFRo03xvelPKah3oQULct72Ac6ZNcS9KmRPcMBe7wbznckPN5vlW3KmVqEW8hauNwDi0zTdZqXmnCqnzqw4OgqmexVA81hkHUB5HZQO6XFmRhklYwxXyArH30PbDN3bMNsLpw7nnjN";

const client = createClient({
  projectId: "oe7hnrwl",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: SANITY_TOKEN,
  useCdn: false,
});

// ─── Team Members ─────────────────────────────────────────────────────────────
const teamMembers = [
  { name: "Kutlay Erdal Şimşek", title: "CEO & Founder", order: 1 },
  { name: "Burak Tansug", title: "Technology Services & Operations", region: "US", order: 2 },
  { name: "Murat Destegül", title: "Technology Services & Operations", region: "TR", order: 3 },
  { name: "Abdulkadir Kesimli", title: "Product & R&D", order: 4 },
  { name: "Kerem Arıtürk", title: "Revenue & Growth", order: 5 },
  { name: "Berrin Şimşek", title: "Finance & People", order: 6 },
];

// ─── Partners ─────────────────────────────────────────────────────────────────
const partners = [
  {
    name: "IBM",
    description: "Over 20 years of deep IBM ecosystem expertise. Certified in Planning Analytics (TM1), Cognos Analytics, InfoSphere DataStage, IBM CDC, and watsonx. EMEA watsonx Agentic AI Academy participant.",
    areas: ["Financial Performance Management", "Data Integration", "AI & ML", "Business Intelligence"],
    useCases: ["ING Bank full FP&A platform", "Akbank ARGUS reporting", "Ziraat Enterprise AI"],
    order: 1,
  },
  {
    name: "AWS",
    description: "Cloud migrations, data lake architecture, DataOps, and AI deployment on AWS. Active on projects for US pharma, insurance, and biotech clients.",
    areas: ["Cloud Migration", "Data Lake & Lakehouse", "DataOps", "AI Deployment"],
    useCases: ["Haleon Secondary Sales Platform", "Roche Data Stack Modernization", "Charter Communications"],
    order: 2,
  },
  {
    name: "HCL Software",
    description: "Authorized partner for the full HCL Unica suite and HCL Discover. Implementing omnichannel campaign management, marketing operations, and digital analytics for banking, insurance, and telecom.",
    areas: ["Campaign Management", "Marketing Operations", "Digital Analytics", "Customer Experience"],
    useCases: ["VakıfBank omnichannel campaigns", "Fibabanka campaign management", "Turkish Airlines marketing ops"],
    order: 3,
  },
  {
    name: "Databricks",
    description: "Lakehouse architecture, MLflow, Delta Lake, and collaborative data engineering on the Databricks platform.",
    areas: ["Lakehouse Architecture", "MLflow & MLOps", "Delta Lake", "Data Engineering"],
    useCases: [],
    order: 4,
  },
  {
    name: "Alteryx",
    description: "Data blending, predictive analytics, and automated ETL workflows. Deployed for global pharma and telecom clients.",
    areas: ["Data Blending", "Predictive Analytics", "Automated ETL", "Self-Service Analytics"],
    useCases: ["Roche — 50+ warehouses automated", "Charter Communications reporting"],
    order: 5,
  },
  {
    name: "Tableau",
    description: "Executive dashboards, self-service analytics, and Tableau Server deployments for enterprise clients across banking, pharma, retail, and telecom.",
    areas: ["Executive Dashboards", "Self-Service Analytics", "Tableau Server", "Data Visualization"],
    useCases: ["Vodafone 685-user deployment", "Pepsi executive dashboard", "Halkbank BI platform"],
    order: 6,
  },
  {
    name: "DataRobot",
    description: "Enterprise AutoML, MLOps, and AI platform deployments. Proven ROI on industrial and banking AI use cases.",
    areas: ["AutoML", "MLOps", "Enterprise AI", "Predictive Modeling"],
    useCases: ["OYAK Cement — $39M savings, 2% CO₂ reduction", "Ziraat Bank Enterprise AI Platform"],
    order: 7,
  },
  {
    name: "Snowflake",
    description: "Cloud data platform for scalable analytics, data sharing, and modern data engineering.",
    areas: ["Cloud Data Warehouse", "Data Sharing", "Data Engineering", "Analytics"],
    useCases: [],
    order: 8,
  },
  {
    name: "Apparo",
    description: "Fast Edit and data entry solutions integrated with IBM Planning Analytics and Cognos for streamlined financial data management.",
    areas: ["Data Entry & Writeback", "IBM PA Integration", "Financial Data Management"],
    useCases: ["Akbank ARGUS target management", "Roche data management"],
    order: 9,
  },
  {
    name: "Theobald Software",
    description: "SAP data extraction and integration, connecting SAP systems with analytics platforms like IBM Planning Analytics and Tableau.",
    areas: ["SAP Integration", "Data Extraction", "ERP Connectivity"],
    useCases: ["Enerjisa SAP integration", "Zorlu Holding energy analytics"],
    order: 10,
  },
];

// ─── Certification Groups ──────────────────────────────────────────────────────
const certGroups = [
  {
    vendor: "IBM",
    description: "Over 25 years of deep IBM ecosystem expertise across Planning Analytics, Cognos, DataStage, and watsonx.",
    certifications: [
      { name: "IBM Planning Analytics (TM1) — Expert", level: "Expert", color: "bg-blue-700" },
      { name: "IBM Cognos Analytics — Expert", level: "Expert", color: "bg-blue-700" },
      { name: "IBM Cognos Controller — Expert", level: "Expert", color: "bg-blue-700" },
      { name: "IBM InfoSphere DataStage — Advanced", level: "Advanced", color: "bg-blue-500" },
      { name: "IBM Cloud Pak for Data — Certified", level: "Certified", color: "bg-blue-400" },
      { name: "IBM Watson — Practitioner", level: "Practitioner", color: "bg-blue-300" },
    ],
    order: 1,
  },
  {
    vendor: "AWS",
    description: "Certified expertise in designing and delivering analytics, data lake, and AI solutions on Amazon Web Services.",
    certifications: [
      { name: "AWS Certified Solutions Architect — Associate", level: "Associate", color: "bg-orange-500" },
      { name: "AWS Certified Data Analytics — Specialty", level: "Specialty", color: "bg-orange-600" },
      { name: "AWS Certified Machine Learning — Specialty", level: "Specialty", color: "bg-orange-600" },
      { name: "AWS Certified Developer — Associate", level: "Associate", color: "bg-orange-500" },
    ],
    order: 2,
  },
  {
    vendor: "HCL Software",
    description: "Authorized partner for the full HCL Unica marketing suite.",
    certifications: [
      { name: "HCL Unica Campaign — Expert", level: "Expert", color: "bg-red-700" },
      { name: "HCL Unica Interact — Advanced", level: "Advanced", color: "bg-red-600" },
      { name: "HCL Discover — Certified", level: "Certified", color: "bg-red-500" },
    ],
    order: 3,
  },
  {
    vendor: "Alteryx",
    description: "Designer Core and Advanced certifications for data blending and analytics automation.",
    certifications: [
      { name: "Alteryx Designer Core — Certified", level: "Certified", color: "bg-blue-600" },
      { name: "Alteryx Designer Advanced — Certified", level: "Certified", color: "bg-blue-700" },
      { name: "Alteryx Server — Partner", level: "Partner", color: "bg-blue-500" },
    ],
    order: 4,
  },
  {
    vendor: "Tableau",
    description: "Professional-level Tableau Desktop and Server certifications across our team.",
    certifications: [
      { name: "Tableau Desktop Certified Professional", level: "Professional", color: "bg-sky-600" },
      { name: "Tableau Server Certified Associate", level: "Associate", color: "bg-sky-500" },
      { name: "Tableau Prep Builder — Certified", level: "Certified", color: "bg-sky-400" },
      { name: "Tableau CRM & Einstein Analytics", level: "Practitioner", color: "bg-sky-300" },
    ],
    order: 5,
  },
  {
    vendor: "DataRobot",
    description: "Certified in the DataRobot AI platform, enabling automated machine learning and MLOps deployments.",
    certifications: [
      { name: "DataRobot Automated ML — Expert", level: "Expert", color: "bg-violet-600" },
      { name: "DataRobot MLOps — Practitioner", level: "Practitioner", color: "bg-violet-500" },
      { name: "DataRobot AI Platform", level: "Certified", color: "bg-violet-400" },
    ],
    order: 6,
  },
];

// ─── Migration Functions ───────────────────────────────────────────────────────

async function upsert(doc: Record<string, unknown>) {
  return client.createOrReplace(doc);
}

async function migrateSuccessStories() {
  console.log(`\n📦 Migrating ${useCases.length} success stories...`);
  for (let i = 0; i < useCases.length; i++) {
    const uc = useCases[i];
    await upsert({
      _type: "successStory",
      _id: `successStory-${uc.id}`,
      client: uc.client,
      domain: uc.domain,
      industry: uc.industry,
      project: uc.project,
      technologies: uc.technologies,
      summary: uc.summary,
      results: uc.results,
      order: i + 1,
    });
    process.stdout.write(`  ✓ ${uc.client} — ${uc.project.substring(0, 40)}...\n`);
  }
  console.log("✅ Success stories done.");
}

async function migrateTeamMembers() {
  console.log(`\n👥 Migrating ${teamMembers.length} team members...`);
  for (const member of teamMembers) {
    await upsert({
      _type: "teamMember",
      _id: `teamMember-${member.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
      name: member.name,
      title: member.title,
      region: (member as { region?: string }).region,
      order: member.order,
    });
    console.log(`  ✓ ${member.name}`);
  }
  console.log("✅ Team members done.");
}

async function migratePartners() {
  console.log(`\n🤝 Migrating ${partners.length} partners...`);
  for (const partner of partners) {
    await upsert({
      _type: "partner",
      _id: `partner-${partner.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
      name: partner.name,
      description: partner.description,
      areas: partner.areas,
      useCases: partner.useCases,
      order: partner.order,
    });
    console.log(`  ✓ ${partner.name}`);
  }
  console.log("✅ Partners done. (Logos must be uploaded manually in Sanity Studio)");
}

async function migrateCertifications() {
  console.log(`\n🏅 Migrating ${certGroups.length} certification groups...`);
  for (const group of certGroups) {
    await upsert({
      _type: "certificationGroup",
      _id: `certGroup-${group.vendor.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
      vendor: group.vendor,
      description: group.description,
      certifications: group.certifications,
      order: group.order,
    });
    console.log(`  ✓ ${group.vendor} (${group.certifications.length} certs)`);
  }
  console.log("✅ Certifications done.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SANITY_TOKEN) {
    console.error("❌ Hata: Önce token'ı girin!");
    console.error("   sanity.io/manage → API → Tokens → Editor izinli token oluştur");
    process.exit(1);
  }

  console.log("🚀 Sanity migration başlıyor...");
  console.log(`   Project: oe7hnrwl | Dataset: production`);

  try {
    await migrateSuccessStories();
    await migrateTeamMembers();
    await migratePartners();
    await migrateCertifications();

    console.log("\n🎉 Migration tamamlandı!");
    console.log("   Sanity Studio'ya gidip içerikleri kontrol et:");
    console.log("   https://ereteam.sanity.studio");
    console.log("\n   ⚠️  NOT: Partner logoları Studio'dan manuel yüklenmelidir.");
  } catch (err) {
    console.error("❌ Migration hatası:", err);
    process.exit(1);
  }
}

main();
