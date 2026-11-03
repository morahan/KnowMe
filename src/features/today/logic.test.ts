import { daysSinceLastUsed } from './logic';

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
