import { prisma } from "./db";
import { verifyPassword } from "./passwordHash";

// Used by the login page and the account settings page — both are regular
// Server Actions/Components (Node runtime), so this can use the normal Prisma
// client. middleware.ts itself never calls this; it only verifies the signed
// session cookie (lib/presales/session.ts), which needs no DB access at all.
async function loadCredentialRow() {
  // A database failure must not silently reactivate potentially stale
  // environment credentials. The fallback is only for a confirmed empty table.
  return prisma.adminCredential.findFirst();
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

// The value new session tokens embed and the admin layout checks incoming
// ones against (see session.ts). No `AdminCredential` row means the env-var
// fallback is in use, which has no revocation store at all — 0 there just
// means "no epoch check applies," not a real timestamp.
export async function getCurrentSessionEpoch(): Promise<number> {
  const row = await loadCredentialRow();
  return row ? row.sessionEpoch.getTime() : 0;
}
