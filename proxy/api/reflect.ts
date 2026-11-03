// POST /api/reflect  { installId, summary }  ->  { crisis: true } | { crisis: false, text }
// Logs nothing but token counts and errors (SAFETY.md §4).
import { inputIsCrisis, outputIsCrisis } from '../lib/crisis';
import { SYSTEM_PROMPT, userMessage } from '../lib/prompt';
import { allow } from '../lib/rateLimit';

const BASE_URL = process.env.LLAMA_BASE_URL ?? 'https://api.llama.com/compat/v1';
const MODEL = process.env.LLAMA_MODEL ?? 'Llama-4-Maverick-17B-128E-Instruct-FP8';
const MAX_BODY_BYTES = 16_000;

type ChatResponse = {
  choices?: { message?: { content?: string } }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.LLAMA_API_KEY;
  if (!apiKey) return json({ error: 'not configured' }, 500);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: 'too large' }, 413);

  let body: { installId?: unknown; summary?: unknown };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const { installId, summary } = body;
  if (typeof installId !== 'string' || !installId || typeof summary !== 'object' || summary === null) {
    return json({ error: 'installId and summary required' }, 400);
  }

  // Crisis first, before rate limits or network.
  if (inputIsCrisis(summary)) return json({ crisis: true });
  if (!allow(installId)) return json({ error: 'slow down' }, 429);

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage(summary) },
        ],
      }),
    });
    if (!upstream.ok) {
      console.error('llama error', upstream.status);
      return json({ error: 'upstream' }, 502);
    }
    const data = (await upstream.json()) as ChatResponse;
    console.log('tokens', data.usage?.prompt_tokens ?? 0, data.usage?.completion_tokens ?? 0);

    const text = data.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) return json({ error: 'empty' }, 502);
    if (outputIsCrisis(text)) return json({ crisis: true });
    return json({ crisis: false, text });
  } catch (err) {
    console.error('reflect failed', err instanceof Error ? err.name : 'unknown');
    return json({ error: 'failed' }, 502);
  }
}
