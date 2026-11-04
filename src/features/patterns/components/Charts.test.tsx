import { fireEvent, render } from '@testing-library/react-native';
import { darkTheme, lightTheme } from '@/theme';
import type { DayPoint } from '../logic';
import { BarList, HourChart, IntensityChart, type HourSeries, type IntensitySeries } from './Charts';

const pts = (n: number): DayPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-11-${String((i % 28) + 1).padStart(2, '0')}`,
    avg: 5,
    count: 1,
  }));

type Flat = { type: string; props: Record<string, unknown> };
type JsonNode = { type: unknown; props: Record<string, unknown>; children?: (JsonNode | string)[] | null };

function flatten(node: JsonNode | string | null, out: Flat[] = []): Flat[] {
  if (!node || typeof node === 'string') return out;
  out.push({ type: String(node.type), props: node.props as Record<string, unknown> });
  for (const child of node.children ?? []) flatten(child, out);
  return out;
}

async function chart(n: number) {
  return chartPoints(pts(n));
}

async function chartPoints(points: DayPoint[]) {
  const { toJSON } = await render(<IntensityChart points={points} />);
  const flat = flatten(toJSON() as JsonNode | null);
  return {
    circles: flat.filter((e) => e.type === 'RNSVGCircle'),
    // react-native-svg renders a Polyline as a Path with an `M…L…` d string.
    polylines: flat.filter((e) => e.type === 'RNSVGPath'),
    svgWidth: flat.find((e) => e.type === 'RNSVGSvgView')?.props.width as number,
    // The horizontal scroll frame carries the flex:1 width constraint.
    scrollFramed: flat.some((e) => (e.props.style as { flex?: number } | undefined)?.flex === 1),
  };
}

describe('IntensityChart', () => {
  it('puts a lone day-one dot at the left inset, not the far right', async () => {
    const { circles, svgWidth } = await chart(1);
    expect(circles).toHaveLength(1);
    expect(circles[0]!.props.cx).toBe(16);
    expect(circles[0]!.props.cx).not.toBe(svgWidth);
  });

  it('insets the first and newest dots from both edges', async () => {
    const { circles, svgWidth } = await chart(2);
    expect(circles[0]!.props.cx).toBe(16);
    expect(circles[1]!.props.cx).toBe(svgWidth - 16);
  });

  it('grows wider than the fit width past a month of days, so it scrolls', async () => {
    const fit = await chart(30);
    const long = await chart(45);
    expect(long.svgWidth).toBeGreaterThan(fit.svgWidth);
    // The scroll frame is width-constrained, so only one viewport (30 days
    // at the fit spacing) is on screen at a time.
    expect(long.scrollFramed).toBe(true);
  });

  it('draws nodes only on tracked days and connects them across skipped days', async () => {
    const sparse: DayPoint[] = [
      { date: '2026-11-01', avg: 8, count: 1 },
      { date: '2026-11-02', avg: null, count: 0 },
      { date: '2026-11-03', avg: null, count: 0 },
      { date: '2026-11-04', avg: null, count: 0 },
      { date: '2026-11-05', avg: null, count: 0 },
      { date: '2026-11-06', avg: null, count: 0 },
      { date: '2026-11-07', avg: 5, count: 1 },
    ];
    const { circles, polylines, svgWidth } = await chartPoints(sparse);
    expect(circles).toHaveLength(2);
    expect(circles[0]!.props.cx).toBe(16);
    expect(circles[1]!.props.cx).toBe(svgWidth - 16);
    // One unbroken line whose endpoints are exactly the two tracked nodes.
    expect(polylines).toHaveLength(1);
    const d = String(polylines[0]!.props.d);
    expect(d.startsWith('M')).toBe(true);
    expect(d).toContain(`${circles[0]!.props.cx} ${circles[0]!.props.cy}`);
    expect(d).toContain(`${circles[1]!.props.cx} ${circles[1]!.props.cy}`);
  });

  it('colors each behavior line and its nodes alike, and names them in a legend', async () => {
    const axis: DayPoint[] = [
      { date: '2026-11-01', avg: 6, count: 2 },
      { date: '2026-11-02', avg: 5, count: 2 },
    ];
    const series: IntensitySeries[] = [
      {
        habitId: 'h1',
        label: 'Nicotine',
        points: [
          { date: '2026-11-01', avg: 8, count: 1 },
          { date: '2026-11-02', avg: 6, count: 1 },
        ],
      },
      {
        habitId: 'h2',
        label: 'Cannabis',
        points: [
          { date: '2026-11-01', avg: 4, count: 1 },
          { date: '2026-11-02', avg: 5, count: 1 },
        ],
      },
    ];
    const { toJSON, getByText } = await render(<IntensityChart points={axis} series={series} />);
    const flat = flatten(toJSON() as JsonNode | null);
    const circles = flat.filter((e) => e.type === 'RNSVGCircle');
    const lines = flat.filter((e) => e.type === 'RNSVGPath');
    expect(circles).toHaveLength(4);
    expect(lines).toHaveLength(2);
    // react-native-svg encodes colors as { type, payload } objects.
    const fills = new Set(circles.map((c) => JSON.stringify(c.props.fill)));
    const strokes = new Set(lines.map((l) => JSON.stringify(l.props.stroke)));
    expect(fills.size).toBe(2);
    expect(strokes).toEqual(fills);
    expect(getByText('Nicotine')).toBeTruthy();
    expect(getByText('Cannabis')).toBeTruthy();
  });

  it('always shows the Y axis labels, gridlines, and axis line', async () => {
    const view = await render(<IntensityChart points={pts(2)} />);
    expect(view.getByText('10')).toBeTruthy();
    expect(view.getByText('5')).toBeTruthy();
    expect(view.getByText('1')).toBeTruthy();
    const flat = flatten(view.toJSON() as JsonNode | null);
    // Three horizontal gridlines, one per Y tick.
    expect(flat.filter((e) => e.type === 'RNSVGLine')).toHaveLength(3);
    // The fixed vertical axis line spans tick 10 down to tick 1.
    const axisLine = flat.find((e) => {
      const s = e.props.style as { width?: number; height?: number }[] | undefined;
      return Array.isArray(s) && s.some((x) => x.width === 1) && s.some((x) => (x.height ?? 0) > 0);
    });
    expect(axisLine).toBeTruthy();
    // Each tick keeps a real height so native cannot clip the label away.
    const ticks = flat.filter((e) => {
      const s = e.props.style as { height?: number; position?: string }[] | undefined;
      return Array.isArray(s) && s.some((x) => x.position === 'absolute' && x.height === 20);
    });
    expect(ticks.length).toBeGreaterThanOrEqual(3);
  });

  it('shows the Y axis with no data and with no points at all', async () => {
    const noData: DayPoint[] = [
      { date: '2026-11-01', avg: null, count: 0 },
      { date: '2026-11-02', avg: null, count: 0 },
    ];
    const empty = await render(<IntensityChart points={noData} />);
    expect(empty.getByText('10')).toBeTruthy();
    expect(empty.getByText('5')).toBeTruthy();
    expect(empty.getByText('1')).toBeTruthy();

    const none = await render(<IntensityChart points={[]} />);
    expect(none.getByText('10')).toBeTruthy();
    expect(none.getByText('5')).toBeTruthy();
    expect(none.getByText('1')).toBeTruthy();
  });

  it('keeps the Y axis when the plot scrolls past a month', async () => {
    const view = await render(<IntensityChart points={pts(45)} />);
    expect(view.getByText('10')).toBeTruthy();
    expect(view.getByText('5')).toBeTruthy();
    expect(view.getByText('1')).toBeTruthy();
  });

  it('shows no legend with a single behavior', async () => {
    const { queryByText } = await render(<IntensityChart points={pts(2)} />);
    expect(queryByText('Nicotine')).toBeNull();
  });

  const manySeries = (n: number): IntensitySeries[] =>
    Array.from({ length: n }, (_, i) => ({
      habitId: `h${i + 1}`,
      label: `Habit ${i + 1}`,
      points: [
        { date: '2026-11-01', avg: 4 + i, count: 1 },
        { date: '2026-11-02', avg: 5 + i, count: 1 },
      ],
    }));
  const axis2: DayPoint[] = [
    { date: '2026-11-01', avg: 6, count: 5 },
    { date: '2026-11-02', avg: 6, count: 5 },
  ];
  const countMarks = (json: unknown) => {
    const flat = flatten(json as JsonNode | null);
    return {
      lines: flat.filter((e) => e.type === 'RNSVGPath').length,
      circles: flat.filter((e) => e.type === 'RNSVGCircle').length,
    };
  };

  it('draws only three behaviors at a time and toggles which three', async () => {
    const view = await render(<IntensityChart points={axis2} series={manySeries(5)} />);
    expect(view.getByText(/Showing three at a time/)).toBeTruthy();
    expect(countMarks(view.toJSON())).toEqual({ lines: 3, circles: 6 });
    // Full: tapping a hidden fourth behavior changes nothing yet.
    await fireEvent.press(view.getByLabelText('Habit 4'));
    expect(countMarks(view.toJSON())).toEqual({ lines: 3, circles: 6 });
    // Hide one, then the fourth can take its place.
    await fireEvent.press(view.getByLabelText('Habit 2'));
    expect(countMarks(view.toJSON())).toEqual({ lines: 2, circles: 4 });
    await fireEvent.press(view.getByLabelText('Habit 5'));
    expect(countMarks(view.toJSON())).toEqual({ lines: 3, circles: 6 });
    expect(view.getByLabelText('Habit 5').props.accessibilityState.checked).toBe(true);
    expect(view.getByLabelText('Habit 2').props.accessibilityState.checked).toBe(false);
  });

  it('uses only the three brand colors for behavior lines', () => {
    expect(darkTheme.habitColors).toEqual(['#E8B07A', '#7FB3A6', '#8A8F98']);
    expect(lightTheme.habitColors).toEqual(['#9A5B24', '#3F7A6C', '#6B6F77']);
  });

  it('stacks the hour bars by behavior in the same colors', async () => {
    const buckets = Array.from({ length: 24 }, () => 0);
    buckets[20] = 3;
    buckets[21] = 1;
    const h1 = Array.from({ length: 24 }, () => 0);
    h1[20] = 2;
    h1[21] = 1;
    const h2 = Array.from({ length: 24 }, () => 0);
    h2[20] = 1;
    const series: HourSeries[] = [
      { habitId: 'h1', label: 'Nicotine', buckets: h1 },
      { habitId: 'h2', label: 'Cannabis', buckets: h2 },
    ];
    const { toJSON } = await render(<HourChart buckets={buckets} series={series} />);
    const flat = flatten(toJSON() as JsonNode | null);
    const rects = flat.filter((e) => e.type === 'RNSVGRect');
    // Two segments at 8pm (one per behavior) plus one at 9pm.
    expect(rects).toHaveLength(3);
    const fills = new Set(rects.map((r) => JSON.stringify(r.props.fill)));
    expect(fills.size).toBe(2);
    // The 8pm segments stack to the full bar height with no gap or overlap.
    const at20 = rects.filter((r) => Number(r.props.height) > 0);
    expect(at20.length).toBe(3);
  });

  it('splits list bars into per-behavior segments in habit order', async () => {
    const { toJSON, getByText } = await render(
      <BarList
        habitOrder={['h1', 'h2']}
        rows={[{ name: 'home', count: 4, byHabit: [{ habitId: 'h1', value: 3 }, { habitId: 'h2', value: 1 }] }]}
      />,
    );
    expect(getByText('home')).toBeTruthy();
    const flat = flatten(toJSON() as JsonNode | null);
    const colored = flat
      .map((e) => e.props.style as { backgroundColor?: string; flex?: number } | { backgroundColor?: string; flex?: number }[] | undefined)
      .flatMap((s) => (Array.isArray(s) ? s : s ? [s] : []))
      .filter((s) => s.backgroundColor && s.flex !== undefined);
    expect(colored).toEqual([
      { flex: 3, backgroundColor: '#9A5B24' },
      { flex: 1, backgroundColor: '#3F7A6C' },
    ]);
  });

  it('hides the toggle when three or fewer behaviors are tracked', async () => {
    const view = await render(<IntensityChart points={axis2} series={manySeries(3)} />);
    expect(view.queryByText(/Showing three at a time/)).toBeNull();
    expect(view.queryAllByRole('checkbox')).toHaveLength(0);
    expect(countMarks(view.toJSON())).toEqual({ lines: 3, circles: 6 });
    const two = await render(<IntensityChart points={axis2} series={manySeries(2)} />);
    expect(two.queryByText(/Showing three at a time/)).toBeNull();
    expect(two.queryAllByRole('checkbox')).toHaveLength(0);
  });
});
