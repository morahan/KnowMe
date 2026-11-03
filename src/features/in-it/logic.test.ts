import type { Moment } from '@/db/schema';
import { formatCountdown, topHelpers } from './logic';

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

describe('formatCountdown', () => {
  it('formats mm:ss and clamps at zero', () => {
    expect(formatCountdown(20 * 60)).toBe('20:00');
    expect(formatCountdown(65)).toBe('1:05');
    expect(formatCountdown(-5)).toBe('0:00');
  });
});
