import type { NewMoment } from '@/db/repos/moments';
import type { Context, Outcome } from '@/db/schema';

/** Custom tags stay short so chips do not crowd the group. The input allows more while typing. */
export const MAX_TAG_CHARS = 20;
export const CUSTOM_INPUT_MAX_CHARS = 40;
/** Both Other inputs get a full sentence, not just a word. Quick tags stay capped at MAX_TAG_CHARS. */
export const HELPER_INPUT_MAX_CHARS = 140;
export const FEELING_INPUT_MAX_CHARS = 140;
export const MAX_CUSTOM_TAGS = 3;

export type LogDraft = {
  habitId: string | null;
  intensity: number | null;
  context: Context;
  feelings: string[];
  outcome: Outcome;
  helpers: string[];
  note: string;
};

export const emptyDraft: LogDraft = {
  habitId: null, intensity: null, context: 'home', feelings: [], outcome: 'rode_it_out', helpers: [], note: '',
};

export function isReady(d: LogDraft): boolean {
  return d.habitId !== null && d.intensity !== null;
}

/** Trim, collapse spaces, and cap a typed word at tag length. */
export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_TAG_CHARS).trim();
}

/** True when typed text is longer than a tag, so a quick tag is worth offering. */
export function isLongCustomText(raw: string): boolean {
  return raw.trim().replace(/\s+/g, ' ').length > MAX_TAG_CHARS;
}

/** The 20 characters auto-filled from a long input. The person can edit them before saving. */
export function quickTagDraft(raw: string): string {
  return normalizeTag(raw);
}

/** Tag to add: the edited quick tag when saving for quick tagging, else the auto-filled one. */
export function resolveCustomTag(raw: string, saveForQuickTagging: boolean, quickTagText: string): string {
  return saveForQuickTagging ? normalizeTag(quickTagText) : normalizeTag(raw);
}

export function isCustomTag(tag: string, presets: readonly string[]): boolean {
  return !presets.some((p) => p.toLowerCase() === tag.toLowerCase());
}

export function customTags(tags: readonly string[], presets: readonly string[]): string[] {
  return tags.filter((t) => isCustomTag(t, presets));
}

export function canAddCustomTag(tags: readonly string[], presets: readonly string[]): boolean {
  return customTags(tags, presets).length < MAX_CUSTOM_TAGS;
}

/**
 * Add typed text as a tag. A word matching a preset selects that preset
 * instead of duplicating it. At the custom-tag max the list is unchanged,
 * so the caller can ask the person to remove one first. Never stores `other`.
 */
export function addCustomTag(tags: readonly string[], raw: string, presets: readonly string[]): string[] {
  const tag = normalizeTag(raw);
  if (!tag || tag.toLowerCase() === 'other') return [...tags];
  const preset = presets.find((p) => p.toLowerCase() === tag.toLowerCase() && p !== 'other');
  if (preset) return tags.includes(preset) ? [...tags] : [...tags, preset];
  if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return [...tags];
  if (!canAddCustomTag(tags, presets)) return [...tags];
  return [...tags, tag];
}

export function removeTag(tags: readonly string[], tag: string): string[] {
  return tags.filter((t) => t !== tag);
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
