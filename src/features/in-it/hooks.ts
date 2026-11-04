import { useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
import { listAllReasons } from '@/db/repos/reasons';
import type { Habit, Moment, Reason } from '@/db/schema';
import { daysAgo } from '@/lib/dates';

export type InItData = { habits: Habit[]; reasons: Reason[]; moments: Moment[] };

export function useInIt() {
  const [data, setData] = useState<InItData | null>(null);
  useEffect(() => {
    Promise.all([listHabits(), listAllReasons(), listMomentsSince(daysAgo(90).toISOString())])
      .then(([habits, reasons, moments]) => setData({ habits, reasons, moments }))
      // Breathing must still work if the data can't load: empty, never stuck on "A moment…".
      .catch(() => setData({ habits: [], reasons: [], moments: [] }));
  }, []);
  return data;
}
