import { canAddReason, canSaveCustomHabit, cleanCustomHabit, cleanReasons, MAX_CUSTOM_HABIT_CHARS } from './logic';

describe('cleanReasons', () => {
  it('trims and drops empties', () => {
    expect(cleanReasons(['  Sleep ', '', '  ', 'Be present'])).toEqual(['Sleep', 'Be present']);
  });
  it('caps at 8', () => {
    expect(cleanReasons(['1', '2', '3', '4', '5', '6', '7', '8', '9'])).toHaveLength(8);
  });
});

describe('cleanCustomHabit', () => {
  it('trims and collapses spaces', () => {
    expect(cleanCustomHabit('  my   anger  ')).toBe('my anger');
  });
  it('caps at 20 characters', () => {
    expect(MAX_CUSTOM_HABIT_CHARS).toBe(20);
    expect(cleanCustomHabit('a'.repeat(30))).toBe('a'.repeat(20));
    expect(cleanCustomHabit('a'.repeat(30))).toHaveLength(20);
  });
});

describe('canSaveCustomHabit', () => {
  it('is false for empty or whitespace text', () => {
    expect(canSaveCustomHabit('')).toBe(false);
    expect(canSaveCustomHabit('   ')).toBe(false);
  });
  it('is true for typed text like anger', () => {
    expect(canSaveCustomHabit('anger')).toBe(true);
  });
});

describe('canAddReason', () => {
  it('is false at 8 real reasons', () => {
    expect(canAddReason(['1', '2', '3', '4', '5', '6', '7', '8'])).toBe(false);
    expect(canAddReason(['1', '2'])).toBe(true);
  });
});
