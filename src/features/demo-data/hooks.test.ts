import { db } from '@/db/client';
import * as habits from '@/db/repos/habits';
import { seedDemoData } from './hooks';
import { generateDemoMoments } from './logic';

jest.mock('@/db/client', () => ({
  db: {
    getAllAsync: jest.fn(async () => []),
    runAsync: jest.fn(async () => undefined),
    withTransactionAsync: jest.fn(async (operation: () => Promise<void>) => operation()),
  },
}));

describe('seedDemoData', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('explicitly seeds a null preset question and preserves the original moments and outcomes', async () => {
    const now = new Date(2026, 10, 3, 23, 0);
    jest.useFakeTimers().setSystemTime(now);
    const addHabit = jest.spyOn(habits, 'addHabit');

    await seedDemoData();

    expect(addHabit).toHaveBeenCalledTimes(1);
    expect(addHabit).toHaveBeenCalledWith('Cannabis', 'cannabis', null);
    const seededHabit = await addHabit.mock.results[0]!.value;
    expect(seededHabit).toMatchObject({ name: 'Cannabis', kind: 'cannabis', question: null });
    const writes = jest.mocked(db.runAsync).mock.calls;
    expect(writes.filter(([sql]) => sql.startsWith('INSERT INTO habits'))).toEqual([
      [expect.any(String), seededHabit.id, 'Cannabis', 'cannabis', null, now.toISOString()],
    ]);
    const momentWrites = writes.filter(([sql]) => sql.startsWith('INSERT INTO moments'));
    expect(momentWrites.map(([, , ...values]) => values)).toEqual(
      generateDemoMoments(now).map((moment) => [
        seededHabit.id, moment.created_at, moment.intensity, moment.context,
        JSON.stringify(moment.feelings), moment.outcome, JSON.stringify(moment.helpers), moment.note, 1,
      ]),
    );
    expect(new Set(momentWrites.map((values) => values[7]))).toEqual(new Set(['used', 'rode_it_out']));
  });
});
