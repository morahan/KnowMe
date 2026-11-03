# patterns

Local charts, max 4 sections: intensity over time, cravings by hour, top contexts/feelings, what helps. One plain sentence above each chart. No legends if avoidable.

Until the first real moment is logged, Patterns shows in-memory sample data under the title "Patterns - Sample Data" with a notice that the data and insights are examples. The first real (non-demo) moment replaces the sample entirely; demo rows never mix into real patterns, and the sample is never saved.

Route: `app/(tabs)/patterns.tsx`, which also passes `ReflectCard` in as `footer` (features don't import each other — see DECISIONS.md). The footer is hidden in sample mode so Reflect never runs on example data.
Uses: `db/repos/moments`, `lib/demoMoments`, `lib/stats`, `ui/Title`, `ui/Body`.
