# tripleS read-only identity and release overlays

This module is not a layout implementation. It changes no Member/Work fields,
shared UI, API, database, routing, timeline dates, or catalog membership.

## Roster interface

`triplesRoster(members)` in `lib/idol/triples-identity.ts` returns one wrapper per
input member, in input order. `member` is the identical input object.

- `identity` contains `sNumber`, `officialStageName`, and the official profile
  `sourceUrl`, or is null. Match requires exact stable record ID, exact official
  stage name, and current `groupIds` containing `TRIPLES_GROUP_ID`. Former-group
  membership alone is insufficient. Duplicate IDs invalidate all occurrences.
- `displayName` and `chineseName` always use the existing shared name resolvers.
  Valid existing Chinese fields take priority. S22 currently resolves to
  `索琳 · Sullin` through the shared reviewed-name fallback, consistently with
  other pages. No group-specific translation overrides that resolver.
  `displayKind` is always `existingMemberDisplayName`; `chineseSourceUrls` is
  empty because this layer supplies no Chinese-name override. The alternative
  media rendering “雪琳” remains background evidence only, not current display
  API output and not an official Chinese or legal birth-name assertion.
- All 24 current public member identities have Chinese display names. If a future
  record drifts, we deliberately do not apply another person's verified name or
  S number. Preserve its original archive access for correction/review.

UI integration must pass the complete current roster, not a filtered search
result that could hide a duplicate ID. Keep every returned wrapper reachable in
the complete roster. A separate display may sort a copy by verified S number,
with null identities retained as unnumbered entries. Never assign numbers from
array order, portrait filenames, search result order, or missing slots. Keep
existing detail/navigation targets using `row.member.id`. Do not use translated
labels as identity lookup keys, and do not write wrappers back into the catalog.
The overlay does not import or order photographs; existing portrait eligibility
and full-frame rendering rules remain the caller's responsibility.

## Release interface

`triplesReleaseEntries(works, publishedEvents)` returns up to four known
release-to-video navigation wrappers: ACCESS, ASSEMBLE, ↀ MUHAN, and ⟡ MUJUK.
`work` is the original caller object. `sourceUrls` preserves the accepted event's
originally reviewed public evidence links; subsequently appended event sources
are not automatically promoted into this overlay. No date or performer list is synthesized.

Pass full current catalog works and ONLY events already admitted by the existing
timeline validation/publication gate. Do not import raw timeline JSON directly
into a UI as a shortcut. This helper imports no timeline document and does not
replace its gate. Local guards additionally require the exact event ID, release
key, single original work association, confirmed release status, ready review,
empty hold reasons, original public source URLs, and current group ownership.
Exact original video URL, song and official title must also match. Harmless title
or URL edits can therefore hide an entry until reviewed; this conservative false
negative is intentional. Duplicate work/event IDs or release keys suppress that
entry. Missing events or works provide no entry and no fake play button.

These four entries are not a complete discography or a replacement for the full
works catalog. Never remove an unmatched work from existing browsing or detail
routes. Never interpret work group ownership, S ranges or these links as official
unit membership or performance participation. ASSEMBLE24 has no original work
link and is intentionally absent. Do not use release dates to rewrite video dates.

## Evidence and verification

- `data/triples/identity-evidence.json`: official S1–S24 mapping and source; alternate S22
  media translation research, checked 2026-10-16 (not a display override). No image-index inference.
- `data/triples/release-evidence.json`: audited existing event/work identities and
  original public video/title/source fields. No ratings, notes or watched data.
- `tests/fixtures/triples-public-identities.json`: only public identity fields
  projected from the existing member catalog for regression tests.

Run `NODE_PATH=$PWD/node_modules node --test tests/triples-identity.test.cjs` and
`NODE_PATH=$PWD/node_modules ./node_modules/.bin/tsc --noEmit --incremental false`.
No production build or deployment is required to test this layer.

## Separately reviewed ASSEMBLE24 curation

`triplesCuratedReleaseEntries(works)` in
`lib/idol/triples-curated-releases.ts` reads only
`data/triples/curated-release-evidence.json`. Its independently reviewed Soompi
May 8 update establishes ASSEMBLE24 and its title track Girls Never Die. This
is a separate public curation fact, not a timeline event: the current timeline's
empty ASSEMBLE24 workIds remains unchanged, and the existing four-entry resolver
retains all its publication gates.

The new resolver requires a unique original work ID plus original URL, song,
official title and current group ownership. It returns the original work object,
`sourceKind: curated-public-evidence`, bounded `sourceScope`, reviewed source URL,
release title/key and the sourced “24人完整体” scope label. It provides no event
ID, dates or individual participation claims. It never reads private fields.
Any identity drift or duplication omits the curated entry only, leaving full
catalog browsing untouched. A UI may select ACCESS / ASSEMBLE / MUHAN from the
existing resolver and append this entry; do not relabel it as a timeline event,
make up a missing playback target or use current portraits as release artwork.
