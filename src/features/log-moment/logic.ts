import type { NewMoment } from '@/db/repos/moments';
import type { Context, Feeling, Helper, Outcome } from '@/db/schema';

export type LogDraft = {
  habitId: string | null;
  intensity: number | null;
  context: Context;
  feelings: Feeling[];
  outcome: Outcome;
  helpers: Helper[];
  note: string;
};

export const emptyDraft: LogDraft = {
  habitId: null, intensity: null, context: 'home', feelings: [], outcome: 'rode_it_out', helpers: [], note: '',
};

export function isReady(d: LogDraft): boolean {
  return d.habitId !== null && d.intensity !== null;
}

/** Assumes isReady(d). Helpers only count when the moment was rode out. */
export function toNewMoment(d: LogDraft): NewMoment {
  return {
    habit_id: d.habitId!,
    intensity: d.intensity!,
    context: d.context,
    feelings: d.feelings,
    outcome: d.outcome,
    helpers: d.outcome === 'rode_it_out' ? d.helpers : [],
    note: d.note.trim() ? d.note.trim() : null,
  };
}
