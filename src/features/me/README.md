# me

Edit habits and reasons, **Get support** (always one tap away — SAFETY.md §5), privacy note, demo-data switch.
Reasons are universal by default; with 2+ habits tracked, an optional separate list per habit appears. With one habit it stays hidden.

Route: `app/(tabs)/me.tsx`. Uses: `db/repos/*`, `ui/QuietLink`.
Features don't import each other, so the route will pass the demo switch in as a prop (same pattern as Patterns + Reflect).
Status: Get support and privacy note work; editing and demo switch — see TODO.md.
