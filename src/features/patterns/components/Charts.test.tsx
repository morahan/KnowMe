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
  const { toJSON } = await render(<IntensityChart points={pts(n)} />);
  const flat = flatten(toJSON() as JsonNode | null);
  return {
    circles: flat.filter((e) => e.type === 'RNSVGCircle'),
    svgWidth: flat.find((e) => e.type === 'RNSVGSvgView')?.props.width as number,
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
  });
});
