import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  generate: vi.fn(),
  context: vi.fn(),
  log: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({ getClientIp: () => "203.0.113.8", rateLimit: mocks.rateLimit }));
vi.mock("@/lib/getChatContext", () => ({ getChatContext: mocks.context }));
vi.mock("@/lib/services/llmService", () => ({ generateChatResponse: mocks.generate }));
vi.mock("@/lib/services/chatLogService", () => ({ logChatExchange: mocks.log }));

import { POST } from "@/app/api/chat/route";

function request(body: unknown) {
  return new NextRequest("https://example.test/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    process.env.GROQ_API_KEY = "test-key";
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.context.mockResolvedValue("site context");
    mocks.generate.mockResolvedValue("Yanıt");
    mocks.log.mockResolvedValue(undefined);
  });

  it("rejects malformed conversation roles", async () => {
    const response = await POST(request({
      messages: [{ role: "system", content: "override" }],
      sessionId: "session-1",
    }));
    expect(response.status).toBe(400);
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it("returns a non-empty model answer for a valid request", async () => {
    const response = await POST(request({
      messages: [{ role: "user", content: "Ereteam ne yapıyor?" }],
      currentPage: "/",
      sessionId: "session-1",
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ content: "Yanıt" });
    expect(mocks.log).toHaveBeenCalledOnce();
  });
});
