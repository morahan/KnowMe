export const copy = {
  title: "You don't have to figure this out alone.",
  body: 'Someone is there right now, any time of day.',
  call988: 'Call 988',
  text988: 'Text 988',
  call911: 'Call 911 for an emergency',
  lifeline: 'Suicide & Crisis Lifeline',
  back: 'Back',
  noPhoneTitle: "This device can't place calls",
  noPhoneBody: (number: string) => `You can reach them at ${number} from any phone.`,
} as const;
