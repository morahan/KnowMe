# Submission checklist — KnowMe 0.0.1 ($7.99 paid app)

Status key: ✅ done in this repo · 👤 only the account holder can do it (needs console login,
paid agreements, tax/banking, or identity) · ⏳ build/upload step to run.

## Already done in this repo ✅

- [x] Version aligned to `0.0.1` (`app.json`, `package.json`, Android `versionName`, iOS `MARKETING_VERSION`)
- [x] Android `allowBackup=false` so the journal can't be swept into cloud backup
- [x] 6 store screenshots each for iOS (1290×2796) + Android (1080×1920), Play feature graphic (1024×500), promo hero (1800×1200) — `marketing/ios|android/v0.0.1/…Screenshots/`, generator `marketing/tools/generate_screenshots.py` (see `marketing/README.md`)
- [x] Store description, subtitle, keywords, categories, privacy answers, reviewer notes — `marketing/ios|android/v0.0.1/description/` + `listing/`
- [x] Release notes 0.0.1 (Apple + Play) — `marketing/ios/v0.0.1/releasenotes/2026.11.06-ReleaseNotes.md`, `marketing/android/v0.0.1/releasenotes/2026.11.03-ReleaseNotes.md`
- [x] Privacy policy draft — `marketing/shared/legal/PRIVACY_POLICY.md`
- [x] Pricing decision: **paid app $7.99** in both consoles. No IAP/subscription products, no billing code. (EAS account confirmed signed in: `freiolabs`.)

## Account-holder steps 👤 (cannot be done from code)

### Both stores
1. Host `marketing/shared/legal/PRIVACY_POLICY.md` at a public URL; paste it into both consoles.
2. Add a support URL/page with 988 · SAMHSA 1-800-662-4357 · 1-800-QUIT-NOW.
3. Swap screenshot phone interiors for real device captures in the same frames (Apple 2.3.3).

### Apple (App Store Connect)
1. Paid Apps Agreement, tax forms, and banking must be **Active** (Business → Agreements). Without this, a $7.99 price cannot go live.
2. Create the app record: bundle ID `com.freiolabs.knowme`, SKU `knowme-ios`.
3. Set price: **$7.99 tier (US)**; confirm availability in intended territories.
4. Fill App Privacy using the paste-ready answers in `STORE_LISTING.md`; complete Age Rating (expect 17+) and export-compliance (standard HTTPS only).
5. Upload a production build (below), attach it to the 0.0.1 version page, add screenshots + release notes, paste Notes for Review.
6. Submit for **TestFlight** first (internal testers need no review; external testers need Beta App Review), then **Submit for Review**.

### Google Play Console
1. Merchant account active for paid apps; set KnowMe as a **paid app at $7.99** (a free app cannot later become paid — set this before first publish).
2. Complete: Data safety (answers in `STORE_LISTING.md`), content rating (IARC), target audience (18+), ads declaration (no ads), health apps declaration (journaling/reflection; no diagnosis/treatment claims).
3. Upload the production `.aab` (below) to **Internal testing** first, then **Production**, with release notes + feature graphic + screenshots.
4. New personal developer accounts may be required to run a closed test (e.g. 12 testers for 14 days) before production — check the Play Console dashboard for your account's requirement.

## Build & upload commands ⏳

```sh
yarn typecheck && yarn lint && yarn test   # must be green before building
npx eas-cli build --profile production --platform ios
npx eas-cli build --profile production --platform android   # produces .aab (app-bundle)
npx eas-cli submit --profile production --platform ios       # → TestFlight / App Store Connect
npx eas-cli submit --profile production --platform android   # needs a Play service-account key JSON
```

- iOS `submit.production` in `eas.json` is empty: first submit will prompt for the Apple ID /
  App Store Connect app; after that, add the ASC app ID to `eas.json` (`submit.production.ios.ascAppId`).
- Android submit needs a Google Play service-account key (`play-service-account.json`, git-ignored) —
  👤 create it in Play Console → Setup → API access. Until then, upload the `.aab` manually in Play Console.
- Production env already points at `https://knowme-proxy.vercel.app` (`eas.json`), so Reflect works in store builds.

## Compliance watch-list (checked for this release)

- ✅ No medical, treatment, cure, or "overcome addiction" claims in store copy or screenshots — KnowMe is positioned as tracking/reflection. Do not add such claims; both stores scrutinise health apps and Apple may ask for evidence for health benefit claims.
- ✅ Crisis flow (988/911 card) exists in-app and is explained to reviewers so it isn't read as a dead end.
- ✅ No account → no account-deletion requirement triggered; data deletes with the app (stated in Data safety notes).
- ✅ No third-party analytics/ads SDKs in `package.json`; only network call is the opt-in Reflect summary via our proxy.
- ⚠️ Age/content ratings must be answered honestly (habit/substance journaling by adults).
- ⚠️ Accessibility/ATT: no tracking, so no App Tracking Transparency prompt is required; do not add ad/analytics SDKs without revisiting this.
