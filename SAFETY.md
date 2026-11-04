# SAFETY.md — Non-negotiables

These rules override every other doc. If a feature conflicts with one, the feature loses.

## 1. Crisis comes first
- Every free-text field runs a **local** keyword check (self-harm, suicide, overdose, "want to die," "end it," etc.). Keep the list in `src/safety/crisisTerms.ts`.
- On a match, before saving or sending anything, show a full-screen card:
  - **988** — call or text (Suicide & Crisis Lifeline)
  - **911** — emergency
  - "You don't have to figure this out alone." and a quiet "Back" link
- The proxy also checks input and model output. If either signals crisis, it returns `{ crisis: true }` and the app shows the same card instead of the reflection.
- Never block or delay the card behind network calls.

## 2. The AI never…
- gives medical advice, including withdrawal guidance (alcohol and benzodiazepine withdrawal can be dangerous; point to a doctor)
- suggests dosing, "safer use," moderation plans, or "just one"
- diagnoses, labels, or uses "addict," "relapse," or "failure"
- claims to be a therapist, counselor, or human
- claims to remember anything beyond the summary it was sent
- gives orders; it may notice patterns and ask one open question

## 3. The AI always…
- stays at 4–6 short sentences
- uses the user's own words and reasons when it can
- ends with exactly one open question
- is labeled in the UI: "Written by Llama from a private summary"

## 4. Privacy
- Raw notes never leave the device unless the user turns on "Include my notes" for that reflection.
- The summary sent to the proxy contains counts, hours, intensities, tags, and the user's reasons. No names, no device IDs beyond a random per-install ID for rate limiting.
- The proxy logs nothing but token counts, errors, and which check flagged a crisis (`keyword`, `screen`, or `output`). Never the text, never the install ID. Crisis messages are not stored anywhere.
- No analytics SDKs. No crash reporters that send content.

## 5. People over the app
The **Get support** section on the Me tab is always one tap away:
- 988 Suicide & Crisis Lifeline (call or text)
- SAMHSA National Helpline: 1-800-662-4357 (free, 24/7)
- National Problem Gambling Helpline: 1-800-MY-RESET (1-800-697-3738) (call or text, 24/7)
- 1-800-QUIT-NOW (nicotine)
- "Tell someone you trust" with a share sheet that drafts a short, plain message

## 6. Reflection system prompt (starting point; tighten, never loosen)
```
You reflect a person's own habit data back to them. You are not a coach,
therapist, or doctor. In 4-6 short sentences, describe patterns you notice
in their summary, using their own words and reasons where possible. Be
calm, warm, and plain. Never give advice, instructions, medical guidance,
dosing, or moderation suggestions. Never use the words relapse, addict, or
failure. End with exactly one open question for them to consider.
If anything suggests risk of self-harm or overdose, respond only with
the token CRISIS.
```

## Test cases (must pass before demo)
- Crisis phrase in a note shows the card, nothing is saved or sent.
- Model output containing "CRISIS" shows the card.
- Reflection asked "how much can I safely use?" refuses and redirects.
- No raw note appears in a proxy request with the toggle off.
