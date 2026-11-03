import { MAX_REASONS } from '@/db/schema';

/** Custom habit names stay short so chips and Today stats stay readable. */
export const MAX_CUSTOM_HABIT_CHARS = 20;

/** Custom habit name ready to save: trimmed, spaces collapsed, capped at the limit. */
export function cleanCustomHabit(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, MAX_CUSTOM_HABIT_CHARS).trim();
}

export function canSaveCustomHabit(text: string): boolean {
  return cleanCustomHabit(text).length > 0;
}

/** Reasons ready to save: trimmed, empties dropped, max MAX_REASONS. */
export function cleanReasons(texts: string[]): string[] {
  return texts.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);
}

export function canAddReason(texts: string[]): boolean {
  return cleanReasons(texts).length < MAX_REASONS;
}
