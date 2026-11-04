import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { addHabit } from '@/db/repos/habits';
import { setSetting } from '@/db/repos/settings';
import { SafetyProvider } from '@/features/safety/SafetyProvider';
import { SetupScreen } from './SetupScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock('@/db/repos/settings', () => ({
  getSetting: jest.fn(async () => null),
  setSetting: jest.fn(async () => undefined),
}));
jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => []),
  addHabit: jest.fn(async (name, kind, question = null) => ({ id: 'custom', name, kind, question })),
  removeHabit: jest.fn(),
}));
jest.mock('@/db/repos/reasons', () => ({
  MAX_REASONS: 8,
  listAllReasons: jest.fn(async () => []),
  replaceReasons: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('SetupScreen', () => {
  it('counts leaving by Back as done, like Skip for now', async () => {
    const utils = await render(<SafetyProvider><SetupScreen /></SafetyProvider>);
    expect(setSetting).not.toHaveBeenCalled();
    await utils.unmount();
    expect(setSetting).toHaveBeenCalledWith('onboarded', '1');
  });

  it.each(['Save', 'Done'])('saves a custom question through %s', async (button) => {
    const utils = await render(<SafetyProvider><SetupScreen /></SafetyProvider>);
    await fireEvent.press(utils.getByText('Something else'));
    await fireEvent.changeText(utils.getByLabelText('Your own words'), 'Sugar');
    expect(utils.getByText('Finish the question: Did you ___?')).toBeTruthy();
    expect(utils.getByLabelText('Question phrase').props.value).toBe('sugar');
    await fireEvent.changeText(utils.getByLabelText('Question phrase'), 'eat sweets');
    expect(utils.getByText('Did you eat sweets?')).toBeTruthy();
    await fireEvent.press(utils.getByText(button));
    await waitFor(() => expect(addHabit).toHaveBeenCalledWith('Sugar', 'custom', 'eat sweets'));
  });

  it.each(['Save', 'Done'])('guards a crisis question before %s saves anything', async (button) => {
    const utils = await render(<SafetyProvider><SetupScreen /></SafetyProvider>);
    await fireEvent.press(utils.getByText('Something else'));
    await fireEvent.changeText(utils.getByLabelText('Your own words'), 'Sugar');
    await fireEvent.changeText(utils.getByLabelText('Question phrase'), 'want to die');
    await fireEvent.press(utils.getByText(button));
    expect(router.push).toHaveBeenCalledWith('/crisis');
    expect(addHabit).not.toHaveBeenCalled();
    expect(setSetting).not.toHaveBeenCalled();
  });
});
