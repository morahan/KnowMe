// Same terms and matching as src/features/safety (the proxy deploys separately). Keep in sync.
const CRISIS_TERMS: readonly string[] = [
  'suicide', 'suicidal', 'kill myself', 'killing myself', 'want to die', 'wanna die', 'want to be dead',
  'better off dead', 'end it', 'end it all', 'end my life', 'ending my life', 'take my life',
  'no reason to live', 'nothing to live for', 'dont want to be here', 'dont want to live',
  'hurt myself', 'hurting myself', 'harm myself', 'self harm', 'cut myself', 'cutting myself',
  'overdose', 'overdosed', 'overdosing', 'od',
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function isCrisis(text: string): boolean {
  const padded = ` ${normalize(text)} `;
  return CRISIS_TERMS.some((term) => padded.includes(` ${term} `));
}

/** Input check: every string anywhere in the summary. */
export function inputIsCrisis(summary: unknown): boolean {
  return collectStrings(summary).some(isCrisis);
}

/** Output check: the model's CRISIS token, or crisis language in what it wrote. */
export function outputIsCrisis(text: string): boolean {
  return /\bCRISIS\b/.test(text) || isCrisis(text);
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}
