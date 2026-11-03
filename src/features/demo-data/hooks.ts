import { addHabit, listHabits } from '@/db/repos/habits';
import { deleteDemoMoments, hasDemoMoments, insertMoment } from '@/db/repos/moments';
import { listReasons, replaceReasons } from '@/db/repos/reasons';
import { generateDemoMoments } from './logic';

const DEMO_REASONS = ['Sleep through the night', 'Be present with my kids', 'Save money for the trip'];

/** Seeds a demo habit, reasons, and 21 days of moments. Demo rows carry is_demo, so clearing never touches real data. */
export async function seedDemoData(): Promise<void> {
  await deleteDemoMoments();
  const habit = (await listHabits())[0] ?? (await addHabit('Cannabis', 'cannabis'));
  if ((await listReasons()).length === 0) await replaceReasons(DEMO_REASONS);
  for (const m of generateDemoMoments()) await insertMoment({ ...m, habit_id: habit.id, is_demo: true });
}

export async function clearDemoData(): Promise<void> {
  await deleteDemoMoments();
}

export { hasDemoMoments };
