# marketing/ — KnowMe store & marketing assets

Everything the stores see, organized **by platform, then by version**. This folder is the
single home for screenshots, store copy, and release notes. Nothing store-facing lives
anywhere else in the repo.

## Structure

```
marketing/
  README.md                     ← you are here (conventions + index)
  tools/
    generate_screenshots.py     ← regenerates every screenshot/graphic below
  ios/                          ← iOS and Android version folders have the SAME subfolders
    v0.0.1/                     ← one folder per App Store version
      description/              ← current dated App Store description (+ archive/ for superseded ones)
      releasenotes/             ← current dated "What's New" (+ archive/)
      listing/                  ← keywords, categories, privacy, reviewer notes
      screenshots/              ← one folder per device, upload 01→06 in order
        iPhone-6.3/             ← 1206×2622 (App Store Connect's default "medium display" slot)
        iPhone-6.9/             ← 1290×2796 + device-captures/ (real app)
        iPhone-Duo/             ← 2007×2853 portrait frames; device-captures/ are the open inner display (2853×2007)
        iPad-13/                ← 2064×2752 + device-captures/ (real app)
      hero/                     ← product page banner: App Store "Header", 3840×1646
      icon/                     ← 1024×1024 App Store icon (reference copy; the build carries the real one)
  android/
    v0.0.1/                     ← one folder per Play version
      description/              ← current dated Play description (name/short/full) (+ archive/)
      releasenotes/             ← current dated Play release notes (+ archive/)
      listing/                  ← Data safety, declarations, asset table
      screenshots/
        Phone/                  ← 1080×1920 + device-captures/ (real app)
      hero/                     ← product page banner: Play "Feature graphic", 1024×500 (required)
      icon/                     ← 512×512 Play listing icon
  shared/
    v0.0.1/promo/               ← cross-platform art for press/social (not store uploads)
    legal/PRIVACY_POLICY.md     ← host publicly; link in both consoles
    submission/SUBMISSION_CHECKLIST.md  ← account-holder steps + eas build/submit commands
```

## Conventions (executive decisions — keep them)

1. **Platform first, version second.** `marketing/<ios|android>/vX.Y.Z/…`. iOS and Android
   copy are never shared files: field limits and review rules differ, so each platform
   gets its own dated description and release notes even when the words start out alike.
2. **One version folder per store release, frozen at submit.** Never edit a version folder
   after it ships. For the next release, copy the folder to `vX.Y.Z+1`, edit there, and
   bump `VERSION` in `tools/generate_screenshots.py` before regenerating images.
3. **Dated snapshots for text.** Descriptions, release notes, and listing metadata are
   files named `YYYY.MM.DD-<Name>.md` (e.g. `2026.11.06-AppDescription.md`). A copy tweak
   during review gets a new dated file in the same folder and the old one moves to that
   folder's `archive/`. Outside `archive/` there is exactly one file per folder: the one the
   store matches.
4. **Same subfolders on both platforms.** Every `ios/vX.Y.Z/` and `android/vX.Y.Z/` has
   `description/ releasenotes/ listing/ screenshots/ hero/ icon/`. `hero/` is the product-page
   banner each store calls by its own name (App Store "Header", Play "Feature graphic").
5. **Numbered screenshots = upload order.** `01` is always the hero claim. Renaming a file
   is how you reorder the store gallery — keep numbers and order in sync with the
   “Screenshot order” table in each platform’s `listing/` doc.
6. **Shared means genuinely shared.** Only the promo art, privacy policy, and submission
   checklist live in `shared/`. If a file is pasted into just one console, it belongs in
   that platform’s version folder.
7. **Design: modeled on onboarding.** Slide 01 (and the 06 bookend) copy the
   onboarding screens — progress dots, the gnome in a speech bubble, calm
   left-aligned type, the one amber button. Slides 02–05 are **not** full-screen
   screenshots: a bold headline sits above a partial phone (top of a real app
   capture in a frame that runs off the bottom edge).
8. **Marketing frames vs. device captures.** Numbered `01-…06-….png` files are the
   store frames above. Each device folder also holds `device-captures/` —
   unedited screenshots of the real app taken on that device (iPhone 17 Pro,
   iPhone Duo, iPad Pro 13, Pixel 7) and composited into the frames by
   `tools/generate_screenshots.py`. Captures came from the Expo dev client, so
   they carry a small dev gear icon that a production build does not have:
   re-shoot captures from the store build before final submission.
9. **No medical claims, ever.** Copy sells tracking, reflection, privacy, and calm — never
   treatment, cures, or “overcoming addiction”. See the watch-list in
   `shared/submission/SUBMISSION_CHECKLIST.md`.

## Index — v0.0.1 (2026.11.03, $7.99 one-time, no subscription)

| Need | Go to |
|---|---|
| App Store header (hero) | [ios/v0.0.1/hero/](ios/v0.0.1/hero/) |
| iOS screenshots (iPhone / Duo / iPad) | [ios/v0.0.2/screenshots/](ios/v0.0.2/screenshots/) |
| Android screenshots (Phone) | [android/v0.0.1/screenshots/Phone/](android/v0.0.1/screenshots/Phone/) |
| Play feature graphic | [android/v0.0.1/hero/](android/v0.0.1/hero/) |
| App Store copy | [ios/v0.0.1/description/2026.11.06-AppDescription.md](ios/v0.0.1/description/2026.11.06-AppDescription.md) |
| Play copy | [android/v0.0.1/description/2026.11.06-AppDescription.md](android/v0.0.1/description/2026.11.06-AppDescription.md) |
| App Store release notes | [ios/v0.0.2/releasenotes/2026.11.10-ReleaseNotes.md](ios/v0.0.2/releasenotes/2026.11.10-ReleaseNotes.md) |
| Play release notes | [android/v0.0.1/releasenotes/2026.11.06-ReleaseNotes.md](android/v0.0.1/releasenotes/2026.11.06-ReleaseNotes.md) |
| Regenerate images | `/tmp/knowme-venv/bin/python marketing/tools/generate_screenshots.py` |
| Upload a screenshot slot | `node scripts/asc-screenshots.mjs 0.0.2 APP_IPHONE_DUO marketing/ios/v0.0.2/screenshots/iPhone-Duo` |

## Starting v0.0.2 (checklist)

1. `cp -R marketing/ios/v0.0.1 marketing/ios/v0.0.2` and the same for `android/` and `shared/`.
2. Bump `VERSION` (and `DATE_TAG`) in `tools/generate_screenshots.py`; rerun it.
3. Edit the new dated description/release-notes files; add new dated files instead of overwriting when a change happens mid-review.
