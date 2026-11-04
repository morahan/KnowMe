# DESIGN.md — Beautifully simple

## The feeling
A quiet room at night. One lamp on. Nothing asking for your attention.

KnowMe is used in hard moments, often in the evening, often mid-craving. The design's job is to **lower the heart rate**, not raise it.

## Rules
1. **One thing per screen.** One primary action, clearly the biggest thing on the screen.
2. **Fewer choices.** If a screen needs instructions, it has too much on it.
3. **Space is the decoration.** Generous padding, no borders, no cards-in-cards. The one divider is the small centered section break (two short hairlines around a lamp-amber dot) between major sections; never full-width rules or lines between rows.
4. **No red.** Nothing in the app signals failure. "Used" is neutral gray, not red.
5. **Motion is slow and soft.** Nothing bounces, flashes, or shakes.
6. **Thumb-first.** Primary actions sit in the bottom third. Touch targets ≥ 48pt.
7. **Dark by default.** Support light mode, but design dark first.

## Tokens (`src/theme`)
> **Source of truth: `src/theme/index.ts`.** It holds the full palette (dark + light), semantic colors (`onAccent`, `accentText`, `calmText`, `border`), type scale, motion timings, and the brand rules. The tables below are a summary; when they differ, the theme file wins.

**Color (dark)**
| Token | Value | Use |
|---|---|---|
| `bg` | `#0F1115` | Screen background |
| `surface` | `#171A20` | Raised areas (sparingly) |
| `text` | `#ECE8E1` | Primary text, warm off-white |
| `muted` | `#8A8F98` | Secondary text, "used" state |
| `accent` | `#E8B07A` | One warm amber. Primary buttons, breath circle, highlights |
| `calm` | `#7FB3A6` | Sage. "Rode it out," positive trends |

Light mode: invert bg/text, keep accent and calm. Never add a third accent.

**Type**
- One family: system font (SF / Roboto). No custom fonts.
- Sizes: 34 (one big number), 24 (screen title), 17 (body), 14 (labels). Nothing else.
- Weights: regular and semibold only.

**Space:** 4, 8, 16, 24, 40, 64. Screen side padding: 24.
**Radius:** 16 for buttons and chips, 999 for the breath circle. That's it.
**Motion:** 300ms ease-out for transitions; breath circle 4s in / 6s out.

## Components (build once, use everywhere)
- `Screen` — bg, safe area, side padding
- `Title`, `Body`, `Label` — the only text components
- `PrimaryButton` — full width, accent fill, bottom of screen
- `Chip` — toggleable, outline → filled accent
- `IntensityPicker` — 1–10, a single row, large tap targets, the chosen number grows
- `BreathCircle` — soft accent circle that expands and contracts with the text "in" / "out"
- `Stat` — one big number + one muted label

## Screen notes
- **Today:** the days-since number large and centered. Below it, quiet text for today's moments. The **I'm in it** button is the only accent-filled thing on the screen.
- **Log:** one scrollable screen, chips grouped by question, Save pinned at the bottom. Haptic tick on save, then return to Today.
- **I'm in it:** full screen, no tab bar. Reasons fade in one at a time. The breath circle in the center. The timer is small and muted, never a big countdown.
- **Patterns:** one chart per section, max 4 sections. A plain sentence above each chart says what it shows. No legends if avoidable.
- **Reflect:** text appears line by line, generous line height, like reading a letter.

## Voice (`src/copy.ts`)
Calm, plain, adult. Short sentences. Talks *with* the user, never *at* them.

| Instead of | Say |
|---|---|
| "Relapse" / "Failed" | "Used" |
| "Great job! 🎉" | "You rode it out." |
| "You should try…" | "Last time, a walk helped." |
| "Streak broken" | "Day 1 again. Still here." |
| "Log your craving now!" | "Want to note this one?" |

No emoji. No exclamation points. No guilt.

## Empty states
Every empty screen gets one sentence and one action. Example for Patterns: "Patterns show up after a few moments. Log one when the next craving comes."
