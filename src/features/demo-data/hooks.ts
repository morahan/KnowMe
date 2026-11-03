import { addHabit, listHabits } from '@/db/repos/habits';
import { insertMoment } from '@/db/repos/moments';
import { replaceReasons } from '@/db/repos/reasons';
import { generateDemoMoments } from './logic';

const DEMO_REASONS = ['Sleep through the night', 'Be present with my kids', 'Save money for the trip'];

/** Seeds a demo habit, reasons, and 21 days of moments. Mixes with real data — see TODO.md. */
export async function seedDemoData(): Promise<void> {
  const habit = (await listHabits())[0] ?? (await addHabit('cannabis', 'cannabis'));
  await replaceReasons(DEMO_REASONS);
  for (const m of generateDemoMoments()) await insertMoment({ ...m, habit_id: habit.id });
}
