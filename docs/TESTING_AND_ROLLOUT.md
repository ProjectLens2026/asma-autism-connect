# Verification and staged rollout

## Execution record — 2026-10-09

- `npm run build`: passed.
- `npm test`: 33 passed (including eight standalone-preview checks and five dashboard navigation checks); encryption/tamper rejection, domain rules, content/locale validation, static RTL/accessibility contracts, export minimization and service-worker policy simulations.
- Broad release validation: expected to fail for unreviewed lessons and missing approved native Dari voices. Tested as a negative gate.
- Preview interaction checks run in a simulated DOM; they do not verify rendered layout, real audio or browser permissions.
- Browser test suite is provided, **not executed**. The managed build environment did not expose the browser-control capability required by its preview instructions. No screenshots or device test results are claimed.
- No caregiver usability session, clinician review, penetration test, WCAG audit or clinical outcome study has occurred.

## Before caregiver usability testing

Run `npm run build`, `npm test`, and `npm run test:browser`. Inspect the six screenshots. Start with synthetic observations and adult test recordings. Do not equate successful engineering tests with safety or effectiveness.

Manual matrix: low-cost Android/Chrome; iPhone/Safari installed and browser; iPad/Safari; Windows Chrome/Firefox; narrow phone at 320/390px; tablet; desktop; 200% and 400% zoom; landscape; keyboard; VoiceOver/TalkBack; reduced motion and forced colors. Evaluate actual Afghan Dari shaping, reading order and mixed ISO dates/numbers. Original pictograms are an initial vocabulary aid, not an individually assessed AAC system; verify recognition and motor access.

Specific checks:

- First visit, deny consent: child board still works and no private vault is created.
- Wrong passphrase, locked reload, background/foreground, browser back-forward cache: caregiver notes never remain visible while locked.
- Two tabs editing: stale save fails visibly and cannot overwrite newer records. Re-unlock to continue.
- Cancel a microphone prompt, deny permission, approve it late after navigation, stop recording, background the app, exceed duration, fail storage. Verify the microphone indicator turns off and no unapproved clip reaches the board.
- Switch locale: Dari and English clips never cross. Without Dari audio, communicate visually. Check no `fa-IR` speech synthesis request occurs.
- English TTS absent or remote-only: no remote utterance; picture board remains usable. Test on-device English voices with airplane mode.
- Listen partially then navigate: recording stays unapproved. Re-recording resets prior approval.
- Quota exhausted/private browsing/storage denied: never display success for a failed write; leave communication accessible.
- Download encrypted backup, restore to another supported browser, verify audio codec compatibility and records; wrong/corrupt backup must not replace current records. Delete test vault and check next launch.
- Readable export/print contains only intended progress fields. Check no voice, consent or analytics leaks.
- Online initial install; airplane-mode reload; all pictures, lessons and saved records usable; reopen after app upgrade. Confirm cache size and startup time on a slow connection.
- Screen-reader labels, tab/focus order, focus visibility, child card target sizes, contrasts, RTL overflow, switch access, print readability. Assistive needs may require a different AAC layout/system.

## Gate 1 — caregiver usability

Owner: product lead with an authorized caregiver. Begin with the interface and adult test data. Obtain parental permission, explain draft status in Dari, and avoid collecting child identifiers. Test comprehension of consent, opening pictures, selecting no/stop, responding without speech pressure, a short recording, one observation, lock/unlock and offline use. Record practical barriers with the caregiver's permission. Do not label this clinical validation. Any real child participation must be supervised and comfortable, with communication needs met independently of the app.

Exit: caregiver can carry out essential flows; safety/privacy misunderstandings corrected; obvious accessibility and language defects resolved. Stop if the interface increases distress or delays meeting needs.

## Gate 2 — clinician and native-language review

Owner: qualified speech-language/AAC professional, clinician appropriate to the child's needs, and Afghan Dari reviewer. Review each lesson/Q&A, vocabulary, symbols, consent language, age appropriateness, functional observation categories and the specific home context. WHO material is for younger children; explicitly review adaptation for age 11. Review sources/scope/dates; capture actual reviewer/date/content version. No instrument is included; a future licensed screener must be a separate, professionally governed module.

Exit: documented review changes and signoffs for exact content/assets, individually suitable communication access, reviewed native recordings, and agreed support/referral arrangements. Do not promise a cure, speech timeline or measured clinical benefit from this build.

## Gate 3 — broader pilot

Owner: pilot lead with professional oversight. Use a small, consented cohort, predefined non-diagnostic feasibility outcomes and data minimization. Monitor usability, comfort, access, privacy failures and whether communication is supported across daily settings. Compare observations cautiously; app usage/completion is not clinical improvement. Review at three and six calendar months; these are checkpoints, not deadlines. Decide continuation/change with families.

Exit: no unresolved critical safety/privacy defects, stable device/offline performance, useful caregiver feedback, and a documented decision on scope. No unsupported efficacy claims.

## Gate 4 — later product release

Require complete curriculum scope, independently reviewed language/audio packs, browser and accessibility validation, security/privacy review for selected jurisdictions and hosting, operational ownership, support/contact process, content update/rollback policy and incident response. CI must block on `release:check` and tests. Reassess consent and legal requirements if remote accounts/data/analytics are introduced. Expand languages only through the same review and pilot process.
