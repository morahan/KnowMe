const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD in local time. */
export function toISODate(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(d: Date = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole calendar days from `from` to `to` (local time). */
export function daysBetween(from: Date, to: Date = new Date()): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function daysAgo(n: number, now: Date = new Date()): Date {
  return new Date(now.getTime() - n * DAY_MS);
}
