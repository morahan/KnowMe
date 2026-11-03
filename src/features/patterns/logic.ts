import type { Moment } from '@/db/schema';
import { daysBetween, toISODate } from '@/lib/dates';
import { generateDemoMoments } from '@/lib/demoMoments';
import { countBy, mean, topN } from '@/lib/stats';

export type DayPoint = { date: string; avg: number | null; count: number };

/** Example moments shown until the first real moment exists. In-memory only, never saved. */
export function sampleMoments(now: Date = new Date()): Moment[] {
  return generateDemoMoments(now).map((m, i) => ({
    ...m,
    id: `sample-${i}`,
    habit_id: 'sample',
    is_demo: true,
  }));
}

/**
 * What Patterns should chart. Any real (non-demo) moment replaces the
 * sample entirely, and demo rows never mix into real patterns.
 */
export function displayMoments(
  moments: Moment[],
  now: Date = new Date(),
): { moments: Moment[]; isSample: boolean } {
  const real = moments.filter((m) => !m.is_demo);
  if (real.length > 0) return { moments: real, isSample: false };
  return { moments: sampleMoments(now), isSample: true };
}

/**
 * Daily average intensity, oldest first. Missing days inside the range: avg null.
 * With `days`, the fixed window ending at `now` (used by tests). Without it, the
 * range is the data itself — first logged day through last logged day — so a
 * first-ever log is the first point, not the far end of an empty window.
 */
export function intensityByDay(moments: Moment[], days?: number, now = new Date()): DayPoint[] {
  const byDate = new Map<string, number[]>();
  for (const m of moments) {
    const key = toISODate(new Date(m.created_at));
    const xs = byDate.get(key) ?? [];
    xs.push(m.intensity);
    byDate.set(key, xs);
  }
  if (days === undefined && moments.length === 0) return [];
  let span = days ?? 0;
  let end = now;
  if (days === undefined) {
    const stamps = moments.map((m) => new Date(m.created_at));
    const first = new Date(Math.min(...stamps.map((d) => d.getTime())));
    const last = new Date(Math.max(...stamps.map((d) => d.getTime())));
    span = daysBetween(first, last) + 1;
    end = last;
  }
  const out: DayPoint[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    const key = toISODate(d);
    const xs = byDate.get(key) ?? [];
    const avg = mean(xs);
    out.push({ date: key, avg: avg === null ? null : Math.round(avg * 10) / 10, count: xs.length });
  }
  return out;
}

/** Days of intensity history that fit on screen at once. Past this, the chart scrolls. */
export const INTENSITY_FIT_DAYS = 30;

/**
 * Width of the plotted content. Up to INTENSITY_FIT_DAYS points it fills the
 * viewport exactly; beyond that each extra day keeps the same spacing the fit
 * range had, so the content outgrows the viewport and can scroll.
 */
export function intensityChartContentWidth(pointCount: number, viewportWidth: number, edgeInset: number): number {
  if (pointCount <= INTENSITY_FIT_DAYS || viewportWidth <= edgeInset * 2) return viewportWidth;
  const step = (viewportWidth - edgeInset * 2) / (INTENSITY_FIT_DAYS - 1);
  return edgeInset * 2 + (pointCount - 1) * step;
}

/**
 * X for point `index`, inset `edgeInset` from both ends so the first and last
 * dots (and a lone day-one dot, at the left) sit fully inside the plot.
 */
export function intensityPointX(index: number, pointCount: number, contentWidth: number, edgeInset: number): number {
  if (pointCount <= 1) return edgeInset;
  return edgeInset + (index / (pointCount - 1)) * (contentWidth - edgeInset * 2);
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-11-03' -> 'Nov 3', for chart axis labels. */
export function formatDayLabel(isoDate: string): string {
  const parts = isoDate.split('-').map(Number);
  const month = parts[1];
  const day = parts[2];
  if (!month || !day || month < 1 || month > 12) return isoDate;
  return `${MONTHS[month - 1]} ${day}`;
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
