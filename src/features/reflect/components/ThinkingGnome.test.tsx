import { act, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { copy } from '../copy';
import { ThinkingGnome } from './ThinkingGnome';

function mockReduceMotion(on: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(on);
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('ThinkingGnome', () => {
  it('shows the gnome, his lantern and blink layers, and an honest message', async () => {
    mockReduceMotion(false);
    const utils = await render(<ThinkingGnome />);
    expect(utils.getByTestId('reflect-gnome', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.getByTestId('reflect-gnome-glow', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.getByTestId('reflect-gnome-blink', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.getByText(copy.loadingLines[0])).toBeTruthy();
    expect(utils.getByLabelText(copy.loading)).toBeTruthy();
  });

  it('moves to the next line after a slow fade', async () => {
    jest.useFakeTimers();
    mockReduceMotion(false);
    const utils = await render(<ThinkingGnome />);
    await act(async () => {
      jest.advanceTimersByTime(6000);
    });
    expect(utils.getByText(copy.loadingLines[1])).toBeTruthy();
  });

  it('goes still with Reduce Motion: no flicker, no blink, no rotation', async () => {
    jest.useFakeTimers();
    mockReduceMotion(true);
    const utils = await render(<ThinkingGnome />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(utils.getByTestId('reflect-gnome', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.queryByTestId('reflect-gnome-glow', { includeHiddenElements: true })).toBeNull();
    expect(utils.queryByTestId('reflect-gnome-blink', { includeHiddenElements: true })).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(20000);
    });
    expect(utils.getByText(copy.loadingLines[0])).toBeTruthy();
  });
});
