import { db } from '@/db/client';
import type { Habit, HabitKind } from '@/db/schema';
import { newId } from '@/lib/ids';

export function listHabits(): Promise<Habit[]> {
  return db.getAllAsync<Habit>('SELECT * FROM habits ORDER BY created_at');
}

export async function addHabit(name: string, kind: HabitKind): Promise<Habit> {
  const habit: Habit = { id: newId(), name, kind, created_at: new Date().toISOString() };
  await db.runAsync(
    'INSERT INTO habits (id, name, kind, created_at) VALUES (?, ?, ?, ?)',
    habit.id, habit.name, habit.kind, habit.created_at,
  );
  return habit;
}

export async function removeHabit(id: string): Promise<void> {
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
}
