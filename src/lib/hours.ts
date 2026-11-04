/** Fewest moments before an hour pattern is worth a sentence. */
export const MIN_MOMENTS_FOR_PEAK = 5;

export type PeakWindow = { start: number; end: number; count: number; total: number };

/** 24 buckets of local hour-of-day counts. */
export function hourBuckets(isoStamps: readonly string[]): number[] {
  const out = Array.from({ length: 24 }, () => 0);
  for (const s of isoStamps) out[new Date(s).getHours()]! += 1;
  return out;
}

/**
 * Busiest 3-hour window (wrapping midnight), so a single stray hour cannot
 * win on a tie. Null until there are enough moments to call it a pattern.
 */
export function peakWindow(buckets: readonly number[]): PeakWindow | null {
  const total = buckets.reduce((a, b) => a + b, 0);
  if (total < MIN_MOMENTS_FOR_PEAK) return null;
  let start = 0;
  let count = -1;
  for (let h = 0; h < 24; h++) {
    const sum = (buckets[h] ?? 0) + (buckets[(h + 1) % 24] ?? 0) + (buckets[(h + 2) % 24] ?? 0);
    if (sum > count) {
      count = sum;
      start = h;
    }
  }
  return { start, end: (start + 3) % 24, count, total };
}

export function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

/** "8pm to 11pm" */
export function formatWindow(w: PeakWindow): string {
  return `${formatHour(w.start)} to ${formatHour(w.end)}`;
}
