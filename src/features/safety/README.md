# safety

Crisis detection and the crisis card. The one feature every other feature may import.

- `logic.ts` — `isCrisis(text)`: local keyword check, no network. Terms in `crisisTerms.ts`.
- `SafetyProvider.tsx` — mounted in `app/_layout.tsx`. Exposes `guard()` and `showCrisisCard()`.
- `hooks.ts` — `useSafety()`. Call `guard(...texts)` on every free-text field **before** saving or sending. If it returns `true`, stop.
- `CrisisScreen.tsx` — full-screen card (988, 911, "Back"), rendered by `app/crisis.tsx`.

Rules: SAFETY.md §1. Never put this behind a network call. Never stub it.
The proxy keeps its own copy of the terms in `proxy/lib/crisis.ts`. Keep both in sync.
