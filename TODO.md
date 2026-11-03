# TODO.md

## Blocking
- [ ] Install Node 20+ and Yarn, then run the setup in README.md. Nothing has been type-checked, linted, or tested yet.
- [ ] Add lint config (`yarn expo lint` generates one).
- [ ] `git init` and first commit once checks pass.

## Features (scaffolded, not built)
- [ ] Setup: habit picker, 1–8 reasons with `guard()`, skip. Route to setup on first launch until done or skipped.
- [ ] Log: full form, `guard(note)` before save, haptic tick, return to Today.
- [ ] Today: days-since per habit (`lastUsedAt`), today's moments, empty state.
- [ ] I'm in it: reasons fading in, top 3 helpers, small 20-min timer, "Where's it at now?".
- [ ] Patterns: 4 local charts + one sentence each. Choose a chart approach (prefer own SVG over a big dep).
- [ ] Reflect: line-by-line fade-in for the letter.
- [ ] Me: edit habits/reasons, demo switch (route passes `seedDemoData` in as a prop).

## Known gaps
- [ ] Demo data mixes with real data. Decide: separate db file, or an `is_demo` column.
- [ ] Rate limit is per warm Vercel instance only. Use shared storage if this ships.
- [ ] Verify Llama base URL and model name against the real account.
- [ ] Crisis terms are duplicated in app and proxy. Add a test that they match.
- [ ] Status bar and Android nav bar match `bg` in both schemes (theme rule 6).
- [ ] Check light mode on device.
- [ ] Respect Reduce Motion in `BreathCircle`.
- [ ] `IntensityPicker` cells are < 48pt wide on small phones. Check on device.
- [ ] Proxy tests: crisis input, "CRISIS" output, "how much can I safely use?" redirect (SAFETY.md test cases).
