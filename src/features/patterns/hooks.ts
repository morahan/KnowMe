import { useCallback, useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import type { Habit, Moment } from '@/db/schema';
import { daysAgo } from '@/lib/dates';
import { displayMoments } from './logic';

export type PatternsData = { moments: Moment[]; isSample: boolean; habits: Habit[] };

export function usePatterns() {
  const [data, setData] = useState<PatternsData | null>(null);
  const load = useCallback(async () => {
    // All moments, not just recent ones: one stored moment anywhere ends
    // sample mode, even if it has aged out of the chart window below.
    const [all, habits] = await Promise.all([
      listMomentsSince(new Date(0).toISOString()),
      listHabits(),
    ]);
    const display = displayMoments(all);
    if (display.isSample) {
      setData({ ...display, habits });
      return;
    }
    const since = daysAgo(90).toISOString();
    setData({ moments: display.moments.filter((m) => m.created_at >= since), isSample: false, habits });
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { moments: data?.moments ?? null, isSample: data?.isSample ?? false, habits: data?.habits ?? [], reload: load };
}
