import { StyleSheet, Text, View } from 'react-native';
import { space, type, useTheme } from '@/theme';

type Props = { value: string | number; label: string };

export function Stat({ value, label }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={[type.display, { color: colors.text }]}>{value}</Text>
      <Text style={[type.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.xs },
});
