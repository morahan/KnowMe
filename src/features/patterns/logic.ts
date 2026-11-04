import type { Moment } from '@/db/schema';
import { daysBetween, toISODate } from '@/lib/dates';
import { generateDemoMoments } from '@/lib/demoMoments';
import { formatHour, hourBuckets, peakWindow } from '@/lib/hours';
import { countBy, mean, topN } from '@/lib/stats';

export type DayPoint = { date: string; avg: number | null; count: number };

/** One behavior's daily averages, sharing the chart's date axis with every other series. */
export type HabitIntensitySeries = { habitId: string; points: DayPoint[] };

/** Behaviors drawn at once on the intensity chart. Three lines stay readable; more become a knot. */
export const MAX_VISIBLE_HABITS = 3;

/**
 * Which habits the chart draws, in series order. With no saved pick (or a
 * pick that no longer matches the data) it is simply the first three. The
 * result is always 1–3 ids that exist in `habitIds`.
 */
export function resolveVisibleHabitIds(picked: readonly string[] | null, habitIds: readonly string[]): string[] {
  const valid = habitIds.filter((id) => picked?.includes(id));
  if (valid.length > 0) return valid.slice(0, MAX_VISIBLE_HABITS);
  return habitIds.slice(0, MAX_VISIBLE_HABITS);
}

/**
 * Tap a behavior in the legend: shown ones hide, hidden ones show — but
 * never more than MAX_VISIBLE_HABITS at once, and never zero (the last
 * visible behavior stays until another takes its place).
 */
export function toggleVisibleHabitId(
  visible: readonly string[],
  habitId: string,
  habitIds: readonly string[],
): string[] {
  if (!habitIds.includes(habitId)) return [...visible];
  if (visible.includes(habitId)) {
    if (visible.length <= 1) return [...visible];
    return habitIds.filter((id) => id !== habitId && visible.includes(id));
  }
  if (visible.length >= MAX_VISIBLE_HABITS) return [...visible];
  return habitIds.filter((id) => id === habitId || visible.includes(id));
}

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
 * What Patterns should chart: every stored moment, including demo rows the
 * user loaded on Me (Today and Reflect count them too). The in-memory sample
 * shows only while nothing is stored at all.
 */
export function displayMoments(
  moments: Moment[],
  now: Date = new Date(),
): { moments: Moment[]; isSample: boolean } {
  if (moments.length > 0) return { moments, isSample: false };
  return { moments: sampleMoments(now), isSample: true };
}

/**
 * Daily average intensity, oldest first. Missing days inside the range: avg null.
 * With `days`, the fixed window ending at `now` (used by tests). Without it, the
 * range is the data itself — first logged day through last logged day — so a
 * first-ever log is the first point, not the far end of an empty window.
 */
/** Chart dates, oldest first. Shared so every habit's line lines up day for day. */
function dateAxis(moments: Moment[], days: number | undefined, now: Date): string[] {
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
  const keys: string[] = [];
  for (let i = span - 1; i >= 0; i--) {
    keys.push(toISODate(new Date(end.getFullYear(), end.getMonth(), end.getDate() - i)));
  }
  return keys;
}

function toDayPoints(axis: string[], byDate: Map<string, number[]>): DayPoint[] {
  return axis.map((key) => {
    const xs = byDate.get(key) ?? [];
    const avg = mean(xs);
    return { date: key, avg: avg === null ? null : Math.round(avg * 10) / 10, count: xs.length };
  });
}

export function intensityByDay(moments: Moment[], days?: number, now = new Date()): DayPoint[] {
  const byDate = new Map<string, number[]>();
  for (const m of moments) {
    const key = toISODate(new Date(m.created_at));
    const xs = byDate.get(key) ?? [];
    xs.push(m.intensity);
    byDate.set(key, xs);
  }
  return toDayPoints(dateAxis(moments, days, now), byDate);
}

/**
 * Daily average intensity per behavior. Each habit gets its own series on
 * the same date axis: five logs for one habit on one day average into a
 * single point for that habit, and never blend into another habit's point.
 * Series follow `habitIds` order; a habit with no logs gets no series. A
 * habit id found in the moments but missing from `habitIds` (for example a
 * since-removed habit) is appended in first-seen order so its logs still show.
 */
export function intensityByDayByHabit(
  moments: Moment[],
  habitIds: readonly string[],
  days?: number,
  now = new Date(),
): HabitIntensitySeries[] {
  const axis = dateAxis(moments, days, now);
  if (axis.length === 0) return [];
  const byHabit = new Map<string, Map<string, number[]>>();
  for (const m of moments) {
    let byDate = byHabit.get(m.habit_id);
    if (!byDate) {
      byDate = new Map();
      byHabit.set(m.habit_id, byDate);
    }
    const key = toISODate(new Date(m.created_at));
    const xs = byDate.get(key) ?? [];
    xs.push(m.intensity);
    byDate.set(key, xs);
  }
  const ordered = habitIds.filter((id) => byHabit.has(id));
  for (const id of byHabit.keys()) {
    if (!ordered.includes(id)) ordered.push(id);
  }
  return ordered.map((habitId) => ({ habitId, points: toDayPoints(axis, byHabit.get(habitId)!) }));
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
  return hourBuckets(moments.map((m) => m.created_at));
}

/** One behavior's share of a bar: which habit contributed how much. */
export type HabitSegment = { habitId: string; value: number };
export type HabitCountRow = { name: string; count: number; byHabit: HabitSegment[] };
export type HabitHourSeries = { habitId: string; buckets: number[] };

/** Habit ids present in the moments, in `habitIds` order, then any others first-seen. */
function orderedHabitIds(moments: Moment[], habitIds: readonly string[]): string[] {
  const present = new Set(moments.map((m) => m.habit_id));
  const ordered = habitIds.filter((id) => present.has(id));
  for (const m of moments) {
    if (!ordered.includes(m.habit_id)) ordered.push(m.habit_id);
  }
  return ordered;
}

/** 24 buckets per behavior, same ordering rule as the intensity series. */
export function byHourByHabit(moments: Moment[], habitIds: readonly string[]): HabitHourSeries[] {
  const byHabit = new Map<string, number[]>();
  for (const m of moments) {
    let buckets = byHabit.get(m.habit_id);
    if (!buckets) {
      buckets = Array.from({ length: 24 }, () => 0);
      byHabit.set(m.habit_id, buckets);
    }
    buckets[new Date(m.created_at).getHours()]! += 1;
  }
  return orderedHabitIds(moments, habitIds).map((habitId) => ({ habitId, buckets: byHabit.get(habitId)! }));
}

function topByHabit(
  entries: { name: string; habitId: string }[],
  habitIds: readonly string[],
  n: number,
): HabitCountRow[] {
  const perName = new Map<string, Map<string, number>>();
  const totals = new Map<string, number>();
  for (const e of entries) {
    let perHabit = perName.get(e.name);
    if (!perHabit) {
      perHabit = new Map();
      perName.set(e.name, perHabit);
    }
    perHabit.set(e.habitId, (perHabit.get(e.habitId) ?? 0) + 1);
    totals.set(e.name, (totals.get(e.name) ?? 0) + 1);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({
      name,
      count,
      byHabit: habitIds
        .filter((id) => (perName.get(name)?.get(id) ?? 0) > 0)
        .map((id) => ({ habitId: id, value: perName.get(name)!.get(id)! })),
    }));
}

export function topContextsByHabit(moments: Moment[], habitIds: readonly string[], n = 3): HabitCountRow[] {
  return topByHabit(moments.map((m) => ({ name: m.context, habitId: m.habit_id })), habitIds, n);
}

export function topFeelingsByHabit(moments: Moment[], habitIds: readonly string[], n = 3): HabitCountRow[] {
  return topByHabit(
    moments.flatMap((m) => m.feelings.map((name) => ({ name, habitId: m.habit_id }))),
    habitIds,
    n,
  );
}

/** Rode-out helper counts per behavior, keyed by helper name. */
export function helperRodeByHabit(
  moments: Moment[],
  habitIds: readonly string[],
): Record<string, HabitSegment[]> {
  const perHelper = new Map<string, Map<string, number>>();
  for (const m of moments) {
    if (m.outcome !== 'rode_it_out') continue;
    for (const name of m.helpers) {
      let perHabit = perHelper.get(name);
      if (!perHabit) {
        perHabit = new Map();
        perHelper.set(name, perHabit);
      }
      perHabit.set(m.habit_id, (perHabit.get(m.habit_id) ?? 0) + 1);
    }
  }
  const out: Record<string, HabitSegment[]> = {};
  for (const [name, perHabit] of perHelper) {
    out[name] = habitIds
      .filter((id) => (perHabit.get(id) ?? 0) > 0)
      .map((id) => ({ habitId: id, value: perHabit.get(id)! }));
  }
  return out;
}

export function peakHourLabel(moments: Moment[]): string | null {
  const w = peakWindow(byHour(moments));
  if (!w) return null;
  // "Most" only when the window really holds more than half of them.
  const span = `between ${formatHour(w.start)} and ${formatHour(w.end)}`;
  return w.count * 2 > w.total
    ? `Most of your cravings land ${span}.`
    : `Your cravings show up most ${span}.`;
}

export { formatHour };

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

/**
 * Helpers on moments the person rode out, most used first. Log only offers
 * helpers on "Rode it out", so a per-helper success rate would always be 100%;
 * how often each one came up is the honest number.
 */
export function topHelpers(moments: Moment[]): { name: string; count: number }[] {
  const rode = countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers));
  return Object.entries(rode)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

export function intensityInsight(points: DayPoint[]): string | null {
  const withData = points.filter((p) => p.avg !== null);
  if (withData.length < 2) return null;
  // Whole numbers: the 1-10 scale is whole, and "9 toward 4.8" reads oddly.
  const first = Math.round(withData[0]!.avg!);
  const last = Math.round(withData[withData.length - 1]!.avg!);
  if (last < first) return `Intensity is drifting down, from around ${first} toward ${last}.`;
  if (last > first) return `Intensity is up a little lately, from around ${first} toward ${last}.`;
  return `Intensity is holding steady around ${last}.`;
}

export function helpersInsight(rows: { name: string }[]): string | null {
  const top = rows[0];
  if (!top) return null;
  return `${cap(top.name)} shows up most on the times it passed.`;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
