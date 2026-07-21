// Quick-select date range presets for dashboard filters (Kapanış/Oluşturma
// Tarihi) — a plain date picker was confusing for two single-value filters
// that people actually think of as "this month" / "last month" comparisons.
export const DATE_RANGE_PRESETS = [
  { value: "", label: "Tümü" },
  { value: "today", label: "Bugün" },
  { value: "this_month", label: "Bu Ay" },
  { value: "last_month", label: "Geçen Ay" },
  { value: "this_year", label: "Bu Yıl" },
] as const;

// Turkey observes a fixed UTC+3 offset year-round (no DST since 2016), so a
// plain millisecond shift is safe here — no DST-transition edge cases to
// account for like most other timezones. Vercel's serverless functions run
// in UTC, so without this, "Bugün" etc. would use UTC's calendar day, which
// is wrong for roughly the first three hours of every Istanbul day.
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

function istanbulDateParts(date: Date) {
  const shifted = new Date(date.getTime() + ISTANBUL_OFFSET_MS);
  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth(), day: shifted.getUTCDate() };
}

// Given an Istanbul-local calendar day (month/day may be out of [0,11]/[1,31]
// — JS Date rolls those over correctly), returns the UTC instant of that
// day's midnight in Istanbul.
function istanbulMidnightUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day) - ISTANBUL_OFFSET_MS);
}

export function resolveDateRangePreset(preset: string | undefined): { from: Date; to: Date } | null {
  const { year, month, day } = istanbulDateParts(new Date());

  switch (preset) {
    case "today": {
      const from = istanbulMidnightUTC(year, month, day);
      const to = istanbulMidnightUTC(year, month, day + 1);
      return { from, to };
    }
    case "this_month": {
      const from = istanbulMidnightUTC(year, month, 1);
      const to = istanbulMidnightUTC(year, month + 1, 1);
      return { from, to };
    }
    case "last_month": {
      const from = istanbulMidnightUTC(year, month - 1, 1);
      const to = istanbulMidnightUTC(year, month, 1);
      return { from, to };
    }
    case "this_year": {
      const from = istanbulMidnightUTC(year, 0, 1);
      const to = istanbulMidnightUTC(year + 1, 0, 1);
      return { from, to };
    }
    default:
      return null;
  }
}
