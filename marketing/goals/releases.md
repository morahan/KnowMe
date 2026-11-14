---
goal: releases
project: KnowMe
kind: releases
apps:
  - name: KnowMe
    ios: com.freiolabs.knowme
    android: com.freiolabs.knowme
---

# Release goal: KnowMe

The newest build of KnowMe on each store is always in one of two states:

- **Pending review.** Submitted and waiting on Apple or Google.
- **Accepted.** Approved, whether or not it is released yet.

This holds for the App Store and for Google Play separately. A newest build that
sits unsubmitted, or in any other state, misses the goal.

## Rejections

A rejection from either store is resolved, not left standing. Resolved means the
cause is fixed or answered and the build is back in review or accepted. An open
rejection misses the goal until then.

## How this file is used

The admin dashboard at admin.morahan.dev reads the block at the top of this file
and checks it against App Store Connect and Google Play. Change the goal here,
not in the dashboard.
