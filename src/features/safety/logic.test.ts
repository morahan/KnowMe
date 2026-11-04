import { anyCrisis, isCrisis, normalize } from './logic';

describe('isCrisis', () => {
  it.each([
    'I want to die',
    "I don't want to be here anymore",
    'thinking about suicide',
    'Might just END IT tonight.',
    'took too much, maybe overdosed',
    'I keep wanting to self-harm',
    'kill myself',
  ])('flags %p', (text) => {
    expect(isCrisis(text)).toBe(true);
  });

  it.each([
    'Had tea and went for a walk',
    'Stressed after work, rode it out',
    'the endless meeting',
    'studied for the exam',
    '',
  ])('does not flag %p', (text) => {
    expect(isCrisis(text)).toBe(false);
  });
});

describe('anyCrisis', () => {
  it('checks every field and skips empties', () => {
    expect(anyCrisis([null, undefined, 'fine', 'want to die'])).toBe(true);
    expect(anyCrisis([null, 'fine'])).toBe(false);
  });
});

describe('normalize', () => {
  it('strips apostrophes and punctuation', () => {
    expect(normalize("Don't — self-harm!")).toBe('dont self harm');
  });
});

describe('isCrisis resists simple evasion', () => {
  it.each([
    'I don‘t want to live', // left single quote
    'I donʼt want to be here', // modifier apostrophe
    'I don`t want to live', // backtick
    'thinking about suïcide', // diacritic
    'ｓｕｉｃｉｄｅ', // fullwidth
    'sui​cide', // zero-width space
    'sui­cide', // soft hyphen
    'k1ll mys3lf',
    'ki11 myself',
    '5uicide',
    'I w4nt to d1e',
    'I OD’d last night',
    'I OD\'d last night',
    'I want\nto die', // multi-line
  ])('flags %p', (text) => {
    expect(isCrisis(text)).toBe(true);
  });

  it.each(['7 drinks at 10pm', 'odd day, tea at 3', 'I don’t want to drink tonight'])('still ignores %p', (text) => {
    expect(isCrisis(text)).toBe(false);
  });
});
