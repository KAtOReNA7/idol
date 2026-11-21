# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v212，51 团、605 支有视频的作品、9 个目录占位、527 个舞台。599 支 MV 支持照片下评分。126 支作品配置了同版站内备选片源，实际可播性受供应商和地区影响。[正式站](https://idol-lens-private.wuke40758.chatgpt.site) · [发布回执](evidence/20261122-v212/publication.json) |
| GitHub 主线 | `main` 保留用户验收的 `0e77838a`。归档历史和两个独有分支可按标签恢复。[仓库整理回执](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`，正式应用提交 `2aba484b`，发布标签 `site/v212`。[逐团交互验收](evidence/20261122-v211/browser-journeys.json) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 11 月 22 日更新

v211 的逐团浏览覆盖 2,949 个页面与操作组合，其中 2,929 个在本机生产构建完成，20 个 UDTT 目标在正式站完成。首页目录读取从 IVE 三次、ADYA 两次降为各一次。48 团混合展示 MV 与发行的 91 个路由均已调整顺序，ifeye、izna 和 UDTT 的独立页面也已调整。51 团正式首页实测发现 Billlie 的专辑封面在桌面仍高于 MV，v212 将 MV 放在完整的首行。[逐团验收](worklogs/20261122-group-journeys.md) · [首页顺序与 Billlie 修正](worklogs/20261122-artist-media-order.md)

v211 起移除会在站内直接起播低清的 B 站入口。四个 B 站独占舞台保留原站入口和评分关联；普通画质、登录权益及嵌入页是否能持续最高档分别检验。第三方服务失败时，单看播放器能加载无法确认作品可播。[B 站实测与来源](worklogs/20261122-bilibili-work-playback.md) · [待讨论的四项体验](20261122-USABILITY-DISCUSSION.md)

在 605 支 MV 上核查了 4,195 个作品与成员组合。599 支可为成员评分，6 支已确认无真人成员出镜。v209 正式站每个有 MV 的团各测一支，共 306 张照片全部解码。逐一点开后，两个分数输入框和保存按钮均在同一张照片下。《BILLIONAIRE》七位成员另做桌面和手机实测，原有作品评分经刷新读回。飞书两条已标记解决。[评分工作记录](worklogs/20261122-inline-mv-scores.md) · [正式逐团实点](evidence/20261122-v209/formal-group-opened-scores.json)

v210 的唯一应用文件差异是七条新增片源。同版候选从 v208 的 19 支增至 126 支。部分作品已有过高清实播，后续同一来源也可能不可用。《BILLIONAIRE》的 B 站旧备用线路实测为 640 × 294，v211 已移除该站内入口。[新增七支回执](worklogs/20261122-work-player-retries-v210.md) · [正式样本](evidence/20261122-v210/publication.json)

Hearts2Hearts 待看 10 张和全部 13 张作品封面均在 v208 正式站解码。527 个绑定舞台使用本站预览图。[作品预览](worklogs/20261122-work-previews.md)

## 线上内容

- 正式站 51 团的首页、成员目录在两档宽度共 204 次完成浏览，横向溢出为 0。[逐页正式回读](evidence/20261121-release-periods/all-group-routes.json)
- IVE 使用 2022 年 4 月官网团标及《LOVE DIVE》时期方向。两个发行时期各有六张具名肖像、原图、出处和作品导航。手机正式首页第 640 像素出现第一张成员照。NewJeans、ADYA、W!TCHX、GENBLUE 和 Rocket Punch 已上线前轮审核的 22 张目录肖像。[IVE 实测](evidence/20261121-release-periods/rosters-and-eras.json) · [前轮逐团记录](worklogs/20261121-artist-brand.md)
- STAYC、ITZY、NMIXX、aespa 与 LE SSERAFIM 在 390 × 900 手机上，第 260–279 像素即可看到成员图，姓名均在首屏。另有 17 团换为经当期官网、公司或官方频道核实的标志。VVUP 的 2024 官方头像用于《4 Life》详情。[成员入口](evidence/20261121-release-periods/rosters-and-eras.json) · [团标审查与实页](worklogs/20261121-official-marks.md)
- 两轮合计 204 支 MV、1,274 个认人位置换图，原有 1,226 个第三方具名截图位置均已替换默认图。图注分别注明本作、同期或跨期，原作品图仍可打开。最新 84 支在正式站逐支核验。[逐图记录和前后对照](evidence/20261121-mv-release-portraits/review.md)
- 10 首歌的节目资料已上线，共 28 个不同的来源链接。两张日语版舞台封面已检查分 P 和时间。另有 81 项等待新证据，19 项沿用取消必填的决定。[节目核验](worklogs/20261121-broadcast-research.md) · [处置清单](evidence/20261121-repository-and-routes/content-disposition.json)

## 工程与下一步

v204 时，本地 Windows、WSL Linux 和 GitHub Windows、Ubuntu 均通过验证。该轮修复 18 项旧测试，UDTT 公开原图在正式站两宽解码，关闭后焦点返回原按钮。当前完整套件状态见 v210 双平台回执。[v204 记录](evidence/20261121-release-periods/tests.json) · [v210 记录](evidence/20261122-v210/tests.json)

下一步依次验证连接器实际提供的新 owner 批量读取工具、处理剩余旧用例，以及在新增具名资料出现时升级跨期照片与节目绑定。私人存储已读回同一活动快照、epoch 6 和 206 条完成日志。[核对接口及适用范围](STAGE-OWNER-PREFLIGHT.md) · [发布前的审查与后续开发](PROJECT-AUDIT-AND-ROADMAP-20261121.md)

前轮工程优化、发布与原始审查分别保存在各自的工作记录中。[上一正式版 v203](v203-release-20261030.md) · [项目审查](worklogs/20261121-project-audit.md) · [历史协作与验收](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)
