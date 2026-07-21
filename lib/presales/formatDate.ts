// Shared short date label for admin UI (dashboard cards, journey header).
// Close date is nullable until an outcome is set, so callers pass `null`/
// `undefined` and get a plain "-" instead of having to branch themselves.
export function formatDisplayDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

// Same short label plus time-of-day — for timestamps where *when* matters,
// not just which day (e.g. "son görüntüleme").
export function formatDisplayDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
