import { isLast, nextIndex, prevIndex } from './logic';

describe('onboarding paging', () => {
  it('advances and clamps at the last slide', () => {
    expect(nextIndex(0, 4)).toBe(1);
    expect(nextIndex(3, 4)).toBe(3);
    expect(nextIndex(0, 0)).toBe(0);
  });
  it('goes back and clamps at the first slide', () => {
    expect(prevIndex(2)).toBe(1);
    expect(prevIndex(0)).toBe(0);
  });
  it('knows the last slide', () => {
    expect(isLast(3, 4)).toBe(true);
    expect(isLast(2, 4)).toBe(false);
    expect(isLast(0, 0)).toBe(false);
  });
});
