import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

export const db = SQLite.openDatabaseSync('knowme.db');

/** Runs pending migrations. Safe to call on every launch. */
export function migrate(): void {
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const current = db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    const sql = MIGRATIONS[v];
    if (sql === undefined) break;
    db.withTransactionSync(() => {
      db.execSync(sql);
      db.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}
