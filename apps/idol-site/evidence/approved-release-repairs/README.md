# Approved release and cover repairs — 2026-10-18

Catalog integration is read-only presentation data. It creates no production works or ratings.
- ITZY: 25 group releases, 10 supplemental releases separated by category.
- NMIXX: 14 group releases, 10 supplemental releases, one announced 2026-12-09 album.
- KiiiKiii: six formerly missing release covers.
- XG: 15 formerly missing group-release covers. Eight existing covers preserved. Existing solo/video rows remain distinct; remix/orchestra/live albums have separate display sections.

All 80 downloaded sources are retained byte-for-byte under research/cover-originals/2026-10-18. The manifest binds exact source URL/title/date evidence to original SHA-256, dimensions and byte count, and independently records display derivative SHA-256, dimensions and size. Three downloaded NMIXX sources are retained as evidence while their existing runtime WebP images remain unchanged. Source cover download success is not a claim of original photographic resolution; the 4 SEASONS source is only 440 pixels and is never enlarged.

The *-baseline.json snapshots preserve all previous data for regression testing and recovery. No original runtime asset was overwritten. Source-scoped display IDs are not private database record IDs. Global digital catalogs are not claimed exhaustive. The original 23 broken video thumbnails are outside this release-cover repair.

Public UI uses existing group page styling, with only category separation and upcoming display added. Source hashes and the full catalog evidence are not client imports.

Validation: 77 new public WebP92 display derivatives, max edge 1200 px, 18,840,458 total bytes (17.97 MiB). Existing 11 release-cover assets are unchanged. 80 source originals total 100,732,934 bytes. Rendering/hash/catalog regression tests run with NODE_PATH set to the checkout node_modules so temporary test loader modules resolve React.
