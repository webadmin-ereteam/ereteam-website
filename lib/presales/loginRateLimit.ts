import { prisma } from "./db";

// Global, not per-IP/per-user — there's exactly one shared admin login for
// the whole team, so a single lockout counter is enough and needs no extra
// infra (Redis/Upstash) beyond the Postgres already in use everywhere else.
const MAX_ATTEMPTS = 6;
const LOCKOUT_MS = 10 * 60 * 1000;

async function getRow() {
  const existing = await prisma.adminLoginAttempt.findFirst();
  return existing ?? prisma.adminLoginAttempt.create({ data: {} });
}

export async function checkLoginLock(): Promise<{ locked: boolean; retryAfterMinutes?: number }> {
  try {
    const row = await getRow();
    if (row.lockedUntil && row.lockedUntil > new Date()) {
      return { locked: true, retryAfterMinutes: Math.ceil((row.lockedUntil.getTime() - Date.now()) / 60000) };
    }
    return { locked: false };
  } catch {
    // DB unreachable — never let this block a login that would otherwise work.
    return { locked: false };
  }
}

export async function recordLoginResult(success: boolean): Promise<void> {
  try {
    const row = await getRow();

    if (success) {
      await prisma.adminLoginAttempt.update({
        where: { id: row.id },
        data: { failedCount: 0, lockedUntil: null },
      });
      return;
    }

    // A lock that already expired doesn't carry its old count forward —
    // otherwise one stale failure from hours ago could re-trigger a lock
    // on the very next attempt.
    const lockExpired = row.lockedUntil !== null && row.lockedUntil <= new Date();
    const nextCount = lockExpired ? 1 : row.failedCount + 1;
    const shouldLock = nextCount >= MAX_ATTEMPTS;

    await prisma.adminLoginAttempt.update({
      where: { id: row.id },
      data: {
        failedCount: shouldLock ? 0 : nextCount,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
  } catch {
    // Best-effort — never block the login flow itself if this write fails.
  }
}
