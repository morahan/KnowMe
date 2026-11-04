import { MIN_MOMENTS_FOR_PEAK, formatHour, formatWindow, hourBuckets, peakWindow } from './hours';

const at = (hour: number, day = 1) => new Date(2026, 10, day, hour, 15).toISOString();

describe('hours', () => {
  it('buckets by local hour', () => {
    expect(hourBuckets([at(20), at(20), at(8)])[20]).toBe(2);
  });

  it('has no peak until there are enough moments', () => {
    const few = Array.from({ length: MIN_MOMENTS_FOR_PEAK - 1 }, (_, i) => at(20, i + 1));
    expect(peakWindow(hourBuckets(few))).toBeNull();
  });

  it('finds the busiest 3-hour window and its share', () => {
    const w = peakWindow(hourBuckets([at(20), at(21), at(21), at(22), at(8)]))!;
    expect(w).toEqual({ start: 20, end: 23, count: 4, total: 5 });
    expect(formatWindow(w)).toBe('8pm to 11pm');
  });

  it('wraps past midnight', () => {
    const w = peakWindow(hourBuckets([at(23), at(23), at(0), at(1), at(1)]))!;
    expect(formatWindow(w)).toBe('11pm to 2am');
  });

  it('formats noon and midnight', () => {
    expect(formatHour(0)).toBe('12am');
    expect(formatHour(12)).toBe('12pm');
  });
});
