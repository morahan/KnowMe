import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import { chartColors, gutter, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { copy } from '../copy';
import {
  MAX_VISIBLE_HABITS, formatDayLabel, formatHour, intensityChartContentWidth, intensityPointX, resolveVisibleHabitIds, toggleVisibleHabitId, type DayPoint, type HabitHourSeries, type HabitIntensitySeries, type HabitSegment,
} from '../logic';

export type IntensitySeries = HabitIntensitySeries & { label: string };
export type HourSeries = HabitHourSeries & { label: string };
export type BarRow = { name: string; count: number; byHabit?: HabitSegment[] };

// Chart height from theme spacing, not a magic number. Tall enough to read at arm's length.
const CHART_H = space.xxl * 2 + space.md;
const PLOT_PAD = space.sm;
// Inset so the first/last dots (r=5 plus stroke) never sit on the plot edge.
const EDGE_INSET = space.md;

/**
 * Intensity over time: one line per tracked behavior, dots on logged days.
 * Y is 1-10. Each dot is that behavior's average for the day, so several
 * logs on one day still make a single dot. With one behavior the chart is
 * the single warm line it has always been; with more, each visible behavior
 * keeps its own brand color for both line and dots, named in the legend
 * below. At most three behaviors draw at once — tracking more turns the
 * legend into toggles for choosing which three (see logic.ts).
 * The plot spans the first logged day through the last (see intensityByDay):
 * the first dot is at the left inset, the newest at the right. Dots appear
 * only on days with logs; each line joins its own dots straight across
 * skipped days. At most 30 days show at once — past that the plot scrolls
 * sideways inside its fixed-width frame, opening on the newest end.
 */
export function IntensityChart({
  points,
  series,
  visibleIds: visibleIdsProp,
  onToggleHabit,
}: {
  points: DayPoint[];
  series?: IntensitySeries[];
  visibleIds?: string[];
  onToggleHabit?: (habitId: string) => void;
}) {
  const { colors, habitColors } = useTheme();
  const [picked, setPicked] = useState<string[] | null>(null);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const totalWidth = useWindowDimensions().width - gutter * 2;
  const viewportWidth = totalWidth - space.lg - space.sm;
  const contentWidth = intensityChartContentWidth(points.length, viewportWidth, EDGE_INSET);
  const scrollable = contentWidth > viewportWidth;
  const drawn: IntensitySeries[] = series && series.length > 0
    ? series
    : [{ habitId: 'all', label: '', points }];
  const allIds = drawn.map((s) => s.habitId);
  // Controlled when the screen shares one pick across every chart; otherwise
  // the chart keeps its own pick so it still works on its own.
  const visibleIds = visibleIdsProp ?? resolveVisibleHabitIds(picked, allIds);
  const toggleHabit = (habitId: string) => {
    if (onToggleHabit) onToggleHabit(habitId);
    else setPicked(toggleVisibleHabitId(visibleIds, habitId, allIds));
  };
  const canToggle = drawn.length > MAX_VISIBLE_HABITS;
  const visible = drawn.filter((s) => visibleIds.includes(s.habitId));
  const drawnWithData = visible.map((s) => ({
    ...s,
    withData: s.points
      .map((p, i) => ({ p, i }))
      .filter((d): d is { p: DayPoint & { avg: number }; i: number } => d.p.avg !== null),
  }));
  // Open (and stay, until the user scrolls) on the newest end when scrollable.
  const showNewest = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, []);
  if (drawnWithData.every((s) => s.withData.length === 0)) return null;
  const x = (i: number) => intensityPointX(i, points.length, contentWidth, EDGE_INSET);
  const y = (v: number) => CHART_H - ((v - 1) / 9) * (CHART_H - PLOT_PAD * 2) - PLOT_PAD;
  const first = points[0]!;
  const last = points[points.length - 1]!;
  // Colors follow the visible order, so the three lines on screen are
  // always the three brand colors — amber, sage, muted — in that order.
  const colorFor = (habitId: string) => habitColors[Math.max(0, visibleIds.indexOf(habitId)) % habitColors.length]!;
  return (
    <View style={styles.chart}>
      <View style={styles.chartRow}>
        <View style={[styles.yLabels, { height: CHART_H }]}>
          {/* Each label is centered on its own gridline, at any text size. */}
          {[10, 5, 1].map((v) => (
            <View key={v} style={[styles.yTick, { top: y(v) }]}>
              <Label>{v}</Label>
            </View>
          ))}
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
              {drawnWithData.map((s) => {
                const color = colorFor(s.habitId);
                const line = s.withData.map((d) => `${x(d.i)},${y(d.p.avg)}`).join(' ');
                return s.withData.length > 1 ? (
                  <Polyline key={s.habitId} points={line} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                ) : null;
              })}
              {drawnWithData.map((s) => {
                const color = colorFor(s.habitId);
                return s.withData.map((d) => (
                  <Circle key={`${s.habitId}-${d.i}`} cx={x(d.i)} cy={y(d.p.avg)} r={5} fill={color} stroke={colors.bg} strokeWidth={2} />
                ));
              })}
            </Svg>
            <View style={[styles.axisRow, { paddingHorizontal: EDGE_INSET }]}>
              <Label>{formatDayLabel(first.date)}</Label>
              {points.length > 1 ? <Label>{formatDayLabel(last.date)}</Label> : null}
            </View>
          </View>
        </ScrollView>
      </View>
      {drawn.length > 1 && !canToggle ? (
        <View style={styles.legend}>
          {visible.map((s) => (
            <View key={s.habitId} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colorFor(s.habitId) }]} />
              <Label>{s.label}</Label>
            </View>
          ))}
        </View>
      ) : null}
      {canToggle ? (
        <View style={styles.toggleGroup}>
          <Label>{copy.showingThree}</Label>
          <View style={styles.legend}>
            {drawn.map((s) => {
              const on = visibleIds.includes(s.habitId);
              return (
                <Pressable
                  key={s.habitId}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={s.label}
                  onPress={() => toggleHabit(s.habitId)}
                  style={({ pressed }) => [styles.toggleItem, pressed && styles.pressed]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: on ? colorFor(s.habitId) : colors.border },
                    ]}
                  />
                  <Text style={[type.label, { color: on ? colors.text : colors.muted }]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/**
 * 24 hour buckets as quiet bars. With one behavior the busiest hour is the
 * one warm bar. With several, each hour's bar stacks the visible behaviors
 * (at most three, same brand colors and order as the intensity lines), so
 * the bar's total height is still that hour's craving count.
 */
export function HourChart({ buckets, series }: { buckets: number[]; series?: HourSeries[] }) {
  const { colors, habitColors } = useTheme();
  const [accent] = chartColors(colors);
  const width = useWindowDimensions().width - gutter * 2;
  const max = Math.max(1, ...buckets);
  const bw = width / 24;
  const plotH = CHART_H - PLOT_PAD;
  const stacked = series && series.length > 0 ? series : null;
  return (
    <View style={styles.chart}>
      <Svg width={width} height={CHART_H} accessibilityLabel={copy.hourChartAlt}>
        {stacked
          ? buckets.map((_, h) => {
              let cum = 0;
              return stacked.map((s, si) => {
                const n = s.buckets[h] ?? 0;
                if (n === 0) return null;
                const y = CHART_H - ((cum + n) / max) * plotH;
                const height = (n / max) * plotH;
                cum += n;
                return (
                  <Rect
                    key={`${s.habitId}-${h}`}
                    x={h * bw + 1}
                    y={y}
                    width={Math.max(2, bw - 2)}
                    height={Math.max(2, height)}
                    fill={habitColors[si % habitColors.length]}
                  />
                );
              });
            })
          : buckets.map((n, h) => (
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
      {/* Four equal quarters, so each label starts under its own hour's bar. */}
      <View style={styles.axisRow}>
        {[0, 6, 12, 18].map((h) => (
          <View key={h} style={styles.hourTick}>
            <Label>{formatHour(h)}</Label>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Horizontal bars for top contexts / feelings / helpers. Without a
 * per-behavior split the bar is the single warm fill it has always been.
 * With `byHabit` segments (and `habitOrder` giving each habit its place in
 * the brand palette) the same bar splits into the visible behaviors'
 * shares — same colors, same order as every other chart on the page.
 */
export function BarList({
  rows,
  suffix,
  habitOrder,
}: {
  rows: BarRow[];
  suffix?: string;
  habitOrder?: readonly string[];
}) {
  const { colors, habitColors } = useTheme();
  const [accent] = chartColors(colors);
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return null;
  const segmentColor = (habitId: string) => {
    const index = habitOrder ? habitOrder.indexOf(habitId) : -1;
    return habitColors[Math.max(0, index) % habitColors.length]!;
  };
  return (
    <View style={styles.list}>
      {rows.map((r) => (
        <View key={r.name} style={styles.row}>
          <View style={styles.label}>
            <Body>{r.name}</Body>
            <Body muted>{suffix ? `${r.count} ${suffix}` : String(r.count)}</Body>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}>
            {r.byHabit && r.byHabit.length > 0 ? (
              <View style={[styles.segments, { width: `${(r.count / max) * 100}%` }]}>
                {r.byHabit.map((seg) => (
                  <View
                    key={seg.habitId}
                    style={{ flex: seg.value, backgroundColor: segmentColor(seg.habitId) }}
                  />
                ))}
              </View>
            ) : (
              <View
                style={[styles.fill, { backgroundColor: accent, width: `${(r.count / max) * 100}%` }]}
              />
            )}
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
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  toggleGroup: { gap: space.sm },
  toggleItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: touch.min },
  pressed: { opacity: 0.7 },
  legendDot: { width: space.sm + space.xs, height: space.sm + space.xs, borderRadius: space.xs },
  yLabels: { width: space.lg },
  yTick: { position: 'absolute', right: 0, height: 0, justifyContent: 'center' },
  hourTick: { flex: 1 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between' },
  list: { gap: space.md },
  row: { gap: space.sm },
  label: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  track: { height: space.md, borderRadius: space.xs, overflow: 'hidden' },
  fill: { height: space.md, borderRadius: space.xs, minWidth: space.sm },
  segments: { height: space.md, flexDirection: 'row', minWidth: space.sm },
});
