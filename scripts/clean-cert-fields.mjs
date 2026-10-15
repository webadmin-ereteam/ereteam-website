import { createClient } from "@sanity/client";

const token = process.env.SANITY_API_WRITE_TOKEN;
if (!token) throw new Error("SANITY_API_WRITE_TOKEN is required.");

const client = createClient({
  projectId: "oe7hnrwl",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function run() {
  const groups = await client.fetch(`*[_type == "certificationGroup"]{ _id, certifications }`);
  console.log(`${groups.length} certificationGroup bulundu.`);

  for (const group of groups) {
    if (!group.certifications?.length) continue;

    const cleaned = group.certifications.map((cert) => Object.fromEntries(
      Object.entries(cert).filter(([key]) => key !== "level" && key !== "color"),
    ));

    await client.patch(group._id).set({ certifications: cleaned }).commit();
    console.log(`  ✓ ${group._id} güncellendi`);
  }

  console.log("\n✅ color ve level alanları temizlendi.");
}

run().catch((err) => { console.error("❌ Hata:", err.message); process.exit(1); });
