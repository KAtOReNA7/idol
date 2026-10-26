# Public artist copy cleanup

Base: a3e3be449798b8b2867448fbc6444d9a50007d73. Display-only; no publication or push.

## Scope

- All 51 artists: remove invented hero slogans and replace introductory prose with existing sourced facts. Candidate introductions use curated, explicit copy, not a runtime keyword filter.
- All 37 candidate index cards: the same source-bound introductions and image credits as their detail pages. Early custom index cards now use existing debut facts.
- Candidate member portraits: exact credit projections retain source, publication/period labels and historical identity; archive fallback simply says member archive photo.
- Candidate roster: keep current-association/history controls and historical-member labels; remove backend audit exposition. Association data and counts are untouched.
- Public physical facts: retain the recorded value, published date, source link and historical nature; omit internal evidence scope and verification date.
- The single-axis timeline rendering, styles, event statuses, dates and data are unchanged. A non-rendered legacy background component no longer outputs audit scope.
- Functional empty/error states, incomplete sales/award coverage, zero scores, personal notes, watch state, official-versus-alternative stage boundaries and version warnings are unchanged.

## Evidence and reversibility

- Per-artist before/after and source paths: candidate-public-copy-review.json (37) and custom-artist-copy-review.json (14).
- No canonical data JSON, image bytes/paths, provenance, review status, audit metadata, member relations, private records, storage or permissions were edited.
- BADVILLAIN: `data/artist-timelines/badvillain.json#events/e-badvillain-official-debut` supports June 2024 and OVERSTEP. The day remains unspecified. Bugs image source remains linked, without calling the picture current or official.
- Historic photos still carry known periods or historic labels. A release visual remains a release visual; no image is promoted into evidence of current lineup.

## Regression coverage

- `tests/public-artist-copy.test.cjs`: actual public artist JSON and real route components, with synthetic personal catalog records only. Tests all 51 artists across five sections plus member pages, 51 index cards, all candidate portrait credits, physical facts, BADVILLAIN source link/month precision, errors/empty states and zero score. A personal-text sentinel is rendered through the actual note/memory JSX to ensure the user’s words are never sanitized.
- Updated old literal-copy assertions to the requested display contract. Original image src/fit/priority assertions remain; only approved alt-copy wrapper expressions are normalized for comparison.
- Existing factual metadata and immutable image/backup hash assertions remain intact.

## Validation

- Full suite: 1,738 passed, 0 failed, 0 skipped.
- TypeScript: `tsc --noEmit --incremental false` passed.
- Official build: `npm run build` passed after tests and TypeScript, using the existing official run-framework script.
