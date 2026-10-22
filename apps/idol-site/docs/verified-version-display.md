# Verified version display (read-only candidate)

Baseline: `7909f875d2ccc266a7fbcf4fa1bc680e9d41ab6b`. Source: reviewed `astra-version-review-20261017/vetted/public` package, 231 profiles and 37 work-to-work edges. No metadata patch, video candidate, source URL replacement, score binding or maintenance endpoint is introduced.

The checked-in minimal server dataset contains 71 necessary public identities, 5 nonredundant tags and 37 relations (36 distinct work pairs). Relations cover 68 existing works, including 38 of the 231 profiles. Tags and navigation together affect 41 of those profiles in the reviewed offline baseline; this is not a claim about the current production state. The remaining 190 profiles create no additional UI. No identity/provenance records are included in client output.

New tags: Glow Up / Strawberry Cheesegame / Supernatural → 韩语; YOUNG POSSE UP / Cherry Gene → 混音版. Existing titles, video types and version fields remain authoritative. No summary card, redundant publisher/title, vague unknown label, or separate player mode is added.

## Fresh identity and source isolation

`withVerifiedVersionDisplay` runs only on freshly obtained `nativeTables` inside `readNativeCatalog`. The existing owner, snapshot, epoch, generation and request-order fences still surround projection and cache publication. Generation-stamped cache reuse is unchanged. Snapshot/durable fallback projection never attaches these fields. The complete source-owned public identity must match the reviewed baseline: workId, name, song, url, videoType, version, releaseDate, officialTitle, channel, channelUrl, performerUnit, groupIds. Missing schema/cells, placeholders, duplicate rows or drift hide additions. Both relation endpoints must pass. Raw full dates are checked before browser truncation. Private fields are not part of identity and are not modified.

Field IDs for channelUrl (`fld6Ab27Zx`) and performerUnit (`fld2UfUVYO`) follow the original public-baseline extraction contract; current native schema must still contain them. The public projection returns only tags and `{workId,title,labels,categories}` links; no baseline identity, hashes, external URLs, resource IDs or playback eligibility is sent. Artist-scoped responses remove out-of-scope navigation links without mutating the shared catalog.

All 8 held video objects / 11 associations and 13 proposed metadata patches remain excluded. Three non-same-song edges are explicitly categorized as 混音关联 or 系列影像; they are not promoted to same-song versions. One target with language + visual-sequence edges becomes one button with both meanings.

## Navigation

Related works enter existing `journey.navigate` with the original sequence and source-work return label. It still runs the pending-save/draft guard and preserves artist return context. An off-sequence target suspends the sequence preview, ordinal and next action without editing the original queue. Back restores the source work, queue, scroll and version button focus through the existing history-entry focus mechanism. Scores, member associations and stage playback remain attached to their original work IDs.

## Validation / release boundary

Run `NODE_PATH="$PWD/node_modules" node --test tests/*.test.cjs tests/library-browser/*.test.cjs`, `tsc --noEmit --incremental false`, and the normal `npm run build`. A sparse checkout can use temporary read-only symlinks for existing public/evidence assets during legacy tests; remove those links and reapply sparse checkout before committing. Never commit asset deletions caused by temporary symlinks. A source-only build without public assets is not a complete deployable package.

Before release, use the real App in a synthetic preview at 320/390/768px to check single-target dual relations, mixed categories, dirty cancellation, pending saves, off-sequence pause/return, Back/Forward, keyboard focus and stage/MV continuity. Production fresh identity eligibility has not been read in this candidate task. Release and deployment belong to the parent task after independent review.

Latest authorized post-apply export structure was also checked in memory using public works fields only: 614 rows; all 71 required identities had every required cell and matched all 12 fields; output was 5 tagged works, 68 linked endpoints and 36 undirected pairs (all 37 semantic edges eligible). No exported row or private value was copied into this repository or tests. Public-only projection SHA-256: `aa3077bf24ac3153ce715006e77458435fd483f3b3f19b768ba2aa9170accca3`. This validates the actual native/export representation, not a new production request or future-state guarantee.

Candidate verification after explicit focus-before-navigation: 1,825 tests passed (zero skipped/failed), TypeScript no-emit passed, normal application build passed with public assets omitted from this sparse build. The 8 held video IDs had no occurrences in built JS; the raw identity field marker was absent from client chunks. Browser verification and full production-asset packaging remain separate release gates.
