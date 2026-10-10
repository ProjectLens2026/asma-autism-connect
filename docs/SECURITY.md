# Security and data handling

## Data inventory

The app does not ask for names, precise age, birth date, location, diagnosis, a child account, contacts, photos or school. A caregiver may enter sensitive information in notes despite guidance, so all saved data is treated as sensitive.

One IndexedDB value holds encrypted consent timestamp/version, start date, caregiver activity completions, functional observations, checkpoint notes, audio clips, preferences and optional technical counters. Educational Q&A is static and unscored. Child selections are temporary display state only and are never written to the vault or telemetry. The service worker caches public application files only; it does not cache vaults, exports, audio recordings or remote URLs.

## Cryptography and access

- Web Crypto AES-256-GCM; fresh random 96-bit IV per write, authenticated schema context.
- PBKDF2-HMAC-SHA256, 600,000 iterations, random 128-bit per-vault salt. Passphrase/key never written to storage. Minimum length 12 is a floor, not assurance of strength; use several unrelated words.
- The key and decrypted vault exist in memory while unlocked. Lock after five minutes of inactivity, page hiding or page exit. Opening the child board preserves its approved voices during that unlocked session; returning to caregiver pages locks and requires reauthentication.
- Returning from background removes personal recordings until unlock. The picture board remains available. This privacy/usability tradeoff must be tested with the caregiver; do not extend retention silently.
- Atomic IndexedDB compare-and-swap revisions reject stale writes from another tab. Errors are visible; re-unlock to read the latest state. Transactions resolve on completion, not request success.
- Backups contain ciphertext. Restore requires the correct passphrase, schema validation and explicit replacement confirmation before an atomic write. Unsupported/corrupt/wrong-password backups cannot overwrite existing records.
- Readable progress exports and printed reports intentionally leave encryption; they require a warning and exclude voice, consent and analytics. The caregiver controls any sharing.
- Record deletion removes live browser values; storage engines, operating-system backups and already downloaded exports may retain copies. Browser deletion is not a guarantee of forensic erasure. No password recovery, remote wipe or cloud recovery exists.

## Threat boundaries

Protects stored browser values against casual inspection without the passphrase. Does not protect an unlocked screen, compromised device, malicious browser extension, compromised deployment supply chain, same-origin injected code, keylogging or an attacker with the passphrase. Strong CSP and escaped free text reduce attack surface; these are not a penetration test or legal compliance certification. Host on a dedicated HTTPS origin with access controls for the pilot. Avoid shared public devices and use OS locking/encryption.

Microphone access is requested only by a caregiver action after a separate speaker-permission checkbox. No camera/location permission. Streams stop on completion, cancellation, error, hiding or leaving the screen. A late permission response after cancellation is immediately stopped. Record adults, never children. MediaRecorder supports available WebM/MP4/Ogg; some browsers may not record or replay every codec.

Local-only counters are opt-in and limited to technical session and microphone setup counts. No outbound analytics endpoint exists. Turning counters off resets them. Server/CDN access logs are a separate deployment concern; minimize retention and do not add user identifiers.

## Change control

Schema 1 rejects incompatible backups. Add an explicit migration and tests before changing it; do not silently reset private records. Bump application/content versions independently when needed and regenerate the service worker. Human approval must refer to the exact reviewed content commit. Adding accounts, remote storage, remote speech synthesis, photos or clinical screening requires a new design review and consent scope.
