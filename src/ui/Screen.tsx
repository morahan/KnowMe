import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gutter, layout, space, useTheme } from '@/theme';
import { registerScrollToTop } from './scrollToTop';
import { useReduceMotion } from './useReduceMotion';

/** True while the software keyboard is open. iOS fires Will* before the
 * animation; Android only reliably fires Did*, so use both. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

type Props = {
  children?: ReactNode;
  /** Pinned to the bottom, e.g. a PrimaryButton. Hidden while the keyboard is open unless `footerVisibleWithKeyboard`. */
  footer?: ReactNode;
  /** Keep `footer` visible and tappable above the keyboard, e.g. Save while typing a note. */
  footerVisibleWithKeyboard?: boolean;
  scroll?: boolean;
  /** Tab route name (e.g. `patterns`). Tapping that footer tab scrolls this page to the top. */
  scrollTopKey?: string;
};

export function Screen({ children, footer, footerVisibleWithKeyboard = false, scroll = false, scrollTopKey }: Props) {
  const { colors } = useTheme();
  const keyboardVisible = useKeyboardVisible();
  const reduceMotion = useReduceMotion();
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (!scroll || !scrollTopKey) return;
    return registerScrollToTop(scrollTopKey, () => {
      scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
    });
  }, [scroll, scrollTopKey, reduceMotion]);
  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.bg }]}
      edges={keyboardVisible ? ['top'] : ['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            style={[styles.body, styles.column]}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, styles.column]}>{children}</View>
        )}
        {footer && (!keyboardVisible || footerVisibleWithKeyboard) ? (
          <View style={[styles.footer, styles.column]}>{footer}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // One centered column on wide windows (Duo open, iPad, landscape).
  column: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  body: { flex: 1, paddingHorizontal: gutter },
  // Extra bottom room so the last field can scroll fully above the keyboard.
  scrollContent: { paddingTop: space.lg, paddingBottom: space.xxl, gap: space.lg },
  footer: { paddingHorizontal: gutter, paddingBottom: space.md },
});
