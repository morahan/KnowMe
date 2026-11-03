import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { addHabit, listHabits } from '@/db/repos/habits';
import { listReasons, MAX_REASONS, replaceReasons } from '@/db/repos/reasons';
import { setSetting } from '@/db/repos/settings';
import type { HabitKind } from '@/db/schema';
import { useSafety } from '@/features/safety';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { Chip } from '@/ui/Chip';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { canAddReason, cleanReasons } from './logic';

const PRESETS: { kind: HabitKind; label: string }[] = [
  { kind: 'cannabis', label: 'Cannabis' },
  { kind: 'nicotine', label: 'Nicotine' },
  { kind: 'alcohol', label: 'Alcohol' },
];

export function SetupScreen() {
  const { colors } = useTheme();
  const { guard } = useSafety();
  const [picked, setPicked] = useState<Set<HabitKind>>(new Set());
  const [custom, setCustom] = useState('');
  const [reasons, setReasons] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const [habits, saved] = await Promise.all([listHabits(), listReasons()]);
      if (habits.length > 0) setPicked(new Set(habits.map((h) => h.kind)));
      if (saved.length > 0) setReasons(saved.map((r) => r.text));
    })();
  }, []);

  const finish = useCallback(async () => {
    const cleaned = cleanReasons(reasons);
    // Crisis check before anything is saved (SAFETY.md §1).
    if (guard(...cleaned, custom)) return;
    setSaving(true);
    try {
      const existing = await listHabits();
      const existingKinds = new Set(existing.map((h) => h.kind));
      for (const p of PRESETS) {
        if (picked.has(p.kind) && !existingKinds.has(p.kind)) await addHabit(p.label.toLowerCase(), p.kind);
      }
      if (picked.has('custom') && custom.trim() && !existing.some((h) => h.name === custom.trim())) {
        await addHabit(custom.trim(), 'custom');
      }
      await replaceReasons(cleaned);
      await setSetting('onboarded', '1');
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  }, [custom, guard, picked, reasons]);

  const toggle = (kind: HabitKind) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface },
  ];

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <PrimaryButton label={copy.done} disabled={saving} onPress={() => void finish()} />
          <QuietLink
            label={copy.skip}
            onPress={() => {
              void setSetting('onboarded', '1').then(() => router.replace('/(tabs)'));
            }}
          />
        </View>
      }
    >
      <Title>{copy.title}</Title>
      <Body muted>{copy.body}</Body>
      <View style={styles.chips}>
        {PRESETS.map((p) => (
          <Chip key={p.kind} label={p.label} selected={picked.has(p.kind)} onPress={() => toggle(p.kind)} />
        ))}
        <Chip label="Something else" selected={picked.has('custom')} onPress={() => toggle('custom')} />
      </View>
      {picked.has('custom') ? (
        <TextInput
          accessibilityLabel={copy.customPlaceholder}
          placeholder={copy.customPlaceholder}
          placeholderTextColor={colors.muted}
          value={custom}
          onChangeText={setCustom}
          style={inputStyle}
        />
      ) : null}

      <Title>{copy.reasonsTitle}</Title>
      <Body muted>{copy.reasonsBody}</Body>
      <View style={styles.reasons}>
        {reasons.map((r, i) => (
          <TextInput
            key={i}
            accessibilityLabel={`${copy.reasonPlaceholder} ${i + 1}`}
            placeholder={copy.reasonPlaceholder}
            placeholderTextColor={colors.muted}
            value={r}
            onChangeText={(t) => setReasons((prev) => prev.map((x, j) => (j === i ? t : x)))}
            style={inputStyle}
          />
        ))}
      </View>
      <Label>{`${cleanReasons(reasons).length} of ${MAX_REASONS}`}</Label>
      {canAddReason(reasons) ? (
        <QuietLink label={copy.addReason} onPress={() => setReasons((prev) => [...prev, ''])} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  reasons: { gap: space.sm },
  footer: { gap: space.sm, alignItems: 'stretch' },
  input: {
    ...type.body,
    minHeight: touch.min,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
});
