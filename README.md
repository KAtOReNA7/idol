# Idol integrated development main

Code-only mainline combining the reviewed core toolkit, duplicate-score fixes, and accepted UI integration. This repository is not the production deployment; publishing this source does not update the live site.

## Run
Node >=22.13. npm ci --ignore-scripts, npm run verify, npm run dev.

This sandbox contains the six released artist page components and shared UI logic, not the full production backend. Its catalog route returns a clearly labelled synthetic fixture of six groups, twelve fictional members and eighteen fictional works; add typed synthetic fixtures for UI testing, never export real user scores or notes. Official image files are excluded and image references replaced with a neutral SVG. Public researched editorial facts remain in artist content JSON; they are historical data, not fresh verification.

The /api/save route always returns HTTP 403; it never persists data. No production credentials, database snapshots, backup archives, management API, deployment workflow, or production write API are included. Do not deploy this sandbox over production. Work on independent branches and submit patches for integration into the maintained production source.

Bundled webfonts are excluded; system font fallback is expected. Member birthday values are omitted from the sandbox. No credentials or production environment variables are required.

## Member MV image preview

Member MV cards share a 4:5 frame, display the complete image with `object-fit: contain`, and open an accessible lightbox with Escape, close-button and backdrop dismissal. The close button receives focus; closing restores focus and page scrolling. Mobile cards stack without horizontal overflow.

The fixture has generated portrait (400×600), landscape (900×500), and missing-image cases. `/api/media` serves SVG drawings only for exact registered synthetic photo references; unknown records return 404. It performs no upstream image requests or production storage access. The fixture stays in snapshot mode and `/api/save` still returns 403.

Original member-image validation: `npm run verify` (12 tests and typecheck), `npm run build`, and Playwright checks of the shared member page plus all six artist pages at desktop and mobile widths. Bundled fonts remain intentionally excluded as above; font and favicon 404s are baseline asset omissions, not image-interaction failures.

## Integrated mainline (2026-10-15)

- Core source: PR #1, 1a3b8629de688a9aca844eac309bfb5056c7f5be. All 70 core/tool tests are retained.
- UI base: PR #2, b65bb8a666a03f8ea3044295cc4c7bc915efce1d.
- Accepted UI patch: local source commit 3f0527bcd97a1138d0595543aec4bda1d925c08a, SHA-256 c59c2d26092187c9b25b1d02babaa1aa0d1a189b1df5c76eb8bca14450cd8a86. Adds home rotation stability, group filtering, library state restoration, independent player lifecycle, and member return focus.
- Core conflict resolution: group-detail.ts and member-works.ts retain reviewed per-dimension duplicate-score resolution; all other accepted UI behavior is retained. Combined suite: 100 tests.
- Mainline work is maintained directly by dot. Saved cloud tasks are reserved for small capability/solution validations, not core project development.
- Synthetic APIs are development-only: save is blocked (403), media is a closed synthetic registry, and no real ratings, photos, credentials, or production backend are included.
- Source manifests exclude themselves to avoid circular hashes. Historical core-only documentation below is explicitly marked as historical.

Duplicate stage-score follow-up: duplicate works aggregate stage scores only when every row has a valid binding to the same full video/clip source key. Cross-video, cross-clip, missing and invalid bindings remain unscored. Three regression tests cover permutations, zero/null and conflicts.

## Cross-session collaboration / 跨会话协作

Before preparing tasks for Sol, Astra or another session, read [AGENTS.md](AGENTS.md) and the [跨会话派工与验收手册](docs/collaboration-playbook.md). The playbook records the 2026-10-21 source-handoff, preview-environment, image-verification and Figma lessons, with a reusable task template and evidence gates. It does not grant permissions or turn this sandbox into production source.
