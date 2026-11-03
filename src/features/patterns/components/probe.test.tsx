import { render } from '@testing-library/react-native';
import type { DayPoint } from '../logic';
import { IntensityChart } from './Charts';
type N = { type: unknown; props: Record<string, unknown>; children?: (N | string)[] | null };
function walk(n: unknown, out: {type:string; props:Record<string,unknown>}[] = []) {
  if (!n || typeof n !== 'object') return out;
  const node = n as N;
  out.push({ type: typeof node.type === 'string' ? node.type : (node.type as {name?:string})?.name ?? String(node.type), props: node.props ?? {} });
  for (const c of node.children ?? []) walk(c, out);
  return out;
}
it('probe', async () => {
  const pts: DayPoint[] = [{ date: '2026-11-09', avg: 5, count: 1 }];
  const { toJSON } = await render(<IntensityChart points={pts} />);
  for (const e of walk(toJSON())) console.log(e.type, JSON.stringify(e.props).slice(0,180));
});
