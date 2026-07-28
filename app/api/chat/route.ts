import { NextRequest, NextResponse } from "next/server";
import { getChatContext } from "@/lib/getChatContext";
import { pages } from "@/lib/siteData";
import { generateChatResponse, ChatMessage } from "@/lib/services/llmService";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  pages.map((p) => [p.path, p.label])
);

const chatRequestSchema = z.object({
  messages: z
    .array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().trim().min(1).max(2_000),
    }))
    .min(1)
    .max(20),
  currentPage: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const limit = rateLimit(`chat:${getClientIp(req)}`, 20, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is not set");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const payload = chatRequestSchema.safeParse(await req.json());
    if (!payload.success) return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });

    const { messages, currentPage } = payload.data;

    const systemPrompt = await getChatContext();

    const pageContext = currentPage && PAGE_LABELS[currentPage]
      ? `\nCURRENT PAGE: The user is currently on the "${PAGE_LABELS[currentPage]}". Tailor your response accordingly.`
      : "";

    const mappedMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const text = await generateChatResponse(systemPrompt, mappedMessages, apiKey, pageContext);

    return NextResponse.json({ content: text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Chat API error:", message);
    return NextResponse.json({ error: "Unable to process the chat request" }, { status: 500 });
  }
}
