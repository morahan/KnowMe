import { render } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import type { DayPoint } from '../logic';
import { IntensityChart } from './Charts';

const pts = (n: number): DayPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-11-${String((i % 28) + 1).padStart(2, '0')}`,
    avg: 5,
    count: 1,
  }));

describe('IntensityChart', () => {
  it('puts a lone day-one dot at the left inset, not the far right', async () => {
    const { UNSAFE_getByType } = await render(<IntensityChart points={pts(1)} />);
    const circle = UNSAFE_getByType(Circle);
    expect(circle.props.cx).toBe(16);
    expect(UNSAFE_getByType(ScrollView).props.scrollEnabled).toBe(false);
  });

  it('insets the newest dot from the right edge', async () => {
    const { UNSAFE_getAllByType } = await render(<IntensityChart points={pts(2)} />);
    const circles = UNSAFE_getAllByType(Circle);
    const svgWidth = UNSAFE_getAllByType(Svg)[0]!.props.width as number;
    expect(circles[0]!.props.cx).toBe(16);
    expect(circles[1]!.props.cx).toBe(svgWidth - 16);
  });

  it('becomes horizontally scrollable past a month of days', async () => {
    const { UNSAFE_getByType } = await render(<IntensityChart points={pts(45)} />);
    const scroll = UNSAFE_getByType(ScrollView);
    const svgWidth = UNSAFE_getByType(Svg).props.width as number;
    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.scrollEnabled).toBe(true);
    // Content is wider than the on-screen plot area, so it can scroll.
    expect(svgWidth).toBeGreaterThan(320);
  });
});
