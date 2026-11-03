import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { insertMoment } from '@/db/repos/moments';
import type { Habit } from '@/db/schema';
import { motion, radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { BreathCircle } from '@/ui/BreathCircle';
import { IntensityPicker } from '@/ui/IntensityPicker';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { useReduceMotion } from '@/ui/useReduceMotion';
import { copy } from './copy';
import { useInIt } from './hooks';
import { SESSION_SECONDS, formatCountdown, needsHabitPick, resolveHabit, topHelpersForHabit } from './logic';

function FadingReason({ text, index }: { text: string; index: number }) {
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: motion.slow,
      delay: index * motion.slow,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [index, opacity, reduceMotion]);
  return (
    <Animated.View style={{ opacity }}>
      <Body>{text}</Body>
    </Animated.View>
  );
}

function HabitOption({ habit, onPress }: { habit: Habit; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={habit.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.habitOption,
        { borderColor: colors.border, backgroundColor: colors.surface },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[type.body, styles.habitLabel, { color: colors.text }]}>{habit.name}</Text>
    </Pressable>
  );
}

export function InItScreen() {
  const data = useInIt();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [manualCheck, setManualCheck] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);

  const habits = data?.habits ?? [];
  const habit = data ? resolveHabit(habits, selectedHabitId) : null;
  const picking = data !== null && needsHabitPick(habits, selectedHabitId);
  const checking = !picking && data !== null && (manualCheck || secondsLeft === 0);
  const helpers = data ? topHelpersForHabit(data.moments, habit?.id ?? null) : [];

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
        <View style={styles.pick}>
          <Title>{copy.whichOne}</Title>
          <Body muted>{copy.whichOneBody}</Body>
          <View style={styles.options}>
            {habits.map((h) => (
              <HabitOption key={h.id} habit={h} onPress={() => setSelectedHabitId(h.id)} />
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  if (checking) {
    return (
      <Screen footer={<PrimaryButton label={copy.save} disabled={intensity === null} onPress={() => void save()} />}>
        <View style={styles.center}>
          <Label>{copy.whereNow}</Label>
          <IntensityPicker value={intensity} onChange={setIntensity} />
          <QuietLink label={copy.close} onPress={() => router.back()} />
        </View>
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
      {data.reasons.length > 0 ? (
        <View style={styles.reasons}>
          <Label>{copy.yourReasons}</Label>
          {data.reasons.map((r, i) => (
            <FadingReason key={r.id} text={r.text} index={i} />
          ))}
        </View>
      ) : null}

      <View style={styles.center}>
        {habits.length > 1 && habit ? <Label>{habit.name}</Label> : null}
        <BreathCircle inLabel={copy.breatheIn} outLabel={copy.breatheOut} />
        <Label>{formatCountdown(secondsLeft)}</Label>
      </View>

      {helpers.length > 0 ? (
        <View style={styles.reasons}>
          <Label>{copy.whatHelps}</Label>
          <Body muted>{helpers.join(' · ')}</Body>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  reasons: { gap: space.sm, paddingTop: space.lg },
  footer: { gap: space.sm },
  pick: { gap: space.md, paddingTop: space.lg },
  options: { gap: space.md, marginTop: space.md },
  habitOption: {
    minHeight: touch.min,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitLabel: { fontWeight: type.title.fontWeight },
  pressed: { opacity: 0.7 },
});
