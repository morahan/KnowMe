import { useCallback, useEffect, useState } from 'react';
import { Linking, Share, StyleSheet, TextInput, View } from 'react-native';
import { addHabit, listHabits, removeHabit } from '@/db/repos/habits';
import { listAllReasons, MAX_REASONS, replaceReasons } from '@/db/repos/reasons';
import type { Habit } from '@/db/schema';
import { useSafety } from '@/features/safety';
import {
  MAX_HABIT_NAME_CHARS, PRESET_HABITS, cleanHabitName, habitLabel, habitNameKey, isTrackedName,
} from '@/lib/habits';
import { reasonTextsFor } from '@/lib/reasons';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
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
  const [perHabit, setPerHabit] = useState<Record<string, string[]>>({});
  const [showSpecific, setShowSpecific] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [hs, rs] = await Promise.all([listHabits(), listAllReasons()]);
    setHabits(hs);
    const universal = reasonTextsFor(rs, null);
    setReasons(universal.length > 0 ? universal : ['']);
    const tagged: Record<string, string[]> = {};
    for (const h of hs) {
      const texts = reasonTextsFor(rs, h.id);
      if (texts.length > 0) tagged[h.id] = texts;
    }
    setPerHabit(tagged);
    if (Object.keys(tagged).length > 0) setShowSpecific(true);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  const cleanList = (texts: string[]) => texts.map((t) => t.trim()).filter(Boolean).slice(0, MAX_REASONS);

  const saveReasons = async () => {
    const cleaned = cleanList(reasons);
    // Per-habit lists only exist when tracking more than one; with one
    // habit the section is hidden and any saved lists are left as they are.
    const multi = habits.length > 1;
    const tagged = multi ? habits.map((h) => ({ id: h.id, texts: cleanList(perHabit[h.id] ?? []) })) : [];
    if (guard(...cleaned, ...tagged.flatMap((t) => t.texts))) return;
    await replaceReasons(cleaned);
    for (const t of tagged) await replaceReasons(t.texts, t.id);
    setSaved(true);
  };

  // Same tags as Setup and Log: preset chips toggle tracking, saved
  // customs are selected chips that remove on tap. A custom whose name
  // matches a preset counts as that preset, never a second tag.
  const presetHabit = (kind: (typeof PRESET_HABITS)[number]['kind']) =>
    habits.find((h) => h.kind === kind || habitNameKey(h.name) === habitNameKey(PRESET_HABITS.find((p) => p.kind === kind)!.label));
  const customHabits = habits.filter(
    (h) => h.kind === 'custom' && !PRESET_HABITS.some((p) => habitNameKey(p.label) === habitNameKey(h.name)),
  );
  const togglePreset = (preset: (typeof PRESET_HABITS)[number]) => {
    const existing = presetHabit(preset.kind);
    if (existing) {
      void removeHabit(existing.id).then(load);
    } else if (!guard(preset.label)) {
      void addHabit(preset.label, preset.kind).then(load);
    }
  };
  const addOwn = () => {
    const name = cleanHabitName(newHabit);
    if (!name || guard(name)) return;
    setNewHabit('');
    if (isTrackedName(name, habits)) return;
    const preset = PRESET_HABITS.find((p) => habitNameKey(p.label) === habitNameKey(name));
    void addHabit(preset ? preset.label : name, preset ? preset.kind : 'custom').then(load);
  };

  return (
    <Screen scroll scrollTopKey="me">
      <Title>{copy.habitsTitle}</Title>
      <View style={styles.chips}>
        {PRESET_HABITS.map((p) => (
          <Chip key={p.kind} label={p.label} selected={Boolean(presetHabit(p.kind))} onPress={() => togglePreset(p)} />
        ))}
        {customHabits.map((h) => (
          <Chip
            key={h.id}
            label={`${habitLabel(h)} ×`}
            selected
            onPress={() => {
              void removeHabit(h.id).then(load);
            }}
          />
        ))}
      </View>
      {customHabits.length > 0 ? <Label>{copy.removeCustomHint}</Label> : null}
      <TextInput
        accessibilityLabel={copy.addHabitPlaceholder}
        placeholder={copy.addHabitPlaceholder}
        placeholderTextColor={colors.muted}
        value={newHabit}
        onChangeText={setNewHabit}
        maxLength={MAX_HABIT_NAME_CHARS}
        style={inputStyle}
      />
      <QuietLink label={copy.add} onPress={addOwn} />

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
      {habits.length > 1 ? (
        showSpecific ? (
          <>
            <Title>{copy.specificTitle}</Title>
            <Body muted>{copy.specificBody}</Body>
            {habits.map((h) => {
              const list = perHabit[h.id] ?? [''];
              return (
                <View key={h.id} style={styles.list}>
                  <Label>{habitLabel(h)}</Label>
                  {list.map((r, i) => (
                    <TextInput
                      key={i}
                      accessibilityLabel={`${habitLabel(h)}: ${copy.reasonPlaceholder} ${i + 1}`}
                      placeholder={copy.reasonPlaceholder}
                      placeholderTextColor={colors.muted}
                      value={r}
                      onChangeText={(t) => {
                        setSaved(false);
                        setPerHabit((prev) => ({
                          ...prev,
                          [h.id]: (prev[h.id] ?? ['']).map((x, j) => (j === i ? t : x)),
                        }));
                      }}
                      style={inputStyle}
                    />
                  ))}
                  {list.filter((r) => r.trim()).length < MAX_REASONS ? (
                    <QuietLink
                      label={copy.addReason}
                      onPress={() =>
                        setPerHabit((prev) => ({ ...prev, [h.id]: [...(prev[h.id] ?? ['']), ''] }))
                      }
                    />
                  ) : null}
                </View>
              );
            })}
          </>
        ) : (
          <QuietLink label={copy.showSpecific} onPress={() => setShowSpecific(true)} />
        )
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
