import type { Habit, Moment, Reason } from '@/db/schema';
import { countBy, mean, topN } from '@/lib/stats';

/** Everything that leaves the device for a reflection. Nothing else may be added without SAFETY.md review. */
export type ReflectionSummary = {
  days: number;
  habits: string[];
  moments: number;
  rodeItOut: number;
  used: number;
  averageIntensity: number | null;
  /** 24 buckets, local hour of day. */
  byHour: number[];
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
  const byHour = Array.from({ length: 24 }, () => 0);
  for (const m of moments) byHour[new Date(m.created_at).getHours()]! += 1;

  const summary: ReflectionSummary = {
    days,
    habits: habits.map((h) => h.name),
    moments: moments.length,
    rodeItOut: moments.filter((m) => m.outcome === 'rode_it_out').length,
    used: moments.filter((m) => m.outcome === 'used').length,
    averageIntensity: roundOrNull(mean(moments.map((m) => m.intensity))),
    byHour,
    topContexts: topN(countBy(moments.map((m) => m.context)), 3),
    topFeelings: topN(countBy(moments.flatMap((m) => m.feelings)), 3),
    topHelpers: topN(countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers)), 3),
    reasons: reasons.map((r) => r.text),
  };

  if (includeNotes) {
    summary.notes = moments.map((m) => m.note?.trim()).filter((n): n is string => Boolean(n));
  }
  return summary;
}

/** Every free-text string in the summary, for the local crisis guard. */
export function freeText(summary: ReflectionSummary): string[] {
  return [...summary.habits, ...summary.reasons, ...(summary.notes ?? [])];
}

function roundOrNull(n: number | null): number | null {
  return n === null ? null : Math.round(n * 10) / 10;
}
