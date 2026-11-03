import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { motion, space } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Title } from '@/ui/Title';
import { useReduceMotion } from '@/ui/useReduceMotion';
import { copy } from '../copy';
import { useReflection } from '../hooks';

function FadingView({ index, children }: { index: number; children: ReactNode }) {
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
      delay: index * motion.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [index, opacity, reduceMotion]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

function LoadingLine() {
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reduceMotion) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: motion.slow,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.slow,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, reduceMotion]);
  return (
    <Animated.View style={{ opacity }}>
      <Body muted>{copy.loading}</Body>
    </Animated.View>
  );
}

function Letter({ lines }: { lines: string[] }) {
  return (
    <View style={styles.letter}>
      {lines.map((line, i) => (
        <FadingView key={`${i}-${line.slice(0, 12)}`} index={i}>
          <Body letter>{line}</Body>
        </FadingView>
      ))}
      <FadingView index={lines.length}>
        <Label>{copy.attribution}</Label>
      </FadingView>
    </View>
  );
}

export function ReflectCard() {
  const { state, reflect, cached } = useReflection();
  const [includeNotes, setIncludeNotes] = useState(false);
  const lines = state.status === 'done' ? state.lines : cached;
  const loading = state.status === 'loading';

  return (
    <View style={styles.wrap}>
      <Title>{copy.title}</Title>

      {lines ? (
        <Letter lines={lines} />
      ) : loading ? (
        <>
          <LoadingLine />
          <PrimaryButton label={copy.loading} disabled onPress={() => undefined} />
        </>
      ) : (
        <>
          <Body muted>{state.status === 'error' ? copy.error : copy.intro}</Body>
          <View style={styles.toggle}>
            <Chip label={copy.includeNotes} selected={includeNotes} onPress={() => setIncludeNotes((v) => !v)} />
            <Label>{copy.includeNotesHint}</Label>
          </View>
          <PrimaryButton label={copy.button} onPress={() => reflect(includeNotes)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  letter: { gap: space.md },
  toggle: { gap: space.sm, alignItems: 'flex-start' },
});
