import { prisma } from "./db";

// Used by the login page and the account settings page — both are regular
// Server Actions/Components (Node runtime), so this can use the normal Prisma
// client. middleware.ts itself never calls this; it only verifies the signed
// session cookie (lib/presales/session.ts), which needs no DB access at all.
export async function getEffectiveAdminCredentials(): Promise<{ username: string; password: string } | null> {
  const envUser = process.env.ADMIN_BASIC_USER?.trim();
  const envPass = process.env.ADMIN_BASIC_PASS?.trim();
  const envFallback = envUser && envPass ? { username: envUser, password: envPass } : null;

  try {
    const row = await prisma.adminCredential.findFirst();
    return row ?? envFallback;
  } catch {
    // DB unreachable — never let that lock everyone out if env vars still work.
    return envFallback;
  }
}
