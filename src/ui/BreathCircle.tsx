import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { breath, gutter, layout, motion, radius, type, useTheme } from '@/theme';
import { useReduceMotion } from './useReduceMotion';

type Props = {
  inLabel: string;
  outLabel: string;
  /** Most height the whole halo may take; the screen passes what is left beside its text. */
  maxFootprint?: number;
};

const OUTER_SCALE = breath.layers[0].scale[1];
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
export function BreathCircle({ inLabel, outLabel, maxFootprint = Infinity }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  // Cap the diameter so the circle stays a focal point, not a full screen,
  // on wide windows (iPhone Duo open, iPad, landscape).
  const { width, height } = useWindowDimensions();
  const size = Math.min(
    width * breath.widthRatio,
    height * breath.widthRatio,
    (width - gutter * 2) / OUTER_SCALE,
    layout.breathMaxDiameter,
    maxFootprint / OUTER_SCALE,
  );
  const [anim] = useState(() => {
    const t = new Animated.Value(0);
    const cycle = ([exhaled, inhaled]: readonly [number, number]) => t.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [exhaled, inhaled, exhaled],
      extrapolate: 'clamp',
    });
    return {
      t,
      layers: breath.layers.map((layer) => ({
        name: layer.name,
        scale: cycle(layer.scale),
        opacity: cycle(layer.opacity),
      })),
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
        Animated.timing(anim.t, { toValue: 1, duration: motion.breathIn, easing: ease, useNativeDriver: true, isInteraction: false }),
        Animated.timing(anim.t, { toValue: 2, duration: motion.breathOut, easing: ease, useNativeDriver: true, isInteraction: false }),
      ]),
    );
    anim.t.setValue(0);
    loop.start();
    return () => loop.stop();
  }, [anim, reduceMotion]);

  return (
    <View
      style={[styles.wrap, { width: size * OUTER_SCALE, height: size * OUTER_SCALE }]}
      accessible
      accessibilityLabel={`${inLabel}, ${outLabel}`}
    >
      {/* Reserve the full halo footprint so it never brushes the timer. */}
      <View style={{ width: size, height: size }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {anim.layers.map((layer) => (
          <Animated.View
            key={layer.name}
            style={[
              styles.circle,
              { backgroundColor: colors.accent, opacity: layer.opacity, transform: [{ scale: layer.scale }] },
            ]}
          />
        ))}
      </View>
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
