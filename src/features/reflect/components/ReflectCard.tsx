import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { motion, space } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { FadeIn } from '@/ui/FadeIn';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Title } from '@/ui/Title';
import { copy } from '../copy';
import { useReflection } from '../hooks';
import { ThinkingGnome } from './ThinkingGnome';

function Letter({ lines }: { lines: string[] }) {
  return (
    <View style={styles.letter}>
      {lines.map((line, i) => (
        <FadeIn key={`${i}-${line.slice(0, 12)}`} delay={i * motion.base}>
          <Body letter>{line}</Body>
        </FadeIn>
      ))}
      <FadeIn delay={lines.length * motion.base}>
        <Label>{copy.attribution}</Label>
      </FadeIn>
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
        <FadeIn>
          <ThinkingGnome />
        </FadeIn>
      ) : (
        // Keyed by status so returning from an error fades in too.
        <FadeIn key={state.status} style={styles.idle}>
          <Body muted>{state.status === 'error' ? copy.error : copy.intro}</Body>
          <View style={styles.toggle}>
            <Chip label={copy.includeNotes} selected={includeNotes} onPress={() => setIncludeNotes((v) => !v)} />
            <Label>{copy.includeNotesHint}</Label>
          </View>
          <PrimaryButton label={copy.button} onPress={() => reflect(includeNotes)} />
        </FadeIn>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  letter: { gap: space.md },
  idle: { gap: space.md },
  toggle: { gap: space.sm, alignItems: 'flex-start' },
});
