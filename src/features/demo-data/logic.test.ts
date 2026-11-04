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

  it('eases intensity from 8s toward 5s with only a few used', () => {
    const early = moments.slice(0, 10).reduce((a, m) => a + m.intensity, 0) / 10;
    const late = moments.slice(-10).reduce((a, m) => a + m.intensity, 0) / 10;
    expect(early).toBeGreaterThan(late);
    const used = moments.filter((m) => m.outcome === 'used').length;
    expect(used).toBeGreaterThanOrEqual(1);
    expect(used).toBeLessThanOrEqual(8);
  });

  it('adds a few gambling moments on weekend evenings, social and bored', () => {
    const gambling = moments.filter((m) => m.habitKind === 'gambling');
    expect(gambling.length).toBeGreaterThanOrEqual(3);
    expect(gambling.length).toBeLessThanOrEqual(6);
    for (const m of gambling) {
      const at = new Date(m.created_at);
      expect([0, 6]).toContain(at.getDay());
      expect(at.getHours()).toBeGreaterThanOrEqual(19);
      expect(m.context).toBe('social');
      expect(m.feelings).toEqual(['bored']);
    }
    // The primary habit keeps the daily rhythm the gambling moments stand apart from.
    expect(moments.filter((m) => m.habitKind === null).length).toBeGreaterThan(gambling.length);
  });

  it('makes tea and walk the top helpers', () => {
    const counts = new Map<string, number>();
    for (const m of moments) for (const h of m.helpers) counts.set(h, (counts.get(h) ?? 0) + 1);
    const top2 = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => k).sort();
    expect(top2).toEqual(['tea', 'walk']);
  });
});
