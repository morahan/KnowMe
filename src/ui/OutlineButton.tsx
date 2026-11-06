import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, space, touch, type, useTheme } from '@/theme';

type Props = { label: string; onPress: () => void };

/** A clear button that is not the screen's one accent fill: border outline + text, like an off chip. */
export function OutlineButton({ label, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, { borderColor: colors.border }, pressed && styles.pressed]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: touch.min,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  label: { ...type.body, fontWeight: type.title.fontWeight },
});
