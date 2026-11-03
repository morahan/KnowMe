# TODO.md

## Verify on a real device / account
- [ ] Verify Llama base URL and model name against the real account; deploy the proxy and set `EXPO_PUBLIC_PROXY_URL`. (Reflect's offline path is verified on both platforms; a live letter is not.)
- [ ] Check the largest Dynamic Type sizes on device (text scales by default; simulator pass was at default size).
- [ ] Android nav bar color in both schemes (status bar is themed via `expo-status-bar`; nav bar needs a device check).
- [ ] Splash background is a single dark `#0F1115` in `app.json` (Expo takes one color); check it reads fine in light mode.

## Device verification (2026-11-03, iPhone 17 Pro sim + Pixel 7 API 34 emu)
- [x] Full DEMO.md walk on iOS and Android with demo data: Setup → Today → Log → Save → I'm in it (breath, countdown, re-check save) → Me demo load → Patterns insights → crisis card (moment not saved) → Reflect offline error. Light theme rendered correctly on both.
- [x] Fixed on the way: unused `react-native-reanimated` broke CocoaPods; added `expo-dev-client`; moved splash to the `expo-splash-screen` plugin (Expo Doctor); Log Save stayed disabled after the first save (tabs stay mounted) — now reloads on focus; one inconsistent dedupe expectation in `habits.test.ts`.
- [ ] Android Device-panel streaming is unavailable in this environment (host `ffmpeg` PATH); the emulator was driven over adb instead. No app issue.

## Review leftovers (strict pass, 2026-11-03)
- [ ] Screen-level crisis tests (card renders, nothing persists, nothing is sent) need a React Native Testing Library or device harness. The pure decisions are unit-tested (`safety-cases.test.ts`, `classifyResponse`, proxy parity); screen wiring is code-inspected only.
- [ ] Proxy handler integration tests (mocked Llama fetch: 8KB rejection, 429, upstream error) are not automated. Crisis, prompt, and rate-limit units are tested; the handler order (crisis before rate limit before fetch) is inspected, not executed.
- [ ] With Reduce Motion on, the breath circle is still and shows no in/out word. Decide on device whether a static word would help or just add noise.
- [ ] `Chip` and other toggles announce as checkboxes; check VoiceOver/TalkBack reading order on device.

## If this ships beyond the demo
- [ ] Rate limit is per warm Vercel instance only. Use shared storage (e.g. Upstash) for a real limit.
- [ ] "How much can I safely use?" is handled by the system prompt only. Add a proxy-side dosing-phrase check if it ever matters.
- [ ] Light-theme polish pass; dark is the designed default.

## Done (kept for the record)
- [x] Scaffold, theme, data layer with repository unit tests.
- [x] Setup, Log, Today, I'm in it, Patterns, Reflect, Me, Safety, demo data.
- [x] Crisis parity test between app and proxy term lists.
- [x] Demo data isolated with `is_demo`.
