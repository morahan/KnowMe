import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { motion, space } from '@/theme';
import { Body } from '@/ui/Body';
import { useReduceMotion } from '@/ui/useReduceMotion';
import { copy } from '../copy';

// Assets are cropped tight at 92×144 @1x and share one canvas, so they stack exactly.
const GNOME_HEIGHT = space.xxl * 2 + space.md; // 144
const GNOME_ASPECT = 92 / 144;
const gnomeSource = require('../../../../assets/reflect-gnome.png') as number;
const eyesClosedSource = require('../../../../assets/reflect-gnome-closed.png') as number;
const glowSource = require('../../../../assets/reflect-gnome-glow.png') as number;

// Candle: drift between a soft and a warm glow, never on/off.
const GLOW_MIN = 0.3;
const GLOW_MAX = 0.9;
const GLOW_STEP_MIN = motion.slow / 2; // 300
const GLOW_STEP_MAX = motion.slow * 1.5; // 900
// Blink: open most of the time, a brief happy squint every 3–7 s.
const BLINK_GAP_MIN = motion.breathIn * 0.75; // 3000
const BLINK_GAP_MAX = motion.breathIn * 1.75; // 7000
const BLINK_CLOSE = motion.fast / 2; // 100
const BLINK_HOLD = motion.fast * 0.75; // 150
const BLINK_OPEN = motion.fast; // 200
// Each message stays a few seconds, then fades through to the next.
const LINE_HOLD = motion.breathIn * 0.75; // 3000

const between = (min: number, max: number) => min + Math.random() * (max - min);
const soft = Easing.inOut(Easing.sin);

/** Runs `next()` back to back until unmount, so each step can pick fresh random values. */
function useChain(enabled: boolean, next: () => Animated.CompositeAnimation) {
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let current: Animated.CompositeAnimation | null = null;
    const step = () => {
      current = next();
      current.start(({ finished }) => {
        if (alive && finished) step();
      });
    };
    step();
    return () => {
      alive = false;
      current?.stop();
    };
    // `next` only reads stable Animated.Values; restarting on identity would reset the chain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

/** Reflect's waiting state: the gnome reads by lantern light while the proxy writes. */
export function ThinkingGnome() {
  const reduceMotion = useReduceMotion();
  const [glow] = useState(() => new Animated.Value((GLOW_MIN + GLOW_MAX) / 2));
  const [eyesClosed] = useState(() => new Animated.Value(0));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [lineIndex, setLineIndex] = useState(0);
  const lines = copy.loadingLines;

  useChain(!reduceMotion, () =>
    Animated.timing(glow, {
      toValue: between(GLOW_MIN, GLOW_MAX),
      duration: between(GLOW_STEP_MIN, GLOW_STEP_MAX),
      easing: soft,
      useNativeDriver: true,
    }),
  );

  useChain(!reduceMotion, () =>
    Animated.sequence([
      Animated.delay(between(BLINK_GAP_MIN, BLINK_GAP_MAX)),
      Animated.timing(eyesClosed, { toValue: 1, duration: BLINK_CLOSE, easing: soft, useNativeDriver: true }),
      Animated.delay(BLINK_HOLD),
      Animated.timing(eyesClosed, { toValue: 0, duration: BLINK_OPEN, easing: soft, useNativeDriver: true }),
    ]),
  );

  useEffect(() => {
    if (reduceMotion) {
      textOpacity.setValue(1);
      setLineIndex(0);
      return;
    }
    const fade = (toValue: number) =>
      Animated.timing(textOpacity, { toValue, duration: motion.slow, easing: soft, useNativeDriver: true });
    const anim = Animated.sequence([fade(1), Animated.delay(LINE_HOLD), fade(0)]);
    anim.start(({ finished }) => {
      if (finished) setLineIndex((i) => (i + 1) % lines.length);
    });
    return () => anim.stop();
  }, [lineIndex, lines.length, reduceMotion, textOpacity]);

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={copy.loading}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
    >
      <View
        style={styles.gnome}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        testID="reflect-gnome"
      >
        <Image source={gnomeSource} style={styles.layer} />
        {reduceMotion ? null : (
          <>
            <Animated.Image testID="reflect-gnome-glow" source={glowSource} style={[styles.layer, { opacity: glow }]} />
            <Animated.Image
              testID="reflect-gnome-blink"
              source={eyesClosedSource}
              style={[styles.layer, { opacity: eyesClosed }]}
            />
          </>
        )}
      </View>
      <Animated.View style={{ opacity: textOpacity }}>
        <Body muted>{lines[lineIndex]}</Body>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  gnome: { height: GNOME_HEIGHT, aspectRatio: GNOME_ASPECT },
  layer: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
});
