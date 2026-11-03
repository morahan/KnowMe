import { CRISIS_TERMS } from './crisisTerms';

/** Lowercase, drop apostrophes ("don't" -> "dont"), everything else non-alphanumeric -> space. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function isCrisis(text: string): boolean {
  const padded = ` ${normalize(text)} `;
  return CRISIS_TERMS.some((term) => padded.includes(` ${term} `));
}

export function anyCrisis(texts: readonly (string | null | undefined)[]): boolean {
  return texts.some((t) => typeof t === 'string' && isCrisis(t));
}
