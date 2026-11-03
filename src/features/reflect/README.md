# reflect

The AI mirror. Lives inside the Patterns tab (no route of its own).

- `logic.ts` — `buildSummary()`: pure. Counts, hours, intensities, tags, the user's reasons. Raw notes only if `includeNotes`.
- `hooks.ts` — `useReflection()`: loads data via repos, runs the local crisis guard, POSTs to `${EXPO_PUBLIC_PROXY_URL}/api/reflect`.
- `components/ReflectCard.tsx` — the button, "Include my notes" toggle, and the letter.

Only this feature talks to the network (STRUCTURE.md rule 6). Rules: SAFETY.md §2–4.
