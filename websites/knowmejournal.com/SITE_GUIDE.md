# knowmejournal.com — Site Guide

The official home of **KnowMe**, a private journal for changing a habit. Built and owned by
Freio Labs, LLC. This guide is the source of truth for the site. `BUILD_PROMPT.md` (next to
this file) tells a coding agent how to build it.

Owner TODOs are marked **TODO (owner)**. Never fill them with invented values.

---

## 0. Facts the site depends on

| Fact | Value | Source |
|---|---|---|
| Company | Freio Labs, LLC | owner |
| App name in prose | KnowMe | `app.json` |
| Store name | **TODO (owner):** confirm the exact App Store name. The brief says "KnowMe: Private Journal"; `marketing/ios/v0.0.1/description/2026.11.03-AppDescription.md` says "KnowMe: Private Habit Journal". Use whichever is live in App Store Connect. | |
| Price | $7.99 once. No subscription, no in-app purchases. | `marketing/ios/v0.0.1/listing/` |
| Platforms | iPhone and iPad now. Android to follow (no date). | owner |
| App Store app id | `6830937525` | owner |
| App Store link | `https://apps.apple.com/app/id6830937525` (built from the id; works without a slug or country). **TODO (owner):** confirm the final public URL once the app is live, then swap in the canonical `https://apps.apple.com/us/app/<slug>/id6830937525` if preferred. | |
| Bundle id | `com.freiolabs.knowme` | listing |
| Support email | **TODO (owner):** choose and set up (suggestion: `support@knowmejournal.com`, forwarded to a monitored inbox). | |
| Privacy policy source | `marketing/shared/legal/PRIVACY_POLICY.md` (one source; the site renders it, never forks it) | repo |
| Brand values | `src/theme/index.ts` (wins over everything, including this guide) | repo |
| Voice rules | `DESIGN.md` → Voice | repo |
| Safety rules | `SAFETY.md` | repo |
| Reflect limit | One letter per day, resets at local midnight. A second tap the same day shows "try again tomorrow" and keeps today's letter. | `DECISIONS.md` 2026-11-04 |

Why a separate domain from addictiontracking.com: the articles site carries health content
risk (search quality reviews, a bad citation, an angry reader). Keeping the app's home on its
own domain means a problem there can't drag down this site's search reputation or confuse App
Store review. Both sites belong to Freio Labs and readers will connect them; that is fine and
disclosed. This site does not host articles.

---

## 1. Principles

1. **The site is the app's front door, not a second app.** Three required pages, one optional
   demo. No blog, no articles, no account, no newsletter. (Articles live on addictiontracking.com.)
2. **Same brand, same room.** "A quiet room at night. One lamp on." The site should feel like
   opening the app: dark, warm, quiet, one amber thing per screen.
3. **Privacy is a structural fact, not a promise.** Say what the app does, not how much we care:
   everything stays on the phone, no accounts, and only an opt-in anonymous summary leaves the
   phone, when you tap Reflect. The site itself collects nothing either, so the claim holds on
   the page that makes it.
4. **Honest and plain.** No medical, treatment or cure claims. No "beat addiction". KnowMe is a
   journal for noticing patterns. It never tells you what to do; neither does the site.
5. **People over the app.** Crisis lines are reachable from every page in one tap.
6. **Fewer things.** Static HTML, no client JavaScript except where a page truly needs it, no
   third-party requests. Every addition must make the site simpler, calmer, or more honest.

### Not on this site (decided)

| Not doing | Why |
|---|---|
| React Native Web build of the app | Undercuts the paid app, exposes the paid Llama proxy to the open web, and browser storage is the wrong home for a private journal. |
| Analytics, pixels, cookie banners | Nothing to consent to if nothing is collected. App Store Connect already reports installs. |
| Contact form | Needs a backend and stores messages. A `mailto:` link is simpler and private. |
| Articles / blog | Lives on addictiontracking.com by design. |
| Testimonials, star ratings, "as seen in" | Unverifiable at launch; reads as hype. Revisit with real, permissioned quotes. |

---

## 2. Branding

### 2.1 Voice

Same as the app (`DESIGN.md` → Voice). Calm, plain, adult. Short sentences. Talks *with* the
reader.

- No exclamation points. No emoji. No guilt. No urgency ("Download now", "Don't wait").
- Never "relapse", "addict", "failure", "clean", "slip-up". Use "times you did", "times it passed",
  "days since last time".
- Never "you should". Describe what the app does: "Last time, a walk helped."
- No medical, treatment, cure or "overcome addiction" claims (App Store and Play both scrutinize
  this; see the watch-list in `marketing/shared/submission/SUBMISSION_CHECKLIST.md`).
- Name what's tracked plainly: alcohol, cannabis, nicotine, gambling, or your own.

| Instead of | Say |
|---|---|
| "Beat your addiction" | "Understand a habit, in your own words." |
| "Military-grade privacy!" | "Your journal stays on your phone. There's no account to make." |
| "AI coach" | "Reflect: a short letter written from an anonymous summary, once a day if you want it." |
| "Join 10,000 users" | (say nothing) |
| "Get it now!" | "KnowMe is $7.99, once." |

Reuse store copy where it fits; it already passed this voice:
- Hero line: **"Know yourself. Change follows."**
- Sign-off: **"Know thyself. The data is yours. The conclusions are yours."**
- "Log a moment in ten seconds." / "When it's hard, start here." / "Private by design."
- The gnome: "Holds the lantern, never the lecture."

### 2.2 Color tokens

Copy these exactly from `src/theme/index.ts`. Use them as CSS custom properties with the same
semantic names. If the theme file changes, the site follows it.

| Token | Dark (default) | Light | Use on the site |
|---|---|---|---|
| `--bg` | `#0F1115` | `#F7F4EF` | Page background |
| `--surface` | `#171A20` | `#EFEAE2` | Raised areas, sparingly (the crisis box, the video frame) |
| `--border` | `#22262E` | `#E2DCD2` | Focus/pressed states only. Never row dividers. |
| `--text` | `#ECE8E1` | `#1A1C20` | Primary text |
| `--muted` | `#8A8F98` | `#6B6F77` | Secondary text, captions, footer |
| `--accent` | `#E8B07A` | `#E8B07A` | The one fill: the App Store button area, the breath circle, the divider dot |
| `--on-accent` | `#0F1115` | `#1A1C20` | Text on an accent fill |
| `--accent-text` | `#E8B07A` | `#9A5B24` | Accent used as text (links) |
| `--calm` | `#7FB3A6` | `#7FB3A6` | Quiet information only. Rarely needed on the site. |
| `--calm-text` | `#7FB3A6` | `#3F7A6C` | Calm as text |

- Dark by default. Follow `prefers-color-scheme: light` when the visitor's system asks for it.
  No toggle (a hard-coded default beats a setting).
- Rules carried from the theme: one accent; **no red, ever**; no shadows, no gradients; status
  bar / `theme-color` meta matches `--bg` (set both light and dark `theme-color`).
- All text pairs above pass WCAG AA (checked in the theme). Do not invent new pairs. If you must,
  check them and log it.

### 2.3 Type

From `src/theme/index.ts`: system font only, four sizes, two weights.

| Role | Size / line height | Weight | Web value |
|---|---|---|---|
| display (the one big line on Home) | 34 / 40 | 600 | `2.125rem / 2.5rem` |
| title (page and section titles) | 24 / 30 | 600 | `1.5rem / 1.875rem` |
| body | 17 / 26 | 400 | `1.0625rem / 1.625rem` |
| label (captions, footer, small print) | 14 / 20 | 400 | `0.875rem / 1.25rem` |
| letter (Privacy Policy body, long reading) | 17 / 30 | 400 | `1.0625rem / 1.875rem` |

- Font stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. No web fonts, no font CDN.
- Sizes in `rem` so browser text-size settings scale them. Nothing else in px for type.
- No sizes outside this table. If the hero feels small at 34, that's the brand; space does the
  work. A bigger hero is a brand change: log it in `DECISIONS.md` first.

### 2.4 Space, radius, layout, motion

| Token | Value |
|---|---|
| space | 4, 8, 16, 24, 40, 64 (`xs sm md lg xl xxl`) |
| gutter (side padding) | 24 |
| maxContentWidth | 560 (one calm column, even on desktop) |
| radius | 16 (buttons, boxes), 999 (breath circle) |
| touch min | 48 × 48 |
| motion | fast 200, base 300, slow 600 ms, `ease-out` (cubic). Breath 4 s in / 6 s out. |
| divider | the one section break: two 24-px hairlines (1 px, `--muted`) around a 6-px `--accent` dot, 8-px gaps, centered. No other rules or borders. |

- One column, max 560 px wide, centered. Desktop gets more air, not more columns.
- Nothing bounces, flashes or slides in from the side. Fades only, 300–600 ms.
- `prefers-reduced-motion: reduce` turns off the breath animation and all fades.

### 2.5 Logo and wordmark

- **Mark:** the gnome with the lantern (Gnomie). Files: `assets/logo.png` (1408², transparent),
  `assets/icon.png` (1024², on `#0F1115`). Use as-is. Don't recolor, crop the lantern, add
  outlines, or put it on a busy background.
- **Wordmark:** "KnowMe" set in the system font, title size, semibold, `--text`. No custom logotype.
- **Lockup:** gnome left of the wordmark in the header (gnome ~32 px tall), or gnome alone above
  the hero (~144–166 px, same as the app's onboarding).
- **Favicon / touch icon:** derive from `assets/icon.png` (180 px apple-touch-icon, 32 px and 16 px
  PNG, plus a 512 px for the manifest). **TODO (owner):** a simplified gnome-head favicon may
  read better at 16 px; optional.

### 2.6 Imagery

- Real app screens only. Start from `marketing/ios/v0.0.1/AppStoreScreenshots/iPhone-6.9/device-captures/`
  (real captures) or the numbered marketing frames. Note: current captures came from the dev
  client and show a small dev gear icon; **TODO (owner):** re-shoot from the store build before
  launch (same as the App Store submission note).
- The gnome is the only illustration. No stock photos of sad people, pills, bottles, or hands
  over faces.
- The breath circle can be drawn in CSS from the theme's `breath` layers (translucent amber
  discs, no shadows, no gradients).
- Export images as AVIF/WebP with PNG fallback, with explicit width and height.

### 2.7 Do / Don't

| Do | Don't |
|---|---|
| Dark page, one amber thing per screen | Two accent colors, red anything, gradients, shadows |
| One plain sentence per idea | Feature grids with twelve icons |
| Show the real app | Mockups of features that don't exist (no Android screens until it ships) |
| State the price plainly: $7.99 once | "Only $7.99!", strike-through prices, countdowns |
| "Talk to a doctor" if anything medical comes up | Any medical, dosing, moderation or withdrawal advice |
| Keep crisis lines one tap away | Hide them in the footer only |
| Say "Reflect writes one letter a day" | Call Reflect a coach, therapist or chatbot |

---

## 3. Build Structure

### 3.1 Stack

| Choice | Pick | Why |
|---|---|---|
| Generator | **Astro** (latest stable), static output, no UI framework integration | Boring, well documented, ships zero JS by default, renders Markdown natively. |
| Language | TypeScript `strict` for the few scripts | Matches the app repo. |
| CSS | One hand-written `global.css` with the tokens as custom properties | No Tailwind, no CSS-in-JS. |
| Client JS | None required. The breath circle is pure CSS. | |
| Dependencies | `astro` and its sitemap integration. Anything else needs a line in `DECISIONS.md` saying why 30 lines of our own code wouldn't do. | |
| Hosting | **Vercel Pro** (see 3.10) | Vercel's Hobby plan forbids commercial use. |

**Where the code lives:** in this repo, at `websites/knowmejournal.com/` (its own `package.json`,
like `proxy/`). Reason: it renders `marketing/shared/legal/PRIVACY_POLICY.md` and mirrors
`src/theme/index.ts` directly, so one source of truth stays one. The app's `tsconfig.json`
only includes `app` and `src`, and `expo lint` only scans those two, so neither needs changing.
Jest does scan the whole repo: add `"/websites/"` to `testPathIgnorePatterns` in the root
`package.json` (next to `"/proxy/"`) so `just check` stays the app's check. Log the edit.

### 3.2 Folder tree

```
websites/knowmejournal.com/
  SITE_GUIDE.md            ← this file
  BUILD_PROMPT.md
  DECISIONS.md             ← site-only decisions (one line each)
  TODO.md                  ← site-only gaps and owner TODOs
  package.json
  astro.config.mjs         ← site: 'https://knowmejournal.com', output: 'static'
  tsconfig.json
  scripts/
    sync-content.ts        ← copies PRIVACY_POLICY.md into src/content/ before build; fails if missing
    check-site.ts          ← post-build checks (see 3.9)
  public/
    favicon.ico, icon-32.png, apple-touch-icon.png, icon-512.png
    og-image.png           ← 1200×630, dark bg, gnome + "Know yourself. Change follows."
    robots.txt
    media/                 ← demo video, poster, captions (optional page)
  src/
    styles/
      tokens.css           ← generated or hand-copied from src/theme/index.ts (header comment names the source)
      global.css
    content/
      privacy-policy.md    ← generated by sync-content; do not edit by hand (gitignored)
    lib/
      site.ts              ← constants: APP_STORE_ID, APP_STORE_URL, SUPPORT_EMAIL, crisis lines
    components/
      BaseLayout.astro     ← html shell, meta, header, footer, crisis link
      Header.astro         ← gnome + wordmark, nav: Support, Privacy
      Footer.astro         ← crisis line, © Freio Labs, LLC, Privacy, Support
      CrisisLine.astro     ← "In crisis? Call or text 988." one-line link to /support#now
      CrisisCard.astro     ← full list of lines (Support page)
      AppStoreBadge.astro  ← official Apple badge linked to APP_STORE_URL
      SectionBreak.astro   ← the one divider
      BreathCircle.astro   ← CSS-only amber discs, 4 s in / 6 s out
      Screenshot.astro     ← one real app screen with alt text
      Prose.astro          ← long-reading wrapper (letter type)
    pages/
      index.astro
      privacy.astro
      support.astro
      demo.astro           ← optional; only if the video exists
      404.astro
```

### 3.3 Pages

Every page: one `h1`, the `CrisisLine` at the top of the main content (quiet, label size, not an
alarm), header and footer.

#### `/` Home

Purpose: in under a minute, a visitor knows what KnowMe is, that it's private, what it costs,
and where to get it.

| # | Section | Content |
|---|---|---|
| 1 | Hero | Gnome (166 px). Display line: "Know yourself. Change follows." Body: "KnowMe is a calm, private journal for understanding a habit. It never tells you what to do." App Store badge. Label under it: "$7.99, once. iPhone and iPad. Android is on the way." |
| 2 | Log a moment | One real screenshot. Title: "Log a moment in ten seconds." One or two sentences. |
| 3 | When it's hard | Breath circle (CSS). Title: "When it's hard, start here." Your reasons, what helped before, a slow breath. |
| 4 | Patterns | Screenshot. Title: "Your patterns, in plain words." Example: "Most of your moments land between 7 and 10pm." |
| 5 | Reflect | Title: "A short letter, when you ask for one." Reflect writes one letter a day from an anonymous summary and ends with one open question. Notes stay out unless you include them. Label: "Written by Llama from a private summary." |
| 6 | Private by design | The structural facts, as a short list: stored only on your phone; no account; no analytics or ads; only the opt-in Reflect summary leaves the phone; delete the app and the journal goes with it. Link: "Read the privacy policy". |
| 7 | Price | "$7.99, once. No subscription, no upgrades, no ads." Badge again. |
| 8 | Close | "Know thyself. The data is yours. The conclusions are yours." Small print: "KnowMe is a journal for self-reflection. It isn't medical advice, diagnosis or treatment, and it isn't a replacement for professional support." |

`SectionBreak` between sections 1–8 where it helps, never between every one.

#### `/privacy` Privacy Policy (required: App Store Connect URL)

Purpose: the public URL App Store Connect and Play Console need.

- Rendered from `marketing/shared/legal/PRIVACY_POLICY.md` at build time. Never hand-edit a copy.
- Remove the internal italic note under the title ("Host this file at a public URL...") in the
  sync script, not in the source.
- Add, as a separate site-owned block below the policy, **"This website"**: the site sets no
  cookies, runs no analytics, and loads nothing from third parties; our host (Vercel) keeps
  standard server logs such as IP address and user agent for security and operations.
  **TODO (owner):** confirm Vercel's log retention for the plan you pick and state it.
- Show a visible "Last updated" date. **TODO (owner):** the source says "version 0.0.1 launch";
  replace with a real date in the source file.
- The policy's Contact line points to "the support contact listed on KnowMe's store page". Link
  it to `/support`.
- **TODO (owner):** the policy says the proxy "asks a Meta Llama model". The model runs at a
  hosted inference provider (see `proxy/README.md`). Decide whether to name that provider in
  the policy. Change the source file, not the site.

#### `/support` Support (required: App Store Connect URL)

Purpose: help in a hard moment first, then help with the app.

| # | Section | Content |
|---|---|---|
| 1 | If you need someone now (`#now`) | `CrisisCard`, first thing on the page, above everything else: **988** call or text (Suicide & Crisis Lifeline, US); **911** in an emergency; **SAMHSA National Helpline 1-800-662-4357** (free, confidential, 24/7, treatment referral); **1-800-QUIT-NOW** (1-800-784-8669, quitting tobacco); National Problem Gambling Helpline **1-800-MY-RESET** (1-800-697-3738, call or text). "You don't have to figure this out alone." `tel:` and `sms:` links, each a 48-px target. |
| 2 | Medical note | "If you're thinking about stopping alcohol or benzodiazepines, talk to a doctor first. Stopping suddenly can be dangerous." No further advice. |
| 3 | Contact us | `mailto:` link to the support email. Expected reply time. **TODO (owner):** address and reply-time promise. Note: "Please don't send journal entries. We don't need them to help, and we'd rather not have them." |
| 4 | Common questions | Short answers, `<details>` elements (native, no JS). See list below. |
| 5 | Outside the US | "These numbers are for the US. If you're elsewhere, contact your local emergency number." **TODO (owner):** add other countries only when verified. |

Questions to answer (only what's true today):
- Where is my journal stored? (On this phone, in one database. Not synced or backed up by KnowMe.)
- I got a new phone. Can I move my journal? (Not today. Be honest. Check `TODO.md` in the app repo for any export plan before writing this.)
- What leaves my phone? (Only the Reflect summary, only when you tap it. Notes only if you turn on "Include my notes" for that letter.)
- Why can I only Reflect once a day? (One letter a day, resets at local midnight. It's a reflection, not a chat.)
- Does KnowMe give advice? (No. It shows your own patterns. For medical questions, talk to a doctor.)
- How do I delete everything? (Delete the app. Point to any in-app reset only if it exists; check the Me tab before writing.)
- Refunds? (Purchases go through Apple: `https://reportaproblem.apple.com`.)
- Android? ("On the way." No date.)

#### `/demo` Demo (optional)

Purpose: show the calm in 30–45 seconds for people who won't install first.

- A screen recording only, built from `VIDEO_SCRIPT.md`, trimmed to 30–45 s, with demo data.
  Update the script's "Once a week" line: Reflect is one letter a day now.
- Self-hosted `<video>` (MP4 H.264, ~720p, < 6 MB) with `controls`, `playsinline`, `preload="none"`,
  a poster frame, and a WebVTT captions track. Muted, no autoplay. No YouTube/Vimeo embed
  (they set cookies and track).
- A clickable sample-data demo is deferred to `TODO.md`. A React Native Web build of the app is
  ruled out (see Principles).
- If no video exists at build time, don't ship the page or link to it.

#### `/404`

One sentence and one action: "This page isn't here. Go back home." Plus the crisis line.

### 3.4 Components

| Component | Props | Notes |
|---|---|---|
| `BaseLayout` | `title`, `description`, `path`, `ogImage?` | Sets canonical, OG, `theme-color` (light + dark), skip link, `lang="en"`. |
| `Header` | none | Gnome + wordmark link home; Support, Privacy. No hamburger menu: three links fit. |
| `Footer` | none | Crisis line, "© {year} Freio Labs, LLC", Privacy, Support, App Store link. |
| `CrisisLine` | none | One label-size line linking to `/support#now`. On every page. |
| `CrisisCard` | none | Full list from `site.ts`. Used on Support and 404. |
| `AppStoreBadge` | `size?` | Apple's official "Download on the App Store" badge (black for dark, follow Apple's guidelines). Don't redraw or recolor it. Links to `APP_STORE_URL`. Accessible name: "Download KnowMe on the App Store". |
| `SectionBreak` | none | The one divider. `aria-hidden`. |
| `BreathCircle` | none | Four translucent amber discs from the theme's `breath` layers. `aria-hidden`. Still under reduced motion. |
| `Screenshot` | `src`, `alt`, `width`, `height` | `loading="lazy"` except the first. Rounded 16. |
| `Prose` | slot | `letter` line height, max width 560. |

Keep crisis numbers in one place, `src/lib/site.ts`, and import them everywhere.

### 3.5 Content model

No CMS. Content is page markup plus two data sources:

```ts
// src/lib/site.ts
export const APP_STORE_ID = '6830937525';
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`; // TODO(owner): confirm once live
export const SUPPORT_EMAIL = 'TODO'; // TODO(owner): set before launch; build fails while 'TODO'
export const PRICE = '$7.99';
export const crisisLines = [
  { name: '988 Suicide & Crisis Lifeline', detail: 'Call or text, 24/7', tel: '988', sms: '988' },
  { name: 'Emergency', detail: 'Call 911', tel: '911' },
  { name: 'SAMHSA National Helpline', detail: 'Free, confidential, 24/7', tel: '18006624357', display: '1-800-662-4357' },
  { name: '1-800-QUIT-NOW', detail: 'Help quitting tobacco', tel: '18007848669', display: '1-800-QUIT-NOW' },
  { name: 'National Problem Gambling Helpline', detail: 'Call or text, 24/7', tel: '18006973738', display: '1-800-MY-RESET' },
] as const;
```

and `src/content/privacy-policy.md`, generated from the repo's policy by `scripts/sync-content.ts`.

Page copy lives in each `.astro` page. If it grows, move it to `src/pages/_copy.ts` per page,
mirroring the app's `copy.ts` convention.

### 3.6 SEO and meta

| Item | Value |
|---|---|
| Home `<title>` | "KnowMe: a private journal for changing a habit" |
| Home description | "Log a moment in ten seconds, see your own patterns, and keep your journal on your phone. $7.99 once, no subscription." (≤ 160 chars) |
| Other titles | "Privacy Policy · KnowMe", "Support · KnowMe", "Demo · KnowMe" |
| Canonical | `https://knowmejournal.com/<path>` (no trailing slash; pick one and redirect the other) |
| `www` | Redirect `www.knowmejournal.com` → apex (301) |
| Open Graph / Twitter | `og:title`, `og:description`, `og:image` (`/og-image.png` 1200×630), `twitter:card=summary_large_image` |
| Smart App Banner | `<meta name="apple-itunes-app" content="app-id=6830937525">` on Home only, once the app is live. Native iOS behavior, no JS. |
| Structured data | One JSON-LD `SoftwareApplication` on Home: name, `operatingSystem: "iOS"`, `applicationCategory: "HealthApplication"`, `offers` `{ price: "7.99", priceCurrency: "USD" }`, `publisher` Organization "Freio Labs, LLC". **No** `aggregateRating` (we have none to show). |
| Sitemap / robots | `@astrojs/sitemap`; `robots.txt` allows all and lists the sitemap. |
| Search Console | Verify via DNS TXT record (no script on the page). |

Keywords to earn naturally, not stuff: private journal, habit journal, craving journal, urge
tracker, journal app no account.

### 3.7 Accessibility (WCAG 2.2 AA)

- Semantic landmarks, one `h1` per page, headings in order, skip-to-content link.
- Text in `rem`; layout holds at 200% zoom and 320 px width without horizontal scroll.
- Color pairs only from the theme table. Visible focus ring: 2 px `--accent` outline, 2 px offset.
- Touch targets ≥ 48 px (`touch.min`), including every `tel:` link.
- Every screenshot has alt text describing what's on screen, not marketing ("Today screen: 4 days since last time, and the I'm in it button").
- Decorative art (`BreathCircle`, `SectionBreak`, gnome next to the wordmark) is `aria-hidden` or `alt=""`.
- Video: captions track, no autoplay, controls visible.
- `prefers-reduced-motion` respected everywhere.
- Test with VoiceOver (iOS Safari) and keyboard only.

### 3.8 Performance budget

| Metric | Budget |
|---|---|
| HTML + CSS per page | ≤ 50 KB compressed |
| JavaScript | 0 KB (any JS needs a `DECISIONS.md` line) |
| Images on Home | ≤ 400 KB total above the fold-plus-one; lazy-load the rest |
| Web fonts | 0 |
| Third-party requests | 0 (Apple badge is self-hosted) |
| Lighthouse (mobile) | Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 |
| LCP / CLS / INP | < 1.5 s / < 0.05 / < 100 ms on a mid-range phone |

### 3.9 Build checks (`scripts/check-site.ts`, run after `astro build`)

Fail the build if any of these is true:
- `SUPPORT_EMAIL` is still `TODO`, or any built page contains the string `TODO`.
- Any page lacks the crisis line (search the built HTML for `988`).
- Any page's visible text contains a banned word (whole word, case-insensitive): `relapse`,
  `addict`, `addicts`, `failure`, `cure`, `cures`; an exclamation point; or an emoji. ("Treatment"
  is allowed only in the disclaimer and the SAMHSA line; review those by hand.)
- Any internal link 404s, or any image lacks `alt`.
- Any built HTML references an external origin other than `apps.apple.com` and
  `reportaproblem.apple.com`.
- `/privacy` and `/support` don't exist.

### 3.10 Hosting and deploy

- **Vercel Pro** (Hobby is personal, non-commercial use only; Freio Labs is a business).
  **TODO (owner):** confirm the current Pro price and seat count. If cost matters more than one
  dashboard, Cloudflare Pages and Netlify both allow commercial use on free tiers; this is
  reversible because the output is static files.
- One Vercel project, **separate from the proxy project and from addictiontracking.com**.
  Root Directory: `websites/knowmejournal.com`. Build: `npm run build`. Output: `dist`.
  Confirm "Include files outside the root directory" is on so the build can read
  `marketing/shared/legal/PRIVACY_POLICY.md`.
- Ignored Build Step: only build when `websites/knowmejournal.com/`, the privacy policy, or the
  theme file changed.
- Domains: apex `knowmejournal.com` primary, `www` → apex. HTTPS automatic. HSTS on.
- Headers (`vercel.json`): `Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
- Preview deploys are fine; add `X-Robots-Tag: noindex` on preview URLs.
- **TODO (owner):** DNS records at the registrar, Vercel team access, support mailbox.

### 3.11 Analytics and privacy stance

**None.** No analytics script, no cookies, no pixels, no fonts or embeds from other origins.
The app's whole promise is "we don't collect", and the site keeps it. Install numbers come from
App Store Connect; search data from Search Console (DNS-verified, no script). If the owner later
wants page counts, use a cookieless, aggregate-only tool (Vercel Web Analytics or Plausible),
log it in `DECISIONS.md`, and add it to the "This website" privacy block the same day.

### 3.12 Launch checklist

- [ ] Support email chosen, working, and set in `site.ts` (**owner**)
- [ ] App Store name confirmed; final App Store URL confirmed once live (**owner**)
- [ ] Privacy policy has a real "Last updated" date; provider question decided (**owner**)
- [ ] Screenshots re-shot from the store build (no dev gear) (**owner**)
- [ ] `https://knowmejournal.com/privacy` and `/support` pasted into App Store Connect (Privacy Policy URL, Support URL) and Play Console (**owner**)
- [ ] Crisis numbers dialed/texted from a real phone once to confirm the `tel:`/`sms:` links (**owner**)
- [ ] All pages pass `check-site.ts`; Lighthouse budgets met on mobile
- [ ] Light and dark mode both checked on iPhone Safari, Android Chrome, desktop
- [ ] VoiceOver and keyboard pass
- [ ] 200% zoom and 320 px width pass
- [ ] Smart App Banner added after the app is live
- [ ] Search Console verified, sitemap submitted
- [ ] Vercel plan is Pro (or another host that allows commercial use)
- [ ] No `TODO` left in built output; every remaining gap is in `TODO.md`
