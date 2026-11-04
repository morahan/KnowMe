import { act, render, waitFor } from '@testing-library/react-native';
import { listHabits } from '@/db/repos/habits';
import { listMomentsSince } from '@/db/repos/moments';
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
    { id: 'h1', name: 'Nicotine', kind: 'nicotine', question: null, created_at: '2026-11-01T00:00:00.000Z' },
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

describe('TodayScreen today list', () => {
  it('names the tagged habit on each moment when multiple habits are tracked', async () => {
    (listHabits as jest.Mock).mockResolvedValue([
      { id: 'h1', name: 'Nicotine', kind: 'nicotine', question: null, created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h2', name: 'Cannabis', kind: 'cannabis', question: null, created_at: '2026-11-01T00:00:00.000Z' },
    ]);
    (listMomentsSince as jest.Mock).mockResolvedValue([
      {
        id: 'm1', habit_id: 'h1', created_at: '2026-11-10T09:00:00.000Z', intensity: 7,
        context: 'home', feelings: [], outcome: 'rode_it_out', helpers: [], note: null, is_demo: false,
      },
      {
        id: 'm2', habit_id: 'h2', created_at: '2026-11-10T10:00:00.000Z', intensity: 4,
        context: 'work', feelings: [], outcome: 'used', helpers: [], note: null, is_demo: false,
      },
    ]);
    const { getByText } = await render(<TodayScreen />);
    await waitFor(() => expect(getByText(/Nicotine · intensity 7$/)).toBeTruthy());
    expect(getByText(/Cannabis · intensity 4$/)).toBeTruthy();
  });

  it('heads the summary “Today\'s Activity” as a section title, not a second “Today”', async () => {
    const { getByText, getAllByText } = await render(<TodayScreen />);
    const heading = await waitFor(() => getByText("Today's Activity"));
    expect(heading.props.accessibilityRole).toBe('header');
    expect(getAllByText('Today')).toHaveLength(1);
  });
});
