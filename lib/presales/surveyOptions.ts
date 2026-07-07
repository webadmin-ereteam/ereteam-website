// A choice option can be flagged as "Diğer" (other) — when a respondent picks it,
// they get a free-text field to specify. Rather than changing the `options: Json`
// column's shape (which every reader casts as `string[]`), the flag is encoded as
// an invisible suffix on the stored string itself, so existing rows/readers that
// know nothing about this feature keep working unchanged.
export const OTHER_OPTION_MARKER = "§§OTHER§§";

export function encodeOtherOption(text: string): string {
  return `${text}${OTHER_OPTION_MARKER}`;
}

export type DecodedOption = { text: string; isOther: boolean };

export function decodeOption(raw: string): DecodedOption {
  if (raw.endsWith(OTHER_OPTION_MARKER)) {
    return { text: raw.slice(0, -OTHER_OPTION_MARKER.length), isOther: true };
  }
  return { text: raw, isOther: false };
}

export function decodeOptions(raw: unknown): DecodedOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o) => decodeOption(String(o)));
}
