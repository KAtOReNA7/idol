# CSS readiness isolated candidate

Base: 3c9c6a02b2708c7d31e864e9daa74e99e927eebc.
Worktree: dot/css-readiness. No deployment or credentials used.

## Implementation

- Original 14 ordered static stylesheet imports retained (the expanded sheet covers two legacy groups). All 37 candidate experience styles emitted as URL assets, selected by exact full theme class. Artist route CSS remains unchanged.
- Document-owned stylesheet cache: load/error/15s timeout, explicit CSS-only retry, A/B/A cache reuse, stale event rejection, Strict Mode effect replay safety. No React resource-precedence ownership mixed with imperative links.
- App retains the same content and Editor component keys while hiding pending styles with visibility and inert. Error/retry does not fetch catalog/records, save, reset data, or remount content. Existing dirty/uncertain-save checks still control departure.
- Journey readiness combines data and selected stylesheet. Loading/restoration never writes hidden geometry or clears anchors/focus. Saved requested position stays immutable until real user interaction; font ready/loadingdone and ResizeObserver can correct layout beforehand. Cleanup does not unfreeze capture. Member-work focus shares the journey restoration driver; artist hooks retain their existing independent behavior.
- Existing unit harnesses updated only to recognize the new stylesheet import/dependency and to model user scroll as user input rather than programmatic scroll.

## Actually executed

- node --test tests/*.test.cjs: 930 passed, 0 failed/skipped (2026-10-16 03:02 UTC).
- tsc --noEmit --incremental false: exit 0.
- npm run build (official framework runner): exit 0.
- git diff --check: clean.
- 7 new production-TypeScript hook tests use simulated hooks/history/DOM/rAF/ResizeObserver/fonts. They cover Back860, Forward430 error/retry, stale callbacks, A/B/A, late layout/user takeover, dirty and uncertain-save guards, cleanup, ready-at-first-mount.
- 3 additional registry/import/precedence checks cover all 37 exact mappings and all original static imports.
- Main built CSS: 101279 bytes; previous unsplit measurement 311263 bytes. Reduction 209984 bytes (67.46%) refers only to the main CSS asset, not whole-page transfer or measured rendering time.
- Manifest main app CSS dependency: only page.Dh90uvSC.css. All 37 candidate CSS URLs exist; combined 210021 bytes; every url(...) reference matches its source. No font files removed/modified.
- Protected API, stage-source, group-detail, fonts and dependency/lockfile diff empty. Editor function unchanged.

## Still required before promotion

Real browser execution of the supplied synthetic React DOM fixture; production-equivalent cold/warm stylesheet timing, failed/retried CSS, browser Back/Forward, late fonts and focus; 320/390/1440 viewport and all theme visual checks. The isolated terminal Chromium route is blocked (socket sandbox; elevated wrapper fails before launch). No further retry of that route is intended. Existing simulated tests are not real React DOM/browser proof.

Use root's supported cloud browser fixture path for the remaining gate. No private production records are required. Rollback of this local candidate is simply withholding/cherry-pick-reverting its commit; this branch has not changed the live site.

## Static real React DOM fixture (built, not browser-executed here)

Rebuild with `node tests/css-readiness-browser.mjs --build-only /tmp/css-readiness-fixture`.
Serve generated `index.html` and `fixture.js` through the supported cloud browser's localhost static HTTP server. No Node runtime or API server is needed when viewing the output. Nine automatic scenarios and a rerun button report both visible JSON and `window.__cssReadinessResults`.

Fixture bundles the real production App/Editor and hooks. Editor lifecycle instrumentation is inserted into the bundle only. All fetches are intercepted with synthetic responses, including a deliberately pending save; no production endpoint is contacted. It checks the actual input DOM identity, draft, mount/unmount counts, records-read count, dirty and pending-save departure blocks across style failure/retry. CSS transport is held on real DOM link nodes; successful completion uses a native blob stylesheet load; failure is a dispatched link error. This validates DOM/hook integration when run, but does not replace real server/network CSS error testing or visual/theme verification. Font events are controlled, ResizeObserver is native in-browser. Fixture `.tsx` is intentionally `@ts-nocheck`; production TypeScript passes strict project compilation independently. The static builder has no browser-launch command.

The ninth fixture scenario covers memberWorkFocus: pending CSS and open modal do not steal outside focus; after modal closes and a layout/font retry, the exact trigger receives focus once, never the neighboring trigger. Browser execution is still pending.

## Supported cloud browser execution, 2026-10-16 03:18 UTC

Browser worker verify_live_v80_pages reports all 9 scenarios passing in the real dot cloud Chromium after fixture assertion fix dfc90f05dcc63da77c0f723c21f6805debc878ed. Bundle SHA256: 5b20b4ea0c1d262a1c9664cd68db158915d00d541741536b6792a19cc73280ee. The prior final three scenarios were interrupted by eager JSON.stringify of DOM nodes in assertion messages, so that previous run was inconclusive. The corrected assertion first compares Object.is and formats only genuine mismatches; exact DOM identity, mount, draft, fetch, pending-save and member-focus assertions remain intact and now pass in-browser. Browser worker is preserving full JSON/screenshots in css-readiness-browser-qa.

This closes the synthetic real React DOM integration gate, including the actual production App/Editor. It does not close real-network stylesheet error tests, 37-theme visual checks, or mobile responsive QA. Production code is unchanged by the assertion/evidence follow-up.

## Separate actual HTTP stylesheet/font fixture

Build: `node tests/css-http-fixture-build.mjs`.
Output: `/workspace/scratch/1274e297e819/css-http-fixture`.
Start in the supported cloud Terminal: `python3 /workspace/scratch/1274e297e819/css-http-fixture/server.py --directory /workspace/scratch/1274e297e819/css-http-fixture --port 8766`.
Open `http://127.0.0.1:8766/`, click the run-all button, and expand the results. `window.__cssHttpResults` mirrors the displayed JSON.

This second fixture uses the real production stylesheet hook, native link HTTP requests, and byte-exact official dist CSS: 3 base styles + all37 experience assets. All24 public/font directory files are copied, with15 actual font binaries listed for HTTP and FontFace decoding checks. It retains the separate earlier9-test App/Editor fixture unchanged. Its page is a synthetic detail-layout specimen, not a full artist page and not an Editor replacement test. No images, iframe, private catalog or production API are used.

Seven browser groups cover native first404/same-URL retry; real15s loader deadline against18s server delay/retry/stale response; real2s A/B/A; all37 CSSStyleSheets and exact paths; all15 font HTTP/FontFace loads; legacy14/home no candidate waiting; server-log confirmation of actual statuses, retries and request counts. Browser execution and 320/390/desktop inspection were handed to verify_live_v80_pages and remain pending at this entry.

Reproducible server verification: `python3 tests/css-http-fixture-server.test.py` passes7/7 using actual handler/in-memory HTTP streams and mocked sleep (no sockets). Checks first404/retry, distinct cases, timeout/delay planning, completed logs, exact40 CSS+15font bytes, HEAD/no-store and rejected API/path escape. TypeScript and builder syntax checks pass. Production source is unchanged by this fixture.

## Actual HTTP browser acceptance, 2026-10-16 03:29 UTC

The supported dot cloud Chromium passed all7 actual-HTTP groups, desktop viewport1180×757. Full initial-failure and final-pass JSON/logs are retained under `http-browser/` next to this report. The first run passed6/7: a server-only assertion incorrectly required a second timeout HTTP request. Its logs proved Chromium coalesced a new link's retry onto the original still-in-flight same-URL request (18s response200). No production cachebuster or retry behavior was changed.

The final scenario is stronger: after15087ms the loader showed error; the old link was detached; retry created a different link. It then switched to B at03:29:00.806Z, before the original A response completed at03:29:03.493414Z. B remained ready, and returning to A reused the successfully loaded retry link with a native CSSStyleSheet. The transport assertion accepts independently observed fresh-request or native in-flight-coalesced success; UI state, link identity, actual response200 and genuine late-arrival ordering remain strict.

All37 official compiled CSS assets loaded/switched with native CSSStyleSheets; all15 actual font binaries returned bytes and decoded with FontFace; all14 legacy themes plus home required no candidate stylesheet waiting. Native404/retry and actual2s A/B/A also passed.

Responsive observation used same-origin320/390 CSS iframe viewports, not device emulation: MEOVV320/idle390 and reverse manual switches were ready, compiled paths matched, and widths305/305 plus375/375 showed no horizontal overflow (15px scrollbar). Controls, synthetic inputs and font specimen were readable. This is not a full37 artist-page visual claim. Production implementation remains unchanged; only fixtures and this evidence were added.
