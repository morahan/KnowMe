import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, space, touch, type, useTheme } from '@/theme';

type Props = { label: string; selected: boolean; onPress: () => void };

/** Off = border outline + text; on = accent fill + onAccent text (theme rule 4). */
export function Chip({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected
          ? { backgroundColor: colors.accent, borderColor: colors.accent }
          : { borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[type.label, { color: selected ? colors.onAccent : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  chip: {
    minHeight: touch.min,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
    justifyContent: 'center',
  },
});
