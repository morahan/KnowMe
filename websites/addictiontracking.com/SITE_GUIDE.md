# addictiontracking.com — Site Guide

An evidence-based publication about addiction, cravings and habit change, run by Freio Labs, LLC.
Every factual claim cites a peer-reviewed or primary source. Where it helps the reader, articles
mention **KnowMe**, Freio Labs' private journal app, as one friendly, low-cost tool, always with a
clear disclosure. This guide is the source of truth for the site. `BUILD_PROMPT.md` (next to this
file) tells a coding agent how to build it.

Owner TODOs are marked **TODO (owner)**. Never fill them with invented values: no invented
editors, credentials, addresses, statistics or citations.

---

## 0. Context and facts

### Why a separate site

knowmejournal.com is the app's home and feeds App Store review. Health content carries its own
risks: a wrong statistic, a search quality downgrade, an upset reader. Keeping articles on their
own domain means a content problem here can't drag down the app's site or its review. Both sites
belong to Freio Labs and readers will connect them; this site says so openly on every page that
mentions KnowMe and on About. Separate domain, separate repo, separate Vercel project, separate
Search Console property, its own brand.

### Facts

| Fact | Value |
|---|---|
| Publisher | Freio Labs, LLC. **TODO (owner):** state of formation and a contact mailing address (optional, but it helps trust). |
| Publication name | **TODO (owner):** confirm. Working name: **Addiction Tracking** (two words in the masthead; domain addictiontracking.com). |
| Editor(s) | **TODO (owner):** at least one real, named human editor with a short bio. No pen names, no AI personas. |
| Clinical reviewer | **TODO (owner):** optional at launch, required before publishing any article that touches withdrawal, medications or diagnosis. A licensed clinician (MD/DO, NP, or licensed addiction professional), named, paid, with credentials stated. Never say "medically reviewed" unless it happened for that article. |
| Contact email | **TODO (owner):** e.g. `editor@addictiontracking.com` (corrections, questions). |
| Repo | **TODO (owner):** create a separate GitHub repo (suggested `freiolabs/addictiontracking`). Copy this guide and `BUILD_PROMPT.md` into its `docs/`. |

### KnowMe facts (the only claims articles may make about the app)

| Fact | Value |
|---|---|
| What it is | A private journal for people changing a habit (alcohol, cannabis, gambling, nicotine, or their own). You log the moments a craving shows up; it shows your own patterns. It never tells you what to do. |
| Price | $7.99 once. No subscription, no in-app purchases. |
| Platforms | iPhone and iPad. Android to follow. |
| Privacy | Everything stays on the phone. No account. Only an opt-in anonymous summary leaves the phone, when you tap Reflect. |
| Reflect | One short letter a day (resets at local midnight), written from that anonymous summary, ending with one open question. |
| Link | `https://knowmejournal.com` (preferred: the app's own site, which carries the App Store badge). |
| Never claim | That KnowMe treats, cures, prevents, or helps people "overcome addiction"; that it's clinically proven; that it's a substitute for care. |

---

## 1. Principles

1. **Sourced or cut.** Every factual claim links to a source that a reader can open and that
   actually says it. If a claim can't be sourced, it doesn't run.
2. **Primary sources first.** Government and intergovernmental health agencies (NIDA, NIAAA,
   SAMHSA, CDC, NIH, FDA, WHO), systematic reviews and meta-analyses, clinical guidelines, then
   peer-reviewed primary studies. Never treatment-center marketing pages, Wikipedia, other
   blogs, press releases on their own, or AI output.
3. **Information, never advice.** Explain what the evidence says. Never tell a reader what to do
   about their own body: no dosing, tapering, moderation plans, withdrawal management, or
   treatment choices. The advice is always "talk to a doctor". Withdrawal from alcohol or
   benzodiazepines can be dangerous, and articles near those topics say so.
4. **Help is never more than a glance away.** 988 and SAMHSA at the top of every article; 911 for
   emergencies; a full help page one click from everywhere.
5. **Respectful language.** Person-first and non-stigmatizing, following NIDA's "Words Matter"
   guidance. The site says "addiction" because that's what people search for, and it talks about
   people, not labels.
6. **Quality comes from process, not authorship.** Articles are drafted with AI. The pipeline in
   section 4 is built around AI's known failure modes, and a named human signs off on every
   article. We say this plainly on every article and on "How we write".
7. **Fewer, better articles.** Launch with 3–5 excellent articles, not twenty thin ones. Google
   treats publishing lots of low-value AI pages to rank as spam ("scaled content abuse"), and
   health content is held to the highest bar (see section 3.6).
8. **Honest about the business.** We make KnowMe. We say so wherever we mention it. No ads, no
   affiliate links, no sponsored content, no paid treatment referrals, ever.

### Not on this site (decided)

| Not doing | Why |
|---|---|
| Ads, affiliate links, tracking pixels, cookie banners | Trust, privacy, and nothing to consent to. |
| Treatment-center directories or "call our hotline" numbers | This niche is full of paid lead-gen; we only list public, free, government-run lines. |
| Comments, accounts, newsletter signup (at launch) | Moderation and data we'd rather not hold. Revisit later; log it if added. |
| Quizzes or self-assessments ("Am I an alcoholic?") | Diagnosis-adjacent; violates "information, never advice". Link to official screeners (e.g. NIAAA's) only if an article truly needs it, with a doctor note. |
| Medical illustrations of pills, needles, bottles; stock photos of distress | Stigmatizing and triggering. |

---

## 2. Branding

Deliberately different from KnowMe. KnowMe is a dark room with one amber lamp, sparse and
intimate. Addiction Tracking is a **bright, well-made reading room**: light paper, deep harbor
blue, a serif you'd trust in a good magazine, and enough structure (rules, labels, tables) to
carry evidence. Warm, never clinical; calm, never scary.

### 2.1 Voice

The voice of a careful, kind health editor explaining something to an adult friend.

- Plain and specific. Grade 8–10 reading level. Define every technical term the first time.
- Warm, not cute. No exclamation points, no emoji, no jokes about substance use.
- Confident only as far as the evidence goes. Use calibrated words: "studies suggest", "in one
  large review", "the evidence is mixed". Say what isn't known.
- "We" for the publication. "You" sparingly, never to give instructions about health.
- Questions make good headings ("What is a craving?").
- No fear tactics, no shock statistics without context, no "rock bottom" stories.
- No hype about KnowMe. One or two plain sentences, with disclosure.

**Words Matter (NIDA).** Use person-first, non-stigmatizing language:

| Avoid | Use |
|---|---|
| addict, junkie, user, alcoholic, drunk | person with a substance use disorder / alcohol use disorder; person who uses drugs |
| abuser, drug abuse, substance abuse | person who misuses …; substance use; substance misuse (for prescription drugs); substance use disorder |
| clean / dirty (people or tests) | not currently using, in recovery / tested positive or negative |
| habit (for a clinical disorder) | substance use disorder, when that's what's meant |
| relapse | return to use, recurrence of use. "Relapse" only when quoting a source or naming a clinical term, and the lint flags it for an editor to confirm. |
| replacement / substitution therapy | medications for opioid use disorder (MOUD) |
| "failed treatment" | (describe what happened; people don't fail treatment) |

"Addiction" is fine as a topic word, in titles and headings ("How addiction changes the brain's
reward system"). Not as a label for a person.

**Voice examples**

| Instead of | Write |
|---|---|
| "Addicts often relapse within 90 days!" | "Many people return to use while changing a habit. Research treats this as common, not as failure. [@source]" |
| "Here's how to taper off alcohol safely" | "Stopping alcohol suddenly after heavy, regular use can be dangerous. Talk to a doctor before you stop." |
| "This app will help you quit" | "If you want a private place to notice your own patterns, KnowMe is one option. (We make it.)" |
| "Science proves cravings last 15 minutes" | "Cravings tend to rise and fall rather than build forever, though how long they last varies. [@source]" |

### 2.2 Color tokens

Light-first. Every text pair below passes WCAG AA; ratios were computed (WCAG 2 relative
luminance) for this guide.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--paper` | `#FFFFFF` | Page background | — |
| `--wash` | `#E8F0F7` | Crisis bar, callouts, "Sources" panel | — |
| `--heather-wash` | `#F3EEF6` | KnowMe disclosure box, "Updated" notes | — |
| `--ink` | `#1C2630` | Body text, headings | 15.3:1 on paper, 13.3:1 on wash |
| `--ink-muted` | `#4E5A66` | Bylines, captions, dates | 7.1:1 on paper |
| `--harbor` | `#1F4E79` | Links, primary buttons, masthead mark, focus ring | 8.7:1 on paper, 7.5:1 on wash |
| `--harbor-deep` | `#163A5C` | Hover/active | 11.7:1 on paper |
| `--on-harbor` | `#FFFFFF` | Text on harbor buttons | 8.7:1 |
| `--heather` | `#6A4C7D` | Topic labels, pull quotes, "Updated" label | 7.1:1 on paper, 6.2:1 on heather-wash |
| `--rule` | `#D5DEE6` | Hairline rules between sections and table rows (decorative only) | 1.4:1 (not for meaning) |
| `--control` | `#7A8896` | Borders that carry meaning (inputs, if any) | 3.6:1 (meets 3:1 non-text) |

- Two hues only: harbor blue (trust, links) and heather plum (editorial accent). No amber, no
  sage, no near-black page: those are KnowMe's.
- **No red** for anything, including warnings and the crisis bar. Urgency comes from placement
  and words, not alarm colors.
- No gradients. Shadows: none. Depth comes from the wash colors and hairline rules.
- Dark mode: not at launch (editorial reading, one palette to get right). Logged in `TODO.md`.
- Charts (if any): harbor, heather, ink-muted, in that order; label lines directly.

### 2.3 Type

Two open-source families (SIL Open Font License), **self-hosted** as subset WOFF2. No Google
Fonts or any font CDN.

| Family | Use | Weights |
|---|---|---|
| **Source Serif 4** | Masthead, headings, article body | 400, 400 italic, 600 |
| **Source Sans 3** | UI, navigation, bylines, labels, tables, captions, crisis bar | 400, 600 |

Fallbacks: `Georgia, "Times New Roman", serif` and `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
Use `font-display: swap` and size-adjusted fallbacks to avoid layout shift.

| Role | Family | Size / line height (rem) | Weight |
|---|---|---|---|
| h1 (article title) | Serif | 2.5 / 1.15 (40 px) | 600 |
| h2 | Serif | 1.75 / 1.25 (28 px) | 600 |
| h3 | Serif | 1.375 / 1.3 (22 px) | 600 |
| Dek (standfirst) | Serif | 1.3125 / 1.5 (21 px) | 400 italic |
| Body | Serif | 1.1875 / 1.65 (19 px) | 400 |
| UI / table | Sans | 1 / 1.5 (16 px) | 400, 600 |
| Byline, caption, source list | Sans | 0.9375 / 1.5 (15 px) | 400 |
| Label (topic, "Updated") | Sans | 0.8125 / 1.4 (13 px), letter-spacing 0.04em, small caps or sentence case (no ALL CAPS paragraphs) | 600 |

- Below 640 px wide: h1 2rem, h2 1.5rem, body stays 1.125–1.1875rem.
- Measure: 60–70 characters (`max-width: 68ch` on the article column).
- Numerals: lining, tabular in tables.

### 2.4 Space, radius, layout, motion

| Token | Value |
|---|---|
| space | 4, 8, 12, 16, 24, 32, 48, 64, 96 px |
| side padding | 20 px mobile, 32 px tablet+ |
| article column | `68ch`; wide elements (tables) may go to 800 px |
| page max width | 1120 px (home and topic listings, two columns at most) |
| radius | 6 px (buttons, boxes). No pills. |
| rules | 1 px `--rule` between sections and table rows; 3 px `--harbor` left border on callouts |
| touch min | 44 × 44 px (48 for crisis links) |
| motion | none needed. Link/button color transitions 150 ms. Respect `prefers-reduced-motion`. |

### 2.5 Logo and wordmark

- **Wordmark:** "Addiction Tracking" in Source Serif 4 Semibold, `--ink`, with "Tracking" in
  `--harbor`. Set in text (SVG outline for the OG image only).
- **Mark:** a small line glyph: three dots on a gentle rising curve (data points over time),
  drawn in `--harbor` with 2 px strokes, inside a 6-px-radius square for the favicon. Simple
  enough to draw as a 30-line SVG. No gnome, no lantern, no amber, no medical cross, no pills,
  no chains or broken chains.
- **TODO (owner):** approve the mark or commission one. The SVG above is the launch placeholder.

### 2.6 Imagery

- Default: no hero images. Articles are typographic; the title and dek are the cover.
- Allowed: simple in-house SVG diagrams that explain something (a craving curve, a timeline),
  sourced like any claim; charts drawn from cited data with the source under them.
- Open Graph images: generated at build, typographic: wordmark, article title, `--wash` band.
- Never: stock photos of people in distress, pills, needles, bottles, syringes, mugshot-style
  portraits, "before/after".
- Editor photos on About: real, consented headshots, or none.

### 2.7 Do / Don't

| Do | Don't |
|---|---|
| Cite every factual claim inline, with a numbered source list | Cite a source you haven't opened, or a treatment-center blog |
| Show "Reviewed" and "Updated" dates under every title | Silently edit facts; every factual change gets a visible note |
| Say "talk to a doctor" | Give dosing, tapering, moderation or withdrawal steps |
| Disclose "Made by Freio Labs, the team behind KnowMe" next to every KnowMe mention | Mention KnowMe in a headline, or in more than one short passage per article |
| Use person-first language | Use "addict", "abuser", "clean/dirty" |
| Keep 988 and SAMHSA at the top of every article | Use red, sirens, or alarm styling for crisis info |
| Say what the evidence doesn't know | Round "some studies suggest" up to "science proves" |
| Use calm harbor/heather/paper | Use KnowMe's amber, sage, dark background, or gnome |

---

## 3. Build Structure

### 3.1 Stack

| Choice | Pick | Why |
|---|---|---|
| Generator | **Astro** (latest stable), static output | Content collections with schema validation, Markdown built in, zero JS by default. |
| Content | Markdown files in an Astro content collection, schema in **Zod** (bundled with Astro) | The same schema validates the site build and the check scripts. |
| Citations | Small in-repo remark plugin (`[@source-id]` → numbered superscript link) | ~40 lines; no citation library needed. |
| Scripts | TypeScript, run with Node's built-in type stripping (Node 22.18+ / 24) | No `tsx`/`ts-node` dependency. |
| HTML parsing in checks | One small, boring library is acceptable (e.g. `node-html-parser`) | Extracting page text by regex is fragile. Log the choice. |
| LLM for checks | Provider-agnostic: `CHECK_LLM_BASE_URL`, `CHECK_LLM_API_KEY`, `CHECK_LLM_MODEL` env vars, OpenAI-compatible API | **TODO (owner):** pick a provider and model; document defaults in README. Keys never committed. |
| Other deps | `@astrojs/sitemap`, `@astrojs/rss`. Anything else gets a `DECISIONS.md` line. | |
| CI | GitHub Actions | Build + deterministic checks on every PR; network checks on PRs that touch articles; weekly link check. |
| Hosting | **Vercel Pro** (see 3.10) | Hobby forbids commercial use. |

### 3.2 Folder tree

```
addictiontracking/                 ← its own repo
  docs/
    SITE_GUIDE.md                  ← this file
    BUILD_PROMPT.md
    EDITORIAL_CHECKLIST.md         ← the human sign-off checklist (section 4.4)
  DECISIONS.md
  TODO.md
  README.md
  package.json
  astro.config.mjs                 ← site: 'https://addictiontracking.com', output: 'static'
  tsconfig.json                    ← strict
  vercel.json                      ← headers, redirects
  .github/workflows/
    ci.yml                         ← build + check:static on every PR; check:citations on article changes
    weekly-links.yml               ← scheduled link-rot + freshness report, opens an issue
  scripts/
    lib/
      schema.ts                    ← re-exports the Zod schema from src/content/config.ts
      frontmatter.ts               ← reads every article's frontmatter + body
      fetchText.ts                 ← fetch with timeout, redirects, HTML→text, cache
      llm.ts                       ← one function: judge(prompt) → JSON, via env vars
    check-static.ts                ← schema, cite markers, banned words, Words Matter, disclosure, crisis, dates
    check-citations.ts             ← resolve URLs/DOIs, metadata match, quote match, support judge, freshness
    check-medical.ts               ← medical-advice and overconfidence pass
    report.ts                      ← writes reports/<slug>.json with a content hash
  reports/                         ← committed check reports (one per article)
  public/
    fonts/                         ← subset WOFF2 + license files
    favicon.svg, icon-32.png, apple-touch-icon.png
    robots.txt
  src/
    content/
      config.ts                    ← collections: articles, people
      articles/
        what-is-a-craving.md
        ...
      people/
        <editor-id>.yaml           ← name, role, bio, credentials, photo?
    lib/
      site.ts                      ← name, URLs, emails, crisis lines (one place)
      remark-cite.ts               ← [@id] → <sup><a href="#src-id">n</a></sup>
    styles/
      tokens.css
      global.css
    components/
      BaseLayout.astro
      Masthead.astro
      Footer.astro
      CrisisBar.astro              ← top of every article and every page
      HelpList.astro               ← full crisis/help list
      Byline.astro                 ← AI-assisted · edited by · reviewed · updated
      Disclaimer.astro             ← short (top) and full (bottom) variants
      KeyPoints.astro
      Callout.astro
      DoctorNote.astro             ← "talk to a doctor" note; withdrawal variant
      KnowMeNote.astro             ← the only way KnowMe appears; disclosure built in
      SourceList.astro             ← numbered sources with claim, publisher, year, link/DOI
      UpdateNotes.astro            ← visible "Updated"/"Correction" notes
      ReportError.astro            ← mailto with article slug and URL prefilled
      ArticleCard.astro
      TopicLabel.astro
    pages/
      index.astro
      articles/[slug].astro
      topics/[topic].astro
      get-help.astro
      how-we-write.astro
      corrections.astro
      about.astro
      disclaimer.astro
      privacy.astro
      rss.xml.ts
      404.astro
```

### 3.3 Pages

Every page: `CrisisBar` first (above the masthead on articles, directly under it elsewhere),
masthead, footer with Get help, How we write, Corrections, About, Disclaimer, Privacy.

| Page | Purpose | Sections |
|---|---|---|
| `/` Home | Say what this is and why it can be trusted; lead to articles. | CrisisBar · masthead · one-paragraph mission ("Plain, sourced answers about addiction, cravings and change.") · latest/featured articles (cards: topic, title, dek, reviewed date) · "How we write" summary (3 lines + link) · topics list · footer. |
| `/articles/[slug]` Article | The product. | See 3.3.1. |
| `/topics/[topic]` | List articles by topic. Generate only for topics with ≥ 1 published article. | Title, one-line description, article cards. |
| `/get-help` | Every help line, plain and calm. | 988 (call/text, Suicide & Crisis Lifeline) · 911 · SAMHSA National Helpline 1-800-662-4357 (free, confidential, 24/7, English and Spanish, treatment referral) · FindTreatment.gov (SAMHSA's treatment locator) · 1-800-QUIT-NOW (1-800-784-8669) · National Problem Gambling Helpline 1-800-MY-RESET (1-800-697-3738) · the doctor/withdrawal note · "Outside the US, contact your local emergency number." Verify every number and URL from its official source at build time of this page; record the check date. |
| `/how-we-write` | Explain the AI-assisted process honestly. | We draft with AI · sources come first (we gather them, the draft may only use them) · every source is checked automatically (it resolves, the metadata matches, the quoted passage is in it and supports the claim) and by a person · medical-advice pass · named human editor signs off · "Reviewed" and "Updated" dates and what they mean · review cycle · what we don't do (ads, affiliates, paid referrals) · how to report an error. |
| `/corrections` | Policy plus a public log. | Policy: we correct factual errors promptly, note every factual change visibly at the top and bottom of the article with date and what changed, never silently; typos and formatting don't get notes. Log: generated from every article's `updates[]` with `type: correction`, newest first. How to report: email + what to include. Target response time **TODO (owner)**. |
| `/about` | Who's behind this. | Freio Labs, LLC (what it is, where) · the people (from `people` collection, real names and bios) · relationship to KnowMe: "Freio Labs makes KnowMe, a private journal app. Some articles mention it, always with a disclosure." · how the site is funded (KnowMe sales; no ads, affiliates or sponsors) · contact. |
| `/disclaimer` | Full medical disclaimer. | "Addiction Tracking publishes general information, not medical advice, diagnosis or treatment. Talk to a doctor or other qualified health professional about your situation. Don't delay or disregard professional advice because of something you read here. If you're in crisis, call or text 988; in an emergency, call 911." |
| `/privacy` | The site's own privacy policy. | No cookies, no analytics (or exactly what the cookieless tool counts, if adopted), no third-party requests; host keeps standard server logs (IP, user agent) for security. **TODO (owner):** confirm host log retention. Email contact. |
| `/rss.xml` | Feed for readers and aggregators. | Title, description, link, date. |
| `/404` | One sentence, a link home, the crisis bar. | |

#### 3.3.1 Article page, top to bottom

1. **CrisisBar:** "In crisis? Call or text 988. In an emergency, call 911. Help finding treatment: SAMHSA, 1-800-662-4357, free and 24/7." Tappable numbers, `--wash` background, sans 15 px, no red, no dismiss button.
2. Topic label(s).
3. `h1` title, dek (the `description`).
4. **Byline:** "Drafted with AI assistance. Edited by [Name]." (+ "Medically reviewed by [Name, credential]" only if `medicalReviewer` is set) · "Reviewed [reviewedAt]" · "Updated [updatedAt]" (shown when different from published). Dates as `<time datetime>`.
5. **Short disclaimer:** "General information, not medical advice. Talk to a doctor about your situation."
6. **Key points:** 3 bullets, each sourced.
7. Body, with `[@id]` citations rendered as numbered superscripts. Callouts and `DoctorNote` where relevant (required on any article mentioning alcohol or benzodiazepine withdrawal, stopping a medication, or detox).
8. **KnowMeNote** (only if `mentionsKnowMe: true`): a `--heather-wash` box with one or two plain sentences and the disclosure **"Made by Freio Labs, the team behind KnowMe."** inside the box, above the link, not in a footnote. Placed after the main content, never in the first screen, never more than once.
9. **Sources:** numbered list. Each: authors (short), title, publisher/journal, year, DOI or URL, "Supports: [claim]", accessed date.
10. **Updates and corrections:** every `updates[]` entry, newest first. A correction also shows a one-line "Correction [date]" note under the byline.
11. **Report an error:** "See something wrong? Tell us." mailto prefilled with the URL.
12. Full disclaimer, related articles (same topic, max 3).

### 3.4 Components

Listed in 3.2. Rules that matter:
- `KnowMeNote` is the **only** way KnowMe appears in body content. It renders the disclosure
  itself, so it can't be forgotten. `check-static` fails if "KnowMe" appears in an article body
  outside the component, or if `mentionsKnowMe` and the component disagree.
- `CrisisBar` and `HelpList` read numbers from `src/lib/site.ts` only.
- `SourceList` renders from frontmatter, so the reader sees exactly what the checker checked.
- `Byline` renders "Drafted with AI assistance" from `drafting: ai-assisted`; it can't be turned
  off for AI-drafted articles.

### 3.5 Content model

`src/content/config.ts` (Zod). Scripts import the same schema from `scripts/lib/schema.ts`.

```yaml
---
title: "What is a craving? What research says about urges, and why they pass"
description: "A plain explanation of cravings: what triggers them, how they rise and fall, and what studies have found about riding them out."   # ≤ 160 chars, used as dek + meta
topics: [cravings, habit-change]
drafting: ai-assisted            # ai-assisted | human
editor: jane-doe                 # id in src/content/people/ — TODO(owner): real person
medicalReviewer: null            # id or null; required (non-null) when medicalReview: required
medicalReview: not-required      # not-required | required  (set by editor; check-medical can force "required")
publishedAt: 2026-12-01
reviewedAt: 2026-12-01           # last full source re-check by the editor
updatedAt: 2026-12-01            # last content change of any kind
nextReviewDue: 2027-12-01        # ≤ 12 months after reviewedAt; ≤ 6 months if any statistic claim
mentionsKnowMe: true
updates:                         # visible notes; [] at publish
  - date: 2027-02-10
    type: correction             # correction | update | review
    note: "Corrected the survey year for the prevalence figure from 2022 to 2023."
sources:
  - id: kelly-2010-words
    type: peer-reviewed          # government | intergovernmental | systematic-review | guideline | peer-reviewed | dataset | other
    title: "Does it matter how we refer to individuals with substance-related conditions?"
    authors: ["Kelly JF", "Westerhoff CM"]
    publisher: "International Journal of Drug Policy"
    year: 2010
    doi: "10.1016/j.drugpo.2009.10.010"   # TODO: example only — verify every field before use
    url: null                    # url or doi required; both allowed
    pmid: null
    accessedAt: 2026-11-20
    claims:
      - text: "Clinicians were more likely to judge a person as deserving punishment when described as a 'substance abuser' than as 'having a substance use disorder'."
        kind: finding            # statistic | finding | definition | guidance
        quote: "…exact supporting passage copied from the source…"
        location: "Abstract"     # page, section or paragraph, for the human checker
signoff:                         # written only by the editor, after the checklist
  editor: jane-doe
  date: 2026-12-01
  contentHash: "sha256:…"        # hash of frontmatter (minus signoff) + body; CI rejects a stale hash
---

Body text with a claim.[@kelly-2010-words]
```

Rules enforced by `check-static`:
- Every `[@id]` in the body exists in `sources`; every source is cited at least once.
- Every source has `url` or `doi`, at least one claim, and every claim has a non-empty `quote`.
- `type: other` needs an editor note (`justification`) and can't be the only support for a
  statistic or medical-adjacent claim.
- Dates are ordered: `publishedAt ≤ reviewedAt ≤ updatedAt`; `nextReviewDue` within limits.
- Statistic claims: source `year ≥ current year − 3`, unless `staleReason` explains (e.g. "latest
  available NSDUH release").
- `signoff.contentHash` matches the current content, and `reports/<slug>.json` exists with the
  same hash and no unresolved blocking issues. Otherwise the article builds as a draft
  (`noindex`, excluded from listings and sitemap) and CI fails on `main`.

`people` collection: `id`, `name`, `role` (editor | medical-reviewer), `credentials` (free text,
only real ones), `bio` (2–3 sentences), `photo?`, `links?` (e.g. LinkedIn, for E-E-A-T).

### 3.6 SEO and meta

**YMYL and E-E-A-T.** Google classes health content as "Your Money or Your Life" and holds it to
the highest standard of experience, expertise, authoritativeness and trust. Concretely: named
editors with real bios, a real organization on About, sources on every claim, visible review
dates, a corrections policy, no deceptive design. AI drafting is allowed by Google's guidance
when the result is helpful and accurate; mass-producing pages to rank is not ("scaled content
abuse"). Expect **months** before a new domain ranks for competitive health queries. That's
normal; don't respond by publishing more, thinner articles.

| Item | Value |
|---|---|
| Titles | Article title, then " · Addiction Tracking". ≤ 60 chars where possible. |
| Descriptions | Frontmatter `description`, ≤ 160 chars. |
| Canonical | `https://addictiontracking.com/articles/<slug>`; `www` → apex 301; no trailing slash. |
| Structured data | `Article` (or `MedicalWebPage` only if a medical reviewer signed off): headline, description, `datePublished`, `dateModified`, `author`/`editor` as `Person` with About URL, `reviewedBy` only when real, `publisher` `Organization` "Freio Labs, LLC", `citation` list from sources. `Organization` on About. No fake ratings, no FAQ markup stuffing. |
| Open Graph | Generated typographic images per article (1200×630). |
| Sitemap / robots | Sitemap lists only signed-off articles and static pages. Drafts are `noindex`. Previews `X-Robots-Tag: noindex`. |
| Internal links | Each article links to 2–3 related articles and to `/get-help`. |
| Links to KnowMe | Plain "KnowMe" anchor text to `https://knowmejournal.com`, only inside `KnowMeNote` and on About. No sitewide footer link, no keyword-rich anchors (avoids looking like a link scheme between the two domains). |
| Search Console | Separate property, DNS-verified. |

### 3.7 Accessibility (WCAG 2.2 AA)

- Semantic article markup: `<article>`, one `h1`, ordered headings, `<time>`, `<aside>` for callouts.
- Skip link; visible focus ring (2 px `--harbor`, 2 px offset).
- Citation superscripts have accessible names ("Source 3") and each source has a back-link.
- Tables have `<caption>` and header cells.
- Text in `rem`; reflow at 320 px and 200% zoom; color never the only signal.
- Crisis numbers are `tel:`/`sms:` links with ≥ 48 px targets.
- Reading level checked by `check-static` (warn above grade 10).
- Test with VoiceOver and NVDA, keyboard only.

### 3.8 Performance budget

| Metric | Budget |
|---|---|
| JavaScript | 0 KB by default (any JS needs a `DECISIONS.md` line) |
| Fonts | ≤ 5 files, ≤ 120 KB total WOFF2, latin subset, preload body serif 400 only |
| HTML + CSS per article | ≤ 60 KB compressed |
| Images | none required; any diagram SVG ≤ 30 KB |
| Third-party requests | 0 |
| Lighthouse (mobile) | Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 |
| LCP / CLS / INP | < 1.5 s / < 0.05 / < 100 ms |

### 3.9 Hosting and deploy

- **Vercel Pro** (Hobby forbids commercial use). **TODO (owner):** confirm current Pro pricing
  and whether to share a team with knowmejournal.com. A separate Vercel *project* is required
  either way. Cloudflare Pages or Netlify are fine alternatives (static output; reversible).
- Build: `npm run build` (= `check:static` + `astro build`). Output `dist`.
- Domains: apex primary, `www` → apex. HTTPS, HSTS.
- `vercel.json` headers: CSP `default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`; `Referrer-Policy: strict-origin-when-cross-origin`; `X-Content-Type-Options: nosniff`; `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- The network checks (`check:citations`, `check:medical`) run locally and in CI on article PRs,
  **not** in the Vercel build (they're slow, need keys, and depend on other sites being up). The
  Vercel build only verifies that a matching, passing report exists.

### 3.10 Analytics and privacy stance

None at launch. Search Console (DNS-verified, no script) shows what people search for. If the
owner later wants page counts: cookieless, aggregate-only (Vercel Web Analytics or Plausible),
logged in `DECISIONS.md`, disclosed on `/privacy` the same day. Never: Google Analytics, Meta
Pixel, ad networks, session recording, fingerprinting, or anything that profiles readers of
addiction content.

### 3.11 Launch checklist

- [ ] Publication name, editor (real name + bio), contact email, About details (**owner**)
- [ ] Clinical reviewer engaged, or the withdrawal article held back (**owner**)
- [ ] LLM provider for checks chosen; keys in CI secrets (**owner**)
- [ ] Mark approved or placeholder accepted (**owner**)
- [ ] 3–5 launch articles: every one passes `check:static`, `check:citations`, `check:medical`, and has a signed checklist and matching report
- [ ] An editor has opened every source and read every quoted passage (spot checks are not enough at launch)
- [ ] `/get-help` numbers verified against official sources, check date recorded
- [ ] How we write, Corrections, About, Disclaimer, Privacy live and linked from every page
- [ ] CrisisBar on every page; KnowMe disclosure on every page that mentions it
- [ ] Lighthouse budgets met; VoiceOver/keyboard pass; 320 px and 200% zoom pass
- [ ] Vercel Pro (or a host allowing commercial use); DNS; HTTPS; headers verified
- [ ] Search Console verified; sitemap submitted
- [ ] Weekly link-check workflow running; first report clean
- [ ] Nothing `TODO` in built output; all gaps in `TODO.md`

---

## 4. Editorial pipeline

Designed around how AI drafts actually go wrong. Each failure mode gets a specific, mostly
automated defense, and a human signs off at the end.

| AI failure mode | Defense |
|---|---|
| Fabricated citations (a DOI or URL that doesn't exist) | **Sources first:** the draft may only cite a source pack gathered before drafting. `check-citations` resolves every DOI/URL. |
| Misattributed citations (real paper, wrong authors/year/title, or it doesn't say that) | Metadata match against Crossref/PubMed; verbatim `quote` must be found in the fetched source; an LLM support judge compares the body sentence to the quote; a human reads it. |
| Outdated statistics | Statistic claims need a source ≤ 3 years old or a `staleReason`; "Reviewed" dates shown; 6–12 month review cycle; weekly freshness report. |
| Overconfident medical claims / advice | `check-medical`: pattern lint + LLM classifier; blocking until fixed or justified; forces `medicalReview: required` on medical-adjacent articles. |
| Stigmatizing language | Words Matter lint in `check-static`. |
| Plausible filler, generic content | Topic brief with a specific angle; editor checklist asks "what does this add that NIDA's page doesn't?" |

### 4.1 Stages

| # | Stage | Who | Output |
|---|---|---|---|
| 1 | **Brief** | Editor | Reader question, angle, what the article won't cover, required primary sources. |
| 2 | **Source pack** | Editor, AI-assisted search allowed | 5–15 sources, opened and saved; for each, the passages that matter copied verbatim. Only tiers allowed by Principle 2. |
| 3 | **Draft** | AI | Article from the brief and source pack only. Every claim gets `[@id]` and a `claims[]` entry with the verbatim `quote`. Prompt forbids unsourced claims, advice, dosing, and the avoid-list words. |
| 4 | **Static check** | `npm run check:static` | Schema, markers, banned/stigma words, disclosure, crisis, dates, reading level. |
| 5 | **Citation check** | `npm run check:citations -- <slug>` | See 4.2. Writes `reports/<slug>.json`. |
| 6 | **Medical check** | `npm run check:medical -- <slug>` | See 4.3. Adds to the report. |
| 7 | **Human edit** | Editor | Fix every flag. Read every source passage against its sentence. Tone and Words Matter pass. Fill the checklist (4.4). |
| 8 | **Clinical review** (when required) | Clinical reviewer | Reviews medical-adjacent content; recorded as `medicalReviewer`. |
| 9 | **Sign-off** | Editor | Writes `signoff` with the content hash. PR merge requires a passing CI and the signed checklist in the PR description. |
| 10 | **Maintain** | Editor + weekly job | Link-rot and freshness reports open issues; re-review by `nextReviewDue`; corrections per policy. |

### 4.2 `check-citations` (what it must do)

For every source, cached by URL/DOI for 7 days in `.cache/` (gitignored):

1. **Resolve.** DOI → `https://doi.org/<doi>` follows to a 2xx page. URL → GET with redirects;
   final status 2xx; detect soft 404s (status 200 but title/body says "not found", or redirect to
   a homepage). PMID → NCBI E-utilities summary exists.
2. **Metadata match.** For DOIs, Crossref (`https://api.crossref.org/works/<doi>`); for PMIDs,
   PubMed. Compare title (normalized similarity ≥ 0.9), first author surname, year (±1 for
   online-first), journal. Any mismatch is blocking. Send a polite `User-Agent` with a contact
   email and respect rate limits.
3. **Quote found.** Fetch the source text (HTML → text; PDF → text if a small PDF parser is
   available, else flag). Normalize whitespace, quotes, dashes, ligatures; the `quote` must
   appear (exact after normalization, or ≥ 0.95 fuzzy for long quotes). Paywalled or unreadable
   sources are `needs-human`: the editor must confirm the quote from their own access and set
   `verifiedManually: { by, date }` on that claim.
4. **Supports the claim.** For each `[@id]` marker, take the body sentence it's attached to and
   ask the LLM judge: given only this quote, is the sentence *supported*, *partially supported*,
   *not supported*, or *overstated*? JSON output with a one-line reason. Anything but *supported*
   is blocking. The judge never sees the rest of the article, so it can't fill gaps from memory.
5. **Fresh enough.** Apply the statistic-age rule; warn on any source older than 10 years used
   for a current-state claim.
6. **Report.** `reports/<slug>.json`: content hash, per-source and per-claim results, blocking
   count, model id used, run date. Exit code non-zero if anything blocks.

### 4.3 `check-medical` (what it must do)

1. **Pattern lint** (deterministic, no network): dose units and amounts (`mg`, `ml`, "units per",
   "drinks per day" as instruction), taper/tapering, detox at home, "safe amount", "safer use",
   "cut down to", moderation plans, "you should stop/start/take", "cure", "treats", "guaranteed",
   "proven to", "always", "never" in medical contexts, diagnosis phrasing ("you have", "you are
   an"), and withdrawal topics (alcohol, benzodiazepines, opioids, "DTs", "seizure").
2. **LLM classifier** per paragraph: flags *medical advice*, *dosing/moderation*, *diagnosis*,
   *overconfident claim* (certainty beyond the cited evidence), *missing doctor note*. JSON output.
3. **Rules:** any advice/dosing/diagnosis flag is blocking until rewritten. Withdrawal or
   medication topics require a `DoctorNote` and force `medicalReview: required`. Overconfidence
   flags need a rewrite or an editor justification in the report.

### 4.4 Editor checklist (`docs/EDITORIAL_CHECKLIST.md`, pasted into every article PR)

- [ ] I opened every source and read the passage behind every citation.
- [ ] Every statistic is from the latest available release, and its year is clear in the text.
- [ ] No sentence tells the reader what to do about their health, except "talk to a doctor".
- [ ] Withdrawal/medication mentions have the doctor note; clinical review done if required.
- [ ] Language follows Words Matter; no "addict", "abuser", "clean/dirty".
- [ ] KnowMe appears only in `KnowMeNote`, with the disclosure, and only if it truly helps the reader.
- [ ] The article adds something a reader can't get from the first government page on the topic.
- [ ] All check reports pass on the current content hash.
- [ ] Byline, dates and `nextReviewDue` are right.

### 4.5 Launch articles (3–5, strong)

Each needs a specific angle and primary sources. Candidate sources below are **starting points to
verify**, not confirmed citations.

| # | Title | Angle | Start from (verify) | KnowMe? |
|---|---|---|---|---|
| 1 | **What is a craving? What research says about urges, and why they pass** | Cravings as cue-driven waves that rise and fall; what "urge surfing" studies found and their limits. | NIDA on drugs and the brain; Bowen & Marlatt (2009) "Surfing the urge", *Psychology of Addictive Behaviors* | Yes: noticing when urges land |
| 2 | **"Addict" or "person with a substance use disorder": why the words matter** | The evidence that labels change how clinicians and the public judge people, and what to say instead. | NIDA "Words Matter"; Kelly & Westerhoff (2010), *International Journal of Drug Policy* | No |
| 3 | **Does tracking a habit help? What the evidence says about self-monitoring** | Meta-analytic evidence that monitoring progress supports behavior change, especially when recorded; what it doesn't prove for substance use. | Harkin et al. (2016), *Psychological Bulletin*, on monitoring goal progress; relevant reviews on self-monitoring in alcohol interventions | Yes: the natural fit |
| 4 | **Where to get help in the US: 988, SAMHSA's helpline, and FindTreatment.gov** | What each free line is for, who answers, what happens when you call or text, what it costs (nothing). | 988lifeline.org; SAMHSA National Helpline page; FindTreatment.gov | No |
| 5 | **Thinking about stopping drinking? Why to talk to a doctor first** | Plain explanation that alcohol withdrawal can be serious for some people, and why medical advice matters, with no management steps. **Requires clinical review; hold it if no reviewer.** | NIAAA (Rethinking Drinking; treatment navigator); NIH/MedlinePlus on alcohol withdrawal | No |

Cadence after launch: one or two articles a month, each through the full pipeline. Depth and
accuracy beat volume.
