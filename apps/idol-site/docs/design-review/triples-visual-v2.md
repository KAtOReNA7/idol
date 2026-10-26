# tripleS visual v2 integration candidate

## Status

This overlay adds `/design-review/triples-v2` as an isolated, read-only visual candidate. It does not replace `/artists/triples`, publish a Site, change sharing or authentication, or accept a Figma design. Browser visual and interaction acceptance remains open.

The candidate keeps Astra's asymmetric group/record home composition, native wordmark, S-number contact sheet and sequence rails, dark unit spread, separate square release versus widescreen media grids, profile layout, and one-axis timeline. The source stylesheets are scoped under `.triples-visual-review`; all three graphics are byte-identical to the reviewed source. The source optional presentation adapter is implemented directly as React rails, without arbitrary script execution, an iframe, HTML injection, or a second router.

## Canonical inputs

- Authenticated read: `/api/catalog?artist=triples&shape=display-v1`, with the existing deadline helper and runtime group identity checks.
- Public presentation: the existing `triples-artist.json`, `triples-design-catalog`, `triples-identity`, and source-verified portrait assets.
- Canonical timeline: `loadArtistTimeline('triples')`, `prepareTimelinePresentation`, unchanged publication/identity validation, and all 24 ready events. Selecting an event or year scrolls within the complete timeline rather than reducing its contents.
- Entity actions: exact `(kind, key)` resolution and the existing `publicMediaActionHref` / `publicMemberActionHref`. MV and stage are separate; the Girls Never Die stage keeps its existing Work and exact stage video. Editorial release keys never become rated Work identities.
- No fixture or catalog snapshot is copied into the view. There are 24 members, 22 editorial releases, 17 MVs, one stage, eight unit relations, and 24 canonical timeline events at this baseline.

Preview URLs are validated by mapping to the canonical tripleS route schema. They are not added to the editor's return allowlist. Existing editor actions return to the formal artist URL; browser Back returns to the review. There is no new score input, save path, watching-state mutation, or display of private notes/ratings. The API's personal fields remain unused.

## Navigation and resilience

- Normal navigation stays inside the review route and uses the shared artist history/scroll helpers.
- Actual actions re-read the live route and host modal/pending-save/dirty gates at click time. Stale callbacks fail closed.
- Detail opening retains its immediate opener. Nested work details replace only the current detail entry. Direct deep links have explicit list fallbacks and never pretend to own an unrelated previous history entry.
- Member return uses the same guarded return mechanism. Legacy member-plus-release routes use the visible member detail as their origin.
- A pending Back latch prevents repeated close clicks from traversing multiple history entries.
- Work and enlarged-image dialogs both use native modal top layers inside the scoped wrapper. The image is not portalled behind an active native work dialog. Their shared scroll lock restores the prior body overflow only after both close.
- Source images use the existing ReliableImage component and explicit retry controls. Failed catalog reads can retry; delayed timeline imports can continue waiting; rejected imports offer an explicit guarded reload.

## Files and integration

The patch adds only the new review route/components/model/styles/tests/three graphics, plus one existing-file change: the shared design-review layout delegates its label to a route-aware component. UNIS and Kep1er keep the original wording and full-document notebook link. The tripleS candidate instead explicitly says it is not visually/Figma accepted and has not replaced the formal page. The existing review shell is unchanged.

This overlay requires the already-integrated three-group public bridge. Apply with `git apply --check triples-visual-review.patch`, then `git apply triples-visual-review.patch` in the target checkout. It is not a standalone full repository. Nothing was applied to the main checkout during preparation.

## Verification

Run from the integrated checkout:

- `node --test tests/triples-visual-review.test.cjs tests/triples-visual-timeline.test.cjs tests/triples-review-works.test.cjs tests/three-group-public-bridge.test.cjs`
- `node --test tests/design-review-isolation.test.cjs tests/design-review-timeline-loading.test.cjs tests/design-review-layout-boundaries.test.cjs tests/group-design-promotion.test.cjs tests/artist-navigation.test.cjs tests/timeline-production-guard.test.cjs`
- `./node_modules/.bin/tsc --noEmit --incremental false`
- ESLint on the new production TypeScript modules and changed layout.
- `node scripts/check-triples-review-styles.cjs --check --source /path/to/astra-triples-v2-intake/merged-preview`

Results on the verification copy: 55 targeted tests plus 67 compatibility tests passed, full TypeScript passed, scoped production-module ESLint passed. CSS provenance checks pass for 1,689 preserved source rules / 1,699 scoped rules including compatibility resets, three identical SVGs, namespaced keyframes/fonts, local-only resources, and independent LightningCSS parsing. These are source, SSR, and synthetic behavior checks; test counts must not be added to earlier reports as new independent coverage. No browser engine was launched and no production framework build was performed.

## Remaining acceptance

Use a permitted existing browser to inspect actual 320/390/1440/2560 layouts, real font rendering and crop, short-height large screens, all 24 member links and edge members, work-filter to detail to close, member to works to detail to close, nested detail transitions, direct-deep-link close, browser Back/Forward, repeated close, native Escape/focus order, nested image zoom/retry, empty/missing image states, forced colors and zoom. Confirm all timeline rows remain present and source disclosures are usable. These checks are not claimed as completed by SSR or source assertions. Do not publish or cut over the formal page before the required visual acceptance.
