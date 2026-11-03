import type { Moment } from '@/db/schema';
import { countBy, topN } from '@/lib/stats';

export const SESSION_SECONDS = 20 * 60;

/** Helpers that most often appear on rode-it-out moments, best first. */
export function topHelpers(moments: Moment[], n = 3): string[] {
  return topN(countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers)), n);
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}
