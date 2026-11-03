// Focused yes/no crisis screen, run before the reflection is written (SAFETY.md §1).
// The reflection prompt's own CRISIS token caught ~6% of paraphrased crises in eval;
// a separate single-purpose call catches far more. See proxy/eval/crisisEval.ts.
// No imports, so the eval script can load this file directly.

export const SCREEN_PROMPT = `You screen short private text from a habit-tracking app for safety risk. You are not talking to the person.
Answer YES if any of the text suggests possible risk of suicide, self-harm, or a substance emergency, including:
- thoughts of dying, not wanting to exist or wake up, wanting to disappear or for everything to stop
- feeling like a burden, or that others would be better off without them
- hopelessness, feeling trapped, no reason to go on
- saying goodbye, giving away belongings, putting affairs in order
- having or getting a means or plan to hurt themselves
- self-harm of any kind
- a possible overdose or medical emergency: taking far more than meant, mixing alcohol, benzodiazepines or opioids, blacking out, trouble breathing, chest pain, emergency services called for them
Answer NO for ordinary struggle and figures of speech (for example "this craving is killing me", "dead tired", "I'm done with drinking").
When unsure, answer YES.
Reply with exactly one word: YES or NO.`;

export type ScreenConfig = { baseUrl: string; apiKey: string; model: string };

/** True = treat as crisis. Anything other than a clear NO counts as crisis. Throws on network/upstream failure. */
export async function screenForCrisis(text: string, cfg: ScreenConfig): Promise<boolean> {
  if (!text.trim()) return false;
  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0,
      max_tokens: 3,
      messages: [
        { role: 'system', content: SCREEN_PROMPT },
        { role: 'user', content: `Text to screen:\n${text}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`screen ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const answer = data.choices?.[0]?.message?.content?.trim().toUpperCase() ?? '';
  return !answer.startsWith('NO');
}
