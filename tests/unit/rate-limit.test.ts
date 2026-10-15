import { describe, expect, it, vi } from "vitest";
import { consumeRateLimitBucket, getClientIp, peekRateLimitBucket } from "@/lib/rateLimit";

describe("distributed rate limiter", () => {
  it("extracts the trusted proxy client address", () => {
    const request = new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.8, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.8");
  });

  it("returns an allowed bucket before the limit", async () => {
    const database = {
      $queryRaw: vi.fn().mockResolvedValue([{ count: 2, expiresAtMs: Date.now() + 30_000 }]),
    };
    const result = await consumeRateLimitBucket(database as never, "test", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("peeks at the current window without consuming an attempt", async () => {
    const database = {
      $queryRaw: vi.fn().mockResolvedValue([{ count: 5, expiresAtMs: Date.now() + 30_000 }]),
    };
    const bucket = await peekRateLimitBucket(database as never, "test", 60_000);
    expect(bucket).toMatchObject({ count: 5 });
    expect(bucket?.expiresAtMs).toBeGreaterThan(Date.now());
  });

  it("treats a missing peek bucket as zero attempts", async () => {
    const database = { $queryRaw: vi.fn().mockResolvedValue([]) };
    expect(await peekRateLimitBucket(database as never, "test", 60_000)).toBeNull();
  });

  it("fails closed when PostgreSQL is unavailable", async () => {
    const database = { $queryRaw: vi.fn().mockRejectedValue(new Error("offline")) };
    await expect(consumeRateLimitBucket(database as never, "test", 3, 60_000)).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 60,
      unavailable: true,
    });
  });

  it("rejects invalid limiter configuration", async () => {
    const database = { $queryRaw: vi.fn() };
    await expect(consumeRateLimitBucket(database as never, "", 0, 0)).rejects.toThrow("Invalid rate-limit configuration");
    await expect(peekRateLimitBucket(database as never, "test", 0)).rejects.toThrow("Invalid rate-limit configuration");
  });
});
