# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v244。ADYA 与 YOUNG POSSE 的十张默认成员照合计少传 88.4%。ADYA《RIZZ》从舞台筛选打开舞台整体评分。QWER、PURPLE KISS、ILLIT 的首页原图和目录可随首份网页打开。[正式验收](worklogs/20261122-v244-release.md) |
| GitHub 主线 | `main` 保留用户验收的 `0e77838a`。归档历史和两个独有分支可按标签恢复。[仓库整理回执](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`。v244 正式工程 `b2cd0bdf`。下一批修正 KISS OF LIFE 等团的舞台卡、izna 的站内舞台入口和 ADYA 返回后立即再次点击的入口，缩短访客目录计算。[发布回执](evidence/20261122-v244/publication.json) · [逐团设计清单](worklogs/20261122-group-design-coverage.md) |

## 11 月 22 日更新

v240 的 Windows 和 WSL 各通过类型检查、生产构建及 1,354/1,354 项现行测试。599 支可评 MV 的 4,195 张初始或手选成员卡已在隔离数据中核对照片与评分入口，729 次手选保存均可读回。NewJeans 375 px、SAY MY NAME 1425 px 的正式页面均已实取 208,864 字节的 WOFF2。[本批测试和覆盖](worklogs/20261122-v240-release.md) · [两页正式字体](evidence/20261122-v240/formal-home-fonts.json)

v239 的 Windows、WSL 各通过类型检查、生产构建及 1,353/1,353 项现行测试。正式站 NewJeans 手机首页和 SAY MY NAME 桌面首页均实取 571,240 字节的 Nunito Sans。该字体的全字形 WOFF2 已在开发端验证为 208,864 字节。飞书清单在 v238 的最近一次已存记录是 25/29 项已解决。[v239 回归](evidence/20261122-v239/tests.json) · [字体实测](evidence/20261122-v239/home-font-baseline.json) · [v238 飞书记录](worklogs/20261122-v238-release.md)

已在 51 团打开 338 张成员档案。UDTT 5 人使用正式 v236，其余在隔离开发环境逐个验证；其中 48 团另核了资料模块顺序。后续播放按实际发生的变化验收。《BILLIONAIRE》沿用正式 v236 已通过的站内实播记录，已从默认短测列表移除。[成员档案验收](worklogs/20261122-member-routes.md) · [已有播放结果](evidence/20261122-v236/formal-billionaire-2160p.json)

v232 在正式作品页核实首发版可手选 2160p。七人双宽 14/14 个照片下评分入口可展开，四场独占舞台尚无合格站内入口。[实测与回归](worklogs/20261122-v232-release.md)

v231 在 11 团 19 个实际页面上收口时间轴日期、作品参与者和公告文案。正式 v230 桌面读到 42/42 处旧句。v231 桌面 1265 × 720、手机 375 × 844 均实开 19/19 页，各读到 38/38 处新句，旧句为零。正式站《Magnetic》静音解码 4K，《BILLIONAIRE》首发重走后仍无递增进度，七人两档的照片下评分共 14/14 可展开，四场独占舞台仍缺站内高清来源。Windows 与 WSL 各通过现行回归 1311/1311，完整套件保留 131、127 项既有失败。另核四团原 27 条详情失败已清零，现行详情及隔离 D1 两端各 41/41。[上线、逐页、播放与回归](worklogs/20261122-v231-release.md)

v230 将《Purple》的五张跨期资料照替换为同次发行的具名海报。首显图片从 144,454 降至 142,394 字节，减少 1.43%。正式站两档宽度下五人原图、旧作品图、关闭回焦和照片下双评分均通过。已追踪的跨期位置余 135 个。正式短播中，《Magnetic》取得两个递增 4K 读数，《BILLIONAIRE》10.5 秒内仍无解码进度，均未取得独立码率。两端完整测试各 4210 项，Windows 131、WSL 127 项既有失败。[图片、播放与双端验收](worklogs/20261122-v230-release.md)

v229 在九团的 11 个控件上逐一用鼠标和键盘进入详情后返回，恢复原入口焦点由 0/22 到 22/22。九团全部 71 个链接中，v229 已完成 70 个，SPIA 最后一项在 v230 补验。目录计算在同份快照的中位数减少 45.71%。正式三轮点卡中位数分别为 Cherry Bullet 少等 1265 毫秒、IVE 多等 520 毫秒、ADYA 多等 668 毫秒。v229 的《BILLIONAIRE》已保存 MV 分在刷新后保持一致，七位成员的两档评分入口共 14/14 可展开。四场 B 站独占舞台当版仍缺站内高清来源。[时间轴、访问、评分与四场舞台](worklogs/20261122-v229-release.md)

v228 在隔离故障对照中从 0/8 提到 8/8 可区分具体读取步骤。正式抽测中三团代表卡以及前次较慢的两条作品库路径均抵达播放器按钮并返回。IVE 时间轴 22 个关联目标均已逐个实点。完整测试两端各 4,199 项，均无新增失败。[正式数据与范围](worklogs/20261122-v228-release.md)

v227 在手机与桌面逐一检查十团发行目录。两档宽度各保留 49 张唱片，混入的影像从 78 条降至 0 条，打开唱片后返回原发行筛选从 0/10 升至 10/10。八团样本的 MV 封面主操作均改为站内作品，桌面首轮 6/8 看见播放按钮并返回，Geenius《Voyage》和 TRACER《365》重走均通过。三支正式静音短播中有两支解码 3840 × 2160。《BILLIONAIRE》仍在等待，七人的照片下评分两宽共 14/14 可展开。四场指定 B 站舞台站内高清仍为 0/4。[正式操作、短播与同条件前后对照](worklogs/20261122-v227-release.md)

ADYA 与 W!TCHX 的首页、名册、作品库已核对 18 幅 Figma 画板。EVERGLOW《SLAY》六人同期照片、旧作品图、回焦和评分均已在正式站双宽逐卡实点，首显图片字节减少 17.13%。跟踪的 194 个跨期位置中，现有 54 个已核原件，140 个待核。正式 v226 另验两团时间轴的 10 个详情目标，浏览器后退 10/10 恢复原位置但原控件均未回焦，页内返回 10/10 去到作品目录。已列入后续修复。[两团 Figma 与来源](worklogs/20261122-adya-witchx-figma.md) · [《SLAY》逐卡验收](evidence/20261122-v227/formal-slay.json) · [时间轴返回基线](evidence/20261122-v227/v226-timeline-adya-witchx.json)

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

接续 W!TCHX《BLALA》官方歌词版、ADYA《Per》指定完整版和四场独占舞台的同版站内来源。《BILLIONAIRE》沿用正式 v236 的站内 2160p 实播记录。飞书第 9、18 项已标记解决，修订 1217 读回 27/29；第 8、17 项继续跟进。三个桌面短目录首次加载时的重排留待讨论。51 团首页和 49 个有关目录已在手机、桌面核过 MV 与专辑顺序。个人目录批量读取在连接器提供对应工具时验证。[歌词版正式结果](evidence/20261122-v240/formal-blala-playback.json) · [独占舞台来源](worklogs/20261122-exact-stage-rights.md) · [成员照片逐项清单](evidence/20261122-member-release-portraits/remaining-194.csv) · [双宽排序](worklogs/20261122-group-interaction-followup.md) · [开发顺序](PROJECT-AUDIT-AND-ROADMAP-20261121.md)

前轮工程优化、发布与原始审查分别保存在各自的工作记录中。[上一正式版 v203](v203-release-20261030.md) · [项目审查](worklogs/20261121-project-audit.md) · [历史协作与验收](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)
