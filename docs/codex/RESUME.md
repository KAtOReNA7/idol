# 新电脑接续：女团网站

更新：2026-10-23 晚间，北京时间。本文为当前入口，不需要上一台电脑或聊天记录。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/izna-review-followup` 最新远端 HEAD** |
| 正式工程 | `apps/idol-site/`；仓库根是旧 Next sandbox |
| 本轮基线 | `codex/izna-native-integration` 的 `aa9e0446c47d3de8cd0c893f86fc0112248d9aaf` |
| PR | draft [PR #7](https://github.com/KAtOReNA7/idol/pull/7)，base为 `codex/izna-native-integration`；上游draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6)保留，未合并main |
| 当前阶段 | izna v15私有只读审阅已发布，**等待用户整团确认**；GENBLUE v10、WOOAH v12已确认 |
| 最新证据 | [本轮worklog](worklogs/20261023-izna-review-followup.md)、[验证记录](evidence/20261023-izna-review-followup/) |
| 正式主站 | 仍v186 A-only，本轮未覆盖 |

分支来源：`handoff/codex-20261022` → `codex/genblue-native-integration` → `codex/wooah-native-integration`（121f410）→ `codex/izna-native-integration`（aa9e044）→ `codex/izna-review-followup`。不要只检出最初handoff、旧WOOAH或旧izna基线；先查远端与活动PR。

## 项目目的与有效决定

这是让用户认识女团与成员、观看具体MV／舞台、记录评分与感想，并在成员、作品和历史间连续探索的网站。每团保留独立艺术语言；真实图片、中文名、准确历史阵容与精确视频关系直接服务浏览。共享保存和数据契约，不统一成模板换皮。

- GENBLUE v10已获认可；WOOAH v12按团照首屏、五人同组、统一4:5成员图修正后获认可。
- izna已完成原生接入；首屏按用户批准的Figma方案发布v14。2026-10-23晚间用户说“好 你开始继续开发”，本轮继续izna收尾，并发布v15。
- **每次一个团，交可打开网页，用户明确确认后再开始下一团；公共功能除外。当前尚未确认izna，不开发ifeye或其他下一团。**
- 页面认可、代码实现、类型/测试、浏览器、真实保存和正式主站发布分别记录，不能互相替代。
- 保留稳定ID、原图、评分、备注、观看状态与owner-only写保护。公开仓库中的本次既有快照曾获用户批准；不扩展为新增私有数据或凭证公开授权。

## 新电脑检出与阅读

新空目录：

```sh
git -c core.autocrlf=false clone --branch codex/izna-review-followup https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git branch --show-current
git log -5 --oneline
```

已有仓库先检查并保留dirty内容、fetch、比较双方有效改动，再切换/快进。禁止reset/clean/force push。必须取得完整工作树，专项测试使用`handoffs/` fixture。不要复制旧机器依赖、构建或凭证。

读取顺序：本文 → [根AGENTS](../../AGENTS.md) → [STATUS](STATUS.md) → [PRD](PRD.md) → [设计要求](../design-requirements.md)／[协作手册](../collaboration-playbook.md) → [ACCEPTANCE](ACCEPTANCE.md) → 最新worklog。CURRENT-STATE是迁移时历史快照，以本文和STATUS为最新阶段。

普通电脑要求Node≥22.13.0、Git、npm。实际框架是Next路由/API风格 + Vinext/Vite + Cloudflare Worker，不能因根sandbox或Next依赖而改跑Next CLI。

```sh
cd apps/idol-site
node --version
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

从终端实际地址打开 `/artists/izna`。普通电脑默认portable、开发端口从5173开始。正式构建使用`npm run build`，本地Worker使用`npm start`；这不是生产发布。D1/R2生产内容不会随clone获得，不改权限或导入真实记录来掩盖本地缺失。

ChatGPT Sites环境先读当前Sites技能，按官方安装、preview、build、source workflow和部署流程执行。本轮为managed-linux，内部QA入口`terminal.local:4173`不供用户访问。Browser专用js未暴露，使用技能允许的CUA cloud browser；不得改通道绕过限制，也不能把iframe宽度写成顶层真视口。

针对本轮变更的验证：

```sh
node --test tests/izna-video-posters.test.cjs tests/work-video-player.test.cjs tests/approved-video-poster.test.cjs tests/retained-video-posters.test.cjs tests/katseye-video-poster.test.cjs
node --test tests/izna-native-integration.test.cjs tests/izna-review-catalog.test.mjs tests/izna-review-routing.test.mjs tests/izna-review-isolation.test.mjs
```

按后续变更范围选择检查，不必每次全库重跑。当前52项通过属于本轮源码；新环境或新代码需自行验证。

## 当前网页成果与缺口

| 范围 | 已完成 | 保留待办 |
| --- | --- | --- |
| GENBLUE | BlueCut原生页、具名MV关系与既有评分接线；v10认可 | 精确视频图、真实保存等原待办；已知320px横向溢出40px，本轮未修 |
| WOOAH | 实图原生页、团照首屏、五人同组、统一4:5成员图；v12认可 | 24个精确视频预览、真视口/缩放和真实保存等原待办 |
| izna | 7份含历史成员档案、8项只浏览发行、15个影像槽位、12条具名MV关联、20原图；大团照首屏；v15把已有4张精确MV图接入作品库和手帐并限制原图放大 | 整团人工确认、11个精确视频预览、同MV成员图、Figma内页、当前版本全视口/缩放、线上浏览器与真实保存 |
| ifeye | 原始候选源码与素材已保留 | 未原生接入，等待izna整团确认 |
| MEOVV B / 主站包体 | 历史patch与readback已保存 | 未上线；最终pins、完整生产TAR容量及生产发布另验 |

[izna v15验收入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) · [GENBLUE](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html) · [WOOAH](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)

本轮真实浏览器检查：1363×936桌面；四张作品卡片与播放器图片解码、MV/舞台隔离、分步成员→作品→手帐→返回及焦点恢复。320/390仅iframe窄窗口通过，未冒充顶层视口/缩放。两次快速批量点击出现目标漂移，分步通过但原因未确定，快速连续操作仍待复查。应用error/warn未见；扩展metadata错误单独排除。

关键改动路径（相对app）：`data/izna-video-posters.json`、`lib/idol/approved-video-poster.ts`、`components/app-image-presentation.tsx`、`components/work-video-player.tsx`、`app/page.tsx`。只改变图片展示，未改评分API或数据。

已有izna原生主体：`components/izna/`、`lib/idol/izna-native.ts`、`lib/idol/izna-runtime/`、`data/izna-editorial.json`、`data/izna-assets.json`、`public/artist/izna/`。已认可首页/成员页面保持。

## 发布身份与重建

- 审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，保持owner-private。
- v15 Sites source `fef02183457ff9a79f08cacf605e351fcbe3896d`。
- 版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_a037108af82c819196648d5935902d81`。
- 部署 `appgdep_6adb49d73ae0819195536e3c55bb95f3` 返回succeeded；版本号15和source已读回。
- review sourceFingerprint `c40080548bb0cc5d0260e09236d1316d2447bf4f0418f1f96c9f971657085df7`。
- 本地实际展开TAR为29,132,800 B / 27.783203125 MiB；100个非izna审阅文件SHA未变。不是主站全量包通过。
- 正式主站ID `appgprj_6acb4fa532b88191ae2588c24b724b17`，保持v186，本轮无覆盖授权。

从GitHub可重建izna增量：

```sh
node scripts/build-izna-review.mjs --out <仓库外专用绝对目录>
```

增量没有站点根入口和hosting配置，**不能单独覆盖审阅站**。先通过Sites官方source workflow打开现有审阅站，保留根入口、GENBLUE/WOOAH及访问设置，再合入增量。静态审阅使用净化的空评分/备注与只读API，不冒充真实手帐保存。

Sites source commit和GitHub commit不是同一个编号。凭证只经当前授权流程获取，禁止保存到文件、日志、命令行或仓库。完整生产包仍按实际展开TAR≤256 MiB且至少留2 MiB余量核验，不能用gzip大小或资源小计替代。

## 下次接续

1. 查本分支最新远端、活动PR、STATUS和本轮worklog，确认没有另一台电脑已接手同一任务；正式工程仅在apps/idol-site。
2. 处理用户对izna v15的反馈，继续保留已认可首屏。整团确认前不开始ifeye或其他团。
3. 补当前版本真视口/原生缩放/线上浏览器，复查快速连续导航的稳定性；真实保存另在明确授权环境验证。
4. 继续精确图片与Figma内页待办，不重复导入已接入候选，不因缺图删作品或拿其他图替代。
5. 每轮代码、验证、阶段和下一步同提交推送GitHub；未验项保持明确。源分支main未合并，不自动升级为生产完成。

历史依据：[v14首屏网页](worklogs/20261023-izna-hero-web.md)、[izna原生接入](worklogs/20261023-izna-native-integration.md)、[Figma首屏](worklogs/20261023-izna-hero-figma.md)、[WOOAH布局修正](worklogs/20261023-wooah-layout-feedback.md)、[此前两团检查点](worklogs/20261023-resume-checkpoint.md)。
