# Before/after image measurements

The saved before implementation comes from local baseline `adb7501342baf9c4d28707db3072a99b21cb122c`. The 14 image implementations and original lightbox source were captured at `2026-10-16T13:18:34.169368+00:00`, before their image migration. Exact old function declarations/imports are retained in `tests/fixtures/image-reliability/performance-before-impls.json`; these are source excerpts, not rewritten lookalikes. The original before result was saved before the after comparison.

`performance-results.json` compares the same 12/120/600-image fixture at 1280×900, 390×844 and 320×720. Every four identities share a source. Sources, image dimensions, alt text, count, first-image eager/high priority and DOM counts are retained. Both phases use the same synthetic 800×600 SVG, 120 ms server delay, display geometry and browser settings. There is no image collection, quality reduction or production data.

The measured SSR markup keeps one eager/high image and the remaining lazy images. All images use async decoding after the change. These are deterministic markup counts, not real browser layout or loading measurements.

The minified image/thumbnail/lightbox bundle excludes shared React, React DOM and lucide packages in both phases. It includes the actual 14 local image/thumbnail implementations and lightbox; the after bundle also includes the shared recovery provider and controls. Its size increases from 33,766 to 43,876 raw bytes and 6,032 to 10,042 gzip bytes. This is a measured reliability/lifecycle code cost, not a measured speed improvement. Browser size/experience acceptance remains an integration gate.

The existing Playwright 1.62.1 Chromium launch was attempted exactly once. The installed runtime has no Chromium or headless-shell executable. No browser installation, alternate browser, user computer or access bypass was attempted. LCP, CLS, actual requests/duplicates, critical-image startup, first visibility, scrolling, median and p95 are **unmeasured**. `performance-browser-probe.json` contains the exact failure.

## Reproduce deterministic results

Run from the supplied source directory with the existing/offline React, esbuild and TypeScript dependencies available through `NODE_PATH`. The agent used `/workspace/scratch/f7dc7cc2923b/work/qa-runtime/node_modules`. Do not install extra dependencies for this handoff.

```bash
NODE_PATH=/path/to/existing/node_modules node tests/fixtures/image-reliability/performance-measure.cjs before /absolute/scratch/perf-before
NODE_PATH=/path/to/existing/node_modules node tests/fixtures/image-reliability/performance-measure.cjs after /absolute/scratch/perf-after
NODE_PATH=/path/to/existing/node_modules node --test tests/image-migration.test.cjs
```

The before command always reads the saved old source declarations. The after command extracts the current actual image declarations and imports. Generated bundles and measurement outputs belong in scratch; they are not product code.

## Reproduce browser measurements where a supported binary already exists

The two browser fixture bundles were built successfully. Building them is not a browser test. The fixture mounts actual extracted image/lightbox components and uses only synthetic local images. It is an isolated comparison fixture, not the production SSR application or its Editor/navigation system.

```bash
NODE_PATH=/path/to/existing/node_modules node tests/fixtures/image-reliability/performance-browser-build.cjs /absolute/scratch/image-browser-fixture
python tests/fixtures/image-reliability/performance-server.py /absolute/scratch/image-browser-fixture --port 8316
# In another terminal, with existing Playwright and its existing supported binary:
NODE_PATH=/path/to/existing/node_modules node tests/fixtures/image-reliability/performance-browser-run.cjs http://127.0.0.1:8316 /absolute/scratch/image-browser-results.json
```

The runner fixes desktop/390/320 viewports and 12/120/600 image counts, runs both phases five times per cold/warm cell, and records raw resource entries, server image-request logs, LCP, CLS, a separately labelled image load/complete callback timestamp, DOM counts and image attributes. The callback timestamp is not visibility or paint; `firstVisibleMs` remains null. Cold and warm use the same browser context for a pair; each repeat gets a fresh context. It scrolls the full unchanged image set, changes identity at the same source and performs A→B→A source changes. Summary statistics are computed only from recorded browser values. A missing Playwright module or failed launch produces `not-run` with exit 2, without fabricated median/p95 values. A partial run exits 1; a complete run exits 0. The runner first uses available `NODE_PATH`, then the exact existing `CODEX_PRIMARY_RUNTIME_NODE_MODULES` location; it does not install or search for another browser.

`before.html?count=12&mode=fail-once` and `after.html?count=12&mode=fail-once` expose the same first-request 503 scenario. The after page offers the actual external recovery controls. Buttons also expose identity/source changes and the actual lightbox. These interactions remain unverified in this environment; the deterministic component suites are reported separately.

The server binds only `127.0.0.1`, serves a fixed synthetic SVG and holds local test counters in memory. There are no production API requests, proxies, telemetry or persistent image caches.
