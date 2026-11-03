import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
import {
  CUSTOM_INPUT_MAX_CHARS, MAX_TAG_CHARS, addCustomTag, canAddCustomTag, customTags, emptyDraft, isReady,
  normalizeTag, removeTag, toNewMoment, type LogDraft,
} from './logic';

const toggleIn = (xs: string[], x: string): string[] => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

type TagGroupProps = {
  label: string;
  presets: readonly string[];
  selected: string[];
  otherOpen: boolean;
  otherText: string;
  onTogglePreset: (tag: string) => void;
  onToggleOther: () => void;
  onOtherTextChange: (text: string) => void;
  onAddOther: () => void;
  onRemoveCustom: (tag: string) => void;
};

function TagGroup(p: TagGroupProps) {
  const { colors } = useTheme();
  const customs = customTags(p.selected, p.presets);
  const atMax = !canAddCustomTag(p.selected, p.presets);
  const tag = normalizeTag(p.otherText);
  const trimmed = p.otherText.trim().replace(/\s+/g, ' ');
  return (
    <View style={styles.group}>
      <Label>{p.label}</Label>
      <View style={styles.chips}>
        {p.presets.map((preset) =>
          preset === 'other' ? (
            <Chip key={preset} label={copy.other} selected={p.otherOpen} onPress={p.onToggleOther} />
          ) : (
            <Chip key={preset} label={preset} selected={p.selected.includes(preset)} onPress={() => p.onTogglePreset(preset)} />
          ),
        )}
        {customs.map((tagName) => (
          <Chip key={tagName} label={`${tagName} ×`} selected onPress={() => p.onRemoveCustom(tagName)} />
        ))}
      </View>
      {customs.length > 0 ? <Label>{copy.removeCustomHint}</Label> : null}
      {p.otherOpen ? (
        <View style={styles.otherBox}>
          <View style={styles.otherRow}>
            <TextInput
              accessibilityLabel={copy.otherPlaceholder}
              placeholder={copy.otherPlaceholder}
              placeholderTextColor={colors.muted}
              value={p.otherText}
              onChangeText={p.onOtherTextChange}
              maxLength={CUSTOM_INPUT_MAX_CHARS}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={p.onAddOther}
              style={[styles.otherInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !tag || atMax }}
              onPress={p.onAddOther}
              style={({ pressed }) => [styles.addButton, { borderColor: colors.border }, pressed && styles.pressed]}
            >
              <Text style={[type.label, { color: !tag || atMax ? colors.muted : colors.text }]}>{copy.addTag}</Text>
            </Pressable>
          </View>
          {atMax ? (
            <Label>{copy.maxCustomTags}</Label>
          ) : tag && trimmed.length > MAX_TAG_CHARS ? (
            <Label>{`Saved as “${tag}”`}</Label>
          ) : tag ? (
            <Label>{`${tag.length}/${MAX_TAG_CHARS}`}</Label>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function LogMomentScreen() {
  const { colors } = useTheme();
  const { guard } = useSafety();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [draft, setDraft] = useState<LogDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  // Other stays tappable at the custom-tag max; only Add pauses until one is removed.
  const [otherOpen, setOtherOpen] = useState({ feelings: false, helpers: false });
  const [otherText, setOtherText] = useState({ feelings: '', helpers: '' });

  const addOther = useCallback(
    (group: 'feelings' | 'helpers', presets: readonly string[]) => {
      const raw = otherText[group];
      if (!normalizeTag(raw)) return;
      if (guard(raw)) return;
      const next = addCustomTag(draft[group], raw, presets);
      // Unchanged means empty, duplicate, or at the max: keep the text so
      // removing a custom tag below lets the same words be added.
      if (next.join('\u0000') === draft[group].join('\u0000')) return;
      setDraft((d) => ({ ...d, [group]: next }));
      setOtherText((t) => ({ ...t, [group]: '' }));
      setOtherOpen((o) => ({ ...o, [group]: false }));
    },
    [draft, guard, otherText],
  );

  // Tabs stay mounted, so reload on focus: after a save the draft is empty
  // and needs the default habit again, or Save would stay disabled forever.
  useFocusEffect(
    useCallback(() => {
      void listHabits().then((hs) => {
        setHabits(hs);
        if (hs[0]) setDraft((d) => ({ ...d, habitId: d.habitId ?? hs[0]!.id }));
      });
    }, []),
  );

  const save = useCallback(async () => {
    if (!isReady(draft)) return;
    // Crisis check before anything is saved (SAFETY.md §1).
    if (guard(draft.note, ...draft.feelings, ...draft.helpers)) return;
    setSaving(true);
    try {
      await insertMoment(toNewMoment(draft));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDraft(emptyDraft);
      setOtherOpen({ feelings: false, helpers: false });
      setOtherText({ feelings: '', helpers: '' });
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

      <TagGroup
        label={copy.feelings}
        presets={FEELINGS}
        selected={draft.feelings}
        otherOpen={otherOpen.feelings}
        otherText={otherText.feelings}
        onTogglePreset={(f) => setDraft((d) => ({ ...d, feelings: toggleIn(d.feelings, f) }))}
        onToggleOther={() => setOtherOpen((o) => ({ ...o, feelings: !o.feelings }))}
        onOtherTextChange={(t) => setOtherText((x) => ({ ...x, feelings: t }))}
        onAddOther={() => addOther('feelings', FEELINGS)}
        onRemoveCustom={(t) => setDraft((d) => ({ ...d, feelings: removeTag(d.feelings, t) }))}
      />

      <View style={styles.group}>
        <Label>{copy.outcome}</Label>
        <View style={styles.chips}>
          <Chip label={copy.rodeItOut} selected={draft.outcome === 'rode_it_out'} onPress={() => setDraft((d) => ({ ...d, outcome: 'rode_it_out' }))} />
          <Chip label={copy.used} selected={draft.outcome === 'used'} onPress={() => setDraft((d) => ({ ...d, outcome: 'used' }))} />
        </View>
      </View>

      {draft.outcome === 'rode_it_out' ? (
        <TagGroup
          label={copy.helpers}
          presets={HELPERS}
          selected={draft.helpers}
          otherOpen={otherOpen.helpers}
          otherText={otherText.helpers}
          onTogglePreset={(h) => setDraft((d) => ({ ...d, helpers: toggleIn(d.helpers, h) }))}
          onToggleOther={() => setOtherOpen((o) => ({ ...o, helpers: !o.helpers }))}
          onOtherTextChange={(t) => setOtherText((x) => ({ ...x, helpers: t }))}
          onAddOther={() => addOther('helpers', HELPERS)}
          onRemoveCustom={(t) => setDraft((d) => ({ ...d, helpers: removeTag(d.helpers, t) }))}
        />
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
  pressed: { opacity: 0.7 },
  otherBox: { gap: space.sm },
  otherRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  otherInput: {
    ...type.body,
    flex: 1,
    minHeight: touch.min,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  addButton: {
    minHeight: touch.min,
    paddingHorizontal: space.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  input: {
    ...type.body,
    minHeight: touch.min,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
