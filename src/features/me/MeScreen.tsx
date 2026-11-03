import { useCallback, useEffect, useState } from 'react';
import { Linking, Share, StyleSheet, TextInput, View } from 'react-native';
import { addHabit, listHabits, removeHabit } from '@/db/repos/habits';
import { listReasons, MAX_REASONS, replaceReasons } from '@/db/repos/reasons';
import type { Habit } from '@/db/schema';
import { useSafety } from '@/features/safety';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';

type Props = {
  demoOn?: boolean;
  onLoadDemo?: () => void;
  onClearDemo?: () => void;
};

export function MeScreen({ demoOn = false, onLoadDemo, onClearDemo }: Props) {
  const { colors } = useTheme();
  const { guard } = useSafety();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [hs, rs] = await Promise.all([listHabits(), listReasons()]);
    setHabits(hs);
    setReasons(rs.length > 0 ? rs.map((r) => r.text) : ['']);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  const saveReasons = async () => {
    const cleaned = reasons.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);
    if (guard(...cleaned)) return;
    await replaceReasons(cleaned);
    setSaved(true);
  };

  return (
    <Screen scroll>
      <Title>{copy.habitsTitle}</Title>
      <View style={styles.list}>
        {habits.map((h) => (
          <View key={h.id} style={styles.row}>
            <Body>{h.name}</Body>
            <QuietLink
              label={copy.remove}
              onPress={() => {
                void removeHabit(h.id).then(load);
              }}
            />
          </View>
        ))}
      </View>
      <TextInput
        accessibilityLabel={copy.addHabitPlaceholder}
        placeholder={copy.addHabitPlaceholder}
        placeholderTextColor={colors.muted}
        value={newHabit}
        onChangeText={setNewHabit}
        style={inputStyle}
      />
      <QuietLink
        label={copy.add}
        onPress={() => {
          const name = newHabit.trim();
          if (!name || guard(name)) return;
          void addHabit(name, 'custom').then(() => {
            setNewHabit('');
            void load();
          });
        }}
      />

      <Title>{copy.reasonsTitle}</Title>
      <Body muted>{copy.reasonsBody}</Body>
      <View style={styles.list}>
        {reasons.map((r, i) => (
          <TextInput
            key={i}
            accessibilityLabel={`${copy.reasonPlaceholder} ${i + 1}`}
            placeholder={copy.reasonPlaceholder}
            placeholderTextColor={colors.muted}
            value={r}
            onChangeText={(t) => {
              setSaved(false);
              setReasons((prev) => prev.map((x, j) => (j === i ? t : x)));
            }}
            style={inputStyle}
          />
        ))}
      </View>
      {reasons.filter((r) => r.trim()).length < MAX_REASONS ? (
        <QuietLink label={copy.addReason} onPress={() => setReasons((prev) => [...prev, ''])} />
      ) : null}
      <PrimaryButton label={copy.saveReasons} onPress={() => void saveReasons()} />
      {saved ? <Label>{copy.saved}</Label> : null}

      {onLoadDemo && onClearDemo ? (
        <>
          <Title>{copy.demoTitle}</Title>
          <Body muted>{copy.demoBody}</Body>
          <Label>{demoOn ? copy.demoOn : copy.demoOff}</Label>
          <View style={styles.list}>
            <QuietLink label={copy.loadDemo} onPress={onLoadDemo} />
            <QuietLink label={copy.clearDemo} onPress={onClearDemo} />
          </View>
        </>
      ) : null}

      <Title>{copy.supportTitle}</Title>
      <View style={styles.list}>
        <QuietLink label={copy.lifeline} onPress={() => Linking.openURL('tel:988')} />
        <QuietLink label={copy.samhsa} onPress={() => Linking.openURL('tel:18006624357')} />
        <QuietLink label={copy.quitNow} onPress={() => Linking.openURL('tel:18007848669')} />
        <QuietLink label={copy.tellSomeone} onPress={() => Share.share({ message: copy.tellSomeoneMessage })} />
      </View>

      <Title>{copy.privacyTitle}</Title>
      <Body muted>{copy.privacyBody}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    ...type.body,
    minHeight: touch.min,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
