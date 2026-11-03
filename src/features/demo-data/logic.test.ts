import { generateDemoMoments } from './logic';

describe('generateDemoMoments', () => {
  const now = new Date(2026, 10, 3, 23, 0);
  const moments = generateDemoMoments(now);

  it('is deterministic', () => {
    expect(generateDemoMoments(now)).toEqual(moments);
  });

  it('stays within the last 21 days and never in the future', () => {
    const earliest = new Date(2026, 9, 14).getTime();
    for (const m of moments) {
      const t = new Date(m.created_at).getTime();
      expect(t).toBeGreaterThanOrEqual(earliest);
      expect(t).toBeLessThanOrEqual(now.getTime());
    }
  });

  it('puts most cravings between 7 and 10pm', () => {
    const evening = moments.filter((m) => new Date(m.created_at).getHours() >= 19).length;
    expect(evening / moments.length).toBeGreaterThan(0.5);
  });

  it('only has helpers on rode-it-out moments', () => {
    for (const m of moments) if (m.outcome === 'used') expect(m.helpers).toEqual([]);
  });
});
