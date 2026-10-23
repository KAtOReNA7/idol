# 新电脑接续：女团网站

更新：2026-10-23。本文是当前入口，不依赖上一台电脑或聊天记录。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/kiiikiii-review-completion` 最新远端 HEAD** |
| 正式工程 | `apps/idol-site/`；根目录是旧 Next sandbox |
| 本轮基线 | `62ca3f61e3059c60a4b0558bc73b12e624ca2e1c`，`codex/hearts2hearts-review-completion` |
| PR / 代码提交 | 推送后回填；上游 draft PR #9 保留，未合并 main |
| 当前阶段 | GENBLUE v10、WOOAH v12、izna v15、ifeye v16、Hearts2Hearts v17 已获页面确认；**KiiiKiii v18 待人工验收** |
| 最新交付 | [KiiiKiii 验收页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/kiiikiii/index.html) |
| 最新证据 | [工作日志](worklogs/20261023-kiiikiii-review-completion.md)、[验证目录](evidence/20261023-kiiikiii-review-completion/) |
| 正式主站 | 仍 v186 A-only，本轮未覆盖 |

分支链：handoff/codex-20261022 → GENBLUE → WOOAH → izna → izna-followup → ifeye → hearts2hearts → **codex/kiiikiii-review-completion**。各完整分支名见历史日志，不从旧 main 或最初 handoff 重新开始。

## 项目目的与有效决定

网站让用户认识女团与成员，按具体 MV／舞台观看、记录评分和感想，并在成员、作品和历史间连续探索。每团保留独立视觉，真实团照、具名成员图、中文名、准确阵容和精确视频身份是基础；共享数据和保存契约，不用通用模板替代团体设计。

- 用户本轮“已确认，继续开发”确认 Hearts2Hearts v17。本轮只推进 KiiiKiii，v18已发布。
- **一次一个团，交网页后等用户明确确认，再开始下一团；公共功能除外。现在等 KiiiKiii 确认。**
- 页面确认不代表全部设计待办、资料、真实保存或主站发布通过。历史未验项保留。
- 稳定ID、用户评分/备注/观看状态、原图与owner-only写保护必须保留。此前既有快照公开批准不扩展到新增私人数据或凭证。

## 检出与运行

```sh
git -c core.autocrlf=false clone --branch codex/kiiikiii-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git branch --show-current
git log -5 --oneline
```

已有工作树先保留改动，fetch、比较再切换/快进；禁止reset/clean/force push。完整取得仓库，测试会用handoffs/fixture；不复制旧机器依赖、构建或凭证。

阅读：本文 → 根AGENTS → STATUS → PRD → 设计要求/协作手册 → ACCEPTANCE → 最新worklog。CURRENT-STATE是迁移时历史快照。

普通电脑需要Node≥22.13.0、Git、npm。实际框架为Next路由/API风格 + Vinext/Vite + Cloudflare Worker，不能改跑根sandbox或Next CLI。

```sh
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

从实际终端地址打开 `/artists/kiiikiii`。普通电脑默认为portable，端口从5173起；`npm run build` 构建、`npm start` 运行本地Worker，不等于生产发布。D1/R2内容不会随clone取得，不改权限或导入真实记录掩盖缺失。Sites环境读当时技能、用官方install/preview/build/source workflow；云端localhost不是用户验收地址。

## 本轮代码与验证

KiiiKiii原生组件/CSS、资料JSON、五张同一历史系列具名刊载照片，等大3:4成员卡片；成员搜索/详情/原图，六项发行搜索/详情，两张精确Bugs视频图，9视频/8舞台/7事件/30既有关系及真实共享手帐往返。共享导航只增加该团六项release白名单。成员原私有图片引用留存，快照和权限未改。

`review/kiiikiii/`、`scripts/build-kiiikiii-review.mjs`、`data/kiiikiii-review-editorial.json` 构建时净化个人字段；仅静态只读，不写真实手帐。物理 `index.html` 保留查询；构建只输出本团增量，必须添加到原QA站并核旧文件SHA，不当全站替换包。

```sh
NODE_PATH="$PWD/node_modules" node --test tests/kiiikiii-*.test.* tests/artist-navigation.test.cjs tests/hearts2hearts-*.test.*
node scripts/build-kiiikiii-review.mjs --out /absolute/dedicated/scratch/output
```

最终114过0失败（43专项、71回归），类型0错误，正式构建成功。浏览器实际成员→MV→舞台→返回、发行筛选往返、历程往返及焦点、原图Escape、搜索刷新均通过。七页五宽iframe无横向溢出，非顶层真视口/缩放。详细证据与限制见日志。

## 发布与接续边界

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，owner-private **v18 succeeded**；Sites source `3b6233d7537e92830e393f7e167007717daf2c21`。本地展开TAR40939520字节、193文件；171旧审阅文件SHA不变。Sites源码提交不等于GitHub提交，分别记录。

下一步先处理KiiiKiii人工反馈。待补：Figma实图/内页、官网/Spotify完整视觉核验、七项精确视频图和同MV成员图、顶层真视口与80%/125%缩放、线上浏览器、播放/真实owner保存及主站全量包。外部YouTube缩略图失败保留fallback。照片明示2025出道时期，发行精选截至2026-10-15，不宣称最新完整资料。

其他团未验项保留。旧izna剪枝引用阻断、ifeye旧审计fixture3失败仍在，未执行apply或放宽pins；不能据审阅成功推出生产全量包通过。每轮代码、验证、阶段和下一步同提交到GitHub并读回。此环境gh写认证不可用，使用GitHub连接器blob/tree/commit/ref与draft PR，勿反复重试失败凭证或强推。

## 新电脑一句指令

【请检查 GitHub 仓库 KAtOReNA7/idol 的最新远端进度，检出 codex/kiiikiii-review-completion，先读 AGENTS.md、docs/codex/RESUME.md、STATUS.md 和最新 worklog，在 apps/idol-site 接续；当前等 KiiiKiii v18 人工验收，未确认不开始下一团，保留已认可页面和真实数据，每轮将代码、验证、阶段和下一步提交回 GitHub。】
