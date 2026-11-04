import { StyleSheet, View } from 'react-native';
import { divider, radius, space, useTheme } from '@/theme';

/**
 * The one section break: a short hairline, a small lamp-amber dot, a short
 * hairline, centered with air above and below. Decorative only.
 */
export function SectionSeparator() {
  const { colors } = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.wrap}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: divider.gap,
    paddingVertical: space.sm,
  },
  line: { width: divider.line, height: divider.stroke, borderRadius: radius.full },
  dot: { width: divider.dot, height: divider.dot, borderRadius: radius.full },
});
