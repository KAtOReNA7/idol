# LOONA independent historical edition

Candidate implementation only; no deployment, database writes, external uploads, credential or sharing changes.

## Art direction

Implements the accepted V2 reference in `/workspace/shared/loona-independent-design/`: naturally sized two-column photographic sheets with separate rows, followed by the historical name index, complete group image, dark selected-work passage, a single original chronological timeline, and the complete work library. Mobile sheets use single-column document flow. Names have 44 px minimum targets. The application-level page gutter is explicitly removed from this independent layout.

The overview and members sections read `historicalRosterMembers(..., true)`. This is a reading scope only. Current associations, the former association of CHUU, index counts, and all stored records remain unchanged. There is no implicit query rewrite to `roster=history`.

## Assets and provenance

`asset-audit.json` records the four exact original JPEG files, their verified official source page and exact image URLs, SHA-256, byte sizes and dimensions. There are no derivatives, crops, retouches or generated assets. The bytes are copied unchanged from the reviewed local research input. The originals remain available and reversible. The source URL's `/2021/06/` upload path is **not** treated as a shoot date or as evidence that a photograph depicts the August 2018 debut.

- CHUU: 800 × 1200, page-local portrait mapping for `recvxyICzHTm4b` and exact stage name `CHUU` only.
- LOONA 1/3: 1000 × 684; ODD EYE CIRCLE: 1000 × 667; yyxy: 1000 × 695.
- Three unit images are labeled historical unit portraits. They do not assert all twelve members appear, nor establish face-derived membership relations.
- Existing group and eleven individual display WebP sources remain unchanged. No dynamic rewriting to omitted old original-image paths.
- `data/loona-artist.json` and `data/candidate-index-visuals.json` are byte-identical to baseline `b7614d413a7a52af19f27fa3538f47d7922f894f`.

## Navigation and records

The page uses existing `artistWorkUrl` / `artistMemberUrl`, shared image recovery/lightbox, catalog deadline/abort behavior, member work eligibility, physical/career fact components, and the original `ArtistTimelineHost`. The common save code is untouched. Selected Hi High, Butterfly and HULA HOOP entries require their reviewed stable IDs, original video URLs, exact titles and group association; they never replace the full library.

`safeArtistReturn` has one LOONA-only exact-query return after every pre-existing validation check. This preserves exact history-entry scroll/focus keys, including absent versus explicit historical scope and default parameters. Other artists keep their prior canonical ordering. Duplicate keys, disguised duplicate/unknown encoded keys, foreign origins, hashes, invalid enums/IDs and overlong queries remain rejected. No new allowed query keys.

## Verification boundaries

Tests execute real components with public identities and synthetic private values, plus the existing complete artist matrices. Source wiring is detected through AST, not a hardcoded route bypass: 34 candidate + 3 independent + 14 legacy = 51. Text-based work-entry assertions replace only LOONA's obsolete thumbnail expectations; full portrait/MV eligibility and stable work ID/URL/zero-score checks remain.

Local TypeScript, build, and test logs are handed off separately in `/workspace/shared/loona-independent-validation/`. SSR/tests do not establish browser geometry, high-DPR image quality, touch behavior, production authentication or deployment success. Independent real-component browser review is still required.

## Final local result (2026-10-16 UTC)

- Recursive CJS suite: 1,933 / 1,933 passed; no skipped/cancelled tests. Command: `find tests -name '*.test.cjs' -print0 | xargs -0 node --test --test-concurrency=2`, with `NODE_PATH=$PWD/node_modules`. The concurrency bound avoids contention with other independent review processes.
- `npx tsc --noEmit`: exit 0.
- `npm run build`: exit 0, run after the final runtime source change (three-state watched display).
- `git diff --check`: clean.
- The earlier broad `tests/*.cjs` invocation incorrectly included standalone preview/type/browser scripts; it is not the product-suite command. An earlier parallel tsc/test attempt was killed under resource contention. Both were superseded by the successful serial validation above, with logs retained in the validation handoff.
- Browser geometry/navigation and production acceptance remain a separate review gate.

## Public-copy follow-up

After candidate d495bd8, removed the five specified implementation/audit statements from the public component and replaced HULA HOOP's explanatory description with “日本出道单曲《HULA HOOP》。” No layout styles, interaction, source bindings or stored data changed. A real-renderer regression rejects the exact removed phrases and confirms the historical/member and musical facts remain.

This follow-up passed 148 targeted tests, `npx tsc --noEmit`, and `npm run build` after its final runtime text change. The prior 1,933-test result remains evidence for d495bd8; the later full-suite count is left to the integration run. Logs are under `/workspace/shared/loona-independent-validation/copy-cleanup/`.

## First-load geometry correction

Independent browser QA reproduced a real cold-image collapse before this correction: the photographic folds changed from 391.140625 px to 896.875 px during a 4-second image delay. This was not treated as a screenshot-only issue.

LOONA's local Picture now accepts optional native width/height and preserves the matching aspect ratio for loading images and error placeholders. The three unit photos, CHUU original, and existing group display WebP receive only their individually decoded dimensions, keyed to exact unmodified source paths; `display-geometry-audit.json` records those bytes/dimensions. Unknown runtime member and personal MV photographs receive no inferred dimensions. No global ReliableImage code, layout CSS, source URL, asset bytes, identity, records or eligibility behavior changed.

306 targeted tests, TypeScript and a post-change build passed. Logs: `/workspace/shared/loona-independent-validation/image-geometry/`. A matching delayed-load/failure/retry browser measurement is required before claiming the visual regression resolved.
