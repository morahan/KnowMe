import { act, render } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { BreathCircle } from './BreathCircle';

function mockReduceMotion(on: boolean) {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(on);
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('BreathCircle', () => {
  it('keeps both words mounted (crossfaded, never swapped) and reads as one element', async () => {
    mockReduceMotion(false);
    const utils = await render(<BreathCircle inLabel="in" outLabel="out" />);
    expect(utils.getByLabelText('in, out')).toBeTruthy();
    expect(utils.getByText('in', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.getByText('out', { includeHiddenElements: true })).toBeTruthy();
  });

  it('keeps both words mounted through a full 10 s breath cycle', async () => {
    jest.useFakeTimers();
    mockReduceMotion(false);
    const utils = await render(<BreathCircle inLabel="in" outLabel="out" />);
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(utils.getByText('in', { includeHiddenElements: true })).toBeTruthy();
    expect(utils.getByText('out', { includeHiddenElements: true })).toBeTruthy();
  });

  it('fits the whole halo inside the room the screen gives it', async () => {
    mockReduceMotion(false);
    const utils = await render(<BreathCircle inLabel="in" outLabel="out" maxFootprint={120} />);
    const style = StyleSheet.flatten(utils.getByLabelText('in, out').props.style);
    expect(style.height).toBeCloseTo(120);
    expect(style.width).toBeCloseTo(120);
  });

  it('goes still and wordless with Reduce Motion', async () => {
    mockReduceMotion(true);
    const utils = await render(<BreathCircle inLabel="in" outLabel="out" />);
    await act(async () => {});
    expect(utils.queryByText('in', { includeHiddenElements: true })).toBeNull();
    expect(utils.queryByText('out', { includeHiddenElements: true })).toBeNull();
  });
});
