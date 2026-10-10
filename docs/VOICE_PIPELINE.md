# Native voice and content review

No professionally reviewed voice pack is bundled. Empty `content/voices.json` is deliberate; the child never receives a mislabeled generated Persian voice.

## Personal caregiver voice

1. An authorized caregiver unlocks the vault and selects the exact language.
2. Obtain the adult speaker's permission; record only the relevant card label in a quiet setting. Do not record a child or identifying family conversation.
3. Record up to 10 seconds. Permission denial, unsupported recorder, cancellation and storage errors are visible; pictures remain available.
4. Listen through the entire clip. Then explicitly approve its use for the card.
5. The encrypted clip is available only for its matching locale/card. Re-recording resets approval. Personal approval is not clinical or independent language review.

## Distributed native pack

1. Recruit and compensate a native Afghan Dari speaker and an independent Afghan Dari reviewer. Confirm dialect/word choice with the pilot caregiver. A generic Persian speaker/voice does not satisfy this step.
2. Record the exact approved card labels from `content/cards.json`; prefer short mono speech without music or effects. Keep each asset below 2 MB and 10 seconds. MP3 or AAC/M4A is recommended for cross-device playback, but verify actual devices.
3. Obtain written permission for distribution and agreed retention. Keep real identities and consent documents outside this public repository. The manifest stores a consent reference, not the document.
4. Reviewer checks pronunciation, card meaning, naturalness, volume, intelligibility, clipping, background speech and whether it fits the caregiver's dialect. Listen on a low-cost Android speaker and iPhone/iPad.
5. Create an approval file outside this repository:

```json
{
  "sourceFile": "/absolute/reviewed-water.mp3",
  "locale": "fa-AF",
  "nativeLocale": "fa-AF",
  "cardId": "water",
  "reviewer": "approved-reviewer-reference",
  "reviewDate": "2026-10-09",
  "speakerConsentId": "permission-reference",
  "durationSeconds": 1.4
}
```

The date/references above are examples, not existing signoffs.

```sh
node scripts/approve-voice.mjs /absolute/approval.json
npm run validate
npm run build
```

The importer copies an already human-reviewed file to a content-hashed path and records SHA-256 plus review provenance. It does not perform linguistic review or audio decoding; verify duration/content yourself. The validator rejects unknown locales/cards, unsafe paths, duplicate assets, missing provenance, size violations and hash mismatch. Do not commit unapproved raw voice files in `public/`.

After all required Dari cards and content are reviewed, update `content/review.json` and each lesson/Q&A status/version, with real named or traceable reviewer references and dates. Protect these changes in source review. Run `npm run release:check` and all tests. A metadata pass alone is not permission to release.

## Locale roadmap

Initial release locales remain `fa-AF` and `en-US`. Later: Iranian Persian (separate `fa-IR`), Arabic (choose regional variant), French, German, Urdu, Hindi and Spanish (choose target regions). Each needs its own strings, lesson adaptation, QA, native audio provenance, font/RTL checks where relevant, and pilot consent. Never alias `fa-AF` to `fa-IR` or use a Persian TTS fallback. No remote TTS is enabled in this version.
