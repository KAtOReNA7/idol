# Idol Lens

正式工程位于 `apps/idol-site/`。GitHub 的 `main` 保存用户验收版本，`codex/project-optimization-20261121` 承接后续开发。正式站为 v203。[当前状态](docs/codex/STATUS.md) · [运行与测试](apps/idol-site/README.md) · [开发路线图](docs/codex/PROJECT-AUDIT-AND-ROADMAP-20261121.md)

## 开发与交接

- [从新电脑接续](docs/codex/NEXT-COMPUTER-HANDOFF.md) · [协作约定](AGENTS.md)
- [本轮开发记录](docs/codex/worklogs/20261121-repository-and-routes.md) · [代码分支与恢复标签](docs/codex/evidence/20261121-repository-and-routes/github-consolidation.json)
- [内容研究的逐项决定](docs/codex/evidence/20261121-repository-and-routes/content-disposition.json) · [原始审查](docs/codex/FEASIBILITY-REVIEW-20261101.md)

## 历史文件的范围

根 [`SOURCE-MANIFEST.json`](SOURCE-MANIFEST.json) 和 [`docs/FILE-MANIFEST.json`](docs/FILE-MANIFEST.json) 是旧 sandbox 的历史清单，不能作为当前整个仓库的完整索引。原生 v186 的唯一基线清单是 [`docs/codex/SOURCE-MANIFEST.json`](docs/codex/SOURCE-MANIFEST.json)，只覆盖 `apps/idol-site` 内指定的 3954 文件。候选各用自己的清单；不要把候选或历史证据当成已上线状态。

以下内容仅说明保留的根 sandbox；其中运行命令、合成数据和历史测试结论不适用于正式工程。两套工程保留各自依赖/锁，根 tsconfig 已排除 `apps/idol-site` 和 `handoffs/codex-20261022`，不建立 workspace 或混编。

---

# 历史根 Next sandbox（2026-10-15）

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
- Historical execution arrangement (2026-10-15): direct dot development and cloud-only validation has been superseded by the Codex migration trial and shared GitHub worklogs. This paragraph does not restrict current Codex development.
- Synthetic APIs are development-only: save is blocked (403), media is a closed synthetic registry, and no real ratings, photos, credentials, or production backend are included.
- Source manifests exclude themselves to avoid circular hashes. Historical core-only documentation below is explicitly marked as historical.

Duplicate stage-score follow-up: duplicate works aggregate stage scores only when every row has a valid binding to the same full video/clip source key. Cross-video, cross-clip, missing and invalid bindings remain unscored. Three regression tests cover permutations, zero/null and conflicts.

## Cross-session collaboration / 跨会话协作

Before preparing tasks for Sol, Astra or another session, read [AGENTS.md](AGENTS.md) and the [跨会话派工与验收手册](docs/collaboration-playbook.md). The playbook records the 2026-10-21 source-handoff, preview-environment, image-verification and Figma lessons, with a reusable task template and evidence gates. It does not grant permissions or turn this sandbox into production source.
