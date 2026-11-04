export const copy = {
  title: 'Today',
  logoAlt: 'KnowMe gnome holding a lantern',
  imInIt: "I'm in it",
  daysSince: (n: number) => (n === 1 ? 'day' : 'days'),
  today: "Today's Activity",
  intensityWord: 'intensity',
  rodeItOut: 'rode it out',
  used: 'used',
  empty: 'Nothing noted today. That is fine.',
  loading: 'A moment…',
  noHabit: 'Nothing tracked yet.',
  setUp: 'Set up what you are tracking',
} as const;
