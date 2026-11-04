import type { Habit, HabitKind } from '@/db/schema';

/** The named habits offered as one-tap picks. Anything else is `custom`. */
export const PRESET_HABITS: { kind: Exclude<HabitKind, 'custom'>; label: string }[] = [
  { kind: 'cannabis', label: 'Cannabis' },
  { kind: 'nicotine', label: 'Nicotine' },
  { kind: 'alcohol', label: 'Alcohol' },
  { kind: 'scrolling', label: 'Scrolling' },
];

/** Long enough for a person's own words, short enough to stay a chip. Matches Setup's custom cap. */
export const MAX_HABIT_NAME_CHARS = 20;

/**
 * The one label for a habit, everywhere it is shown (Me, Log, Today,
 * I'm in it, Setup). Presets always show their named label, even for rows
 * stored lowercase before this existed; customs show their cleaned name.
 */
export function habitLabel(habit: Pick<Habit, 'name' | 'kind'>): string {
  const preset = PRESET_HABITS.find((p) => p.kind === habit.kind);
  return preset ? preset.label : cleanHabitName(habit.name);
}

/** Trim and collapse spaces, the way a habit name is stored and shown. */
export function cleanHabitName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_HABIT_NAME_CHARS).trim();
}

/** Case-insensitive identity for a habit name. */
export function habitNameKey(name: string): string {
  return cleanHabitName(name).toLowerCase();
}

export function isTrackedName(name: string, existing: readonly Pick<Habit, 'name'>[]): boolean {
  const key = habitNameKey(name);
  return key !== '' && existing.some((h) => habitNameKey(h.name) === key);
}

export function isTrackedKind(kind: HabitKind, existing: readonly Pick<Habit, 'kind'>[]): boolean {
  return kind !== 'custom' && existing.some((h) => h.kind === kind);
}

/**
 * Custom names ready to add: cleaned, empties dropped, no repeats within
 * the list, and nothing already tracked (by name, whatever the casing).
 */
export function cleanCustomHabitNames(texts: readonly string[], existing: readonly Pick<Habit, 'name'>[] = []): string[] {
  const seen = new Set(existing.map((h) => habitNameKey(h.name)));
  const out: string[] = [];
  for (const raw of texts) {
    const name = cleanHabitName(raw);
    const key = habitNameKey(name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/** The habit a picker should show: the current pick if it still exists, else the first tracked. */
export function resolveHabitId(habits: readonly Pick<Habit, 'id'>[], currentId: string | null): string | null {
  if (currentId && habits.some((h) => h.id === currentId)) return currentId;
  return habits[0]?.id ?? null;
}
