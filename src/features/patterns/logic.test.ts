import type { Moment } from '@/db/schema';
import { byHour, helperSuccess, intensityByDay, intensityInsight, peakHourLabel, rideOutRate } from './logic';

const m = (over: Partial<Moment>): Moment => ({
  id: 'x', habit_id: 'h1', created_at: '2026-11-01T20:00:00.000Z', intensity: 6, context: 'home',
  feelings: ['bored'], outcome: 'rode_it_out', helpers: ['tea'], note: null, is_demo: false, ...over,
});
const at = (day: number, hour: number, over: Partial<Moment> = {}): Moment =>
  m({ created_at: new Date(2026, 10, day, hour, 15).toISOString(), ...over });

describe('intensityByDay', () => {
  it('averages per day and leaves gaps null', () => {
    const pts = intensityByDay([at(9, 20, { intensity: 8 }), at(9, 21, { intensity: 6 })], 3, new Date(2026, 10, 10, 12));
    expect(pts.map((p) => p.avg)).toEqual([null, 7, null]);
    expect(pts[1]!.count).toBe(2);
  });
});

describe('byHour / peakHourLabel', () => {
  it('finds the evening peak', () => {
    const moments = [at(1, 20), at(2, 21), at(3, 8)];
    expect(byHour(moments)[20]).toBe(1);
    expect(peakHourLabel(moments)).toBe('Most of your cravings land between 7pm and 10pm.');
    expect(peakHourLabel([])).toBeNull();
  });
});

describe('rideOutRate / helperSuccess', () => {
  it('computes the rate and per-helper success', () => {
    const moments = [
      m({ outcome: 'rode_it_out', helpers: ['tea'] }),
      m({ outcome: 'rode_it_out', helpers: ['tea', 'walk'] }),
      m({ outcome: 'used', helpers: ['tea'] }),
      m({ outcome: 'used', helpers: [] }),
    ];
    expect(rideOutRate(moments)).toBe(0.5);
    expect(rideOutRate([])).toBeNull();
    // walk seen once -> excluded; tea 2 of 3 rode out
    expect(helperSuccess(moments)).toEqual([{ name: 'tea', rate: 2 / 3, count: 3 }]);
  });
});

describe('intensityInsight', () => {
  it('describes a downward drift in plain words', () => {
    const pts = intensityByDay([at(1, 20, { intensity: 8 }), at(9, 20, { intensity: 5 })], 10, new Date(2026, 10, 10, 12));
    expect(intensityInsight(pts)).toContain('drifting down');
  });
});
