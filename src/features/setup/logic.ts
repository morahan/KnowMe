import { MAX_REASONS } from '@/db/repos/reasons';

/** Reasons ready to save: trimmed, empties dropped, max MAX_REASONS. */
export function cleanReasons(texts: string[]): string[] {
  return texts.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);
}

export function canAddReason(texts: string[]): boolean {
  return cleanReasons(texts).length < MAX_REASONS;
}
