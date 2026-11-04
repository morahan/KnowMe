import type { Habit, Moment } from '@/db/schema';
import { daysBetween } from '@/lib/dates';
import { habitLabel } from '@/lib/habits';

/**
 * Whole days since the last "used" moment for a habit.
 * No "used" yet: count from when the habit was created. No drama either way.
 */
export function daysSinceLastUsed(lastUsedAt: string | null, habitCreatedAt: string, now = new Date()): number {
  const from = lastUsedAt ? new Date(lastUsedAt) : new Date(habitCreatedAt);
  return Math.max(0, daysBetween(from, now));
}

/**
 * Which habit a moment was tagged with, for the Today list. Only worth
 * naming when more than one habit is tracked; with one, it is noise.
 * Unknown habit (e.g. removed) stays unnamed rather than guessed.
 */
export function momentHabitLabel(moment: Pick<Moment, 'habit_id'>, habits: readonly Habit[]): string | null {
  if (habits.length <= 1) return null;
  const habit = habits.find((h) => h.id === moment.habit_id);
  return habit ? habitLabel(habit) : null;
}
