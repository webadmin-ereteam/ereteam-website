type JsonObject = Record<string, unknown>;

const INTERNAL_OWNER_NAMES: Record<string, string> = {
  "kariturk@ereteam.com": "Kerem Arıtürk",
  "ksimsek@ereteam.com": "Kutlay Şimşek",
  "skaygusuz@ereteam.com": "Selda Kaygusuz",
  "idonmez@ereteam.com": "İlker Dönmez",
};

const asObject = (value: unknown): JsonObject =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {};

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

function findString(value: unknown, keys: Set<string>, depth = 0): string | undefined {
  if (!value || typeof value !== "object" || depth > 5) return undefined;
  if (Array.isArray(value)) {
    for (const child of value) {
      const match = findString(child, keys, depth + 1);
      if (match) return match;
    }
    return undefined;
  }
  for (const [key, child] of Object.entries(value as JsonObject)) {
    if (keys.has(key.toLowerCase())) {
      const match = asString(child);
      if (match) return match;
    }
  }
  for (const child of Object.values(value as JsonObject)) {
    const match = findString(child, keys, depth + 1);
    if (match) return match;
  }
  return undefined;
}

export function amplemarketSequenceKind(
  payload: unknown,
  sequenceName?: string | null,
): "bulk" | "duo" | undefined {
  const method = findString(payload, new Set([
    "creation_method",
    "sequence_kind",
    "sequencekind",
    "sequence_type",
  ]))?.toLocaleLowerCase("en-US").replace(/[\s-]+/g, "_");

  if (method === "duo" || method === "duo_copilot") return "duo";
  if (["manual", "ai_assisted", "bulk", "standard"].includes(method || "")) return "bulk";
  if (/\bduo\b/i.test(sequenceName || "")) return "duo";
  return undefined;
}

export function isAmplemarketAnalyticsBackfill(payload: unknown) {
  const source = asString(asObject(payload).source)?.toLocaleLowerCase("en-US");
  return source === "amplemarket-mcp-backfill" || source === "amplemarket-analytics-snapshot";
}

export function amplemarketOwnerEmail(payload: unknown, fallback?: string | null) {
  const root = asObject(payload);
  const user = asObject(root.user);
  const sender = asObject(asObject(root.dynamic_fields).sender);
  return (
    asString(user.email)
    || asString(sender.email)
    || asString(root.owner_email)
    || asString(fallback)
  )?.toLocaleLowerCase("en-US");
}

export function amplemarketOwnerName(payload: unknown, email?: string | null) {
  const root = asObject(payload);
  const user = asObject(root.user);
  const sender = asObject(asObject(root.dynamic_fields).sender);
  const firstName = asString(user.first_name) || asString(sender.first_name);
  const lastName = asString(user.last_name) || asString(sender.last_name);
  const suppliedName = [firstName, lastName].filter(Boolean).join(" ")
    || asString(user.name)
    || asString(sender.name);
  if (suppliedName) return suppliedName;

  const normalizedEmail = amplemarketOwnerEmail(payload, email);
  if (normalizedEmail && INTERNAL_OWNER_NAMES[normalizedEmail]) {
    return INTERNAL_OWNER_NAMES[normalizedEmail];
  }
  if (!normalizedEmail) return "Owner belirtilmemiş";
  return normalizedEmail
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .split(" ")
    .map((part) => part ? `${part[0].toLocaleUpperCase("tr-TR")}${part.slice(1)}` : part)
    .join(" ");
}
