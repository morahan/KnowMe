import { useCallback, useEffect, useRef, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import { listAllReasons } from '@/db/repos/reasons';
import { getInstallId, getSetting, setSetting } from '@/db/repos/settings';
import { useSafety } from '@/features/safety';
import { daysAgo } from '@/lib/dates';
import { motion } from '@/theme';
import { buildSummary, classifyResponse, freeText, type ProxyResponse } from './logic';

const DAYS = 7;
// The proxy screens, then writes (two model calls, ~7-9 s). Past this, show the calm error.
const TIMEOUT_MS = 30_000;
/** Read per call, trailing slash dropped, so `${url}/api/reflect` never doubles it. */
const proxyUrl = () => process.env.EXPO_PUBLIC_PROXY_URL?.trim().replace(/\/+$/, '') || null;
// A fast reply still gets a short, calm beat before the letter appears.
const MIN_REVEAL_MS = motion.slow + motion.base;

const holdUntilReveal = (startedAt: number) => {
  const remaining = MIN_REVEAL_MS - (Date.now() - startedAt);
  return remaining > 0 ? new Promise<void>((resolve) => setTimeout(resolve, remaining)) : Promise.resolve();
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; lines: string[] }
  | { status: 'error' };

export function useReflection() {
  const { guard, showCrisisCard } = useSafety();
  const [state, setState] = useState<State>({ status: 'idle' });
  const [cached, setCached] = useState<string[] | null>(null);
  // Blocks a second tap before the loading state renders.
  const busy = useRef(false);

  // Load the last cached letter once (offline-friendly).
  useEffect(() => {
    getSetting('reflect_cache')
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { lines?: unknown };
        const lines = parsed.lines;
        if (Array.isArray(lines) && lines.length > 0 && lines.every((l) => typeof l === 'string')) setCached(lines);
      })
      .catch(() => {
        // A corrupt or unreadable cache is just no cache.
      });
  }, []);

  const reflect = useCallback(
    async (includeNotes: boolean) => {
      if (busy.current) return;
      const url = proxyUrl();
      if (!url) {
        setState({ status: 'error' });
        return;
      }
      busy.current = true;
      setState({ status: 'loading' });
      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const [habits, reasons, moments, installId] = await Promise.all([
          listHabits(),
          listAllReasons(),
          listMomentsSince(daysAgo(DAYS).toISOString()),
          getInstallId(),
        ]);
        const summary = buildSummary({ habits, reasons, moments, days: DAYS, includeNotes });

        // Local check first. Nothing is sent if it matches (SAFETY.md §1).
        if (guard(...freeText(summary))) {
          setState({ status: 'idle' });
          return;
        }

        const res = await fetch(`${url}/api/reflect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ installId, summary }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`proxy ${res.status}`);
        const data = (await res.json()) as ProxyResponse;
        clearTimeout(timeout);

        const result = classifyResponse(data);
        if (result.kind === 'crisis') {
          showCrisisCard();
          setState({ status: 'idle' });
          return;
        }
        const lines = result.lines;
        // Cache locally so the letter survives offline and relaunch.
        await setSetting('reflect_cache', JSON.stringify({ lines, at: new Date().toISOString() }));
        // Hold the loading state briefly so the reveal never flashes. The
        // crisis path above returns earlier and is never delayed (SAFETY.md §1).
        await holdUntilReveal(startedAt);
        setState({ status: 'done', lines });
      } catch {
        await holdUntilReveal(startedAt);
        setState({ status: 'error' });
      } finally {
        clearTimeout(timeout);
        busy.current = false;
      }
    },
    [guard, showCrisisCard],
  );

  return { state, reflect, cached };
}
