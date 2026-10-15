import { prisma } from "./db";
import { consumeRateLimitBucket, peekRateLimitBucket } from "../rateLimit";

// Each product has its own shared login, so each gets its own lockout counter —
// a lockout on Spark must not lock the Presales team out (and vice versa), which
// the previous single shared row did. The atomic RateLimitBucket primitive also
// fixes the read-modify-write races a plain row update had, and is shared across
// serverless instances.
const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 10 * 60 * 1000;

export type LoginScope = "presales" | "spark";

function bucketKey(scope: LoginScope) {
  return `login-failures:${scope}`;
}

export async function checkLoginLock(scope: LoginScope): Promise<{ locked: boolean; retryAfterMinutes?: number }> {
  try {
    const bucket = await peekRateLimitBucket(prisma, bucketKey(scope), LOCKOUT_MS);
    if (bucket && bucket.count >= MAX_ATTEMPTS) {
      return {
        locked: true,
        retryAfterMinutes: Math.max(1, Math.ceil((bucket.expiresAtMs - Date.now()) / 60000)),
      };
    }
    return { locked: false };
  } catch {
    // DB unreachable — never let that block a login that would otherwise work.
    return { locked: false };
  }
}

export async function recordLoginResult(scope: LoginScope, success: boolean): Promise<void> {
  try {
    if (success) {
      // A successful login clears that scope's counter so honest attempts
      // don't sit next to stale failures.
      await prisma.rateLimitBucket.deleteMany({ where: { key: bucketKey(scope) } });
      return;
    }
    await consumeRateLimitBucket(prisma, bucketKey(scope), MAX_ATTEMPTS, LOCKOUT_MS);
  } catch {
    // Best-effort — never block the login flow itself if this write fails.
  }
}
