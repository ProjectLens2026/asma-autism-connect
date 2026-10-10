# Asma · اسما

A small, dependency-free, mobile-first PWA for caregiver education and picture communication in Afghan Dari (`fa-AF`) and US English (`en-US`). Built from the supplied bilingual demo as a UI reference, with separate modules for content, audio, encrypted storage, and domain rules.

**Status: runnable engineering pilot, version 0.1.2. Not approved for clinical or public release.** No clinician review or native Dari language/audio review has occurred. The initial child context is age 11, minimally verbal, in Afghanistan; no real child identifiers or records are bundled.

## Open the standalone design preview

Double-click `Asma_Local_Preview.html`. No server, installation or login is needed. The dashboard and picture board are pre-rendered, so they remain visible even if a file viewer blocks JavaScript. Download and open the file in a browser for interactive controls. It includes the caregiver dashboard and picture board, plus sample lesson, Q&A, voice and review screens. Everything resets on reload; no real records are stored. Microphone access from a directly opened file depends on the browser—use the full localhost app if recording is unavailable. This preview is separate from the encrypted application.

Rebuild the self-contained preview with `npm run preview:build`. It embeds the existing local pictograms and content, makes no network requests, and never registers a service worker.

## Name update (0.1.2)

The app is named **Asma** in English and **اسما** in Dari. Existing local database identifiers and backup encryption format remain unchanged so previously saved records still open. The project folder remains `brighter-steps` for continuity; the displayed product name is Asma.

## Dashboard update (0.1.1)

The runnable dashboard now has full-card touch/keyboard targets for the current lesson, child board, observations, voice studio, Q&A and progress. Checkpoint cards open the matching 3/6-month notes. Counts reflect saved caregiver activity and recordings, not clinical ability. Email sign-in is not implemented: the existing passphrase opens device-local records.

To replace an earlier copy: stop CMD with Ctrl+C, extract this project, run `npm run build`, then `npm start`. Keep the same `http://localhost:4173` address to retain existing browser records. If an old installed version remains, open once online, close all tabs for this app and reopen to let the new service worker activate. Do not clear browser site data; that erases the vault.

## Run

Requires Node.js 22 or newer. There are no runtime packages to install.

```sh
cd brighter-steps
npm run build
npm test
npm start
```

Open **http://localhost:4173**. Use the picture board immediately, or create encrypted caregiver records using a passphrase of at least 12 characters and the parental-permission checkbox. Save the passphrase privately: there is no recovery service. The app initially opens in Dari; use the top language selector for English.

`npm run dev` serves source files for development. Rebuild after changing public content/assets to regenerate the service worker; during development, unregister an older worker in browser developer tools if it serves stale content.

## Implemented

- Responsive caregiver dashboard and separate, ungated child picture board with 12 original SVG pictograms. Water, food, help, stop, toilet, pain, more, yes, no, break, happy and together.
- Locale-specific UI, lessons, educational Q&A and voice keys. RTL uses logical layout properties. No fallback from Dari to Persian speech synthesis.
- Day selector for days 1–180, using **14 clearly labeled, repeatable draft activities**, not 180 unique or validated lessons. Caregiver completion tracking is separate from child observations.
- Six numbered educational questions, unscored and not retained. No screening, diagnosis, licensed instruments, treatment prescription or autism severity score.
- Functional observations with date, communication purpose, context, support and optional note; editable 3/6-calendar-month checkpoints; readable JSON/print progress export.
- Consent-gated, AES-GCM encrypted IndexedDB vault, passphrase-derived key, automatic locking, encrypted backup/restore, deletion, atomic cross-tab revision checks and visible save failures.
- Local adult voice recording (up to 10 seconds), listen-through then explicit caregiver approval; clips remain private and locale-specific. Permission failures leave the picture board usable.
- Optional device-local `en-US` TTS when a local voice is available. It is disabled by default. Generic Persian, remote TTS and automatic voice substitution are disabled.
- Build-hashed offline app cache, install manifest, self-hosted lightweight assets, print board for low-tech backup, optional persistent-storage request.
- Optional encrypted, device-local technical counters, disabled by default; only unlocked sessions and microphone setup errors. No child tap/behavior analytics, tracking SDK or external telemetry.
- Explicit content version/review status, sources, checked dates, review scopes; validated native-voice import tooling and a release check that currently fails deliberately.

## What remains before real use or release

1. An Afghan Dari native reviewer must correct and approve all strings and record/review the actual native voice pack. **No native recordings are included.** Caregiver clips are family-approved only, never presented as professional review.
2. A qualified professional must review age-appropriate content, accessibility of the communication system, the limited vocabulary and the intended pilot context. WHO CST targets ages 2–9; this is not the WHO program or an approved adaptation for age 11.
3. Browser automation is supplied but **was not executed in the build environment**. Unit/security/content tests ran; real browser layout, RTL, microphone, install and offline behavior remain to be verified. Run the suite and the manual device matrix below.
4. A complete six-month curriculum remains editorial/clinical work. The engineering planner supports daily delivery and review; repeating 14 modules does not replace that work.
5. There is no backend, sync, account recovery, cloud sharing, clinical screening or third-party analytics. If these are added, a separate consent/privacy/security design is required.

## Tests

```sh
npm run build
npm test                         # 33 Node tests; no extra packages
npm run validate                 # draft content allowed
npm run release:check            # expected failure until review/audio gates satisfied
```

Real browser tests (optional development dependency; not shipped to users):

```sh
npm install --no-save playwright@1.62.1
npx playwright install chromium
npm run test:browser
```

The browser script starts its own loopback server, tests both languages at 390/768/1280px, and writes screenshots to `test-results/`. It exercises consent, encryption-backed persistence, wrong-password handling, safe notes, microphone denial, child access and offline reload. Review screenshots manually. Additional Safari/Android and assistive-technology tests are mandatory; see `docs/TESTING_AND_ROLLOUT.md`.

## Deployment

Build and upload **only `dist/`** to a static HTTPS host. Use a stable dedicated origin; Web Crypto, service workers and microphone recording require a secure context (localhost is the development exception). The app also supports hosting under a directory if that entire directory is uploaded intact. Do not open `index.html` through `file://`.

Use access-controlled hosting for the private pilot. Client consent and vault encryption are not hosting authentication. Keep the `dist/_headers` security policy on hosts supporting that file; otherwise configure equivalent CSP, no-sniff, no-referrer, frame denial, microphone/self permission and HTTPS headers in the hosting platform. Do not add analytics scripts or CDN assets.

For a broad-release CI job, run `npm run release:check` **before** deployment. Draft builds are intentionally allowed for caregiver UI testing, so a normal build is not a release authorization. `release:check` verifies metadata, not the truth of human approval; require protected review/signoff in your process.

Open online once, wait for the offline-ready message, close/reopen and test airplane mode. Previously installed versions update after old tabs/windows close and the new worker activates. Preserve the origin and IndexedDB schema across updates. Never auto-import the original demo's plaintext records. Its data requires explicit caregiver-approved migration, which is not provided.

## Repository map

- `src/app.js`: application state, navigation, forms and rendering; no inline script execution.
- `src/domain.js`: pure validation, dates, selection rules and export shaping.
- `src/crypto.js`, `src/storage.js`: cryptography and atomic durable writes.
- `src/audio.js`: microphone lifecycle, approved playback, exact-locale TTS policy.
- `src/locales/`: complete locale UI dictionaries.
- `content/`: independently editable lessons, Q&A, sources and review/voice manifests.
- `public/icons/`: original local pictograms and install icons.
- `scripts/`: validation, build, restricted local server and reviewed voice import.
- `tests/`: Node regression suite and optional Playwright flows.
- `docs/`: security boundaries, voice process, prototype findings and staged testing.

The supplied `index.html` was studied, not copied into the application runtime. Its visual direction (calm green palette, sidebar, cards, parent/child spaces) and respectful communication principles are preserved. New local vaults intentionally use a different database from the demo.
