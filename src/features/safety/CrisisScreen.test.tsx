/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
/**
 * Screen-level crisis card tests (SAFETY.md §1): the card renders with
 * 988 (call and text) and 911 before anything else, plus a quiet Back.
 */
import { fireEvent, render } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { CrisisScreen } from './CrisisScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
}));

import { router } from 'expo-router';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});

describe('CrisisScreen', () => {
  it('renders 988, 911, and Back', async () => {
    const { getByText } = await render(<CrisisScreen />);
    expect(getByText("You don't have to figure this out alone.")).toBeTruthy();
    expect(getByText('Call 988')).toBeTruthy();
    expect(getByText('Text 988')).toBeTruthy();
    expect(getByText('Call 911 for an emergency')).toBeTruthy();
    expect(getByText('Back')).toBeTruthy();
  });

  it('dials 988 and 911, and Back returns', async () => {
    const { getByText } = await render(<CrisisScreen />);
    await fireEvent.press(getByText('Call 988'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:988');
    await fireEvent.press(getByText('Call 911 for an emergency'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:911');
    await fireEvent.press(getByText('Back'));
    expect(router.back).toHaveBeenCalledTimes(1);
  });
});
