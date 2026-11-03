import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Polyline, Rect } from 'react-native-svg';
import { chartColors, gutter, space, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { copy } from '../copy';
import type { DayPoint } from '../logic';

// Chart height from theme spacing (xxl + xl + md), not a magic number.
const CHART_H = space.xxl + space.xl + space.md;

/** Intensity over time: dots joined by a soft line. Y is 1-10. */
export function IntensityChart({ points }: { points: DayPoint[] }) {
  const { colors } = useTheme();
  const [accent] = chartColors(colors);
  const width = useWindowDimensions().width - gutter * 2;
  const withData = points.filter((p) => p.avg !== null);
  if (withData.length === 0) return null;
  const x = (i: number) => (points.length <= 1 ? width / 2 : (i / (points.length - 1)) * width);
  const y = (v: number) => CHART_H - ((v - 1) / 9) * (CHART_H - 16) - 8;
  const line = withData
    .map((p) => `${x(points.indexOf(p))},${y(p.avg!)}`)
    .join(' ');
  return (
    <Svg width={width} height={CHART_H} accessibilityLabel={copy.intensityChartAlt}>
      {withData.length > 1 ? <Polyline points={line} fill="none" stroke={accent} strokeWidth={2} /> : null}
      {withData.map((p) => (
        <Circle key={p.date} cx={x(points.indexOf(p))} cy={y(p.avg!)} r={4} fill={accent} />
      ))}
    </Svg>
  );
}

/** 24 hour buckets as quiet bars. */
export function HourChart({ buckets }: { buckets: number[] }) {
  const { colors } = useTheme();
  const [accent] = chartColors(colors);
  const width = useWindowDimensions().width - gutter * 2;
  const max = Math.max(1, ...buckets);
  const bw = width / 24;
  return (
    <Svg width={width} height={CHART_H} accessibilityLabel={copy.hourChartAlt}>
      {buckets.map((n, h) => (
        <Rect
          key={h}
          x={h * bw + 1}
          y={CHART_H - (n / max) * (CHART_H - 8)}
          width={Math.max(2, bw - 2)}
          height={Math.max(2, (n / max) * (CHART_H - 8))}
          rx={2}
          fill={n === max && n > 0 ? accent : colors.border}
        />
      ))}
    </Svg>
  );
}

/** Horizontal bars for top contexts / feelings / helpers. */
export function BarList({ rows, suffix }: { rows: { name: string; count: number }[]; suffix?: string }) {
  const { colors } = useTheme();
  const [accent] = chartColors(colors);
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return null;
  return (
    <View style={styles.list}>
      {rows.map((r) => (
        <View key={r.name} style={styles.row}>
          <View style={styles.label}>
            <Body>{r.name}</Body>
            <Label>{suffix ? `${r.count} ${suffix}` : String(r.count)}</Label>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View style={[styles.fill, { backgroundColor: accent, width: `${(r.count / max) * 100}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.md },
  row: { gap: space.xs },
  label: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: space.sm, borderRadius: space.xs, overflow: 'hidden' },
  fill: { height: space.sm, borderRadius: space.xs },
});
