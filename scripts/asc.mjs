#!/usr/bin/env node
// Minimal App Store Connect API client: `node scripts/asc.mjs GET /v1/apps?filter[bundleId]=...`
// Reads ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH from ~/.knowme/app-store-connect.env.
import { readFileSync } from 'node:fs';
import { sign } from 'node:crypto';
import { homedir } from 'node:os';

const env = Object.fromEntries(
  readFileSync(`${homedir()}/.knowme/app-store-connect.env`, 'utf8')
    .split('\n')
    .filter((l) => /^\w+=/.test(l))
    .map((l) => l.split(/=(.*)/s).slice(0, 2).map((s) => s.trim().replace(/^"|"$/g, ''))),
);
const b64 = (v) => Buffer.from(typeof v === 'string' ? v : JSON.stringify(v)).toString('base64url');

export function token() {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'ES256', kid: env.ASC_KEY_ID, typ: 'JWT' });
  const body = b64({ iss: env.ASC_ISSUER_ID, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' });
  const key = readFileSync(env.ASC_KEY_PATH.replace(/^~|\$HOME|\${HOME}/, homedir()));
  const sig = sign('sha256', Buffer.from(`${head}.${body}`), { key, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${sig.toString('base64url')}`;
}

export async function asc(method, path, body, attempt = 0) {
  const res = await fetch(path.startsWith('http') ? path : `https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  // App Store Connect answers 5xx while an upload is still processing; it clears in seconds.
  if (res.status >= 500 && attempt < 5) {
    await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
    return asc(method, path, body, attempt + 1);
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}\n${text}`);
  return json;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [method, path, body] = process.argv.slice(2);
  const out = await asc(method, path, body ? JSON.parse(body) : undefined);
  console.log(JSON.stringify(out, null, 2));
}
