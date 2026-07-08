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

export function resolveDateRangePreset(preset: string | undefined): { from: Date; to: Date } | null {
  const now = new Date();

  switch (preset) {
    case "today": {
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      return { from, to };
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return { from, to };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to };
    }
    case "this_year": {
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear() + 1, 0, 1);
      return { from, to };
    }
    default:
      return null;
  }
}
