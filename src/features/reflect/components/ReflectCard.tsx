import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Title } from '@/ui/Title';
import { space } from '@/theme';
import { copy } from '../copy';
import { useReflection } from '../hooks';

export function ReflectCard() {
  const { state, reflect } = useReflection();
  const [includeNotes, setIncludeNotes] = useState(false);

  return (
    <View style={styles.wrap}>
      <Title>{copy.title}</Title>

      {state.status === 'done' ? (
        <View style={styles.letter}>
          {state.lines.map((line, i) => (
            <Body key={i} letter>
              {line}
            </Body>
          ))}
          <Label>{copy.attribution}</Label>
        </View>
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
