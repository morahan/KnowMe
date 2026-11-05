export const copy = {
  title: 'Reflect',
  intro: 'A short note about your week, written from a private summary.',
  button: 'Reflect on my week',
  loading: 'Reading your week…',
  // Shown one at a time while Reflect waits. Only describe what the summary really holds.
  loadingLines: [
    'Reading a private summary of your week…',
    'Noticing when the moments came up…',
    'Thinking about the reasons you wrote…',
  ],
  includeNotes: 'Include my notes',
  includeNotesHint: 'Off by default. Your notes stay on this phone unless you turn this on.',
  attribution: 'Written by Llama from a private summary',
  error: "Couldn't reach Reflect right now. Your patterns are all still here.",
  // One letter a day; the count resets at the user's local midnight.
  limited: "You've had today's letter. Try again tomorrow for a new one.",
} as const;
