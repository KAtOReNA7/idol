# 新电脑接续：女团网站

更新：2026-10-23 晚间，北京时间。本文是当前入口，不需要上一台电脑或聊天记录。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/ifeye-native-integration` 最新远端 HEAD** |
| 正式工程 | `apps/idol-site/`；仓库根是旧 Next sandbox |
| 本轮基线 | `665fed58554fd83ddbcfc098228c6961943e9ebf`（`codex/izna-review-followup`） |
| PR | 本轮draft [PR #8](https://github.com/KAtOReNA7/idol/pull/8)以 `codex/izna-review-followup` 为base；上游 [PR #7](https://github.com/KAtOReNA7/idol/pull/7) 保留，未合并main |
| 当前阶段 | GENBLUE v10、WOOAH v12、izna v15已获页面确认；**ifeye v16待人工验收** |
| 最新证据 | [本轮worklog](worklogs/20261023-ifeye-native-integration.md)、[验证记录](evidence/20261023-ifeye-native-integration/) |
| 正式主站 | 仍v186 A-only，本轮未覆盖 |

分支链：`handoff/codex-20261022` → `codex/genblue-native-integration` → `codex/wooah-native-integration` → `codex/izna-native-integration` → `codex/izna-review-followup` → **`codex/ifeye-native-integration`**。不从旧main、最初handoff或旧检查点重新开工。

## 项目目的与有效决定

让用户认识女团与成员，按具体MV／舞台观看、记录评分和感想，并在成员、作品和历史间连续探索。每团有独立设计；真实图片、中文名、准确历史阵容和精确视频身份是浏览基础。共享数据与保存契约，不统一成模板换皮。

- 用户本轮“已确认，继续开发”确认了izna v15，允许开始ifeye。本轮仅接入ifeye并发布v16。
- **每次一个团，交网页，用户明确确认后再开始下一团；公共功能除外。当前等ifeye确认。**
- 已认可GENBLUE、WOOAH、izna保持；页面认可不代表真实保存、全部设计待办或正式主站发布通过。
- 保留稳定ID、原图、评分、备注、观看状态与owner-only写保护。既有快照公开批准不扩展为新增数据或凭证公开授权。

## 检出与运行

新空目录：

```sh
git -c core.autocrlf=false clone --branch codex/ifeye-native-integration https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git branch --show-current
git log -5 --oneline
```

已有工作树先保留改动、fetch、比较后再切换或快进，禁止reset/clean/force push。取得完整仓库，测试需handoffs/fixture；不复制旧机器依赖、构建或凭证。

阅读顺序：本文 → 根AGENTS → STATUS → PRD → 设计要求/协作手册 → ACCEPTANCE → 最新worklog。CURRENT-STATE是迁移时历史快照。

普通电脑需要Node≥22.13.0、Git、npm。实际框架是Next路由/API风格 + Vinext/Vite + Cloudflare Worker，不能改跑根sandbox或Next CLI。

```sh
cd apps/idol-site
node --version
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

从终端实际地址打开 `/artists/ifeye`。普通电脑默认portable，端口从5173开始；`npm run build`构建、`npm start`运行本地Worker，不是生产发布。D1/R2生产内容不会随clone取得，不改权限或导入真实记录掩盖缺失。

Sites环境先读当时的Sites技能，用官方安装、preview、build和source workflow。本轮managed-linux，terminal.local:4173仅用于内部浏览器QA；Browser插件js未暴露，使用技能允许的CUA。iframe宽度不能当顶层真视口。

## 当前成果与待办

| 团体/范围 | 已完成 | 待办边界 |
| --- | --- | --- |
| GENBLUE | BlueCut原生页与精确成员关系、既有手帐；v10已确认 | 旧320px横向溢出40px、精确视频图、真实保存等历史待办保留 |
| WOOAH | 团照首屏、五人同组、统一4:5成员图；v12已确认 | 24个视频预览、当前版本真视口/缩放/真实保存等 |
| izna | 原生页、大团照首屏、四个精确MV预览已接作品库/手帐；v15本轮确认 | 11个精确视频预览、同MV成员图、Figma内页、真视口/缩放/线上浏览器/真实保存、快速导航复查 |
| ifeye | 自有纸面/衬线/唱片设计，6成员、3发行、7影像、5事件、10原图；9公开MV参与关系、6既有个人记录；v16已发布 | 人工验收、7个精确视频预览、同MV成员图、Figma实图/内页、真视口/缩放/线上浏览器、真实保存；SASHA当前状态未确认 |
| 正式生产包 | 源码完整构建通过，保留当前原图 | 剪枝dry-run受旧izna引用阻断；旧ifeye审计fixture有3失败；完整展开TAR容量/pins/生产发布另验 |

[ifeye v16验收入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/ifeye/index.html) · [izna](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) · [GENBLUE](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html) · [WOOAH](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)

ifeye只读审阅使用净化空评分/备注，显示“示例资料 · 评分不写入正式手帐”；不是实际保存演示。首页是官网五人宣传照，档案六人，不由图片人数推断当前阵容。r u ok?六条关系已存在；Hazy三条公开参与关系不等于已有个人评分记录。

关键路径：`components/ifeye/`、`lib/idol/ifeye-native.ts`、`lib/idol/ifeye-runtime/`、`data/ifeye-editorial.json`、`data/ifeye-assets.json`、`public/artist/ifeye/native-v3/`、`review/ifeye/`。共享导航只增有限键表，剪枝器保守保留ifeye旧batch14图；未修改API/保存/权限/快照/依赖。

## 本轮实测与复验

20项ifeye测试 + 38项导航/izna回归通过，类型0错误，正式构建成功。原有ifeye剪枝测试35过3失败（临时fixture缺YOUNG POSSE正确文件）；正式prune dry-run被已有izna原图引用阻断，未执行apply。不能写为全库或完整生产包通过。

```sh
node --test tests/ifeye-native-integration.test.cjs tests/ifeye-review-catalog.test.mjs tests/ifeye-review-routing.test.mjs tests/ifeye-review-isolation.test.mjs tests/ifeye-native-retention.test.mjs
node --test tests/artist-navigation.test.cjs tests/izna-native-integration.test.cjs tests/izna-review-catalog.test.mjs tests/izna-review-routing.test.mjs tests/izna-review-isolation.test.mjs
```

浏览器1363×936完成成员→精确MV→既有手帐→舞台→返回与焦点恢复，十图解码/等大照片通过。320/390/1440/2048/2560是iframe窗口，无横向溢出；320成员搜索、查看器Escape和搜索恢复实测。非五种顶层视口，80%/125%缩放未验。外部YT缩略图失败保留诚实fallback；快速批量自动化locator曾超时，分步已通但快速导航未计通过。

Figma首页812:1133、作品库812:1456已实际get_design_context取稿及看图；文件zeLNExz4TbpWRW3uiahef7，保护ERLUBLUE节点821:52未写。完整Figma图片/内页/多尺寸仍未完成，不据网页构建推出设计闭环。

## 发布与重建

- 审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，继续owner-private。
- v16 source `52dac6f0d01762482a4bb3a36e1e04ae6154ca91`，2026-10-23 20:59北京时间发布succeeded，版本号/source已读回。
- 版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_6590aed27bb88191924f304928048f83`；部署 `appgdep_6adb5a2caa3c8191bb958412a485e3af`。
- ifeye sourceFingerprint `264192d9c26a9d54657a49833d6c60330855c83c43e3dd39f812d1e88a9a382a`。
- 原审阅站130文件SHA不变；本地实际展开TAR32,778,240 B /31.259765625 MiB，平台归档统计另见worklog。这不是主站全量容量通过。
- 正式主站 `appgprj_6acb4fa532b88191ae2588c24b724b17` 仍v186 A-only。

```sh
node scripts/build-ifeye-review.mjs --out <仓库外专用绝对目录>
```

增量没有站点根入口/hosting配置，不能单独覆盖审阅站。先通过Sites官方source workflow打开当前v16，保护其他团、根入口与访问设置，再合入增量。Sites commit不等于GitHub commit。凭证仅通过当前授权流程取得，不存文件/命令行/日志/仓库。

## 下一步

1. 检查最新远端、活动PR、STATUS和本轮worklog，避免与其他电脑重复开发。
2. 先处理ifeye人工反馈；确认前不开发下一团，公共功能除外。
3. 补明确缺口；正式全量发布前单独解决剪枝阻断/fixture/pins和实际展开TAR预算（≤256 MiB并至少留2 MiB）。
4. 每轮代码、验证、阶段、阻塞和下一步同提交到GitHub；未验、未合main、未生产发布分别说明。

历史证据：[izna v15](worklogs/20261023-izna-review-followup.md)、[izna首屏](worklogs/20261023-izna-hero-web.md)、[WOOAH修正](worklogs/20261023-wooah-layout-feedback.md)。
