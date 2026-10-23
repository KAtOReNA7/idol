# 新电脑接续：女团网站

更新：2026-10-23。本文是当前入口，不依赖上一台电脑或聊天记录。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/hearts2hearts-review-completion` 最新远端 HEAD** |
| 正式工程 | `apps/idol-site/`；根目录是旧 Next sandbox |
| 本轮基线 | `abe3b0476d6585d0d2986182f90403106125fe7f`，`codex/ifeye-native-integration` |
| PR | 本轮 draft [PR #9](https://github.com/KAtOReNA7/idol/pull/9)，base为ifeye活动分支；上游 [PR #8](https://github.com/KAtOReNA7/idol/pull/8) 保留，未合并 main |
| 当前阶段 | GENBLUE v10、WOOAH v12、izna v15、ifeye v16 已获页面确认；**Hearts2Hearts v17 待人工验收** |
| 最新交付 | [Hearts2Hearts 验收页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/hearts2hearts/index.html) |
| 已推送代码 | `887b20ab9ab191d5ea2be274d0c2b454eb429b4a`；其后文档回填以最新远端HEAD为准 |
| 最新证据 | [工作日志](worklogs/20261023-hearts2hearts-review-completion.md)、[验证目录](evidence/20261023-hearts2hearts-review-completion/) |
| 正式主站 | 仍 v186 A-only，本轮未覆盖 |

分支链：`handoff/codex-20261022` → `codex/genblue-native-integration` → `codex/wooah-native-integration` → `codex/izna-native-integration` → `codex/izna-review-followup` → `codex/ifeye-native-integration` → **`codex/hearts2hearts-review-completion`**。不要从旧 main、最初 handoff 或旧检查点重新开始。

## 项目目的与有效决定

网站让用户认识女团与成员，按具体 MV／舞台观看、记录评分和感想，并在成员、作品和历史间连续探索。每团保留独立视觉，真实团照、具名成员图、中文名、准确阵容和精确视频身份是基础；共享数据和保存契约，不用通用模板替代团体设计。

- 用户本轮“已确认，继续开发”确认 ifeye v16。本轮只推进 Hearts2Hearts，v17 已发布。
- **一次一个团，交网页后等用户明确确认，再开始下一团；公共功能除外。现在等 Hearts2Hearts 确认。**
- 页面确认不代表全部设计待办、资料、真实保存或主站发布通过。历史未验项保留。
- 稳定 ID、用户评分/备注/观看状态、原图与 owner-only 写保护必须保留。此前既有快照公开批准不扩展到新增私人数据或凭证。

## 检出与运行

新目录：

```sh
git -c core.autocrlf=false clone --branch codex/hearts2hearts-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git branch --show-current
git log -5 --oneline
```

已有工作树先保留改动，fetch、比较再切换/快进；禁止 reset/clean/force push。完整取得仓库，测试会用 handoffs/fixture；不复制旧机器依赖、构建或凭证。

阅读：本文 → 根 AGENTS → STATUS → PRD → 设计要求/协作手册 → ACCEPTANCE → 最新 worklog。CURRENT-STATE 是迁移时历史快照。

普通电脑需要 Node≥22.13.0、Git、npm。实际框架为 Next 路由/API风格 + Vinext/Vite + Cloudflare Worker，不能改跑根 sandbox 或 Next CLI。

```sh
cd apps/idol-site
node --version
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

从实际终端地址打开 `/artists/hearts2hearts`。普通电脑默认为 portable，端口从5173起；`npm run build` 构建、`npm start` 运行本地 Worker，不等于生产发布。D1/R2 内容不会随 clone 取得，不改权限或导入真实记录掩盖缺失。

Sites 环境读当时 Sites 技能，用官方 install/preview/build/source workflow。本轮 managed Linux 使用 `terminal.local:4173` 内部 QA；Browser 插件 js 未暴露，使用技能允许的 CUA。不能将 iframe 当顶层真视口，不能从部署成功推出用户浏览器可达性。

## 本轮代码与验证

- 原生修改：`components/hearts2hearts-artist.tsx`、团页 CSS、两份原素材绑定 JSON。
- 新原图：`public/artist/hearts2hearts/portraits/`，8张官网具名 JPEG，均1000×1000、SHA与旧原图记录相同；来源清单 `data/hearts2hearts-portraits.json`。
- 新审阅：`review/hearts2hearts/`、`scripts/build-hearts2hearts-review.mjs`、公开白名单资料 `data/hearts2hearts-review-editorial.json`。真实团体组件、共享手帐 App 与11事件历程；8成员、13作品版本、10舞台绑定、2条只观看替代现场、64已有关系。个人字段净化，禁止真实写入。
- 页面：集体照首屏，等大成员网格，成员/精选发行搜索，原图查看，空结果，详情/作品/成员/历程往返与搜索恢复。
- 静态审阅必须使用物理 `index.html` 地址，防止目录重定向丢查询；构建适配器只改变此审阅包的 URL 表达，保留原生安全/dirty/save/history 守卫。共享生产 hook、API、权限、快照和依赖未改。

```sh
NODE_PATH="$PWD/node_modules" node --test tests/hearts2hearts-*.test.*
NODE_PATH="$PWD/node_modules" node --test tests/artist-navigation.test.cjs tests/ifeye-review-catalog.test.mjs tests/ifeye-review-routing.test.mjs tests/ifeye-review-isolation.test.mjs
node scripts/build-hearts2hearts-review.mjs --out /absolute/dedicated/scratch/output
```

57 项专项 + 27 项回归通过；类型无错误；正式构建成功。最后 referrer 适配改动后11项路由/构建再次通过。审阅目录需为空、仓库外且专用，构建器不会覆盖无关站点；它只输出本团增量，不是全站替换包。需把增量加入当前审阅站，并核对旧文件 SHA。

本地桌面实测成员→MV→舞台→返回、发行筛选往返、历程事件往返及焦点、原图 Escape、只读状态、舞台替代版本说明。首页/成员/发行在320/390/1440/2048/2560 iframe宽度无溢出，八图等大并解码；不包含五种顶层设备或80%/125%缩放。浏览器截图和限制见工作日志。

## 发布与接续边界

审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 保持 owner-private。v17 succeeded；Sites source `7cbb32739686fce2240c0444fc632fc3398123e3`，展开 TAR 36,833,280字节、172文件。此前149审阅文件SHA不变。Sites源提交不等于GitHub提交，必须分别记录。

下一步先处理 Hearts2Hearts 人工反馈；确认前不开发下一团。待补：精确视频海报/同MV成员图、其余Figma内页/官网/Spotify视觉核验、真视口/缩放、线上浏览器、真实owner保存及正式主站包。Moonride缺已有成员关系，未虚构；外部YouTube缩略图失败保留fallback。当前三张发行是精选，不是完整最新目录。

此前 GENBLUE/WOOAH/izna/ifeye 的未验项继续保留，见各自日志。生产剪枝仍有旧izna引用阻断、ifeye旧审计fixture3失败；本轮未apply或放宽pins，不能据v17审阅成功推出生产全量包通过。

每轮代码、验证、阶段和下一步同提交到GitHub，并读回最新HEAD。此次环境gh写认证不可用，使用GitHub连接器创建blob/tree/commit/ref和draft PR；不要反复重试已失败凭证，也不要强推。原图与验证截图都已随任务分支保存。若其他电脑已有后续提交，先比较保留双方成果。

## 新电脑一句指令

【请检查 GitHub 仓库 KAtOReNA7/idol 的最新远端进度，检出 codex/hearts2hearts-review-completion，先读 AGENTS.md、docs/codex/RESUME.md、STATUS.md 和最新 worklog，在 apps/idol-site 接续；当前等 Hearts2Hearts v17 人工验收，未确认不开始下一团，保留已认可页面和真实数据，每轮将代码、验证、阶段和下一步提交回 GitHub。】
