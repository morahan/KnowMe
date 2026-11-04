/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
/**
 * I'm in it: the countdown keeps real time, Save writes one moment, and a
 * failed load or haptic never strands the person on this screen.
 */
import { act, fireEvent, render } from '@testing-library/react-native';
import { copy } from './copy';
import { InItScreen } from './InItScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

let mockFail = false;
jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => {
    if (mockFail) throw new Error('db');
    return [{ id: 'h1', name: 'cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' }];
  }),
}));
jest.mock('@/db/repos/reasons', () => ({ listAllReasons: jest.fn(async () => []) }));
jest.mock('@/db/repos/moments', () => ({
  listMomentsSince: jest.fn(async () => []),
  insertMoment: jest.fn(async () => 'm1'),
}));

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { insertMoment } from '@/db/repos/moments';

beforeEach(() => {
  jest.clearAllMocks();
  mockFail = false;
});

afterEach(() => jest.useRealTimers());

async function renderInIt() {
  const utils = await render(<InItScreen />);
  await act(async () => {
    await Promise.resolve();
  });
  return utils;
}

async function reachCheck() {
  const utils = await renderInIt();
  await act(async () => {
    fireEvent.press(utils.getByText(copy.through));
  });
  await act(async () => {
    fireEvent.press(utils.getByLabelText('6 of 10'));
  });
  return utils;
}

describe('InItScreen', () => {
  it('counts down in real time, even if ticks were missed (app in background)', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-04T20:00:00Z') });
    const utils = await renderInIt();
    expect(utils.getByText('20:00')).toBeTruthy();
    // Five minutes pass with no ticks delivered, then one tick lands.
    jest.setSystemTime(new Date('2026-11-04T20:05:00Z'));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(utils.getByText('14:59')).toBeTruthy();
  });

  it('saves one moment for a double tap on Save', async () => {
    const utils = await reachCheck();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.save));
      fireEvent.press(utils.getByText(copy.save));
    });
    expect(insertMoment).toHaveBeenCalledTimes(1);
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('still closes after saving when haptics are unavailable', async () => {
    (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(new Error('no haptics'));
    const utils = await reachCheck();
    await act(async () => {
      fireEvent.press(utils.getByText(copy.save));
    });
    expect(insertMoment).toHaveBeenCalledTimes(1);
    expect(router.back).toHaveBeenCalledTimes(1);
  });

  it('still offers the breathing when the data cannot load', async () => {
    mockFail = true;
    const utils = await renderInIt();
    expect(utils.queryByText(copy.loading)).toBeNull();
    expect(utils.getByText(copy.through)).toBeTruthy();
  });
});
