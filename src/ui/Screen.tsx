import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gutter, space, useTheme } from '@/theme';

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
  /** Pinned to the bottom third, e.g. a PrimaryButton. Hidden while the keyboard is open. */
  footer?: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, footer, scroll = false }: Props) {
  const { colors } = useTheme();
  const keyboardVisible = useKeyboardVisible();
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
            style={styles.body}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.body}>{children}</View>
        )}
        {footer && !keyboardVisible ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: gutter },
  scrollContent: { paddingVertical: space.lg, gap: space.lg },
  footer: { paddingHorizontal: gutter, paddingBottom: space.md },
});
