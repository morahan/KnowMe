import { StyleSheet, View } from 'react-native';
import { space, useTheme } from '@/theme';

/** Small, quiet separator between sections. Short hairline, not a full-width divider. */
export function SectionSeparator() {
  const { colors } = useTheme();
  return <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.line, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  line: { width: space.xl, height: StyleSheet.hairlineWidth, borderRadius: 1 },
});
