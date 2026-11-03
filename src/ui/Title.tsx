import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { space, type, useTheme } from '@/theme';

export function Title({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole="header" style={[styles.text, { color: colors.text }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { ...type.title, marginTop: space.lg },
});
