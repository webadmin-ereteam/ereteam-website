import { unstable_cache } from "next/cache";
import { company, contact, industries, notableClients, services, products, pages } from "./siteData";
import { getAllSuccessStories, getAllActiveJobPostings, getAllPartners } from "./sanity/queries";

export const CHAT_CACHE_TAG = "chat-context";

async function buildChatContext(): Promise<string> {
  // Fetch Sanity data in parallel
  const [stories, jobs, partners] = await Promise.all([
    getAllSuccessStories().catch(() => []),
    getAllActiveJobPostings().catch(() => []),
    getAllPartners().catch(() => []),
  ]);

  const successStoriesSection = stories.length > 0
    ? `\nSUCCESS STORIES / USE CASES:\n${stories
        .slice(0, 10)
        .map((s) => `- [${s.industry}] ${s.project}${s.results ? ` → ${s.results}` : ""}${s.technologies?.length ? ` (${s.technologies.join(", ")})` : ""}`)
        .join("\n")}`
    : "";

  const jobsSection = jobs.length > 0
    ? `\nOPEN POSITIONS (${jobs.length} active):\n${jobs
        .map((j) => `- ${j.title} — ${j.department}${j.location ? `, ${j.location}` : ""}`)
        .join("\n")}`
    : "\nOPEN POSITIONS: No active postings at the moment. Visit /about/careers for updates.";

  const partnersSection = partners.length > 0
    ? `\nTECHNOLOGY PARTNERS: ${partners.map((p) => p.name).join(", ")}`
    : "";

  return `You are Ereteam's website assistant. Answer questions about Ereteam professionally and concisely. Always respond in the same language the user writes in — Turkish or English.

ABOUT ERETEAM:
Ereteam is an enterprise data & analytics consultancy founded in ${company.founded}, with ${company.yearsOfExpertise} years of expertise.
- HQ: ${company.hq} | Operations: ${company.operations}
- Global presence: ${company.countries} countries | ${company.enterpriseClients} enterprise clients | ${company.projects} projects | ${company.professionals} experts

INDUSTRIES: ${industries.join(", ")}

SERVICES:
${services.map((s, i) => `${i + 1}. ${s.title} — ${s.capabilities.join(", ")} (${s.technologies.join(", ")})`).join("\n")}

PRODUCTS:
${products.map((p) => `- ${p.name} (${p.tagline}): ${p.description}`).join("\n")}

NOTABLE CLIENTS: ${notableClients.join(", ")}

CONTACT: ${contact.email} | US: ${contact.us.phone} | TR: ${contact.tr.phone}
US Address: ${contact.us.address}
TR Address: ${contact.tr.address}
${successStoriesSection}
${jobsSection}
${partnersSection}

SITE PAGES (always link to relevant pages using markdown format [Page Name](url)):
${pages.map((p) => `- ${p.label}: ${p.path}`).join("\n")}

RULES:
- Be concise.
- Always include a relevant page link at the end of your answer using markdown: [See more →](/page-path)
- For pricing, direct to [Contact Us](/contact).
- Don't invent facts.`;
}

export const getChatContext = unstable_cache(
  buildChatContext,
  ["chat-context"],
  { tags: [CHAT_CACHE_TAG], revalidate: 3600 }
);
