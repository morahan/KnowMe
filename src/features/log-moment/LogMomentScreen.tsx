import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { listHabits } from '@/db/repos/habits';
import { insertMoment } from '@/db/repos/moments';
import { CONTEXTS, FEELINGS, HELPERS, type Habit } from '@/db/schema';
import { useSafety } from '@/features/safety';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { IntensityPicker } from '@/ui/IntensityPicker';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { emptyDraft, isReady, toNewMoment, type LogDraft } from './logic';

const toggleIn = <T,>(xs: T[], x: T): T[] => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

export function LogMomentScreen() {
  const { colors } = useTheme();
  const { guard } = useSafety();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [draft, setDraft] = useState<LogDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void listHabits().then((hs) => {
      setHabits(hs);
      if (hs[0]) setDraft((d) => ({ ...d, habitId: d.habitId ?? hs[0]!.id }));
    });
  }, []);

  const save = useCallback(async () => {
    if (!isReady(draft)) return;
    // Crisis check before anything is saved (SAFETY.md §1).
    if (guard(draft.note)) return;
    setSaving(true);
    try {
      await insertMoment(toNewMoment(draft));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDraft(emptyDraft);
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  }, [draft, guard]);

  if (habits.length === 0) {
    return (
      <Screen>
        <Title>{copy.title}</Title>
        <Body muted>{copy.noHabit}</Body>
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      footer={
        <PrimaryButton label={copy.save} disabled={!isReady(draft) || saving} onPress={() => void save()} />
      }
    >
      <Title>{copy.title}</Title>

      {habits.length > 1 ? (
        <View style={styles.group}>
          <Label>{copy.habit}</Label>
          <View style={styles.chips}>
            {habits.map((h) => (
              <Chip
                key={h.id}
                label={h.name}
                selected={draft.habitId === h.id}
                onPress={() => setDraft((d) => ({ ...d, habitId: h.id }))}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.group}>
        <Label>{copy.intensity}</Label>
        <IntensityPicker
          value={draft.intensity}
          onChange={(n) => setDraft((d) => ({ ...d, intensity: n }))}
        />
      </View>

      <View style={styles.group}>
        <Label>{copy.context}</Label>
        <View style={styles.chips}>
          {CONTEXTS.map((c) => (
            <Chip key={c} label={c} selected={draft.context === c} onPress={() => setDraft((d) => ({ ...d, context: c }))} />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Label>{copy.feelings}</Label>
        <View style={styles.chips}>
          {FEELINGS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={draft.feelings.includes(f)}
              onPress={() => setDraft((d) => ({ ...d, feelings: toggleIn(d.feelings, f) }))}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Label>{copy.outcome}</Label>
        <View style={styles.chips}>
          <Chip label={copy.rodeItOut} selected={draft.outcome === 'rode_it_out'} onPress={() => setDraft((d) => ({ ...d, outcome: 'rode_it_out' }))} />
          <Chip label={copy.used} selected={draft.outcome === 'used'} onPress={() => setDraft((d) => ({ ...d, outcome: 'used' }))} />
        </View>
      </View>

      {draft.outcome === 'rode_it_out' ? (
        <View style={styles.group}>
          <Label>{copy.helpers}</Label>
          <View style={styles.chips}>
            {HELPERS.map((h) => (
              <Chip
                key={h}
                label={h}
                selected={draft.helpers.includes(h)}
                onPress={() => setDraft((d) => ({ ...d, helpers: toggleIn(d.helpers, h) }))}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.group}>
        <Label>{copy.note}</Label>
        <TextInput
          accessibilityLabel={copy.note}
          placeholder={copy.note}
          placeholderTextColor={colors.muted}
          value={draft.note}
          onChangeText={(t) => setDraft((d) => ({ ...d, note: t }))}
          multiline
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: {
    ...type.body,
    minHeight: touch.min,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
