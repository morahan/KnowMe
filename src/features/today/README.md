# today

Days since last time per habit (big and centered, singular for one day), today's activity in quiet text without outcome labels, and the **I'm in it** button — the only accent-filled thing on the screen. The last-time query still selects stored `used` moments. After setup, a quiet "Where to start" note points to Me until it is dismissed or followed (`today_welcome_dismissed` setting).

Route: `app/(tabs)/index.tsx`. Uses: `db/repos/moments`, `db/repos/habits`, `ui/Stat`, `ui/PrimaryButton`.
