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
  /**
   * Which preset this moment belongs to in demo data. `null` seeds onto the
   * primary habit; `'gambling'` always seeds onto a Gambling habit, so its
   * weekend rhythm stays separate in Patterns.
   */
  habitKind: 'gambling' | null;
};

/** Small seeded PRNG so the demo looks the same every time. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]!;

/** Tea and walk carry most rode-it-out moments, so Patterns can say so honestly. */
function pickHelper(r: () => number): Helper {
  const x = r();
  if (x < 0.4) return 'tea';
  if (x < 0.7) return 'walk';
  return pick(r, HELPERS);
}

/**
 * 21 days ending `now`. Evenings 7–10pm, intensity easing from 8s toward 5s,
 * only a few "used". A few gambling moments sit apart from that daily rhythm:
 * weekend (Saturday and Sunday) evenings, when games are on, always `social`
 * with a `bored` feeling — so Patterns shows gambling landing on weekends
 * while the primary habit lands most evenings.
 */
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
      const rodeItOut = r() < 0.72 + progress * 0.23;
      out.push({
        created_at: at.toISOString(),
        intensity: Math.max(3, Math.min(10, Math.round(8 - progress * 3 + (r() - 0.5) * 3))),
        context: evening ? 'home' : pick(r, CONTEXTS),
        feelings: [evening ? pick(r, ['bored', 'tired', 'restless'] as const) : pick(r, FEELINGS)],
        outcome: rodeItOut ? 'rode_it_out' : 'used',
        helpers: rodeItOut ? [pickHelper(r)] : [],
        note: null,
        habitKind: null,
      });
    }
  }
  // Gambling: one moment each weekend evening in the window, never in the future.
  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    if (day.getDay() !== 0 && day.getDay() !== 6) continue;
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 20 + Math.floor(r() * 3), Math.floor(r() * 60));
    if (at > now) continue;
    const rodeItOut = r() < 0.85;
    out.push({
      created_at: at.toISOString(),
      intensity: Math.max(5, Math.min(9, Math.round(7 + (r() - 0.5) * 2))),
      context: 'social',
      feelings: ['bored'],
      outcome: rodeItOut ? 'rode_it_out' : 'used',
      helpers: rodeItOut ? [pickHelper(r)] : [],
      note: null,
      habitKind: 'gambling',
    });
  }
  return out.sort((a, b) => a.created_at.localeCompare(b.created_at));
}
