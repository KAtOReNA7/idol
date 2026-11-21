# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v208，2026 年 11 月 22 日发布。51 团、605 支有视频的作品、9 个目录占位、527 个舞台；19 支 MV 已配置核验通过的同版站内来源。[正式站](https://idol-lens-private.wuke40758.chatgpt.site) · [发布回执](evidence/20261122-v208/publication.json) |
| GitHub 主线 | `main` 保留用户验收的 `0e77838a`。归档历史和两个独有分支可按标签恢复。[仓库整理回执](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`。v208 应用提交 `1d2236f8`，GitHub 发布标签 `site/v208`。后续按成员照片卡内编辑和片源实播两个方向推进。[逐团预览](worklogs/20261122-work-previews.md) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 11 月 22 日更新

Hearts2Hearts 的待看 MV 在正式站有 10 张卡，完整目录有 13 张，已全部解码。527 个绑定舞台均使用本站预览图。《BILLIONAIRE》七名发行成员均有本人评分入口。v208 使用独立评分区，照片下就地编辑是后续修订项。Windows 和 WSL 的 `npm run verify` 均通过；完整套件的既有失败从 173／169 减至 170／166。[公开测试回执](evidence/20261122-v208/tests.json) · [作品来源](worklogs/20261121-hd-work-players.md) · [成员评分](worklogs/20261122-personal-mv-ratings.md)

## 线上内容

- 正式站 51 团的首页、成员目录在两档宽度共 204 次完成浏览，横向溢出为 0。[逐页正式回读](evidence/20261121-release-periods/all-group-routes.json)
- IVE 使用 2022 年 4 月官网团标及《LOVE DIVE》时期方向。两个发行时期各有六张具名肖像、原图、出处和作品导航。手机正式首页第 640 像素出现第一张成员照。NewJeans、ADYA、W!TCHX、GENBLUE 和 Rocket Punch 已上线前轮审核的 22 张目录肖像。[IVE 实测](evidence/20261121-release-periods/rosters-and-eras.json) · [前轮逐团记录](worklogs/20261121-artist-brand.md)
- STAYC、ITZY、NMIXX、aespa 与 LE SSERAFIM 在 390 × 900 手机上，第 260–279 像素即可看到成员图，姓名均在首屏。另有 17 团换为经当期官网、公司或官方频道核实的标志。VVUP 的 2024 官方头像用于《4 Life》详情。[成员入口](evidence/20261121-release-periods/rosters-and-eras.json) · [团标审查与实页](worklogs/20261121-official-marks.md)
- 两轮合计 204 支 MV、1,274 个认人位置换图，原有 1,226 个第三方具名截图位置均已替换默认图。图注分别注明本作、同期或跨期，原作品图仍可打开。最新 84 支在正式站逐支核验。[逐图记录和前后对照](evidence/20261121-mv-release-portraits/review.md)
- 10 首歌的节目资料已上线，共 28 个不同的来源链接。两张日语版舞台封面已检查分 P 和时间。另有 81 项等待新证据，19 项沿用取消必填的决定。[节目核验](worklogs/20261121-broadcast-research.md) · [处置清单](evidence/20261121-repository-and-routes/content-disposition.json)

## 工程与下一步

本地 Windows、WSL Linux 和 GitHub 的 Windows、Ubuntu 均通过 `npm run verify`。完整测试在 Windows 余 179 项失败，Linux 余 175 项，较上一检查点各减少 18 项，新增失败均为 0。托管 Ubuntu 与本地 Linux 逐项相同。UDTT 的真实公开原图已在正式站两宽解码，SHA-256 相符，关闭后焦点返回原按钮。[测试清单](evidence/20261121-release-periods/tests.json) · [正式测量](evidence/20261121-release-periods/formal-metrics.json)

下一步依次验证连接器实际提供的新 owner 批量读取工具、处理剩余旧用例，以及在新增具名资料出现时升级跨期照片与节目绑定。私人存储已读回同一活动快照、epoch 6 和 206 条完成日志。[核对接口及适用范围](STAGE-OWNER-PREFLIGHT.md) · [发布前的审查与后续开发](PROJECT-AUDIT-AND-ROADMAP-20261121.md)

前轮工程优化、发布与原始审查分别保存在各自的工作记录中。[上一正式版 v203](v203-release-20261030.md) · [项目审查](worklogs/20261121-project-audit.md) · [历史协作与验收](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)
