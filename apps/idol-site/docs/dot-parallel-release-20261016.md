# Shared frontend candidate alongside Astra batch B

Base: c0a1422dcf4d733e84c9b03a32926f17b70a76c0. Astra owns32 scoped content/design/asset modules; this candidate changes shared rendering only. No production data mutation, no image replacement, no model/API integration, no new permission or credential is part of the patch.

## Held stylesheet candidate, excluded from this release
- Keep the original14 static experience imports in order, including shared candidate base.
- Move only37 candidate experience sheets to Vite URL assets selected by the exact rendered experience class. Preserve the previous theme ternary byte-for-byte; legacy groups retain priority in collaborations.
- Render the selected stylesheet as a React stylesheet resource, not in an effect. A pending stylesheet must not reveal an unstyled new theme. Actual production transitions still require verification after publication.
- All37 assets exist; original font references and font files unchanged. Observed build comparison before body-component addition: main page CSS311263→101279bytes, down209984bytes. This is a bundle measurement, not an end-to-end latency or total initial-page claim.

The stylesheet experiment has been separated from the publishing checkout. Existing37 static imports remain in the release. A reviewer identified a potential late-style versus Back-scroll race; it requires readiness/failed-load integration and dedicated interaction tests before release. The measured reduction is not currently online.

## Native loading recovery
The candidate loading status contains a normal empty-href anchor. It works without hydration and keeps the current path/query under browser URL resolution. This is a recovery affordance, not proof that the earlier WOOAH hydration issue has been diagnosed or eliminated. Existing30-second read deadline, abort behavior and late-result protections remain intact.

## Optional physical-profile facts
A shared component is connected to all existing member-detail implementations and the generic member page. No approved fields means no rendered section. Individual missing fields are omitted completely.

The curated registry uses stable member ID plus exact stage name, explicit verification, HTTPS provenance, source kind, check date, historical scope, and positive finite measurements. Body circumferences additionally require known birth date and source-publication date proving adulthood both at publication and now. No photo inference, fan guesses, health interpretation or body rating is introduced.

Initial verified facts are historical: WONYOUNG173cm from a2021 MBC self-disclosure, SOYEON44.8kg from a2022 MBC broadcast scale reading. Both sources were read directly by research and root. They must display their dates and historical disclaimer, never current measurements. The registry changes only presentation evidence; it does not write original member fields.

Astra's per-group evidence JSON is not automatically trusted or loaded. Root must check identity, values, sources and dates, then integrate accepted fields into the shared verified registry. No new fetch is made from the browser to research sources.

## Verification boundaries
Dedicated tests cover all37 mappings, legacy import order and theme priority, native anchor/query behavior, complete hiding of unknown measurements, exact identity, unsafe/future evidence rejection, adult-date gating, partial data and real React output. Existing test harnesses load the actual new display component and pure stylesheet map; no existing assertions are removed.

Full type/build/unit results, static320/390 screenshots, and production interaction checks are recorded independently. Static or SSR tests are not production/browser transition validation.

## Integration update, 2026-10-16 03:33 UTC

The earlier hold above is superseded for the combined candidate. The separate CSS-readiness implementation was reviewed and fast-forwarded after all930 unit tests, strict type check, official build, nine real React browser scenarios and seven real HTTP scenarios passed. The HTTP fixture verified native404 retry, the15-second timeout, a new retry link, switching to B before the old A response completed, and return to the loaded A cache. All37 compiled CSS assets and15 font binaries loaded; representative320/390 samples had no horizontal overflow. These remain local synthetic tests, not a claim of production latency or complete51-page visual revalidation. Owner-private deployment and fresh before/after data checks are handled separately.
