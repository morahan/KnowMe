import type { Habit, Moment } from '@/db/schema';
import { countBy, topN } from '@/lib/stats';

export const SESSION_SECONDS = 20 * 60;

/** Helpers that most often appear on rode-it-out moments, best first. */
export function topHelpers(moments: Moment[], n = 3): string[] {
  return topN(countBy(moments.filter((m) => m.outcome === 'rode_it_out').flatMap((m) => m.helpers)), n);
}

/** Like topHelpers, but only moments tagged with one habit. No habit yet: every moment counts. */
export function topHelpersForHabit(moments: Moment[], habitId: string | null, n = 3): string[] {
  if (!habitId) return topHelpers(moments, n);
  return topHelpers(moments.filter((m) => m.habit_id === habitId), n);
}

/**
 * The habit this session is about. An explicit pick wins; a single tracked
 * habit needs no pick. Multiple habits with no pick yet resolve to null.
 */
export function resolveHabit(habits: Habit[], selectedId: string | null): Habit | null {
  if (selectedId) return habits.find((h) => h.id === selectedId) ?? null;
  return habits.length === 1 ? habits[0]! : null;
}

/** True only when there is a real choice to make: 2+ habits and none picked yet. */
export function needsHabitPick(habits: Habit[], selectedId: string | null): boolean {
  return habits.length > 1 && resolveHabit(habits, selectedId) === null;
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}
