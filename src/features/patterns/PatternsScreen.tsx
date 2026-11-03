import { useFocusEffect } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme';
import { Body } from '@/ui/Body';
import { Screen } from '@/ui/Screen';
import { SectionSeparator } from '@/ui/SectionSeparator';
import { SectionTitle } from '@/ui/SectionTitle';
import { Stat } from '@/ui/Stat';
import { Title } from '@/ui/Title';
import { BarList, HourChart, IntensityChart } from './components/Charts';
import { copy } from './copy';
import { usePatterns } from './hooks';
import {
  byHour, helperSuccess, helpersInsight, intensityByDay, intensityInsight, peakHourLabel, rideOutRate, topContexts, topFeelings,
} from './logic';

type Props = { footer?: ReactNode };

export function PatternsScreen({ footer }: Props) {
  const { moments, isSample, reload } = usePatterns();
  useFocusEffect(() => {
    void reload();
  });

  if (moments === null) {
    return (
      <Screen scroll>
        <Title>{copy.title}</Title>
        <Body muted>{copy.loading}</Body>
      </Screen>
    );
  }

  if (moments.length === 0) {
    return (
      <Screen scroll>
        <Title>{copy.title}</Title>
        <Body muted>{copy.empty}</Body>
        {footer}
      </Screen>
    );
  }

  const points = intensityByDay(moments);
  const rate = rideOutRate(moments);
  const helpers = helperSuccess(moments);
  const peak = peakHourLabel(moments);
  const trend = intensityInsight(points);

  return (
    <Screen scroll>
      <Title>{isSample ? copy.titleSample : copy.title}</Title>
      {isSample ? <Body>{copy.sampleNotice}</Body> : null}

      <View style={styles.section}>
        <SectionTitle>{copy.intensityTitle}</SectionTitle>
        {trend ? <Body>{trend}</Body> : null}
        <IntensityChart points={points} />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.hoursTitle}</SectionTitle>
        {peak ? <Body>{peak}</Body> : null}
        <HourChart buckets={byHour(moments)} />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.contextsTitle}</SectionTitle>
        <BarList rows={topContexts(moments)} suffix={copy.times} />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.feelingsTitle}</SectionTitle>
        <BarList rows={topFeelings(moments)} suffix={copy.times} />
      </View>

      <SectionSeparator />

      <View style={styles.section}>
        <SectionTitle>{copy.helpersTitle}</SectionTitle>
        {rate !== null ? <Stat value={`${Math.round(rate * 100)}%`} label={copy.rodeRate} /> : null}
        {helpersInsight(helpers) ? <Body>{helpersInsight(helpers)}</Body> : null}
        <BarList
          rows={helpers.map((h) => ({ name: h.name, count: Math.round(h.rate * 100) }))}
          suffix={copy.percentRode}
        />
      </View>

      {isSample ? null : footer}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
});
