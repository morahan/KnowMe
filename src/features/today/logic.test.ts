import { daysSinceLastUsed, momentHabitLabel } from './logic';
import { copy } from './copy';

it('uses singular day only for one day since last time', () => {
  expect(copy.daysSince(1)).toBe('day since last time');
  expect(copy.daysSince(0)).toBe('days since last time');
  expect(copy.daysSince(2)).toBe('days since last time');
});

const now = new Date(2026, 10, 10, 12, 0);

describe('daysSinceLastUsed', () => {
  it('counts from the last used moment', () => {
    expect(daysSinceLastUsed('2026-11-07T21:00:00', '2026-11-01T00:00:00', now)).toBe(3);
  });
  it('falls back to habit creation when never used', () => {
    expect(daysSinceLastUsed(null, '2026-11-01T00:00:00', now)).toBe(9);
  });
  it('is 0 when used today', () => {
    expect(daysSinceLastUsed('2026-11-10T08:00:00', '2026-11-01T00:00:00', now)).toBe(0);
  });
});

describe('momentHabitLabel', () => {
  const nicotine = { id: 'h1', name: 'Nicotine', kind: 'nicotine' as const, question: null, created_at: '2026-11-01T00:00:00' };
  const cannabis = { id: 'h2', name: 'Cannabis', kind: 'cannabis' as const, question: null, created_at: '2026-11-01T00:00:00' };
  const sugar = { id: 'h3', name: 'Sugar', kind: 'custom' as const, question: null, created_at: '2026-11-01T00:00:00' };

  it('is null when only one habit is tracked', () => {
    expect(momentHabitLabel({ habit_id: 'h1' }, [nicotine])).toBeNull();
  });
  it('names the tagged habit when multiple habits are tracked', () => {
    expect(momentHabitLabel({ habit_id: 'h1' }, [nicotine, cannabis])).toBe('Nicotine');
    expect(momentHabitLabel({ habit_id: 'h2' }, [nicotine, cannabis])).toBe('Cannabis');
    expect(momentHabitLabel({ habit_id: 'h3' }, [nicotine, sugar])).toBe('Sugar');
  });
  it('is null for a moment whose habit is no longer tracked', () => {
    expect(momentHabitLabel({ habit_id: 'gone' }, [nicotine, cannabis])).toBeNull();
  });
});
