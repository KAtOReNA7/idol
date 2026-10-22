# Batch F timeline adoption

Base commit: `f2797657a5dc0f62eac609d83d9eccc85a1a5bd5`.
Research cutoff: 2026-10-16. Original private Library package: `libfile_c57a1723cc108191a964cf82ad0cb86b`.

## Accepted result

- Original F manifest: all 994 files verified against their byte lengths and SHA-256 values, including 830 evidence files. The original package was not modified.
- 50 groups: 97 event-ID updates, 345 inserts, 154 preserved noops. Every existing event matches its original BEFORE object after only the 359 specifically mapped E/E01/E02 source-reference relocations; each relocation also has matching evidence bytes.
- F alone, including the untouched LSF timeline: 621 events, 606 ready, 15 held.
- Two independently recorded root additions for ILLIT/KATSEYE's `ICONIC BY MISTAKE`: final 623 events, 608 ready, 15 held.
- The two group-scoped collaboration events reuse the established LSF sources and 2026-06-12 actual release date. ILLIT links the existing exact-title, same-group work `rec28ldfRTrKBN`; KATSEYE has no existing matching work. Both have empty member IDs and no cross-group related-event links.
- LSF is byte-identical: 25 events, SHA-256 `65548bd618024c5fe1adb51c1b57e0b91cfb27a28a92b00909708b7c773611fb`.
- Shared wire schema remains v1. Old group IDs and all old gap statements remain; distinct incoming gaps are appended. Planned, postponed, unknown-date and held candidate states remain exactly as accepted.

## Provenance

- `original-manifest.json` is a byte-preserved copy of the original F manifest.
- `integration-ledger.json` records all guarded before/adopted event hashes, each accepted prior source-reference mapping, and group/gap preservation.
- `source-index.json` resolves every source in the 50 adopted group timelines to either the original Library package and manifest hash or the existing LSF source index. Original evidenceRef strings are preserved for incoming events; noops preserve live evidenceRef strings.
- `root-supplement-ledger.json` separately records the two new collaboration events and the independently corroborated aespa Dark Arts date.
- `aespa-dark-arts-date-confirmation.json` is the root's saved official 2025-07-15 release-date corroboration. The accepted Dark Arts event itself remains unchanged from F.
- Original source evidence files are neither copied into runtime/public nor imported by application code. These files are audit-only metadata, not a second runtime dataset.

Billlie's limited inherited second-EP assertion is unchanged; coverage labels do not expand it. Non-blocking raw summary/source wording is retained because current public rendering only uses event title/date/links. No UI, catalog API, image, score, note, watch-state or schema implementation files changed.

## Verification

- Draft 2020-12 JSON Schema: all 51 canonical documents pass.
- Full Node suite: 1295 passed, zero failed/skipped. Run with `NODE_PATH="$(realpath node_modules)" node --test tests/*.test.cjs` so temporary SSR bundles can resolve React.
- Focused adoption plus production SSR: 58 passed. The 51 real pages load canonical data and compare actual rendered IDs to a separately persisted accepted ID-set fixture for updates, legacy filtered URLs and overview, as well as the full chronological sequence and held exclusion.
- TypeScript: `tsc --noEmit --incremental false` passes.
- Official Sites `build-site.mjs` passes when run serially after tests/typechecking. The first concurrently run attempt was killed with exit 137; no source/config workaround was needed. The existing route-classification notice remains.
- No deployment, remote push, new credential, private-data mutation or image work is included.
