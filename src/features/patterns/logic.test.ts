import type { Moment } from '@/db/schema';
import {
  byHour, displayMoments, formatDayLabel, helperSuccess, intensityByDay, intensityChartContentWidth, intensityInsight, intensityPointX, peakHourLabel, rideOutRate, sampleMoments,
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

  it('returns no points when there are no moments', () => {
    expect(intensityByDay([])).toEqual([]);
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

describe('displayMoments / sampleMoments', () => {
  const now = new Date(2026, 10, 10, 12);

  it('shows sample data when there are no moments at all', () => {
    const display = displayMoments([], now);
    expect(display.isSample).toBe(true);
    expect(display.moments.length).toBeGreaterThan(0);
    expect(display.moments.every((x) => x.is_demo)).toBe(true);
  });

  it('still shows sample data when only demo moments exist', () => {
    const display = displayMoments([m({ is_demo: true })], now);
    expect(display.isSample).toBe(true);
  });

  it('replaces sample data with real logs after the first real moment', () => {
    const real = m({ id: 'real-1' });
    const display = displayMoments([m({ id: 'demo-1', is_demo: true }), real], now);
    expect(display.isSample).toBe(false);
    expect(display.moments).toEqual([real]);
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
});
