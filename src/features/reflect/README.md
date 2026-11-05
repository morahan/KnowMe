# reflect

The AI mirror. Lives inside the Patterns tab (no route of its own).

- `logic.ts` — `buildSummary()`: pure. Counts, hours, intensities, tags, the user's reasons. Raw notes only if `includeNotes`.
- Counts use `timesItPassed` / `timesYouDid` with unchanged `rode_it_out` / `used` semantics. Custom question phrases never enter the summary, even with notes enabled; the proxy validates the same contract.
- `hooks.ts` — `useReflection()`: loads data via repos, runs the local crisis guard, POSTs to `${EXPO_PUBLIC_PROXY_URL}/api/reflect`.
- One letter a day: the cached letter's date (`reflect_cache.at`) is checked against today's local date before any network call (`reflectedToday()`), so it resets at local midnight. Only a delivered letter is cached, so errors and the crisis card don't use up the day.
- `components/ReflectCard.tsx` — the button, "Include my notes" toggle, and the letter.

Only this feature talks to the network (STRUCTURE.md rule 6). Rules: SAFETY.md §2–4.
