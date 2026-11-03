import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { insertMoment } from '@/db/repos/moments';
import { habitLabel } from '@/lib/habits';
import { visibleReasons } from '@/lib/reasons';
import { motion, space, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { BreathCircle } from '@/ui/BreathCircle';
import { Chip } from '@/ui/Chip';
import { FadeIn } from '@/ui/FadeIn';
import { IntensityPicker } from '@/ui/IntensityPicker';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { useInIt } from './hooks';
import { SESSION_SECONDS, formatCountdown, needsHabitPick, resolveHabit, topHelpersForHabit } from './logic';

export function InItScreen() {
  const data = useInIt();
  const { colors } = useTheme();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [manualCheck, setManualCheck] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);

  const habits = data?.habits ?? [];
  const habit = data ? resolveHabit(habits, selectedHabitId) : null;
  const picking = data !== null && needsHabitPick(habits, selectedHabitId);
  const checking = !picking && data !== null && (manualCheck || secondsLeft === 0);
  const helpers = data ? topHelpersForHabit(data.moments, habit?.id ?? null) : [];
  const shownReasons = data ? visibleReasons(data.reasons, habit?.id ?? null, habits.length) : [];

  // The 20 minutes only run once we know what this moment is about.
  useEffect(() => {
    if (data === null || picking || checking) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [data, picking, checking]);

  const save = async () => {
    if (habit && intensity !== null) {
      await insertMoment({
        habit_id: habit.id,
        intensity,
        context: 'home',
        feelings: [],
        outcome: 'rode_it_out',
        helpers: [],
        note: null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  if (data === null) {
    return (
      <Screen footer={<QuietLink label={copy.close} onPress={() => router.back()} />}>
        <View style={styles.center}>
          <Body muted>{copy.loading}</Body>
        </View>
      </Screen>
    );
  }

  if (picking) {
    return (
      <Screen footer={<QuietLink label={copy.close} onPress={() => router.back()} />}>
        <FadeIn style={styles.pick}>
          <Title>{copy.whichOne}</Title>
          <Body muted>{copy.whichOneBody}</Body>
          <View style={styles.options}>
            {habits.map((h) => (
              <Chip key={h.id} label={habitLabel(h)} selected={false} onPress={() => setSelectedHabitId(h.id)} />
            ))}
          </View>
        </FadeIn>
      </Screen>
    );
  }

  if (checking) {
    return (
      <Screen footer={<PrimaryButton label={copy.save} disabled={intensity === null} onPress={() => void save()} />}>
        <FadeIn style={styles.center}>
          <Title>{copy.whereNow}</Title>
          <IntensityPicker value={intensity} onChange={setIntensity} />
          <QuietLink label={copy.close} onPress={() => router.back()} />
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <PrimaryButton label={copy.through} onPress={() => setManualCheck(true)} />
          <QuietLink label={copy.close} onPress={() => router.back()} />
        </View>
      }
    >
      {shownReasons.length > 0 ? (
        <View style={styles.reasons}>
          <Label>{copy.yourReasons}</Label>
          {shownReasons.map((r, i) => (
            <FadeIn key={r.id} delay={motion.slow * (i + 1)}>
              <Body>{r.text}</Body>
            </FadeIn>
          ))}
        </View>
      ) : null}

      <FadeIn style={styles.center}>
        {habits.length > 1 && habit ? <Label>{habitLabel(habit)}</Label> : null}
        <BreathCircle inLabel={copy.breatheIn} outLabel={copy.breatheOut} />
        {/* Fixed-width digits so the countdown ticks without shifting. */}
        <Text style={[type.label, styles.countdown, { color: colors.muted }]}>{formatCountdown(secondsLeft)}</Text>
      </FadeIn>

      {helpers.length > 0 ? (
        <FadeIn style={styles.helpers} delay={motion.slow * (shownReasons.length + 1)}>
          <Label>{copy.whatHelps}</Label>
          <Body muted>{helpers.join(' · ')}</Body>
        </FadeIn>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
  reasons: { gap: space.md, paddingTop: space.xl },
  helpers: { gap: space.sm, paddingBottom: space.lg, alignItems: 'center' },
  footer: { gap: space.md },
  countdown: { fontVariant: ['tabular-nums'] },
  pick: { gap: space.md, paddingTop: space.lg },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
});
