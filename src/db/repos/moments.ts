import { db } from '@/db/client';
import type { Context, Feeling, Helper, Moment, Outcome } from '@/db/schema';
import { newId } from '@/lib/ids';

type Row = Omit<Moment, 'feelings' | 'helpers'> & { feelings: string; helpers: string };
export type NewMoment = Omit<Moment, 'id' | 'created_at'> & { created_at?: string };

const toMoment = (r: Row): Moment => ({
  ...r,
  context: r.context as Context,
  outcome: r.outcome as Outcome,
  feelings: JSON.parse(r.feelings) as Feeling[],
  helpers: JSON.parse(r.helpers) as Helper[],
});

export async function insertMoment(m: NewMoment): Promise<string> {
  const id = newId();
  await db.runAsync(
    `INSERT INTO moments (id, habit_id, created_at, intensity, context, feelings, outcome, helpers, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, m.habit_id, m.created_at ?? new Date().toISOString(), m.intensity, m.context,
    JSON.stringify(m.feelings), m.outcome, JSON.stringify(m.helpers), m.note,
  );
  return id;
}

/** Moments at or after `sinceIso`, newest first. */
export async function listMomentsSince(sinceIso: string): Promise<Moment[]> {
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM moments WHERE created_at >= ? ORDER BY created_at DESC', sinceIso,
  );
  return rows.map(toMoment);
}

export async function lastUsedAt(habitId: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ created_at: string }>(
    "SELECT created_at FROM moments WHERE habit_id = ? AND outcome = 'used' ORDER BY created_at DESC LIMIT 1",
    habitId,
  );
  return row?.created_at ?? null;
}
