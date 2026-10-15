import "server-only";

import { prisma } from "@/lib/presales/db";

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  unavailable?: boolean;
};

export type RateLimitBucketState = {
  count: number;
  expiresAtMs: number;
};

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")?.trim()
    ?? "unknown";
}

type RateLimitDatabase = Pick<typeof prisma, "$queryRaw">;

// Window math is pinned to UTC (`AT TIME ZONE 'UTC'`) and derived from the
// database clock so every serverless instance computes identical bucket
// boundaries. `expiresAt` is returned as epoch milliseconds so callers never
// depend on how a naive timestamp column is translated into a local Date.
export async function consumeRateLimitBucket(
  database: RateLimitDatabase,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!key || !Number.isInteger(limit) || limit <= 0 || !Number.isInteger(windowMs) || windowMs <= 0) {
    throw new Error("Invalid rate-limit configuration");
  }

  try {
    const rows = await database.$queryRaw<Array<{ count: number; expiresAtMs: number }>>`
      WITH bounds AS (
        SELECT
          to_timestamp(floor(extract(epoch FROM clock_timestamp()) * 1000 / ${windowMs}) * ${windowMs} / 1000.0) AT TIME ZONE 'UTC' AS "windowStart",
          to_timestamp((floor(extract(epoch FROM clock_timestamp()) * 1000 / ${windowMs}) * ${windowMs} + ${windowMs}) / 1000.0) AT TIME ZONE 'UTC' AS "expiresAt"
      )
      INSERT INTO "RateLimitBucket" ("key", "windowStart", "count", "expiresAt")
      SELECT ${key}, "windowStart", 1, "expiresAt" FROM bounds
      ON CONFLICT ("key", "windowStart") DO UPDATE
      SET "count" = LEAST("RateLimitBucket"."count" + 1, ${limit + 1})
      RETURNING "count", (extract(epoch FROM "expiresAt") * 1000)::double precision AS "expiresAtMs"
    `;

    const bucket = rows[0];
    if (!bucket) throw new Error("Rate-limit bucket was not returned");
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.expiresAtMs - Date.now()) / 1000));
    return { allowed: bucket.count <= limit, retryAfterSeconds };
  } catch (error) {
    console.error("Distributed rate limiter unavailable:", error instanceof Error ? error.message : String(error));
    return { allowed: false, retryAfterSeconds: 60, unavailable: true };
  }
}

// Read-only view of the current window's bucket — used by the login lockout
// check so looking at the lock state never consumes an attempt.
export async function peekRateLimitBucket(
  database: RateLimitDatabase,
  key: string,
  windowMs: number,
): Promise<RateLimitBucketState | null> {
  if (!key || !Number.isInteger(windowMs) || windowMs <= 0) {
    throw new Error("Invalid rate-limit configuration");
  }

  const rows = await database.$queryRaw<Array<{ count: number; expiresAtMs: number }>>`
    WITH bounds AS (
      SELECT to_timestamp(floor(extract(epoch FROM clock_timestamp()) * 1000 / ${windowMs}) * ${windowMs} / 1000.0) AT TIME ZONE 'UTC' AS "windowStart"
    )
    SELECT r."count", (extract(epoch FROM r."expiresAt") * 1000)::double precision AS "expiresAtMs"
    FROM "RateLimitBucket" r, bounds b
    WHERE r."key" = ${key} AND r."windowStart" = b."windowStart"
  `;

  return rows[0] ?? null;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  return consumeRateLimitBucket(prisma, key, limit, windowMs);
}
