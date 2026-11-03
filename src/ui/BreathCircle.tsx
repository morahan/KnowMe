import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { motion, radius, type, useTheme } from '@/theme';
import { useReduceMotion } from './useReduceMotion';

type Props = { inLabel: string; outLabel: string };

const MIN_SCALE = 0.6;
const WIDTH_RATIO = 0.6;
const FILL_OPACITY = 0.25;

/** 4s in, 6s out, forever. Soft, never bouncy. Still when Reduce Motion is on. */
export function BreathCircle({ inLabel, outLabel }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const size = useWindowDimensions().width * WIDTH_RATIO;
  const [scale] = useState(() => new Animated.Value(MIN_SCALE));
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

  return (
    <View style={[styles.wrap, { width: size, height: size }]} accessibilityLiveRegion="polite">
      <Animated.View
        style={[styles.circle, { backgroundColor: colors.accent, transform: [{ scale }] }]}
      />
      <Text style={[type.title, { color: colors.text }]}>{reduceMotion ? '' : phase === 'in' ? inLabel : outLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  circle: { ...StyleSheet.absoluteFill, borderRadius: radius.full, opacity: FILL_OPACITY },
});
