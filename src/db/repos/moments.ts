import { db } from '@/db/client';
import type { Context, Moment, Outcome } from '@/db/schema';
import { CONTEXTS, OUTCOMES } from '@/db/schema';
import { newId } from '@/lib/ids';

type Row = Omit<Moment, 'feelings' | 'helpers' | 'is_demo'> & {
  feelings: string;
  helpers: string;
  is_demo: number;
};
export type NewMoment = Omit<Moment, 'id' | 'created_at' | 'is_demo'> & {
  created_at?: string;
  is_demo?: boolean;
};

const toMoment = (r: Row): Moment => ({
  ...r,
  context: r.context as Context,
  outcome: r.outcome as Outcome,
  feelings: JSON.parse(r.feelings) as string[],
  helpers: JSON.parse(r.helpers) as string[],
  is_demo: r.is_demo === 1,
});

function assertValid(m: NewMoment): void {
  if (!Number.isInteger(m.intensity) || m.intensity < 1 || m.intensity > 10) {
    throw new RangeError('intensity must be an integer 1-10');
  }
  if (!CONTEXTS.includes(m.context)) throw new RangeError(`unknown context: ${m.context}`);
  if (!OUTCOMES.includes(m.outcome)) throw new RangeError(`unknown outcome: ${m.outcome}`);
}

export async function insertMoment(m: NewMoment): Promise<string> {
  assertValid(m);
  const id = newId();
  await db.runAsync(
    `INSERT INTO moments (id, habit_id, created_at, intensity, context, feelings, outcome, helpers, note, is_demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, m.habit_id, m.created_at ?? new Date().toISOString(), m.intensity, m.context,
    JSON.stringify(m.feelings), m.outcome, JSON.stringify(m.helpers), m.note, m.is_demo ? 1 : 0,
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

export async function countMoments(): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM moments');
  return row?.n ?? 0;
}

export async function deleteDemoMoments(): Promise<void> {
  await db.runAsync('DELETE FROM moments WHERE is_demo = 1');
}

export async function hasDemoMoments(): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM moments WHERE is_demo = 1');
  return (row?.n ?? 0) > 0;
}
