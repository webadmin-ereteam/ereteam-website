import { NextRequest, NextResponse } from "next/server";
import { company, contact, industries, notableClients, services, products, pages } from "@/lib/siteData";

const SYSTEM_PROMPT = `You are Ereteam's website assistant. Answer questions about Ereteam professionally and concisely. Always respond in the same language the user writes in — Turkish or English.

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

SITE PAGES (always link to relevant pages using markdown format [Page Name](url)):
${pages.map((p) => `- ${p.label}: ${p.path}`).join("\n")}

RULES:
- Be concise.
- Always include a relevant page link at the end of your answer using markdown: [See more →](/page-path)
- For pricing, direct to [Contact Us](/contact).
- Don't invent facts.`;

const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  pages.map((p) => [p.path, p.label])
);

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages, currentPage } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const pageContext = currentPage && PAGE_LABELS[currentPage]
      ? `\nCURRENT PAGE: The user is currently on the "${PAGE_LABELS[currentPage]}". Tailor your response accordingly.`
      : "";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + pageContext },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return NextResponse.json({ error: data.error?.message || "Groq error" }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content;
    return NextResponse.json({ content: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
