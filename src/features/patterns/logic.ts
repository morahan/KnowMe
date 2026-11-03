import type { Moment } from '@/db/schema';
import { toISODate } from '@/lib/dates';
import { countBy, mean, topN } from '@/lib/stats';

export type DayPoint = { date: string; avg: number | null; count: number };

/** Daily average intensity for the last `days` days, oldest first. Missing days: avg null. */
export function intensityByDay(moments: Moment[], days = 21, now = new Date()): DayPoint[] {
  const byDate = new Map<string, number[]>();
  for (const m of moments) {
    const key = toISODate(new Date(m.created_at));
    const xs = byDate.get(key) ?? [];
    xs.push(m.intensity);
    byDate.set(key, xs);
  }
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = toISODate(d);
    const xs = byDate.get(key) ?? [];
    const avg = mean(xs);
    out.push({ date: key, avg: avg === null ? null : Math.round(avg * 10) / 10, count: xs.length });
  }
  return out;
}

/** 24 buckets by local hour. */
export function byHour(moments: Moment[]): number[] {
  const out = Array.from({ length: 24 }, () => 0);
  for (const m of moments) out[new Date(m.created_at).getHours()]! += 1;
  return out;
}

export function peakHourLabel(moments: Moment[]): string | null {
  if (moments.length === 0) return null;
  const hours = byHour(moments);
  // Busiest 3-hour window, so a single stray hour cannot win on a tie.
  let best = 0;
  let bestSum = -1;
  for (let h = 0; h < 24; h++) {
    const sum = hours[h]! + hours[(h + 1) % 24]! + hours[(h + 2) % 24]!;
    if (sum > bestSum) {
      bestSum = sum;
      best = h;
    }
  }
  const end = (best + 3) % 24;
  return `Most of your cravings land between ${formatHour(best)} and ${formatHour(end)}.`;
}

export function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function topContexts(moments: Moment[], n = 3): { name: string; count: number }[] {
  const counts = countBy(moments.map((m) => m.context));
  return topN(counts, n).map((name) => ({ name, count: counts[name]! }));
}

export function topFeelings(moments: Moment[], n = 3): { name: string; count: number }[] {
  const counts = countBy(moments.flatMap((m) => m.feelings));
  return topN(counts, n).map((name) => ({ name, count: counts[name]! }));
}

export function rideOutRate(moments: Moment[]): number | null {
  if (moments.length === 0) return null;
  return moments.filter((m) => m.outcome === 'rode_it_out').length / moments.length;
}

/** Share of moments with each helper that were rode out. Only helpers seen 2+ times. */
export function helperSuccess(moments: Moment[]): { name: string; rate: number; count: number }[] {
  const totals = countBy(moments.flatMap((m) => m.helpers));
  const rode = countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers));
  return Object.entries(totals)
    .filter(([, n]) => n >= 2)
    .map(([name, count]) => ({ name, count, rate: (rode[name] ?? 0) / count }))
    .sort((a, b) => b.rate - a.rate || b.count - a.count)
    .slice(0, 3);
}

export function intensityInsight(points: DayPoint[]): string | null {
  const withData = points.filter((p) => p.avg !== null);
  if (withData.length < 2) return null;
  const first = withData[0]!.avg!;
  const last = withData[withData.length - 1]!.avg!;
  if (last < first) return `Intensity is drifting down, from around ${first} toward ${last}.`;
  if (last > first) return `Intensity is up a little lately, from around ${first} toward ${last}.`;
  return `Intensity is holding steady around ${last}.`;
}

export function helpersInsight(rows: { name: string; rate: number }[]): string | null {
  const top = rows[0];
  if (!top) return null;
  return `${cap(top.name)} shows up most on the moments you rode out.`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
