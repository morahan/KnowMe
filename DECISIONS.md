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
