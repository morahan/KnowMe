import type { Habit, Moment, Reason } from '@/db/schema';
import { buildSummary, freeText } from './logic';

const habit: Habit = { id: 'h1', name: 'cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' };
const reasons: Reason[] = [{ id: 'r1', text: 'Sleep better', sort_order: 0 }];
const SECRET = 'my private note about Sam';

function moment(over: Partial<Moment>): Moment {
  return {
    id: 'm', habit_id: 'h1', created_at: new Date(2026, 10, 2, 21, 0).toISOString(), intensity: 6,
    context: 'home', feelings: ['bored'], outcome: 'rode_it_out', helpers: ['tea'], note: SECRET, is_demo: false, ...over,
  };
}

const moments = [moment({}), moment({ outcome: 'used', intensity: 8, helpers: [] })];

describe('buildSummary', () => {
  it('never includes raw notes when the toggle is off', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: false });
    expect(s.notes).toBeUndefined();
    expect(JSON.stringify(s)).not.toContain(SECRET);
  });

  it('includes notes only when the toggle is on', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: true });
    expect(s.notes).toEqual([SECRET, SECRET]);
  });

  it('counts outcomes, hours, intensity and helpers', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: false });
    expect(s.rodeItOut).toBe(1);
    expect(s.used).toBe(1);
    expect(s.byHour[21]).toBe(2);
    expect(s.averageIntensity).toBe(7);
    expect(s.topHelpers).toEqual(['tea']);
    expect(s.reasons).toEqual(['Sleep better']);
  });

  it('exposes every free-text field to the crisis guard', () => {
    const s = buildSummary({ habits: [habit], reasons, moments, days: 7, includeNotes: true });
    expect(freeText(s)).toEqual(['cannabis', 'Sleep better', SECRET, SECRET]);
  });
});
