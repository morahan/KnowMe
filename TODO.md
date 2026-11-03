# TODO.md

## Verify on a real device / account
- [ ] Verify Llama base URL and model name against the real account; deploy the proxy and set `EXPO_PUBLIC_PROXY_URL`.
- [ ] Check light mode on device.
- [ ] Check `IntensityPicker` cells on a small phone (10 cells can dip under 48pt wide).
- [ ] Respect Reduce Motion in `BreathCircle`.
- [ ] Status bar and Android nav bar match `bg` in both schemes (theme rule 6).
- [ ] Run the full DEMO.md script on a phone with demo data loaded.

## If this ships beyond the demo
- [ ] Rate limit is per warm Vercel instance only. Use shared storage (e.g. Upstash) for a real limit.
- [ ] "How much can I safely use?" is handled by the system prompt only. Add a proxy-side dosing-phrase check if it ever matters.
- [ ] Light-theme polish pass; dark is the designed default.

## Done (kept for the record)
- [x] Scaffold, theme, data layer with repository unit tests.
- [x] Setup, Log, Today, I'm in it, Patterns, Reflect, Me, Safety, demo data.
- [x] Crisis parity test between app and proxy term lists.
- [x] Demo data isolated with `is_demo`.
