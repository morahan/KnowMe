import * as Haptics from 'expo-haptics';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { listHabits } from '@/db/repos/habits';
import { insertMoment } from '@/db/repos/moments';
import { getSetting, setSetting } from '@/db/repos/settings';
import { CONTEXTS, FEELINGS, HELPERS, type Habit } from '@/db/schema';
import { useSafety } from '@/features/safety';
import { habitLabel } from '@/lib/habits';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { IntensityPicker } from '@/ui/IntensityPicker';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { SectionSeparator } from '@/ui/SectionSeparator';
import { SectionTitle } from '@/ui/SectionTitle';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import {
  CUSTOM_INPUT_MAX_CHARS, FEELING_INPUT_MAX_CHARS, FEELING_TAGS_SETTING, HELPER_INPUT_MAX_CHARS,
  HELPER_TAGS_SETTING, MAX_TAG_CHARS, addCustomTag, canAddCustomTag, customTags, defaultTags, emptyDraft,
  isLongCustomText, isReady, normalizeTag, parseStoredTags, quickTagDraft, removeTag, renameTag, resolveCustomTag,
  toNewMoment, type LogDraft,
} from './logic';

type TagGroupName = 'feelings' | 'helpers';

const toggleIn = (xs: string[], x: string): string[] => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

type TagGroupProps = {
  label: string;
  presets: readonly string[];
  selected: string[];
  otherOpen: boolean;
  otherText: string;
  placeholder?: string;
  inputMaxChars?: number;
  multiline?: boolean;
  /** Long text only: offer an editable 20-char quick tag. */
  quickTagEnabled?: boolean;
  quickTagText?: string;
  onToggleQuickTag?: () => void;
  onQuickTagTextChange?: (text: string) => void;
  onTogglePreset: (tag: string) => void;
  onToggleOther: () => void;
  onOtherTextChange: (text: string) => void;
  onAddOther: () => void;
  onRemoveCustom: (tag: string) => void;
  /** Preset list editing: rename or drop a preset so it is offered in the person's own words, or not at all. */
  editing: boolean;
  customized: boolean;
  onToggleEditing: () => void;
  onRenamePreset: (oldTag: string, newText: string) => boolean;
  onRemovePreset: (tag: string) => void;
  onRestoreDefaults: () => void;
};

function TagGroup(p: TagGroupProps) {
  const { colors } = useTheme();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const customs = customTags(p.selected, p.presets);
  const atMax = !canAddCustomTag(p.selected, p.presets);
  const tag = normalizeTag(p.otherText);
  const trimmed = p.otherText.trim().replace(/\s+/g, ' ');
  const inputMax = p.inputMaxChars ?? CUSTOM_INPUT_MAX_CHARS;
  const placeholder = p.placeholder ?? copy.otherPlaceholder;
  const isLong = isLongCustomText(p.otherText);
  const showQuickTag = Boolean(p.onToggleQuickTag) && isLong;
  const effectiveTag = resolveCustomTag(p.otherText, Boolean(p.quickTagEnabled), p.quickTagText ?? '');
  return (
    <View style={styles.group}>
      <SectionTitle>{p.label}</SectionTitle>
      <View style={styles.chips}>
        {p.presets.map((preset) =>
          preset === 'other' ? (
            <Chip key={preset} label={copy.other} selected={p.otherOpen} onPress={p.onToggleOther} />
          ) : (
            <Chip
              key={preset}
              label={preset}
              selected={p.editing ? editingTag === preset : p.selected.includes(preset)}
              onPress={() => {
                if (p.editing) {
                  setEditingTag(preset);
                  setEditText(preset);
                } else {
                  p.onTogglePreset(preset);
                }
              }}
            />
          ),
        )}
        {customs.map((tagName) => (
          <Chip key={tagName} label={`${tagName} ×`} selected onPress={() => p.onRemoveCustom(tagName)} />
        ))}
      </View>
      {p.editing ? <Label>{copy.editTagsHint}</Label> : customs.length > 0 ? <Label>{copy.removeCustomHint}</Label> : null}
      <QuietLink
        label={p.editing ? copy.doneEditingTags : copy.editTags}
        onPress={() => {
          setEditingTag(null);
          p.onToggleEditing();
        }}
      />
      {p.editing && editingTag ? (
        <View style={styles.otherBox}>
          <View style={styles.otherRow}>
            <TextInput
              accessibilityLabel={copy.editTagPlaceholder}
              placeholder={copy.editTagPlaceholder}
              placeholderTextColor={colors.muted}
              value={editText}
              onChangeText={setEditText}
              maxLength={MAX_TAG_CHARS}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (p.onRenamePreset(editingTag, editText)) setEditingTag(null);
              }}
              style={[styles.otherInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (p.onRenamePreset(editingTag, editText)) setEditingTag(null);
              }}
              style={({ pressed }) => [styles.addButton, { borderColor: colors.border }, pressed && styles.pressed]}
            >
              <Text style={[type.label, { color: colors.text }]}>{copy.saveTag}</Text>
            </Pressable>
          </View>
          <View style={styles.editActions}>
            <QuietLink
              label={copy.removeTag}
              onPress={() => {
                p.onRemovePreset(editingTag);
                setEditingTag(null);
              }}
            />
            <QuietLink label={copy.cancel} onPress={() => setEditingTag(null)} />
          </View>
        </View>
      ) : null}
      {p.editing && p.customized ? (
        <QuietLink
          label={copy.restoreDefaultTags}
          onPress={() => {
            setEditingTag(null);
            p.onRestoreDefaults();
          }}
        />
      ) : null}
      {p.otherOpen ? (
        <View style={styles.otherBox}>
          <View style={styles.otherRow}>
            <TextInput
              accessibilityLabel={placeholder}
              placeholder={placeholder}
              placeholderTextColor={colors.muted}
              value={p.otherText}
              onChangeText={p.onOtherTextChange}
              maxLength={inputMax}
              autoCapitalize="none"
              multiline={p.multiline}
              returnKeyType={p.multiline ? undefined : 'done'}
              onSubmitEditing={p.multiline ? undefined : p.onAddOther}
              style={[
                styles.otherInput,
                p.multiline && styles.otherInputMultiline,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !effectiveTag || atMax }}
              onPress={p.onAddOther}
              style={({ pressed }) => [styles.addButton, { borderColor: colors.border }, pressed && styles.pressed]}
            >
              <Text style={[type.label, { color: !effectiveTag || atMax ? colors.muted : colors.text }]}>{copy.addTag}</Text>
            </Pressable>
          </View>
          {/* One counter at a time: short text shows the tag limit below; the
              full-input limit only matters once the text runs long. */}
          {isLong ? <Label>{`${p.otherText.length}/${inputMax}`}</Label> : null}
          {showQuickTag ? (
            <View style={styles.quickTagBox}>
              <View style={styles.chips}>
                <Chip label={copy.saveForQuickTagging} selected={Boolean(p.quickTagEnabled)} onPress={() => p.onToggleQuickTag?.()} />
              </View>
              {p.quickTagEnabled ? (
                <View style={styles.otherRow}>
                  <TextInput
                    accessibilityLabel={copy.quickTagPlaceholder}
                    placeholder={copy.quickTagPlaceholder}
                    placeholderTextColor={colors.muted}
                    value={p.quickTagText ?? ''}
                    onChangeText={(t) => p.onQuickTagTextChange?.(t)}
                    maxLength={MAX_TAG_CHARS}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={p.onAddOther}
                    style={[styles.otherInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
                  />
                </View>
              ) : null}
              {p.quickTagEnabled ? <Label>{`${(p.quickTagText ?? '').length}/${MAX_TAG_CHARS}`}</Label> : null}
            </View>
          ) : null}
          {atMax ? (
            <Label>{copy.maxCustomTags}</Label>
          ) : !p.quickTagEnabled && tag && trimmed.length > MAX_TAG_CHARS ? (
            <Label>{`Saved as “${tag}”`}</Label>
          ) : !showQuickTag && tag ? (
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
  // Per group: the editable 20-char quick tag auto-filled from a long input.
  const [quickTagEnabled, setQuickTagEnabled] = useState<Record<TagGroupName, boolean>>({ feelings: false, helpers: false });
  const [quickTagText, setQuickTagText] = useState<Record<TagGroupName, string>>({ feelings: '', helpers: '' });
  const [quickTagEdited, setQuickTagEdited] = useState<Record<TagGroupName, boolean>>({ feelings: false, helpers: false });
  // Each group's offered presets, in the person's own edited form when saved.
  const [presetLists, setPresetLists] = useState<Record<TagGroupName, string[]>>({
    feelings: defaultTags(FEELINGS),
    helpers: defaultTags(HELPERS),
  });
  const [editingTags, setEditingTags] = useState<Record<TagGroupName, boolean>>({ feelings: false, helpers: false });

  const savePresetList = (group: TagGroupName, next: string[]) => {
    setPresetLists((prev) => ({ ...prev, [group]: next }));
    const key = group === 'feelings' ? FEELING_TAGS_SETTING : HELPER_TAGS_SETTING;
    void setSetting(key, JSON.stringify(next)).catch(() => undefined);
  };

  const renamePreset = (group: TagGroupName, oldTag: string, raw: string): boolean => {
    const renamed = renameTag(presetLists[group], oldTag, raw);
    if (renamed.join('\u0000') === presetLists[group].join('\u0000')) return false;
    if (guard(normalizeTag(raw))) return false;
    savePresetList(group, renamed);
    setDraft((d) => {
      const selected = d[group];
      if (!selected.includes(oldTag)) return d;
      const next = renameTag(selected, oldTag, raw);
      // Already picked under the new word: drop the old spelling, never duplicate.
      return { ...d, [group]: next.join('\u0000') === selected.join('\u0000') ? removeTag(selected, oldTag) : next };
    });
    return true;
  };

  const removePreset = (group: TagGroupName, tag: string) => {
    savePresetList(group, removeTag(presetLists[group], tag));
    setDraft((d) => ({ ...d, [group]: removeTag(d[group], tag) }));
  };

  const restorePresets = (group: TagGroupName, presets: readonly string[]) => {
    savePresetList(group, defaultTags(presets));
  };

  const onOtherTextChange = useCallback(
    (group: TagGroupName, t: string) => {
      setOtherText((x) => ({ ...x, [group]: t }));
      if (!t.trim()) {
        setQuickTagEdited((x) => ({ ...x, [group]: false }));
        setQuickTagEnabled((x) => ({ ...x, [group]: false }));
        setQuickTagText((x) => ({ ...x, [group]: '' }));
      } else if (!quickTagEdited[group]) {
        setQuickTagText((x) => ({ ...x, [group]: quickTagDraft(t) }));
      }
    },
    [quickTagEdited],
  );

  const addOther = useCallback(
    (group: TagGroupName, presets: readonly string[]) => {
      const raw = otherText[group];
      const source = resolveCustomTag(raw, quickTagEnabled[group], quickTagText[group]);
      if (!normalizeTag(source)) return;
      if (guard(raw, source)) return;
      const next = addCustomTag(draft[group], source, presets);
      // Unchanged means empty, duplicate, or at the max: keep the text so
      // removing a custom tag below lets the same words be added.
      if (next.join('\u0000') === draft[group].join('\u0000')) return;
      setDraft((d) => ({ ...d, [group]: next }));
      setOtherText((t) => ({ ...t, [group]: '' }));
      setOtherOpen((o) => ({ ...o, [group]: false }));
      setQuickTagEnabled((x) => ({ ...x, [group]: false }));
      setQuickTagText((x) => ({ ...x, [group]: '' }));
      setQuickTagEdited((x) => ({ ...x, [group]: false }));
    },
    [draft, guard, otherText, quickTagEnabled, quickTagText],
  );

  // Tabs stay mounted, so reload on focus: after a save the draft is empty
  // and needs the default habit again, or Save would stay disabled forever.
  useFocusEffect(
    useCallback(() => {
      void listHabits().then((hs) => {
        setHabits(hs);
        if (hs[0]) setDraft((d) => ({ ...d, habitId: d.habitId ?? hs[0]!.id }));
      });
      void Promise.all([getSetting(FEELING_TAGS_SETTING), getSetting(HELPER_TAGS_SETTING)])
        .then(([feelings, helpers]) => {
          setPresetLists({ feelings: parseStoredTags(feelings, FEELINGS), helpers: parseStoredTags(helpers, HELPERS) });
        })
        .catch(() => undefined);
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
      setQuickTagEnabled({ feelings: false, helpers: false });
      setQuickTagText({ feelings: '', helpers: '' });
      setQuickTagEdited({ feelings: false, helpers: false });
      setEditingTags({ feelings: false, helpers: false });
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
      scrollTopKey="log"
      footerVisibleWithKeyboard
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
                label={habitLabel(h)}
                selected={draft.habitId === h.id}
                onPress={() => setDraft((d) => ({ ...d, habitId: h.id }))}
              />
            ))}
          </View>
        </View>
      ) : null}

      {habits.length > 1 ? <SectionSeparator /> : null}

      <View style={styles.group}>
        <SectionTitle>{copy.intensity}</SectionTitle>
        <IntensityPicker
          value={draft.intensity}
          onChange={(n) => setDraft((d) => ({ ...d, intensity: n }))}
        />
      </View>

      <SectionSeparator />

      <View style={styles.group}>
        <SectionTitle>{copy.context}</SectionTitle>
        <View style={styles.chips}>
          {CONTEXTS.map((c) => (
            <Chip key={c} label={c} selected={draft.context === c} onPress={() => setDraft((d) => ({ ...d, context: c }))} />
          ))}
        </View>
      </View>

      <SectionSeparator />

      <TagGroup
        label={copy.feelings}
        presets={[...presetLists.feelings, 'other']}
        selected={draft.feelings}
        otherOpen={otherOpen.feelings}
        otherText={otherText.feelings}
        placeholder={copy.feelingOtherPlaceholder}
        inputMaxChars={FEELING_INPUT_MAX_CHARS}
        multiline
        quickTagEnabled={quickTagEnabled.feelings}
        quickTagText={quickTagText.feelings}
        onToggleQuickTag={() => setQuickTagEnabled((x) => ({ ...x, feelings: !x.feelings }))}
        onQuickTagTextChange={(t) => {
          setQuickTagEdited((x) => ({ ...x, feelings: true }));
          setQuickTagText((x) => ({ ...x, feelings: t }));
        }}
        onTogglePreset={(f) => setDraft((d) => ({ ...d, feelings: toggleIn(d.feelings, f) }))}
        onToggleOther={() => setOtherOpen((o) => ({ ...o, feelings: !o.feelings }))}
        onOtherTextChange={(t) => onOtherTextChange('feelings', t)}
        onAddOther={() => addOther('feelings', presetLists.feelings)}
        onRemoveCustom={(t) => setDraft((d) => ({ ...d, feelings: removeTag(d.feelings, t) }))}
        editing={editingTags.feelings}
        customized={presetLists.feelings.join('\u0000') !== defaultTags(FEELINGS).join('\u0000')}
        onToggleEditing={() => setEditingTags((x) => ({ ...x, feelings: !x.feelings }))}
        onRenamePreset={(oldTag, text) => renamePreset('feelings', oldTag, text)}
        onRemovePreset={(t) => removePreset('feelings', t)}
        onRestoreDefaults={() => restorePresets('feelings', FEELINGS)}
      />

      <SectionSeparator />

      <View style={styles.group}>
        <SectionTitle>{copy.outcome}</SectionTitle>
        <View style={styles.chips}>
          <Chip label={copy.rodeItOut} selected={draft.outcome === 'rode_it_out'} onPress={() => setDraft((d) => ({ ...d, outcome: 'rode_it_out' }))} />
          <Chip label={copy.used} selected={draft.outcome === 'used'} onPress={() => setDraft((d) => ({ ...d, outcome: 'used' }))} />
        </View>
      </View>

      {draft.outcome === 'rode_it_out' ? (
        <>
          <SectionSeparator />
          <TagGroup
          label={copy.helpers}
          presets={[...presetLists.helpers, 'other']}
          selected={draft.helpers}
          otherOpen={otherOpen.helpers}
          otherText={otherText.helpers}
          placeholder={copy.helperOtherPlaceholder}
          inputMaxChars={HELPER_INPUT_MAX_CHARS}
          multiline
          quickTagEnabled={quickTagEnabled.helpers}
          quickTagText={quickTagText.helpers}
          onToggleQuickTag={() => setQuickTagEnabled((x) => ({ ...x, helpers: !x.helpers }))}
          onQuickTagTextChange={(t) => {
            setQuickTagEdited((x) => ({ ...x, helpers: true }));
            setQuickTagText((x) => ({ ...x, helpers: t }));
          }}
          onTogglePreset={(h) => setDraft((d) => ({ ...d, helpers: toggleIn(d.helpers, h) }))}
          onToggleOther={() => setOtherOpen((o) => ({ ...o, helpers: !o.helpers }))}
          onOtherTextChange={(t) => onOtherTextChange('helpers', t)}
          onAddOther={() => addOther('helpers', presetLists.helpers)}
          onRemoveCustom={(t) => setDraft((d) => ({ ...d, helpers: removeTag(d.helpers, t) }))}
          editing={editingTags.helpers}
          customized={presetLists.helpers.join('\u0000') !== defaultTags(HELPERS).join('\u0000')}
          onToggleEditing={() => setEditingTags((x) => ({ ...x, helpers: !x.helpers }))}
          onRenamePreset={(oldTag, text) => renamePreset('helpers', oldTag, text)}
          onRemovePreset={(t) => removePreset('helpers', t)}
          onRestoreDefaults={() => restorePresets('helpers', HELPERS)}
          />
        </>
      ) : null}

      <SectionSeparator />

      <View style={styles.group}>
        <SectionTitle>{copy.note}</SectionTitle>
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
  editActions: { flexDirection: 'row', gap: space.md },
  quickTagBox: { gap: space.sm },
  otherRow: { flexDirection: 'row', gap: space.sm, alignItems: 'center' },
  otherInputMultiline: { minHeight: touch.min * 2, textAlignVertical: 'top' },
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
