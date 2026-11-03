# me

Edit habits and reasons, **Get support** (always one tap away — SAFETY.md §5), privacy note, demo-data switch.

Route: `app/(tabs)/me.tsx`. Uses: `db/repos/*`, `ui/QuietLink`.
Features don't import each other, so the route will pass the demo switch in as a prop (same pattern as Patterns + Reflect).
Status: Get support and privacy note work; editing and demo switch — see TODO.md.
