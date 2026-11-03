# log-moment

The 10-second log: intensity 1–10, context, feelings, rode it out / used, what helped, optional note. One scrollable screen, chips grouped by question, Save pinned at the bottom. Haptic tick on save, then back to Today. Feelings/helpers: tapping Other opens a custom-tag input (tag capped at 20 chars, max 3 custom per group; custom chips tap to remove). Both Other fields take 140 chars; past 20, "Save for quick tagging" offers the auto-filled 20-char tag for editing before Add (per-group state).

Route: `app/(tabs)/log.tsx`. Uses: `db/repos/moments`, `ui/IntensityPicker`, `ui/Chip`, safety `guard()` on the note **before** saving.
Status: placeholder screen — see TODO.md.
