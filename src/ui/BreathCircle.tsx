import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { layout, motion, radius, type, useTheme } from '@/theme';
import { useReduceMotion } from './useReduceMotion';

type Props = { inLabel: string; outLabel: string };

const MIN_SCALE = 0.6;
const WIDTH_RATIO = 0.6;
const HALO_OPACITY = 0.1;
// Each word fades over `motion.slow` at both ends of its phase, so the swap
// always happens while both words are invisible.
const IN_FADE = motion.slow / motion.breathIn;
const OUT_FADE = motion.slow / motion.breathOut;

/**
 * 4s in, 6s out, forever. Soft, never bouncy. Still when Reduce Motion is on.
 * One looping value drives everything on the native thread: 0→1 is the
 * in-breath, 1→2 the out-breath. Nothing re-renders per breath, so the
 * screen's countdown ticking each second can never make the circle stutter.
 */
export function BreathCircle({ inLabel, outLabel }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  // Cap the diameter so the circle stays a focal point, not a full screen,
  // on wide windows (iPhone Duo open, iPad, landscape).
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * WIDTH_RATIO, height * WIDTH_RATIO, layout.breathMaxDiameter);
  const [anim] = useState(() => {
    const t = new Animated.Value(0);
    const breath = { inputRange: [0, 1, 2], extrapolate: 'clamp' as const };
    return {
      t,
      scale: t.interpolate({ ...breath, outputRange: [MIN_SCALE, 1, MIN_SCALE] }),
      haloScale: t.interpolate({ ...breath, outputRange: [MIN_SCALE * 1.18, 1.14, MIN_SCALE * 1.18] }),
      fillOpacity: t.interpolate({ ...breath, outputRange: [0.2, 0.3, 0.2] }),
      inOpacity: t.interpolate({
        inputRange: [0, IN_FADE, 1 - IN_FADE, 1, 2],
        outputRange: [0, 1, 1, 0, 0],
        extrapolate: 'clamp',
      }),
      outOpacity: t.interpolate({
        inputRange: [0, 1, 1 + OUT_FADE, 2 - OUT_FADE, 2],
        outputRange: [0, 0, 1, 1, 0],
        extrapolate: 'clamp',
      }),
    };
  });

  useEffect(() => {
    if (reduceMotion) {
      anim.t.setValue(0.5); // a still, half-full circle
      return;
    }
    const ease = Easing.inOut(Easing.sin);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim.t, { toValue: 1, duration: motion.breathIn, easing: ease, useNativeDriver: true }),
        Animated.timing(anim.t, { toValue: 2, duration: motion.breathOut, easing: ease, useNativeDriver: true }),
      ]),
    );
    anim.t.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [anim, reduceMotion]);

  return (
    <View
      style={[styles.wrap, { width: size, height: size }]}
      accessible
      accessibilityLabel={`${inLabel}, ${outLabel}`}
    >
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: colors.accent, opacity: HALO_OPACITY, transform: [{ scale: anim.haloScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: colors.accent, opacity: anim.fillOpacity, transform: [{ scale: anim.scale }] },
        ]}
      />
      {reduceMotion ? null : (
        <>
          <Animated.Text style={[styles.word, type.title, { color: colors.text, opacity: anim.inOpacity }]}>
            {inLabel}
          </Animated.Text>
          <Animated.Text style={[styles.word, type.title, { color: colors.text, opacity: anim.outOpacity }]}>
            {outLabel}
          </Animated.Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circle: { ...StyleSheet.absoluteFill, borderRadius: radius.full },
  // Both words share the center; only one is ever visible.
  word: { position: 'absolute' },
});
