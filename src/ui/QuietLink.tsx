import { Pressable, StyleSheet, Text } from 'react-native';
import { touch, type, useTheme } from '@/theme';

type Props = { label: string; onPress: () => void; hint?: string };

/** Secondary action: text only, no border (theme rule 3). Full touch target. */
export function QuietLink({ label, onPress, hint }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="link" accessibilityHint={hint} onPress={onPress} style={styles.hit}>
      <Text style={[type.body, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { minHeight: touch.min, justifyContent: 'center' },
});
