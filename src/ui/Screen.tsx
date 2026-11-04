import type { ReactNode } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { gutter, layout, space, useTheme } from '@/theme';
import { registerScrollToTop } from './scrollToTop';
import { useReduceMotion } from './useReduceMotion';

const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

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
  // The root layout always provides insets; isolated renders (tests) get zero.
  const insets = useContext(SafeAreaInsetsContext) ?? NO_INSETS;
  const reduceMotion = useReduceMotion();
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    if (!scroll || !scrollTopKey) return;
    return registerScrollToTop(scrollTopKey, () => {
      scrollRef.current?.scrollTo({ y: 0, animated: !reduceMotion });
    });
  }, [scroll, scrollTopKey, reduceMotion]);

  // When the keyboard opens, the scroll area shrinks and a pinned footer
  // (e.g. Log's Save) can cover the field being typed in. Bring it back
  // into view. The scroll view's own keyboard insets don't know the footer.
  const scrollY = useRef(0);
  const footerHeight = useRef(0);
  useEffect(() => {
    if (!scroll) return;
    const sub = Keyboard.addListener('keyboardDidShow', (e) => {
      const input = TextInput.State.currentlyFocusedInput();
      const scroller = scrollRef.current;
      if (!input || !scroller) return;
      // Measure against the keyboard edge, not just the scroller: the
      // avoiding view may still be settling when this fires.
      const pinned = footerVisibleWithKeyboard ? footerHeight.current : 0;
      scroller.measureInWindow((_sx, sy, _sw, sh) => {
        input.measureInWindow((_ix, iy, _iw, ih) => {
          const visibleBottom = Math.min(sy + sh, e.endCoordinates.screenY - pinned);
          const overflow = iy + ih + space.md - visibleBottom;
          const underTop = sy - iy;
          if (overflow > 0) scroller.scrollTo({ y: scrollY.current + overflow, animated: !reduceMotion });
          else if (underTop > 0) scroller.scrollTo({ y: scrollY.current - underTop - space.md, animated: !reduceMotion });
        });
      });
    });
    return () => sub.remove();
  }, [scroll, reduceMotion, footerVisibleWithKeyboard]);
  return (
    // Window insets from the root provider, not a native SafeAreaView: a modal
    // presented while the keyboard is up (the crisis card from a note) measured
    // zero insets there and drew its title under the clock.
    <View
      style={[
        styles.root,
        { backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: keyboardVisible ? 0 : insets.bottom },
      ]}
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
            onScroll={(e) => {
              scrollY.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={32}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.body, styles.column]}>{children}</View>
        )}
        {footer && (!keyboardVisible || footerVisibleWithKeyboard) ? (
          <View
            style={[styles.footer, styles.column]}
            onLayout={(e) => {
              footerHeight.current = e.nativeEvent.layout.height;
            }}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
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
