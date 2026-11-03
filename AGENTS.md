# AGENTS.md — Start here

You are building **KnowMe**, a hackathon MVP. Read these before writing code, in order:

1. `PRODUCT.md` — what we're building and what we're not
2. `DESIGN.md` — how it looks, feels, and speaks
3. `SAFETY.md` — non-negotiable rules for AI and crisis handling
4. `STRUCTURE.md` — where every file goes and the import rules
5. `src/theme/index.ts` — the brand: every color, type size, space, radius, and motion value, plus the brand rules at the bottom. **Read it before any visual or brand decision.**

## The one-line test
Every change must make the app **simpler, calmer, or more honest**. If it doesn't, don't ship it.

## How to work
- Work autonomously. Don't stop to ask. Make the reasonable call and log it in `DECISIONS.md` (one line: date, decision, why).
- Build in phases. Commit after each phase with a clear message.
- Before every commit: `npx tsc --noEmit`, lint, tests. Fix failures first.
- Anything unfinished goes in `TODO.md`. No silent gaps.
- Prefer deleting code to adding it. One great screen beats three okay ones.

## Making decisions
When a choice isn't covered by these docs, decide in this order. The first rule that settles it wins.

1. **Safe.** Does it violate `SAFETY.md`? Then no, whatever else it buys.
2. **Private.** Does it send or store more than it needs? Pick the option that keeps data on the device.
3. **Demo-critical.** Does it serve the 3-minute demo in `PRODUCT.md`? If not, it goes in `TODO.md`, not the app.
4. **Simple.** Fewer screens, fewer taps, fewer dependencies, fewer lines.
5. **Calm.** Softer, slower, quieter wins.
6. **Reversible.** When two options are equal, pick the one that's easier to change later.

### Tie-breakers
- Native platform behavior beats custom UI.
- Boring, well-documented libraries beat clever ones.
- A hard-coded sensible default beats a setting.
- Working ugly beats beautiful broken. Polish comes after it works end to end.

### When you're stuck
- Spent more than 20 minutes on one problem? Pick the simplest workaround, log it in `DECISIONS.md`, add the real fix to `TODO.md`, and move on.
- A package won't install or build? Drop it and write the small version yourself.
- An API detail is unclear (e.g., Llama model name)? Make it an env var with a sensible default and document it in the README.
- Never fake a feature. If it doesn't work, say so in `TODO.md`. Never stub the safety checks.

### Time budget (~30 hours total)
| Phase | Target |
|---|---|
| Scaffold, theme, data layer | 2 h |
| Setup, Log, Today | 4 h |
| I'm in it | 2 h |
| Patterns | 3 h |
| Proxy + Reflect | 3 h |
| Safety + tests | 2 h |
| Demo data, polish, docs | 3 h |
Remaining time is buffer for device testing and the demo. Protect it.

### Logging a decision
`DECISIONS.md`, one line each:
`2026-11-03 | Used victory-native over custom SVG | installs cleanly, saves ~2h`

## Stack (fixed)
- Expo (latest SDK), React Native, TypeScript `strict`, expo-router
- Local-only storage: `expo-sqlite`. No accounts, no sync, no analytics.
- AI: Meta Llama API via a small Vercel proxy in `/proxy`. The key never ships in the app.
- Minimal dependencies. Before adding a package, ask: can 30 lines of our own code do this?

## Code conventions
- Follow `STRUCTURE.md` exactly: one folder per feature, thin routes, one-way imports.
- All colors, spacing, type, radii, and motion come from `src/theme/index.ts` (the brand source of truth). Use semantic colors from `useTheme().colors`, never the raw palette. No hard-coded values in components. If `DESIGN.md` and the theme disagree on a value, the theme wins; log it in `DECISIONS.md`.
- Small components, typed props, no `any`.
- Each feature keeps its user-facing strings in its own `copy.ts`, written to the voice rules in `DESIGN.md`.

## Definition of done (per feature)
- Works on iOS and Android, with demo data and with no data (empty state).
- Usable with one thumb. Text scales with system font size.
- Copy follows the voice rules in `DESIGN.md`.
- Violates nothing in `SAFETY.md`.
