# TODO.md

## Verify on a real device / account
- [ ] Visually check the softened layered BreathCircle through full cycles on iOS and Android in dark/light mode, with Reduce Motion and large text; agent device access was disabled during this polish pass (2026-11-03).
- [x] Proxy live on DeepInfra Llama 3.3 70B; a live letter returns 200 (2026-11-03).
- [ ] Check the largest Dynamic Type sizes on device (text scales by default; simulator pass was at default size).
- [ ] Android nav bar color in both schemes (status bar is themed via `expo-status-bar`; nav bar needs a device check).
- [ ] Splash background is a single dark `#0F1115` in `app.json` (Expo takes one color); check it reads fine in light mode.

## Device verification (2026-11-03, iPhone 17 Pro sim + Pixel 7 API 34 emu)
- [x] Full DEMO.md walk on iOS and Android with demo data: Setup → Today → Log → Save → I'm in it (breath, countdown, re-check save) → Me demo load → Patterns insights → crisis card (moment not saved) → Reflect offline error. Light theme rendered correctly on both.
- [x] Fixed on the way: unused `react-native-reanimated` broke CocoaPods; added `expo-dev-client`; moved splash to the `expo-splash-screen` plugin (Expo Doctor); Log Save stayed disabled after the first save (tabs stay mounted) — now reloads on focus; one inconsistent dedupe expectation in `habits.test.ts`.
- [ ] Android Device-panel streaming is unavailable in this environment (host `ffmpeg` PATH); the emulator was driven over adb instead. No app issue.

## Android emulator walk (2026-11-04, Pixel 7 AVD, Android 16 / API 36)
- [x] Onboarding (Next/Back/Skip, slide 4 scrolls) → Setup incl. "Something else" custom habit → Me (habits, reasons, demo load/clear, 988 opens dialer, Tell someone opens share sheet, "How KnowMe works" replay) → I'm in it (picker, reasons, breath, re-check save) → Log (long custom feeling + quick tag, Used hides helpers, note, save; real Gboard keeps field and Save visible) → Patterns → Reflect (live letter names peakHours) → crisis note and crisis reason (card first, nothing saved, Text 988 opens Messages, hardware Back closes the card).
- [x] Fixed on the way: leaving Setup by hardware Back kept re-opening it on every launch; "1 days"; auto tag cut mid-word ("a deadline at work t").
- [ ] Single-select chips (Log "Which one?", I'm in it picker) still announce as checkboxes on TalkBack (see the Chip item below).

## iOS sim walk (2026-11-03, iPhone 18 Pro sim, iOS 27.2)
- [x] Setup (incl. per-habit reasons) → Today → I'm in it (picker, per-habit reason, helpers, re-check save) → Log (custom tag, save) → Patterns (empty-ish and demo) → Reflect (live letter) → crisis note (card first, nothing saved) → Me (habits, demo load/clear) → onboarding (fresh install).
- [x] Support links and the crisis card's call/text buttons show the number in an alert where there is no Phone app (verified on the iOS sim).
- [x] Patterns "What helps" lists how many rode-out moments each helper showed up on, not an always-100% rate.
- [x] Reflect summary carries `peakHours` ("8pm to 11pm"), the same window Patterns names, derived from byHour (SAFETY §4: hours). The proxy field guide mentions it; redeploy the proxy to pick that up (the field reaches Llama either way). The window still differs from Patterns' (7 vs 90 days) by design.
- [x] Log's "Other" input shows one counter; the 140 limit appears only once text runs long.
- [x] Intensity insight uses whole numbers.
- [x] Hour insight waits for 5 moments and says "Most" only when the window holds over half.

## Review leftovers (strict pass, 2026-11-03)
- [x] Screen-level crisis tests added with React Native Testing Library (`LogMomentScreen.test.tsx`, `CrisisScreen.test.tsx`): card renders with 988/911/Back, a crisis note persists nothing, an ordinary note saves. Device-verified on both platforms too.
- [ ] Proxy handler integration tests (mocked Llama fetch: 8KB rejection, 429, upstream error) are not automated. Crisis, prompt, and rate-limit units are tested; the handler order (crisis before rate limit before fetch) is inspected, not executed.
- [ ] With Reduce Motion on, the breath circle is still and shows no in/out word. Decide on device whether a static word would help or just add noise.
- [ ] `Chip` and other toggles announce as checkboxes; check VoiceOver/TalkBack reading order on device.

## If this ships beyond the demo
- [ ] Crisis eval (`proxy/eval/crisisEval.ts`) is ~70 English phrases written by us, not a clinical validation. Grow it with real-world phrasing (and other languages) and have someone with crisis-line experience review the screen prompt.
- [ ] Clef (Cloudflare decision model on DeepInfra) scored 91–96% recall vs the Llama screen's 96% and missed "standing at the edge of the balcony"; revisit if latency or cost matters.
- [ ] Rate limit is per warm Vercel instance only. Use shared storage (e.g. Upstash) for a real limit.
- [ ] "How much can I safely use?" is handled by the system prompt only. Add a proxy-side dosing-phrase check if it ever matters.
- [ ] Light-theme polish pass; dark is the designed default.

## Done (kept for the record)
- [x] Scaffold, theme, data layer with repository unit tests.
- [x] Setup, Log, Today, I'm in it, Patterns, Reflect, Me, Safety, demo data.
- [x] Crisis parity test between app and proxy term lists.
- [x] Demo data isolated with `is_demo`.
