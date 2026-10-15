import { beforeEach, describe, expect, it } from "vitest";
import { createSessionToken, getSessionPayload, verifySessionToken } from "@/lib/presales/session";

describe("signed sessions", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = "test-secret-that-is-not-used-outside-tests";
  });

  it("verifies the signature, epoch and audience", async () => {
    const token = await createSessionToken(1234, "spark");
    await expect(verifySessionToken(token, "spark")).resolves.toBe(true);
    await expect(getSessionPayload(token, "spark")).resolves.toMatchObject({ epoch: 1234 });
    await expect(verifySessionToken(token, "presales")).resolves.toBe(false);
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken(1234);
    const [payload, signature] = token.split(".");
    await expect(verifySessionToken(`${payload}x.${signature}`)).resolves.toBe(false);
  });
});
