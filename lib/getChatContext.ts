import { unstable_cache } from "next/cache";
import { company, contact, industries, notableClients, services, products, pages } from "./siteData";
import { getAllSuccessStories, getAllActiveJobPostings, getAllPartners, getPartnersBoard } from "./sanity/queries";
import { getLinkedInPosts } from "./linkedin";

export const CHAT_CACHE_TAG = "chat-context";

async function buildChatContext(): Promise<string> {
  // Fetch Sanity data in parallel
  const [stories, jobs, partners, partnersBoard, linkedInPosts] = await Promise.all([
    getAllSuccessStories().catch(() => []),
    getAllActiveJobPostings().catch(() => []),
    getAllPartners().catch(() => []),
    getPartnersBoard().catch(() => []),
    getLinkedInPosts().catch(() => []),
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

  const partnersBoardSection = partnersBoard.length > 0
    ? `\nPARTNERS BOARD: ${partnersBoard.map((partner) => `${partner.name} (${partner.title})`).join(", ")}`
    : "";

  const linkedInSection = linkedInPosts.length > 0
    ? `\nRECENT LINKEDIN UPDATES (use these as current Ereteam sources and link users to the matching full post on the website):\n${linkedInPosts
        .slice(0, 8)
        .map((post) => {
          const excerpt = post.text.length > 900 ? `${post.text.slice(0, 900).trim()}…` : post.text;
          const internalUrl = `/social-media?post=${encodeURIComponent(post.id)}`;
          return `- ${post.publishedAt.slice(0, 10)}${post.articleTitle ? ` — ${post.articleTitle}` : ""}: ${excerpt} [Read full post](${internalUrl})`;
        })
        .join("\n")}`
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
${partnersBoardSection}
${linkedInSection}

SITE PAGES (always link to relevant pages using markdown format [Page Name](url)):
${pages.map((p) => `- ${p.label}: ${p.path}`).join("\n")}

RULES:
- Be concise.
- Always include a relevant page link at the end of your answer using markdown: [See more →](/page-path)
- For pricing, direct to [Contact Us](/contact).
- When a LinkedIn update directly supports the answer, mention it and link to its exact internal Read full post URL from RECENT LINKEDIN UPDATES.
- CRITICAL: You must ONLY answer using the information provided in this context. If the user asks about something that is NOT explicitly mentioned above (like revenue, financials, specific employees, etc.), you must politely state that you do not have that information and direct them to contact Ereteam. Do NOT use your pre-trained knowledge or guess answers.`;
}

export const getChatContext = unstable_cache(
  buildChatContext,
  ["chat-context-v2"],
  { tags: [CHAT_CACHE_TAG], revalidate: 3600 }
);
