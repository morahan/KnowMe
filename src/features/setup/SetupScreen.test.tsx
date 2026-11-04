import { render } from '@testing-library/react-native';
import { setSetting } from '@/db/repos/settings';
import { SetupScreen } from './SetupScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() } }));
jest.mock('@/db/repos/settings', () => ({
  getSetting: jest.fn(async () => null),
  setSetting: jest.fn(async () => undefined),
}));
jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => []),
  addHabit: jest.fn(),
  removeHabit: jest.fn(),
}));
jest.mock('@/db/repos/reasons', () => ({
  MAX_REASONS: 8,
  listAllReasons: jest.fn(async () => []),
  replaceReasons: jest.fn(),
}));
jest.mock('@/features/safety', () => ({ useSafety: () => ({ guard: () => false }) }));

describe('SetupScreen', () => {
  it('counts leaving by Back as done, like Skip for now', async () => {
    const utils = await render(<SetupScreen />);
    expect(setSetting).not.toHaveBeenCalled();
    await utils.unmount();
    expect(setSetting).toHaveBeenCalledWith('onboarded', '1');
  });
});
