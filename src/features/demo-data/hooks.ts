import { addHabit, listHabits } from '@/db/repos/habits';
import { deleteDemoMoments, hasDemoMoments, insertMoment } from '@/db/repos/moments';
import { listReasons, replaceReasons } from '@/db/repos/reasons';
import type { Habit } from '@/db/schema';
import { habitNameKey } from '@/lib/habits';
import { generateDemoMoments } from './logic';

const DEMO_REASONS = ['Sleep through the night', 'Be present with my kids', 'Save money for the trip'];

const isGamblingHabit = (h: Habit): boolean => h.kind === 'gambling' || habitNameKey(h.name) === 'gambling';

/**
 * Seeds demo habits, reasons, and 21 days of moments. Primary moments go to
 * the first tracked habit (or a new Cannabis habit); gambling moments go to
 * a Gambling habit, so Patterns shows their weekend rhythm as its own series.
 * Gambling is only added on an empty install: habits are real rows that
 * clearing the demo leaves behind, so someone tracking other habits never
 * gets one they did not pick (their gambling moments are skipped instead).
 * Demo moments carry is_demo, so clearing never touches real moments.
 */
export async function seedDemoData(): Promise<void> {
  await deleteDemoMoments();
  const existing = await listHabits();
  let gambling = existing.find(isGamblingHabit);
  let primary = existing.find((h) => !isGamblingHabit(h)) ?? gambling;
  if (!primary) {
    primary = await addHabit('Cannabis', 'cannabis');
    gambling = await addHabit('Gambling', 'gambling');
  }
  if ((await listReasons()).length === 0) await replaceReasons(DEMO_REASONS);
  for (const { habitKind, ...m } of generateDemoMoments()) {
    const habitId = habitKind === 'gambling' ? gambling?.id : primary.id;
    if (habitId) await insertMoment({ ...m, habit_id: habitId, is_demo: true });
  }
}

export async function clearDemoData(): Promise<void> {
  await deleteDemoMoments();
}

export { hasDemoMoments };
