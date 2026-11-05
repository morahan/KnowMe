# Build prompt: addictiontracking.com

Paste everything below the line into a fresh coding agent, started in a **new, empty repo** for
this site (suggested name `addictiontracking`). Before pasting, copy `SITE_GUIDE.md` and this file
into that repo's `docs/` folder. They live in the KnowMe repo at
`websites/addictiontracking.com/`.

---

You are building **addictiontracking.com**, an evidence-based publication about addiction,
cravings and habit change, published by **Freio Labs, LLC**. Every factual claim cites a
peer-reviewed or primary source (NIDA, NIAAA, SAMHSA, CDC, NIH, FDA, WHO, peer-reviewed
journals). Some articles mention **KnowMe**, Freio Labs' $7.99 private journal app, as one
low-cost, private tool, always with a disclosure. Articles are drafted with AI; quality comes
from a strict checking pipeline and a named human editor's sign-off.

You build the site **and** the editorial tooling. You do not write or publish real articles
beyond one fixture article for testing (see Phase 4). Work end to end without asking questions.
When something is unclear, make the simplest reasonable call and log it.

## Read first

1. `docs/SITE_GUIDE.md` — the full spec: principles, brand, pages, components, content model,
   pipeline, checks. Follow it exactly. If it isn't in `docs/`, look for
   `../knowme/websites/addictiontracking.com/SITE_GUIDE.md` and copy it in. If you can't find it,
   stop and say so. Don't build from memory or from this prompt alone.
2. NIDA's "Words Matter" guidance (search nida.nih.gov) for the language rules the lint enforces.

## Non-negotiables

1. **Crisis first.** A `CrisisBar` at the top of every article and page: 988 (call or text,
   Suicide & Crisis Lifeline), 911 for emergencies, SAMHSA National Helpline 1-800-662-4357
   (free, 24/7). A `/get-help` page lists those plus FindTreatment.gov, 1-800-QUIT-NOW and
   1-800-MY-RESET. Numbers live in one file. Verify each against its official site and record the
   date. Calm styling, never red.
2. **No medical advice, ever.** No dosing, tapering, moderation, withdrawal management, diagnosis,
   treatment or cure claims, in the site copy or in anything the tooling lets through. The only
   advice is "talk to a doctor"; withdrawal from alcohol or benzodiazepines can be dangerous.
   Every article carries the "not medical advice" disclaimer.
3. **Distinct brand.** Use the guide's palette (paper, harbor blue `#1F4E79`, heather `#6A4C7D`,
   ink `#1C2630`), Source Serif 4 + Source Sans 3 self-hosted, the "Addiction Tracking" wordmark.
   Nothing from KnowMe's look: no amber, no sage, no dark page, no gnome.
4. **Person-first language** per NIDA Words Matter, enforced by lint. "Addiction" is fine as a
   topic word; never "addict", "abuser", "clean/dirty".
5. **Every citation is checked.** A source must resolve, its metadata must match, its quoted
   passage must be found in it, and that passage must support the sentence that cites it.
   Unsigned or unchecked articles never build as published pages.
6. **Honest disclosure.** "Drafted with AI assistance" on every AI-drafted article. "Made by Freio
   Labs, the team behind KnowMe." inside every KnowMe mention. Visible "Reviewed" and "Updated"
   dates. Visible correction notes; never silent factual edits.
7. **Private and fast.** Static output, no client JS by default, no analytics, cookies, ads,
   affiliate links, embeds, font CDNs or third-party requests.
8. **No invented facts.** Editor names, credentials, emails, addresses, the publication name, the
   LLM provider: use the guide's `TODO` placeholders, make them fail the production build, and
   list them in `TODO.md`. Never create a fake person or a fake source.

## Phased build order

Commit after each phase with a clear message. Before every commit: `npx tsc --noEmit`, the lint,
`npm test`, and `npm run build`. Fix failures first. Push once checks pass.

### Phase 1 — Scaffold, tokens, layout
- Astro (latest stable), static output, TypeScript strict, `@astrojs/sitemap`, `@astrojs/rss`.
- `tokens.css` and `global.css` from guide 2.2–2.4; self-hosted subset fonts with license files.
- `src/lib/site.ts`, `BaseLayout`, `Masthead` (wordmark + SVG mark), `Footer`, `CrisisBar`.
- `DECISIONS.md`, `TODO.md`, `README.md`.

**Done when:** a blank page builds with the right fonts, colors and crisis bar; no third-party
requests in the network panel; fonts ≤ 120 KB.

### Phase 2 — Content model and article page
- Content collections `articles` and `people` with the Zod schema from guide 3.5, exported for
  scripts via `scripts/lib/schema.ts`.
- `remark-cite.ts`: `[@id]` → numbered superscript linking to the source list, with back-links.
- Article page in the exact order of guide 3.3.1, with `Byline`, `Disclaimer`, `KeyPoints`,
  `DoctorNote`, `KnowMeNote`, `SourceList`, `UpdateNotes`, `ReportError`.
- Draft handling: articles without a valid sign-off and matching passing report build as
  `noindex` drafts, are left out of listings, sitemap and RSS, and fail the build on `main`.

**Done when:** a fixture article renders every component; removing the sign-off turns it into an
excluded `noindex` draft; the source list shows exactly what's in frontmatter.

### Phase 3 — Trust pages and listings
- Home, `/topics/[topic]`, `/get-help`, `/how-we-write`, `/corrections` (policy + log generated
  from `updates[]`), `/about` (people from the collection), `/disclaimer`, `/privacy`, `/rss.xml`,
  `/404`, per guide 3.3.
- SEO from guide 3.6: titles, descriptions, canonical, generated typographic OG images, JSON-LD
  (`Article`; `reviewedBy`/`MedicalWebPage` only when a real reviewer is set; no ratings).

**Done when:** every page is reachable from the footer, every page shows the crisis bar, the
corrections log updates from frontmatter alone, and structured data validates.

### Phase 4 — Editorial checks (the core of this project)
- `check-static.ts` (offline): every rule in guide 3.5, the Words Matter lint (guide 2.1 table),
  banned words, KnowMe-only-in-`KnowMeNote`, disclosure present, crisis bar present, reading level
  warning. Runs inside `npm run build`.
- `check-citations.ts` (network): resolve, metadata match (Crossref/PubMed), quote found, LLM
  support judge on the citing sentence vs. the quote only, freshness rule, report with content
  hash. Guide 4.2.
- `check-medical.ts`: pattern lint + LLM classifier, blocking rules, forces `medicalReview:
  required`. Guide 4.3.
- `llm.ts`: OpenAI-compatible client from `CHECK_LLM_BASE_URL`, `CHECK_LLM_API_KEY`,
  `CHECK_LLM_MODEL`. If the key is missing, LLM steps report `not-run` and block publication (never
  silently pass).
- `docs/EDITORIAL_CHECKLIST.md` from guide 4.4, plus a PR template that includes it.
- **Tests** with fixture articles that must be caught: a nonexistent DOI; a real DOI with the
  wrong year/author; a quote that isn't in the source; a sentence that overstates its quote; a
  2015 statistic with no `staleReason`; "addict" in the body; "taper by 10% a week"; KnowMe
  mentioned outside `KnowMeNote`; a missing `[@id]` source; an uncited source. Network tests use
  recorded fixtures so they run offline.
- One clean fixture article (a short placeholder clearly marked as test content, `noindex`, never
  published) that passes everything.

**Done when:** every bad fixture fails with a clear message naming the article, the source and
the reason; the clean fixture passes; `npm test` runs offline.

### Phase 5 — CI, hosting, launch prep
- `.github/workflows/ci.yml`: build + `check:static` + tests on every PR; `check:citations` and
  `check:medical` on PRs that change `src/content/articles/` (needs secrets; fail if missing).
- `weekly-links.yml`: scheduled link-rot and freshness run over published articles; opens an issue
  listing problems and articles past `nextReviewDue`.
- `vercel.json`: headers and `www` → apex redirect from guide 3.9. The Vercel build runs only
  `check:static` + `astro build`.
- Lighthouse mobile on Home, an article, How we write; meet guide 3.8 or log why not.
- Copy the launch checklist (guide 3.11) into `TODO.md`; check off the code-side items.
- In `TODO.md`, list the 3–5 launch articles from guide 4.5 as the owner's next work, each to go
  through the full pipeline. Don't draft them.

**Done when:** CI is green, a deliberately broken article PR fails CI, the production build fails
while any owner TODO placeholder is still in built output, and `TODO.md` lists every owner step.

## What to log and what to leave

- **`DECISIONS.md`**: one line per call the guide didn't settle, `YYYY-MM-DD | decision | why`
  (e.g. HTML parser choice, PDF handling, similarity thresholds, font subsetting).
- **`TODO.md`**: every owner TODO (publication name, editor and bio, clinical reviewer, contact
  email, About details, LLM provider and keys, mark approval, Vercel plan, DNS, Search Console,
  host log retention, corrections response time), the launch articles, dark mode, anything that
  doesn't work yet. Never fake a check: if a check can't run, it says `not-run` and blocks.

When finished, report: what was built, which fixture failures each check catches, Lighthouse
scores, commit hashes, and the owner TODO list.
