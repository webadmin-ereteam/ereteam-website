// Vercel's serverless functions run in UTC regardless of where the team is —
// without an explicit timeZone, these would render 3 hours behind in
// production while looking correct in local dev (where the machine's own
// clock happens to already be Istanbul time). Pinned rather than left to the
// runtime's default so it's correct everywhere this deploys, not just here.
const DISPLAY_TIME_ZONE = "Europe/Istanbul";

// Shared short date label for admin UI (dashboard cards, journey header).
// Close date is nullable until an outcome is set, so callers pass `null`/
// `undefined` and get a plain "-" instead of having to branch themselves.
export function formatDisplayDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: DISPLAY_TIME_ZONE });
}

// Same short label plus time-of-day — for timestamps where *when* matters,
// not just which day (e.g. "son görüntüleme").
export function formatDisplayDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
  });
}
