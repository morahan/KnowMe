/**
 * KnowMe tab line icons — src/ui/TabIcons.tsx
 * Today uses the gnome PNG (assets/gnome-tab.png); these are the other three.
 * 24×24, 1.75 stroke, rounded caps. Inactive = muted outline. Active = accent.
 * No icon library needed; uses react-native-svg (already installed for charts).
 */
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme';

type IconProps = { focused: boolean; size?: number };

const stroke = { strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function useIconColors(focused: boolean) {
  const { colors } = useTheme();
  return { line: focused ? colors.accent : colors.muted, onAccent: colors.onAccent };
}

/** Log — plus in a circle. Fills when active. */
export function LogIcon({ focused, size = 24 }: IconProps) {
  const { line, onAccent } = useIconColors(focused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={line} fill={focused ? line : 'none'} {...stroke} />
      <Path d="M12 8.5v7M8.5 12h7" stroke={focused ? onAccent : line} {...stroke} />
    </Svg>
  );
}

/** Patterns — a gentle wave over a baseline. */
export function PatternsIcon({ focused, size = 24 }: IconProps) {
  const { line } = useIconColors(focused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 15.5c2.5 0 3-7 6-7s3.5 7 6 7 3-4 6-4" stroke={line} fill="none" {...stroke} />
      <Path d="M3 20h18" stroke={line} opacity={0.45} {...stroke} />
    </Svg>
  );
}

/** Me — head and shoulders. */
export function MeIcon({ focused, size = 24 }: IconProps) {
  const { line } = useIconColors(focused);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.5} r={3.5} stroke={line} fill="none" {...stroke} />
      <Path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" stroke={line} fill="none" {...stroke} />
    </Svg>
  );
}
