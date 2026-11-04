import { CRISIS_TERMS } from './crisisTerms';

// Keep this matching in sync with proxy/lib/crisis.ts.
const APOSTROPHES = /['‘’ʼ`´′]/g;
// Invisible characters that would split a word in two ("sui<ZWSP>cide").
const INVISIBLE = /[­​-‏⁠﻿]/g;
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

/** Lowercase, strip accents and invisible characters, unify apostrophes to "'". */
function fold(text: string): string {
  const decomposed = typeof text.normalize === 'function' ? text.normalize('NFKD') : text;
  return decomposed.replace(/[̀-ͯ]/g, '').toLowerCase().replace(INVISIBLE, '').replace(APOSTROPHES, "'");
}

/** "k1ll" -> "kill", only inside words that have a letter, so "10pm" or "7" stay numbers. "1" reads as i or l. */
function unleet(text: string, one: 'i' | 'l'): string {
  return text.replace(/\S+/g, (w) => (/[a-z]/.test(w) ? w.replace(/[013457@$]/g, (c) => (c === '1' ? one : LEET[c] ?? c)) : w));
}

const words = (text: string) => text.replace(/[^a-z0-9]+/g, ' ').trim();

/** Lowercase, drop apostrophes ("don't" -> "dont"), everything else non-alphanumeric -> space. */
export function normalize(text: string): string {
  return words(fold(text).replace(/'/g, ''));
}

/** Every reading worth matching: apostrophes dropped ("dont") or split ("od d"), with and without leetspeak. */
function readings(text: string): string[] {
  const folded = fold(text);
  return [folded, unleet(folded, 'i'), unleet(folded, 'l')].flatMap((t) => [words(t.replace(/'/g, '')), words(t.replace(/'/g, ' '))]);
}

export function isCrisis(text: string): boolean {
  return readings(text).some((r) => {
    const padded = ` ${r} `;
    return CRISIS_TERMS.some((term) => padded.includes(` ${term} `));
  });
}

export function anyCrisis(texts: readonly (string | null | undefined)[]): boolean {
  return texts.some((t) => typeof t === 'string' && isCrisis(t));
}
