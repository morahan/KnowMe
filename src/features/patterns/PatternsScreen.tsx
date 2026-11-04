import { useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme';
import { Body } from '@/ui/Body';
import { Screen } from '@/ui/Screen';
import { SectionSeparator } from '@/ui/SectionSeparator';
import { SectionTitle } from '@/ui/SectionTitle';
import { Stat } from '@/ui/Stat';
import { Title } from '@/ui/Title';
import { habitLabel } from '@/lib/habits';
import { BarList, HabitLegend, HourChart, IntensityChart } from './components/Charts';
import { copy } from './copy';
import { usePatterns } from './hooks';
import {
  byHour, byHourByHabit, helperRodeByHabit, helpersInsight, intensityByDay, intensityByDayByHabit, intensityInsight, peakHourLabel, resolveVisibleHabitIds, rideOutRate, toggleVisibleHabitId, topHelpers, topContexts, topContextsByHabit, topFeelings, topFeelingsByHabit,
} from './logic';

type Props = { footer?: ReactNode };

export function PatternsScreen({ footer }: Props) {
  const { moments, isSample, habits, reload } = usePatterns();
  // One pick for the whole page: the same (at most) three behaviors, in the
  // same order and brand colors, on every chart below.
  const [picked, setPicked] = useState<string[] | null>(null);
  // Must be memoized: a fresh callback each render re-runs the effect, and
  // reload sets state, so an inline arrow reloads forever while focused.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  if (moments === null) {
    return (
      <Screen scroll scrollTopKey="patterns">
        <Title>{copy.title}</Title>
        <Body muted>{copy.loading}</Body>
      </Screen>
    );
  }

  if (moments.length === 0) {
    return (
      <Screen scroll scrollTopKey="patterns">
        <Title>{copy.title}</Title>
        <Body muted>{copy.empty}</Body>
        {footer}
      </Screen>
    );
  }

  const points = intensityByDay(moments);
  const habitById = new Map(habits.map((h) => [h.id, h]));
  const labelFor = (habitId: string) => {
    const habit = habitById.get(habitId);
    return habit ? habitLabel(habit) : habitId;
  };
  const perHabit = isSample ? [] : intensityByDayByHabit(moments, habits.map((h) => h.id));
  const allIds = perHabit.map((s) => s.habitId);
  const multi = perHabit.length > 1;
  const visibleIds = resolveVisibleHabitIds(picked, allIds);
  const visibleMoments = multi ? moments.filter((m) => visibleIds.includes(m.habit_id)) : moments;
  const series = multi
    ? perHabit.map((s) => ({ ...s, label: labelFor(s.habitId) }))
    : undefined;
  const hourSeries = multi
    ? byHourByHabit(visibleMoments, visibleIds).map((s) => ({ ...s, label: labelFor(s.habitId) }))
    : undefined;
  const rodeByHabit = helperRodeByHabit(visibleMoments, visibleIds);
  const rate = rideOutRate(visibleMoments);
  const helpers = topHelpers(visibleMoments);
  const peak = peakHourLabel(visibleMoments);
  const trend = intensityInsight(points);

  return (
    <Screen scroll scrollTopKey="patterns">
      <Title>{isSample ? copy.titleSample : copy.title}</Title>
      {isSample ? <Body>{copy.sampleNotice}</Body> : null}
      {multi && series ? (
        <HabitLegend
          series={series}
          visibleIds={visibleIds}
          onToggleHabit={(id) => setPicked(toggleVisibleHabitId(visibleIds, id, allIds))}
        />
      ) : null}

      <View style={styles.section}>
        <SectionTitle>{copy.intensityTitle}</SectionTitle>
        {trend ? <Body>{trend}</Body> : null}
        <IntensityChart
          points={points}
          series={series}
          visibleIds={multi ? visibleIds : undefined}
          onToggleHabit={multi ? (id) => setPicked(toggleVisibleHabitId(visibleIds, id, allIds)) : undefined}
          hideLegend={multi}
        />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.hoursTitle}</SectionTitle>
        {peak ? <Body>{peak}</Body> : null}
        <HourChart buckets={byHour(visibleMoments)} series={hourSeries} />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.contextsTitle}</SectionTitle>
        <BarList
          rows={multi ? topContextsByHabit(visibleMoments, visibleIds) : topContexts(moments)}
          suffix={copy.times}
          habitOrder={multi ? visibleIds : undefined}
        />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.feelingsTitle}</SectionTitle>
        <BarList
          rows={multi ? topFeelingsByHabit(visibleMoments, visibleIds) : topFeelings(moments)}
          suffix={copy.times}
          habitOrder={multi ? visibleIds : undefined}
        />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.helpersTitle}</SectionTitle>
        {rate !== null ? <Stat value={`${Math.round(rate * 100)}%`} label={copy.rodeRate} /> : null}
        {helpersInsight(helpers) ? <Body>{helpersInsight(helpers)}</Body> : null}
        <BarList
          rows={helpers.map((h) => ({
            name: h.name,
            count: h.count,
            byHabit: multi ? (rodeByHabit[h.name] ?? []) : undefined,
          }))}
          suffix={copy.times}
          habitOrder={multi ? visibleIds : undefined}
        />
      </View>

      {isSample ? null : footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
});
