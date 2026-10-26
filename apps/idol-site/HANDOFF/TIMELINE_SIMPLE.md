# Read-only single-axis timeline

Base: published `a9249e0c4ce6c132b66ebfcfedba4468862924e0`.
Branch: `dot/timeline-simple`.

## Product changes

- One chronological sequence containing every ready event once, including supporting events. No classification, importance, order controls, counts, status badges, secondary release groups, source/verification blocks or background panels.
- Compact transparent rows show one applicable date, one event title and optional plain-name member/work links. A single visible heading follows the artist theme. Existing group headings use the same restrained timeline size; the shared component does not duplicate them.
- Confirmed events use actual event dates. Announcements use announcement dates; announcement-only plans without a known announcement date use their planned date with explicit plan wording. Planned events use planned dates. Postponements/cancellations without a known announcement date remain undated. No source publication date is used as an occurrence date. Unknowns stay at the end of the same axis. Year/month precision is preserved; intersecting ranges have stable ID ordering without invented day precision.
- Legacy valid query/filter snapshots normalize to all/all/earliest before return-state comparison. Exact event/kind/target restoration and CSS/data readiness gates remain. Dirty/uncertain/modal guards and user takeover behavior are retained.
- Member links use only the existing reviewed Chinese name when available; historical group memberships are a read-only name/identity lookup union. No roster relation is changed. Work links use existing song/name fields.
- Canonical documents remain separate per-group lazy imports. Retired background/display-copy documents remain in source control but are no longer loaded by the production provider.

## Content input and provenance

LE SSERAFIM's complete reviewed document contains 25 ready events: 4 retained stable IDs with reviewed revisions and 21 additions. Other 50 canonical documents are byte-identical to the published base. Totals: 276 stable IDs, 221 ready, 55 held; held events are not displayed.

Approved input: `lesserafim-complete-timeline-20261016/lesserafim-timeline-increment.json`.
SHA256: `65548bd618024c5fe1adb51c1b57e0b91cfb27a28a92b00909708b7c773611fb`.
Research manifest SHA256: `f2081d64153b477731902bc3743ffb1f331e98b8d45919963ae882c0f4eceaed`.
`HANDOFF/lesserafim-timeline-source-index.json` resolves the canonical evidence references to the retained local research directory and hashes 64 evidence files. Evidence/research files are not runtime imports or public assets.

Two root-approved display-only translation consistency overrides retain the approved canonical bytes:
- `e-lesserafim-garam-hiatus`: `金佳蓝暂停活动，团体暂以五人活动` → `金佳览暂停活动，团体暂以五人活动`.
- `e-lesserafim-garam-contract-announcement`: `宣布金佳蓝离团并解约` → `宣布金佳览离团并解约`.
They reuse the existing reviewed Chinese-name resolver, without adding an identity assertion. The legacy exact `《CRAZY》数字发行` display simplification remains compatible but is no longer used by the new canonical title.

## Verification boundary

The production SSR suite uses all 51 real page implementations, canonical documents and actual scoped public identity projection. Each page is rendered for updates, an old filtered/reverse-order query, and overview, asserting identical complete ascending ready sets, one axis and one heading. It is not browser proof. Test-only synthetic routes remain isolated to their own suites.

Full Node tests, TypeScript and the official Sites build are required before freezing. Browser acceptance is a separate targeted pass using real layout/provider and formal built CSS: all 51 sets, LE SSERAFIM desktop/320/390, exact member/work return, two dark themes and guard smoke checks. No deployment, GitHub push, credential work or production data write is included here. User scores, notes, watched states, photo APIs, snapshot and API implementations have no diff.

Frozen source verification: 1276/1276 Node tests passed, zero skipped/failed; `tsc --noEmit --incremental false` passed; official Sites `build-site.mjs` passed. Existing vinext static route-classification warning remains. Logs are retained in the sibling `timeline-simple-qa` directory. Other 50 canonical byte comparisons and the 276-unique-ID/221-ready/55-held totals passed independently of the renderer.
