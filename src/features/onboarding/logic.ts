/** Pure paging for the onboarding slides. Clamped at both ends, no wrap. */
export function nextIndex(index: number, total: number): number {
  return Math.min(Math.max(index + 1, 0), Math.max(total - 1, 0));
}

export function prevIndex(index: number): number {
  return Math.max(index - 1, 0);
}

export function isLast(index: number, total: number): boolean {
  return total > 0 && index >= total - 1;
}
