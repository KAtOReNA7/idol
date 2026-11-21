# v204 正式发布与前后对照

2026 年 11 月 21 日 21:43（北京时间），已将此前开发分支的累计优化及本轮修改发布到原正式站。上一个正式版是 v203。GitHub 的 `site/v204` 指向应用 `2283b25a`，Sites 源提交为 `7019de3d`。用户验收主线仍为 `0e77838a`。[正式站](https://idol-lens-private.wuke40758.chatgpt.site) · [GitHub 正式标签](https://github.com/KAtOReNA7/idol/releases/tag/site/v204) · [部署回执](../evidence/20261121-release-periods/publication.json)

## 团页与作品设计

在正式域名以 390 × 900 和 1440 × 900 打开 51 团的首页和成员目录，共 204 个页面。全部返回 200 并出现可见图像，完成检查的页面没有横向溢出或页面脚本异常。VCHA、HITGS 和 AtHeart 的目录使用各团独立按钮，补充检查实际按钮、图片和成员跳转后，两档宽度均通过。[逐团正式路由与重测](../evidence/20261121-release-periods/all-group-routes.json)

IVE 恢复了 2022 年 4 月日本官网团标，并以 STARSHIP 同期团照和六人学院概念照建立《LOVE DIVE》档案。深蓝底、银白细线和高对比衬线标题贯穿首页与发行页。《I’VE MINE》采用 2023 年 Genie 发行花絮、同期团照和独立的粗体标题。两个时期各六张具名照，可以看原图和出处、进入成员并返回原按钮。四首对应 MV 及各自的舞台都有独立入口。手机和桌面共四次正式交互均通过。390 像素宽下，正式 IVE 首页第一张成员照位于第 640 像素。[LOVE DIVE](https://idol-lens-private.wuke40758.chatgpt.site/artists/ive?section=works&release=ive-release-love-dive) · [I’VE MINE](https://idol-lens-private.wuke40758.chatgpt.site/artists/ive?section=works&release=ive-release-ive-mine) · [Figma 手机稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1346-3332) · [一手设计来源](../evidence/20261121-artist-brand/sources.json)

NewJeans、ADYA、W!TCHX、GENBLUE、Rocket Punch 也上线了此前校正的 22 张默认肖像。其文件合计较各自前像少 80.94%。另有 17 团使用核实的团标，剩下的 VVUP 官方图确认属于《4 Life》发行时期，放在该发行详情。18 张素材在正式站实取的哈希均正确。70 个团标页面或时期页面和 34 次返回团首页均已验过。[此前逐团结果](20261121-artist-brand.md) · [18 份标识及实际画面](20261121-official-marks.md) · [18 团 Figma 对照](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1348-1109)

五个手机成员目录将公司介绍、社媒和大团照集中在概览。点击「成员」后可以直接看照片和姓名。390 × 900 正式站的坐标从文档顶部起算。1440 × 900 另行验证了进入成员、返回原按钮、切到概览再回目录的操作。[两宽原始数据](../evidence/20261121-release-periods/rosters-and-eras.json) · [STAYC 旧版](../evidence/20261121-release-periods/stayc-before.webp) · [STAYC 新版](../evidence/20261121-release-periods/stayc-after.webp)

| 团体 | v203 首张照片 | v204 首张照片 | v204 首个姓名 |
|---|---:|---:|---:|
| STAYC | 1,562 px | 271 px | 486 px |
| ITZY | 1,409 px | 270 px | 498 px |
| NMIXX | 1,364 px | 277 px | 499 px |
| aespa | 1,336 px | 260 px | 499 px |
| LE SSERAFIM | 1,010 px | 279 px | 527 px |

两轮累计调整 204 支 MV 的 1,274 个成员位置，涵盖原有全部 1,226 个第三方具名截图位置。本批 529 个位置中，282 个为本作发行图片，49 个为同期官网肖像，198 个标注为跨期认人参考。正式站逐支核过本批 84 支 MV，532 个可见位置均与相应成员、图片和出处吻合，包含同页原有的三个位置。另核 294 张卡图、268 个原件的响应头和八个新旧原图，共 570 项。四支代表作品还在正式页打开新旧原图八次并验证回焦。按本批 529 个位置各显示一次，卡图字节减少 93.43%。[手机对照图](../evidence/20261121-mv-release-portraits/mobile-before-after.webp) · [每项来源、计量与重试范围](../evidence/20261121-mv-release-portraits/review.md)

公共目录现有 614 首作品、527 个舞台，较 v203 多 27 个。专项封面从 29 张增至 34 张。STAYC 日版《Teddy Bear》与 IVE 日版《ELEVEN》分别采用已审节目源对应时段和分 P 的画面。10 首节目说明、28 个不同的来源链接在正式站逐项复核，手机和桌面 24 次浏览均通过。[正式资料、封面和快捷入口](20261121-broadcast-research.md)

## 上线实测与评分流程

用相同的 Chromium 在 390 × 900 下匿名打开正式作品库，各版本各取三个新浏览上下文。第一首歌名由 y=942.5 提前至 y=712.5，可在底部导航上方读到。首次可读时同源 JS/CSS 的编码响应体积中位数由 568,426 降至 274,079 字节，减少 51.78%。公开目录按相同 gzip 参数计算，中位数由 291,612 降至 256,684 字节，减少 11.98%。测量涵盖新增内容。实际请求耗时受当时网络影响，完整样本附录保留了各次读数。[生产测量与方法](../evidence/20261121-release-periods/formal-metrics.json)

切换舞台来源时，当前 MV 及其评分表单保持已加载的状态。保存请求超过 30 秒后保留草稿和原操作 ID，可以核对重试。原分为 0、空分、错回执、来源变更和导航中止都在隔离测试里验证。真实站点 owner 存储读回相同活动快照，epoch 为 6，206 条完成日志与发版前一致。本次生产私人写入为 0。UDTT 的同一张授权公开原图在两档宽度均成功解码，22,101 字节及 SHA-256 完全一致，关闭后返回原按钮。[权限和原图实测](../evidence/20261121-release-periods/formal-metrics.json) · [发布前后存储](../evidence/20261121-release-periods/publication.json)

## 工程验证与接续

Windows、WSL Linux、GitHub 托管 Windows 和 Ubuntu 均通过 `npm run verify`。当前 Node 主回归 1,211 项、优化解释器路径 19 项、构建资源测试 6 项通过。独立提供真实原件的 UDTT 测试 15/15。完整 `npm test` 在 Windows 从 197 项失败降至 179 项，Linux 从 193 项降至 175 项。按文件、用例名及出现次数比较，两边各修复 18 项，新增均为 0。GitHub 完整测试返回失败，Ubuntu 的 175 项与本地 Linux 逐项匹配。测试检查点 `d182e15b` 相对正式应用只调整了八个测试和测试辅助文件，另补充研究回执。[逐项测试结果](../evidence/20261121-release-periods/tests.json) · [GitHub Actions](https://github.com/KAtOReNA7/idol/actions/runs/44910309156)

发布包共 1,811 个文件。Sites 源以 v203 为起点增量同步，23 份数据库迁移维持原已发布字节，逐件验证三个固定投递提交，共 5,995 个远端路径。受限的九个原件和一个重复别名均已排除。正式站继续使用原 DB、R2、MCP 和访问策略。代码已包含 owner 批量舞台核对接口，正式匿名请求返回 401。这次会话能实名读取原生存储状态，连接器当前提供的工具中尚无新增核对操作，因此没有真实 owner 批次回执。[发布包核验](../evidence/20261121-release-periods/package-proof.json) · [源码投递](../evidence/20261121-release-periods/source-sync.json) · [核对工具范围](../STAGE-OWNER-PREFLIGHT.md)

剩余开发先核 owner 只读批次和会影响现行交互的历史用例，再随新证据升级跨期资料图及节目记录。81 项等待新证据，19 项沿用取消必填的审查结论。[当前顺序](../PROJECT-AUDIT-AND-ROADMAP-20261121.md)
