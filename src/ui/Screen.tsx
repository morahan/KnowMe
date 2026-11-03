import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gutter, space, useTheme } from '@/theme';

type Props = {
  children?: ReactNode;
  /** Pinned to the bottom third, e.g. a PrimaryButton. */
  footer?: ReactNode;
  scroll?: boolean;
};

export function Screen({ children, footer, scroll = false }: Props) {
  const { colors } = useTheme();
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <Body style={styles.body} contentContainerStyle={scroll ? styles.scrollContent : undefined}>
        {children}
      </Body>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: gutter },
  scrollContent: { paddingVertical: space.lg, gap: space.lg },
  footer: { paddingHorizontal: gutter, paddingBottom: space.md },
});
