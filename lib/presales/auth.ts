import { neon } from "@neondatabase/serverless";

// middleware.ts runs in the Edge Runtime, which can't use the regular Prisma
// client (node-postgres driver isn't Edge-compatible) — this tiny fetch-based
// Neon client works in both Edge and Node, so it's the one place we read
// AdminCredential from outside a normal Server Action/Component.
export async function getEffectiveAdminCredentials(): Promise<{ username: string; password: string } | null> {
  const envUser = process.env.ADMIN_BASIC_USER?.trim();
  const envPass = process.env.ADMIN_BASIC_PASS?.trim();
  const envFallback = envUser && envPass ? { username: envUser, password: envPass } : null;

  if (!process.env.DATABASE_URL) return envFallback;

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT username, password FROM "AdminCredential" LIMIT 1`;
    const row = rows[0] as { username: string; password: string } | undefined;
    return row ?? envFallback;
  } catch {
    // DB unreachable — never let that lock everyone out if env vars still work.
    return envFallback;
  }
}

export async function isValidAdminBasicAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader?.startsWith("Basic ")) return false;

  const expected = await getEffectiveAdminCredentials();
  if (!expected) return false;

  const decoded = atob(authHeader.slice("Basic ".length));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);

  return user === expected.username && pass === expected.password;
}
