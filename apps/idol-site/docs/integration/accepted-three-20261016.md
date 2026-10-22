# Accepted three-branch integration

Local-only integration; no push, deployment, credential creation, API mutation or image upload.

## Frozen inputs and merge

- Base: `f2797657a5dc0f62eac609d83d9eccc85a1a5bd5` (main worktree remains clean and unchanged).
- Deferred catalog panels: `12cf3662ba6bb996bfb2df38eae39977be0c6703`, including all four commits since base.
- Image reliability: `3ef1fdc`, including all six commits since base.
- Batch F timelines: `0004f72865506c8e2364ff2071d18822915558a2`.
- KiiiKiii follow-on mobile fix: `796e21596fb9750e576726f1c9966b4cc5c2709a`, cherry-picked as `16ac4a8affd40e982b20e090b2c65f0dc3e9a469`; final product freeze and full validation are on this commit.
- Three-way product merge: `371ac36e839bb31eef83ef9d0850a90bbf4ebe2f`.
- Initial implementation plus two integration guards: `cbb71e6e177eb21ddf3f88d60d7f3a15f43920bc`.

Only two files conflicted. In app/page.tsx, retain the image branch's outer ImageRecoveryProvider and one ImageRecoveryControls, while keeping deferred GroupIndex/GroupDetail fallbacks and styleReady visibility gate. The group readiness gate remains independent of CSS visibility, so loading/error screens stay visible. In tests/editor-flow.test.cjs, combine the real image dependency loader with deferred-module/CSS test dependencies. No guard or test assertion was removed.

Provider covers the fallback and every real App image entry. Image retry cancels event propagation and never calls navigation/reload. Explicit module-error reload still calls journey.reloadPage, which checks mayLeave before capture/reload. Full-page reload is intentional native-ESM failure recovery, never automatic. These source invariants have new integration tests; joint real-browser interaction QA is separately pending and is not implied by this report.

## Preserved facts and personal data

- Editor function and private record search state/index region are byte-identical to base; the new regression test enforces this.
- Deferred hooks/loader are unchanged from the accepted deferred branch; shared image components are unchanged from the accepted image branch.
- API implementation and private search implementation have no base diff.
- Final timeline dataset: 623 events, 608 ready, 15 held. Batch F provenance and expected rendered ID fixture retained.
- LSF: 25 events, unchanged bytes, SHA-256 `65548bd618024c5fe1adb51c1b57e0b91cfb27a28a92b00909708b7c773611fb`.

## Checks

- `NODE_PATH="$(realpath node_modules)" node --test tests/*.test.cjs`: 1676 passed, zero failed/cancelled/skipped/todo.
- `npx tsc --noEmit --incremental false`: exit 0. Only existing npm http-proxy warning.
- Official Sites `build-site.mjs`: exit 0. No concurrent official build. Existing Vinext static route-classification notice remains.
- Initial unqualified Node test invocation failed because temporary SSR bundles could not resolve React. It is not counted as passing; rerunning the complete suite with the documented NODE_PATH succeeded. No source change was made to hide these failures.
- Raw logs retained alongside the checkout in accepted-three-integration-qa: full-tests-missing-node-path.log, full-tests.log, tsc.log, build.log.

## Same-boundary production measurement

Reused scripts/report-client-graph.mjs from the accepted deferred branch. Both reports traverse static imports from browser bootstrap plus app/page.tsx, deduplicate emitted chunks, include static CSS and root layout CSS, and use per-file Node default gzip. Baseline is the prior verified clean f279765 report, including its documented identical-content-hash CSS reconstruction. The preserved baseline report and fresh combined report are adjacent JSON files. No baseline rebuild or main-tree edit was needed.

| Metric | f279765 base | Combined |
| --- | ---: | ---: |
| Initial JS bytes | 700582 | 601745 |
| Initial CSS bytes incl. layout | 158884 | 160358 |
| Initial JS + CSS bytes | 859466 | 762103 |
| Per-file Node gzip JS + CSS bytes | 219280 | 201165 |
| Initial JS files | 13 | 13 |
| Initial CSS files | 3 | 5 |

Initial JS: -98837 bytes (-14.11%). Initial JS + CSS: -97363 bytes (-11.33%). Gzip sum: -18115 bytes (-8.26%). This does not use the unrelated image-branch gzip accounting.

First group visit adds three JS files, 116215 bytes / 26201 local-gzip bytes, with zero additional CSS files. A cold group route still has an intentional dynamic loading cost. These are build artifacts, not transfer/LCP or real-world speed measurements; images, fonts, API bodies, latency, headers and HTTP caching are excluded.

No publication claim is made. The parent owns final joint QA and publication.

## Final follow-on validation

After the KiiiKiii real-content-width CSS correction, the entire 1676-test suite, TypeScript check, and serial official build passed again. The assertion helper now fails explicitly if the Editor or private-search markers are absent. The final artifact report includes this CSS correction; raw initial JS/CSS bytes remain unchanged, with gzip sum increasing by 8 bytes from the prior combined artifact. No visual pass is inferred: browser review remains independently owned. The previous combined full-suite/build/graph evidence is retained with the pre-kiii prefix outside the checkout.
