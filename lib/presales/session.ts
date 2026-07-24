// Signed session cookie for the admin login page. Uses Web Crypto (available
// in both the Edge Runtime and Node) so middleware.ts can verify a session
// without any DB call — only the login form itself needs to check
// AdminCredential (via verifyAdminPassword in auth.ts).

export const SESSION_COOKIE_NAME = "presales_admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

type SessionPayload = { exp: number; epoch: number };

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local.");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// `epoch` is `AdminCredential.sessionEpoch` (a millisecond timestamp) at the
// moment the token is issued — see getSessionPayload() for how this is used
// to let "Tüm cihazlardan çıkış yap" / a password change actually invalidate
// tokens already issued, not just the current browser's cookie.
export async function createSessionToken(epoch: number): Promise<string> {
  const payload: SessionPayload = { exp: Date.now() + SESSION_DURATION_MS, epoch };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`;
}

// Verifies the signature and expiry only — no DB access, so middleware.ts
// (Edge Runtime) can call this on every request without a round-trip. Does
// *not* check the epoch: a stolen-but-not-yet-expired token still passes
// this. getSessionPayload() below is the epoch-aware check, run from the
// admin layout instead (Node runtime, already doing DB queries per request).
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  return (await getSessionPayload(token)) !== null;
}

// Verifies signature + expiry the same way, but returns the decoded payload
// (including `epoch`) instead of a boolean, so a caller with DB access can
// additionally compare it against the current `AdminCredential.sessionEpoch`
// and reject a token issued before the most recent "sign out everywhere" /
// password change.
export async function getSessionPayload(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    if (typeof payload.exp !== "number" || payload.exp <= Date.now()) return null;
    // Tokens issued before this field existed have no `epoch` — treat as 0
    // (older than any real epoch value) so they fail an epoch check rather
    // than bypass it, while still passing this function's own signature/
    // expiry check (they're not otherwise invalid).
    return { exp: payload.exp, epoch: typeof payload.epoch === "number" ? payload.epoch : 0 };
  } catch {
    return null;
  }
}
