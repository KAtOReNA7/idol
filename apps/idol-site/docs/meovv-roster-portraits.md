# MEOVV roster display derivatives

Scope: only the independent MEOVV roster on overview and members sections. Hero, catalog records, member-detail original photographs, ratings, notes, watched state and work playback bindings are unchanged.

- Existing source images inspected: five square sRGB JPEGs, no embedded color profile or orientation metadata. Full square frames are resized proportionally; no crop, new composition, recoloring, retouching or sharpening.
- Four derivatives are 1200 × 1200; SOOIN retains native 928 × 928 rather than inventing detail by upscaling.
- CSS: mobile 90px at <=359px, 100px at <=760px; desktop proportional five-column grid with 22px gaps and a 1720px outer content cap. The largest slot is below 400 CSS pixels. 1200px covers desktop 3x and mobile 4x; SOOIN retains all source resolution, approximately 2.5x at its largest desktop size. Extreme zoom/DPR beyond available resolution remains a limit.
- Existing `object-fit: contain`, DOM shape, aspect ratio and CSS remain unchanged.
- WebP quality 95, smart subsampling, effort 6. This is high-quality lossy encoding, not lossless. Lossless trials totaled about 5.46MB and increased two images; quality 92/95/98 were compared before selecting 95. Visual acceptance still needs independent review at real display sizes.
- Originals total 6,153,379 bytes; roster derivatives 1,422,152 bytes, a reduction of 4,731,227 bytes (76.89%) when all five roster images actually load. This is not an initial-screen or measured LCP improvement: the roster already uses lazy/async loading.
- Fixed single `src` intentionally preserves ReliableImage's current exact-source reporting, failure UI and external manual retry semantics. No `srcSet` is introduced because its selected `currentSrc` is not represented in the existing shared recovery state. Static-image retries remount the same URL, as before; no automatic retry or fallback to a different photo is added.
- Mapping requires member ID, exact stage name and exact selected source URL. Changed/new/archive/missing sources retain their normal behavior. Detail pages continue reading the untouched original catalog source.

## Reproduce and verify

Run from the repository root with existing installed dependencies (no downloads):

    node scripts/build-meovv-roster-portraits.mjs
    NODE_PATH="$PWD/node_modules" node --test tests/meovv-roster-portraits.test.cjs tests/meovv-independent.test.cjs tests/image-core-react.test.cjs tests/image-core-state.test.cjs

The JSON audit manifest records source/output SHA-256, bytes, dimensions, encoder versions and recipe. All five original SHA-256 hashes were also compared with baseline commit bf3c8b1 and matched. Tests check matching and mismatching identities/sources, actual component SSR of roster vs detail paths, loading hints, no srcSet, current static retry behavior, file hashes/dimensions and gross full-frame/color deviation. The latter compares WebP against the same resized source at 400px and is only a regression guard, not perceptual proof. Browser networking, rendered desktop/mobile snapshots and failure/retry interaction require independent QA; no full build or deployment is performed by the image task.
