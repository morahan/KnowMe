# patterns

Local charts, max 4 sections: intensity over time, cravings by hour, top contexts/feelings, what helps. One plain sentence above each chart. No legends if avoidable.

Route: `app/(tabs)/patterns.tsx`, which also passes `ReflectCard` in as `footer` (features don't import each other — see DECISIONS.md).
Uses: `db/repos/moments`, `lib/stats`, `ui/Title`, `ui/Body`.
Status: empty state only — see TODO.md.
