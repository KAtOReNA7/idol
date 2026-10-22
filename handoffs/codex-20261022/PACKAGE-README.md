# Codex handoff materials, 2026-10-22

This is a portable handoff-materials package, not an application source archive or a deployment. It includes only the reviewed documentation and three frozen candidate bundles listed below. Candidate product source, runtime images and fonts are included only where already present in those reviewed bundles; their bytes have not been changed.

## Repository mapping

All archive entries are repository-relative paths, ready to be staged in a separate directory for review before copying to the repository:

- `docs/codex/`: all eight current development documents, including `worklogs/TEMPLATE.md`, plus `ASTRA-HANDOFF.md`.
- `docs/codex/AGENTS-MULTI-MACHINE.md`: proposed additions for the repository root `AGENTS.md`. Review and merge relevant guidance into the existing root file; never blindly replace the existing root `AGENTS.md`.
- `handoffs/codex-20261022/combined-integration/`: 71 files; frozen GENBLUE/WOOAH combined candidate. Its 57 runtime overlay files remain byte-identical.
- `handoffs/codex-20261022/meovv-b/`: 14 files; MEOVV candidate handoff.
- `handoffs/codex-20261022/astra-izna-ifeye-v3/`: 35 files; the cleaned portable IZNA/ifeye candidate, not the older uncleaned unpacked copy.
- `handoffs/codex-20261022/PACKAGE-README.md` and `PACKAGE-SHA256.json`: this package guide and complete per-path integrity index.

## Complete source is a prerequisite

Before evaluating or integrating any candidate, the repository must contain the real complete production v186 application under `apps/idol-site`. The older Next sandbox at the repository root is not a substitute. This handoff package intentionally does not contain the complete v186 tree and cannot recreate that application by itself.

Production source provenance: commit `f0391481cccd85a4eb53cbe9bf63cdd77d30e350`, Git tree `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`, 3,954 files and 642,362,678 bytes. For a pristine import, the `apps/idol-site` subtree should match that tree. A deliberately changed baseline needs its own reviewed manifest and documented differences; do not treat the old sandbox or a candidate as equivalent to production.

Candidate manifests and before/after hashes are integration gates, not proof that a candidate has already been applied or released. Keep all three candidates isolated. Follow their own README and guard instructions; do not copy any candidate over production automatically. Do not combine or deploy them merely because they appear in the same archive.

## Repository delivery status

The exact v186 source import was pushed and read back at `f24075fc98893793e82adbc92cadc9e58257728f`. Documentation and all three isolated candidates are provided in the repository commit containing this guide; verify the actual branch and manifests on first checkout. No candidate was applied, built or deployed by this delivery.

The user confirmed the repository stays public and approved publication of the existing source score/note/watch snapshots on 2026-10-22 at 13:22 UTC. This is bounded to that existing data; it does not authorize future exports, credentials, new keys or production deployment.

This directory contains no full user snapshot bodies, credentials, server build output, dependencies, Git history or raw internal execution reports. Package metadata is not the repository root README.

## Integrity and boundaries

`PACKAGE-SHA256.json` lists every archive member except itself, including byte count, SHA-256 and source executable mode. Repository candidate integrity indexes below cover current files. Only portable README/status wording was corrected for the nested repository; those indexes record their original manifest SHA. Product/runtime files, patches and images remain unchanged:

- combined-integration `DIRECTORY-SHA256.json`: `aa2a6d88274c89a5224d10a3588e8e907d6224f50377a5c5358deac22c8b8d79`
- meovv-b `MANIFEST.json`: `f7a11dab4e4041550639e55b32612eedebc6615a6664c31f0dbaee06f36cb24d`
- astra-izna-ifeye-v3 `PORTABLE-MANIFEST.json`: `931850ab797511c5d14616e6b5c742095aafadb12cdc455d2520923e73666e3a`

The packaging check verified all listed original bytes and all 57 combined runtime after-hashes, checked for symlinks and unsafe archive paths, and found no matches for the tested common credential patterns or private execution-machine paths. This bounded scan is not a claim that every imaginable secret format can be detected.

No application build, test suite, source mutation, GitHub write or deployment was performed while producing this archive. Existing test claims remain historical claims from each candidate, not new test results produced by packaging.
