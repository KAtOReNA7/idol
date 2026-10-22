# Public group route aliases

Base: `d1570d402af774fe372e1982c4b31b8be41b985e`.

The existing public route registry binds `witchx` to `rec28ldfRTiDFM`
(`W!TCHX`), at `data/artist-timeline-registry.json:111–114`; the same
binding exists in `lib/idol/candidate/registry.ts:112–115`.

A shared `publicGroupNames` helper indexes each catalog group's display name,
current name and existing route slug. All three public indexes use it: groups,
works and members. Work-sequence scope revalidation also uses the same helper.
Aliases require the stable group ID and an actual linked catalog group. They do
not rename records, infer member aliases, merge IDs or search private fields.
No changes to separator normalization or private-record search.

Regression coverage calls the implementation and verifies:
- `witchx`, full-width and multiword variants across all three indexes.
- Existing route aliases for all 51 published artists, plus i-dle / lesserafim.
- Identical display names on different IDs do not gain each other's alias.
- Public/private boundary, empty and punctuation queries, independent fields.
- Original object references, values and ordering; next-item scope revalidation.
- Fresh catalog indexes reflect renamed groups and moved/missing relationships;
  previous snapshots remain unchanged.

## Dependency size

No packages added. The existing public route registry is 5,694 source bytes,
containing only slug / group ID / name / public path. No artist biographies,
content bundles, private records or timeline events are imported.

Esbuild standalone browser ESM entry bundles, minified / gzip bytes:

| Entry | Before | After |
| --- | ---: | ---: |
| group-index | 1,040 / 614 | 4,999 / 1,719 |
| member-index | 22,781 / 5,183 | 26,729 / 6,239 |
| watch-sequence | 3,284 / 1,466 | 7,232 / 2,555 |

These are isolated diagnostic bundles, not production route totals. The shared
registry is deduplicated when entries are bundled together.

## Verification

- Focused related suites: 71 tests passed (catalog-name-search, group-index,
  library-search, watch-sequence, personal-record-search, search-equivalence,
  cutover-search).
- Full suite: `NODE_PATH="$PWD/node_modules" node --test --test-concurrency=4
  tests/*.test.cjs tests/library-browser/*.test.cjs` passed all 1,768 tests. NODE_PATH lets the existing /tmp
  bundle-based test harness resolve React; no dependency installation needed.
- TypeScript: `tsc --noEmit --incremental false` passed.
- ESLint: four changed production TypeScript modules passed.
- `git diff --check` passed.

No push, deployment, credential change or data write performed.
