// Best-effort, per warm instance. Good enough for a demo; real limits need shared storage (TODO.md).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.RATE_LIMIT_PER_HOUR ?? 10);
const hits = new Map<string, number[]>();

export function allow(installId: string, now = Date.now()): boolean {
  const recent = (hits.get(installId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(installId, recent);
    return false;
  }
  recent.push(now);
  hits.set(installId, recent);
  return true;
}
