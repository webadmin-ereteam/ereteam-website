export interface ChatMessage {
  role: string;
  content: string;
}

type JsonSchemaOption = {
  name: string;
  schema: Record<string, unknown>;
};

export class LlmApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly retryAfterSeconds?: number,
    public readonly failedGeneration?: string,
  ) {
    super(message);
    this.name = "LlmApiError";
  }
}

export async function generateChatResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  apiKey: string,
  pageContext: string = "",
  options: { model?: string; temperature?: number; maxTokens?: number; jsonMode?: boolean; jsonSchema?: JsonSchemaOption; reasoningEffort?: "low" | "medium" | "high" } = {}
): Promise<string> {
  const { model = "llama-3.1-8b-instant", temperature = 0.7, maxTokens = 600, jsonMode = false, jsonSchema, reasoningEffort } = options;

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
      ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
      ...(jsonSchema ? {
        response_format: {
          type: "json_schema",
          json_schema: { name: jsonSchema.name, strict: true, schema: jsonSchema.schema },
        },
      } : jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("LLM API error:", JSON.stringify(data));
    const retryAfter = Number(res.headers.get("retry-after"));
    throw new LlmApiError(
      data.error?.message || "LLM error",
      res.status,
      data.error?.code,
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
      typeof data.error?.failed_generation === "string" ? data.error.failed_generation : undefined,
    );
  }

  return data.choices?.[0]?.message?.content || "";
}
