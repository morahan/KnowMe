/**
 * KnowMe theme — src/theme/index.ts
 * The single source of truth for every visual value in the app.
 * Components import from here. Never hard-code a color, size, or duration.
 *
 * Palette: "a quiet room at night, one lamp on."
 * All text/background pairs below pass WCAG AA (checked).
 */

import { useColorScheme } from 'react-native';

// ─── Raw palette (do not use directly in components) ──────────────
const palette = {
  ink: '#0F1115',       // near-black, slightly blue
  ink2: '#171A20',      // raised surface on dark
  ink3: '#22262E',      // pressed / chip outline on dark
  bone: '#ECE8E1',      // warm off-white
  paper: '#F7F4EF',     // light-mode background
  paper2: '#EFEAE2',    // raised surface on light
  paper3: '#E2DCD2',    // pressed / chip outline on light
  charcoal: '#1A1C20',  // light-mode text
  stone: '#8A8F98',     // muted text on dark
  slate: '#6B6F77',     // muted text on light
  amber: '#E8B07A',     // THE accent — the lamp
  amberDeep: '#9A5B24', // accent as text on light bg
  sage: '#7FB3A6',      // calm / rode it out
  sageDeep: '#3F7A6C',  // calm as text on light bg
} as const;

// ─── Semantic colors (use these) ──────────────────────────────────
export type Colors = {
  bg: string;          // screen background
  surface: string;     // raised areas (sparingly)
  border: string;      // chip outlines, pressed states
  text: string;        // primary text
  muted: string;       // secondary text, "used" state
  accent: string;      // primary button fill, breath circle, highlights
  onAccent: string;    // text/icons on an accent fill
  accentText: string;  // accent used as text on bg
  calm: string;        // "rode it out", positive trends
  calmText: string;    // calm used as text on bg
};

const dark: Colors = {
  bg: palette.ink,
  surface: palette.ink2,
  border: palette.ink3,
  text: palette.bone,
  muted: palette.stone,
  accent: palette.amber,
  onAccent: palette.ink,
  accentText: palette.amber,
  calm: palette.sage,
  calmText: palette.sage,
};

const light: Colors = {
  bg: palette.paper,
  surface: palette.paper2,
  border: palette.paper3,
  text: palette.charcoal,
  muted: palette.slate,
  accent: palette.amber,
  onAccent: palette.charcoal,
  accentText: palette.amberDeep,
  calm: palette.sage,
  calmText: palette.sageDeep,
};

// Chart series: accent first, calm second, muted for everything else.
export const chartColors = (c: Colors) => [c.accent, c.calm, c.muted] as const;

// Per-behavior series for Patterns charts only: exactly three colors,
// all from the brand palette above — the lamp amber, the calm sage, and the
// quiet muted gray. At most three behaviors show at once (see Patterns), so
// no fourth hue is ever needed and no behavior reads as an alarm. Light mode
// uses the deeper text variants so the lines stay readable on paper.
const habitDark = [palette.amber, palette.sage, palette.stone] as const;
const habitLight = [palette.amberDeep, palette.sageDeep, palette.slate] as const;

// ─── Typography ───────────────────────────────────────────────────
// System font only. Four sizes, two weights. Nothing else.
export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '600' as const }, // the one big number
  title:   { fontSize: 24, lineHeight: 30, fontWeight: '600' as const }, // screen titles
  body:    { fontSize: 17, lineHeight: 26, fontWeight: '400' as const }, // everything readable
  label:   { fontSize: 14, lineHeight: 20, fontWeight: '400' as const }, // chips, captions
  // Reflect "letter" text: body with extra air
  letter:  { fontSize: 17, lineHeight: 30, fontWeight: '400' as const },
} as const;

// ─── Space, radius, touch ─────────────────────────────────────────
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64 } as const;
export const gutter = space.lg;          // screen side padding
export const radius = { md: 16, full: 999 } as const;
export const touch = { min: 48 } as const; // minimum tap target (pt)
// Wide windows (iPhone Duo open, iPad, landscape): keep one calm, thumb-first
// column instead of stretching content edge to edge.
export const layout = { maxContentWidth: 560, breathMaxDiameter: 360 } as const;
// The one section break: two short hairlines around a small lamp-amber dot,
// centered, like a pause between chapters.
export const divider = { line: space.lg, dot: space.xs + 2, stroke: 1, gap: space.sm } as const;

// ─── Motion ───────────────────────────────────────────────────────
// Slow and soft. Nothing bounces.
export const motion = {
  fast: 200,          // chip toggle
  base: 300,          // screen transitions, fades
  slow: 600,          // reasons fading in one by one
  breathIn: 4000,     // breath circle expand
  breathOut: 6000,    // breath circle contract
  easing: 'ease-out', // use Easing.out(Easing.cubic) in Reanimated
} as const;

// Translucent amber discs: quiet depth without shadows or gradients. The
// outer layers travel less than the center, like a soft envelope of light.
// Pairs are [exhaled, inhaled]; every layer follows the same breath clock.
export const breath = {
  widthRatio: 0.6,
  layers: [
    { name: 'atmosphere', scale: [0.96, 1.26], opacity: [0.025, 0.045] },
    { name: 'halo', scale: [0.8, 1.13], opacity: [0.055, 0.075] },
    { name: 'circle', scale: [0.62, 1], opacity: [0.18, 0.24] },
    { name: 'heart', scale: [0.5, 0.84], opacity: [0.045, 0.065] },
  ],
} as const;

// ─── Theme object + hook ──────────────────────────────────────────
export type Theme = {
  colors: Colors;
  type: typeof type;
  space: typeof space;
  gutter: number;
  radius: typeof radius;
  touch: typeof touch;
  motion: typeof motion;
  scheme: 'dark' | 'light';
  habitColors: readonly string[];
};

const build = (scheme: 'dark' | 'light'): Theme => ({
  colors: scheme === 'dark' ? dark : light,
  type,
  space,
  gutter,
  radius,
  touch,
  motion,
  scheme,
  habitColors: scheme === 'dark' ? habitDark : habitLight,
});

export const darkTheme = build('dark');
export const lightTheme = build('light');

/** Dark by default; follows the system when it says light. */
export function useTheme(): Theme {
  return useColorScheme() === 'light' ? lightTheme : darkTheme;
}

// ─── Rules agents must follow ─────────────────────────────────────
// 1. One accent. Amber is the only fill color. Sage is for "rode it out" and positive trends only.
//    Exception: `habitColors` marks behaviors on Patterns charts only (lines, dots, bar segments), never buttons or chips.
// 2. No red, ever. "Used" is `muted`, not a warning color.
// 3. Primary button = accent fill + onAccent text. Secondary = text only, no border.
// 4. Chips: off = border outline + text; on = accent fill + onAccent text.
// 5. No shadows, no gradients. Space separates things. The only divider is `SectionSeparator`
//    (see `divider`) between major sections: never full-width rules, borders, or lines between rows.
// 6. Status bar and navigation bar match `bg`.
