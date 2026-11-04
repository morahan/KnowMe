import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { addHabit, editHabit, listHabits, removeHabit, renameHabit } from '@/db/repos/habits';
import { listAllReasons, MAX_REASONS, replaceReasons } from '@/db/repos/reasons';
import type { Habit } from '@/db/schema';
import { openPhone, useSafety } from '@/features/safety';
import {
  MAX_HABIT_NAME_CHARS, MAX_HABIT_QUESTION_CHARS, PRESET_HABITS, cleanHabitName, cleanHabitQuestion, habitLabel, habitNameKey, habitQuestionPhrase, isTrackedName, renamedHabitName,
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
  const [newQuestion, setNewQuestion] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [perHabit, setPerHabit] = useState<Record<string, string[]>>({});
  const [showSpecific, setShowSpecific] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  // Reload when demo data comes or goes: seeding can add habits and reasons.
  useEffect(() => {
    void load();
  }, [load, demoOn]);

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
  // Removing a habit cascades its moments and reasons, so it always asks first.
  const confirmRemove = (habit: Habit) => {
    Alert.alert(copy.removeConfirmTitle(habitLabel(habit)), copy.removeConfirmBody, [
      { text: copy.removeConfirmKeep, style: 'cancel' },
      // Default style, not 'destructive': no red, ever (theme rule 2).
      { text: copy.removeConfirmRemove, onPress: () => void removeHabit(habit.id).then(load) },
    ]);
  };
  const togglePreset = (preset: (typeof PRESET_HABITS)[number]) => {
    const existing = presetHabit(preset.kind);
    if (existing) {
      confirmRemove(existing);
    } else if (!guard(preset.label)) {
      void addHabit(preset.label, preset.kind).then(load);
    }
  };
  const addOwn = () => {
    const name = cleanHabitName(newHabit);
    if (!name || guard(newHabit, newQuestion ?? '')) return;
    setNewHabit('');
    setNewQuestion(null);
    if (isTrackedName(name, habits)) return;
    const preset = PRESET_HABITS.find((p) => habitNameKey(p.label) === habitNameKey(name));
    // A renamed preset is still that preset: never track it twice.
    if (preset && presetHabit(preset.kind)) return;
    if (preset) void addHabit(preset.label, preset.kind).then(load);
    else void addHabit(name, 'custom', cleanHabitQuestion(newQuestion ?? name.toLowerCase()) || null).then(load);
  };

  const editingHabit = habits.find((h) => h.id === editingId) ?? null;
  const saveTagEdit = () => {
    if (!editingHabit) return;
    const name = renamedHabitName(editText, habits, editingHabit.id);
    if (!name || guard(editText, editQuestion)) return;
    setEditingId(null);
    if (editingHabit.kind === 'custom') {
      void editHabit(editingHabit.id, name, cleanHabitQuestion(editQuestion) || null).then(load);
    } else void renameHabit(editingHabit.id, name).then(load);
  };
  const removeTagEdit = () => {
    if (!editingHabit) return;
    setEditingId(null);
    confirmRemove(editingHabit);
  };

  return (
    <Screen scroll scrollTopKey="me">
      <Title>{copy.habitsTitle}</Title>
      {editingTags ? (
        <>
          <View style={styles.chips}>
            {habits.map((h) => (
              <Chip
                key={h.id}
                label={habitLabel(h)}
                selected={editingId === h.id}
                onPress={() => {
                  setEditingId(h.id);
                  setEditText(habitLabel(h));
                  setEditQuestion(habitQuestionPhrase(h));
                }}
              />
            ))}
          </View>
          <Label>{copy.editTagsHint}</Label>
          {editingHabit ? (
            <View style={styles.editBox}>
              {editingHabit.kind === 'custom' ? (
                <>
                  <TextInput
                    accessibilityLabel={copy.questionPhrase}
                    placeholder={copy.questionPhrase}
                    placeholderTextColor={colors.muted}
                    value={editQuestion}
                    onChangeText={setEditQuestion}
                    maxLength={MAX_HABIT_QUESTION_CHARS}
                    autoCapitalize="none"
                    style={inputStyle}
                  />
                  <Label>{copy.questionPreview(cleanHabitQuestion(editQuestion) || cleanHabitName(editText).toLowerCase())}</Label>
                </>
              ) : null}
              <View style={styles.editRow}>
                <TextInput
                  accessibilityLabel={copy.editTagPlaceholder}
                  placeholder={copy.editTagPlaceholder}
                  placeholderTextColor={colors.muted}
                  value={editText}
                  onChangeText={setEditText}
                  maxLength={MAX_HABIT_NAME_CHARS}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={saveTagEdit}
                  style={[inputStyle, styles.editInput]}
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={saveTagEdit}
                  style={({ pressed }) => [styles.saveTagButton, { borderColor: colors.border }, pressed && styles.pressed]}
                >
                  <Text style={[type.label, { color: colors.text }]}>{copy.saveTag}</Text>
                </Pressable>
              </View>
              <View style={styles.editActions}>
                <QuietLink label={copy.removeTag} onPress={removeTagEdit} />
                <QuietLink label={copy.cancel} onPress={() => setEditingId(null)} />
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <>
          <View style={styles.chips}>
            {PRESET_HABITS.map((p) => {
              const tracked = presetHabit(p.kind);
              return (
                <Chip
                  key={p.kind}
                  label={tracked ? habitLabel(tracked) : p.label}
                  selected={Boolean(tracked)}
                  onPress={() => togglePreset(p)}
                />
              );
            })}
            {customHabits.map((h) => (
              <Chip
                key={h.id}
                label={`${habitLabel(h)} ×`}
                selected
                onPress={() => confirmRemove(h)}
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
          {cleanHabitName(newHabit) && !PRESET_HABITS.some((preset) => habitNameKey(preset.label) === habitNameKey(newHabit)) ? (
            <>
              <TextInput
                accessibilityLabel={copy.questionPhrase}
                placeholder={copy.questionPhrase}
                placeholderTextColor={colors.muted}
                value={newQuestion ?? cleanHabitName(newHabit).toLowerCase()}
                onChangeText={setNewQuestion}
                maxLength={MAX_HABIT_QUESTION_CHARS}
                autoCapitalize="none"
                style={inputStyle}
              />
              <Label>{copy.questionPreview(cleanHabitQuestion(newQuestion ?? cleanHabitName(newHabit).toLowerCase()) || cleanHabitName(newHabit).toLowerCase())}</Label>
            </>
          ) : null}
          <QuietLink label={copy.add} onPress={addOwn} />
        </>
      )}
      {habits.length > 0 ? (
        <QuietLink
          label={editingTags ? copy.doneEditingTags : copy.editTags}
          onPress={() => {
            setEditingId(null);
            setEditingTags((x) => !x);
          }}
        />
      ) : null}

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
      {reasons.length < MAX_REASONS ? (
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
                  {list.length < MAX_REASONS ? (
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
        <QuietLink label={copy.lifeline} onPress={() => openPhone('tel:988', '988')} />
        <QuietLink label={copy.samhsa} onPress={() => openPhone('tel:18006624357', '1-800-662-4357')} />
        <QuietLink label={copy.gamblingHelpline} onPress={() => openPhone('tel:18006973738', '1-800-697-3738')} />
        <QuietLink label={copy.quitNow} onPress={() => openPhone('tel:18007848669', '1-800-784-8669')} />
        <QuietLink label={copy.tellSomeone} onPress={() => Share.share({ message: copy.tellSomeoneMessage })} />
      </View>

      <Title>{copy.privacyTitle}</Title>
      <Body muted>{copy.privacyBody}</Body>
      <QuietLink label={copy.howItWorks} onPress={() => router.push('/onboarding')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  editBox: { gap: space.sm },
  editRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  editInput: { flex: 1 },
  editActions: { flexDirection: 'row', gap: space.md },
  pressed: { opacity: 0.7 },
  saveTagButton: {
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
