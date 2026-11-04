import { PRESET_HABITS, cleanCustomHabitNames, cleanHabitName, habitLabel, isTrackedKind, isTrackedName, renamedHabitName, resolveHabitId } from './habits';

describe('PRESET_HABITS', () => {
  it('offers the three substances plus Gambling as the one behavioral preset', () => {
    expect(PRESET_HABITS.map((p) => p.label)).toEqual(['Alcohol', 'Cannabis', 'Gambling', 'Nicotine']);
    expect(PRESET_HABITS.map((p) => p.kind)).toEqual(['alcohol', 'cannabis', 'gambling', 'nicotine']);
    expect(PRESET_HABITS.map((p) => p.category)).toEqual(['substance', 'substance', 'behavior', 'substance']);
  });
});

describe('habitLabel', () => {
  it('shows the preset label even when the stored name is lowercase', () => {
    expect(habitLabel({ name: 'cannabis', kind: 'cannabis' })).toBe('Cannabis');
    expect(habitLabel({ name: 'nicotine', kind: 'nicotine' })).toBe('Nicotine');
    expect(habitLabel({ name: 'alcohol', kind: 'alcohol' })).toBe('Alcohol');
    expect(habitLabel({ name: 'gambling', kind: 'gambling' })).toBe('Gambling');
  });
  it('shows a cleaned custom name in its own casing', () => {
    expect(habitLabel({ name: '  late night   scrolling ', kind: 'custom' })).toBe('late night scrolling');
    expect(habitLabel({ name: 'Sugar', kind: 'custom' })).toBe('Sugar');
  });
  it('shows a renamed preset in the new words, everywhere', () => {
    expect(habitLabel({ name: 'Vaping', kind: 'nicotine' })).toBe('Vaping');
    expect(habitLabel({ name: 'Beer', kind: 'alcohol' })).toBe('Beer');
    expect(habitLabel({ name: 'Gambling', kind: 'gambling' })).toBe('Gambling');
  });
});

describe('renamedHabitName', () => {
  const tracked = [
    { id: 'h1', name: 'Nicotine', kind: 'nicotine' as const },
    { id: 'h2', name: 'Gambling', kind: 'gambling' as const },
    { id: 'h3', name: 'Sugar', kind: 'custom' as const },
  ];
  it('cleans the new name', () => {
    expect(renamedHabitName('  Vaping  ', tracked, 'h1')).toBe('Vaping');
    expect(renamedHabitName('Nicotine', tracked, 'h1')).toBe('Nicotine');
    expect(renamedHabitName('Gambling', tracked, 'h1')).toBeNull();
  });
  it('rejects empty, another tracked name, and another preset label', () => {
    expect(renamedHabitName('   ', tracked, 'h1')).toBeNull();
    expect(renamedHabitName('sugar', tracked, 'h1')).toBeNull();
    expect(renamedHabitName('Alcohol', tracked, 'h1')).toBeNull();
    expect(renamedHabitName('Beer', tracked, 'h1')).toBe('Beer');
  });
});

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
