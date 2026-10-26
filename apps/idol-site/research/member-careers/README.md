# Reviewed member-career research increment

Local research deliverable on base `a3e3be4`. Nothing in this directory is imported by the app. No UI, API, database, storage, credentials, or deployment was changed.

## Contents

- `data/canonical.json`: 192 reviewed member claims, 369 member periods, two **unmapped version candidates**, zero new members. Stable original IDs remain unchanged even when wording or endpoint fields are corrected.
- `data/source-index.json`: 186 deduplicated source records and scoped support links. Includes the period review's additional ORICON source. Source review notes are not presented as direct quotes. Full third-party bodies are not copied.
- `data/adoption-ledger.json`: original proposal → adopted proposal with content hashes, original statuses, minimal changed period fields, and explicit schema normalization. Old personal records are not copied.
- `data/statistics.fixture.json`: exact reviewed classifications and original hold disposition.
- `data/baseline-guard.fixture.json`: only public hashes, excerpt flags, and existing role options from the supplied export. 331/331 hashes match, including all 15 excerpt-only baseline members.
- `data/local-guard.fixture.json`: historical snapshot simulation, 159 member patches pass, nine skip, all 24 display overlays remain blocked pending actual target read/review. This is **not live write authorization**.
- `source-supplements.json`: three narrowly re-read career quotations and one claim-specific role normalization. MARI's official profile explicitly says Main Rapper. PURPLE KISS official announcement was read. FNC statement was read in Soompi's reproduced English translation; its linked official Weverse page returned only a shell, which is explicitly recorded.
- `guard.mjs`: pure planning only; no writer and no network. Refuses incomplete or changed public projections, relationship changes, unknown roles, altered accepted claims, stale reads, held/skipped records, unreviewed overlays, and non-whitelisted fields.

## Exact classifications

| Domain | Accepted | Accepted with semantic revision | Skip | Hold |
|---|---:|---:|---:|---:|
| Member fields and overlays | 175 | 8 | 9 | 0 |
| Periods | 341 | 27 | 0 | 1 |

The field total is 168 patches + 24 overlays. There is separately **one schema-only normalization** within the semantic accepted bucket: MARI `主Rapper` → existing `主说唱`, backed by the official **Main Rapper** wording. This does not silently relabel a ninth semantic revision or introduce a new backend option. Ordinary Rapper / Lead Rapper have no automatic mapping to Main Rapper.

The 27 period changes consist of 12 IZ*ONE post-event evidence additions, two EVERGLOW source-scope fixes, and 13 PURPLE KISS / Cherry Bullet endpoint corrections. Those 13 retain their original period IDs and set individual `endDate`, `endPrecision`, and `effectiveDate` to null; group activity announcements remain career facts. Source support declarations no longer claim individual endpoints.

Original profile hold is `skip_no_change`; original period hold remains `hold`. No hold is upgraded. Two XG records remain named-performance version candidates with no `workId`, no new work and no visual identification claim.

## Reproduce

From the repository root, with inputs outside this worktree:

```sh
python research/member-careers/build.py --package ../astra-career-20261016 --export ../library-browser-production-qa/export-before.json
node research/member-careers/verify-local-export.mjs ../library-browser-production-qa/export-before.json
node --test research/member-careers/guard.test.mjs
```

The builder reads source audit formats, applies only approved revisions and strict allowlists, validates source references and stable IDs, and verifies input bytes remain unchanged. It does not serialize export records. The export is read locally only; no tool submission or external transfer occurs. Original source hashes are in `input-lock.json`.

## Application safety design (not implemented)

1. A future trusted server adapter must read the actual row, current schema, current + former group relations, current overlay target, and row revision under the authorized user/snapshot. Never trust browser-supplied before hashes, review receipts, or source allowlists.
2. Recompute the seven-field public hash from complete current values in memory. The research `beforePublicHash` is a content fingerprint, not a database revision. Never hash the shortened profile of an excerpt-only baseline record as its before value. Keep complete records out of logs, bundles and fixtures.
3. Load adopted claim hashes from the reviewed ledger; reject tampering, missing evidence, skips and holds. Keep exact current and former relations separate. Role arrays must match existing backend options, and the raw before-role-array hash is checked separately from concatenated public text.
4. For **all 24 overlays**, read and explicitly review the actual display target and complete current public profile. The 13 excerpt-only overlays receive no shortcut. The export's matching public hash alone does not mean an existing overlay can be replaced. Supply a trusted receipt binding claim ID, member ID, adopted claim hash, complete public hash and exact target hash. No receipt exists in this deliverable.
5. Build proposals as a batch against one baseline. Reject duplicate IDs or same-target conflicts; if any guard fails, return zero executable plans. Never sequentially rebase a research batch over its own writes.
6. A separately reviewed, explicitly authorized writer would need atomic compare-and-set on the **actual row revision**, narrowly apply only the approved public fields, preserve all unrelated fields, and verify the write. The pure planner does not solve transaction races and is not an authorization boundary by itself. No such writer is supplied here.
7. Periods are research-only records, not instructions to rewrite group relations, status, contracts, or works. Their app storage/display mapping needs separate integration review. XG candidates must not enter works until an explicit work mapping is reviewed.

## Independent UI suggestion (no UI changes)

If integrated later, show one useful career introduction and a compact career-period list. Prefer concrete works, roles and dated public career facts. Explain date precision when it affects meaning: a public debut is a career anchor, not an undocumented private joining date; a group activity ending does not establish an individual departure date. Keep source/audit decisions, hashes, provenance machinery, “ready/hold”, verification caveats unrelated to comprehension, and backend processing language out of public copy. Source links may live in a discreet references affordance. Do not add dashboards or redundant system-explanation sections.

## Verification limits

Focused offline tests and local snapshot guards are run; application build/browser/production tests are intentionally not claimed because no runtime integration exists. Most source evidence is inherited from the supplied completed audits, not newly re-read by this builder. Only the three supplementary URLs listed in `source-supplements.json` were newly body-read (with the stated FNC translation/origin limitation). Production may have changed since the supplied export; fresh guarded reads remain mandatory.
