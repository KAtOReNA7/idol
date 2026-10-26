# Catalog group-module candidate

Base: f2797657a5dc0f62eac609d83d9eccc85a1a5bd5. Local-only candidate; not deployed.

## Scope

The home App imports the group index and generic group detail only when the resolved route needs them. The two views share one explicit dynamic boundary. Home, works, members, insights and saved-record search retain their existing code path. No changes to catalog/API data, scores, notes, images, artist pages or timeline visuals.

The initial loading shell remains server-rendered. An explicit group-index URL starts loading the module alongside catalog data; mixed-ID links wait for catalog resolution. A cold group route displays an accessible, nonempty loading state. A failed import or 30-second deadline keeps the App, navigation state and catalog response mounted. It offers Back and an explicit “重新加载页面” control. The page never refreshes automatically. Explicit reload uses the existing dirty/uncertain-save guards, preserves the URL and public browse history, and warns that the temporary private-record query will be cleared. The module contains UI code only, is retained in memory, and never writes browser storage.

The existing journey hook waits for both route module readiness and its existing stylesheet readiness before restoring focus/scroll or capturing geometry. CSS gating still keeps mounted editors intact. The group-module predicate follows resolved work/member/group precedence, including malformed mixed-ID links with a missing work and valid group.

## Build measurement

These figures describe the frozen production candidate f1cfdc41b2893803bfddbc1d61740b8e481693b6, including the explicit guarded-reload recovery and parallel group-index loading adjustments.

Measured with the official Sites build helper, Node v24.19.0, unchanged dependency lockfile. JS dependencies are traversed from the browser bootstrap and app/page.tsx, then deduplicated by emitted file. CSS includes those static dependencies and the root layout stylesheet. Files referenced solely by a dynamic import are excluded from the initial graph. Baseline JS is from the clean baseline worktree; its CSS totals use identical content-hashed files retained by the main baseline build. The candidate graph was rebuilt after the final production changes. Both reports use the same per-file Node default gzip parameters.

| Metric | Baseline | Candidate |
| --- | ---: | ---: |
| Initial static JS | 700,582 B | 588,986 B |
| Initial static CSS, including layout | 158,884 B | 158,885 B |
| Initial JS + CSS | 859,466 B | 747,871 B |
| Node gzip, JS + CSS per file | 219,280 B | 195,968 B |
| Initial JS files | 13 | 13 |
| Initial CSS files | 3 | 4 |

Initial JS falls by 111,596 B (15.9%). Initial JS + CSS falls by 111,595 B (13.0%). These are build artifacts and local gzip calculations, not measured transfer sizes, LCP or real-world speedups. They exclude images, fonts, API response bodies, request headers, latency and HTTP caching.

First group visit adds three JS files totaling 115,712 B (26,192 B local gzip), and no additional CSS. There is a genuine cold-route loading tradeoff. Insights stays in the initial App because splitting its small implementation would add complexity and requests for little benefit.

## CSS safety

The existing candidate-index stylesheet remains a static App import. Vite's generated preload helper remembers attempted CSS URLs even after a failed stylesheet request; therefore this change deliberately does not introduce delayed group CSS or depend on its retry behavior.

The previous page CSS minus its exact 4,006-character candidate-index rules is byte-for-byte equal to the new page CSS. Vite places those unchanged rules into a separate initial CSS file, adding one request and one trailing newline byte. The CSS is not omitted or re-created.

## Verification

- Full Node suite: 1,298 / 1,298 passing
- TypeScript: passed with --noEmit --incremental false
- Official Sites build: passed
- Real App server rendering: nonempty loading shell; no catalog or module reads started during SSR
- Focused route/resource tests: pending imports, deduplication, terminal failure, timeout, stale resolution/rejection, explicit guarded reload, unsubscribe, route precedence, independent CSS/content gates, focus/scroll and existing dirty/uncertain guards
- Editor implementation remains byte-identical to the baseline
- Browser QA of c6ddcaa: 390px had seven passing cases and one real failure. A native first-request 503 was retained in the browser module map; calling the same import again made no second request. That failure is retained as evidence.
- Frozen f1cfdc41 browser QA: import-error, timeout, guards, direct-groups and parallel-index passed at both 390px and 1280px in dot cloud Chromium, using fixed-width normal iframes (not device emulation).
- Actual first-request HTTP 503 and 31-second responses verify explicit user-triggered full-page reload into a new document at the same URL and module path. The App stays mounted before that explicit action; dirty cancellation and uncertain-save blocking preserve it. The reload guard cases use synthetic DOM markers; the separate guards case uses the real Editor and one synthetic failed save per width, with no successful writes.
- The initial 390px timeout run passed product recovery assertions but failed the outer URL oracle because its pending request had no completed ResourceTiming entry. The failed JSON is preserved. The corrected QA-only observer records the actual server GET path before the delay and strictly compares it to the new document's actual resource entry.
- Original c6ddcaa same-document 503 failure evidence is retained. The new result proves explicit guarded refresh recovery, not an in-place retry success. The narrowed f1cfdc41 browser pass did not repeat the old full matrix or separate search/CSS browser suites.

## Reproduce

Run node scripts/report-client-graph.mjs after the official Sites build to inspect current production JS/CSS dependency accounting. The optional argument selects another dist/client directory. Preserve the baseline report before rebuilding.

Run node tests/catalog-module-browser-build.mjs <output-directory> to build an offline synthetic browser fixture. It uses the real App, module loader, and native ESM splitting. Its Python HTTP server intentionally returns a real first-request 503 or delayed module response; the production import URL stays unchanged across the explicit new-document reload. There is no query-string cache busting, automatic reload, external API or production data. The error cases exercise an explicit guarded full-page reload into a new document, keeping the exact module URL. The fixture server records real module GET paths before responding, so pending timeout requests are observable even before ResourceTiming emits a completed entry.

Serve the generated directory with python3 server.py --directory <output-directory> --port 4173. It binds to 127.0.0.1. Open viewer-390.html or viewer-1280.html with ?case=<scenario>. Scenarios: home, direct-groups, direct-detail, mixed-ids, import-error, timeout, back-pending, guards, parallel-index. Restart the server between viewport batches to reset transport-failure counters. Inspect the outer #results JSON and preserve actual failures.

The existing catalog-name-search-browser and css-readiness-browser fixtures can also be rebuilt against this App to verify search/history and stylesheet/editor behavior.
