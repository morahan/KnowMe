import { useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import { listReasons } from '@/db/repos/reasons';
import type { Habit, Reason } from '@/db/schema';
import { daysAgo } from '@/lib/dates';
import { topHelpers } from './logic';

export type InItData = { habit: Habit | null; reasons: Reason[]; helpers: string[] };

export function useInIt() {
  const [data, setData] = useState<InItData | null>(null);
  useEffect(() => {
    void (async () => {
      const [habits, reasons, moments] = await Promise.all([
        listHabits(),
        listReasons(),
        listMomentsSince(daysAgo(90).toISOString()),
      ]);
      setData({ habit: habits[0] ?? null, reasons, helpers: topHelpers(moments) });
    })();
  }, []);
  return data;
}
