# Timeline integration checkpoint

Base: `fc21c17`; accepted paging source commits: `6c8f3ff` and `c55244df4508207112264f7aec9d74b9715e7b3a` (cherry-picked as `ca927c9`, `e52bd86`).

Inputs: Sol Timeline Part 1 patch-files, Sol Timeline Part 2 patch (all predecessor hashes verified), and independently reviewed Astra E/E01/E02 merged events dated 2026-10-16. The 51 canonical JSON documents are byte-identical to that accepted input: 255 stable event IDs, 200 ready, 55 hold. Evidence files and audit reports are not runtime imports or public assets.

Display-only wording: 353 exact-before overrides from map SHA256 `885b087dd858531ec2bbf528b0d35b9a23715cb6b9ac14c04f7895a4608c00cf`, plus 4 approved source labels from SHA256 `5fa6b457ba4958f9269f6ff677eb1a90b1d3c89374c667e4dcf862d0b835f497`. Overrides key event/source stable IDs and exact original text. Original events, dates, relations, statuses and gaps remain unchanged. Source titles are labelled as source titles, not verbatim original headlines.

## Production integration

- `app/artists/layout.tsx` installs `ArtistTimelineProduction` across all 51 real routes.
- Each group's event, display-copy and background documents are lazy imported. Existing authenticated Catalog reads remain authoritative for usable member/work targets.
- Existing updates routes are retained and labelled 大事时间轴. Both current and historical members use the existing Chinese-first display resolver. Related record buttons navigate to existing main-app detail routes; unresolved identities remain non-interactive.
- Ready-only rendering is default. Held content never falls back into a second legacy event list. SPIA has an honest no-ready-events state. Useful roster/source context remains folded below the timeline; old candidate fact cards are omitted from timeline-bearing overview/updates headers.
- Native dirty confirmation runs before capturing the source target; uncertain saves and modal states block departure. Existing Editor save implementations, user ratings/notes/watch states, catalog APIs and photo APIs are unchanged.
- New history entries do not inherit old focus/scroll tokens. Back restores exact event/kind/record identity and expanded details, with actual CSS/data gates. Timeline and ordinary artist restoration do not race. User takeover cancels timeline restoration and records latest ordinary scroll.

## Verification at checkpoint

- Full Node test suite: 1269/1269 passing, 0 skipped, 0 failed.
- `tsc --noEmit --incremental false`: passing.
- Official Sites `build-site.mjs`: passing (the framework's existing route-classification warning remains).
- Production SSR suite loads all 51 actual page implementations with canonical data and actual scoped identity projection, comparing exact 200-ready/55-held sets. The fixture strips personal text/scores/photos; only the Cloudflare environment boundary is substituted. This is not browser proof.
- Provider closure/effect tests cover dirty cancel/approval, uncertain/modal/stale routes, capture failures, 15-second import deadline, retry and ignored stale completion.
- Real artist-scroll hook tests cover timeline ownership, user takeover, latest-scroll capture and fresh-entry token isolation.
- Legacy VM tests gained a dependency loader for real new modules; legacy parent-hook fixtures and assertions remain. Separate Sol route/layout tests still use explicitly test-only content aliases and are not evidence of production data correctness.

Browser QA is a separate pending acceptance step. No deployment, GitHub push or production data write is included in this checkpoint.

## Browser contrast follow-up

The real BABYMONSTER browser pass identified inherited dark text on its dark page and legacy transparent-button resets. The shared timeline now inherits the surrounding artist foreground for shell text, gives opaque event/state cards explicit ink, and gives controls sufficient selector specificity for their own text/background, hover and selected states. Theme/body/artist layouts are unchanged. Full tests: 1271/1271; TypeScript and official Sites rebuild pass. Real computed-style/screenshot recheck remains the acceptance boundary.
