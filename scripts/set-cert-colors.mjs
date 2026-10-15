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

const colorMap = {
  "certGroup-ibm":       "blue",
  "certGroup-aws":       "orange",
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
