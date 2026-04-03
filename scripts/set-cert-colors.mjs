import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "oe7hnrwl",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: "skEDqZV4mUe6k2wleb9dFLCRlZ8kgcGpUAxs3gNewQUFRo03xvelPKah3oQULct72Ac6ZNcS9KmRPcMBe7wbznckPN5vlW3KmVqEW8hauNwDi0zTdZqXmnCqnzqw4OgqmexVA81hkHUB5HZQO6XFmRhklYwxXyArH30PbDN3bMNsLpw7nnjN",
  useCdn: false,
});

const colorMap = {
  "certGroup-ibm":       "blue",
  "certGroup-aws":       "orange",
  "certGroup-hcl":       "red",
  "certGroup-alteryx":   "sky",
  "certGroup-tableau":   "cyan",
  "certGroup-datarobot": "violet",
};

async function run() {
  for (const [id, colorTheme] of Object.entries(colorMap)) {
    await client.patch(id).set({ colorTheme }).commit();
    console.log(`  ✓ ${id} → ${colorTheme}`);
  }
  console.log("\n✅ Renk temaları atandı.");
}

run().catch((err) => { console.error("❌ Hata:", err.message); process.exit(1); });
