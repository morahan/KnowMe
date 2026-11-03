import { render } from '@testing-library/react-native';
import type { DayPoint } from '../logic';
import { IntensityChart } from './Charts';

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
});
