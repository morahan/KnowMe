# demo-data

Seeds 21 days of realistic moments for the demo. Evening-heavy (7–10pm) so Patterns has something true to say. A few gambling moments land on weekend evenings (`social`, `bored`) and seed onto a Gambling habit, so Patterns shows their different rhythm as its own series. Gambling is only added on an empty install; otherwise gambling moments seed only if Gambling is already tracked.

- `logic.ts` — `generateDemoMoments()`: pure and deterministic (seeded), no db.
- `hooks.ts` — `seedDemoData()` / `clearDemoData()` via repos.
Status: generator done; seeding/isolation from real data — see TODO.md.
