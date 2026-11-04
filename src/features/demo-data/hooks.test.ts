/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
import { seedDemoData } from './hooks';

let mockHabits: { id: string; name: string; kind: string; question: string | null; created_at: string }[] = [];

jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => mockHabits),
  addHabit: jest.fn(async (name: string, kind: string) => ({
    id: `id-${kind}`,
    name,
    kind,
    question: null,
    created_at: '2026-11-01T00:00:00.000Z',
  })),
}));

jest.mock('@/db/repos/moments', () => ({
  deleteDemoMoments: jest.fn(async () => undefined),
  hasDemoMoments: jest.fn(async () => false),
  insertMoment: jest.fn(async () => 'm1'),
}));

jest.mock('@/db/repos/reasons', () => ({
  listReasons: jest.fn(async () => [{ id: 'r1', habit_id: null, text: 'Sleep better', sort_order: 0 }]),
  replaceReasons: jest.fn(async () => undefined),
}));

import { addHabit } from '@/db/repos/habits';
import { insertMoment } from '@/db/repos/moments';

const mockAddHabit = addHabit as jest.Mock;
const mockInsert = insertMoment as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockHabits = [];
});

describe('seedDemoData', () => {
  it('seeds gambling moments onto a Gambling habit and the rest onto the primary habit', async () => {
    await seedDemoData();
    expect(mockAddHabit).toHaveBeenCalledWith('Cannabis', 'cannabis');
    expect(mockAddHabit).toHaveBeenCalledWith('Gambling', 'gambling');
    const calls = mockInsert.mock.calls.map((c: unknown[]) => c[0] as { habit_id: string; context: string; feelings: string[] });
    const gambling = calls.filter((m) => m.habit_id === 'id-gambling');
    expect(gambling.length).toBeGreaterThanOrEqual(3);
    for (const m of gambling) {
      expect(m.context).toBe('social');
      expect(m.feelings).toEqual(['bored']);
    }
    expect(calls.some((m) => m.habit_id === 'id-cannabis')).toBe(true);
    expect(calls.every((m) => m.habit_id === 'id-gambling' || m.habit_id === 'id-cannabis')).toBe(true);
  });

  it('keeps an already tracked habit as primary and does not duplicate Gambling', async () => {
    mockHabits = [
      { id: 'h-nic', name: 'Nicotine', kind: 'nicotine', question: null, created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h-gambling', name: 'Gambling', kind: 'gambling', question: null, created_at: '2026-11-01T00:00:00.000Z' },
    ];
    await seedDemoData();
    expect(mockAddHabit).not.toHaveBeenCalled();
    const calls = mockInsert.mock.calls.map((c: unknown[]) => c[0] as { habit_id: string });
    expect(calls.some((m) => m.habit_id === 'h-gambling')).toBe(true);
    expect(calls.some((m) => m.habit_id === 'h-nic')).toBe(true);
  });

  it('never adds Gambling to someone tracking other habits: clearing the demo would leave it behind', async () => {
    mockHabits = [{ id: 'h-nic', name: 'Nicotine', kind: 'nicotine', question: null, created_at: '2026-11-01T00:00:00.000Z' }];
    await seedDemoData();
    expect(mockAddHabit).not.toHaveBeenCalled();
    const calls = mockInsert.mock.calls.map((c: unknown[]) => c[0] as { habit_id: string });
    expect(calls.length).toBeGreaterThan(0);
    expect(calls.every((m) => m.habit_id === 'h-nic')).toBe(true);
  });
});
