import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { type, useTheme } from '@/theme';

/** Section heading on a form / chart screen. Larger than `Label`: body size, semibold, primary text. */
export function SectionTitle({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole="header" style={[type.body, { fontWeight: '600', color: colors.text }]}>
      {children}
    </Text>
  );
}
