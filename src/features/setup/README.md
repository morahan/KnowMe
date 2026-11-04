# setup

Pick what you're tracking, write 1–8 reasons why. Skippable. Route: `app/setup.tsx`.
Reasons are universal by default; with 2+ habits tracked, an optional separate list per habit appears. With one habit it stays hidden.

Custom habits include a local-only question phrase, prefilled with the lowercase name. Both inline Save and Done check raw names and phrases with safety `guard()` before saving.
Uses: `db/repos/habits`, `db/repos/reasons`, `ui/Chip`, `ui/PrimaryButton`, safety `guard()` on every reason.
