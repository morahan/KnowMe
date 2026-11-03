/* eslint-disable import/first -- jest.mock must precede the imports it mocks */
/**
 * Per-behavior reasons: the universal list is the default. A separate list
 * per behavior is offered only when tracking more than one; with a single
 * behavior the option stays hidden entirely.
 */
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { SafetyProvider } from '@/features/safety/SafetyProvider';
import { MeScreen } from './MeScreen';

const habit = (id: string, name: string, kind: 'custom' | 'cannabis' | 'nicotine' = 'custom') => ({
  id, name, kind, created_at: '2026-11-01T00:00:00.000Z',
});

let mockHabits = [habit('h1', 'Nicotine')];

jest.mock('@/db/repos/habits', () => ({
  listHabits: jest.fn(async () => mockHabits),
  addHabit: jest.fn(async () => habit('hx', 'x')),
  removeHabit: jest.fn(async () => undefined),
}));

jest.mock('@/db/repos/reasons', () => ({
  MAX_REASONS: 8,
  listAllReasons: jest.fn(async () => [
    { id: 'r1', habit_id: null, text: 'Sleep better', sort_order: 0 },
  ]),
  replaceReasons: jest.fn(async () => undefined),
}));

import { addHabit } from '@/db/repos/habits';
import { replaceReasons } from '@/db/repos/reasons';

const mockReplace = replaceReasons as jest.Mock;
const mockAddHabit = addHabit as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockHabits = [habit('h1', 'Nicotine')];
});

async function renderMe() {
  return render(
    <SafetyProvider>
      <MeScreen />
    </SafetyProvider>,
  );
}

describe('MeScreen tracking tags', () => {
  it('shows a preset stored lowercase with the same label as Log, Today, and I\'m in it', async () => {
    mockHabits = [habit('h1', 'cannabis', 'cannabis')];
    const { findByText, queryByText } = await renderMe();
    expect(await findByText('Cannabis')).toBeTruthy();
    expect(queryByText('cannabis')).toBeNull();
  });

  it('adds a typed preset name as that preset, not a custom duplicate', async () => {
    mockHabits = [habit('h1', 'Sugar')];
    const { findByText, getByLabelText, getByText } = await renderMe();
    await findByText('Sugar ×');
    await fireEvent.changeText(getByLabelText('Add your own'), ' nicotine ');
    await fireEvent.press(getByText('Add'));
    await waitFor(() => expect(mockAddHabit).toHaveBeenCalledWith('Nicotine', 'nicotine'));
    expect(mockAddHabit).not.toHaveBeenCalledWith(expect.anything(), 'custom');
  });
});

describe('MeScreen reasons', () => {
  it('shows only the universal list when tracking one behavior', async () => {
    const { findByText, queryByText, getByDisplayValue } = await renderMe();
    await findByText('Your reasons');
    expect(getByDisplayValue('Sleep better')).toBeTruthy();
    expect(queryByText('Add reasons for a specific one')).toBeNull();
    expect(queryByText('Reasons for a specific one')).toBeNull();
  });

  it('offers a separate list per behavior when tracking more than one, and saves each on its own', async () => {
    mockHabits = [habit('h-nic', 'Nicotine'), habit('h-can', 'Cannabis')];
    const { findByText, getByText, getByLabelText } = await renderMe();
    await findByText('Add reasons for a specific one');
    await fireEvent.press(getByText('Add reasons for a specific one'));
    await fireEvent.changeText(getByLabelText('Nicotine: A reason, in your own words 1'), 'For my lungs');
    await fireEvent.press(getByText('Save reasons'));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith(['Sleep better']));
    expect(mockReplace).toHaveBeenCalledWith(['For my lungs'], 'h-nic');
    expect(mockReplace).toHaveBeenCalledWith([], 'h-can');
  });
});
