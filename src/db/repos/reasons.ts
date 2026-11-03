import { db } from '@/db/client';
import type { Reason } from '@/db/schema';
import { newId } from '@/lib/ids';

export const MAX_REASONS = 8;

export function listReasons(): Promise<Reason[]> {
  return db.getAllAsync<Reason>('SELECT * FROM reasons ORDER BY sort_order');
}

/** Replaces all reasons with `texts` (trimmed, empties dropped, max 8). */
export async function replaceReasons(texts: string[]): Promise<void> {
  const clean = texts.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM reasons');
    for (const [i, text] of clean.entries()) {
      await db.runAsync('INSERT INTO reasons (id, text, sort_order) VALUES (?, ?, ?)', newId(), text, i);
    }
  });
}
