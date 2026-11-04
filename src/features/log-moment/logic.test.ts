import { FEELINGS, HELPERS } from '@/db/schema';
import {
  CUSTOM_INPUT_MAX_CHARS, FEELING_INPUT_MAX_CHARS, HELPER_INPUT_MAX_CHARS, MAX_CUSTOM_TAGS, MAX_TAG_CHARS,
  addCustomTag, canAddCustomTag, customTags, defaultTags, emptyDraft, isLongCustomText, isReady, normalizeTag,
  parseStoredTags, quickTagDraft, removeTag, renameTag, resolveCustomTag, toNewMoment,
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

describe('preset tags', () => {
  it('defaults to the presets without the Other entry', () => {
    expect(defaultTags(FEELINGS)).toEqual(['bored', 'celebrating', 'lonely', 'restless', 'stressed', 'tired']);
    expect(defaultTags(HELPERS)).toEqual(['call someone', 'food', 'game', 'music', 'shower', 'tea', 'walk']);
    expect(defaultTags(HELPERS)).not.toContain('other');
  });

  it('renames a preset in place, keeping its spot', () => {
    expect(renameTag(['bored', 'stressed'], 'bored', '  flat  ')).toEqual(['flat', 'stressed']);
    expect(renameTag(['tea', 'walk'], 'walk', 'short walk')).toEqual(['tea', 'short walk']);
  });

  it('will not rename to empty, other, or a tag already there', () => {
    expect(renameTag(['bored', 'stressed'], 'bored', '   ')).toEqual(['bored', 'stressed']);
    expect(renameTag(['bored', 'stressed'], 'bored', 'other')).toEqual(['bored', 'stressed']);
    expect(renameTag(['bored', 'stressed'], 'bored', 'STRESSED')).toEqual(['bored', 'stressed']);
    expect(renameTag(['bored'], 'gone', 'flat')).toEqual(['bored']);
  });

  it('removes a preset tag', () => {
    expect(removeTag(['bored', 'tired'], 'tired')).toEqual(['bored']);
  });

  it('reads stored tags and falls back to defaults when unreadable', () => {
    expect(parseStoredTags('["flat","stressed"]', FEELINGS)).toEqual(['flat', 'stressed']);
    expect(parseStoredTags('[]', FEELINGS)).toEqual([]);
    expect(parseStoredTags(null, FEELINGS)).toEqual(defaultTags(FEELINGS));
    expect(parseStoredTags('not json', FEELINGS)).toEqual(defaultTags(FEELINGS));
    expect(parseStoredTags('["flat","FLAT","other",""]', FEELINGS)).toEqual(['flat']);
  });
});

describe('what helped long input', () => {
  const longHelper =
    'Sat on the porch with a cup of tea and called my sister, talked it through until the craving passed and I felt steady again tonight';

  it('allows 140 characters for what helped', () => {
    expect(HELPER_INPUT_MAX_CHARS).toBe(140);
    expect(longHelper.length).toBeLessThanOrEqual(HELPER_INPUT_MAX_CHARS);
    expect(isLongCustomText(longHelper)).toBe(true);
    expect(isLongCustomText('cold water')).toBe(false);
    expect(isLongCustomText('12345678901234567890')).toBe(false);
    expect(isLongCustomText('123456789012345678901')).toBe(true);
  });

  it('auto-fills the first 20 characters as the quick tag', () => {
    expect(quickTagDraft(longHelper)).toBe('Sat on the porch wit');
    expect(quickTagDraft(longHelper).length).toBe(MAX_TAG_CHARS);
  });

  it('uses the customized quick tag when saving for quick tagging', () => {
    expect(resolveCustomTag(longHelper, false, 'porch + sister')).toBe('Sat on the porch wit');
    expect(resolveCustomTag(longHelper, true, 'porch + sister')).toBe('porch + sister');
    expect(resolveCustomTag(longHelper, true, '  porch   +  sister call  ')).toBe('porch + sister call');
    expect(resolveCustomTag(longHelper, true, 'a very long custom tag here')).toBe('a very long custom t');
  });

  it('adds the customized quick tag, not the long text, to helpers', () => {
    const tag = resolveCustomTag(longHelper, true, 'porch + sister');
    expect(addCustomTag(['tea'], tag, HELPERS)).toEqual(['tea', 'porch + sister']);
    expect(addCustomTag([], resolveCustomTag(longHelper, true, '   '), HELPERS)).toEqual([]);
  });
});

describe('what is going on long input', () => {
  const longFeeling = 'Antsy and wired all morning, could not sit still at all and kept checking my phone every few minutes';

  it('allows 140 characters for what is going on', () => {
    expect(FEELING_INPUT_MAX_CHARS).toBe(140);
    expect(longFeeling.length).toBeLessThanOrEqual(FEELING_INPUT_MAX_CHARS);
    expect(isLongCustomText(longFeeling)).toBe(true);
  });

  it('auto-fills and customizes the 20-char quick tag for feelings', () => {
    expect(quickTagDraft(longFeeling)).toBe('Antsy and wired all');
    const tag = resolveCustomTag(longFeeling, true, 'wired all morning');
    expect(tag).toBe('wired all morning');
    expect(addCustomTag(['bored'], tag, FEELINGS)).toEqual(['bored', 'wired all morning']);
    expect(addCustomTag([], resolveCustomTag(longFeeling, false, 'wired all morning'), FEELINGS)).toEqual([
      'Antsy and wired all',
    ]);
  });
});
