export const copy = {
  title: 'Today',
  logoAlt: 'KnowMe gnome holding a lantern',
  imInIt: "I'm in it",
  daysSince: (n: number) => (n === 1 ? 'day since last time' : 'days since last time'),
  today: "Today's Activity",
  intensityWord: 'intensity',
  empty: 'Nothing noted today. That is fine.',
  loading: 'A moment…',
  noHabit: 'Nothing tracked yet.',
  setUp: 'Set up what you are tracking',
} as const;
