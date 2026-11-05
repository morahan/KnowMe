# KnowMe

A private journal for people changing a habit. It reflects your own data back to you. It never lectures, never labels, never shames.

> Know thyself. The data is yours, the conclusions are yours.

## Start here

`AGENTS.md` · `PRODUCT.md` what · `DESIGN.md` how it looks · `SAFETY.md` non-negotiables · `STRUCTURE.md` where things go · `DECISIONS.md` · `TODO.md` · `DEMO.md` (3-minute demo script)

## Run locally

Needs Node 20+ and [just](https://just.systems). `yarn.lock` is Yarn 4, so install with `just install` (plain Yarn 1 rewrites the lockfile).

```sh
just install
cp .env.example .env   # set EXPO_PUBLIC_PROXY_URL after deploying the proxy (optional)
yarn ios               # or: yarn android · yarn start for the QR code
```

First launch offers setup: pick what you are tracking and write your reasons. Everything is skippable and editable later in **Me**.

## Check before every commit

```sh
yarn typecheck && yarn lint && yarn test
```

## Ship to the stores

```sh
just deploy           # both stores, one build number   (alias: cb-deploy)
just deploy-ios       # App Store Connect / TestFlight   (aliases: cb-deploy-ios, cb-deploy-testflight)
just deploy-android   # signed .aab, upload in Play Console (alias: cb-deploy-android)
just cb               # clean build only: wipe caches, node_modules, ios/, android/; reinstall; prebuild
```

Version and build live in `app.json` (`expo.version`, `ios.buildNumber`, `android.versionCode`), which always holds the build that ships next. Each deploy asks *"Is this Version 0.0.1, build 1 on …? [y/N]"* and lets you fix the build, the version, or both. Then it runs `just cb` and the checks, builds, and ships. Once a build number is spent, it commits `app.json` with the next one (not pushed). The Play upload key lives in `~/.knowme/` and is created on first run. Back it up.

For reliable iOS uploads from the terminal, create an App Store Connect API key (App Store Connect → Users and Access → Integrations → Team Keys, role App Manager), save the `.p8` in `~/.knowme/`, and add `~/.knowme/app-store-connect.env`:

```sh
ASC_KEY_ID=ABC123DEFG
ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000
ASC_KEY_PATH=$HOME/.knowme/AuthKey_ABC123DEFG.p8
```

Without it, the upload uses the Apple ID signed in to Xcode. If an upload fails, the archive opens in Organizer; upload it there, then run `just release-bump`. "Upload Symbols Failed" for React, ReactNativeDependencies and hermesvm is a harmless warning: React Native ships those frameworks prebuilt without dSYMs.

## How it works

| Tab | What it does |
|---|---|
| Today | Days since last time per habit, today's activity without outcome labels, the big **I'm in it** button |
| Log | One screen, under 10 seconds: intensity, context, feelings, habit-specific Yes / No question, helpers, note |
| Patterns | Local charts only (no AI): intensity over time, cravings by hour, top contexts/feelings, what helps |
| Me | Edit habits and reasons, Get support (988 · SAMHSA · QUIT-NOW), privacy note, demo-data switch |

**I'm in it** (full screen): your reasons fade in, your top helpers, a 20-minute timer with a 4s-in / 6s-out breathing circle, then "Where's it at now?" saves a moment.

**Reflect** (in Patterns): sends only an aggregated summary (counts, hours, tags, intensities, your reasons — never raw notes unless you toggle "Include my notes") to the proxy. Llama writes 4–6 calm sentences ending in one open question. Results are cached on the phone.

**Safety**: every free-text field is checked locally for crisis language before anything is saved or sent. A match shows the 988 / 911 card first. The proxy checks input and output again. See `SAFETY.md`.

## Data & privacy

All data is saved locally, and only locally. Everything the app stores — habits, reasons, moments, settings (onboarded flag, per-install rate-limit id, cached Reflect letter) — lives in one on-device `expo-sqlite` database, `knowme.db`. No accounts, no cloud storage, no sync, no analytics.

The Patterns sample data shown before your first log is generated in memory and never saved. Demo moments loaded from **Me** are flagged `is_demo` so clearing them never touches real data.

Nothing is saved anywhere else. The one time anything leaves the phone is when you tap **Reflect**: only the anonymous summary described above is sent, the proxy stores nothing (it logs token counts and errors only), and the returned letter is cached back into the same local database. A guard test, `src/db/localOnly.test.ts`, fails the suite if any other network or storage path is added.

## Deploy the proxy

The Llama key never ships in the app. One Vercel function: `POST /api/reflect`.

```sh
cd proxy
vercel link            # Root Directory: proxy/
vercel env add LLAMA_API_KEY
vercel deploy
```

Then set `EXPO_PUBLIC_PROXY_URL` in `.env` (no trailing slash) and restart Expo.

| Var | Required | Default |
|---|---|---|
| `LLAMA_API_KEY` | yes | — |
| `LLAMA_BASE_URL` | no | `https://api.llama.com/compat/v1` (OpenAI-compatible) |
| `LLAMA_MODEL` | no | `Llama-4-Maverick-17B-128E-Instruct-FP8` |
| `RATE_LIMIT_PER_HOUR` | no | `10` per install, per warm instance |

The base URL and model name are env vars with sensible defaults — verify them against your Llama API account. The proxy caps `max_tokens`, rejects bodies over 8KB, rate-limits per install id, and logs only token counts and errors. Details: `proxy/README.md`.

## Stack

Expo (latest SDK), React Native, TypeScript strict, expo-router, expo-sqlite, react-native-svg charts (own code, no chart library). Minimal dependencies by design.
