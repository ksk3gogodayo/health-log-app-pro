# QR medication import

The initial release imports core JAHIS TC03–TC08 dispensing records via a photo (native mobile camera) or JPEG/PNG/WebP screenshot. Processing is local; no image upload, OCR service, Mynaportal PIN, token, cookie or login automation is used. PDF/XML and direct Mynaportal API synchronization are deferred. See https://img.myna.go.jp/manual/03-01/0041.html for the official QR export workflow.

## UI and compatibility

Settings → 薬をQRから取り込む → capture/select ONE QR per image → repeat for split codes → review → choose rows and optionally link an existing checklist name or create one → confirm ownership and save.

Only dispensing medicine information is imported. This is not a complete electronic medication notebook replacement: patient annotations, allergy history, OTC records and unrelated notes are not imported. A notice is displayed. Preserve the original notebook. Dose quantities are shown as source values, never inferred as per-dose amounts. The reviewed patient's name is memory-only and cleared on close/reset/success. No medication is marked taken by import. Existing morning/noon/evening names, check flags, timestamps, memo and Markdown logic remain unchanged.

Records are stored separately at users/{uid}/medicationImports/{sha256}. The fingerprint covers normalized date, pharmacy identity, prescriber, prescription number, medicine identity, dose, usage and notes. Identical repeated/concurrent imports are skipped atomically. Different dates/strengths/doses remain distinct. Similar records among the last 100 imports are flagged for manual review, not automatically merged; different formats/codes/wording can still represent the same prescription. New master names and records are committed in one transaction. Existing master edits use atomic arrayUnion/arrayRemove to avoid overwriting imports. History deletion leaves actual intake records and checklist names intact.

## Format boundaries

- Records 201/301 and medicine/prescription notes 281/291/311/391/401 are read. 5/11/51 establish date, dispensing facility and prescriber; 55 scopes repeated RP numbers.
- JAHIS 911 record-level splitting (max 32 parts) and QR structured append (max 16 symbols) require all parts before preview. Different sets/conflicting duplicates are rejected. One image is decoded at a time; crop to one QR with its white margin.
- Shift-JIS byte segments and QR Kanji decoding are supported by ZXing. Byte-only structured append is reassembled before decoding, including characters crossing a symbol boundary. Unsupported/malformed text fails closed. Unsupported versions and URL/prescription pickup codes are rejected.
- Maximum 15 MB image / 40 megapixels; decoded canvas capped at 2400px; 120k text / 100 medicines. Large or low-resolution codes may need a closer capture. HEIC: use a JPEG or screenshot. PDF: screenshot each QR.

## REQUIRED release order (no deployment performed by this PR)

This branch includes reviewed owner-only rules and a default-OFF application feature flag. Verify and deploy the access rules before enabling imports, including previews connected to production.

1. Obtain user approval for production changes. Confirm the app points at the intended Firebase project and retain the previous rules as a secure operational backup.
2. Deploy the reviewed firestore.rules to the correct project (`firebase deploy --only firestore:rules --project health-log-app-f32b7`). This intentionally removes anonymous/cross-user access. Active app paths are healthLogs and users/{uid}/masterData/meds. Owner-scoped legacy users/{uid}/meds and /meds with a uid are also supported; ownerless legacy /meds is denied, not assigned to someone automatically.
3. Verify signed-in health log CRUD and medication settings. No historical records are rewritten.
4. Set REACT_APP_MEDICATION_IMPORT_ENABLED=true for the intended Vercel environment and deploy the approved app commit. The flag is compile-time and requires rebuilding.
5. Test on an actual iPhone: native camera cancel/capture, screenshot file picker, split QR, dark mode, confirming and retrying. Desktop/WebKit simulation does not substitute for an actual camera test.
6. Rollback the feature by removing the flag and redeploying. Keep owner-only rules; never restore global public access as a routine rollback.

The rules prohibit extra top-level import fields, including raw payload/identity/credentials; authenticated users can delete their own imports but not alter imported source records. No import content is sent to the AI endpoint or logged. No production health data is used in tests.

## Verification

- `npm ci --legacy-peer-deps` (CRA 5 / React 19 existing peer constraints)
- `CI=true npm test -- --watchAll=false --runInBand`
- `npm run build`
- With Java 21 and Firebase CLI 14.8.0: `firebase emulators:exec --only firestore --project demo-health-qr 'node scripts/test-medication-rules.cjs'`

Tests cover actual QR pixels/Shift-JIS, both splitting layers, invalid/missing data, confirmation gating, retry/double-submit, existing check/time regressions, real concurrent import transactions, unchanged history, and unauthenticated/cross-user denials. All test names and medicines are synthetic.

Sources: JAHIS 24-104 / Ver2.6 (https://www.jahis.jp/standard/detail/id%3D1124), Mynaportal manual above, https://developers.digital.go.jp/documents/mynaportal-api/specification/medicalexaminfo/ .

Local results: 28 Jest tests and 9 Firestore emulator integration/security scenarios passed. Production build passed with CI warnings treated as errors. A synthetic Shift-JIS QR was decoded in a 390px Chromium mobile simulation; review, mapping, confirmation and save were exercised with mock storage. Light/dark screenshots were checked and no horizontal overflow was present. Native iPhone camera and actual pharmacy/Mynaportal outputs remain release acceptance checks.
