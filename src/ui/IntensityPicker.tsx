import { Pressable, StyleSheet, Text, View } from 'react-native';
import { touch, type, useTheme } from '@/theme';

type Props = { value: number | null; onChange: (n: number) => void };

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function IntensityPicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {LEVELS.map((n) => {
        const chosen = n === value;
        return (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ selected: chosen }}
            accessibilityLabel={`${n} of 10`}
            onPress={() => onChange(n)}
            style={styles.cell}
          >
            <Text style={chosen ? [type.display, { color: colors.accentText }] : [type.body, { color: colors.muted }]}>
              {n}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1, minHeight: touch.min, alignItems: 'center', justifyContent: 'center' },
});
