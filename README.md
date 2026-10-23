# Idol：正式开发与跨电脑交接

正式工作目录是 [`apps/idol-site/`](apps/idol-site/)，不是仓库根的旧 Next sandbox。当前完整接续分支为 `codex/izna-native-integration`，从 `codex/wooah-native-integration` 的 `121f410` 接续，继承最初 `handoff/codex-20261022`。先读 [新电脑接续 RESUME](docs/codex/RESUME.md)；在未有明确合并记录前，不从旧 main 开始正式产品开发。

v186 原生源码已在提交 `f24075fc98893793e82adbc92cadc9e58257728f` 推送并读回核验：3954 文件、642362678 字节，应用子树 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`。其 Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350` 是来源身份，不是本仓库可 fetch 的 commit。当前文档与三个隔离候选随本次交接提交提供；首次检出仍须核实际分支、清单与素材。

## 接手入口

- [CODEX-FIRST-RUN：首次执行文件](docs/codex/CODEX-FIRST-RUN.md)
- [PRD](docs/codex/PRD.md)、[CURRENT-STATE](docs/codex/CURRENT-STATE.md)、[ACCEPTANCE](docs/codex/ACCEPTANCE.md)
- [STATUS：共享进度与任务索引](docs/codex/STATUS.md)、[多电脑规则](docs/codex/AGENTS-MULTI-MACHINE.md)、[任务记录模板](docs/codex/worklogs/TEMPLATE.md)
- [根 AGENTS](AGENTS.md)：适用于正式源码及整个仓库；先查活动分支/PR，每任务独立分支，代码和 worklog 同提交，换机前推送合规 WIP，不覆盖用户改动。

## 原始候选与当前接入状态

- [GENBLUE v2.2 / WOOAH v1.2 combined-integration](handoffs/codex-20261022/combined-integration/README.md)：原始冻结候选；GENBLUE与WOOAH已在当前分支接入并继续修订，不用旧候选覆盖新代码。
- [MEOVV B](handoffs/codex-20261022/meovv-b/README.md)：四段冻结 patch 与四份真实 owner readback；B 尚未上线，不能冒称已通过正式 Sites 完整包验收。
- [izna / ifeye v3](handoffs/codex-20261022/astra-izna-ifeye-v3/README.md)：保留原始15份源码、30图候选；本轮仅 izna 已接入正式工程的原生宿主、精确图片 resolver 与既有评分入口，ifeye 尚未接入。

线上主站仍是 v186 A-only；GENBLUE v10/WOOAH v12私有审阅页面已获人工认可。[izna 只读审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) 已发布 v13，保持 owner-private，等待用户确认；GitHub 实现已推送，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 以 WOOAH 分支为基线。发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`；线上浏览器未复验，未获用户明确确认前不得开发 ifeye 或下一团，公共功能除外。Figma 实际图片落地、11个精确视频预览缺口、80%/125%原生浏览器缩放、真实保存和主站全量发布仍未完成。

Astra 与 Sol 已收官，Sol最终反馈已归档为 [SOL-HANDOFF](docs/codex/SOL-HANDOFF.md)；有界交接入口复核不等于全部产品验收通过。完整原生源码足以继续，无需等待旧会话回复。

仓库保持公开。用户于 2026-10-22 13:22 UTC 已批准本次现有评分、备注、观看快照随源码公开；该批准不扩展到未来任意数据导出、密钥或凭证。公开读仍不等于开放写，owner-only 保存保护保持。没有当前生产发布授权时交预览，有明确授权后可按上线门槛继续。

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
