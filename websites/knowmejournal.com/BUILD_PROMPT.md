# Build prompt: knowmejournal.com

Paste everything below the line into a fresh coding agent, started in the KnowMe repo
(`/Users/msfm6/Coding/knowme`, or wherever it is cloned).

---

You are building **knowmejournal.com**, the official website for **KnowMe**, a $7.99 one-time
iOS app (Android to follow) made by **Freio Labs, LLC**. KnowMe is a private journal for people
changing a habit: you log the moments a craving shows up, and it shows you your own patterns.
It never tells you what to do.

The site is small: **Home, Privacy Policy, Support**, a 404, and optionally a short **Demo**
video page. It is a static site. Build it end to end, deploy-ready, without asking questions.
When something is unclear, make the simplest reasonable call and log it.

## Read first, in this order

1. `websites/knowmejournal.com/SITE_GUIDE.md` — the spec for this site. Follow it exactly.
2. `src/theme/index.ts` — every color, size, space, radius and motion value, and the brand
   rules at the bottom. It wins over everything, including the guide.
3. `DESIGN.md` — the feeling and the voice rules.
4. `SAFETY.md` — non-negotiable crisis and no-medical-advice rules.
5. `PRODUCT.md` — what the app does and doesn't do. Don't describe features that aren't there.
6. `marketing/shared/legal/PRIVACY_POLICY.md` — rendered as `/privacy`.
7. `marketing/ios/v0.0.1/description/2026.11.03-AppDescription.md` — approved store copy to reuse.
8. `AGENTS.md` — the repo's working rules (commit, check, log). They apply to you.

Do not change the app (`app/`, `src/`, `proxy/`, `marketing/`). The only files outside
`websites/knowmejournal.com/` you may touch are the root `package.json` jest
`testPathIgnorePatterns` (add `"/websites/"`), plus one line in the root `DECISIONS.md`.

## Non-negotiables

1. **Crisis first.** Every page shows a one-line crisis link (988, call or text) near the top of
   the content. `/support` opens with the full list: 988 (call or text, Suicide & Crisis
   Lifeline), 911 for emergencies, SAMHSA National Helpline 1-800-662-4357, 1-800-QUIT-NOW,
   and the National Problem Gambling Helpline 1-800-MY-RESET. Working `tel:`/`sms:` links,
   48-px targets. Numbers live in one file.
2. **No medical advice, ever.** No dosing, moderation, withdrawal, treatment or cure claims. The
   only medical line allowed: talk to a doctor, and stopping alcohol or benzodiazepines suddenly
   can be dangerous.
3. **Same brand as the app.** Tokens copied from `src/theme/index.ts`. Dark by default, light
   via `prefers-color-scheme`. One accent (amber). No red, no shadows, no gradients. System font,
   four sizes, two weights. Gnome logo used as-is.
4. **Voice.** Calm, plain, adult. No exclamation points, no emoji, no guilt, no urgency. Never
   "relapse", "addict", "failure".
5. **Privacy is structural, and the site keeps it.** No analytics, cookies, pixels, web fonts,
   embeds or any third-party request. State facts: the journal stays on the phone, no account,
   only the opt-in anonymous Reflect summary leaves the phone. Reflect writes one letter a day
   (resets at local midnight).
6. **No web version of the app.** No React Native Web build, no live demo that calls the proxy,
   no browser storage of journal data.
7. **Honest.** Never invent a fact the guide marks as owner TODO (support email, final App Store
   URL, store name, dates). Use a `TODO` placeholder that makes the build check fail, and list it
   in `TODO.md`.
8. **Accessible.** WCAG 2.2 AA. Text in `rem`. Works at 200% zoom and 320 px wide. Reduced motion
   respected.

## Phased build order

Commit after each phase (`websites/knowmejournal.com: <what>`). Before every commit, run
`just check` from the repo root (the app's checks must stay green) and `npm run build` plus the
site check script inside the site folder. Fix failures first. Stage only your paths
(`git add websites/knowmejournal.com package.json DECISIONS.md`); never
`git add -A`, another agent may be committing in this repo. If `.git/index.lock` is busy, wait
and retry. Push once checks pass.

### Phase 1 — Scaffold and tokens
- Astro (latest stable), static output, TypeScript strict, sitemap integration, nothing else.
- `src/styles/tokens.css` mirrors `src/theme/index.ts` (header comment names the source).
- `BaseLayout`, `Header`, `Footer`, `CrisisLine`, `SectionBreak`, `src/lib/site.ts`.
- Ignore `/websites/` in the root jest config (`expo lint` and `tsc` already skip it).

**Done when:** a blank page builds in dark and light with the right tokens, the crisis line and
footer show, and `just check` passes at the repo root.

### Phase 2 — Privacy and Support (the two App Store Connect URLs)
- `scripts/sync-content.ts` copies the policy into `src/content/` at build, strips the internal
  hosting note, fails if the file is missing.
- `/privacy` renders it in long-reading type, plus the site-owned "This website" block.
- `/support` with `CrisisCard` first, the medical note, contact, the questions from the guide
  (`<details>`, no JS), and the outside-US note. Check the app's Me tab and `TODO.md` before
  answering "move my journal" or "delete everything"; write only what's true.

**Done when:** both pages are complete, readable at 200% zoom, every `tel:`/`sms:` link is
correct, and the only placeholders left are the owner TODOs.

### Phase 3 — Home
- The eight sections in the guide, real screenshots from
  `marketing/ios/v0.0.1/AppStoreScreenshots/iPhone-6.9/device-captures/`, CSS-only
  `BreathCircle`, official App Store badge linked to `https://apps.apple.com/app/id6830937525`.
- Reuse the approved store lines; don't write new claims.

**Done when:** a stranger can tell from the first screen what KnowMe is, that it costs $7.99 once,
that it's private, and where to get it; one amber thing per screen; no JS shipped.

### Phase 4 — SEO, 404, demo (optional)
- Titles, descriptions, canonical, OG image, JSON-LD `SoftwareApplication` (no ratings),
  `robots.txt`, sitemap, `404`.
- Demo page **only if** a 30–45 s screen recording is provided or can be cut from existing
  footage: self-hosted video, captions, poster, no autoplay. Otherwise skip it and add it to
  `TODO.md`. Don't build a clickable demo.

**Done when:** every page has correct meta, the OG image renders in a share preview, and the
sitemap lists only real pages.

### Phase 5 — Checks, hosting config, docs
- `scripts/check-site.ts` with every rule in guide section 3.9, wired into `npm run build`.
- `vercel.json` with the security headers and `www` → apex redirect from guide section 3.10.
- `websites/knowmejournal.com/README.md`: how to run, build, deploy, and where content comes from.
- Lighthouse mobile run on Home, Privacy, Support; record scores in `DECISIONS.md` if any
  budget is missed and why.

**Done when:** the build fails on a planted banned word, a missing crisis line, or an external
request; budgets in guide 3.8 are met; the launch checklist in guide 3.12 is copied into
`TODO.md` with code-side items checked off.

## What to log and what to leave

- **`websites/knowmejournal.com/DECISIONS.md`**: one line per call the guide didn't settle,
  format `YYYY-MM-DD | decision | why`.
- **Root `DECISIONS.md`**: one line when the site is built, pointing to the folder.
- **`websites/knowmejournal.com/TODO.md`**: every owner TODO (support email, final App Store URL,
  store name, privacy policy date and provider question, Vercel plan, DNS, re-shot screenshots,
  Smart App Banner after launch), every skipped optional item (demo), and anything that doesn't
  work yet. Never fake a feature; say it's missing.

When finished, report: pages built, build-check results, Lighthouse scores, the commit hashes,
and the owner TODO list.
