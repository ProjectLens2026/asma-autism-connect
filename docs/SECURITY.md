# Security and data handling

## Data inventory

The app does not ask for names, precise age, birth date, location, diagnosis, a child account, contacts, photos or school. A caregiver may enter sensitive information in notes despite guidance, so all saved data is treated as sensitive.

One IndexedDB value holds encrypted consent timestamp/version, start date, caregiver activity completions, functional observations, checkpoint notes, audio clips, preferences and optional technical counters. Educational Q&A is static and unscored. Child selections are temporary display state only and are never written to the vault or telemetry. The service worker caches public application files only; it does not cache vaults, exports, audio recordings or remote URLs.

## Cryptography and access

- Web Crypto AES-256-GCM; fresh random 96-bit IV per write, authenticated schema context.
- New records default to a random non-extractable AES key stored in the same IndexedDB database as the ciphertext. This enables automatic saving and reopening, but anyone with access to the browser profile can open records. Encryption in this mode is not a password barrier.
- Optional password-only mode uses PBKDF2-HMAC-SHA256, 600,000 iterations and a random 128-bit salt. Switching to this mode re-encrypts records and removes the stored device key atomically. Passphrases are never stored.
- Existing password records need an unlock before enabling automatic access. The checked remember-device control states the shared-browser consequence. Saving and child-mode return do not lock automatic-access records; password-only mode retains five-minute, background and child-return locking.
- Portable backups always use a caregiver-chosen password. Device-only envelopes are not offered as portable backups. Missing or corrupt device keys never silently reset records; recovery requires an existing portable backup.
- Atomic IndexedDB compare-and-swap revisions reject stale writes from another tab. Errors are visible; re-unlock to read the latest state. Transactions resolve on completion, not request success.
- Backups contain ciphertext. Restore requires the correct passphrase, schema validation and explicit replacement confirmation before an atomic write. Unsupported/corrupt/wrong-password backups cannot overwrite existing records.
- Readable progress exports and printed reports intentionally leave encryption; they require a warning and exclude voice, consent and analytics. The caregiver controls any sharing.
- Record deletion removes live browser values; storage engines, operating-system backups and already downloaded exports may retain copies. Browser deletion is not a guarantee of forensic erasure. No password recovery, remote wipe or cloud recovery exists.

## Threat boundaries

Password-only mode protects stored browser values against casual inspection without the passphrase. Automatic access does not provide that protection. Does not protect an unlocked screen, compromised device, malicious browser extension, compromised deployment supply chain, same-origin injected code, keylogging or an attacker with the passphrase. Strong CSP and escaped free text reduce attack surface; these are not a penetration test or legal compliance certification. Host on a dedicated HTTPS origin with access controls for the pilot. Avoid shared public devices and use OS locking/encryption.

Microphone access is requested only by a caregiver action after a separate speaker-permission checkbox. No camera/location permission. Streams stop on completion, cancellation, error, hiding or leaving the screen. A late permission response after cancellation is immediately stopped. Record adults, never children. MediaRecorder supports available WebM/MP4/Ogg; some browsers may not record or replay every codec.

Local-only counters are opt-in and limited to technical session and microphone setup counts. No outbound analytics endpoint exists. Turning counters off resets them. Server/CDN access logs are a separate deployment concern; minimize retention and do not add user identifiers.

## Change control

Schema 1 rejects incompatible backups. Add an explicit migration and tests before changing it; do not silently reset private records. Bump application/content versions independently when needed and regenerate the service worker. Human approval must refer to the exact reviewed content commit. Adding accounts, remote storage, remote speech synthesis, photos or clinical screening requires a new design review and consent scope.
