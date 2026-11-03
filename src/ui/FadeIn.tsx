import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';
import { motion, space } from '@/theme';
import { useReduceMotion } from './useReduceMotion';

type Props = { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> };

/** Fades in and rises a few points, once, on mount. Instant with Reduce Motion. */
export function FadeIn({ children, delay = 0, style }: Props) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: motion.slow,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, progress, reduceMotion]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [space.sm, 0] });
  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>
  );
}
