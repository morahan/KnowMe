import type { Reason } from '@/db/schema';

const byOrder = (a: Reason, b: Reason) => a.sort_order - b.sort_order;

/** The universal list: reasons that apply to every tracked habit. */
export function universalReasons(reasons: readonly Reason[]): Reason[] {
  return reasons.filter((r) => r.habit_id === null).sort(byOrder);
}

/** Reasons tagged to one habit, in the order the person wrote them. */
export function reasonsTaggedTo(reasons: readonly Reason[], habitId: string): Reason[] {
  return reasons.filter((r) => r.habit_id === habitId).sort(byOrder);
}

/** Plain texts for one list: the universal list, or one habit's tagged list. */
export function reasonTextsFor(reasons: readonly Reason[], habitId: string | null): string[] {
  const list = habitId === null ? universalReasons(reasons) : reasonsTaggedTo(reasons, habitId);
  return list.map((r) => r.text);
}

/**
 * The reasons to show for a moment with `habitId`.
 * A habit's own list wins, but only when more than one habit is tracked:
 * with a single habit the universal list is the whole story, so a leftover
 * tagged list never surprises. No tagged list (or no habit yet) falls back
 * to the universal list.
 */
export function visibleReasons(
  reasons: readonly Reason[],
  habitId: string | null,
  habitCount: number,
): Reason[] {
  if (habitId !== null && habitCount > 1) {
    const tagged = reasonsTaggedTo(reasons, habitId);
    if (tagged.length > 0) return tagged;
  }
  return universalReasons(reasons);
}

/** Every reason text once, universal first: what a summary can quote. */
export function allReasonTexts(reasons: readonly Reason[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of [...universalReasons(reasons), ...reasons.filter((x) => x.habit_id !== null)]) {
    if (seen.has(r.text)) continue;
    seen.add(r.text);
    out.push(r.text);
  }
  return out;
}
