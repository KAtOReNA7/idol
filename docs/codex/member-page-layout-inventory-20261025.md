# 个人页面模块排版现状统计

审查完成：2026-10-26（Asia/Shanghai）；本轮从 2026-10-25 开始，因此文件名保留该日期。

本次仅统计，不改个人页面设计。现有个人页分为两层：51 团各自的成员详情，以及共用一套模板的个人手帐。51 团有 338 条“团体—成员”上下文、对应 331 个不同成员；共享个人手帐共有 338 条记录。独立团页详情实际渲染 336 条，2 条历史成员详情缺失。

依据为已发布 v7 的本地发布包与冻结代码 `d412376bd7f72df83d6a6bf46d9cd8e3b0a78f65`。使用 Chrome 在 1440×1000 视口读取全部 338 条团体成员上下文和 338 条共享个人页的结构，并检查原生 Shadow DOM 与当前路由源码。本次主动阻止图片和媒体请求，仅统计模块；不将图像失败提示作为照片缺失，也不声称做过视觉、图片或移动端验收。后续主任务新增的 MV 认人图不混入这份 v7 排版基线。

## 统计口径与主要结果

| 项目 | 数量 | 含义 |
| --- | ---: | --- |
| 团体范围 | 51 | 当前工程登记的独立团体页 |
| 团体成员上下文 | 338 | 同一成员可能在当前团体和历史团体分别有详情 |
| 团体上下文中的独立成员 | 331 | 按稳定成员 ID 去重 |
| 有效独立成员详情 | 336 | 2 条历史档案链接显示“不在档案中” |
| 共享个人手帐 | 338 | 使用同一 MemberDetail 模板 |
| 共享页有简介／经历模块 | 338 | 其中 279 条含实际经历条目；59 条只有简介／官方页等 |
| 独立页使用共享经历组件 | 187 | 涉及 27 团；另外 24 团使用自定义资料或精简时期档案 |
| 关键资料默认折叠 | 33 | 涉及 UNIS、LOONA、NewJeans、Hearts2Hearts 4 团 |
| 独立详情直接进入共享手帐 | 329 | 336 条有效详情中，BADVILLAIN 的 7 条无该入口 |
| 共享页无51团关系的记录 | 7 | Red Velvet 5 人及 HANA 2 人，仍有共享个人页 |

“历史”仅按现有资料库 `formerGroupIds` 统计：46 条上下文涉及 14 团，不代表本次核实了全部团体的现实活动状态，也不等同于“用了历史照片”的人数。

## 共享个人手帐：当前模块顺序

1. 返回。
2. 肖像及原图入口。
3. 团体链接与姓名。
4. 公开身体资料（有值时）。
5. 状态／国家／角色标签。
6. 简介／相关官方页／演艺经历／来源。
7. 个人动态或未收录提示。
8. 作品综合分／已评数／表现及造型均分。
9. 个人备注与编辑器（依权限与数据）。
10. 她的作品（个人评分关系）。
11. 公开作品资料（有值时）。

源码：[MemberDetail](../../apps/idol-site/app/page.tsx#L479)，以及 [简介与经历](../../apps/idol-site/components/member-career-facts.tsx)、[公开身体资料](../../apps/idol-site/components/member-physical-facts.tsx)、[个人动态](../../apps/idol-site/components/social-links.tsx)、[公开作品资料](../../apps/idol-site/components/public-work-credits.tsx)。行号针对上述冻结提交，后续主任务改动可能使行号移动。

| 共享模块 | 显示记录数 / 338 | 当前情况 |
| --- | ---: | --- |
| 简介／经历区域 | 338 | 全部有该区域；不表示经历资料完整 |
| 带条目的演艺经历 | 279 | 另 59 条不显示经历列表 |
| 公开身体资料 | 2 | 按已核验来源有值才展示；不能解释为其他成员没有此类事实 |
| 个人动态真实账号 | 0 | 338 条都显示“暂未收录个人社媒账号”；不是断言现实中没有账号 |
| 作品综合分概览 | 338 | 包括已评数量、表现与造型均分；只读审阅中的个人分值被清空 |
| 至少一张关联作品卡 | 323 | 15 条没有既有成员—作品评分关系 |
| 公开作品资料 | 15 | 独立于个人评分关系；不自动生成评分关联 |
| 备注与编辑器 | 0 | 审阅包清空备注并限制编辑，不能当作正式功能丢失 |

全部共享页合计渲染 2,828 张成员—作品卡；这是卡片出现次数，不是唯一作品数。共享页没有单独的个人时间轴模块，只有“演艺经历”列表。私有照片字段在审阅投影中清空，公开肖像由其他映射提供，因此不能根据 `member.photo` 为空统计缺图。

## 独立个人页的编排类型

以下按阅读顺序分为 7 类，便于讨论下一步统一方案；这些是编辑分类，不表示同类页面共用同一组件或视觉。

| 编排类型 | 团数 | 团体 |
| --- | ---: | --- |
| 照片／资料首屏＋综合评分＋作品造型 | 11 | BABYMONSTER、XG、aespa、KISS OF LIFE、STAYC、NMIXX、ITZY、LE SSERAFIM、KiiiKiii、SAY MY NAME、KATSEYE |
| 七团新设计共用的成员档案骨架 | 7 | MADEIN、QWER、PURPLE KISS、IVE、tripleS、RESCENE、ILLIT |
| 主要个人资料默认折叠 | 3 | LOONA、NewJeans、Hearts2Hearts |
| 个人资料＋发行参与／作品 | 5 | ifeye、izna、YOUNG POSSE、BEWAVE、i-dle |
| 个人资料／时期说明＋关联作品 | 17 | VVUP、Candy Shop、ODD YOUTH、ADYA、Geenius、TRACER、WITCHX、SPIA、VCHA、HITGS、AtHeart、IZ*ONE、fromis_9、EVERGLOW、Rocket Punch、Cherry Bullet、Weeekly |
| 各团专属编排 | 7 | MEOVV、GENBLUE、UNIS、BADVILLAIN、WOOAH、Billlie、Kep1er |
| 具名出演证据／资料片段 | 1 | UDTT |

## 51 团逐项清单

“数量”写为上下文数／可渲染详情数。“顺序”是源码与文档顺序，不保证每个视口的左右列位置相同；括号内模块按数据或权限出现。原生 ifeye、izna、UDTT 的手帐入口为按钮，已经结合 host 源码核对。所有个人记录入口仍须遵守原有权限。

| 团体与示例 | 数量 | 模块顺序 | 条件与差异 | 生效源码 |
| --- | ---: | --- | --- | --- |
| [MEOVV](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/meovv?section=members&member=rec28ldbniBafU) | 5/5 | 返回及面包屑 → 姓名／肖像及来源 → 简介与经历 → 公开身体资料及事实 → 共享个人手帐入口 → 关联作品综合分及作品卡（有关系时） → 作品库入口 | 评分概览在关联作品区。 | [meovv-design.tsx:88](../../apps/idol-site/components/candidate/meovv-design.tsx#L88) |
| [izna](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/izna?section=members&member=rec28ldbniBcnd) | 7/7 | 返回及姓名／历史状态 → 肖像 → 简介／事实 → 发行成员名单 → 发行宣传参与 → MV → 舞台 → 上一位／下一位 → 原生成员手帐控件 | 参与区有资料时才出现；发行名单与宣传参与分开。host.mjs:111 注入手帐按钮。 | [izna.mjs:84](../../apps/idol-site/lib/idol/izna-runtime/izna.mjs#L84) |
| [tripleS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/triples?section=members&member=rec28ldbniBd3n) | 24/24 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [MADEIN](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/madein?section=members&member=rec28ldbniBgam) | 7/7 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [ifeye](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/ifeye?section=members&member=recvxAPQCFX60u) | 6/6 | 返回 → 肖像／身份／角色／简介／事实 → 参与发行（有值时） → 参与影像（有值时） → 上一位／全员／下一位 → 原生成员手帐控件 | host.mjs:111 注入“查看成员手帐”按钮，不是普通 a 链接；首尾成员不循环。 | [ifeye.mjs:90](../../apps/idol-site/lib/idol/ifeye-runtime/ifeye.mjs#L90) |
| [GENBLUE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/genblue?section=members&member=recvxAPQCFknfS) | 6/6 | 返回及姓名 → 官网完整成员卡照片 → 职务／简介／国籍／生日 → 共享个人手帐入口 → 参与 MV 与逐作品评分（有关系时） → 其他成员及全员入口 | 主要资料与成员卡图并排；不应把卡图内文字算作单独可访问的资料字段。 | [bluecut-experience.tsx:137](../../apps/idol-site/components/genblue/bluecut-experience.tsx#L137) |
| [RESCENE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/rescene?section=members&member=recvxAPQCFEoKg) | 5/5 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [UNIS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/unis?section=members&member=recvxAPQCFeTtL) | 8/8 | 返回 → 方形肖像及身份 → 共享个人手帐与原图入口 → 更多成员资料（默认折叠：身体资料／简介经历／来源） → 作品记录（有关系时） → 团体作品推荐 | 8 个成员详情的关键资料默认折叠；不是所有模块都常驻展开。 | [unis-design-review.tsx:162](../../apps/idol-site/components/design-review/unis-design-review.tsx#L162) |
| [BADVILLAIN](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/badvillain?section=members&member=recvxAPQCFrpke) | 7/7 | 返回及姓名 → 肖像及团体身份 → 公开身体资料／简介经历 → 官方来源／团体作品／时间轴入口 → 个人作品与造型（有关系时） → 上一位／下一位 | 7 个详情均没有直达共享个人手帐的入口；逐作品记录入口仍存在。 | [badvillain-design.tsx:51](../../apps/idol-site/components/candidate/badvillain-design.tsx#L51) |
| [QWER](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/qwer?section=members&member=recvxAPQCFvKfO) | 4/4 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [VVUP](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/vvup?section=members&member=recvxAPQCFDPha) | 5/5 | 返回 → 肖像及原图 → 身份／当前或历史时期说明 → 公开身体资料／简介经历 → 共享个人手帐与来源 → 她的作品 | 无独立综合评分概览与下一位成员模块。 | [vvup-artist.tsx:91](../../apps/idol-site/components/vvup-artist.tsx#L91) |
| [YOUNG POSSE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/youngposse?section=members&member=recvxAPQCFTDpN) | 5/5 | 返回及姓名 → 肖像 → 简介／角色／生日／国籍 → 参与发行 → 共享个人手帐入口 → 作品造型及逐作品评分（有关系时） → 下一位 | 参与发行放在个人介绍区内，之后才是作品评分。 | [youngposse-artist.tsx:62](../../apps/idol-site/components/youngposse-artist.tsx#L62) |
| [BEWAVE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/bewave?section=members&member=recvxAPQCFRRHa) | 6/6 | 返回及姓名 → 肖像／采访与照片来源 → 简介／角色／生日／国籍 → 参与发行 → 共享个人手帐入口 → 作品造型及逐作品评分（有关系时） → 下一位 | 采访与照片来源在资料区域明确展示。 | [bewave-artist.tsx:62](../../apps/idol-site/components/bewave-artist.tsx#L62) |
| [Candy Shop](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/candyshop?section=members&member=recvxAPQCFWHg2) | 5/5 | 返回 → 肖像及身份 → 简介／生日／角色／国籍 → 来源／原图／共享个人手帐 → 关联作品及逐作品评分 → 下一位 | 当前与历史档案沿用各自资料；个人记录通过共享页编辑。 | [candyshop-artist.tsx:65](../../apps/idol-site/components/candyshop-artist.tsx#L65) |
| [ODD YOUTH](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/oddyouth?section=members&member=recvxAPQCF8okQ) | 5/5 | 返回 → 肖像及身份 → 简介 → 原图／共享个人手帐／来源 → 关联作品及逐作品评分 → 下一位 | 关联作品与个人简介分区。 | [oddyouth-artist.tsx:65](../../apps/idol-site/components/oddyouth-artist.tsx#L65) |
| [ADYA](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/adya?section=members&member=recvxAPKXChZPr) | 5/5 | 返回 → 肖像及身份 → 简介 → 原图／共享个人手帐／来源 → 关联作品及逐作品评分 → 下一位 | 关联作品与个人简介分区。 | [adya-artist.tsx:65](../../apps/idol-site/components/adya-artist.tsx#L65) |
| [Geenius](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/geenius?section=members&member=recvxAPQCFth1h) | 5/5 | 返回 → 肖像及身份 → 简介 → 原图／共享个人手帐／来源 → 关联作品及逐作品评分 → 个人发行（具名成员有值时） → 下一位 | Yeyoung 有额外个人发行区。 | [geenius-artist.tsx:65](../../apps/idol-site/components/geenius-artist.tsx#L65) |
| [TRACER](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/tracer?section=members&member=recvxAPQCFokd7) | 4/4 | 返回 → 肖像及原图 → 身份／简介／韩文名／生日 → 共享个人手帐／官网资料卡／来源 → 公开影像 → 下一位 | 公开影像资料不是自动新增的成员个人评分关系。 | [tracer-artist.tsx:64](../../apps/idol-site/components/tracer-artist.tsx#L64) |
| [WITCHX](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/witchx?section=members&member=recvxAPQCFYRd0) | 5/5 | 返回 → 肖像及原图 → 身份／简介／原文名／生日 → 共享个人手帐／官网资料卡／来源 → 公开影像 → 下一位 | 公开影像资料与个人评分关系分开。 | [witchx-artist.tsx:63](../../apps/idol-site/components/witchx-artist.tsx#L63) |
| [SPIA](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/spia?section=members&member=recvxAPQCFUlxH) | 5/5 | 返回 → 肖像及原图 → 姓名／简介／2024 阵容时期 → 共享个人手帐／官网资料卡／来源 → 公开影像 → 下一位 | 档案姓名及照片时期说明代替统一生日字段；公开资料不等于评分关系。 | [spia-artist.tsx:64](../../apps/idol-site/components/spia-artist.tsx#L64) |
| [UDTT](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/udtt?section=members&member=recvxAPQCFt0cc) | 5/5 | 返回 → 肖像及时期 → 身份／国籍／生日／角色／简介／来源 → 已核实出演影像或资料片段 → 照片与资料来源 → 原生共享成员记录按钮 → 返回 | 4 人为 School Rush 资料及已核实 REALLY REALLY；Lu Yuting 为历史照片与采访资料片段，具体影像关联待补。host.mjs:113–127 安装记录按钮。 | [presentation.mjs:36](../../apps/idol-site/lib/idol/udtt-native/presentation.mjs#L36) |
| [VCHA](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/vcha?section=members&member=recvxAPQCFiOOc) | 6/6 | 返回 → 肖像／原图及图注 → 姓名／简介／生日／照片时期 → 共享个人手帐及来源 → 已有关联作品 → 下一位 | 照片时期与身份资料保留在首屏说明。 | [vcha-artist.tsx:58](../../apps/idol-site/components/vcha-artist.tsx#L58) |
| [HITGS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/hitgs?section=members&member=recvxAPQCFxcH2) | 5/5 | 返回 → 肖像／原图及图注 → 姓名／简介／生日／照片时期 → 共享个人手帐及来源 → 已有关联作品 → 下一位 | 照片时期与身份资料保留在首屏说明。 | [hitgs-artist.tsx:57](../../apps/idol-site/components/hitgs-artist.tsx#L57) |
| [AtHeart](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/atheart?section=members&member=recvxAPQCFuyDB) | 7/7 | 返回 → 肖像／原图及图注 → 姓名／简介／生日／照片时期 → 共享个人手帐及来源 → 已有关联作品 → 下一位 | 照片时期与身份资料保留在首屏说明。 | [atheart-artist.tsx:58](../../apps/idol-site/components/atheart-artist.tsx#L58) |
| [i-dle](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/idle?section=members&member=recvxyIzFgRD0w) | 6/6 | 身份及照片 → 当前／历史／国籍／来源／原图／返回 → 个人发行（有值时） → 关联作品 → 共享作品与评分入口 → 下一位 | 本团独立详情无统一叙述简介／演艺经历区；个人发行仅在已收录成员中出现。 | [idle-design.tsx:83](../../apps/idol-site/components/candidate/idle-design.tsx#L83) |
| [IZ*ONE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/izone?section=members&member=rec28ldbniBbbO) | 12/12 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [izone-design.tsx:54](../../apps/idol-site/components/candidate/izone-design.tsx#L54) |
| [fromis_9](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/fromis9?section=members&member=recvxyICzHLSpi) | 9/9 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [fromis9-design.tsx:46](../../apps/idol-site/components/candidate/fromis9-design.tsx#L46) |
| [LOONA](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/loona?section=members&member=recvxyICzHkFju) | 12/12 | 返回 → 肖像及来源 → 姓名／小分队／团体 → 原图及跳转作品 → 档案与个人记录（默认折叠：归属／身体资料／简介经历／事实／三项评分／手帐入口） → LOONA 作品 → 上一位／下一位 | 12 个成员详情的核心档案折叠；相邻成员导航带照片。 | [loona-design.tsx:155](../../apps/idol-site/components/candidate/loona-design.tsx#L155) |
| [EVERGLOW](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/everglow?section=members&member=recvxyICzHDN27) | 6/6 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [everglow-design.tsx:47](../../apps/idol-site/components/candidate/everglow-design.tsx#L47) |
| [Rocket Punch](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/rocketpunch?section=members&member=recvxyICzHhNwL) | 6/6 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [rocketpunch-design.tsx:48](../../apps/idol-site/components/candidate/rocketpunch-design.tsx#L48) |
| [Cherry Bullet](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/cherrybullet?section=members&member=recvxyICzH2UTs) | 10/10 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [cherrybullet-design.tsx:48](../../apps/idol-site/components/candidate/cherrybullet-design.tsx#L48) |
| [Weeekly](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/weeekly?section=members&member=recvxyICzHH702) | 7/7 | 返回 → 肖像及原图 → 姓名／国籍／身份时期／照片时期 → 来源及共享作品与评分入口 → 关联影像 → 下一位 | 本团独立详情无叙述简介／演艺经历区；共享个人手帐仍可有简介与经历。 | [weeekly-design.tsx:48](../../apps/idol-site/components/candidate/weeekly-design.tsx#L48) |
| [WOOAH](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/wooah?section=members&member=recvxyICzHGJek) | 6/6 | 返回 → 肖像及姓名／角色 → 个人简介／经历／来源及历史公告 → 团体作品／共享个人手帐入口 → 核实 MV 列表 → 下一位 | 使用本团自定义经历段落，不等同于共享 MemberCareerFacts 组件。 | [editorial.tsx:103](../../apps/idol-site/components/wooah/editorial.tsx#L103) |
| [PURPLE KISS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/purplekiss?section=members&member=recvxyICzHxdYR) | 7/7 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [Billlie](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/billlie?section=members&member=recvxyICzHhav7) | 7/7 | 肖像及身份 → 共享个人手帐／团体作品入口 → 简介及个别活动公告 → 公开身体资料 → 独立演艺经历区 → 关联作品 → 官方外部影像（有值时） → 其他成员及全员 | Haruna 有活动公告；部分成员有独立的官方外部影像。 | [billlie-design.tsx:76](../../apps/idol-site/components/candidate/billlie-design.tsx#L76) |
| [Kep1er](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/kep1er?section=members&member=rec28ldbniBgam) | 9/9 | 返回及姓名 → 肖像／图注／来源 → 归属及团体作品／时间轴／共享手帐入口 → 公开身体资料／简介经历 → 关联作品 → 个人版本封面（有值时） | 部分成员显示历史个人版本封面，不是每个成员都有该模块。 | [kep1er-design-review.tsx:83](../../apps/idol-site/components/design-review/kep1er-design-review.tsx#L83) |
| [NewJeans](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/newjeans?section=members&member=recvxyICzHGklh) | 5/5 | 返回控件 → 姓名及历史状态 → 肖像／身份／来源／共享手帐／团体作品 → 上一位下一位或历史返回 → 个人资料、作品与造型（默认折叠：身体资料／简介经历／事实／综合分／MV 卡） | 5 个详情默认连作品一起折叠；历史成员没有当前成员的上一位／下一位。 | [newjeans-design.tsx:89](../../apps/idol-site/components/candidate/newjeans-design.tsx#L89) |
| [BABYMONSTER](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/babymonster?section=members&member=rec28ldbniB9dP) | 7/7 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [artist-sample.tsx:89](../../apps/idol-site/components/artist-sample.tsx#L89) |
| [ILLIT](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/illit?section=members&member=rec28ldbniB7Nx) | 5/5 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [XG](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/xg?section=members&member=recvxDM2kSglhG) | 7/7 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [expanded-artist.tsx:87](../../apps/idol-site/components/expanded-artist.tsx#L87) |
| [aespa](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/aespa?section=members&member=recvxyICzH9h49) | 4/4 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [expanded-artist.tsx:87](../../apps/idol-site/components/expanded-artist.tsx#L87) |
| [IVE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/ive?section=members&member=recvxyICzHJ8OM) | 6/6 | 返回 → 肖像及原图／来源 → 姓名与身份 → 简介与经历 → 公开身体资料（有值时） → 共享个人手帐入口 → 上一位／下一位 → 作品区及已评数量／表现造型均分 → 关联作品 → 公开作品资料（有值时） | 实际路由使用七团新组件，不使用仓库残存旧版团体组件；七团视觉仍各自独立。 | [artist.tsx:80](../../apps/idol-site/components/seven-redesign/artist.tsx#L80) |
| [KISS OF LIFE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/kissoflife?section=members&member=rec28ldbniBaIJ) | 4/4 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [kiof-artist.tsx:87](../../apps/idol-site/components/kiof-artist.tsx#L87) |
| [STAYC](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/stayc?section=members&member=recvxyICzHvtEe) | 6/6 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [stayc-artist.tsx:83](../../apps/idol-site/components/stayc-artist.tsx#L83) |
| [NMIXX](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/nmixx?section=members&member=recvxyICzHsxMe) | 7/6 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。历史 JINNI 详情未渲染，共享个人页存在。 | [nmixx-artist.tsx:91](../../apps/idol-site/components/nmixx-artist.tsx#L91) |
| [Hearts2Hearts](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/hearts2hearts?section=members&member=rec28ldbniB6s5) | 8/8 | 返回 → 原图肖像／姓名／官方页 → 个人资料与评分（默认折叠：身体资料／简介经历／基本事实／综合分／社媒／手帐） → 作品卡 → 继续浏览团体作品 | 8 个详情的核心资料与手帐入口位于折叠块。 | [hearts2hearts-artist.tsx:96](../../apps/idol-site/components/hearts2hearts-artist.tsx#L96) |
| [KiiiKiii](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/kiiikiii?section=members&member=rec28ldbniB8oY) | 5/5 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [kiiikiii-artist.tsx:104](../../apps/idol-site/components/kiiikiii-artist.tsx#L104) |
| [ITZY](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/itzy?section=members&member=recvxyICzHc0lT) | 5/5 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [itzy-artist.tsx:85](../../apps/idol-site/components/itzy-artist.tsx#L85) |
| [LE SSERAFIM](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/lesserafim?section=members&member=recvxyICzHYJy3) | 6/5 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。历史 KIM GARAM 详情未渲染，共享个人页存在。 | [lesserafim-artist.tsx:86](../../apps/idol-site/components/lesserafim-artist.tsx#L86) |
| [SAY MY NAME](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/saymyname?section=members&member=rec28ldbniBbbO) | 8/8 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [saymyname-artist.tsx:104](../../apps/idol-site/components/saymyname-artist.tsx#L104) |
| [KATSEYE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/katseye?section=members&member=recvxAPQCF3yTY) | 6/6 | 返回 → 肖像及身份 → 公开身体资料（有值时） → 简介与经历 → 国家／生日／状态／角色 → 三项作品评分概览 → 共享个人手帐入口 → 个人社媒（有值时） → MV 造型／关联作品 | 社媒与公开身体资料按数据条件显示；照片原图控制及事实字段因团而异。 | [katseye-artist.tsx:103](../../apps/idol-site/components/katseye-artist.tsx#L103) |

## 需要在后续统一设计时处理的差异

1. **同一成员有两层页面。** 独立团页负责团体视觉与时期内容，共享个人手帐负责统一评分与记录。资料、作品和来源在两层重复，但顺序、标题和入口位置不同。当前不能用“全部个人页已经统一”描述。
2. **折叠策略不一致。** UNIS 8 条折叠更多资料；LOONA 12 条折叠档案与记录；Hearts2Hearts 8 条折叠资料与评分；NewJeans 5 条连作品卡也放进默认折叠块。合计 33 条。此处不包括仅折叠来源说明或导航菜单。
3. **7 团独立详情没有叙述性简介或经历区。** i-dle、IZ*ONE、fromis_9、EVERGLOW、Rocket Punch、Cherry Bullet、Weeekly 合计 56 条，主要是身份、照片时期、来源和作品；共享个人手帐仍可有简介与经历。i-dle 部分成员另有个人发行。
4. **2 条历史成员独立档案未覆盖。** [NMIXX · JINNI](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/nmixx/?section=members&member=recvxyICzHyM9P) 与 [LE SSERAFIM · KIM GARAM](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/lesserafim/?section=members&member=recvxyICzHeqSw) 显示“不在档案中”。对应共享个人页存在。两个组件只从当前 `collection.members` 取详情，未扩展历史成员；这是路由覆盖差异，本次未改。
5. **BADVILLAIN 缺少直达共享成员手帐的入口。** 7 条详情可进入官方资料、团体作品、团体时间轴与逐作品记录，但没有与多数团一致的成员个人记录入口。原生 3 团有相应按钮，不属于该缺口。
6. **资料完整度不能从空块直接推断。** 共享页个人社媒 0 条已收录、公开身体资料仅 2 条、59 条没有经历列表。后续可决定是否补资料／隐藏空块。没有个人社媒记录不等于没有账号；没有关系不等于未出演。审阅站清空的评分、备注与私有图不应列为缺失。
7. **同一团的不同成员也有条件模块。** Geenius 的 Yeyoung 有个人发行；Billlie 的部分成员有外部官方影像，Haruna 有活动公告；Kep1er 部分成员有个人版本封面；UDTT 的 Lu Yuting 是采访资料片段，其余 4 人有已核实出演影像；NewJeans 历史成员和当前成员的相邻导航不同。统一设计应保留这些资料差异。
8. **公开参与与私人评分关系是两种内容。** TRACER、WITCHX、SPIA、UDTT 等页面展示公开影像证据；共享页还单列公开作品资料。它们不能因版式统一就直接合并为已有个人评分记录。

## 给下一步统一方案的决策依据

建议下一轮先确定两层页面各自职责，再统一模块的最低要求：是否所有独立详情都固定展示简介／经历；核心资料是否保持展开；综合分放首屏还是作品区；是否固定成员手帐入口与上一位／下一位；历史身份、照片时期与资料来源怎样保留；缺资料时显示说明还是省略模块。本次只提供现状，不提前替用户选定版式。

## 验证边界与附件

- 全量结构：51 个团页代表样本、338 条团体成员上下文、338 条共享个人页；包含原生 Shadow DOM。
- 检查范围：模块存在、文档顺序、关键默认折叠、条件模块、直接个人手帐入口、历史路由覆盖。
- 未验：图片是否加载、照片同妆造与裁切、像素视觉、移动端排版、原生缩放、全视频播放、线上用户完整会话、真实生产保存；这份文档不是这些项目的通过报告。
- 不修改个人页面组件、个人字段、稳定 ID 或权限；不提交代码。
- [机器可读清单](./member-page-layout-inventory-20261025.json) 含逐团模块、公开成员 ID、路由、计数和条件标记，不含私人评分、备注或原始 DOM 全文。

