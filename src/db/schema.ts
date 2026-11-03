// Data model from PRODUCT.md. Arrays are stored as JSON text.
export const CONTEXTS = ['home', 'car', 'work', 'social', 'other'] as const;
export const OUTCOMES = ['rode_it_out', 'used'] as const;
export const FEELINGS = ['bored', 'stressed', 'tired', 'restless', 'celebrating', 'lonely', 'other'] as const;
export const HELPERS = ['tea', 'walk', 'music', 'game', 'shower', 'call someone', 'food', 'other'] as const;
export const HABIT_KINDS = ['cannabis', 'nicotine', 'alcohol', 'custom'] as const;

export type Context = (typeof CONTEXTS)[number];
export type Outcome = (typeof OUTCOMES)[number];
export type Feeling = (typeof FEELINGS)[number];
export type Helper = (typeof HELPERS)[number];
export type HabitKind = (typeof HABIT_KINDS)[number];

export type Habit = { id: string; name: string; kind: HabitKind; created_at: string };
export type Reason = { id: string; text: string; sort_order: number };
export type Moment = {
  id: string;
  habit_id: string;
  created_at: string;
  intensity: number;
  context: Context;
  feelings: Feeling[];
  outcome: Outcome;
  helpers: Helper[];
  note: string | null;
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
];
