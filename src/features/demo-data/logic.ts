import type { Context, Feeling, Helper, Outcome } from '@/db/schema';
import { CONTEXTS, FEELINGS, HELPERS } from '@/db/schema';

export type DemoMoment = {
  created_at: string;
  intensity: number;
  context: Context;
  feelings: Feeling[];
  outcome: Outcome;
  helpers: Helper[];
  note: string | null;
};

/** Small seeded PRNG so the demo looks the same every time. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const pick = <T>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;

/** 21 days ending `now`. Most cravings land 7–10pm; later days ride it out more often. */
export function generateDemoMoments(now: Date = new Date(), days = 21, seed = 7): DemoMoment[] {
  const r = rng(seed);
  const out: DemoMoment[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const count = 1 + Math.floor(r() * 3);
    for (let i = 0; i < count; i++) {
      const evening = r() < 0.7;
      const hour = evening ? 19 + Math.floor(r() * 4) : 8 + Math.floor(r() * 10);
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d, hour, Math.floor(r() * 60));
      if (at > now) continue;
      const progress = 1 - d / days;
      const rodeItOut = r() < 0.4 + progress * 0.4;
      out.push({
        created_at: at.toISOString(),
        intensity: Math.max(1, Math.min(10, Math.round(7 - progress * 2 + (r() - 0.5) * 4))),
        context: evening ? 'home' : pick(r, CONTEXTS),
        feelings: [evening ? pick(r, ['bored', 'tired', 'restless'] as const) : pick(r, FEELINGS)],
        outcome: rodeItOut ? 'rode_it_out' : 'used',
        helpers: rodeItOut ? [pick(r, HELPERS)] : [],
        note: null,
      });
    }
  }
  return out;
}
