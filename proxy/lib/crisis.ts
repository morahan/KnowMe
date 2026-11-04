// Same terms and matching as src/features/safety (the proxy deploys separately). Keep in sync.
const CRISIS_TERMS: readonly string[] = [
  'suicide', 'suicidal', 'kill myself', 'killing myself', 'want to die', 'wanna die', 'want to be dead',
  'better off dead', 'end it', 'end it all', 'end my life', 'ending my life', 'take my life',
  'no reason to live', 'nothing to live for', 'dont want to be here', 'dont want to live',
  'hurt myself', 'hurting myself', 'harm myself', 'self harm', 'cut myself', 'cutting myself',
  'overdose', 'overdosed', 'overdosing', 'od',
  'kms', 'kys', 'unalive', 'sewerslide', 'sewer slide',
];

const APOSTROPHES = /['‘’ʼ`´′]/g;
// Invisible characters that would split a word in two ("sui<ZWSP>cide").
const INVISIBLE = /[\u00ad\u200b-\u200f\u2060\ufeff]/g;
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

/** Lowercase, strip accents and invisible characters, unify apostrophes to "'". */
function fold(text: string): string {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(INVISIBLE, '').replace(APOSTROPHES, "'");
}

/** "k1ll" -> "kill", only inside words that have a letter, so "10pm" or "7" stay numbers. "1" reads as i or l. */
function unleet(text: string, one: 'i' | 'l'): string {
  return text.replace(/\S+/g, (w) => (/[a-z]/.test(w) ? w.replace(/[013457@$]/g, (c) => (c === '1' ? one : LEET[c] ?? c)) : w));
}

const words = (text: string) => text.replace(/[^a-z0-9]+/g, ' ').trim();

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

/** Input check: every string anywhere in the summary. */
export function inputIsCrisis(summary: unknown): boolean {
  return collectStrings(summary).some(isCrisis);
}

/** Output check: the model's CRISIS token (any case), or crisis language in what it wrote. */
export function outputIsCrisis(text: string): boolean {
  return /\bcrisis\b/i.test(text) || isCrisis(text);
}

export function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}
