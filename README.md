# Idol：正式开发与跨电脑交接

正式工程是 [`apps/idol-site/`](apps/idol-site/)，当前接续基线是远端最新 `main`。先检查并保护本地修改，显式 fetch，再从 `origin/main` 创建新的 `codex/` 任务分支。根目录 Next sandbox 与 `handoffs/` 中冻结候选只保留历史，不用于覆盖正式站。

正式站 [Idol Lens](https://idol-lens-private.wuke40758.chatgpt.site/) 已上线 **v190**。线上2121认人图绑定/707缺图；N候选已推送，仓库2122绑定/706缺图、628封面，A–N已导入。N在Sites文件上传层超时，尚未上线；43旧低清和18未知统计仍开放。51团已确认视觉、原图、稳定ID、个人数据和owner保存鉴权保持。GitHub合并不等于重新部署。

## 接续与整理记录

- [跨电脑快速接续](docs/codex/NEXT-COMPUTER-HANDOFF.md)
- [当前状态](docs/codex/STATUS.md) · [下一步](docs/codex/RESUME.md) · [首次执行](docs/codex/CODEX-FIRST-RUN.md)
- [主线整理报告](docs/codex/mainline-consolidation-20261026.md) · [全部分支SHA与处理方式](docs/codex/mainline-branch-inventory-20261026.json)
- [N批完整报告](docs/codex/identity-gap-n-report-20261027.md) · [706缺图的逐条清单](docs/codex/reports/20261027-gap-n/ledger.html)
- [多电脑协作](docs/codex/AGENTS-MULTI-MACHINE.md) · [协作入口](AGENTS.md)

旧逐团PR和分支已完成内容统一进入主线；独立旧沙盒照片共识与Sol交接分支保留待评估。已合分支使用 `archive/20261026/<原分支名>` tag保留原HEAD，可按清单恢复。历史的待验收/未合main/旧版本描述不覆盖当前状态。

仓库保持原有可见性。既有公开源码授权不扩展到未来任意数据导出或凭证；公开读不等于开放写。

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
