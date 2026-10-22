# tripleS independent photobook candidate

This candidate implements the approved second-version whole-page, member, and
work-detail direction. It is local only; no deployment, external upload, catalog
mutation, credential change, or new image was performed.

## Structure

- Complete group photograph with a 24-name official-S book edge.
- Large current portrait and smaller adjacent portrait; S24 looks back to S23.
- Searchable native-dialog complete photographic roster, with restored close
  focus and an explicit no-results message. Unknown identity records remain
  available through their ordinary member detail, without invented S labels.
- Mobile identity precedes the portrait. Navigation remains visible on mobile.
- Authored text release spreads: ACCESS, ASSEMBLE24, ASSEMBLE, MUHAN. The full
  works and records sections remain independent of these selected entries.
- One shared chronological timeline in the active overview or updates section.
- Existing verified display WebP URLs serve the reader and lightbox. Original
  files are untouched; no unbundled dynamically generated original paths exist.

## Safety and navigation

The existing read deadline, image recovery, member-photo eligibility, public
career/physical facts, record navigation, and shared player/editor are retained.
No rating, note, watched-state, ID, ownership, API or save logic was changed.

Timeline release links pass through prepareTimelinePresentation with the same
host input and catalog. Loading, error, structural failure, group mismatch,
held review and unusable work identities cannot supply those entries.
ASSEMBLE24 uses the separately reviewed resolver without modifying timeline IDs.

The only shared behavior extension is an optional reader record ID for
/artists/triples. safeArtistReturn still rejects duplicate/unknown query keys,
external origins, fragments, invalid IDs and other artist paths. artistRoute and
artistRouteUrl preserve this bounded context. The reader itself requires the
full-roster stable-ID, stage-name and current-group official identity guard.

Reader, section, queue, search and format survive work links and section changes.
Member return prefers a valid source reader; a direct member deep link without
one returns to that member's verified S. A fresh history entry clears stale
restoration markers. Existing history scroll restoration stays in control;
member/work/profile links capture distinct focus keys without private data.

## Tests and verification

119 targeted tests passed, including:
- Ten new actual-renderer/handler regressions for reordered S identity, S24,
  unmatched IDs, complete works, source-reader returns, query guards, release
  drift/publication gates, search, unique timeline and unmodified records.
- Eight catalog timeout/unmount/Strict-replay/retry regressions using the actual
  new component effect and shared deadline implementation.
- Existing candidate density, image/font/style, navigation, member/work focus,
  save-order and dirty/unknown-save guards.

The legacy synthetic tripleS density assertion previously demanded arbitrary
ordinal numbers. It now asserts all 24 actual roster targets and full bilingual
names, and explicitly rejects official S attribution to synthetic record IDs.
Other groups' ordinal assertions remain unchanged. The VM loader now reads JSON
modules correctly for the real reviewed identity layer.

TypeScript no-emit passed. A local production build completed. Two subsequent
small navigation/focus refinements are present in source after that build; use
the final source commit for independent browser acceptance. No claim of final
browser acceptance or high-DPR image validation is made here.

## Full-suite integration fixture follow-up

The two existing synthetic host/image build closures now declare precise aliases
for the three new public-evidence files, scoped to their actual importing module.
They do not permit arbitrary production data. New negative tests reject those
same real files if they escape substitution, unrelated importers and unknown
files. Identity and curation correctness still run against real reviewed public
metadata in the separate tripleS regressions.

Migration audits now infer independent pages from actual JSX structure and prove
both overview and updates host reachability: 35 shared candidates, two independent
pages and 14 legacy routes, all 51 wired. The image audit adds the real tripleS
implementation and recognizes its stable-work-ID text links as the deliberate
alternative to thumbnails; all hero, portrait, recovery and eligible member-MV
image checks remain. The image renderer checks both original work targets and
zero scores instead of requiring YouTube thumbnails in the new text-only view.
The public privacy label is restored and full-frame image fit is explicit.
