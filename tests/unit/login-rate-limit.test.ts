import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  peek: vi.fn(),
  consume: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  consumeRateLimitBucket: mocks.consume,
  peekRateLimitBucket: mocks.peek,
}));

vi.mock("@/lib/presales/db", () => ({
  prisma: { rateLimitBucket: { deleteMany: mocks.deleteMany } },
}));

import { checkLoginLock, recordLoginResult } from "@/lib/presales/loginRateLimit";

describe("login lockout", () => {
  beforeEach(() => {
    mocks.peek.mockReset().mockResolvedValue(null);
    mocks.consume.mockReset().mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    mocks.deleteMany.mockReset().mockResolvedValue({ count: 0 });
  });

  it("locks only after the attempt limit is reached", async () => {
    mocks.peek.mockResolvedValue({ count: 5, expiresAtMs: Date.now() + 5 * 60_000 });
    await expect(checkLoginLock("presales")).resolves.toEqual({ locked: false });

    mocks.peek.mockResolvedValue({ count: 6, expiresAtMs: Date.now() + 5 * 60_000 });
    const locked = await checkLoginLock("presales");
    expect(locked.locked).toBe(true);
    expect(locked.retryAfterMinutes).toBeGreaterThanOrEqual(1);
  });

  it("never consumes an attempt while checking the lock", async () => {
    await checkLoginLock("spark");
    expect(mocks.peek).toHaveBeenCalledWith(expect.anything(), "login-failures:spark", 10 * 60 * 1000);
    expect(mocks.consume).not.toHaveBeenCalled();
  });

  it("keeps the two products' lockout counters separate", async () => {
    await recordLoginResult("spark", false);
    expect(mocks.consume).toHaveBeenCalledWith(expect.anything(), "login-failures:spark", 6, 10 * 60 * 1000);

    await recordLoginResult("presales", false);
    expect(mocks.consume).toHaveBeenLastCalledWith(expect.anything(), "login-failures:presales", 6, 10 * 60 * 1000);
  });

  it("clears only the signing-in product's counter on success", async () => {
    await recordLoginResult("presales", true);
    expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { key: "login-failures:presales" } });
    expect(mocks.consume).not.toHaveBeenCalled();
  });

  it("fails open when the limiter database is unreachable", async () => {
    mocks.peek.mockRejectedValue(new Error("offline"));
    await expect(checkLoginLock("presales")).resolves.toEqual({ locked: false });
  });

  it("never blocks the login flow when recording fails", async () => {
    mocks.consume.mockRejectedValue(new Error("offline"));
    await expect(recordLoginResult("spark", false)).resolves.toBeUndefined();
  });
});
