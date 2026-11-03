import { db } from '@/db/client';
import { newId } from '@/lib/ids';

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
}

/** Random per-install id. Only used by the proxy for rate limiting (SAFETY.md §4). */
export async function getInstallId(): Promise<string> {
  const existing = await getSetting('install_id');
  if (existing) return existing;
  const id = newId();
  await setSetting('install_id', id);
  return id;
}
