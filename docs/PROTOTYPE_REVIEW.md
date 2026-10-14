# Prototype findings and implementation choices

Reference studied: supplied `index.html` (37,566 bytes, current version read 2026-10-09), plus `WORK_HANDOFF.md`.

Preserved: calm green visual palette, sidebar/dashboard cards, separate parent/child concept, daily routine, six-month journey, numbered caregiver learning, picture communication, caregiver-recorded voice, bilingual RTL, no forced speech or withholding essentials.

Changed:

- Prototype kept progress in plaintext localStorage and audio blobs in an unencrypted separate database. New app uses one consent-gated encrypted vault and never reads the demo databases.
- Prototype used short `en`/`fa` runtime keys and generic English speech synthesis. New content/resources use exact `en-US`/`fa-AF`, with only an available on-device en-US voice and no Persian substitution.
- Prototype counted child taps and showed them alongside progress. New app does not retain taps; functional observations and caregiver task completion are distinct.
- Prototype's child view retained parent controls. New child screen has pictures and a return action that locks caregiver records; it does not show notes, scores or educational questions.
- Prototype saved a recording immediately for playback. New clips require full listening and explicit caregiver approval, and asynchronous cancellation closes late microphone streams.
- Prototype had a six-month outline but only day-one tasks. New planner supports 180 day slots and calendar checkpoints, with an honest 14-activity repeatable draft set. A fully reviewed six-month curriculum remains work.
- Sources now have IDs, checked dates, scope and version-linked review metadata. Actual reviewer names are pending, not fabricated.
- New modules add content validation/release gate, cryptographic tests, offline cache policy, backup/restore, permission/error handling and browser test instructions.

Deferred deliberately: diagnostic screening, clinical instruments, forced repetition, rewards tied to essential needs, broad multilingual rollout, remote child profiles, automatic diagnosis, AI classification, remote voice synthesis and claims of clinical validation.


## 0.1.10 My drink pilot
The new original draft lesson in src/drink.js uses the existing generated water illustration. It models a communication opportunity, accepts gestures or other communication, keeps water available without a performance requirement, and records only caregiver observations. It does not measure mastery or swallowing ability. English and Afghan Dari wording still require clinical/native-language review; no native Dari audio is claimed.

71 automated checks pass, including encrypted automatic reopen, existing password-vault migration, optional password protection and stale-save rejection. Browser/touch device verification remains pending; run npm run test:browser with Playwright Chromium installed.
