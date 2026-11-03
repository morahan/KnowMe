# demo-data

Seeds 21 days of realistic moments for the demo. Evening-heavy (7–10pm) so Patterns has something true to say.

- `logic.ts` — `generateDemoMoments()`: pure and deterministic (seeded), no db.
- `hooks.ts` — `seedDemoData()` / `clearDemoData()` via repos.
Status: generator done; seeding/isolation from real data — see TODO.md.
