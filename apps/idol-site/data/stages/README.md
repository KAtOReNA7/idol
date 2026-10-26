# Stage source maintenance

This directory is server-only editorial metadata, not a second score store. Original Feishu work IDs are immutable keys. Never update Feishu scores, notes, relations, schema or rows during source maintenance.

- `inventory.json`: latest original work identity/version metadata, with no user scores or notes.
- `status.json`: every inventoried record has a machine state and explicit reason. `pending`, `blocked`, `likes_unverified`, `not_found` and `version_mismatch` are not complete selections. `not_found` means the recorded search found no eligible source; it is not a claim no performance exists.
- `evidence/`: immutable public-source research batches with URLs and observation time. No private user data belongs here.
- `../stage-videos.json`: compiled, selected sources used by the player, keyed only by work record ID. Existing video IDs and score bindings are not silently replaced when popularity changes.

An accepted performance must match the original song and precise language/version/performer scope. A same-group different song, official MV, dance practice, relay dance or member fancam does not qualify as the requested group stage. A professionally staged official special performance may qualify only when its type is explicitly evidenced and labelled. Existing alternate-version candidates can remain in evidence but must not win the original-version ranking.

Record raw like display, precision and checked-at UTC. Unknown likes are not zero. A highest-liked claim refers only to eligible, comparable, verified candidates in the documented search. Do not turn rounded counts into fake exact integers.

`scoreBinding` is created only after a fresh owner-authenticated read confirms the original work stage score is empty. It remains fixed after scores appear. Nonempty legacy scores without a source binding stay labelled pending confirmation; never associate them silently with a newly selected video.

All untrusted source titles/reasons are rendered as text. Source URLs must use HTTPS; player video IDs must match a youtube.com/watch or youtu.be URL. Do not add remote fetch or arbitrary URL proxy endpoints.

## Bounded update sequence
1. Read the latest authenticated work inventory; keep the raw export checkout-local under ignored `outputs/` and send researchers only public work fields. Missing song, official title and exact original MV ID is `missing_song_identity`, not a made-up song.
2. Review and preserve public evidence with per-work language/version/performer matching. Keep failed attempts as explicit statuses; never remove a still-valid existing source just because a new search fails.
3. Before binding any new selection, use a fresh authenticated read. If the existing stage score is not empty, leave `scoreBinding:null` and keep its old meaning unknown. Never change an existing source/binding without the owner's explicit version choice when a score exists.
4. Run `node scripts/validate-stages.mjs`, repository tests and type/build checks. Check source reuse across distinct song identities. Publication uses the existing Site's official source workflow, owner-private audience and current environment revision.
5. Read back protected fields after publishing. Source metadata changes do not authorize any production score update. Mark unfinished coverage honestly; never call all records complete simply because they have a status.

If the original work already contains an eligible official performance video (not a music video or dance practice), the highest verified candidate may be that same ID. Preserve it with `reusesOriginalVideo:true` and visibly state “原收录即表演版，与 MV 栏为同一视频”. Count it toward verified source coverage, but not as a newly added independent video. Keep any independently researched alternatives in evidence.

During the initially authorized completion pass only, a newly introduced binding with a still-empty live stage score and no user save-journal entry may move to a newly verified strictly-higher-liked eligible source. This needs a fresh complete save-journal snapshot and live score preimage. Preserve `previousSources` including old URL/title/likes/binding and change time. The original BATTER UP binding is always frozen. Scored/saved sources remain unchanged and can expose a `higherCandidate` hint instead. An unreviewed local draft selection never published to the Site may be retired when the final evidence invalidates it; do not confuse that with deleting a published/user-scored binding.

Client drafts retain the source key active at their first score edit. A full video keeps its original video ID key; a chapter segment uses `videoId@startSeconds-endSeconds`. Updating catalog metadata does not silently rebind a dirty stage draft. The server rejects stale video IDs or chapter bounds before issuing any Feishu write. All these checks are best-effort against external native Feishu edits, which have no shared atomic transaction with a Site deployment; compare protected fields again after publication.

## Supplement source metadata
The optional `supplements.json` file only provides external viewing links and bounded search evidence. It never creates a score binding or falls back into the formal player. Official and audience-original identities are explicit. A nonofficial original must match the original work performer scope exactly, with named performers, event/date and original-source evidence; no identity is inferred from faces. Official excerpts require an explicit duration and short-version label.

Only the nine corroborated IDs in group-placeholders.json may leave the named-work denominator; all source rows and relations remain exported. The classifier checks the known source fingerprint on every catalog projection and restores ordinary visibility for any new identity, relationship or user value, including zero.

Validate with node scripts/validate-supplements.mjs plus the regular tests/type/build checks. Evidence files are public-source editorial data, while live exports and private preimages stay in ignored outputs/.

## Official concert chapters
Formal chapter sources require explicit start/end evidence, a separately verified full-video duration, and end no later than that duration. Their score binding and save journal include the canonical source key, never just video ID. Embedded playback uses start/end; the YouTube external link can only jump to the start, so viewers must observe the displayed endpoint. Whole-video likes are labelled as such and cannot win a single-song ranking. Existing full-video legacy bindings remain compatible; changing an already selected chapter scope does not automatically rebind a source.
