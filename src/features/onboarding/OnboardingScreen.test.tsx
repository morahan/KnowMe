import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { getSetting, setSetting } from '@/db/repos/settings';
import { OnboardingScreen } from './OnboardingScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn() } }));
jest.mock('@/db/repos/settings', () => ({
  getSetting: jest.fn(async () => null),
  setSetting: jest.fn(async () => undefined),
}));

describe('OnboardingScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('walks the four slides in order, then hands a first run to Setup', async () => {
    const { getByText, getByTestId } = await render(<OnboardingScreen />);
    expect(getByText('A quiet place to notice a habit')).toBeTruthy();
    await fireEvent.press(getByText('Next'));
    expect(getByText("When it's hard, tap I'm in it")).toBeTruthy();
    // The pictured "I'm in it" is border-only inside the On Today frame, not a filled button.
    expect(getByTestId('im-in-it-picture')).toBeTruthy();
    await fireEvent.press(getByText('Next'));
    expect(getByText('Note the moment, then see the pattern')).toBeTruthy();
    await fireEvent.press(getByText('Next'));
    expect(getByText('Finding your way')).toBeTruthy();
    await fireEvent.press(getByText('Choose what you are tracking'));
    await waitFor(() => expect(setSetting).toHaveBeenCalledWith('onboarding_seen', '1'));
    expect(router.replace).toHaveBeenCalledWith('/setup');
  });

  it('Skip also marks it seen and goes to Setup', async () => {
    const { getByText } = await render(<OnboardingScreen />);
    await fireEvent.press(getByText('Skip'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/setup'));
  });

  it('replay for an onboarded user returns to the tabs', async () => {
    (getSetting as jest.Mock).mockResolvedValue('1');
    const { getByText } = await render(<OnboardingScreen />);
    await fireEvent.press(getByText('Skip'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(tabs)'));
  });
});
