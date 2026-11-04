# KnowMe Privacy Policy

_Last updated: version 0.0.1 launch. Host this file at a public URL and link it in
App Store Connect and Google Play Console before submitting._

## The short version

KnowMe stores your journal on your phone, and only on your phone. We have no accounts,
no servers holding your journal, no analytics, and no advertising. We cannot see what
you log, and neither can anyone else through us.

## What KnowMe stores, and where

Everything you enter — the habits you track, your reasons, your logged moments, and your
settings — is stored in a single database on your device (on-device SQLite). It is never
uploaded, synced, or backed up by KnowMe. On Android, system cloud backup of the app
database is disabled. If you delete the app, this data is deleted with it.

## The one exception: Reflect (only when you tap it)

Nothing leaves your phone unless you tap **Reflect**. When you do, KnowMe builds a brief,
anonymous summary of your week on the device — counts of moments, times of day, intensity
averages, your most common contexts, feelings and helpers, the habits you track, and the
reasons you wrote to be shown back to you — and sends that summary over an encrypted
(HTTPS) connection to our small proxy, which asks a Meta Llama model to write a short
reflection. Key facts:

- Your free-text notes are **not** included unless you switch on "Include my notes" for
  that single reflection.
- The proxy stores nothing. It records only anonymous operational counts (tokens, errors)
  and never the summary, the reflection, or any identifier for your journal.
- The reflection is returned to your phone and kept only there.
- A random per-install identifier is used solely to rate-limit Reflect requests.

Patterns, charts, logging, and the "I'm in it" breathing flow all work entirely offline
and never send anything anywhere.

## Crisis safety

If text you type suggests you may be in crisis, KnowMe shows support resources (such as
988 in the US) on the device before anything is saved or sent. Crisis text is not stored
or transmitted by KnowMe.

## No tracking, no third parties

KnowMe contains no analytics SDKs, no advertising, no social features, and no third-party
trackers. We do not sell, share, or rent any information — we do not have it to share.

## Payments

KnowMe is sold for a one-time price through the Apple App Store or Google Play. Your
payment is processed entirely by Apple or Google under their terms; KnowMe never sees or
stores your payment details.

## Children

KnowMe is intended for adults (18+) and is not directed at children.

## Changes

If this policy changes materially, the update will be described in the app's release
notes and this page will be updated before the change takes effect.

## Contact

Questions about privacy: use the support contact listed on KnowMe's store page.
