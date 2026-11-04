import type { Habit, Moment } from '@/db/schema';
import { formatCountdown, needsHabitPick, resolveHabit, secondsUntil, topHelpers, topHelpersForHabit } from './logic';

const m = (outcome: Moment['outcome'], helpers: Moment['helpers']): Moment => ({
  id: 'x', habit_id: 'h1', created_at: '2026-11-01T20:00:00.000Z', intensity: 6, context: 'home',
  feelings: [], outcome, helpers, note: null, is_demo: false,
});

describe('topHelpers', () => {
  it('ranks by rode-it-out count and ignores used moments', () => {
    const moments = [m('rode_it_out', ['tea']), m('rode_it_out', ['tea', 'walk']), m('used', ['music'])];
    expect(topHelpers(moments)).toEqual(['tea', 'walk']);
  });
  it('is empty with no rode-it-out moments', () => {
    expect(topHelpers([m('used', [])])).toEqual([]);
  });
});

const habit = (id: string, name: string): Habit => ({ id, name, kind: 'custom', question: null, created_at: '2026-11-01T00:00:00.000Z' });
const nicotine = habit('h-nic', 'Nicotine');
const cannabis = habit('h-can', 'Cannabis');

const tagged = (habitId: string, outcome: Moment['outcome'], helpers: Moment['helpers']): Moment => ({
  ...m(outcome, helpers),
  habit_id: habitId,
});

describe('needsHabitPick / resolveHabit', () => {
  it('skips the pick with a single tracked habit', () => {
    expect(needsHabitPick([nicotine], null)).toBe(false);
    expect(resolveHabit([nicotine], null)).toBe(nicotine);
  });
  it('asks only when tracking more than one', () => {
    expect(needsHabitPick([nicotine, cannabis], null)).toBe(true);
    expect(resolveHabit([nicotine, cannabis], null)).toBeNull();
  });
  it('resolves to the picked habit', () => {
    expect(needsHabitPick([nicotine, cannabis], cannabis.id)).toBe(false);
    expect(resolveHabit([nicotine, cannabis], cannabis.id)).toBe(cannabis);
  });
  it('needs no pick and resolves to nothing with no habits', () => {
    expect(needsHabitPick([], null)).toBe(false);
    expect(resolveHabit([], null)).toBeNull();
  });
  it('treats a stale pick as no pick', () => {
    expect(resolveHabit([nicotine, cannabis], 'gone')).toBeNull();
    expect(needsHabitPick([nicotine, cannabis], 'gone')).toBe(true);
  });
});

describe('topHelpersForHabit', () => {
  it('only counts moments tagged with that habit', () => {
    const moments = [
      tagged(nicotine.id, 'rode_it_out', ['tea']),
      tagged(nicotine.id, 'rode_it_out', ['tea', 'walk']),
      tagged(cannabis.id, 'rode_it_out', ['music', 'music']),
    ];
    expect(topHelpersForHabit(moments, nicotine.id)).toEqual(['tea', 'walk']);
    expect(topHelpersForHabit(moments, cannabis.id)).toEqual(['music']);
  });
  it('counts every moment when no habit is picked yet', () => {
    const moments = [tagged(nicotine.id, 'rode_it_out', ['tea']), tagged(cannabis.id, 'rode_it_out', ['walk'])];
    expect(topHelpersForHabit(moments, null)).toEqual(['tea', 'walk']);
  });
});

describe('formatCountdown', () => {
  it('formats mm:ss and clamps at zero', () => {
    expect(formatCountdown(20 * 60)).toBe('20:00');
    expect(formatCountdown(65)).toBe('1:05');
    expect(formatCountdown(-5)).toBe('0:00');
  });
});

describe('secondsUntil', () => {
  it('rounds up, and stops at zero', () => {
    expect(secondsUntil(10_000, 0)).toBe(10);
    expect(secondsUntil(10_000, 1)).toBe(10);
    expect(secondsUntil(10_000, 1000)).toBe(9);
    expect(secondsUntil(10_000, 10_000)).toBe(0);
    expect(secondsUntil(10_000, 99_000)).toBe(0);
  });
});
