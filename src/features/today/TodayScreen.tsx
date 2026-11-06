import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getSetting, setSetting } from '@/db/repos/settings';
import { habitLabel } from '@/lib/habits';
import { radius, space, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { OutlineButton } from '@/ui/OutlineButton';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { SectionTitle } from '@/ui/SectionTitle';
import { Stat } from '@/ui/Stat';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { useToday } from './hooks';
import { momentHabitLabel } from './logic';

export function TodayScreen() {
  const { data, reload } = useToday();
  const { colors } = useTheme();
  // A first-days note pointing to Me, until it is dismissed or followed.
  const [showWelcome, setShowWelcome] = useState(false);
  const dismissWelcome = () => {
    setShowWelcome(false);
    void setSetting(WELCOME_KEY, '1');
  };

  // First launch: the short Gnome walkthrough once, then setup, until done or skipped.
  useEffect(() => {
    void Promise.all([getSetting('onboarded'), getSetting('onboarding_seen')]).then(([done, seen]) => {
      if (done) {
        void getSetting(WELCOME_KEY).then((dismissed) => setShowWelcome(!dismissed));
        return;
      }
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
    <Screen
      scroll
      scrollTopKey="index"
      footer={<PrimaryButton label={copy.imInIt} onPress={() => router.push('/in-it')} />}
    >
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        accessibilityLabel={copy.logoAlt}
        resizeMode="contain"
      />
      <Title>{copy.title}</Title>

      {showWelcome ? (
        <View style={[styles.welcome, { backgroundColor: colors.surface }]}>
          <SectionTitle>{copy.welcomeTitle}</SectionTitle>
          <Body muted>{copy.welcomeBody}</Body>
          <View style={styles.welcomeActions}>
            <QuietLink
              label={copy.welcomeOpenMe}
              onPress={() => {
                dismissWelcome();
                router.navigate('/me');
              }}
            />
            <QuietLink label={copy.welcomeDismiss} onPress={dismissWelcome} />
          </View>
        </View>
      ) : null}

      {data === null ? (
        <Body muted>{copy.loading}</Body>
      ) : data.habits.length === 0 ? (
        <View style={styles.block}>
          <Body muted>{copy.noHabit}</Body>
          <OutlineButton label={copy.getStarted} onPress={() => router.push('/setup')} />
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
        <SectionTitle>{copy.today}</SectionTitle>
        {data && data.today.length > 0 ? (
          data.today.map((m) => {
            const tagged = momentHabitLabel(
              m,
              data.habits.map((h) => h.habit),
            );
            return (
              <Body key={m.id} muted>
                {`${formatTime(m.created_at)}${tagged ? ` · ${tagged}` : ''} · ${copy.intensityWord} ${m.intensity}`}
              </Body>
            );
          })
        ) : (
          <Body muted>{copy.empty}</Body>
        )}
      </View>
    </Screen>
  );
}

const WELCOME_KEY = 'today_welcome_dismissed';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const styles = StyleSheet.create({
  logo: { width: space.xxl, height: space.xxl, alignSelf: 'center', marginTop: space.md },
  block: { gap: space.sm, marginTop: space.lg },
  welcome: { gap: space.sm, marginTop: space.lg, padding: space.md, borderRadius: radius.md },
  welcomeActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  habit: { alignItems: 'center', paddingVertical: space.md },
});
