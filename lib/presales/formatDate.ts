// Shared short date label for admin UI (dashboard cards, journey header).
// Close date is nullable until an outcome is set, so callers pass `null`/
// `undefined` and get a plain "-" instead of having to branch themselves.
export function formatDisplayDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}
