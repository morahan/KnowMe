import type { Habit, HabitKind } from '@/db/schema';

/** Whether a preset is a substance or a behavior. Gambling is the one behavioral preset. */
export type HabitCategory = 'substance' | 'behavior';

export type PresetHabit = {
  kind: Exclude<HabitKind, 'custom'>;
  label: string;
  category: HabitCategory;
};

/** The named habits offered as one-tap picks. Anything else is `custom`. */
export const PRESET_HABITS: PresetHabit[] = [
  { kind: 'alcohol', label: 'Alcohol', category: 'substance' },
  { kind: 'cannabis', label: 'Cannabis', category: 'substance' },
  { kind: 'gambling', label: 'Gambling', category: 'behavior' },
  { kind: 'nicotine', label: 'Nicotine', category: 'substance' },
];

/** The preset for a habit kind, or undefined for customs. */
export function presetForKind(kind: HabitKind): PresetHabit | undefined {
  return PRESET_HABITS.find((p) => p.kind === kind);
}

/** Long enough for a person's own words, short enough to stay a chip. Matches Setup's custom cap. */
export const MAX_HABIT_NAME_CHARS = 20;

/**
 * The one label for a habit, everywhere it is shown (Me, Log, Today,
 * I'm in it, Setup). A preset shows its named label — even for rows stored
 * lowercase before this existed — unless it was renamed, in which case the
 * person's own words win. Customs show their cleaned name.
 */
export function habitLabel(habit: Pick<Habit, 'name' | 'kind'>): string {
  const preset = PRESET_HABITS.find((p) => p.kind === habit.kind);
  if (!preset) return cleanHabitName(habit.name);
  const cleaned = cleanHabitName(habit.name);
  if (
    cleaned &&
    habitNameKey(cleaned) !== habitNameKey(preset.label) &&
    habitNameKey(cleaned) !== habitNameKey(preset.kind)
  ) {
    return cleaned;
  }
  return preset.label;
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

/**
 * The cleaned name a tracked habit can be renamed to, or null when it is
 * empty, already used by another tracked habit, or another preset's label
 * (which would make two tags read as the same thing).
 */
export function renamedHabitName(
  raw: string,
  existing: readonly Pick<Habit, 'id' | 'name' | 'kind'>[],
  selfId: string,
): string | null {
  const name = cleanHabitName(raw);
  const key = habitNameKey(name);
  if (!key) return null;
  const self = existing.find((h) => h.id === selfId);
  if (!self) return null;
  if (existing.some((h) => h.id !== selfId && habitNameKey(habitLabel(h)) === key)) return null;
  if (PRESET_HABITS.some((p) => p.kind !== self.kind && habitNameKey(p.label) === key)) return null;
  return name;
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
