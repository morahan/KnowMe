import { useCallback, useEffect, useState } from 'react';
import { listMomentsSince } from '@/db/repos/moments';
import type { Moment } from '@/db/schema';
import { daysAgo } from '@/lib/dates';
import { displayMoments } from './logic';

export type PatternsData = { moments: Moment[]; isSample: boolean };

export function usePatterns() {
  const [data, setData] = useState<PatternsData | null>(null);
  const load = useCallback(async () => {
    // All moments, not just recent ones: one real moment anywhere ends
    // sample mode, even if it has aged out of the chart window below.
    const display = displayMoments(await listMomentsSince(new Date(0).toISOString()));
    if (display.isSample) {
      setData(display);
      return;
    }
    const since = daysAgo(90).toISOString();
    setData({ moments: display.moments.filter((m) => m.created_at >= since), isSample: false });
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return { moments: data?.moments ?? null, isSample: data?.isSample ?? false, reload: load };
}
