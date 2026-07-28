type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, RateLimitEntry>;

const globalForRateLimit = globalThis as typeof globalThis & {
  apiRateLimitStore?: RateLimitStore;
};

const store = globalForRateLimit.apiRateLimitStore ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.apiRateLimitStore = store;
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.count += 1;
  const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { allowed: current.count <= limit, retryAfterSeconds };
}
