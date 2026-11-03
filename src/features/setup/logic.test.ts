import { canAddReason, cleanReasons } from './logic';

describe('cleanReasons', () => {
  it('trims and drops empties', () => {
    expect(cleanReasons(['  Sleep ', '', '  ', 'Be present'])).toEqual(['Sleep', 'Be present']);
  });
  it('caps at 8', () => {
    expect(cleanReasons(['1', '2', '3', '4', '5', '6', '7', '8', '9'])).toHaveLength(8);
  });
});

describe('canAddReason', () => {
  it('is false at 8 real reasons', () => {
    expect(canAddReason(['1', '2', '3', '4', '5', '6', '7', '8'])).toBe(false);
    expect(canAddReason(['1', '2'])).toBe(true);
  });
});
