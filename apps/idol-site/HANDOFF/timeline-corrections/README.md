# Post–Batch F correction: tripleS ASSEMBLE24

This is a later, independently sourced correction, not a rewrite of Batch F adoption history. Local source change only; no deployment, database write, image upload, credential creation, member association change, or score/video-record change.

## Scope and evidence

- Exactly one existing event: `e-triples-assemble24-complete-phase`.
- Set the release day to `2024-05-08` (Korean local date), link the already existing `rec28ldfRTrCjG` official MV, update summary, append the evidence update to the historical scope note, and append one Soompi source.
- Original Bugs source remains byte-for-byte identical as an object. Event ID, group, release key, members, status and review state remain unchanged.
- `triples-assemble24-source.json` records the independently read May 8 KST update, original article date April 14, paragraph location, 18:00 Korean time, title-track MV relationship, and limits. It uses a Chinese paraphrase, not a copied article.
- Existing curated-release modules are unchanged and still never write timeline data.

## Audit chain

`triples-assemble24.json` retains complete before/after objects, canonical sorted-JSON SHA-256 hashes, historical adopted hash, original ledger/manifest/source-index byte hashes, exact allowed top-level field diff, evidence-file hash, work identity, and before/after timeline-file hashes.

`tests/helpers/timeline-correction-chain.cjs` only recognizes this one named correction. Historical hashes are independently pinned in code. It validates the historical before object, exact current after object, scoped changes, preserved old source, new evidence and existing work identity. All other Batch F events still match their original adopted hashes. The old source audit runs on the verified historical projection; new source validation is mandatory in the chain. Production tests restore only this before event and must reproduce the unchanged historical full-file hash, preserving the original canonical fixture rather than replacing it.

Negative tests reject missing/unlisted corrections, incorrect before/current objects, absent or changed evidence, old-source rewrites, confusing publication/update dates, unauthorized fields or members, other-event edits, incorrect dates, and work/video/title/group/duplicate-record identity drift.

## Verification at base 228ed8e

- All 623 events compared against the base: exactly this event changed; 622 unchanged. No event insertion or deletion.
- Historical `HANDOFF/batch-f/` files and canonical hash fixtures unchanged.
- `NODE_PATH="$PWD/node_modules" node --test tests/timeline-*.test.cjs tests/triples-identity.test.cjs`: 342 passed, 0 failed.
- `npx tsc --noEmit`: passed; generated build cache restored.
- `git diff --check`: passed.
- Full-suite/build/release verification is left to the parent. Nothing here is a claim of deployment.
