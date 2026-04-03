import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "oe7hnrwl",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "skEDqZV4mUe6k2wleb9dFLCRlZ8kgcGpUAxs3gNewQUFRo03xvelPKah3oQULct72Ac6ZNcS9KmRPcMBe7wbznckPN5vlW3KmVqEW8hauNwDi0zTdZqXmnCqnzqw4OgqmexVA81hkHUB5HZQO6XFmRhklYwxXyArH30PbDN3bMNsLpw7nnjN",
  useCdn: false,
});

async function run() {
  const groups = await client.fetch(`*[_type == "certificationGroup"]{ _id, certifications }`);
  console.log(`${groups.length} certificationGroup bulundu.`);

  for (const group of groups) {
    if (!group.certifications?.length) continue;

    const cleaned = group.certifications.map((cert) => {
      const { level, color, ...rest } = cert;
      return rest;
    });

    await client.patch(group._id).set({ certifications: cleaned }).commit();
    console.log(`  ✓ ${group._id} güncellendi`);
  }

  console.log("\n✅ color ve level alanları temizlendi.");
}

run().catch((err) => { console.error("❌ Hata:", err.message); process.exit(1); });
