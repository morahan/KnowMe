# STRUCTURE.md — Where everything lives

**Rule of thumb:** every feature is one folder. To change a feature, you should only need to open that folder, plus the shared folders it uses.

## The tree

```
knowme/
├── AGENTS.md            ← agents start here
├── PRODUCT.md           ← what we're building
├── DESIGN.md            ← how it looks and speaks
├── SAFETY.md            ← non-negotiables
├── STRUCTURE.md         ← this file
├── DECISIONS.md         ← one line per decision
├── TODO.md              ← anything unfinished
├── DEMO.md              ← the 3-minute demo script
├── README.md            ← how to run it
│
├── app/                 ← ROUTES ONLY (expo-router). Thin files, no logic.
│   ├── _layout.tsx      ← root: theme, db init, safety provider
│   ├── setup.tsx        → renders features/setup
│   ├── in-it.tsx        → renders features/in-it (full screen, no tabs)
│   ├── crisis.tsx       → renders features/safety crisis card
│   └── (tabs)/
│       ├── _layout.tsx  ← tab bar: Today, Log, Patterns, Me
│       ├── index.tsx    → features/today
│       ├── log.tsx      → features/log-moment
│       ├── patterns.tsx → features/patterns (+ reflect inside it)
│       └── me.tsx       → features/me
│
├── src/
│   ├── features/        ← ONE FOLDER PER FEATURE
│   │   ├── setup/        pick habits, write reasons
│   │   ├── today/        days-since, today's moments, "I'm in it" button
│   │   ├── log-moment/   the 10-second log
│   │   ├── in-it/        reasons + helpers + breath timer
│   │   ├── patterns/     local charts and one-line insights
│   │   ├── reflect/      AI mirror: builds summary, calls proxy, shows letter
│   │   ├── me/           edit habits/reasons, get support, privacy, demo switch
│   │   ├── safety/       crisis detection + crisis card (shared by all)
│   │   └── demo-data/    seeds 21 days of realistic moments
│   │
│   ├── ui/              ← shared components (Screen, Title, Body, Label,
│   │                      PrimaryButton, Chip, IntensityPicker, BreathCircle, Stat)
│   ├── theme/           ← index.ts: THE brand source of truth (colors, type, space, radius, motion, rules)
│   ├── db/              ← SQLite: client, schema, migrations, repositories
│   │   ├── client.ts
│   │   ├── schema.ts
│   │   └── repos/        habits.ts, reasons.ts, moments.ts
│   └── lib/             ← tiny pure helpers (dates, ids, stats math)
│
├── scripts/             ← release-version.sh: deploy's version/build prompt and bump
├── plugins/             ← Expo config plugins (android/ and ios/ are generated; edit here, never there)
│
├── proxy/               ← Vercel serverless function for Llama
│   ├── api/reflect.ts   ← the only endpoint
│   ├── lib/
│   │   ├── prompt.ts    ← system prompt (from SAFETY.md)
│   │   ├── crisis.ts    ← input + output crisis checks
│   │   └── rateLimit.ts
│   └── README.md        ← deploy + env vars
│
└── assets/              ← icon, splash
```

## Inside every feature folder

Same shape every time, so agents always know where to look:

```
src/features/<feature-name>/
├── README.md        ← what it does, its screens, what it uses (≤ 15 lines)
├── <Name>Screen.tsx ← the screen the route renders
├── components/      ← components used ONLY by this feature
├── hooks.ts         ← state and data access for this feature
├── logic.ts         ← pure functions (no React, no db) — easy to test
├── logic.test.ts    ← tests for logic.ts
├── copy.ts          ← every user-facing string in this feature
└── index.ts         ← public exports (usually just the Screen)
```

Skip files a feature doesn't need. Don't add new kinds of files without logging it in `DECISIONS.md`.

## Import rules (keep the arrows pointing one way)

```
app/  →  features/  →  ui/, theme/, db/, lib/
                   ↘  features/safety  (the one shared feature)
```

1. `app/` files only import a feature's `index.ts`. No logic in routes.
2. Features never import from another feature, except `safety`.
3. If two features need the same thing, move it to `ui/` (visual) or `lib/` (logic). Never copy-paste.
4. Only `db/repos` touch SQLite. Features call repos through their own `hooks.ts`.
5. `theme/` imports nothing. `lib/` imports nothing from the app.
6. Only `features/reflect` talks to the network, and only to `proxy/`.

## Naming
- Folders: `kebab-case` (`log-moment`, `demo-data`)
- Components: `PascalCase.tsx` (`BreathCircle.tsx`)
- Everything else: `camelCase.ts` (`rateLimit.ts`)
- One component per file.

## Adding a new feature
1. Create `src/features/<name>/` with `README.md` first (what and why, in a few lines).
2. Add the screen, then `index.ts`.
3. Add a thin route in `app/`.
4. Log it in `DECISIONS.md`. Check it's in scope in `PRODUCT.md` before starting.
