const isoFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDateKey(date: Date | string): string {
  if (typeof date === "string") return date.slice(0, 10);
  return isoFormatter.format(date);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(date: Date | string, days: number): Date {
  const base = typeof date === "string" ? new Date(`${date}T12:00:00`) : new Date(date);
  base.setDate(base.getDate() + days);
  return base;
}

export function eachDay(startDate: Date | string, endDate: Date | string): string[] {
  const days: string[] = [];
  let cursor = toDateKey(startDate);
  const end = toDateKey(endDate);

  while (cursor <= end) {
    days.push(cursor);
    cursor = toDateKey(addDays(cursor, 1));
  }

  return days;
}

export function startOfMonth(month: number, year: number): string {
  return toDateKey(new Date(year, month - 1, 1));
}

export function endOfMonth(month: number, year: number): string {
  return toDateKey(new Date(year, month, 0));
}

export function previousMonth(month: number, year: number): { month: number; year: number } {
  return month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year };
}

export function formatReadableDate(date: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}
