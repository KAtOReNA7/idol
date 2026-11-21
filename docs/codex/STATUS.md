# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v213，51 团、605 支有视频的作品、9 个目录占位、527 个舞台。599 支 MV 支持照片下评分。126 支作品各配置一个同版站内播放入口。《BILLIONAIRE》和《Magnetic》已在正式站短播。[正式站](https://idol-lens-private.wuke40758.chatgpt.site) · [发布回执](evidence/20261122-v213/publication.json) |
| GitHub 主线 | `main` 保留用户验收的 `0e77838a`。归档历史和两个独有分支可按标签恢复。[仓库整理回执](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`，正式应用提交 `d30a4979`，发布标签 `site/v213`。[逐团交互验收](evidence/20261122-v211/browser-journeys.json) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 11 月 22 日更新

v211 的逐团浏览覆盖 2,949 个页面与操作组合，其中 2,929 个在本机生产构建完成，20 个 UDTT 目标在正式站完成。首页目录读取从 IVE 三次、ADYA 两次降为各一次。48 团混合展示 MV 与发行的 91 个路由均已调整顺序，ifeye、izna 和 UDTT 的独立页面也已调整。51 团正式首页实测发现 Billlie 的专辑封面在桌面仍高于 MV，v212 将 MV 放在完整的首行。[逐团验收](worklogs/20261122-group-journeys.md) · [首页顺序与 Billlie 修正](worklogs/20261122-artist-media-order.md)

v213 正式站上，《BILLIONAIRE》静音短播为 1920 × 884，《Magnetic》通过制作方播放器一次点击即达到 3840 × 2160，两个样本均取得递增的播放时间。B 站独占的四个日本电视舞台仍缺同场的站内高清来源，页面写明状态并保留精确原片出处。51 团目录少传 12.39% 解码字节，三团样本的首页可点击时间中位数有所增加。[最新正式实播](evidence/20261122-v213/formal-playback.json) · [三团测速](worklogs/20261122-artist-catalog-speed.md) · [旧线路实测](worklogs/20261122-v212-release.md)

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

v212 在本地 Windows 与 WSL Linux 均通过 `npm run verify`。完整 Node 套件各有 4,085 个用例，Windows 通过 3,880 项、失败 166 项、跳过 39 项；Linux 通过 3,884 项、失败 162 项、跳过 39 项。与 v211 逐名对照，两端均新增一条通过的 Billlie 回归，既有失败条目相同。[v212 双平台结果](evidence/20261122-v212/tests.json) · [v211 对照](evidence/20261122-v211/tests.json)

下一批先处理两支 MV 和四个 B 站舞台的站内播放，并行测团页首次可操作耗时、补 50 团手机首页的实际排序。后续按代表时期升级有明确差异的团页和照片，优先修四组涉及评分、草稿和返回的旧详情测试。数据侧的 owner 批量读取在连接器提供对应工具时验证。[12 条产品要求](PRD.md) · [分批开发方案](PROJECT-AUDIT-AND-ROADMAP-20261121.md) · [批量核对协议](STAGE-OWNER-PREFLIGHT.md)

前轮工程优化、发布与原始审查分别保存在各自的工作记录中。[上一正式版 v203](v203-release-20261030.md) · [项目审查](worklogs/20261121-project-audit.md) · [历史协作与验收](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)
