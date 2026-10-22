# ifeye deployment-only original exclusion

Audited baseline: `c407c2e77f17da55f10b544526c874dfffc62102` (use the manifest's `auditCommit` for the exact authoritative baseline).

## Result

The seven unused `/artist/ifeye/batch-b-20261016/*-original.png` deployment copies total **18,205,847 bytes (17.36 MiB)**. The current approved ifeye hero, six portraits and group index all render the already retained `batch-b-20261016-webp-v1/*-display.webp` assets. No renderer synthesizes an original PNG URL. The member-work lightbox uses `/api/media` and is unrelated to these PNGs.

This change excludes only these seven copies from `dist/client`. Every source original stays in `public/` and Git, with its original SHA-256 and source Git blob recorded in the manifest. It does not re-encode, resize, replace, or modify any image. It does not change UI, private data, ratings, notes, watching status, source attribution, credentials, sharing, or server/client code.

## Measured artifact budget

The supplied `day19-group-font-spacing-release.tar.gz` contains exactly the same 2,178 regular files and bytes as the baseline `dist/` tree.

- Baseline file-content sum: 265,595,731 bytes
- Candidate file-content sum: 247,389,884 bytes
- File-content reduction: 18,205,847 bytes
- Baseline expanded tar: 267,386,880 bytes
- Candidate expanded GNU tar: 249,169,920 bytes
- Expanded-tar reduction: 18,216,960 bytes (includes removed tar entries/padding)
- Remaining space below 256 MiB: 19,265,536 bytes (18.37 MiB)

The new budget exceeds the requested 7 MiB additional margin by more than 10 MiB. Final packaging should measure its own generated tar; ordering/metadata/padding can differ.

## Safety checks

`audit-unused-ifeye-original-build-assets.mjs` is read-only. It allows exactly seven hard-coded paths, checks SHA-256 and size of each public original, every retained public/build WebP and every present excluded build copy, and pins eight runtime renderer/URL-selection files. It inspects runtime/data/public/vendor/root entrypoint and generated text files for direct or dynamic old-path references. Only one exact complete public-file routing inventory is exempt. Unknown inventories, modified hashes, symlinks, missing sources/displays, changed runtime guards, added references, or expanded allowlists abort before deletion.

`prune-unused-build-assets.mjs` validates this plan with all existing plans before deleting build copies. The existing display auditor's only new exception is for those seven already-pruned originals, and it runs the full new audit before accepting their absence. Originals for all other groups remain mandatory under that auditor.

## Reproduce

Apply `ifeye-build-budget.patch` to the audited source checkout, then run:

```sh
node --test tests/unused-ifeye-original-build-assets.test.mjs tests/prune-unused-display-assets.test.mjs tests/prune-unused-original-assets.test.mjs tests/unused-editorial-assets.test.mjs tests/duplicate-loona-build-assets.test.mjs tests/unused-unis-font-build-assets.test.cjs
NODE_PATH="$PWD/node_modules" node --test tests/candidate37.test.cjs tests/candidate-index-portraits.test.cjs tests/candidate-mv-look.test.cjs tests/image-core-state.test.cjs tests/image-lightbox-session.test.cjs
node_modules/.bin/eslint scripts/audit-unused-ifeye-original-build-assets.mjs scripts/audit-unused-display-assets.mjs scripts/prune-unused-build-assets.mjs tests/unused-ifeye-original-build-assets.test.mjs
node scripts/prune-unused-build-assets.mjs
# Review the reported plan, then apply only to the generated deployment:
node scripts/prune-unused-build-assets.mjs --apply
node scripts/prune-unused-build-assets.mjs --apply
# The repeated apply reports zero saved bytes.
tar -cf /tmp/ifeye-budget-candidate.tar dist
wc -c /tmp/ifeye-budget-candidate.tar
```

As with the existing exclusions, a fresh framework build recopies the public assets, so run the integrated pruner after building and before packaging. No change to `package.json` or the build framework is required.

## Verification completed

- 135 asset-audit tests passed, including 38 new tests for fixed scope, source/build identity, reference checks, renderer changes, path/symlink rejection, partial/idempotent application, and compatibility with the existing display auditor.
- 54 candidate renderer, image-state and lightbox regression tests passed.
- Changed JavaScript/test files passed ESLint.
- Integrated dry-run: 18,205,847 bytes; apply: same; repeated apply: 0 bytes.
- Bytewise comparison: exactly seven removed build files; zero changed retained files; zero added build files; every public file unchanged.
- The original repository remained clean at its original commit.

No framework rebuild, new browser QA, external write, credential use, publication, or deployment was performed. This is a build-tooling-only patch, verified against the already-built release artifact; retained runtime/assets are byte-identical.
