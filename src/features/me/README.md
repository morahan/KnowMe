# me

Edit habits and reasons, **Get support** (always one tap away — SAFETY.md §5), privacy note, demo-data switch.
Tracked habits (presets like Alcohol/Nicotine/Scrolling and customs alike) can be renamed or removed under "Edit tags"; a renamed preset shows its new words everywhere via `habitLabel`, and removal is the same delete as untracking. Nothing tracked yet: no Edit tags link.
Reasons are universal by default; with 2+ habits tracked, an optional separate list per habit appears. With one habit it stays hidden.

Route: `app/(tabs)/me.tsx`. Uses: `db/repos/*`, `ui/QuietLink`.
Features don't import each other, so the route will pass the demo switch in as a prop (same pattern as Patterns + Reflect).
Custom habit editors also edit their local-only question phrase. Null legacy phrases start with the lowercase name. Raw names and phrases pass safety `guard()` before writes; edits preserve existing moments and reasons.
