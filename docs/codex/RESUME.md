# 新电脑接续：女团网站

更新：2026-10-23，北京时间。本文是当前接续入口；不需要上一台电脑、聊天记录或临时构建目录。

## 先记住这几项

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | `codex/izna-native-integration` 的最新远端 HEAD |
| 正式工程 | `apps/idol-site/` |
| 本轮源码版本 | izna 实现提交 `c998df46a6cd258c11cbbf7a6fb7642a2bacee3b` 已推送并以 `ls-remote` 读回；后续接续仍取最新远端 HEAD。源分支检查点为 `121f410`，此前 WOOAH 网页代码为 `821f385f05f5923dc9efae6b4d3719500ac5c0e0` |
| 活动 PR | draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6)，base `codex/wooah-native-integration`、head `codex/izna-native-integration`；源分支为 [PR #5](https://github.com/KAtOReNA7/idol/pull/5)，上游为 [PR #3](https://github.com/KAtOReNA7/idol/pull/3) |
| 分支来源 | `handoff/codex-20261022` → `codex/genblue-native-integration` → `codex/wooah-native-integration`（`121f410`）→ `codex/izna-native-integration`；没有从旧 main 开发 |
| 当前阶段 | GENBLUE v10、WOOAH v12已确认；izna v13首屏收到“照片太小、两侧太空”的反馈，1440/390 Figma首屏已调整并导入实图，待审阅设计；网页尚未同步，整团未确认，不得开发下一团，公共功能除外 |
| 正式主站 | 仍为 v186 A-only；本轮不覆盖主站。izna 只读审阅发布与验证证据见本轮工作日志 |

**不要只检出最初 handoff 分支。** 它是来源基线，后续实际开发位于上面的任务分支。`main` 在本次保存时仍是旧 sandbox。先 fetch 并核对 PR/STATUS；只有新的明确合并记录才可以改变上述入口。

## 项目目的与用户决定

这是供用户认识女团及成员、观看具体 MV／舞台、记录评分和感想，并在成员、作品和历史之间连续探索的网站。每团保留独立设计语言，真实图片与中文名直接可见；共享数据和保存能力，不能做成统一模板换皮。

- 2026-10-22：用户确认 GENBLUE v10，“这一版可以 继续开发吧”。
- 2026-10-23：WOOAH 按用户三项反馈修正为团照首屏、五人同组、统一4:5成员照片；用户随后回复“OK 保存目前开发进度”，作为本次页面确认与保存要求记录。
- 2026-10-23 接续开发：从 WOOAH 分支最新远端 `121f410` 继续，第三团 izna 的原生集成已实现，v13 私有只读审阅已发布；等待用户明确确认，不将发布成功写成人工验收通过。
- 2026-10-23 首屏反馈：用户要求照片更大、两侧简洁，先调整Figma；桌面1440/手机390首屏和真实团照已改好并检查实际截图、get_design_context。网页仍为v13，下一步按设计审阅取舍同步正式首页；详见 [本轮记录](worklogs/20261023-izna-hero-figma.md)。
- 页面确认不等于真实保存、精确视频配图、全部响应式检查或正式主站上线已经完成。
- 后续仍执行：**每次只推进一个团，完成后给网页地址，用户明确通过才开始下一个团；公共功能除外。** 当前停在 izna 审阅阶段，不开发 ifeye 或其他下一团。
- 保留用户评分、备注、观看状态、稳定 ID、owner-only 写入与原图。用户批准的既有快照已在公开仓库；不扩大到新敏感数据或凭证。

## 新电脑检出

在一个新的空目录执行（Windows PowerShell、macOS/Linux 均可；不要覆盖已有工作目录）：

```sh
git -c core.autocrlf=false clone --branch codex/izna-native-integration https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git branch --show-current
git log -5 --oneline
```

已有仓库先检查 dirty 和改动归属，再 fetch；只在工作树允许时切换/快进，不执行丢弃改动的 reset、clean 或 force push。保持 LF 和原图字节，不为了命中旧清单重置合法后续增量。克隆**完整仓库**，专项测试需要 `handoffs/` 的已跟踪 fixture。

读取顺序：本文 → [根 AGENTS](../../AGENTS.md) → [STATUS](STATUS.md) → [PRD](PRD.md) → [设计要求](../design-requirements.md)／[协作手册](../collaboration-playbook.md) → [ACCEPTANCE](ACCEPTANCE.md) → 本任务最新 worklog。`CURRENT-STATE.md` 主体是迁移时的历史快照，最新版本和人工决定以 STATUS 与本文为准。

## 安装、启动和验证

普通电脑要求 Node.js **≥22.13.0**、Git、npm。使用 `apps/idol-site/package-lock.json`；不要运行根 sandbox 的命令，也不要只因依赖有 Next 就改用 Next CLI。实际运行是 Next 路由/API 风格 + Vinext/Vite + Cloudflare Worker。

```sh
cd apps/idol-site
node --version
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

`install:ci` 调用本工程锁定的 npm ci，包含 dev/optional 依赖，只启动一个安装器。普通电脑干净检出默认为 portable，开发服务器从5173端口开始；本轮浏览器打开终端实际地址下的 `/artists/izna`，同时保护 `/artists/wooah` 与 `/artists/genblue`。不要把前一台电脑的 node_modules、dist、.sites-runtime 或 .wrangler 复制过来。

已存在的针对性验证入口（在 app 目录运行）：

```sh
node --test tests/izna-native-integration.test.cjs tests/izna-review-catalog.test.mjs tests/izna-review-routing.test.mjs tests/izna-review-isolation.test.mjs
node --test tests/wooah-native-integration.test.cjs tests/wooah-timeline.test.cjs tests/wooah-review-routing.test.mjs tests/wooah-review-isolation.test.mjs
node --test tests/prune-unused-display-assets.test.mjs
node --test tests/genblue-native-integration.test.cjs tests/genblue-review-routing.test.mjs tests/artist-navigation.test.cjs tests/artist-roster-return.test.cjs tests/navigation-save-guard.test.cjs
```

按本次修改范围选择验证，不必每次跑全库。实际命令和结果写进 worklog；没有 `npm run verify`，那是旧根沙箱的命令。

普通电脑完整构建及本地 Worker 预览：

```sh
npm run build
npm start
```

`npm start` 使用本机生成的 `dist/server/wrangler.json`，不是发布命令。本地 D1/R2 不会随 clone 自动取得生产内容，模拟登录也不等于站点 owner；不得通过修改权限或导入真实记录来掩盖本地缺失。新电脑 fresh-clone 安装与浏览器尚需实际验证，不能继承旧机器测试通过结论。

若在 ChatGPT Sites 环境，先读当前安装的 **Sites skill**，按其官方安装、预览、构建、源码打开和发布流程操作；不要复制旧机器插件绝对路径。managed-linux 的 `terminal.local:4173` 只是内部 QA 地址。上一会话 browser URL policy 已拒绝且未绕过；新环境需按当前支持和权限判断能否验证，不能为避开明确拒绝改通道。

## 当前成果与入口

| 范围 | 已保存成果 | 尚缺 |
| --- | --- | --- |
| GENBLUE | BlueCut 原生接入、成员/MV双向入口、夜市王具名MV图、评分步进及静态入口修复；v10页面获认可 | 开发侧真实浏览器与真实保存未验；精确视频预览缺口见该团worklog |
| WOOAH | 原生实图页面、6份含历史成员档案、24视频、56条精确成员/MV关系、5个时间轴作品入口、资料来源修订；v12布局获认可 | 24个精确视频预览图、真实浏览器/视口/缩放、真实保存未验 |
| 公共部署 | 原图保留守卫、独立只读审阅构建和物理HTML入口 | 完整主站展开TAR容量、真实生产发布未完成 |
| MEOVV B | 四段patch及readback已跟踪 | 未发布，需重新核对最终pins与完整归档 |
| izna | 独立页面原生接入；7份含历史成员档案、8项只浏览发行、15个影像槽位、12条具名MV关联；20张原图与严格resolver，评分/手帐及返回接线已实现；审阅v13已发布 | 待用户确认、线上浏览器未复验；Figma实际图片落地、11个精确视频预览、80%/125%原生浏览器缩放、真实保存与主站全量发布未完成 |
| ifeye v3 | 原始源码与素材保留在隔离候选中 | 尚未原生接入；izna获明确用户确认前不开发 |

已确认的页面：

- [GENBLUE](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html)
- [WOOAH](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)

本轮待用户确认的入口：[izna v13](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)，已发布，只读、owner-private。发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`；线上浏览器未复验，`open_in_codex` 返回 queued 仅代表排队打开，不计网页加载通过。

关键代码（相对 `apps/idol-site/`）：

- `app/artists/izna/page.tsx`、`components/izna/`、`lib/idol/izna-native.ts`、`lib/idol/izna-runtime/`、`data/izna-editorial.json`、`data/izna-assets.json`：本轮izna独立页面、精确身份接线与原图resolver。
- `app/artists/wooah/page.tsx`、`components/wooah/`、`lib/idol/wooah-*.ts`、`data/wooah-editorial.json`：WOOAH真实组件、关系与资料。
- `data/public-artist-navigation-keys.json`：团体导航键注册，保留已有团体。
- `review/izna/`、`scripts/build-izna-review.mjs`：本轮只读审阅层；既有 `review/wooah/`、`scripts/build-wooah-review.mjs`、`scripts/build-genblue-review.mjs` 继续保留。
- `scripts/audit-unused-display-assets.mjs`、`scripts/unused-display-assets-manifest.json`、`scripts/prune-unused-build-assets.mjs`：保留使用中的原图，改构建后重新审核pins，不能盲目刷新或关闭guard。
- `public/artist/wooah/`、`public/fonts/wooah/`：既有原图和字体；不重传或生成替代真人图。

详细证据：

- [izna原生接续与发布验证](worklogs/20261023-izna-native-integration.md)：本轮实际代码、验证、发布状态与下一步，以该日志的精确版本为准。
- [WOOAH原生接续](worklogs/20261022-wooah-native-integration.md)
- [WOOAH三项布局修正](worklogs/20261023-wooah-layout-feedback.md)
- [GENBLUE原生审阅](worklogs/20261022-genblue-review.md)／[链接修复](worklogs/20261022-genblue-routefix.md)
- [此前两团保存检查点](worklogs/20261023-resume-checkpoint.md)

WOOAH修正版代码提交上的已执行结果：类型检查与干净原生构建通过，20项相关回归及37项资源守卫通过，完整剪枝 dry-run 通过且未apply。用户截图被用于发现问题；新版本并没有开发侧真实浏览器截图，不伪称布局自动验收通过。上轮client计算小计279689865 B不是生产TAR；旧轮271.328125 MiB TAR只是历史测量，不能作为新包大小。

## 审阅站与正式主站必须分开

| 对象 | Site ID / 状态 |
| --- | --- |
| 私有只读审阅站 | `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`；保留owner-private；izna v13已发布，用户确认与线上浏览器复验待补 |
| 正式主站 | app内 `.openai/hosting.json` 的 `appgprj_6acb4fa532b88191ae2588c24b724b17`；仍为v186，未获本轮覆盖授权 |

历史v12审阅 Sites source：`fff05becda0f21d25794cec6f5ce3275425574af`；版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_d68d3c6bd4988191a6fd8b849d0bc2a6`；部署 `appgdep_6ada3ad6a8dc81919bedc3b19fb37abe` succeeded。这些是 Sites 标识，不是 GitHub commit，也不是本轮izna发布证据。本轮发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`。

本轮izna v13审阅 Sites source：`a6a8ff71a759de6936a0285a0ebdf18a6a69eb63`；版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_7dab03eccdc48191a221738c7b7f1eb8`；部署 `appgdep_6adb070706dc81919e413e71a4b9eb9f` succeeded。该成功仅确认审阅站发布，不能代替用户确认、线上浏览器或真实保存验收。

本轮审阅产物可以从GitHub代码重建：`node scripts/build-izna-review.mjs --out <仓库外专用绝对目录>`。它是**增量输出**，没有站点根index/hosting配置，不能单独拿它覆盖现有审阅站；要先通过Sites官方源码流程打开上述审阅站，保留根入口、GENBLUE、WOOAH及访问配置，再合入izna产物。评分、备注及个人照片均已净化为空，非GET/API写入拒绝，不冒充真实手帐。

部署源码与完整当前静态站保存在Sites source repository，正式开发代码及所有重建脚本保存在GitHub；不依赖旧机器临时输出。源凭证由当前授权的Sites流程获取，绝不放进文档、命令行或GitHub。完整生产包仍须按实际展开TAR检查256 MiB上限并留至少2 MiB余量，不能拿gzip大小或部分资源小计代替。

## 下次从哪里继续

1. 先核对 `codex/izna-native-integration` 最新远端、STATUS、本轮工作日志和活动PR；确认没有另一台电脑已开始同一任务。禁止回到旧main或重新覆盖旧候选。
2. 核对已发布的izna v13、draft PR #6及本轮验证记录；线上浏览器尚未复验，在支持的环境补查。已确认的GENBLUE/WOOAH页面继续保护。
3. 当前izna处于首屏反馈修改阶段：Figma1440/390稿已调整、网页未同步。审阅后按用户取舍同步正式首页并交新网页；**用户明确确认整团前不得开发ifeye或下一团**，公共功能例外。
4. Figma首屏团照已落地，其他图片/页面仍待完成；11个精确视频预览、80%/125%原生浏览器缩放、真实保存和主站全量发布仍未完成；分别记录，不以实现、构建或其他视口通过替代。
5. 每轮将代码、验证、阶段、阻塞和下一步同提交推送GitHub，更新STATUS和接续入口。不要把未合入的WIP写成main或生产已完成。

与本次交付无关的未跟踪临时图片已保留、未提交；新电脑恢复工程不依赖它。
