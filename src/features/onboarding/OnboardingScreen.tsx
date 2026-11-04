import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getSetting, setSetting } from '@/db/repos/settings';
import { radius, space, touch, type, useTheme } from '@/theme';
import { Body } from '@/ui/Body';
import { FadeIn } from '@/ui/FadeIn';
import { Label } from '@/ui/Label';
import { PrimaryButton } from '@/ui/PrimaryButton';
import { QuietLink } from '@/ui/QuietLink';
import { Screen } from '@/ui/Screen';
import { Title } from '@/ui/Title';
import { copy } from './copy';
import { isLast, nextIndex, prevIndex } from './logic';

// Same tight-cropped gnome as Reflect (92×144 @1x), holding the lantern — shown 15% larger here.
const GNOME_HEIGHT = 166; // 144 × 1.15
const GNOME_ASPECT = 92 / 144;
const gnomeSource = require('../../../assets/reflect-gnome.png') as number;

const TOTAL = copy.slides.length;

/**
 * First-run walkthrough: four slides, the gnome talking in a speech bubble.
 * Finish or Skip marks it seen and hands off to Setup on a first run;
 * replayed from Me, it simply returns to the tabs.
 */
export function OnboardingScreen() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const alreadyOnboarded = useRef(false);

  useEffect(() => {
    void getSetting('onboarded').then((v) => {
      alreadyOnboarded.current = Boolean(v);
    });
  }, []);

  const finish = useCallback(async () => {
    await setSetting('onboarding_seen', '1');
    if (alreadyOnboarded.current) router.replace('/(tabs)');
    else router.replace('/setup');
  }, []);

  const slide = copy.slides[index]!;
  const last = isLast(index, TOTAL);

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <PrimaryButton
            label={last ? copy.start : copy.next}
            onPress={() => (last ? void finish() : setIndex((i) => nextIndex(i, TOTAL)))}
          />
          <View style={styles.footerRow}>
            {index > 0 ? (
              <QuietLink label={copy.back} onPress={() => setIndex((i) => prevIndex(i))} />
            ) : (
              <View />
            )}
            {!last ? <QuietLink label={copy.skip} onPress={() => void finish()} /> : <View />}
          </View>
        </View>
      }
    >
      <View style={styles.progress} accessibilityLabel={copy.progress(index + 1, TOTAL)}>
        {copy.slides.map((s, i) => (
          <View
            key={s.title}
            style={[
              styles.dot,
              { backgroundColor: i === index ? colors.accent : colors.border },
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <FadeIn key={index} style={styles.content}>
        <View style={styles.talkRow}>
          <View style={styles.bubbleWrap}>
            <View style={[styles.bubble, { backgroundColor: colors.surface }]}>
              <Body>{slide.bubble}</Body>
            </View>
            <View style={[styles.tail, { borderTopColor: colors.surface }]} />
          </View>
          <Image
            source={gnomeSource}
            style={styles.gnome}
            resizeMode="contain"
            accessibilityLabel={copy.gnomeAlt}
          />
        </View>

        <Title>{slide.title}</Title>
        <Body muted>{slide.body}</Body>

        {index === 1 ? (
          // A picture of the Today button, border only — never a filled, tappable-looking copy.
          <View
            testID="im-in-it-picture"
            style={[styles.mockFrame, { backgroundColor: colors.surface }]}
            accessible
            accessibilityLabel={copy.todayFrameAlt}
          >
            <Label>{copy.todayFrame}</Label>
            <View style={[styles.mockButton, { borderColor: colors.border }]}>
              <Text style={[type.body, styles.mockLabel, { color: colors.muted }]}>{slide.hint}</Text>
            </View>
          </View>
        ) : index === 3 ? (
          <View style={styles.tabMap}>
            {copy.tabs.map((t) => (
              <View key={t.label} style={styles.tabRow}>
                <View style={styles.tabName}>
                  <Body>{t.label}</Body>
                </View>
                <View style={styles.tabBody}>
                  <Body muted>{t.body}</Body>
                </View>
              </View>
            ))}
          </View>
        ) : slide.hint ? (
          <Label>{slide.hint}</Label>
        ) : null}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { flexDirection: 'row', gap: space.sm, marginTop: space.lg, alignItems: 'center' },
  dot: { width: space.sm, height: space.sm, borderRadius: radius.full },
  dotActive: { width: space.lg, height: space.sm },
  content: { gap: space.lg, marginTop: space.xl },
  talkRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md, marginBottom: space.lg },
  bubbleWrap: { flex: 1, paddingBottom: space.lg },
  bubble: { borderRadius: radius.md, padding: space.md },
  tail: {
    alignSelf: 'flex-end',
    marginRight: space.lg,
    width: 0,
    height: 0,
    borderLeftWidth: space.sm,
    borderRightWidth: space.sm,
    borderTopWidth: space.sm,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  gnome: { height: GNOME_HEIGHT, width: GNOME_HEIGHT * GNOME_ASPECT },
  mockFrame: { borderRadius: radius.md, padding: space.md, gap: space.sm },
  mockButton: {
    minHeight: touch.min,
    paddingVertical: space.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockLabel: { fontWeight: type.title.fontWeight },
  tabMap: { gap: space.md, marginTop: space.sm },
  tabRow: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  tabName: {
    minWidth: space.xxl + space.lg,
    minHeight: touch.min,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  tabBody: { flex: 1 },
  footer: { gap: space.xs },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
