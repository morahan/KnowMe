import { useCallback, useEffect, useState } from 'react';
import { listHabits } from '@/db/repos/habits';
import { lastUsedAt, listMomentsSince } from '@/db/repos/moments';
import type { Habit, Moment } from '@/db/schema';
import { startOfDay } from '@/lib/dates';
import { daysSinceLastUsed } from './logic';

export type HabitToday = { habit: Habit; daysSince: number };
export type TodayData = { habits: HabitToday[]; today: Moment[] };

export function useToday() {
  const [data, setData] = useState<TodayData | null>(null);

  const load = useCallback(async () => {
    const habits = await listHabits();
    const rows = await Promise.all(
      habits.map(async (habit) => ({ habit, daysSince: daysSinceLastUsed(await lastUsedAt(habit.id), habit.created_at) })),
    );
    const today = await listMomentsSince(startOfDay().toISOString());
    setData({ habits: rows, today });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, reload: load };
}
