import { useCallback, useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import { listReasons } from '@/db/repos/reasons';
import { getInstallId, getSetting, setSetting } from '@/db/repos/settings';
import { useSafety } from '@/features/safety';
import { daysAgo } from '@/lib/dates';
import { buildSummary, freeText } from './logic';

const DAYS = 7;
const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL;

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; lines: string[] }
  | { status: 'error' };

type ProxyResponse = { crisis: true } | { crisis: false; text: string };

export function useReflection() {
  const { guard, showCrisisCard } = useSafety();
  const [state, setState] = useState<State>({ status: 'idle' });
  const [cached, setCached] = useState<string[] | null>(null);

  // Load the last cached letter once (offline-friendly).
  useEffect(() => {
    void getSetting('reflect_cache').then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as { lines?: string[] };
        if (Array.isArray(parsed.lines) && parsed.lines.length > 0) setCached(parsed.lines);
      } catch {
        // A corrupt cache is just no cache.
      }
    });
  }, []);

  const reflect = useCallback(
    async (includeNotes: boolean) => {
      if (!PROXY_URL) {
        setState({ status: 'error' });
        return;
      }
      setState({ status: 'loading' });
      try {
        const [habits, reasons, moments, installId] = await Promise.all([
          listHabits(),
          listReasons(),
          listMomentsSince(daysAgo(DAYS).toISOString()),
          getInstallId(),
        ]);
        const summary = buildSummary({ habits, reasons, moments, days: DAYS, includeNotes });

        // Local check first. Nothing is sent if it matches (SAFETY.md §1).
        if (guard(...freeText(summary))) {
          setState({ status: 'idle' });
          return;
        }

        const res = await fetch(`${PROXY_URL}/api/reflect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ installId, summary }),
        });
        if (!res.ok) throw new Error(`proxy ${res.status}`);
        const data = (await res.json()) as ProxyResponse;

        if (data.crisis) {
          showCrisisCard();
          setState({ status: 'idle' });
          return;
        }
        const lines = (data.text.match(/[^.?!]+[.?!]*/g) ?? [data.text]).map((l) => l.trim()).filter(Boolean);
        // Cache locally so the letter survives offline and relaunch.
        await setSetting('reflect_cache', JSON.stringify({ lines, at: new Date().toISOString() }));
        setState({ status: 'done', lines });
      } catch {
        setState({ status: 'error' });
      }
    },
    [guard, showCrisisCard],
  );

  return { state, reflect, cached };
}
