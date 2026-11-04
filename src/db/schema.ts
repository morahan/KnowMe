// Data model from PRODUCT.md. Arrays are stored as JSON text.
// Preset lists are alphabetical, with `other` last: it opens the custom input, not a real tag.
export const CONTEXTS = ['car', 'home', 'social', 'work', 'other'] as const;
export const OUTCOMES = ['rode_it_out', 'used'] as const;
export const FEELINGS = ['bored', 'celebrating', 'lonely', 'restless', 'stressed', 'tired', 'other'] as const;
export const HELPERS = ['call someone', 'food', 'game', 'music', 'shower', 'tea', 'walk', 'other'] as const;
export const HABIT_KINDS = ['alcohol', 'cannabis', 'custom', 'gambling', 'nicotine'] as const;
export const MAX_REASONS = 8;

export type Context = (typeof CONTEXTS)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type Feeling = (typeof FEELINGS)[number];
export type Helper = (typeof HELPERS)[number];
export type HabitKind = (typeof HABIT_KINDS)[number];

export type Habit = { id: string; name: string; kind: HabitKind; question: string | null; created_at: string };
/** A reason with `habit_id: null` is universal (applies to every tracked habit). Otherwise it belongs to that one habit. */
export type Reason = { id: string; habit_id: string | null; text: string; sort_order: number };
export type Moment = {
  id: string;
  habit_id: string;
  created_at: string;
  intensity: number;
  context: Context;
  /** Preset values plus short custom tags typed under Other. */
  feelings: string[];
  outcome: Outcome;
  /** Preset values plus short custom tags typed under Other. */
  helpers: string[];
  note: string | null;
  is_demo: boolean;
};

/** Index = target user_version - 1. Append only; never edit a shipped migration. */
export const MIGRATIONS: readonly string[] = [
  `
  CREATE TABLE habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    kind TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE reasons (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  );
  CREATE TABLE moments (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 10),
    context TEXT NOT NULL,
    feelings TEXT NOT NULL DEFAULT '[]',
    outcome TEXT NOT NULL,
    helpers TEXT NOT NULL DEFAULT '[]',
    note TEXT
  );
  CREATE INDEX moments_created_at ON moments(created_at);
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  `,
  `ALTER TABLE moments ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0;`,
  // Reasons gain an optional habit tag. NULL means universal (every habit);
  // a habit id means that reason belongs to that habit only. Existing rows
  // are universal, so nothing changes for single-habit users. Removing a
  // habit cascades its tagged reasons, like its moments.
  `ALTER TABLE reasons ADD COLUMN habit_id TEXT REFERENCES habits(id) ON DELETE CASCADE;
   CREATE INDEX reasons_habit_id ON reasons(habit_id);`,
  `ALTER TABLE habits ADD COLUMN question TEXT;`,
  // Scrolling is no longer a preset (Gambling replaced it). Keep any tracked
  // Scrolling habit, with its moments and reasons, as the person's own custom
  // habit, named the way it was shown.
  `UPDATE habits
     SET name = CASE WHEN lower(trim(name)) = 'scrolling' THEN 'Scrolling' ELSE name END,
         kind = 'custom'
   WHERE kind = 'scrolling';`,
];
