import { act, render, waitFor } from '@testing-library/react-native';
import { listHabits } from '@/db/repos/habits';
import { TodayScreen } from './TodayScreen';
// jest.mock calls below are hoisted above these imports.

// Mirrors react-navigation: the focus effect re-runs whenever the callback
// identity changes. An inline (unmemoized) callback would reload forever.
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react');
    useEffect(cb, [cb]);
  },
}));

jest.mock('@/db/repos/settings', () => ({ getSetting: jest.fn(async () => 'yes') }));
jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => [
    { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
  ]),
}));
jest.mock('@/db/repos/moments', () => ({
  lastUsedAt: jest.fn(async () => null),
  listMomentsSince: jest.fn(async () => []),
}));

describe('TodayScreen focus reload', () => {
  it('loads a bounded number of times instead of looping while focused', async () => {
    const { getByText } = await render(<TodayScreen />);
    await waitFor(() => expect(getByText(/Nicotine/)).toBeTruthy());
    // Let any runaway effect/state cycle show itself.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    // Mount load + one focus load. A loop would be in the hundreds.
    expect((listHabits as jest.Mock).mock.calls.length).toBeLessThanOrEqual(3);
  });
});
