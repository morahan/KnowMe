import type { Moment } from '@/db/schema';
import {
  MAX_VISIBLE_HABITS, byHour, byHourByHabit, displayMoments, formatDayLabel, helperRodeByHabit, intensityByDay, intensityByDayByHabit, intensityChartContentWidth, intensityInsight, intensityPointX, peakHourLabel, resolveVisibleHabitIds, rideOutRate, sampleMoments, toggleVisibleHabitId, topContextsByHabit, topHelpers, topFeelingsByHabit,
} from './logic';

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

  it('spans only the logged days by default, so day one is the first point', () => {
    const pts = intensityByDay([at(9, 20, { intensity: 8 })]);
    expect(pts).toHaveLength(1);
    expect(pts[0]).toMatchObject({ date: '2026-11-09', avg: 8, count: 1 });
  });

  it('keeps gaps inside the logged range but adds none before or after it', () => {
    const pts = intensityByDay([at(1, 20, { intensity: 8 }), at(4, 20, { intensity: 5 })]);
    expect(pts.map((p) => p.date)).toEqual(['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04']);
    expect(pts.map((p) => p.avg)).toEqual([8, null, null, 5]);
  });

  it('marks only the tracked days when days are skipped (day one and day seven)', () => {
    const pts = intensityByDay([at(1, 20, { intensity: 8 }), at(7, 20, { intensity: 5 })]);
    expect(pts).toHaveLength(7);
    expect(pts.map((p) => p.avg)).toEqual([8, null, null, null, null, null, 5]);
    expect(pts.filter((p) => p.avg !== null)).toHaveLength(2);
  });

  it('returns no points when there are no moments', () => {
    expect(intensityByDay([])).toEqual([]);
  });
});

describe('intensityByDayByHabit', () => {
  it('averages each behavior separately within a day', () => {
    const moments = [
      at(9, 8, { habit_id: 'h1', intensity: 8 }),
      at(9, 9, { habit_id: 'h1', intensity: 6 }),
      at(9, 10, { habit_id: 'h1', intensity: 10 }),
      at(9, 11, { habit_id: 'h1', intensity: 4 }),
      at(9, 12, { habit_id: 'h1', intensity: 7 }),
      at(9, 13, { habit_id: 'h2', intensity: 3 }),
    ];
    const series = intensityByDayByHabit(moments, ['h1', 'h2']);
    expect(series.map((s) => s.habitId)).toEqual(['h1', 'h2']);
    // Five h1 logs on one day average into one point; h2 keeps its own.
    expect(series[0]!.points).toEqual([{ date: '2026-11-09', avg: 7, count: 5 }]);
    expect(series[1]!.points).toEqual([{ date: '2026-11-09', avg: 3, count: 1 }]);
  });

  it('shares one date axis and leaves per-behavior gaps null', () => {
    const moments = [
      at(1, 20, { habit_id: 'h1', intensity: 8 }),
      at(3, 20, { habit_id: 'h2', intensity: 4 }),
    ];
    const series = intensityByDayByHabit(moments, ['h1', 'h2']);
    expect(series[0]!.points.map((p) => p.date)).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(series[1]!.points.map((p) => p.date)).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
    expect(series[0]!.points.map((p) => p.avg)).toEqual([8, null, null]);
    expect(series[1]!.points.map((p) => p.avg)).toEqual([null, null, 4]);
  });

  it('orders series by the tracked list, skips habits with no logs, and keeps unknown ids', () => {
    const moments = [
      at(2, 20, { habit_id: 'h2', intensity: 5 }),
      at(2, 21, { habit_id: 'gone', intensity: 9 }),
    ];
    const series = intensityByDayByHabit(moments, ['h1', 'h2']);
    expect(series.map((s) => s.habitId)).toEqual(['h2', 'gone']);
    expect(intensityByDayByHabit([], ['h1'])).toEqual([]);
  });
});

describe('visible habits (three at a time)', () => {
  const ids = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];

  it('shows the first three by default', () => {
    expect(MAX_VISIBLE_HABITS).toBe(3);
    expect(resolveVisibleHabitIds(null, ids)).toEqual(['h1', 'h2', 'h3']);
    expect(resolveVisibleHabitIds(null, ids.slice(0, 2))).toEqual(['h1', 'h2']);
  });

  it('keeps a valid pick and drops ids that no longer exist', () => {
    expect(resolveVisibleHabitIds(['h5', 'h2'], ids)).toEqual(['h2', 'h5']);
    expect(resolveVisibleHabitIds(['gone'], ids)).toEqual(['h1', 'h2', 'h3']);
  });

  it('toggles a behavior off, then lets another take its place', () => {
    const off = toggleVisibleHabitId(['h1', 'h2', 'h3'], 'h2', ids);
    expect(off).toEqual(['h1', 'h3']);
    expect(toggleVisibleHabitId(off, 'h6', ids)).toEqual(['h1', 'h3', 'h6']);
  });

  it('never shows a fourth, and never hides the last visible one', () => {
    expect(toggleVisibleHabitId(['h1', 'h2', 'h3'], 'h4', ids)).toEqual(['h1', 'h2', 'h3']);
    expect(toggleVisibleHabitId(['h4'], 'h4', ids)).toEqual(['h4']);
    expect(toggleVisibleHabitId(['h1'], 'gone', ids)).toEqual(['h1']);
  });
});

describe('per-behavior charts', () => {
  it('splits cravings by hour per behavior, in the given order', () => {
    const moments = [at(1, 20, { habit_id: 'h2' }), at(1, 20, { habit_id: 'h1' }), at(2, 21, { habit_id: 'h1' })];
    const series = byHourByHabit(moments, ['h1', 'h2']);
    expect(series.map((s) => s.habitId)).toEqual(['h1', 'h2']);
    expect(series[0]!.buckets[20]).toBe(1);
    expect(series[0]!.buckets[21]).toBe(1);
    expect(series[1]!.buckets[20]).toBe(1);
    expect(series.reduce((n, s) => n + s.buckets.reduce((a, b) => a + b, 0), 0)).toBe(3);
  });

  it('splits top contexts and feelings per behavior', () => {
    const moments = [
      m({ habit_id: 'h1', context: 'home', feelings: ['bored'] }),
      m({ habit_id: 'h2', context: 'home', feelings: ['bored', 'tired'] }),
      m({ habit_id: 'h2', context: 'work', feelings: ['tired'] }),
    ];
    expect(topContextsByHabit(moments, ['h1', 'h2'])).toEqual([
      { name: 'home', count: 2, byHabit: [{ habitId: 'h1', value: 1 }, { habitId: 'h2', value: 1 }] },
      { name: 'work', count: 1, byHabit: [{ habitId: 'h2', value: 1 }] },
    ]);
    expect(topFeelingsByHabit(moments, ['h1', 'h2'])[0]).toEqual({
      name: 'bored', count: 2, byHabit: [{ habitId: 'h1', value: 1 }, { habitId: 'h2', value: 1 }],
    });
  });

  it('counts rode-out helpers per behavior', () => {
    const moments = [
      m({ habit_id: 'h1', outcome: 'rode_it_out', helpers: ['tea'] }),
      m({ habit_id: 'h2', outcome: 'rode_it_out', helpers: ['tea'] }),
      m({ habit_id: 'h2', outcome: 'used', helpers: ['tea'] }),
    ];
    expect(helperRodeByHabit(moments, ['h1', 'h2'])).toEqual({
      tea: [{ habitId: 'h1', value: 1 }, { habitId: 'h2', value: 1 }],
    });
  });
});

describe('intensity chart geometry', () => {
  it('places a lone day-one point at the left inset, fully inside the plot', () => {
    expect(intensityPointX(0, 1, 320, 16)).toBe(16);
  });

  it('insets the first and last points from both edges', () => {
    expect(intensityPointX(0, 10, 320, 16)).toBe(16);
    expect(intensityPointX(9, 10, 320, 16)).toBe(304);
  });

  it('fits a month of days to the viewport, then grows scrollable past it', () => {
    expect(intensityChartContentWidth(1, 320, 16)).toBe(320);
    expect(intensityChartContentWidth(30, 320, 16)).toBe(320);
    expect(intensityChartContentWidth(31, 320, 16)).toBeGreaterThan(320);
    // 60 days keeps the fit month's spacing: two fit-widths minus the shared edges.
    expect(intensityChartContentWidth(60, 320, 16)).toBeCloseTo(32 + 59 * (288 / 29));
  });
});

describe('byHour / peakHourLabel', () => {
  it('finds the evening peak once there are enough moments', () => {
    const moments = [at(1, 20), at(2, 21), at(3, 21), at(4, 22), at(5, 8)];
    expect(byHour(moments)[20]).toBe(1);
    expect(peakHourLabel(moments)).toBe('Most of your cravings land between 8pm and 11pm.');
    expect(peakHourLabel([])).toBeNull();
  });

  it('says nothing about hours from only a couple of moments', () => {
    expect(peakHourLabel([at(1, 23), at(1, 23)])).toBeNull();
  });

  it('does not say "most" when the busiest window holds half or less', () => {
    const moments = [at(1, 8), at(2, 9), at(3, 13), at(4, 16), at(5, 20), at(6, 22)];
    expect(peakHourLabel(moments)).toMatch(/^Your cravings show up most between /);
  });
});

describe('rideOutRate / topHelpers', () => {
  it('computes the rate and counts helpers on rode-out moments', () => {
    const moments = [
      m({ outcome: 'rode_it_out', helpers: ['tea'] }),
      m({ outcome: 'rode_it_out', helpers: ['tea', 'walk'] }),
      m({ outcome: 'used', helpers: ['tea'] }),
      m({ outcome: 'used', helpers: [] }),
    ];
    expect(rideOutRate(moments)).toBe(0.5);
    expect(rideOutRate([])).toBeNull();
    // Only rode-out moments count; the used moment's tea is not a helper.
    expect(topHelpers(moments)).toEqual([
      { name: 'tea', count: 2 },
      { name: 'walk', count: 1 },
    ]);
  });
});

describe('displayMoments / sampleMoments', () => {
  const now = new Date(2026, 10, 10, 12);

  it('shows sample data when there are no moments at all', () => {
    const display = displayMoments([], now);
    expect(display.isSample).toBe(true);
    expect(display.moments.length).toBeGreaterThan(0);
    expect(display.moments.every((x) => x.is_demo)).toBe(true);
  });

  it('charts loaded demo moments instead of the sample', () => {
    const demo = m({ id: 'demo-1', is_demo: true });
    const display = displayMoments([demo], now);
    expect(display.isSample).toBe(false);
    expect(display.moments).toEqual([demo]);
  });

  it('keeps demo moments alongside real ones, as Today and Reflect do', () => {
    const demo = m({ id: 'demo-1', is_demo: true });
    const real = m({ id: 'real-1' });
    const display = displayMoments([demo, real], now);
    expect(display.isSample).toBe(false);
    expect(display.moments).toEqual([demo, real]);
  });

  it('builds deterministic sample moments with unique ids', () => {
    const sample = sampleMoments(now);
    expect(sample).toEqual(sampleMoments(now));
    expect(new Set(sample.map((x) => x.id)).size).toBe(sample.length);
    expect(sample.every((x) => x.habit_id === 'sample')).toBe(true);
  });
});

describe('formatDayLabel', () => {
  it('formats an ISO date for a chart axis', () => {
    expect(formatDayLabel('2026-11-03')).toBe('Nov 3');
    expect(formatDayLabel('2026-01-30')).toBe('Jan 30');
    expect(formatDayLabel('not-a-date')).toBe('not-a-date');
  });
});

describe('intensityInsight', () => {
  it('describes a downward drift in plain words', () => {
    const pts = intensityByDay([at(1, 20, { intensity: 8 }), at(9, 20, { intensity: 5 })], 10, new Date(2026, 10, 10, 12));
    expect(intensityInsight(pts)).toContain('drifting down');
  });

  it('uses whole numbers at both ends', () => {
    const pts = intensityByDay(
      [at(1, 20, { intensity: 9 }), at(9, 20, { intensity: 5 }), at(9, 21, { intensity: 4 }), at(9, 22, { intensity: 5 })],
      10,
      new Date(2026, 10, 10, 12),
    );
    expect(intensityInsight(pts)).toBe('Intensity is drifting down, from around 9 toward 5.');
  });
});
