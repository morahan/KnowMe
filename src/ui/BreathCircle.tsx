import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { layout, motion, radius, type, useTheme } from '@/theme';
import { useReduceMotion } from './useReduceMotion';

type Props = { inLabel: string; outLabel: string };

const MIN_SCALE = 0.6;
const WIDTH_RATIO = 0.6;
const HALO_OPACITY = 0.1;

/** 4s in, 6s out, forever. Soft, never bouncy. Still when Reduce Motion is on. */
export function BreathCircle({ inLabel, outLabel }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  // Cap the diameter so the circle stays a focal point, not a full screen,
  // on wide windows (iPhone Duo open, iPad, landscape).
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * WIDTH_RATIO, height * WIDTH_RATIO, layout.breathMaxDiameter);
  const [scale] = useState(() => new Animated.Value(MIN_SCALE));
  const [labelOpacity] = useState(() => new Animated.Value(0));
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(0.8);
      return;
    }
    let alive = true;
    const run = (p: 'in' | 'out') => {
      if (!alive) return;
      setPhase(p);
      Animated.timing(scale, {
        toValue: p === 'in' ? 1 : MIN_SCALE,
        duration: p === 'in' ? motion.breathIn : motion.breathOut,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(({ finished }) => finished && run(p === 'in' ? 'out' : 'in'));
    };
    run('in');
    return () => {
      alive = false;
      scale.stopAnimation();
    };
  }, [reduceMotion, scale]);

  // The word arrives softly after the circle has already started to move.
  useEffect(() => {
    if (reduceMotion) {
      labelOpacity.setValue(1);
      return;
    }
    labelOpacity.setValue(0);
    const anim = Animated.timing(labelOpacity, {
      toValue: 1,
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [labelOpacity, phase, reduceMotion]);

  const haloScale = scale.interpolate({
    inputRange: [MIN_SCALE, 1],
    outputRange: [MIN_SCALE * 1.18, 1.14],
  });
  const fillOpacity = scale.interpolate({
    inputRange: [MIN_SCALE, 1],
    outputRange: [0.2, 0.3],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityLiveRegion="polite">
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: colors.accent, opacity: HALO_OPACITY, transform: [{ scale: haloScale }] },
        ]}
      />
      <Animated.View
        style={[styles.circle, { backgroundColor: colors.accent, opacity: fillOpacity, transform: [{ scale }] }]}
      />
      <Animated.Text style={[type.title, { color: colors.text, opacity: labelOpacity }]}>
        {reduceMotion ? '' : phase === 'in' ? inLabel : outLabel}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circle: { ...StyleSheet.absoluteFill, borderRadius: radius.full },
});
