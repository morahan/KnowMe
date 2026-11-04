# me

Edit habits and reasons, **Get support** (always one tap away — SAFETY.md §5), privacy note, demo-data switch.
Tracked habits (presets like Alcohol/Nicotine/Gambling and customs alike) can be renamed or removed under "Edit tags"; a renamed preset shows its new words everywhere via `habitLabel`, and removal is the same delete as untracking; every removal asks first (a native confirm, no red) because it takes that habit's moments and reasons with it. Nothing tracked yet: no Edit tags link.
Reasons are universal by default; with 2+ habits tracked, an optional separate list per habit appears. With one habit it stays hidden.

Route: `app/(tabs)/me.tsx`. Uses: `db/repos/*`, `ui/QuietLink`.
Features don't import each other, so the route will pass the demo switch in as a prop (same pattern as Patterns + Reflect).
Status: Get support and privacy note work; editing and demo switch — see TODO.md.
