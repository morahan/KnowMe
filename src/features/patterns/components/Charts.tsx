import { useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import { chartColors, gutter, space, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { copy } from '../copy';
import {
  formatDayLabel, formatHour, intensityChartContentWidth, intensityPointX, type DayPoint,
} from '../logic';

// Chart height from theme spacing, not a magic number. Tall enough to read at arm's length.
const CHART_H = space.xxl * 2 + space.md;
const PLOT_PAD = space.sm;
// Inset so the first/last dots (r=5 plus stroke) never sit on the plot edge.
const EDGE_INSET = space.md;

/**
 * Intensity over time: dots joined by a soft line. Y is 1-10.
 * The plot spans the first logged day through the last (see intensityByDay):
 * the first dot is at the left inset, the newest at the right. Dots appear
 * only on days with logs; the line joins them straight across skipped days.
 * At most 30 days show at once — past that the plot scrolls sideways inside
 * its fixed-width frame, opening on the newest end.
 */
export function IntensityChart({ points }: { points: DayPoint[] }) {
  const { colors } = useTheme();
  const [accent] = chartColors(colors);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const totalWidth = useWindowDimensions().width - gutter * 2;
  const viewportWidth = totalWidth - space.lg - space.sm;
  const contentWidth = intensityChartContentWidth(points.length, viewportWidth, EDGE_INSET);
  const scrollable = contentWidth > viewportWidth;
  const withData = points
    .map((p, i) => ({ p, i }))
    .filter((d): d is { p: DayPoint & { avg: number }; i: number } => d.p.avg !== null);
  // Open (and stay, until the user scrolls) on the newest end when scrollable.
  const showNewest = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);
  if (withData.length === 0) return null;
  const x = (i: number) => intensityPointX(i, points.length, contentWidth, EDGE_INSET);
  const y = (v: number) => CHART_H - ((v - 1) / 9) * (CHART_H - PLOT_PAD * 2) - PLOT_PAD;
  const line = withData.map((d) => `${x(d.i)},${y(d.p.avg)}`).join(' ');
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return (
    <View style={styles.chart}>
      <View style={styles.chartRow}>
        <View style={[styles.yLabels, { height: CHART_H }]}>
          <Label>10</Label>
          <Label>5</Label>
          <Label>1</Label>
        </View>
        <ScrollView
          ref={scrollRef}
          style={styles.chartScroll}
          horizontal
          scrollEnabled={scrollable}
          showsHorizontalScrollIndicator={scrollable}
          onContentSizeChange={scrollable ? showNewest : undefined}
          onLayout={scrollable ? showNewest : undefined}
        >
          <View style={{ width: contentWidth }}>
            <Svg width={contentWidth} height={CHART_H} accessibilityLabel={copy.intensityChartAlt}>
              {[10, 5, 1].map((v) => (
                <Line key={v} x1={0} x2={contentWidth} y1={y(v)} y2={y(v)} stroke={colors.border} strokeWidth={1} />
              ))}
              {withData.length > 1 ? (
                <Polyline points={line} fill="none" stroke={accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
              {withData.map((d) => (
                <Circle key={d.p.date} cx={x(d.i)} cy={y(d.p.avg)} r={5} fill={accent} stroke={colors.bg} strokeWidth={2} />
              ))}
            </Svg>
            <View style={[styles.axisRow, { paddingHorizontal: EDGE_INSET }]}>
              <Label>{formatDayLabel(first.date)}</Label>
              {points.length > 1 ? <Label>{formatDayLabel(last.date)}</Label> : null}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/** 24 hour buckets as quiet bars. The busiest hour is the one warm bar. */
export function HourChart({ buckets }: { buckets: number[] }) {
  const { colors } = useTheme();
  const [accent] = chartColors(colors);
  const width = useWindowDimensions().width - gutter * 2;
  const max = Math.max(1, ...buckets);
  const bw = width / 24;
  const plotH = CHART_H - PLOT_PAD;
  return (
    <View style={styles.chart}>
      <Svg width={width} height={CHART_H} accessibilityLabel={copy.hourChartAlt}>
        {buckets.map((n, h) => (
          <Rect
            key={h}
            x={h * bw + 1}
            y={CHART_H - (n / max) * plotH}
            width={Math.max(2, bw - 2)}
            height={Math.max(2, (n / max) * plotH)}
            rx={space.xs}
            fill={n === max && n > 0 ? accent : colors.muted}
            fillOpacity={n === max && n > 0 ? 1 : 0.5}
          />
        ))}
      </Svg>
      <View style={styles.axisRow}>
        <Label>{formatHour(0)}</Label>
        <Label>{formatHour(6)}</Label>
        <Label>{formatHour(12)}</Label>
        <Label>{formatHour(18)}</Label>
      </View>
    </View>
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
            <Body muted>{suffix ? `${r.count} ${suffix}` : String(r.count)}</Body>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            <View
              style={[styles.fill, { backgroundColor: accent, width: `${(r.count / max) * 100}%` }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: space.sm },
  chartRow: { flexDirection: 'row', gap: space.sm },
  // Constrains the scroll frame to the row's remaining width, so at most one
  // 30-day viewport of the plot shows at a time and the rest scrolls.
  chartScroll: { flex: 1 },
  yLabels: { width: space.lg, justifyContent: 'space-between', alignItems: 'flex-end' },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { gap: space.md },
  row: { gap: space.sm },
  label: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: space.md, borderRadius: space.xs, overflow: 'hidden' },
  fill: { height: space.md, borderRadius: space.xs, minWidth: space.sm },
});
