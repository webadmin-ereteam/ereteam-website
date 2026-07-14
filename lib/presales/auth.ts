import { prisma } from "./db";
import { verifyPassword } from "./passwordHash";

// Used by the login page and the account settings page — both are regular
// Server Actions/Components (Node runtime), so this can use the normal Prisma
// client. middleware.ts itself never calls this; it only verifies the signed
// session cookie (lib/presales/session.ts), which needs no DB access at all.
async function loadCredentialRow() {
  try {
    return await prisma.adminCredential.findFirst();
  } catch {
    // DB unreachable — never let that lock everyone out if env vars still work.
    return null;
  }
}

// Username only — the account page shows this to prefill the form, but the
// password itself is never read back out in plaintext (see AdminCredential's
// `password` column: a scrypt hash once saved through updateAdminCredentials,
// never the raw value again).
export async function getAdminUsername(): Promise<string | null> {
  const row = await loadCredentialRow();
  if (row) return row.username;
  return process.env.ADMIN_BASIC_USER?.trim() ?? null;
}

export async function verifyAdminPassword(username: string, password: string): Promise<boolean> {
  const row = await loadCredentialRow();
  if (row) {
    return username === row.username && (await verifyPassword(password, row.password));
  }

  const envUser = process.env.ADMIN_BASIC_USER?.trim();
  const envPass = process.env.ADMIN_BASIC_PASS?.trim();
  if (!envUser || !envPass) return false;
  return username === envUser && (await verifyPassword(password, envPass));
}
