import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { insertMoment } from '@/db/repos/moments';
import { motion, space } from '@/theme';
import { Body } from '@/ui/Body';
import { BreathCircle } from '@/ui/BreathCircle';
import { IntensityPicker } from '@/ui/IntensityPicker';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { useReduceMotion } from '@/ui/useReduceMotion';
import { copy } from './copy';
import { useInIt } from './hooks';
import { SESSION_SECONDS, formatCountdown } from './logic';

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

export function InItScreen() {
  const data = useInIt();
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [manualCheck, setManualCheck] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);
  const checking = manualCheck || secondsLeft === 0;

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const save = async () => {
    if (data?.habit && intensity !== null) {
      await insertMoment({
        habit_id: data.habit.id,
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
      {data && data.reasons.length > 0 ? (
        <View style={styles.reasons}>
          <Label>{copy.yourReasons}</Label>
          {data.reasons.map((r, i) => (
            <FadingReason key={r.id} text={r.text} index={i} />
          ))}
        </View>
      ) : null}

      <View style={styles.center}>
        <BreathCircle inLabel={copy.breatheIn} outLabel={copy.breatheOut} />
        <Label>{formatCountdown(secondsLeft)}</Label>
      </View>

      {data && data.helpers.length > 0 ? (
        <View style={styles.reasons}>
          <Label>{copy.whatHelps}</Label>
          <Body muted>{data.helpers.join(' · ')}</Body>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  reasons: { gap: space.sm, paddingTop: space.lg },
  footer: { gap: space.sm },
});
