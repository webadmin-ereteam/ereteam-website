import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Ereteam's website assistant. Answer questions about Ereteam professionally and concisely. Always respond in the same language the user writes in — Turkish or English.

ABOUT ERETEAM:
Ereteam is an enterprise data & analytics consultancy founded in 2001, with 25 years of expertise.
- HQ: New Jersey, USA | Operations: Istanbul, Turkey
- Global presence: 17 countries | 100+ enterprise clients | 200+ projects | 80+ experts
- Industries: Banking & Finance, Insurance, Telecom, Pharma & Biotech, Retail, Manufacturing, Media, Government

SERVICES:
1. Data, Cloud & AI — Data Strategy, Cloud Migration, AI & Machine Learning, Data Governance, Self-Service Analytics (IBM, AWS, Databricks, Snowflake)
2. Financial Performance & Intelligence — FP&A, Budgeting, Financial Consolidation, Profitability Analytics, Regulatory Reporting (IBM Planning Analytics, TM1, Cognos, SAP)
3. Marketing Intelligence — Marketing Mix Modelling, Campaign Analytics, Customer Segmentation, Trade Promotion Analytics (Tableau, Alteryx, DataRobot, HCL Unica)

PRODUCTS:
- Obserian: Enterprise data governance & quality platform
- Pharmeta: Data intelligence platform for pharma & life sciences
- Maturytics: Data maturity assessment tool (5 dimensions: Strategy, Architecture, Governance, Analytics, Culture)

NOTABLE CLIENTS: ING Bank, Halkbank, Akbank, Ziraat Bank, VakıfBank, Vodafone, Türk Telekom, Roche, Novartis, Haleon, Amgen, Coca-Cola, Koçtaş, OYAK Cement, Enerjisa, Digiturk, SiriusXM, Istanbul Metropolitan Municipality

CONTACT: info@ereteam.com | US: +1 (201) 340-7525 | TR: +90 (212) 945-0340

SITE PAGES (always link to relevant pages using markdown format [Page Name](url)):
- Services overview: /services
- Data, Cloud & AI service: /services/data-cloud-ai
- Financial Performance & Intelligence service: /services/financial-performance-intelligence
- Marketing Intelligence service: /services/marketing-intelligence
- Products overview: /products
- Obserian product: /products/obserian
- Pharmeta product: /products/pharmeta
- Maturytics product: /products/maturytics
- Use Cases & client work: /use-cases
- About Ereteam: /about
- Careers: /about/careers
- Contact: /contact
- Partners: /partners

RULES:
- Be concise.
- Always include a relevant page link at the end of your answer using markdown: [See more →](/page-path)
- For pricing, direct to [Contact Us](/contact).
- Don't invent facts.`;

const PAGE_LABELS: Record<string, string> = {
  "/": "Home page",
  "/services": "Services overview",
  "/services/data-cloud-ai": "Data, Cloud & AI service page",
  "/services/financial-performance-intelligence": "Financial Performance & Intelligence service page",
  "/services/marketing-intelligence": "Marketing Intelligence service page",
  "/products": "Products overview",
  "/products/obserian": "Obserian product page",
  "/products/pharmeta": "Pharmeta product page",
  "/products/maturytics": "Maturytics product page",
  "/use-cases": "Use Cases & client work page",
  "/about": "About Ereteam page",
  "/about/careers": "Careers page",
  "/contact": "Contact page",
  "/partners": "Partners page",
};

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
