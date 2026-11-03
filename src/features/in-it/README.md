# in-it

Full screen, no tab bar. With 2+ habits tracked, a "Which one?" pick comes first — one tap tags the moment and starts the breathing. A single habit skips the pick. Then: reasons fade in one at a time, top 3 helpers for that habit, the breath circle in the center, a small muted 20-minute timer, then "Where's it at now?".
The picked habit's own reasons show when it has any; otherwise the universal reasons show. With one habit, only the universal reasons show.

Route: `app/in-it.tsx`. Uses: `db/repos/habits`, `db/repos/reasons`, `db/repos/moments` (top helpers), `ui/BreathCircle`.
Status: breath circle works; reasons, helpers and timer — see TODO.md.
