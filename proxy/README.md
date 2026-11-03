# KnowMe proxy

One Vercel function, `POST /api/reflect`. Keeps the Llama key off the phone and runs crisis checks on input and output.

## Request / response
```
POST /api/reflect
{ "installId": "random-per-install", "summary": { ...ReflectionSummary } }

200 { "crisis": true }                       -> app shows the crisis card
200 { "crisis": false, "text": "..." }       -> app shows the letter
4xx/5xx { "error": "..." }
```

## Env vars (Vercel project settings)
| Var | Required | Default |
|---|---|---|
| `LLAMA_API_KEY` | yes | — |
| `LLAMA_BASE_URL` | no | `https://api.llama.com/compat/v1` (OpenAI-compatible) |
| `LLAMA_MODEL` | no | `Llama-4-Maverick-17B-128E-Instruct-FP8` |
| `RATE_LIMIT_PER_HOUR` | no | `10` per install, per warm instance |

The base URL and model name are unverified defaults. Check them against your Llama API account.

## Deploy
```
cd proxy
vercel link        # set Root Directory to proxy/
vercel env add LLAMA_API_KEY
vercel deploy
```
Then set `EXPO_PUBLIC_PROXY_URL` in the app's `.env` to the deployment URL.

## Logging
Token counts and error codes only. Never log the summary or the model output.
