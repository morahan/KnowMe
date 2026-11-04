/// <reference types="node" />
/**
 * Runs the real MIGRATIONS against Node's built-in SQLite, the way
 * client.ts applies them on device, so schema changes are tested as SQL.
 */
import { DatabaseSync } from 'node:sqlite';
import { HABIT_KINDS, MIGRATIONS } from './schema';

function migrateTo(db: DatabaseSync, version: number): void {
  for (let v = 0; v < version; v++) db.exec(MIGRATIONS[v]!);
}

describe('MIGRATIONS', () => {
  it('apply cleanly from an empty database', () => {
    const db = new DatabaseSync(':memory:');
    expect(() => migrateTo(db, MIGRATIONS.length)).not.toThrow();
  });

  it('leave no habit with a kind the app no longer knows (the retired Scrolling preset)', () => {
    const db = new DatabaseSync(':memory:');
    migrateTo(db, 3);
    const insert = db.prepare('INSERT INTO habits (id, name, kind, created_at) VALUES (?, ?, ?, ?)');
    insert.run('h1', 'scrolling', 'scrolling', '2026-11-01T00:00:00.000Z');
    insert.run('h2', 'Doomscrolling', 'scrolling', '2026-11-01T00:00:00.000Z');
    insert.run('h3', 'Nicotine', 'nicotine', '2026-11-01T00:00:00.000Z');
    for (let v = 3; v < MIGRATIONS.length; v++) db.exec(MIGRATIONS[v]!);
    const rows = db.prepare('SELECT id, name, kind FROM habits ORDER BY id').all() as { id: string; name: string; kind: string }[];
    for (const r of rows) expect(HABIT_KINDS as readonly string[]).toContain(r.kind);
    // Kept as the person's own habit, in the label they saw, with its moments untouched.
    expect(rows).toEqual([
      { id: 'h1', name: 'Scrolling', kind: 'custom' },
      { id: 'h2', name: 'Doomscrolling', kind: 'custom' },
      { id: 'h3', name: 'Nicotine', kind: 'nicotine' },
    ]);
  });
});
