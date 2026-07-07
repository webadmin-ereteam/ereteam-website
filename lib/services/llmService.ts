export interface ChatMessage {
  role: string;
  content: string;
}

export async function generateChatResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string,
  pageContext: string = "",
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const { model = "llama-3.1-8b-instant", temperature = 0.7, maxTokens = 600 } = options;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt + pageContext },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("LLM API error:", JSON.stringify(data));
    throw new Error(data.error?.message || "LLM error");
  }

  return data.choices?.[0]?.message?.content || "";
}
