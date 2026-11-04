import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { addHabit } from '@/db/repos/habits';
import { setSetting } from '@/db/repos/settings';
import { SetupScreen } from './SetupScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock('@/db/repos/settings', () => ({
  getSetting: jest.fn(async () => null),
  setSetting: jest.fn(async () => undefined),
}));
jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => []),
  addHabit: jest.fn(async (name: string, kind: string) => ({ id: `id-${name}`, name, kind, created_at: '2026-11-01T00:00:00.000Z' })),
  removeHabit: jest.fn(),
}));
jest.mock('@/db/repos/reasons', () => ({
  MAX_REASONS: 8,
  listAllReasons: jest.fn(async () => []),
  replaceReasons: jest.fn(),
}));
jest.mock('@/features/safety', () => ({ useSafety: () => ({ guard: () => false }) }));

beforeEach(() => jest.clearAllMocks());

describe('SetupScreen', () => {
  it('typing a preset name under Something else picks the preset, never a second habit with the same name', async () => {
    const utils = await render(<SetupScreen />);
    await fireEvent.press(utils.getByText('Something else'));
    await fireEvent.changeText(utils.getByPlaceholderText('Your own words'), ' alcohol ');
    await fireEvent.press(utils.getByText('Save'));
    await fireEvent.press(utils.getByText('Done'));
    await waitFor(() => expect(addHabit).toHaveBeenCalled());
    expect(addHabit).toHaveBeenCalledWith('Alcohol', 'alcohol');
    expect(addHabit).not.toHaveBeenCalledWith(expect.anything(), 'custom');
  });

  it('counts leaving by Back as done, like Skip for now', async () => {
    const utils = await render(<SetupScreen />);
    expect(setSetting).not.toHaveBeenCalled();
    await utils.unmount();
    expect(setSetting).toHaveBeenCalledWith('onboarded', '1');
  });
});
