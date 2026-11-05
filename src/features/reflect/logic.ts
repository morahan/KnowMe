import type { Habit, Moment, Reason } from '@/db/schema';
// The pure matcher only: logic.ts stays free of React and the router.
import { isCrisis } from '@/features/safety/logic';
import { toISODate } from '@/lib/dates';
import { formatWindow, hourBuckets, peakWindow } from '@/lib/hours';
import { allReasonTexts } from '@/lib/reasons';
import { countBy, mean, topN } from '@/lib/stats';

/** Everything that leaves the device for a reflection. Nothing else may be added without SAFETY.md review. */
export type ReflectionSummary = {
  days: number;
  habits: string[];
  moments: number;
  timesItPassed: number;
  timesYouDid: number;
  averageIntensity: number | null;
  /** 24 buckets, local hour of day. */
  byHour: number[];
  /**
   * The busiest 3-hour window in plain words ("8pm to 11pm"), the same one
   * Patterns names, or null with too few moments. Derived from byHour, so no
   * new information leaves the device (SAFETY §4: hours). The model misread
   * the raw array on its own.
   */
  peakHours: string | null;
  topContexts: string[];
  topFeelings: string[];
  /** Helpers on moments the user rode out. */
  topHelpers: string[];
  reasons: string[];
  /** Present only when the user turned on "Include my notes" for this reflection. */
  notes?: string[];
};

type Input = {
  habits: Habit[];
  reasons: Reason[];
  moments: Moment[];
  days: number;
  includeNotes: boolean;
};

export function buildSummary({ habits, reasons, moments, days, includeNotes }: Input): ReflectionSummary {
  const byHour = hourBuckets(moments.map((m) => m.created_at));
  const peak = peakWindow(byHour);

  const summary: ReflectionSummary = {
    days,
    habits: habits.map((h) => h.name),
    moments: moments.length,
    timesItPassed: moments.filter((m) => m.outcome === 'rode_it_out').length,
    timesYouDid: moments.filter((m) => m.outcome === 'used').length,
    averageIntensity: roundOrNull(mean(moments.map((m) => m.intensity))),
    byHour,
    peakHours: peak ? formatWindow(peak) : null,
    topContexts: topN(countBy(moments.map((m) => m.context)), 3),
    topFeelings: topN(countBy(moments.flatMap((m) => m.feelings)), 3),
    topHelpers: topN(countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers)), 3),
    // Universal plus any per-habit reasons, each text once. Still only the
    // person's own reason words; nothing new leaves the device (SAFETY §4).
    reasons: allReasonTexts(reasons),
  };

  if (includeNotes) {
    summary.notes = moments.map((m) => m.note?.trim()).filter((n): n is string => Boolean(n));
  }
  return summary;
}

/** Every free-text string in the summary, for the local crisis guard. Custom feelings and helpers are typed words too. */
export function freeText(summary: ReflectionSummary): string[] {
  return [
    ...summary.habits,
    ...summary.reasons,
    ...summary.topContexts,
    ...summary.topFeelings,
    ...summary.topHelpers,
    ...(summary.notes ?? []),
  ];
}

export type ProxyResponse = { crisis: true } | { crisis: false; text: string };
export type Classified = { kind: 'crisis' } | { kind: 'letter'; lines: string[] };

/**
 * SAFETY.md: a crisis flag from the proxy always wins; the letter is never shown instead.
 * The letter is screened here too (CRISIS token or crisis words), so an older or
 * misbehaving proxy can't put one on screen. Anything malformed throws -> calm error.
 */
export function classifyResponse(data: ProxyResponse): Classified {
  if (data.crisis === true) return { kind: 'crisis' };
  if (data.crisis !== false || typeof data.text !== 'string' || !data.text.trim()) throw new Error('bad reply');
  if (/\bcrisis\b/i.test(data.text) || isCrisis(data.text)) return { kind: 'crisis' };
  // Break only where end punctuation meets a space, so "5.6" stays one number.
  const lines = data.text
    .replace(/([.?!]+)\s+/g, '$1\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  return { kind: 'letter', lines };
}

function roundOrNull(n: number | null): number | null {
  return n === null ? null : Math.round(n * 10) / 10;
}

/** The last letter, as cached in settings. */
export type CachedLetter = { lines: string[]; at: string | null };

/** Parses the `reflect_cache` setting. Anything malformed is just no cache. */
export function parseCachedLetter(raw: string | null): CachedLetter | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { lines?: unknown; at?: unknown };
    const { lines, at } = parsed;
    if (!Array.isArray(lines) || lines.length === 0 || !lines.every((l) => typeof l === 'string')) return null;
    return { lines, at: typeof at === 'string' ? at : null };
  } catch {
    return null;
  }
}

/** One letter a day: true when the last letter landed on today's local date. Resets at local midnight. */
export function reflectedToday(at: string | null | undefined, now: Date = new Date()): boolean {
  if (!at) return false;
  const last = new Date(at);
  if (Number.isNaN(last.getTime())) return false;
  return toISODate(last) === toISODate(now);
}
