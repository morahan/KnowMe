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
  getStarted: 'Get started',
  welcomeTitle: 'Where to start',
  welcomeBody:
    'Make KnowMe yours in Me: choose what you track and write your reasons. When an urge comes, tap I\'m in it. Log is for noting a moment after.',
  welcomeOpenMe: 'Open Me',
  welcomeDismiss: 'Got it',
} as const;
