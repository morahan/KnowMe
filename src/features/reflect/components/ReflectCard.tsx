import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { motion, space } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Title } from '@/ui/Title';
import { useReduceMotion } from '@/ui/useReduceMotion';
import { copy } from '../copy';
import { useReflection } from '../hooks';

function FadingLine({ text, index }: { text: string; index: number }) {
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: motion.base,
      delay: index * motion.base,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [index, opacity, reduceMotion]);
  return (
    <Animated.View style={{ opacity }}>
      <Body letter>{text}</Body>
    </Animated.View>
  );
}

function Letter({ lines }: { lines: string[] }) {
  return (
    <View style={styles.letter}>
      {lines.map((line, i) => (
        <FadingLine key={`${i}-${line.slice(0, 12)}`} text={line} index={i} />
      ))}
      <Label>{copy.attribution}</Label>
    </View>
  );
}

export function ReflectCard() {
  const { state, reflect, cached } = useReflection();
  const [includeNotes, setIncludeNotes] = useState(false);
  const lines = state.status === 'done' ? state.lines : cached;

  return (
    <View style={styles.wrap}>
      <Title>{copy.title}</Title>

      {lines ? (
        <Letter lines={lines} />
      ) : (
        <>
          <Body muted>{state.status === 'error' ? copy.error : copy.intro}</Body>
          <View style={styles.toggle}>
            <Chip label={copy.includeNotes} selected={includeNotes} onPress={() => setIncludeNotes((v) => !v)} />
            <Label>{copy.includeNotesHint}</Label>
          </View>
          <PrimaryButton
            label={state.status === 'loading' ? copy.loading : copy.button}
            disabled={state.status === 'loading'}
            onPress={() => reflect(includeNotes)}
          />
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
