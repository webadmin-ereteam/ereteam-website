const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

export function istanbulParts(date: Date) {
  const shifted = new Date(date.getTime() + ISTANBUL_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function reportDateKey(date: Date) {
  const { year, month, day } = istanbulParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function rollingPeriod(end: Date) {
  const { year, month, day } = istanbulParts(end);
  const currentDayStartUtc = Date.UTC(year, month - 1, day) - ISTANBUL_OFFSET_MS;
  return { start: new Date(currentDayStartUtc - 7 * 24 * 60 * 60 * 1000), end };
}

export function isBetween(value: string | undefined, start: Date, end: Date) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= start.getTime() && time <= end.getTime();
}

export function isReportingYear(value: string | undefined, year: number) {
  if (!value) return false;
  return istanbulParts(new Date(value)).year === year;
}

export function isReportingMonth(value: string | undefined, year: number, month: number) {
  if (!value) return false;
  const parts = istanbulParts(new Date(value));
  return parts.year === year && parts.month === month;
}
