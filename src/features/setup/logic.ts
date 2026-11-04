import { MAX_REASONS, type Habit, type HabitKind } from '@/db/schema';
import { PRESET_HABITS, habitLabel, habitNameKey } from '@/lib/habits';

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

/**
 * The preset a typed custom name really means, by its preset label or a
 * tracked preset's own (renamed) label, so "alcohol" picks Alcohol instead
 * of adding a second habit that reads the same. Null for a truly new name.
 */
export function presetKindForName(
  name: string,
  tracked: readonly Pick<Habit, 'name' | 'kind'>[],
): Exclude<HabitKind, 'custom'> | null {
  const key = habitNameKey(name);
  if (!key) return null;
  for (const h of tracked) {
    if (h.kind !== 'custom' && habitNameKey(habitLabel(h)) === key) return h.kind;
  }
  return PRESET_HABITS.find((p) => habitNameKey(p.label) === key)?.kind ?? null;
}
