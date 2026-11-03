import { FEELINGS, HELPERS } from '@/db/schema';
import {
  CUSTOM_INPUT_MAX_CHARS, MAX_CUSTOM_TAGS, MAX_TAG_CHARS, addCustomTag, canAddCustomTag, customTags,
  emptyDraft, isReady, normalizeTag, removeTag, toNewMoment,
} from './logic';

describe('log draft', () => {
  it('needs a habit and an intensity', () => {
    expect(isReady(emptyDraft)).toBe(false);
    expect(isReady({ ...emptyDraft, habitId: 'h1' })).toBe(false);
    expect(isReady({ ...emptyDraft, habitId: 'h1', intensity: 6 })).toBe(true);
  });

  it('drops helpers on a used moment and trims the note', () => {
    const m = toNewMoment({ ...emptyDraft, habitId: 'h1', intensity: 8, outcome: 'used', helpers: ['tea'], note: '  after work ' });
    expect(m.helpers).toEqual([]);
    expect(m.note).toBe('after work');
  });

  it('stores an empty note as null', () => {
    expect(toNewMoment({ ...emptyDraft, habitId: 'h1', intensity: 3 }).note).toBeNull();
  });

  it('keeps custom tags on the saved moment', () => {
    const m = toNewMoment({ ...emptyDraft, habitId: 'h1', intensity: 3, feelings: ['bored', 'antsy'], helpers: ['cold water'] });
    expect(m.feelings).toEqual(['bored', 'antsy']);
    expect(m.helpers).toEqual(['cold water']);
  });
});

describe('custom tags', () => {
  it('caps tag length below the input length', () => {
    expect(MAX_TAG_CHARS).toBe(20);
    expect(CUSTOM_INPUT_MAX_CHARS).toBeGreaterThan(MAX_TAG_CHARS);
    expect(normalizeTag('  watching   the sunset with friends  ')).toBe('watching the sunset');
    expect(normalizeTag('a very long custom tag here')).toBe('a very long custom t');
    expect(normalizeTag('a very long custom tag here').length).toBe(MAX_TAG_CHARS);
  });

  it('adds a typed word as a custom tag', () => {
    expect(addCustomTag(['bored'], '  Antsy ', FEELINGS)).toEqual(['bored', 'Antsy']);
    expect(customTags(['bored', 'Antsy'], FEELINGS)).toEqual(['Antsy']);
  });

  it('never stores other and maps a preset word to the preset', () => {
    expect(addCustomTag([], 'other', FEELINGS)).toEqual([]);
    expect(addCustomTag([], 'BORED', FEELINGS)).toEqual(['bored']);
    expect(addCustomTag(['bored'], 'bored', FEELINGS)).toEqual(['bored']);
  });

  it('does not duplicate a custom tag', () => {
    expect(addCustomTag(['Antsy'], 'antsy', FEELINGS)).toEqual(['Antsy']);
    expect(addCustomTag([], '   ', FEELINGS)).toEqual([]);
  });

  it('stops at the custom-tag max until one is removed', () => {
    let tags: string[] = [];
    tags = addCustomTag(tags, 'antsy', FEELINGS);
    tags = addCustomTag(tags, 'wired', FEELINGS);
    tags = addCustomTag(tags, 'itchy', FEELINGS);
    expect(tags).toHaveLength(MAX_CUSTOM_TAGS);
    expect(canAddCustomTag(tags, FEELINGS)).toBe(false);
    expect(addCustomTag(tags, 'extra', FEELINGS)).toEqual(tags);
    const replaced = addCustomTag(removeTag(tags, 'wired'), 'extra', FEELINGS);
    expect(replaced).toEqual(['antsy', 'itchy', 'extra']);
  });

  it('preset picks do not count toward the custom max', () => {
    expect(canAddCustomTag(['bored', 'stressed', 'tired', 'lonely'], FEELINGS)).toBe(true);
    expect(addCustomTag(['tea'], 'cold water', HELPERS)).toEqual(['tea', 'cold water']);
  });
});
