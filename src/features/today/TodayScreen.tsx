import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getSetting } from '@/db/repos/settings';
import { habitLabel } from '@/lib/habits';
import { space } from '@/theme';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Stat } from '@/ui/Stat';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { useToday } from './hooks';

export function TodayScreen() {
  const { data, reload } = useToday();

  // First launch: the short Gnome walkthrough once, then setup, until done or skipped.
  useEffect(() => {
    void Promise.all([getSetting('onboarded'), getSetting('onboarding_seen')]).then(([done, seen]) => {
      if (done) return;
      router.push(seen ? '/setup' : '/onboarding');
    });
  }, []);

  // Must be memoized: a fresh callback each render re-runs the effect, and
  // reload sets state, so an inline arrow reloads forever while focused.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return (
    <Screen footer={<PrimaryButton label={copy.imInIt} onPress={() => router.push('/in-it')} />}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        accessibilityLabel={copy.logoAlt}
        resizeMode="contain"
      />
      <Title>{copy.title}</Title>

      {data === null ? (
        <Body muted>{copy.loading}</Body>
      ) : data.habits.length === 0 ? (
        <View style={styles.block}>
          <Body muted>{copy.noHabit}</Body>
          <QuietLink label={copy.setUp} onPress={() => router.push('/setup')} />
        </View>
      ) : (
        <View style={styles.block}>
          {data.habits.map(({ habit, daysSince }) => (
            <View key={habit.id} style={styles.habit}>
              <Stat value={daysSince} label={`${copy.daysSince(daysSince)} · ${habitLabel(habit)}`} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.block}>
        <Label>{copy.today}</Label>
        {data && data.today.length > 0 ? (
          data.today.map((m) => (
            <Body key={m.id} muted>
              {`${formatTime(m.created_at)} · ${copy.intensityWord} ${m.intensity} · ${
                m.outcome === 'rode_it_out' ? copy.rodeItOut : copy.used
              }`}
            </Body>
          ))
        ) : (
          <Body muted>{copy.empty}</Body>
        )}
      </View>
    </Screen>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const styles = StyleSheet.create({
  logo: { width: space.xxl, height: space.xxl, alignSelf: 'center', marginTop: space.md },
  block: { gap: space.sm, marginTop: space.lg },
  habit: { alignItems: 'center', paddingVertical: space.md },
});
