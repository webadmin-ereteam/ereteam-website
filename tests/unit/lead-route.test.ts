import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  rateLimit: vi.fn(),
  send: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  getClientIp: () => "203.0.113.8",
  rateLimit: mocks.rateLimit,
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));

import { POST } from "@/app/api/lead/route";

function request(body: unknown) {
  return new NextRequest("https://example.test/api/lead", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/lead", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "test-key";
    mocks.rateLimit.mockResolvedValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  it("rejects malformed lead data", async () => {
    const response = await POST(request({ name: "", email: "invalid" }));
    expect(response.status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns 503 when the distributed limiter is unavailable", async () => {
    mocks.rateLimit.mockResolvedValue({ allowed: false, retryAfterSeconds: 60, unavailable: true });
    const response = await POST(request({ name: "Test", email: "test@example.com" }));
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
  });

  it("reports success only after Resend accepts the message", async () => {
    const response = await POST(request({ name: "Test", email: "test@example.com" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });

    mocks.send.mockResolvedValueOnce({ data: null, error: { name: "validation_error" } });
    const failed = await POST(request({ name: "Test", email: "test@example.com" }));
    expect(failed.status).toBe(502);
  });
});
