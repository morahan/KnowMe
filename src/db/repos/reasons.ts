import { db } from '@/db/client';
import { MAX_REASONS } from '@/db/schema';
import type { Reason } from '@/db/schema';
import { newId } from '@/lib/ids';

export { MAX_REASONS } from '@/db/schema';

/** Universal reasons only: the ones that apply to every tracked habit. */
export function listReasons(): Promise<Reason[]> {
  return db.getAllAsync<Reason>('SELECT * FROM reasons WHERE habit_id IS NULL ORDER BY sort_order');
}

/** Reasons tagged to one habit only. Empty when that habit uses the universal list. */
export function listReasonsForHabit(habitId: string): Promise<Reason[]> {
  return db.getAllAsync<Reason>('SELECT * FROM reasons WHERE habit_id = ? ORDER BY sort_order', habitId);
}

/** Every reason, universal first, then per-habit groups in their own order. */
export function listAllReasons(): Promise<Reason[]> {
  return db.getAllAsync<Reason>(
    'SELECT * FROM reasons ORDER BY CASE WHEN habit_id IS NULL THEN 0 ELSE 1 END, habit_id, sort_order',
  );
}

/**
 * Replaces one reason list with `texts` (trimmed, empties dropped, max 8).
 * `habitId` null (the default) replaces the universal list; a habit id
 * replaces only that habit's list. Other lists are never touched.
 */
export async function replaceReasons(texts: string[], habitId: string | null = null): Promise<void> {
  const clean = texts.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);
  await db.withTransactionAsync(async () => {
    if (habitId === null) {
      await db.runAsync('DELETE FROM reasons WHERE habit_id IS NULL');
    } else {
      await db.runAsync('DELETE FROM reasons WHERE habit_id = ?', habitId);
    }
    for (const [i, text] of clean.entries()) {
      await db.runAsync(
        'INSERT INTO reasons (id, habit_id, text, sort_order) VALUES (?, ?, ?, ?)',
        newId(), habitId, text, i,
      );
    }
  });
}
