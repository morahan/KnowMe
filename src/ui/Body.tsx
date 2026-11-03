import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { type, useTheme } from '@/theme';

type Props = { children: ReactNode; muted?: boolean; letter?: boolean };

/** `letter` = Reflect's roomier line height. */
export function Body({ children, muted = false, letter = false }: Props) {
  const { colors } = useTheme();
  return (
    <Text style={[letter ? type.letter : type.body, { color: muted ? colors.muted : colors.text }]}>{children}</Text>
  );
}
