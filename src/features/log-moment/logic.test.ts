import { emptyDraft, isReady, toNewMoment } from './logic';

describe('log draft', () => {
  it('needs a habit and an intensity', () => {
    expect(isReady(emptyDraft)).toBe(false);
    expect(isReady({ ...emptyDraft, habitId: 'h1' })).toBe(false);
    expect(isReady({ ...emptyDraft, habitId: 'h1', intensity: 6 })).toBe(true);
  });

  it('drops helpers on a used moment and trims the note', () => {
    const m = toNewMoment({ ...emptyDraft, habitId: 'h1', intensity: 8, outcome: 'used', helpers: ['tea'], note: '  after work ' });
    expect(m.helpers).toEqual([]);
    expect(m.note).toBe('after work');
  });

  it('stores an empty note as null', () => {
    expect(toNewMoment({ ...emptyDraft, habitId: 'h1', intensity: 3 }).note).toBeNull();
  });
});
