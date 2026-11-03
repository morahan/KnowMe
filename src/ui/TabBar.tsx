import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { motion, radius, space, touch, type, useTheme } from '@/theme';
import { LogIcon, MeIcon, PatternsIcon } from './TabIcons';
import { useKeyboardVisible } from './Screen';
import { useReduceMotion } from './useReduceMotion';

// Asset bounds (assets/gnome-tab.png is cropped tight at 18×28 @1x).
const GNOME_ASPECT = 18 / 28;
const GNOME_HEIGHT = space.lg + space.xs; // 28 — ~15% taller than the 24pt line icons
const ICON_SIZE = space.lg; // 24
const PILL_WIDTH = touch.min + space.sm; // 56
const PILL_HEIGHT = space.md * 2; // 32
const PILL_OPACITY = 0.15;
const GNOME_MUTED_OPACITY = 0.55;

const gnomeSource = require('../../assets/gnome-tab.png') as number;

type TabItemProps = {
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function useTabProgress(focused: boolean) {
  const reduceMotion = useReduceMotion();
  const [progress] = useState(() => new Animated.Value(focused ? 1 : 0));
  const previousFocused = useRef(focused);
  useEffect(() => {
    if (previousFocused.current === focused) return;
    previousFocused.current = focused;
    if (reduceMotion) {
      progress.setValue(focused ? 1 : 0);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: motion.fast,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [focused, progress, reduceMotion]);
  return progress;
}

function TabShell({ label, focused, onPress, onLongPress, children }: TabItemProps & { children: (progress: Animated.Value) => React.ReactNode }) {
  const { colors } = useTheme();
  const progress = useTabProgress(focused);
  const pillOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_OPACITY] });
  const labelColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.muted, colors.accent] });
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}
    >
      <View style={styles.iconArea}>
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { backgroundColor: colors.accent, opacity: pillOpacity }]}
        />
        {children(progress)}
      </View>
      <Animated.Text
        style={[
          type.label,
          { color: labelColor, fontWeight: focused ? type.title.fontWeight : type.label.fontWeight },
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function LineTab({ icon, ...props }: TabItemProps & { icon: (focused: boolean) => React.ReactNode }) {
  return (
    <TabShell {...props}>
      {(progress) => {
        const mutedOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
        return (
          <>
            <Animated.View style={{ opacity: mutedOpacity }}>{icon(false)}</Animated.View>
            <Animated.View style={[styles.iconOverlay, { opacity: progress }]}>{icon(true)}</Animated.View>
          </>
        );
      }}
    </TabShell>
  );
}

function GnomeTab(props: TabItemProps) {
  return (
    <TabShell {...props}>
      {(progress) => {
        const opacity = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [GNOME_MUTED_OPACITY, 1],
        });
        return (
          <Animated.View style={{ opacity }}>
            <Image
              source={gnomeSource}
              style={{ height: GNOME_HEIGHT, width: GNOME_HEIGHT * GNOME_ASPECT }}
              resizeMode="contain"
              accessible={false}
            />
          </Animated.View>
        );
      }}
    </TabShell>
  );
}

/** Bottom tab bar: bg only (no border/shadow), accent pill + label when selected. */
export function TabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors } = useTheme();
  const keyboardVisible = useKeyboardVisible();
  const focusedOptions = descriptors[state.routes[state.index]?.key ?? '']?.options;
  if (keyboardVisible && focusedOptions?.tabBarHideOnKeyboard) return null;

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: colors.bg, paddingBottom: insets.bottom, paddingTop: space.sm },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = index === state.index;
        const { options } = descriptors[route.key]!;
        const label = options.title ?? route.name;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        };
        const onLongPress = () => emitter.emit({ type: 'tabLongPress', target: route.key });
        const itemProps: TabItemProps = { label, focused, onPress, onLongPress };
        if (route.name === 'log') {
          return <LineTab key={route.key} {...itemProps} icon={(f) => <LogIcon focused={f} size={ICON_SIZE} />} />;
        }
        if (route.name === 'patterns') {
          return <LineTab key={route.key} {...itemProps} icon={(f) => <PatternsIcon focused={f} size={ICON_SIZE} />} />;
        }
        if (route.name === 'me') {
          return <LineTab key={route.key} {...itemProps} icon={(f) => <MeIcon focused={f} size={ICON_SIZE} />} />;
        }
        return <GnomeTab key={route.key} {...itemProps} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row' },
  tab: { flex: 1, minHeight: touch.min, minWidth: touch.min, alignItems: 'center', justifyContent: 'center', paddingVertical: space.xs },
  iconArea: { width: PILL_WIDTH, height: PILL_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  pill: { position: 'absolute', width: PILL_WIDTH, height: PILL_HEIGHT, borderRadius: radius.full },
  iconOverlay: { position: 'absolute' },
});
