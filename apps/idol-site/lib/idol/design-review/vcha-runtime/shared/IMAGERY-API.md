# Reviewed imagery integration

`applyImagery(artist, manifest = imageryManifest)` runs at the end of public reconciliation. It performs no fetching, persistence, relationship creation, or source/date edits. Empty manifests return the original artist object.

`shared/imagery-targets.js` is the frozen identity projection of the original 252 empty image slots. It independently retains the target slot (`MV` / `STAGE`), exact runtime key, nullable production ID, candidate key, precise video ID, all parent-work IDs, original parent video types, stage kind and original video source URLs. A stage's parent `官方MV` source type is not relabelled as the stage's record type.

Only root-reviewed entries belong in `imagery-manifest.js`:

```js
{
  approved: true,
  target: { /* exact corresponding frozen imageryTargets row */ },
  asset: {
    key: 'a unique asset key',
    src: 'groups/<slug>/assets/<local downloaded image>',
    width: 480, height: 360, bytes: 12345,
    sha256: '<64 lowercase hexadecimal characters>',
    qualityLevel: 'card', // or primary; never candidate
    sourceUrl: 'https://<original public source page>',
    sourceImageUrl: 'https://<actual downloaded public image URL>',
    credit: '<retained attribution>',
    // Keep original bytes, watermarks, publisher/thumbnail role and any
    // transformations or review limitations in additional metadata fields.
  }
}
```

The function validates the frozen tuple against both the proposed entry and the current artist. It rejects duplicate slots, existing nonempty images, cross-group paths/identities, wrong parent/video/slot/type/source, missing integrity metadata and candidate-quality images. It updates only the target work's `image` and appends the exact image object to `artist.assets`. Production IDs and `projectReleaseId` remain unchanged.

Adopted assets gain `imageryManaged`, `noUpscale` and the exact `imageryTarget`. `helpers.image` applies `contain`, downloaded natural-pixel width/height limits and no image transform only to those new assets. Existing accepted image markup is preserved. These CSS rules do not constitute browser or visual acceptance.

The retained i-dle/NewJeans view adapters must match the exact runtime work key, copy the adopted image's `key` into that view's `imageKey`, include adopted `artist.assets`, and call `helpers.image` for managed images. Their original templates and old assets remain intact.

Checks:

```sh
node --test tests/imagery.test.mjs
node tests/audit-imagery.mjs --out=qa/imagery-integration-audit.json
node tests/audit-reconciliation.mjs --out=qa/imagery-content-audit.json
node tests/audit-stage-bindings.mjs --out=qa/imagery-stage-audit.json
node tools/content-conservation.mjs
```

`audit-imagery` needs `qa/imagery-baseline-before-adoption.json` in the delivered package. It compares every non-image work field and old asset against the actual restored source snapshot; checks actual adopted bytes, SHA and decoded dimensions; and runs the actual group render functions for library/detail image references and pixel caps. Its serialized HTML checks are not DOM or browser clicks. The baseline contains only public work/asset projections.
