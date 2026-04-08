import { NextRequest, NextResponse } from "next/server";
import { getChatContext } from "@/lib/getChatContext";
import { pages } from "@/lib/siteData";

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

    const systemPrompt = await getChatContext();

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
          { role: "system", content: systemPrompt + pageContext },
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
