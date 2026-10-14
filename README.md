# Asma 0.1.10 — My drink and automatic saving

The approved My drink concept is now the main activity: a three-scene photo walkthrough, large communication choices, a real-cup routine, and a one-tap caregiver observation. Earlier draft activities remain under a collapsed section.

- Start or continue from Today. Steps and observations save automatically on this browser; return later to continue. Child picture taps are not recorded.
- New records use automatic device access. Anyone using the same browser profile can open them. More offers optional password protection and a portable password-encrypted backup.
- Existing password-protected records require one unlock. Leave “Remember this device” checked to continue automatically afterward. Existing history is preserved.
- The full picture board remains available. No water, break or stopping is conditional on a tap or spoken word.
- English device voice is optional. Native Dari audio, native language review and clinical review remain pending. The water photo is an AI-generated illustration, not a demonstration video.
- Automatic access is local to this browser, not cloud sync. Clearing browser data removes records. Export a portable backup before moving devices.

## Windows update

1. In the old server window press Ctrl+C.
2. Copy the contents of this update into your existing brighter-steps folder. Replace matching files; keep .git.
3. Double-click START_ASMA.cmd, or run `npm run build` followed by `npm start`.
4. Close all old localhost tabs and open http://localhost:4173 in your normal browser.
5. The sidebar version should read v0.1.9. Keep browser data to preserve private records.

Tests: `npm test`; browser interaction suite: `npm run test:touch-browser` with Playwright and Chromium installed.

The Asma_Local_Preview.html file is an older standalone preview. Run the app at localhost to see this update.

---

## Earlier updates (historical notes; 0.1.10 behavior above takes precedence)

## Update 0.1.8 — seven-session learning flow

The main dashboard, Today and Plan now open a seven-session sequence. Three setup questions collect caregiver context; they do not diagnose, assign a level or automatically prescribe a program. The seven original draft sessions cover shared activity, choices, help, refusal, breaks, everyday picture use and reflection. Each has three caregiver instructions, optional child-board access and a functional observation at completion.

Progression rules:
- A session advances only after the caregiver records completion and the device’s local date is later than the last completion date. Missing days never skips sessions. Repeating is available on the same day.
- Before a new session, review the previous activity and choose to continue, repeat or rest. Declining and “not tried / unsure” are valid responses; no mastery score is calculated.
- Encrypted records retain setup, completed sessions, review observations and the current instruction. Old schema-1 records remain compatible; their old activity checkboxes are not treated as completion of this new curriculum.
- Password-only mode still locks private records on return from child mode. Automatic access mode keeps the saved place available.
- Public preview state lasts only in memory. Creating a new vault after consent transfers that preview’s progress; unlocking an existing vault uses its saved records. No cloud synchronization or teacher account sharing is implemented.
- After seven sessions the app offers reflection and repetition, not an unreviewed automatic 180-day prescription. The older activity collection remains a separate draft resource.

Content version for this curriculum: 0.1.0, authored 2026-10-12, clinical and native Dari reviewers null. Citations support broad educational principles, not efficacy of this particular sequence. Reviewed Dari recordings are still pending. No licensed clinical assessment or program is reproduced.

Update locally: stop the server with Ctrl+C; copy this ZIP’s contents into the existing project folder and replace matching files while retaining `.git`; run `npm run build` and `npm start`. Confirm `npm pkg get version` returns 0.1.8. Close old app tabs after loading the update and reopen. Keep localhost:4173 and do not clear browser data. Private browsing is for a visual check only, not durable family records.

Validation: automated navigation, both locale render paths, date and review gates, old data compatibility, encrypted round-trip, malformed records, offline asset packaging and existing security/content tests. Real browser and device visual testing was not performed in this environment.

Pilot gates: (1) caregiver usability on the actual phone/tablet, including unlock, resume and refusal/rest; (2) clinician and native Dari content/audio review; (3) small consented broader pilot with feedback; (4) product-release review. Do not present this build as clinically approved.

## Update 0.1.7 — one instruction per screen

Today’s guided Day 1 now walks the caregiver through three instruction screens for each activity, then an optional picture-board handoff and break. Each instruction shows what to do, what to say and the responses to accept. The child does not need to perform to continue. Returning from the board preserves the caregiver’s position. Preparation and the optional timer are expandable.

This changes the existing Day 1 experience; it does not add a reviewed 180-day curriculum. Dari and clinical review remain pending. Automated tests cover sequential navigation and return from the child board; real-device visual review is still required.

Stop the old server with Ctrl+C, replace matching project files, run `npm run build` then `npm start`. Verify `npm pkg get version` reports 0.1.7. Close old app tabs and reopen to activate the offline update. Do not erase browser storage.

## Update 0.1.6 — photographic examples, clearer Dari and activity collection

Six original AI-generated photographic assets replace the generic caregiver cartoons and five AAC card pictures (water, food, toilet, break and together). The household scenes depict fictional people from varied backgrounds; they are illustrative context, not records of actual patients or exact sequential demonstrations. Abstract AAC messages retain symbols and labels. The garden remains a separate optional symbolic play activity. Family recognition of food, toilet type and other examples must be checked; these images are not universal.

Assets live in public/photos/*.webp. They were made with the built-in image-generation tool; the complete final prompt set, creation date and draft review status are in content/photos.json. WebP encoding preserves the composition; the six assets total 545,862 bytes and are bundled in the offline cache. No external image requests occur.

A new public Activity collection exposes all 14 existing draft modules, without a passphrase. It does not add 14 new therapies or claim a complete 180-day course. Saved completion still requires private storage. Dari now has shorter navigation/action wording, larger text and more generous spacing; native Afghan Dari editorial review remains pending. Fonts use a local system fallback, without a network dependency.

Install by stopping the old server with Ctrl+C, replacing matching project files with this ZIP's contents, running npm run build and npm start. npm pkg get version should report 0.1.6. Keep the same localhost:4173 origin and do not clear browser data. Close all app tabs and reopen after the first online load to activate the update.

Validation: 54 automated checks passed, including all 14 public activity routes, image packaging, size budget, existing bilingual rendering and security regressions. Real browser/phone visual testing is still pending. Use the full npm app, not the older standalone preview, for these changes.

## Update 0.1.5 — approved blue layout and optional garden play

The working app now opens on a public dashboard with a navy sidebar, light-blue highlights and white cards. Dashboard, Today’s activities, Learning plan, Child space, Parent guide, Progress, Family settings, Observations, Voice and Sources are consistently reachable. On narrow screens, a Menu button expands the navigation; child mode never shows the parent sidebar.

The learning-plan page describes the current draft limits. The preview’s sample personalized pathway is not presented as a real recommendation. The ten-question intake and individualized curriculum remain future work. Records, audio and exports retain the existing consent/encryption gates.

Optional garden play is a session-only cause-and-effect activity: six plants cycle through three images when touched. No timers, scores, forced speech, correctness judgments, sound autoplay or tap analytics. Pictures and a caregiver return button remain directly accessible. It is recreational play, not an assessment or therapy claim.

Update: stop the running server with Ctrl+C, copy this archive’s contents directly into your existing brighter-steps folder, replace matching files, then run npm run build and npm start. npm pkg get version should show 0.1.5. If an old app is cached, load localhost:4173 once, close all its tabs and reopen. Do not clear browser data. The standalone Asma_Local_Preview.html is the older separate preview; use the npm app for this update.

Verification: 52 automated tests cover bilingual rendering, public/private routing, caregiver-child handoff, mobile menu state, optional garden play, timers, encryption and content validation. Real browser layout, touch and assistive-technology testing remain pending; the managed environment does not expose the required browser-QA capability.

## Update 0.1.4 — Today, demonstrations and child participation

Today now shows three directly accessible tasks with two optional breaks. Each task has three original illustrated frames, specific caregiver wording and acceptable responses. Optional timers start only on request; expiry never advances a task or limits access to communication. Breaks can be 5 or 10 minutes, shortened or extended. These are illustrative planning durations, not a recommended clinical dosage or a requirement to complete every task.

Child’s turn opens six large communication pictures (water, food, toilet, help, no and break). The full twelve-picture board remains accessible. Taps show the selected picture and use the existing approved recording/on-device English audio rules; they do not generate scores or persistent child analytics. Returning to the caregiver preserves the activity position and locks private records. Finishing early never marks the day complete.

The new illustrated flow is Day 1 only. Later days remain draft lesson modules. Professional videos, clinician review and native Dari narration are still pending. The original illustrations are captioned, offline demonstrations, not videos. The ASHA AAC source supports multimodal communication and continued access to AAC, not this session duration or approval of the app.

Update: stop the old server with Ctrl+C, copy this ZIP’s contents directly into the existing brighter-steps folder and replace matching files. Run `npm run build`, then `npm start`. Version should be 0.1.4. Open localhost:4173 once, close all app tabs and reopen to activate a waiting update. Do not clear browser data. Use the npm app for the new flow; Asma_Local_Preview.html is the older separate design preview.

Validation: 46 Node checks passed, including controller-level task/break transitions, child handoff, optional timer pause/expiry, early finish, bilingual content and existing security regressions. Real browser/device visual and touch testing has not been executed here. The browser suite has been updated for the new flow; caregiver device testing remains required.

## Update 0.1.3 — guided Day 1

The full localhost app now opens with an accessible Day 1 entry instead of the vault setup form. Start Day 1 opens three visual steps, with Back, Next and Finish controls. Pictures remain available without an account. Saving caregiver completion is optional and requires consent and an unlocked encrypted vault. Completing the guide does not record a child score. English and draft Afghan Dari are included. All new lesson wording remains pending clinician and native Dari review.

To update on Windows, stop the running server with Ctrl+C. Copy this archive’s contents into the existing brighter-steps project folder, replacing matching files. Keep the existing .git folder. Run `npm run build`, then `npm start`. Open localhost:4173 once, close all app tabs, and reopen it to activate a waiting service worker. Do not clear browser data. The earlier standalone Asma_Local_Preview.html is a separate design preview; use the npm app for this update.

Validation: 40 automated checks pass, including bilingual guide progression, content validation, encryption and existing regressions. Browser flow tests have been updated but have not been executed in this environment. Caregiver device testing and clinician/native Dari review are still required.

# Asma · اسما

A small, dependency-free, mobile-first PWA for caregiver education and picture communication in Afghan Dari (`fa-AF`) and US English (`en-US`). Built from the supplied bilingual demo as a UI reference, with separate modules for content, audio, encrypted storage, and domain rules.

**Status: runnable engineering pilot, version 0.1.8. Not approved for clinical or public release.** No clinician review or native Dari language/audio review has occurred. The initial child context is age 11, minimally verbal, in Afghanistan; no real child identifiers or records are bundled.

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
- AES-GCM encrypted IndexedDB vault with automatic device access or optional password protection; encrypted backup/restore, deletion, atomic cross-tab revision checks and visible save failures.
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
npm test                         # 54 Node tests; no extra packages
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
