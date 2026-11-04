// Best-effort, per warm instance. Good enough for a demo; real limits need shared storage (TODO.md).
const WINDOW_MS = 60 * 60 * 1000;
// A blank or non-numeric env value must not turn the limit off (NaN never compares >=).
const configured = Number(process.env.RATE_LIMIT_PER_HOUR);
const MAX_PER_WINDOW = Number.isFinite(configured) && configured > 0 ? configured : 10;
// Bound memory on a long-lived instance: past this many ids, forget the stale ones.
const MAX_IDS = 10_000;
const hits = new Map<string, number[]>();

export function allow(installId: string, now = Date.now()): boolean {
  if (hits.size > MAX_IDS) {
    for (const [id, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(id);
  }
  const recent = (hits.get(installId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(installId, recent);
    return false;
  }
  recent.push(now);
  hits.set(installId, recent);
  return true;
}
