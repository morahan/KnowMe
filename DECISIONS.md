# DECISIONS.md

One line each: `date | decision | why`

2026-11-03 | Crisis terms live in `src/features/safety/crisisTerms.ts`, not `src/safety/` | SAFETY.md path predates STRUCTURE.md; safety is a feature folder
2026-11-03 | Proxy keeps its own copy of the crisis terms in `proxy/lib/crisis.ts` | proxy deploys separately; importing app code into Vercel adds build risk
2026-11-03 | Reflect lives in the Patterns tab via `app/(tabs)/patterns.tsx` passing `<ReflectCard/>` as `footer` | features may not import each other (STRUCTURE rule 2); the route composes them
2026-11-03 | Reflect exports `ReflectCard` instead of a `ReflectScreen` | it has no route of its own
2026-11-03 | Added `ui/QuietLink` | crisis card and Get support need low-emphasis full-size tap targets; not in DESIGN's list
2026-11-03 | Added a `settings` key/value table and `db/repos/settings.ts` | needed to store the per-install id for rate limiting; avoids a secure-store dependency
2026-11-03 | IDs are random base36 strings, not UUIDs | Hermes has no crypto.randomUUID; avoids expo-crypto
2026-11-03 | `app/_layout.tsx` runs `migrate()` synchronously at module load | db is ready before any screen queries; tiny schema, no visible delay
2026-11-03 | Dark mode only for now | DESIGN says design dark first; light mode is in TODO.md
2026-11-03 | `demo-data` has `logic.ts` + `hooks.ts` and no screen | it's a seeder; the switch lives on Me
2026-11-03 | Proxy uses Llama's OpenAI-compatible endpoint, base URL and model as env vars with defaults | API details unverified; AGENTS.md says env var + README
2026-11-03 | Using Yarn for scripts, not npx | user's standing preference; `yarn typecheck` == `tsc --noEmit`
2026-11-03 | Adopted the supplied `src/theme/index.ts` as the single brand source; removed the split token files | one file agents can read for every brand decision
2026-11-03 | `theme/` imports `useColorScheme` from react-native | the supplied theme ships `useTheme()`; that one import is the exception to "theme imports nothing"
2026-11-03 | Components read colors via `useTheme()` and set `app.json` userInterfaceStyle to automatic | theme supports light mode; dark stays the default
2026-11-03 | BreathCircle sizes to 60% of screen width | theme has no size token; a ratio scales across phones
2026-11-03 | Added `CLAUDE.md` that imports `AGENTS.md` | Claude Code reads CLAUDE.md, not AGENTS.md
2026-11-03 | Built all placeholder screens end to end (Setup, Log, Today, I'm in it, Patterns, Me) | the brief asks for a working MVP, not scaffolding
2026-11-03 | Charts are hand-rolled react-native-svg, not victory-native | installs cleanly, no native chart dep, full theme control
2026-11-03 | Proxy rejects bodies over 8KB (was 16KB) | matches the brief exactly
2026-11-03 | Demo moments carry `is_demo` (migration 2) and clearing deletes only those | demo data can never eat real data
2026-11-03 | `MAX_REASONS` moved to `db/schema.ts` (re-exported from the repo) | pure logic tests must not open SQLite on import
2026-11-03 | Reflect caches the last letter in `settings` (`reflect_cache`) | the letter survives offline and relaunch; no new storage
2026-11-03 | Crisis parity test imports the proxy modules from the root jest run | proves app/proxy term lists never drift; proxy still deploys standalone
2026-11-03 | Disabled `react-hooks/set-state-in-effect` in ESLint | SQLite data hooks set state after an await; the rule flags the intended pattern
2026-11-03 | Pinned ESLint 9 | eslint-plugin-react breaks on ESLint 10 (getFilename)
2026-11-03 | Strict review: SAFETY cases pinned as named unit tests (guard, classifyResponse, proxy prompt) | screen-level card rendering needs a device harness; the pure decisions are now locked
2026-11-03 | Icon and splash regenerated at ~10% padding on #0F1115; `assets/logo.png` shown on Today | brand asset in-app and on the phone, one treatment everywhere
2026-11-03 | `IntensityPicker` wraps to two rows of five | one row of ten drops under 48pt wide on small phones
2026-11-03 | Reduce Motion stills the breath circle and all fades via `ui/useReduceMotion` | DESIGN motion rules plus platform accessibility setting
2026-11-03 | Log Other tags: 20-char cap, 40-char input, max 3 custom per feelings/helpers group; Other stays openable at max, removal frees a slot | short chips keep groups uncluttered; typed words save with the moment and surface in Patterns/Reflect as-is
2026-11-03 | What-helped Other input is 140 chars (multiline); past 20 chars a "Save for quick tagging" option appears with the 20-char tag auto-filled and editable | a helper can be a full sentence, but the chip that saves with the moment stays 20 chars and in the person's own shortened words
2026-11-03 | Same 140-char + quick-tag flow extended to What's-going-on Other; quick-tag state is per group | feelings get the same sentence-length input as helpers; the two groups never share a quick tag
2026-11-03 | Removed unused `react-native-reanimated`/`gesture-handler`, added `expo-dev-client`, splash via `expo-splash-screen` plugin | pod install and dev builds fail without them on SDK 58; nothing imported reanimated
2026-11-03 | Verified end to end on iOS simulator and Android emulator (adb, panel streaming unavailable) | both platforms completed the DEMO walk with demo data; crisis moment confirmed unsaved on each
2026-11-03 | I'm in it habit pick is a phase inside `InItScreen`, not a new route | one tap then breathing; single habit skips it entirely, and the 20-minute timer only starts after the pick
2026-11-03 | Patterns/Log section titles use new `SectionTitle` (17pt semibold) with a short 40pt hairline `SectionSeparator` between sections | user asked for larger titles + separators; stays inside the existing type/space scale, separator is short and quiet rather than a full-width divider
2026-11-03 | Deployed proxy to Vercel as `knowme-proxy` (scope morahan); app .env points at https://knowme-proxy.vercel.app | stable production URL for the demo; key lives only in Vercel env
2026-11-03 | Patterns shows in-memory sample data ("Patterns - Sample Data" + example notice) until the first real moment, then real logs only; sample generator moved to lib/demoMoments so patterns and demo-data share it without a feature-to-feature import | first-run users see how Patterns works without sample rows polluting Today or the database
2026-11-03 | Demo polish only: breath word fades in over motion.slow with a soft halo disc, reasons rise+fade with ease-out cubic, charts get 10/5/1 + date/hour axis labels with thicker marks and muted (not border) hour bars, Reflect holds loading at least motion.slow+motion.base before a slow staggered letter reveal | calm/premium feel and arm's-length readability using existing theme tokens only; crisis path never waits for the reveal hold
2026-11-03 | Confirmed local-only storage: all user data (habits, reasons, moments, settings incl. Reflect cache) lives only in on-device expo-sqlite knowme.db; Patterns sample stays in-memory per user choice; added src/db/localOnly.test.ts guard that fails on any other network/storage path or cloud package | user asked that all data be saved locally; Reflect summary-on-tap remains the only egress and the proxy stores nothing
2026-11-03 | Keyboard fix lives in shared `ui/Screen` (KeyboardAvoidingView padding on iOS / height on Android, footer hidden while keyboard is open) plus `tabBarHideOnKeyboard` in tabs and `softwareKeyboardLayoutMode: resize` in app.json | one fix covers Log/Setup/Me and every Screen footer; no new dependency
2026-11-03 | Intensity chart spans first→last logged day (not a fixed 21-day window), dots inset `space.md` from both edges, fits 30 days then scrolls sideways opening on the newest end | day one sits visible at the left; no empty historical dates are plotted
2026-11-03 | Setup Something else input gets its own inline Save button (max 20 chars, live count, saved words shown as removable chips) | the footer Done button is hidden while the keyboard is open, so typed custom habits like anger had no visible way to save
