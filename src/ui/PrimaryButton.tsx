import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, space, touch, type, useTheme } from '@/theme';

type Props = { label: string; onPress: () => void; disabled?: boolean };

/** Accent fill + onAccent text (theme rule 3). */
export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor: colors.accent }, (pressed || disabled) && styles.dim]}
    >
      <Text style={[styles.label, { color: colors.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.min,
    paddingVertical: space.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dim: { opacity: 0.6 },
  label: { ...type.body, fontWeight: type.title.fontWeight },
});
