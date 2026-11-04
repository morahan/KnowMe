/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
/**
 * Screen-level crisis tests (SAFETY.md case 1): a crisis note shows the
 * card first and nothing is persisted. Repos and the router are mocked;
 * the real SafetyProvider and crisis matcher run.
 */
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { DeviceEventEmitter, Platform } from 'react-native';
import { SafetyProvider } from '@/features/safety/SafetyProvider';
import { LogMomentScreen } from './LogMomentScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    const { useEffect } = jest.requireActual('react');
    useEffect(cb, [cb]);
  },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => [
    { id: 'h1', name: 'cannabis', kind: 'cannabis', created_at: '2026-11-01T00:00:00.000Z' },
  ]),
}));

jest.mock('@/db/repos/moments', () => ({
  insertMoment: jest.fn(async () => 'm1'),
}));

jest.mock('@/db/repos/settings', () => ({
  getSetting: jest.fn(async () => null),
  setSetting: jest.fn(async () => undefined),
}));

import { router } from 'expo-router';
import { insertMoment } from '@/db/repos/moments';
import { setSetting } from '@/db/repos/settings';

const mockPush = router.push as jest.Mock;
const mockReplace = router.replace as jest.Mock;
const mockInsert = insertMoment as jest.Mock;
const mockSetSetting = setSetting as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

async function renderLog() {
  const utils = await render(
    <SafetyProvider>
      <LogMomentScreen />
    </SafetyProvider>,
  );
  // Habit loads on focus; intensity enables Save.
  await waitFor(() => expect(utils.getByText('Save')).toBeTruthy());
  await fireEvent.press(utils.getByLabelText('8 of 10'));
  return utils;
}

describe('LogMomentScreen crisis guard (SAFETY.md case 1)', () => {
  it('shows the crisis card and persists nothing for a crisis note', async () => {
    const { getByPlaceholderText, getByText } = await renderLog();
    await fireEvent.changeText(getByPlaceholderText('Anything else? (optional)'), 'I want to die');
    await fireEvent.press(getByText('Save'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/crisis'));
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('saves an ordinary note without showing the card', async () => {
    const { getByPlaceholderText, getByText } = await renderLog();
    await fireEvent.changeText(getByPlaceholderText('Anything else? (optional)'), 'Rough evening, tea helped');
    await fireEvent.press(getByText('Save'));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ note: 'Rough evening, tea helped' }));
    expect(mockPush).not.toHaveBeenCalledWith('/crisis');
  });
});

describe('LogMomentScreen save with keyboard open', () => {
  it('keeps Save visible and tappable while typing in Anything else', async () => {
    const utils = await renderLog();
    await fireEvent.changeText(utils.getByPlaceholderText('Anything else? (optional)'), 'Rough evening, tea helped');
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    await act(async () => {
      DeviceEventEmitter.emit(showEvent, {
        endCoordinates: { screenX: 0, screenY: 500, width: 390, height: 344 },
        easing: 'keyboard',
        duration: 250,
      });
    });
    expect(utils.getByText('Save')).toBeTruthy();
    await fireEvent.press(utils.getByText('Save'));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ note: 'Rough evening, tea helped' }));
  });
});

describe('LogMomentScreen what-is-going-on quick tag', () => {
  it('offers Save for quick tagging on a long feeling and saves the customized 20-char tag', async () => {
    const utils = await renderLog();
    // Feelings Other is the first Other chip in the tree.
    await fireEvent.press(utils.getAllByText('Other')[0]!);
    const longFeeling =
      'Antsy and wired all morning, could not sit still at all and kept checking my phone every few minutes';
    await fireEvent.changeText(utils.getByPlaceholderText('What is going on, in your own words'), longFeeling);
    await waitFor(() => expect(utils.getByText('Save for quick tagging')).toBeTruthy());
    await fireEvent.press(utils.getByText('Save for quick tagging'));
    await waitFor(() => expect(utils.getByDisplayValue('Antsy and wired all')).toBeTruthy());
    await fireEvent.changeText(utils.getByPlaceholderText('Quick tag'), 'wired all morning');
    await fireEvent.press(utils.getByText('Add'));
    await waitFor(() => expect(utils.getByText('wired all morning ×')).toBeTruthy());
    await fireEvent.press(utils.getByText('Save'));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ feelings: ['wired all morning'] }));
  });
});

describe('LogMomentScreen preset tags', () => {
  it('renames a preset feeling, saves the list, and logs the new word', async () => {
    const utils = await renderLog();
    await fireEvent.press(utils.getAllByText('Edit tags')[0]!);
    await fireEvent.press(utils.getByText('bored'));
    await fireEvent.changeText(utils.getByPlaceholderText('Tag name'), 'flat');
    await fireEvent.press(utils.getByText('Save tag'));
    await waitFor(() => expect(utils.getByText('flat')).toBeTruthy());
    expect(utils.queryByText('bored')).toBeNull();
    expect(mockSetSetting).toHaveBeenCalledWith(
      'tag_presets.feelings',
      JSON.stringify(['flat', 'celebrating', 'lonely', 'restless', 'stressed', 'tired']),
    );
    await fireEvent.press(utils.getAllByText('Done editing')[0]!);
    await fireEvent.press(utils.getByText('flat'));
    await fireEvent.press(utils.getByText('Save'));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ feelings: ['flat'] }));
  });

  it('removes a preset helper so it is no longer offered', async () => {
    const utils = await renderLog();
    // Feelings Edit tags comes first in the tree; helpers is second.
    await fireEvent.press(utils.getAllByText('Edit tags')[1]!);
    await fireEvent.press(utils.getByText('tea'));
    await fireEvent.press(utils.getByText('Remove tag'));
    await waitFor(() => expect(utils.queryByText('tea')).toBeNull());
    const call = mockSetSetting.mock.calls.find((c: unknown[]) => c[0] === 'tag_presets.helpers');
    expect(call).toBeTruthy();
    expect(JSON.parse(call[1] as string)).not.toContain('tea');
  });
});

describe('LogMomentScreen what-helped quick tag', () => {
  it('offers Save for quick tagging on a long helper and saves the customized 20-char tag', async () => {
    const utils = await renderLog();
    // Feelings Other comes first in the tree; helpers Other is second.
    await fireEvent.press(utils.getAllByText('Other')[1]!);
    const longHelper =
      'Sat on the porch with a cup of tea and called my sister, talked it through until the craving passed and I felt steady again tonight';
    await fireEvent.changeText(utils.getByPlaceholderText('What helped, in your own words'), longHelper);
    await waitFor(() => expect(utils.getByText('Save for quick tagging')).toBeTruthy());
    await fireEvent.press(utils.getByText('Save for quick tagging'));
    // Auto-filled with the first 20 characters, then customized.
    await waitFor(() => expect(utils.getByDisplayValue('Sat on the porch wit')).toBeTruthy());
    await fireEvent.changeText(utils.getByPlaceholderText('Quick tag'), 'porch + sister');
    await fireEvent.press(utils.getByText('Add'));
    await waitFor(() => expect(utils.getByText('porch + sister ×')).toBeTruthy());
    await fireEvent.press(utils.getByText('Save'));
    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ helpers: ['porch + sister'] }));
  });
});
