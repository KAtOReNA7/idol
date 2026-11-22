# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v226。《BILLIONAIRE》等待起播时已有中文提示，首发版仍无解码画面。《Magnetic》《ATTITUDE》正式站 4K。NewJeans 首页和成员目录已补官网照片出处。[正式站](https://idol-lens-private.wuke40758.chatgpt.site) · [本批回执](worklogs/20261122-v226-release.md) |
| GitHub 主线 | `main` 保留用户验收的 `0e77838a`。归档历史和两个独有分支可按标签恢复。[仓库整理回执](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`，v226 正式应用提交 `04a0fe57`。[发布回执](evidence/20261122-v226/publication.json) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 11 月 22 日更新

v226 实测《BILLIONAIRE》出现等待提示，七人照片下的评分入口两宽均通过。NewJeans 首页可见的照片出处从 0 处增至 2 处，三个宽度均保留 MV 在发行之前。四团同卡访问和返回两版均为 4/4，每团耗时有升有降。MADEIN 的详情回归从 1/5 到 5/5，Windows、WSL 全量测试分别仍有 131、127 项失败。[实测与前后读数](worklogs/20261122-v226-release.md)

v225 普通目录读取遇到可识别的瞬断时补读一次。隔离 D1 同五个入口首次均成功恢复。51 团正式首页代表卡中 49 条有站内播放按钮，首次抵达并返回从 42/49 到 48/49。Hearts2Hearts 首次仍显示读取失败，18 次定向复走均得到正常目录。正式采样未捕获补读标记，暂不能将首轮差值归因于该改动。[逐团实测与剩余 502](worklogs/20261122-v225-release.md)

v224 修正 605 项作品切换舞台后的页首，公开目录同条件渲染从 0/605 到 605/605，MV 保持 605/605。正式站另验 5 项作品的 30 次页面状态。三团 12 次点卡测速中，Cherry Bullet 的 4 次为 1405–1630 ms，先前较慢的两次没有稳定复现。四场电视舞台仍无站内高清入口。[正式验收与待解决项](worklogs/20261122-v224-release.md)

v223 从 IVE 进入 IZ*ONE 手机目录后，首点 WONYOUNG 三次均成功。四次 PageDown 两版都滚动 3,149 px，历史写入从 81 次降至 5 次。十团 40 次打开本人并返回，原卡全部重新获得焦点，37 次坐标偏差在 4 px 内。AtHeart、HITGS、VCHA 的桌面短目录在首载后因滚动条消失而重排，三张原卡仍在屏内。等目录请求结束再测，两种返回方式合计 6/6 精确归位。[正式回读与实页图](worklogs/20261122-v223-release.md) · [短目录的设计取舍](20261122-USABILITY-DISCUSSION.md)

本版《BILLIONAIRE》上游仍拒播，七人的照片下评分在手机和桌面 14/14 可展开。《Magnetic》《ATTITUDE》均有两个推进的 4K 读数，实际码率未测得。点卡到播放按钮的最近同条件测速沿用 v222 的三个样本。[v223 站内短播](evidence/20261122-v223/formal-mv-playback.json) · [评分入口](evidence/20261122-v223/formal-billionaire-scores.json) · [v222 访问耗时](evidence/20261122-v222/formal-work-wait.json)

v222 的实测中，十团成员资料使用页内返回后，原卡位置正确的次数从 1/13 提升到 13/13。浏览器后退两版均为 13/13。两种方式返回原卡的焦点合计从 0/26 提升到 26/26。快速从 IVE 打开 IZ*ONE 手机目录时，第一次点 WONYOUNG 仍出现过停在原页，已排入 v223。[返回前后读数](evidence/20261122-v222/formal-member-return.json) · [手机首次点击](evidence/20261122-v222/formal-izone-first-click.json)

v222 的登录态详情在隔离 D1 上每次少两条查询。正式站三个同条件样本中，IVE 快 938 ms、ADYA 快 18 ms、Cherry Bullet 慢 487 ms。《BILLIONAIRE》两次进页和一次重新载入均无视频，《Magnetic》《ATTITUDE》各取得两个推进的 4K 读数，码率未测得。四场 B 站独占舞台仍为 0/4。[访问、播放与待处理事项](worklogs/20261122-v222-release.md)

v220 已将上批发现的七团首屏顺序修正。14/14 个画面的屏幕位置和真实 Tab 顺序均先 MV 后发行，28/28 次点击并返回正确。IVE 从进入首页到可点《LOVE DIVE》从 1,918 降至 642 ms，单看点卡后的等待则增加 416 ms。该团两张原 Figma 画板已对齐。31 个团内影像详情的实际站内和外部入口均已核实。《BILLIONAIRE》的同一上游曾在 v219 拒播，本版复测恢复；四场独占舞台仍为 0/4。[正式数据与 Figma](worklogs/20261122-v220-release.md)

v219 完成 51 个桌面首页与 Billlie 手机页的栏目键盘实测。额外核对首屏后，确认七团的发行入口早于 MV，已记录两档正文宽度的实际位置。729 个需从名册选取的评分位置已用隔离保存及读回验收。[逐团访问](worklogs/20261122-formal-home-access.md) · [正式修复与观看现状](worklogs/20261122-v219-release.md)

v218 在 v217 的三团基础上追加 25 团、27 个首页团照入口。两版的 51 团正式首页均返回 200。最初返回的网页在 20 团提供 21 个原图链接，另 8 团等待目录读入后提供 9 个。首次能点时逐一实测，共 30/30 打开正确原图。页面就绪后，30 个弹窗均已核对关闭时回到各自入口。[51 团正式 HTML](evidence/20261122-v218/formal-home-links.json) · [30 个入口实点](worklogs/20261122-v218-release.md)

v217 的《ATTITUDE》在导演提供的站内播放器上实际解码 3840 × 2160，静音播放读数前进，码率未测得。Cherry Bullet、Rocket Punch、Weeekly 的团照初次点击均能打开原图，页面就绪后也均能在弹窗查看并回焦。三团各三轮的作品详情等待中位数从 1,826 → 1,800 ms（IVE）、1,721 → 1,740 ms（ADYA）、2,032 → 1,833 ms（Cherry Bullet）。[播放、原图与访问时间](worklogs/20261122-v217-release.md)

v216 调整了 IZ*ONE、NMIXX、ITZY、Weeekly 和 KISS OF LIFE 八支作品的 63 个成员位置。已标明跨期的卡位从 194 减至 146 个。Cherry Bullet、Rocket Punch 与 Weeekly 的四张首页展示图合计从 11,238,516 字节降至 1,216,442 字节，减少 89.18%。正式页面每团各两次，在相同显示宽度下，团照解码时间中位数分别缩短 1,255.5、1,295 和 734 ms。[成员原图与出处](worklogs/20261122-eight-mv-release-portraits.md) · [首页正式数据](worklogs/20261122-v216-release.md)

63 张成员预览和 63 张完整原图在正式站均已解码。按每个展示文件计一次，八支作品的默认成员图从 23,251,746 字节降至 2,211,244 字节，减少 90.49%。375 px 和 1,265 px 正文下，每张照片下的本人评分、原图和关闭回焦均已实点。v216 发现的三团首页原图第一次点击未响应，已在 v217 修复。[八首正式字节对照](evidence/20261122-v216/formal-image-comparison.json) · [双宽交互实测](worklogs/20261122-v216-release.md) · [三团首次操作](evidence/20261122-v217/formal-home-originals.json)

v215 在正式站匿名直达 IVE、ADYA、Cherry Bullet 的三支样本时，目录分别从 2,125,457 个解码字节降至 12,005、7,272、11,574 字节，合计减少 99.52%。关联作品、成员身份和评分关系均已与全馆逐项核对。隔离快照的 614 个入口全部通过，合计减少 99.62%。[三团正式响应](evidence/20261122-v215/formal-anonymous-catalog.json) · [614 个入口与保存重试](worklogs/20261122-work-detail-catalog.md)

正文宽 1,265 px 的正式站实测中，从点击团页作品卡到详情播放按钮可见，三轮中位数分别为 IVE 2,234 → 2,392 ms、ADYA 2,321 → 2,628 ms、Cherry Bullet 4,084 → 3,480 ms。前两团变慢，第三团缩短 604 ms。[两版逐轮记录](evidence/20261122-v215/formal-detail-latency.json)

v214 将《Attention》原有的四张跨期成员图换为同一次发行的照片，DANIELLE 的同组原照也有了统一的 480 × 640 预览。五张首次展示的文件合计从 717,023 字节降至 150,462 字节。正式域名的五张小图和五张宽 2,000 px 的完整照片均已解码并核对。375 px 正文宽度下五张卡的原图、关闭后回焦和照片下评分均已实点。标明跨期的卡位从 198 减至 194 个。[五位成员的官方出处](worklogs/20261122-newjeans-attention-portraits.md) · [正式图片读数](evidence/20261122-v214/online-assets.json) · [正式手机逐卡操作](evidence/20261122-v214/formal-attention.json)

v211 的逐团浏览覆盖 2,949 个页面与操作组合，其中 2,929 个在本机生产构建完成，20 个 UDTT 目标在正式站完成。首页目录读取从 IVE 三次、ADYA 两次降为各一次。48 团混合展示 MV 与发行的 91 个路由均已调整顺序，ifeye、izna 和 UDTT 的独立页面也已调整。51 团正式首页实测发现 Billlie 的专辑封面在桌面仍高于 MV，v212 将 MV 放在完整的首行。[逐团验收](worklogs/20261122-group-journeys.md) · [首页顺序与 Billlie 修正](worklogs/20261122-artist-media-order.md)

v213 起，126 支作品各保留一个同版站内播放入口。正式站上，《BILLIONAIRE》静音短播为 1920 × 884，《Magnetic》通过制作方播放器一次点击即达到 3840 × 2160，两个样本均取得递增的播放时间。B 站独占的四个日本电视舞台仍缺同场的站内高清来源，页面写明状态并保留精确原片出处。51 团目录少传 12.39% 解码字节，三团样本的首页可点击时间中位数有所增加。[最新正式实播](evidence/20261122-v213/formal-playback.json) · [三团测速](worklogs/20261122-artist-catalog-speed.md) · [旧线路实测](worklogs/20261122-v212-release.md)

在 605 支 MV 上核查了 4,195 个作品与成员组合。599 支可为成员评分，6 支已确认无真人成员出镜。v209 正式站每个有 MV 的团各测一支，共 306 张照片全部解码。逐一点开后，两个分数输入框和保存按钮均在同一张照片下。《BILLIONAIRE》七位成员另做桌面和手机实测，原有作品评分经刷新读回。飞书两条已标记解决。[评分工作记录](worklogs/20261122-inline-mv-scores.md) · [正式逐团实点](evidence/20261122-v209/formal-group-opened-scores.json)

v210 的唯一应用文件差异是七条新增片源。同版候选从 v208 的 19 支增至 126 支。部分作品已有过高清实播，后续同一来源也可能不可用。《BILLIONAIRE》的 B 站旧备用线路实测为 640 × 294，v211 已移除该站内入口。[新增七支回执](worklogs/20261122-work-player-retries-v210.md) · [正式样本](evidence/20261122-v210/publication.json)

Hearts2Hearts 待看 10 张和全部 13 张作品封面均在 v208 正式站解码。527 个绑定舞台使用本站预览图。[作品预览](worklogs/20261122-work-previews.md)

## 线上内容

- 正式站 51 团的首页、成员目录在两档宽度共 204 次完成浏览，横向溢出为 0。v213 另在实测正文宽 1,265 px 的 51 团首页检查首屏字体、背景和图片，抽查的 67 张大图全部解码。[逐页正式回读](evidence/20261121-release-periods/all-group-routes.json) · [逐团视觉复核](worklogs/20261122-formal-home-design.md)
- IVE 使用 2022 年 4 月官网团标及《LOVE DIVE》时期方向。两个发行时期各有六张具名肖像、原图、出处和作品导航。手机正式首页第 640 像素出现第一张成员照。NewJeans、ADYA、W!TCHX、GENBLUE 和 Rocket Punch 已上线前轮审核的 22 张目录肖像。[IVE 实测](evidence/20261121-release-periods/rosters-and-eras.json) · [前轮逐团记录](worklogs/20261121-artist-brand.md)
- STAYC、ITZY、NMIXX、aespa 与 LE SSERAFIM 在 390 × 900 手机上，第 260–279 像素即可看到成员图，姓名均在首屏。另有 17 团换为经当期官网、公司或官方频道核实的标志。VVUP 的 2024 官方头像用于《4 Life》详情。[成员入口](evidence/20261121-release-periods/rosters-and-eras.json) · [团标审查与实页](worklogs/20261121-official-marks.md)
- 两轮合计 204 支 MV、1,274 个认人位置换图，原有 1,226 个第三方具名截图位置均已替换默认图。图注分别注明本作、同期或跨期，原作品图仍可打开。最新 84 支在正式站逐支核验。[逐图记录和前后对照](evidence/20261121-mv-release-portraits/review.md)
- 10 首歌的节目资料已上线，共 28 个不同的来源链接。两张日语版舞台封面已检查分 P 和时间。另有 81 项等待新证据，19 项沿用取消必填的决定。[节目核验](worklogs/20261121-broadcast-research.md) · [处置清单](evidence/20261121-repository-and-routes/content-disposition.json)

## 工程与下一步

v223 的 Windows 和 WSL 均通过 `npm run verify`。完整 `npm test` 每端各 4,135 项，Windows 通过 3,958、失败 138，WSL 通过 3,962、失败 134，两端各跳过 39 项。相对 v222 净增 6 项，既有失败逐项相同。[v223 双平台结果](evidence/20261122-v223/tests.json)

v222 的 Windows 和 WSL 均通过 `npm run verify`。完整 `npm test` 每端各 4,129 项，Windows 通过 3,952、失败 138，WSL 通过 3,956、失败 134，两端各跳过 39 项。相对 v220 净增 8 项，既有失败逐项相同。[v222 双平台结果](evidence/20261122-v222/tests.json)

v218 的 Windows 和 WSL 均通过 `npm run verify`，各完成 4,115 项全量用例。Windows 通过 3,938 项、失败 138 项、跳过 39 项，WSL 通过 3,942 项、失败 134 项、跳过 39 项。两边与 v217 同名套件、文件和用例的结果相同，连续两版均无新增失败。[v218 双平台结果](evidence/20261122-v218/tests.json) · [v217 双平台结果](evidence/20261122-v217/tests.json)

v216 的 Windows 和 WSL 均通过 `npm run verify`。完整 `npm test` 各有 4,114 项，Windows 通过 3,937 项、失败 138 项、跳过 39 项，WSL 通过 3,941 项、失败 134 项、跳过 39 项。新增八项均通过，余下失败和 v215 逐项相同。[v216 双平台结果](evidence/20261122-v216/tests.json)

v215 的 Windows 和 WSL 均通过 `npm run verify`。完整 `npm test` 各有 4,106 项，Windows 通过 3,929 项、失败 138 项、跳过 39 项，WSL 通过 3,933 项、失败 134 项、跳过 39 项。相对 v214，两边均通过新加的六项回归，另外消除一条服务端首次渲染失败。余下失败均在上个版本出现。v213 已更新四团的作品评分、草稿、返回与隔离 D1 验收，消除 27 条旧失败。[v215 双平台结果](evidence/20261122-v215/tests.json) · [v214 双平台结果](evidence/20261122-v214/tests.json) · [四团详情验收](worklogs/20261122-current-detail-regression.md)

后续优先处理《BILLIONAIRE》首发版拒播。Cherry Bullet 点卡耗时的分段复测见本轮回执。四场独占舞台继续寻找同场站内高清来源。三个桌面短目录首次加载时的重排已记录待讨论。剩余 146 个已标注跨期的认人位置中，124 个已找到当次发行的图集，22 个还缺合适的具名单人出处。51 团首页和 49 个有关目录已在手机、桌面核过 MV 与专辑的顺序。个人目录批量读取在连接器提供对应工具时验证。[认人位置明细](evidence/20261122-member-release-portraits/remaining-194.csv) · [两档宽度的排序](worklogs/20261122-group-interaction-followup.md) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md)

前轮工程优化、发布与原始审查分别保存在各自的工作记录中。[上一正式版 v203](v203-release-20261030.md) · [项目审查](worklogs/20261121-project-audit.md) · [历史协作与验收](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)
