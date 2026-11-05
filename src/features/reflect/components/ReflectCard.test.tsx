/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
/**
 * Reflect network path: timeout, double-submit, local screen of the letter,
 * re-reflecting on a new day, and the one-letter-a-day limit. Repos and router are mocked;
 * the real SafetyProvider and crisis matcher run.
 */
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafetyProvider } from '@/features/safety/SafetyProvider';
import { copy } from '../copy';
import { ReflectCard } from './ReflectCard';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => [{ id: 'h1', name: 'cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' }]),
}));
jest.mock('@/db/repos/reasons', () => ({ listAllReasons: jest.fn(async () => []) }));
jest.mock('@/db/repos/moments', () => ({ listMomentsSince: jest.fn(async () => []) }));

let mockCache: string | null = null;
jest.mock('@/db/repos/settings', () => ({
  getInstallId: jest.fn(async () => 'install-1'),
  getSetting: jest.fn(async () => mockCache),
  setSetting: jest.fn(async (_key: string, value: string) => {
    mockCache = value;
  }),
}));

import { router } from 'expo-router';
import { setSetting } from '@/db/repos/settings';

const mockFetch = jest.fn();
const okLetter = (text: string) => ({ ok: true, json: async () => ({ crisis: false, text }) });
const yesterday = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

beforeAll(() => {
  process.env.EXPO_PUBLIC_PROXY_URL = 'https://proxy.test';
  global.fetch = mockFetch as unknown as typeof fetch;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCache = null;
});

afterEach(() => jest.useRealTimers());

async function renderCard() {
  const utils = await render(
    <SafetyProvider>
      <ReflectCard />
    </SafetyProvider>,
  );
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
}

describe('ReflectCard', () => {
  it('gives up with the calm error when the proxy never answers', async () => {
    jest.useFakeTimers();
    mockFetch.mockImplementation(
      (_url: string, init: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const utils = await renderCard();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    await act(async () => {
      jest.advanceTimersByTime(5_000);
    });
    expect(utils.getByText(copy.error)).toBeTruthy();
  });

  it('sends one request for a double tap', async () => {
    mockFetch.mockResolvedValue(okLetter('Evenings look hardest. What helps then?'));
    const utils = await renderCard();
    const button = utils.getByText(copy.button);
    await act(async () => {
      fireEvent.press(button);
      fireEvent.press(button);
    });
    await waitFor(() => expect(utils.getByText('Evenings look hardest.')).toBeTruthy());
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('shows the crisis card, not the letter, when the letter itself has crisis language', async () => {
    mockFetch.mockResolvedValue(okLetter('You said you want to die. What would help tonight?'));
    const utils = await renderCard();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/crisis'));
    expect(utils.queryByText('You said you want to die.')).toBeNull();
    expect(setSetting).not.toHaveBeenCalled();
  });

  it('can reflect again when the cached letter is from an earlier day', async () => {
    mockCache = JSON.stringify({ lines: ['Last week was quieter.'], at: yesterday() });
    mockFetch.mockResolvedValue(okLetter('This week was busier. What changed?'));
    const utils = await renderCard();
    expect(utils.getByText('Last week was quieter.')).toBeTruthy();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText('This week was busier.')).toBeTruthy());
  });

  it('shows the daily-limit note instead of calling the proxy when today\'s letter already came', async () => {
    mockCache = JSON.stringify({ lines: ['Evenings looked hardest.'], at: new Date().toISOString() });
    const utils = await renderCard();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText(copy.limited)).toBeTruthy());
    expect(utils.getByText('Evenings looked hardest.')).toBeTruthy();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('keeps the new letter on screen when a second tap the same day hits the limit', async () => {
    mockFetch.mockResolvedValue(okLetter('Mornings were steadier. What helped?'));
    const utils = await renderCard();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText('Mornings were steadier.')).toBeTruthy());
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText(copy.limited)).toBeTruthy());
    expect(utils.getByText('Mornings were steadier.')).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('does not use up the day when Reflect fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const utils = await renderCard();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText(copy.error)).toBeTruthy());
    mockFetch.mockResolvedValueOnce(okLetter('A quieter week. What made room for that?'));
    await act(async () => {
      fireEvent.press(utils.getByText(copy.button));
    });
    await waitFor(() => expect(utils.getByText('A quieter week.')).toBeTruthy());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
