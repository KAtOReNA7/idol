# IZ*ONE：历史成员与作品审阅 v6

- 需求版本：2026-10-24 最新继续开发决定；用户确认 i-dle v5 后，按原 Sol 顺序只推进 IZ*ONE。下一团 fromis_9 等本团网页确认。
- 仓库：KAtOReNA7/idol（推送前已核实 PUBLIC）；分支 `codex/izone-review-completion`，基线 `10fd7beb2e6029783d739c26267b0fad5da3fd4a`，PR base `codex/idle-review-completion`。正式工程 `apps/idol-site/`，根 sandbox 未作生产基线。
- 本机 Windows 开发及浏览器 QA；静态端口 4194 仅属于本机。代码、公开资料和验证记录进入任务分支，不合并 main。正式主站仍 v186，旧审阅站 v33 未改。
- 本轮开始前工作树干净，fetch 并检查同名远端分支/PR，无重复任务。未使用子代理。

## 可打开的结果与停止点

[IZ*ONE v6 owner-private 审阅](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)。Sites 返回部署 succeeded，保存版本为 **6**。审阅仅使用公开身份资料和清空个人字段的投影，不能在这里保存正式评分。

12 位历史成员、18 项发行版本/81 个曲目条目、17 个影像槽（10 MV、7 舞台）、108 条已有单成员/单作品关系、12 条既有 ready 时间轴事件已接入。目录搜索、成员与发行详情、真实原图、恢复机制、精确视频及既有手帐返回上下文可用。

**等待用户确认 IZ*ONE 网页，再开始 fromis_9 或下一团；公共功能例外。设计、资料、功能、上线分别记录，部署或测试不能代替人工设计通过。**

## 设计来源与复用披露

本轮保留 v186 引入的**旧 IZ*ONE 候选**奶油色/玫瑰色、Bodoni Moda 字体和展册边框语言，并重构页面内容与内页。该候选此前没有用户确认，本轮也**不是官网复刻**，不能称旧设计已获认可。

实际检查的原官网入口：

- <https://www.izone-official.com/>：返回 Redirecting / Loading，没有可用的官网内容。
- <https://iz-one.co.kr/>：现页面明确标为“IZ*ONE 티저 사이트 미러”，属于历史预告站镜像。
- <https://www.universal-music.co.jp/izone/>：跳转环球总站。

没有可用的当前官网视觉可据以做完整复刻。历史资料取 Mnet/KBS，照片取具名转载，发行资料取 Bugs。首屏用完整十二人 One-reeler 宣传海报；手机成员卡单列、3:2 等大容器，以 contain 保全横竖原图，未裁改图片文件。文案为“2018 — 2021 / 历史成员与作品”。

功能复用 **i-dle v5** 的公开投影、静态路由和只读审阅机制，以及 TRACER 至 i-dle 的原图、焦点恢复、图片重试和精确返回。共享成员/MV/舞台手帐继续使用仓库已有布局与 `app/izone-experience.css`，不是本轮独立官网设计；交审必须披露。

## 资料与原图

- 历史名册来源：<https://smart.mnetjp.com/profile/camtPhKL7AaZcltSDFILdS>、<https://world.kbs.co.kr/service/contents_view.htm?board_seq=351078&id=&lang=j&menu_cate=artist>。Mnet 没有被冒充为团体官网，公开资料 `officialUrl` 留空。
- 13 张同系列照片（团体海报 + 12 单人）：[DBKpop 具名转载，2020-11-27](https://dbkpop.com/2020/11/27/izone-one-reeler-teaser-photos-1-color-of-youth-hd-hq/)。不能称官网原图。具名映射绑定既有稳定成员 ID，不按人脸猜测。原件尺寸及 SHA 见 `data/izone-review-assets.json`。
- 18 张发行封面：Bugs 原字节 1200 图；[艺人发行目录](https://music.bugs.co.kr/artist/20067467/albums)及各详情已读取。三张节目合辑仅保留 IZ*ONE 署名曲目各一首。ZERO:ATTITUDE 标为合作，不推定十二人全员参与。
- 日版保留 Bugs 的音源版本日期，与日本正式出道/实体日期分别说明。D-D-DANCE 音源日期 2021-01-26，与既有 MV 记录日期 2023-08-31 分开，未擅改原生作品日期。
- 17 张视频缩略图来自各自精确 YouTube 视频 ID。10 既有具名作品与 7 舞台绑定保留；不为原生空白作品赋名，不新建成员关系。
- 成员生日原始空值保留，当前 `groupIds` / `formerGroupIds` 保持。历史照片只在合法 IZ*ONE `artistReturn` 上下文出现；IVE、LE SSERAFIM、SAY MY NAME 等其他团不会被历史头像覆盖。
- 12 条时间轴原文件未变。成团事件保留未知日期；原有来源缺口继续保留，不据页面内容推定所有历史事件穷尽。

## 实现位置与边界

- 团页：`components/candidate/izone-design.tsx`、`app/artists/izone/izone-artist.css`；首页/成员/发行/影像/时间轴及详情。
- 资料：`data/izone-public.json`、`izone-review-editorial.json`、`izone-review-assets.json`、`izone-navigation-keys.json`；图片在 `public/artist/izone/{one-reeler,releases,media}/`。
- 共享改动仅为 `app/page.tsx` 传递 `artistReturn` 并调用 `lib/idol/izone-photos.ts`，以及 `lib/idol/artist-navigation.ts` 的发行精确 allowlist。既有保存、权限和评分语义保持。
- 独立只读包：`review/izone/`、`scripts/build-izone-review.mjs`。保留身份/既有关联，评分、备注、观看状态清空；写入、原始 records、外域和其他团 catalog 均拒绝。
- 原生 `data/catalog-snapshot.json`、原始用户数据、时间轴、安全边界未改。没有部署正式主站。

## 验证

Browser plugin 不可用；按 frontend-testing-debugging 技能使用已安装 Playwright 与本机 Chrome，无额外安装。

| 层次 | 本轮结果 |
| --- | --- |
| 单元/边界/导航 | `node --test tests/izone-review-boundary.test.mjs tests/artist-navigation.test.cjs`：23 通过 |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit` 通过；生成的 tsbuildinfo 恢复至基线 |
| 正式构建 | `npm run build` 通过；既有代理提示和 route 静态分类 unknown 提示保留 |
| 静态审阅构建 | 49 资产，42,929,000 bytes；108 清理后的既有关联；9 API 隔离检查；JS 1,009,812 bytes，CSS 96,720 bytes |
| 实际视口布局 | 10 类页面 × 320/390/700/1100/1440/2048/2560/2926/3840 = 90 检查通过；无横向溢出、坏图或零宽图片，无 pageerror/console error |
| 交互 | 51 检查通过；12 成员 × 390/1440 原图、Escape/焦点、手帐返回；18 发行曲目；搜索/空结果/清除、过滤刷新、精确 MV/时间轴往返、未知记录、断图重试 |
| 已确认页面保护 | 181 个旧非 root 文件 SHA 不变；只新增本团文件及 root 入口 |
| 线上 | 部署成功；IAB 导航 40 秒超时，随后一次页面读取 30 秒超时。不能宣称线上渲染或完整交互通过；已提交打开线上链接到侧栏 |

旧 `timeline-navigation.test.cjs` 的 11 项失败均停在既有 `public-artist-navigation-keys.json` fixture SHA 门槛；已将基线 `10fd7be` 的该文件原字节与工作树比较，并直接送入同一断言，基线同样失败。未放宽生产 pins。此处应报告为已知基线失败，不能算本轮测试全绿。

交互测试曾有两处等待/定位错误（点击后未等曲目渲染、两个同名返回按钮触发 strict mode），修正测试后 51 项通过；没有把这些错误冒充产品故障。最终源码清理只涉及行末空白，重新生成审阅包，JS/CSS 字节长度保持。

主流程：团页 → 成员搜索 → 具名详情 → 原图/关闭恢复焦点 → 作品与评分 → 返回原成员；影像/时间轴 → 同 ID 手帐 → 返回原筛选。

## Figma

[IZ*ONE 可编辑画板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1193-1095)。十类页面 × 1440/390/320，共 30 个画板；48 原图素材上传完成。文字、图像、SVG 和 Auto Layout 可编辑，复用 STAGE/Button 与本轮语义变量；没有整页截图替代设计。

五个不同关键节点取得完整 design context（成员目录、发行详情、时间轴、舞台手帐、首屏内容），桌面全页取稿过大时按子节点继续读取。修复捕获的隐藏跳转占位、时间轴图标挤占和标题换行，临时 capture 已移除。画板索引见 `20261024-izone-figma-frames.json`。

**字体保真未通过**：Bodoni Moda 可用，Arial/Microsoft YaHei 不可用而使用 Inter/Noto Sans SC；完整逐字与全量逐板像素对照未完成。不得用可编辑画板数量推定设计已全部验收。

## 部署与容量

- 同一 owner-private 新审阅站：`appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，owner 一人、外部访客 0，未变更分享范围。
- source checkout 基线 `2c14a4ff74c2e473fa4432c7cecc0b76a853f277`；helper open 后增量，最终 source commit `1278ea1f3e6a60c17045d412225c246688e33b89`。
- 版本 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_44028d33bd80819192a2351b358f6b6f`，用户版本 **v6**；deployment `appgdep_6adcd0eb826c8191a00da11ef03dc3de`，2026-10-24 15:38:37 UTC succeeded。
- 源码指纹 `4e4c0c47d64c4b4cae94c25929803cc749bf5be5067d5ccb8170e5f7ba0a037b`。
- 本地完整展开 TAR 141,104,640 bytes，距 256 MiB 余 127,330,816 bytes；服务端规范化归档 141,096,960 bytes / 238 files。含 `dist/.openai/hosting.json`，静态目录 dist；临时 capture.html 排除。
- 原图未压缩。55 新文件；181 旧非 root 文件 SHA 不变。manifest 列举的文件才入包，不复制整个含临时捕获脚本的 scratch 目录。

## 接续与未验

在 `apps/idol-site/` 使用现有锁文件和依赖。构建命令：`node scripts/build-izone-review.mjs --out <仓库外独立绝对目录>`；输出可用静态服务器预览。不要重跑临时资料生成器覆盖后续修正。

本机临时证据位于 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/izone/`（qa.json、interactions.json、截图、归档及 Figma 中间稿）。不是跨电脑依赖；公开清单与验证摘要已随代码入仓，凭证和临时签名 URL 不入仓。

线上完整交互、真实保存/视频播放、80%/125% 原生浏览器缩放、Figma 全字体/全像素保真仍待验。真实写入需要遵守既有 owner 权限及明确数据授权。当前完成的是本团只读审阅交付，不能标记为正式主站上线或全量验收。
