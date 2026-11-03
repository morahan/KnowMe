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
