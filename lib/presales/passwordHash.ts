import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;
// 32 hex chars (16-byte salt) : 128 hex chars (64-byte key)
const HASH_FORMAT = /^[0-9a-f]{32}:[0-9a-f]{128}$/;

export function looksHashed(value: string): boolean {
  return HASH_FORMAT.test(value);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derived.toString("hex")}`;
}

function safeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Constant-time compare needs equal-length buffers — lengths already
  // differing is itself not timing-sensitive information worth hiding.
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Verifies against either a proper scrypt hash (the normal case) or a plain
// string (a legacy `AdminCredential` row saved before hashing existed, or
// the ADMIN_BASIC_PASS env-var fallback — there's nowhere to durably store a
// salt for an env var re-read fresh on every call, so it stays a direct,
// still constant-time, compare).
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!looksHashed(stored)) {
    return safeStringCompare(password, stored);
  }
  const [salt, hashHex] = stored.split(":");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(hashHex, "hex");
  if (storedBuffer.length !== derived.length) return false;
  return timingSafeEqual(derived, storedBuffer);
}
