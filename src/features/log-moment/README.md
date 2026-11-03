# log-moment

The 10-second log: intensity 1–10, context, feelings, rode it out / used, what helped, optional note. One scrollable screen, chips grouped by question, Save pinned at the bottom. Haptic tick on save, then back to Today.

Route: `app/(tabs)/log.tsx`. Uses: `db/repos/moments`, `ui/IntensityPicker`, `ui/Chip`, safety `guard()` on the note **before** saving.
Status: placeholder screen — see TODO.md.
