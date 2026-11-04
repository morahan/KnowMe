/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
import { fireEvent, render, waitFor } from '@testing-library/react-native';
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

let mockHabits = [
  { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
];

jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => mockHabits),
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
  mockHabits = [
    { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
  ];
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

  it('names each tracked behavior in the intensity legend when two are logged', async () => {
    mockHabits = [
      { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h2', name: 'Cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' },
    ];
    mockList.mockResolvedValue([
      realMoment,
      { ...realMoment, id: 'real-2', habit_id: 'h2', intensity: 4 },
    ]);
    const { getByText } = await render(<PatternsScreen />);
    await waitFor(() => expect(getByText('Patterns')).toBeTruthy());
    expect(getByText('Nicotine')).toBeTruthy();
    expect(getByText('Cannabis')).toBeTruthy();
  });

  it('puts the color-code labels below the title, before any graph, in larger text', async () => {
    mockHabits = [
      { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h2', name: 'Cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' },
    ];
    mockList.mockResolvedValue([
      realMoment,
      { ...realMoment, id: 'real-2', habit_id: 'h2', intensity: 4 },
    ]);
    const view = await render(<PatternsScreen />);
    await waitFor(() => expect(view.getByText('Patterns')).toBeTruthy());
    const texts: string[] = [];
    const walk = (node: unknown): void => {
      if (typeof node === 'string') texts.push(node);
      else if (node && typeof node === 'object') {
        const n = node as { children?: unknown[] };
        for (const child of n.children ?? []) walk(child);
      }
    };
    walk(view.toJSON());
    expect(texts.indexOf('Patterns')).toBeLessThan(texts.indexOf('Nicotine'));
    expect(texts.indexOf('Nicotine')).toBeLessThan(texts.indexOf('Intensity over time'));
    expect(texts.indexOf('Cannabis')).toBeLessThan(texts.indexOf('Intensity over time'));
    // type.body (17) — one step up from the chart label size (14).
    const style = view.getByText('Nicotine').props.style as { fontSize?: number }[];
    expect(style.flatMap((s) => (s.fontSize ? [s.fontSize] : []))).toContain(17);
  });

  it('shares one three-behavior toggle across the page when four are logged', async () => {
    mockHabits = [
      { id: 'h1', name: 'Nicotine', kind: 'nicotine', created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h2', name: 'Cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h3', name: 'Alcohol', kind: 'alcohol', created_at: '2026-11-01T00:00:00.000Z' },
      { id: 'h4', name: 'Sugar', kind: 'custom', created_at: '2026-11-01T00:00:00.000Z' },
    ];
    mockList.mockResolvedValue([
      realMoment,
      { ...realMoment, id: 'real-2', habit_id: 'h2', intensity: 4 },
      { ...realMoment, id: 'real-3', habit_id: 'h3', intensity: 5 },
      { ...realMoment, id: 'real-4', habit_id: 'h4', intensity: 7 },
    ]);
    const view = await render(<PatternsScreen />);
    await waitFor(() => expect(view.getByText(/Showing three at a time/)).toBeTruthy());
    expect(view.getByLabelText('Sugar').props.accessibilityState.checked).toBe(false);
    await fireEvent.press(view.getByLabelText('Nicotine'));
    await fireEvent.press(view.getByLabelText('Sugar'));
    expect(view.getByLabelText('Sugar').props.accessibilityState.checked).toBe(true);
    expect(view.getByLabelText('Nicotine').props.accessibilityState.checked).toBe(false);
  });
});
