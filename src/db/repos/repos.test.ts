/* eslint-disable import/first -- jest.mock must precede the repo imports it mocks */
/**
 * Repository tests against an in-memory fake of the expo-sqlite async API.
 * The fake dispatches on the exact SQL the repos issue; it stores rows as
 * plain objects and implements the WHERE/ORDER clauses the repos use.
 */
type Row = Record<string, unknown>;

const tables: Record<string, Row[]> = { habits: [], reasons: [], moments: [], settings: [] };

function reset(): void {
  for (const k of Object.keys(tables)) tables[k] = [];
}

const fakeDb = {
  async runAsync(sql: string, ...args: unknown[]): Promise<void> {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (s.startsWith('INSERT INTO habits')) {
      tables.habits!.push({ id: args[0], name: args[1], kind: args[2], created_at: args[3] });
    } else if (s.startsWith('DELETE FROM habits')) {
      tables.habits = tables.habits!.filter((r) => r.id !== args[0]);
      tables.moments = tables.moments!.filter((r) => r.habit_id !== args[0]); // ON DELETE CASCADE
    } else if (s.startsWith('DELETE FROM reasons')) {
      tables.reasons = [];
    } else if (s.startsWith('INSERT INTO reasons')) {
      tables.reasons!.push({ id: args[0], text: args[1], sort_order: args[2] });
    } else if (s.startsWith('INSERT INTO moments')) {
      tables.moments!.push({
        id: args[0], habit_id: args[1], created_at: args[2], intensity: args[3], context: args[4],
        feelings: args[5], outcome: args[6], helpers: args[7], note: args[8], is_demo: args[9],
      });
    } else if (s.startsWith('DELETE FROM moments WHERE is_demo')) {
      tables.moments = tables.moments!.filter((r) => r.is_demo !== 1);
    } else if (s.startsWith('INSERT OR REPLACE INTO settings')) {
      tables.settings = tables.settings!.filter((r) => r.key !== args[0]);
      tables.settings.push({ key: args[0], value: args[1] });
    } else {
      throw new Error(`fakeDb: unhandled runAsync: ${s}`);
    }
  },
  async getAllAsync<T>(sql: string, ...args: unknown[]): Promise<T[]> {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (s.startsWith('SELECT * FROM habits')) {
      return [...tables.habits!].sort(byStr('created_at')) as T[];
    }
    if (s.startsWith('SELECT * FROM reasons')) {
      return [...tables.reasons!].sort((a, b) => (a.sort_order as number) - (b.sort_order as number)) as T[];
    }
    if (s.startsWith('SELECT * FROM moments')) {
      return tables.moments!.filter((r) => (r.created_at as string) >= (args[0] as string))
        .sort((a, b) => byStr('created_at')(b, a)) as T[];
    }
    throw new Error(`fakeDb: unhandled getAllAsync: ${s}`);
  },
  async getFirstAsync<T>(sql: string, ...args: unknown[]): Promise<T | null> {
    const s = sql.replace(/\s+/g, ' ').trim();
    if (s.includes("outcome = 'used'")) {
      const rows = tables.moments!.filter((r) => r.habit_id === args[0] && r.outcome === 'used')
        .sort((a, b) => byStr('created_at')(b, a));
      return (rows[0] as T) ?? null;
    }
    if (s.startsWith('SELECT COUNT(*) AS n FROM moments WHERE is_demo')) {
      return { n: tables.moments!.filter((r) => r.is_demo === 1).length } as T;
    }
    if (s.startsWith('SELECT COUNT(*) AS n FROM moments')) {
      return { n: tables.moments!.length } as T;
    }
    if (s.startsWith('SELECT value FROM settings')) {
      const row = tables.settings!.find((r) => r.key === args[0]);
      return (row as T) ?? null;
    }
    throw new Error(`fakeDb: unhandled getFirstAsync: ${s}`);
  },
  async withTransactionAsync(fn: () => Promise<void>): Promise<void> {
    await fn();
  },
};

const byStr = (key: string) => (a: Row, b: Row) => String(a[key]).localeCompare(String(b[key]));

jest.mock('@/db/client', () => ({ db: fakeDb, migrate: () => undefined }));

import { addHabit, listHabits, removeHabit } from './habits';
import { countMoments, deleteDemoMoments, hasDemoMoments, insertMoment, lastUsedAt, listMomentsSince } from './moments';
import { listReasons, replaceReasons } from './reasons';
import { getInstallId, getSetting, setSetting } from './settings';

const base = {
  habit_id: 'h1', intensity: 6, context: 'home' as const, feelings: ['bored' as const],
  outcome: 'rode_it_out' as const, helpers: ['tea' as const], note: null,
};

beforeEach(reset);

describe('habits repo', () => {
  it('adds and lists habits in creation order', async () => {
    const a = await addHabit('cannabis', 'cannabis');
    await addHabit('Evening walks', 'custom');
    const all = await listHabits();
    expect(all.map((h) => h.name)).toEqual(['cannabis', 'Evening walks']);
    expect(all[0]!.id).toBe(a.id);
  });

  it('removes a habit and cascades its moments', async () => {
    const a = await addHabit('nicotine', 'nicotine');
    await insertMoment({ ...base, habit_id: a.id });
    await removeHabit(a.id);
    expect(await listHabits()).toEqual([]);
    expect(await countMoments()).toBe(0);
  });
});

describe('reasons repo', () => {
  it('trims, drops empties, caps at 8, keeps order', async () => {
    await replaceReasons(['  Sleep better ', '', 'Be present', 'a', 'b', 'c', 'd', 'e', 'f', 'g']);
    const rows = await listReasons();
    expect(rows.map((r) => r.text)).toEqual(['Sleep better', 'Be present', 'a', 'b', 'c', 'd', 'e', 'f']);
    expect(rows.map((r) => r.sort_order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('replaces rather than appends', async () => {
    await replaceReasons(['one']);
    await replaceReasons(['two']);
    expect((await listReasons()).map((r) => r.text)).toEqual(['two']);
  });
});

describe('moments repo', () => {
  it('round-trips JSON arrays and the demo flag', async () => {
    await insertMoment({ ...base, is_demo: true });
    const [m] = await listMomentsSince('2000-01-01T00:00:00.000Z');
    expect(m!.feelings).toEqual(['bored']);
    expect(m!.helpers).toEqual(['tea']);
    expect(m!.is_demo).toBe(true);
  });

  it('rejects out-of-range intensity and unknown enums', async () => {
    await expect(insertMoment({ ...base, intensity: 0 })).rejects.toThrow(RangeError);
    await expect(insertMoment({ ...base, intensity: 11 })).rejects.toThrow(RangeError);
    await expect(insertMoment({ ...base, intensity: 5.5 })).rejects.toThrow(RangeError);
    // @ts-expect-error deliberately invalid enum
    await expect(insertMoment({ ...base, context: 'moon' })).rejects.toThrow(RangeError);
  });

  it('lists newest first and finds last used', async () => {
    await insertMoment({ ...base, created_at: '2026-11-01T20:00:00.000Z' });
    await insertMoment({ ...base, outcome: 'used', helpers: [], created_at: '2026-11-02T21:00:00.000Z' });
    const all = await listMomentsSince('2026-10-01T00:00:00.000Z');
    expect(all.map((m) => m.outcome)).toEqual(['used', 'rode_it_out']);
    expect(await lastUsedAt('h1')).toBe('2026-11-02T21:00:00.000Z');
    expect(await lastUsedAt('other-habit')).toBeNull();
  });

  it('deletes only demo moments', async () => {
    await insertMoment({ ...base, is_demo: true });
    await insertMoment({ ...base });
    expect(await hasDemoMoments()).toBe(true);
    await deleteDemoMoments();
    expect(await countMoments()).toBe(1);
    expect(await hasDemoMoments()).toBe(false);
  });
});

describe('settings repo', () => {
  it('round-trips values and keeps a stable install id', async () => {
    await setSetting('k', 'v');
    expect(await getSetting('k')).toBe('v');
    expect(await getSetting('missing')).toBeNull();
    const id1 = await getInstallId();
    expect(await getInstallId()).toBe(id1);
    expect(id1.length).toBeGreaterThan(4);
  });
});
