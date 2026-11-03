import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { type, useTheme } from '@/theme';

export function Label({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[type.label, { color: colors.muted }]}>{children}</Text>;
}
