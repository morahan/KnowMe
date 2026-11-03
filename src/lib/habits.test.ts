import { cleanCustomHabitNames, cleanHabitName, isTrackedKind, isTrackedName, resolveHabitId } from './habits';

describe('cleanHabitName', () => {
  it('trims and collapses spaces', () => {
    expect(cleanHabitName('  late night   scrolling ')).toBe('late night scrolling');
    expect(cleanHabitName('   ')).toBe('');
  });
});

describe('cleanCustomHabitNames', () => {
  it('keeps several customs, in order, with their own casing', () => {
    expect(cleanCustomHabitNames(['Scrolling', ' Sugar ', 'Gaming'])).toEqual(['Scrolling', 'Sugar', 'Gaming']);
  });

  it('drops empties, repeats, and names already tracked in any casing', () => {
    const existing = [{ name: 'Cannabis' }];
    expect(cleanCustomHabitNames(['cannabis', 'Sugar', ' sugar ', '', 'Gaming'], existing)).toEqual(['Sugar', 'Gaming']);
    expect(cleanCustomHabitNames(['CANNABIS'], existing)).toEqual([]);
  });

  it('allows a custom name that shares no name with a tracked habit', () => {
    expect(cleanCustomHabitNames(['Weed'], [{ name: 'Cannabis' }])).toEqual(['Weed']);
  });
});

describe('tracked checks', () => {
  it('matches names case-insensitively and preset kinds by kind', () => {
    expect(isTrackedName('sugar', [{ name: 'Sugar' }])).toBe(true);
    expect(isTrackedName('sugar', [{ name: 'Gaming' }])).toBe(false);
    expect(isTrackedName('  ', [{ name: 'Sugar' }])).toBe(false);
    expect(isTrackedKind('nicotine', [{ kind: 'nicotine' }])).toBe(true);
    expect(isTrackedKind('custom', [{ kind: 'custom' }])).toBe(false);
  });
});

describe('resolveHabitId', () => {
  const habits = [{ id: 'h1' }, { id: 'h2' }, { id: 'h3' }];

  it('keeps the current pick while it exists, so tapping another habit sticks', () => {
    expect(resolveHabitId(habits, 'h2')).toBe('h2');
  });

  it('falls back to the first habit when the pick was removed or never set', () => {
    expect(resolveHabitId(habits, 'gone')).toBe('h1');
    expect(resolveHabitId(habits, null)).toBe('h1');
    expect(resolveHabitId([], 'h1')).toBeNull();
  });
});
