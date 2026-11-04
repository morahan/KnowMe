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
The summary contract is `days`, `habits`, `moments`, `timesItPassed`, `timesYouDid`, `averageIntensity`, `byHour` (24 counts), `peakHours`, `topContexts`, `topFeelings`, `topHelpers`, `reasons`, and optional `notes`. No/Yes counts keep the original database semantics. Custom question phrases are local-only and are not accepted fields. Invalid summaries return 400 before model calls. Deploy app and proxy together when updating these field names.

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

## Crisis checks (in order)
1. Keyword list (`lib/crisis.ts`, mirrors the app's) — instant, no network.
2. Model screen (`lib/screen.ts`) — one focused YES/NO call before writing. Fails closed: if it errors, no reflection.
3. Output check — the reflection's CRISIS token or crisis words.

Measure recall and false alarms after any model or prompt change:
```
DEEPINFRA_KEY_FILE=/path/to/key RUNS=3 node --experimental-strip-types proxy/eval/crisisEval.ts
```

## Logging
Token counts and error codes only. Never log the summary or the model output.

## Tests
From the repository root (the app Jest preset excludes proxy tests):
```
npx jest --config='{"testEnvironment":"node","transform":{"^.+\\.[jt]sx?$":"babel-jest"},"testMatch":["**/proxy/**/*.test.ts"],"testPathIgnorePatterns":["/node_modules/"]}' --runInBand
```
