import { useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import { listReasons } from '@/db/repos/reasons';
import type { Habit, Moment, Reason } from '@/db/schema';
import { daysAgo } from '@/lib/dates';

export type InItData = { habits: Habit[]; reasons: Reason[]; moments: Moment[] };

export function useInIt() {
  const [data, setData] = useState<InItData | null>(null);
  useEffect(() => {
    void (async () => {
      const [habits, reasons, moments] = await Promise.all([
        listHabits(),
        listReasons(),
        listMomentsSince(daysAgo(90).toISOString()),
      ]);
      setData({ habits, reasons, moments });
    })();
  }, []);
  return data;
}
