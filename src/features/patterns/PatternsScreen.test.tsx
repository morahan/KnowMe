/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
import { render, waitFor } from '@testing-library/react-native';
import { PatternsScreen } from './PatternsScreen';

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(cb, []);
  },
}));

jest.mock('@/db/repos/moments', () => ({
  listMomentsSince: jest.fn(async () => []),
}));

import { listMomentsSince } from '@/db/repos/moments';

const mockList = listMomentsSince as jest.Mock;

const realMoment = {
  id: 'real-1',
  habit_id: 'h1',
  created_at: new Date().toISOString(),
  intensity: 6,
  context: 'home',
  feelings: ['bored'],
  outcome: 'rode_it_out',
  helpers: ['tea'],
  note: null,
  is_demo: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockList.mockResolvedValue([]);
});

describe('PatternsScreen sample data', () => {
  it('shows sample data with a clear example notice before the first real moment', async () => {
    const { getByText, queryByText } = await render(<PatternsScreen />);
    await waitFor(() => expect(getByText('Patterns - Sample Data')).toBeTruthy());
    expect(getByText(/example data and example insights/)).toBeTruthy();
    expect(getByText(/Log your first moment/)).toBeTruthy();
    expect(queryByText('Patterns')).toBeNull();
  });

  it('replaces sample data with real logs after the first real moment', async () => {
    mockList.mockResolvedValue([realMoment]);
    const { getByText, queryByText } = await render(<PatternsScreen />);
    await waitFor(() => expect(getByText('Patterns')).toBeTruthy());
    expect(queryByText('Patterns - Sample Data')).toBeNull();
    expect(queryByText(/example data and example insights/)).toBeNull();
  });
});
