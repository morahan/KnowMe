import { daysBetween } from '@/lib/dates';

/**
 * Whole days since the last "used" moment for a habit.
 * No "used" yet: count from when the habit was created. No drama either way.
 */
export function daysSinceLastUsed(lastUsedAt: string | null, habitCreatedAt: string, now = new Date()): number {
  const from = lastUsedAt ? new Date(lastUsedAt) : new Date(habitCreatedAt);
  return Math.max(0, daysBetween(from, now));
}
