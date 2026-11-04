export const copy = {
  skip: 'Skip',
  back: 'Back',
  next: 'Next',
  start: 'Choose what you are tracking',
  gnomeAlt: 'KnowMe gnome holding a lantern',
  todayFrame: 'On Today',
  todayFrameAlt: "A picture of the I'm in it button on Today. It is not a button here.",
  progress: (n: number, total: number) => `${n} of ${total}`,
  slides: [
    {
      bubble: 'Hello. I hold the lantern, not the lecture.',
      title: 'A quiet place to notice a habit',
      body: 'KnowMe helps you notice when a craving shows up, and what helps. It shows you your own patterns. It never tells you what to do.',
      hint: 'Everything stays on this phone. No account.',
    },
    {
      bubble: 'In a hard moment, start here.',
      title: "When it's hard, tap I'm in it",
      body: 'That button is on Today, the first tab. It shows your own reasons, what has helped before, and one slow breath at a time.',
      hint: "I'm in it",
    },
    {
      bubble: 'A few seconds now. A clearer picture later.',
      title: 'Note the moment, then see the pattern',
      body: 'Log asks how strong it is, where you are, and what helped. Patterns turns those notes into plain sentences, like the one below.',
      hint: 'Most of your cravings land between 7 and 10 in the evening.',
    },
    {
      bubble: 'Four places. That is the whole map.',
      title: 'Finding your way',
      body: 'The tabs at the bottom are all there is. Reflect sits inside Patterns, when you want a short note on your week.',
      hint: '',
    },
  ],
  tabs: [
    { label: 'Today', body: "Home. Your days, today's moments, and I'm in it." },
    { label: 'Log', body: 'Note a moment in a few seconds.' },
    { label: 'Patterns', body: 'Your charts, plain sentences, and Reflect.' },
    { label: 'Me', body: 'Your reasons, support, and privacy.' },
  ],
} as const;
