# 接续：全团数据与MV图片v8已发布，资料缺口及个人页统一待续

## 最新决定：统计补全、MV认人图与个人页盘点（2026-10-25）

用户已确认v7。本轮继续补齐51团INS/X/YouTube人数、销量与一位；实在找不到或确实为零时按用户新要求显示0，证据中保留“未找到/确认零”的区别，没有账号的平台不展示。检查全部既有MV封面与同MV时期/同妆造的具名高清认人图，统一尺寸、去除黑白留边、保留原图。**用户明确仅无成员出镜的MV关闭成员评分；缺认人图不得关闭。** 个人成员详情本轮只盘点模块顺序和布局，等待用户下一步统一决定。

分支`codex/statistics-mv-identity-completion`，冻结基线`d412376`；同一指定站点 **v8 owner-private只读审阅已发布，资料缺口仍开放**。保留各团已确认设计及共享手帐布局，仅补数据、图片和必要交互，不称重新设计；个人字段/ID/权限保持，旧v186及main未改。153账号有入口，147项人数有值/6项未知显示0；42团销量有值或可复算下限/9团未知；一位27团正数、20团确认0、4团未知。628个精确影像封面齐全（含舞台等版本），1137条认人图绑定覆盖40团205作品；**仍缺1691条关系图、47条清晰度待提升**。仅5个确无成员真人出镜的精确视频关闭成员评分。

个人页只盘点：338团体成员上下文/331人、336独立详情有效、7类编排；2个历史详情缺失，4团33详情默认折叠资料，7团56详情无叙述简介/经历，BADVILLAIN7详情缺手帐直达。完整结果：[线上报告](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/review-all/completion-report.html)；验证与发布证据见`docs/codex/statistics-mv-identity-verification-20261025.json`，过程见`docs/codex/worklogs/20261025-statistics-mv-identity-completion.md`。下方历史未知数据规则和逐团确认门槛不能覆盖本轮决定。真实保存/全视频播放、原生缩放、用户本人IAB及新Figma同步未验。

## 最新决定：51 团照片审查、首页排序与信息统计（2026-10-25）

用户要求重新寻找团体索引照片，统一卡片尺寸与人物构图，去除黑白留边；依次审查51团同板块成员照片，尽可能同拍摄系列与同套服装。保留各团已认可设计风格，首页明确调整为 **大图 → 信息 → 成员 → 专辑 → MV → 时间轴 → 其他**。信息包括已存在 INS/X/YouTube 账号的粉丝/订阅（统一万单位、不写“约”）、累计唱片销量与打歌一位总数；必须保留公开精度、来源和日期，不能把未知当0或局部销量当全球累计。

本任务已获独立团页模块与图片调整授权，覆盖上一轮“独立团页不变”的范围限制。分支 `codex/group-photo-information-refresh`，冻结起点 `afaaa60`，继续用户指定的同一owner-private只读站；个人评分/备注、稳定ID、原图和权限边界保持。已发布同一指定站点 **v7 owner-private只读审阅，待用户验收**。51团保留设计语言并重排首页，16团索引重选照片、全部51图统一3:2；成员照片仅逐团审查，未将全部问题记为整改完成。信息区117账号入口/58人数，32团韩国累计销量/23团一位有值，其余缺口和冲突保留待核实。代码 `49746f92`，draft [PR #37](https://github.com/KAtOReNA7/idol/pull/37)。任务日志：`docs/codex/worklogs/20261025-group-photo-information-refresh.md`。

本地55专项测试、类型/正式构建、255首页布局及40共享布局/5交互通过；线上服务身份Chrome复验255索引图片槽、51团信息区、40共享布局/5交互通过。67份原图随同站交付、SHA核对一致。用户IAB、真实保存/全视频播放、原生缩放与新Figma同步未验；用户设计验收和资料缺口仍开放。完整逐团问题表：`docs/codex/group-photo-information-review-20261025.md`。

## 最新决定：Apple Music 风格公共主站重构（2026-10-25）

用户指定将全部已完成修改提交至 https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/ ，并以 Apple Music 的 K-Pop 页面重新设计。核对该站v4已包含全部上一轮网页修改。用户随后明确范围：**只重构主站、索引和共享手帐，保留51个独立团页。** 本轮从 c5ee48286a06dadd766852075c397a007da9103e 建立 codex/apple-music-site-redesign，不复用旧公共视觉；保留已核实资料、原图、稳定ID、个人字段及访问边界。目标是用户指定站点，另一个旧主站v186不在本轮发布范围。

参考 Apple Music 官方 K-Pop 专题与歌单结构，视觉基于实际截图的新发现通用界面（本机访问美区被重定向中国区），不是K-Pop页面逐像素复刻。设计、功能、资料与部署分别记录。本轮日志：docs/codex/worklogs/20261025-apple-music-site-redesign.md。



已发布同一指定站点 **v5**：Apple Music 风格公共主站、51团索引、作品/成员目录与共享手帐。51个独立团页CSS在仅规范化资源地址后与v4一致。48项专项/回归、类型、正式构建、本地40布局/5流程、线上服务身份40布局/5流程及69图片槽加载通过。成员索引本地321/338图片可显示，17项缺图/静态或私密素材限制保留并列明。真实生产保存、完整播放、原生缩放、用户IAB和新Figma保真未验。保留owner-private只读及个人字段边界，旧主站v186未改。代码3a25b255，draft PR #36；完整摘要见 docs/codex/apple-music-redesign-verification-20261025.json。

## 最新决定：七团v3审核通过，继续全团资料与功能补齐（2026-10-25）

用户已确认七团v3全部通过，至此51团页面设计均获确认，保护现有视觉。继续处理尚缺的公开资料、图片、精确视频与成员作品关联；公开证据不等于私人评分记录，缺失关系不得推定全员。用户另明确选择 BADVILLAIN《HURRICANE》原评分对应正式MV `00tUzCOPI6g`，据此补齐该作品读取展示的精确视频，不变更评分/备注。

分支 `codex/all-groups-data-completion`，冻结基线 `352affd5f439726058cf12795151bc3568b273b8`。任务记录 `docs/codex/worklogs/20261025-all-groups-data-completion.md`。沿用51团已认可设计，仅补资料与必要交互；继续发布既有owner-private只读审阅站，真实生产保存、全量播放、原生缩放等分层验收，正式主站v186本轮不覆盖。下方“七团待确认”是历史状态。

本轮已发布同站 **v4 owner-private只读审阅**：BLUE原图、用户确认的HURRICANE正式MV、四作品15条公开资料与两条官方时间轴补齐。77专项/回归、类型、构建、本地70布局/5流程、线上服务身份40布局/5流程通过；旧时间轴SSR夹具8过44失败仍待维护。沿用已确认设计，原图/个人字段/权限保持，主站v186未改。交付与全部未解决项见 `docs/codex/all-groups-data-completion-review-20261025.md`，本轮日志见 `docs/codex/worklogs/20261025-all-groups-data-completion.md`。

## 历史交付：七团重设计v3已发布（现已获确认，2026-10-25）

用户已批准参考清单，要求依次重做 MADEIN → QWER → PURPLE KISS → IVE → tripleS → RESCENE → ILLIT，弃用七团旧视觉与布局，全部完成后统一提供链接审核，不逐团等待。保留核实资料、原图、稳定 ID、个人记录及权限；其余 44 团设计保护。同步七团索引及手帐视觉，主站 v186 不覆盖。

七团全新网页、索引入口及手帐视觉已完成，统一 **v3 owner-private 只读审阅已发布，现已获用户确认**：[团体索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups)。七团旧页面组件不再渲染；核实资料、稳定 ID、原图和共享手帐业务 DOM、播放器、编辑器与权限逻辑保留，视觉重新设计，不称官网逐像素复刻。其余44团页面与正式主站v186保持。

实现分支 `codex/seven-groups-official-redesign`，冻结基线 `c578183e608c01eb797da0591bf75e7b3b0ea98e`，发布网页固定代码 `4cd279717a25938bedeb543a145204d25e3fa95f`。28专项/回归、类型、正式构建、350项五宽布局、92交互、其余44团88项首页回归通过；线上服务身份Chrome的42项页面、14项手帐往返及51卡片索引通过，非用户IAB完整会话。Figma已同步112个可编辑画板及261原图/矢量组件，完整字体与像素保真未验。真实生产保存、全视频播放、80%/125%原生缩放以及既有资料缺口未关闭。

七团链接、来源差异、已解决/未解决问题见 `docs/codex/seven-groups-redesign-review-20261025.md`；可读验证摘要及Figma节点映射见 `docs/codex/seven-groups-redesign-verification-20261025.json`；过程见 `docs/codex/worklogs/20261025-seven-groups-official-redesign.md`。下方逐团门槛、参考待确认与实现中状态均为历史；不因技术检查通过自动登记七团设计获用户认可。


## 最新执行决定：7团设计否决，其余44团页面通过（2026-10-25）

用户明确要求 **MADEIN、QWER、PURPLE KISS、IVE、tripleS、RESCENE、ILLIT 放弃原设计，重新制作；其余团体通过审核**。这7团的旧网页/Figma不能作为新设计的验收依据；保留其已核实资料、原图、稳定ID与既有个人记录。其余44团页面设计按用户意见通过并保护，不把本次认可扩大为真实保存、全视频播放、生产部署或资料无缺口。

当前任务先寻找新参考并向用户提供页面，不提前把推荐方向记为用户认可。优先实际官网；当前官网不适合时参考累计实体销量较高且可核查的专辑宣传期官方页面/官方发行专题，区分整站设计与官方宣传素材。新参考确认前本轮不修改团页、不部署；这是用户要求先交参考的任务阶段，不是恢复旧逐团门槛。

分支 `codex/seven-groups-design-references`，基线 `d53f5f8403f8ef929c1724b4b96636ff87df1129`。7团参考、实际查看证据、销量口径与差异见 [参考清单](../../docs/codex/seven-groups-design-references-20261025.md)；执行记录见 [本轮日志](../../docs/codex/worklogs/20261025-seven-groups-design-references.md)。正式主站v186、统一审阅v2与其他审阅站未改。

## 历史交付：全51团与团体索引统一检查（2026-10-25，后续验收决定见上方）

用户已确认 Weeekly v1，要求全部团体（包括未人工检查的团体）完成后统一验收；检查团体索引是否承接各团页面样式，替换不匹配入口，并针对缺失信息、图片、关联尽力补齐。**本决定取消逐团等待确认的门槛，后续统一交审。** 以正式工程登记的51团为检查范围，保留已认可设计、原图、稳定ID、评分、备注、观看状态和owner-only保存边界；不推定未核事实，不将旧页面存在记为本轮通过。

分支 `codex/all-groups-index-audit`，冻结基线 `10afded7eba564aed7ba5080e1ebc5b11db41c6e`，正式工程 `apps/idol-site/`。按用户纠正后的顺序：先依次完成剩余团体开发及全部团体未完成项，再检查并替换不匹配的团体索引，随后全团补缺/验证，最终统一私密审阅；用户统一验收前不覆盖主站v186。过程、已解决/未解决问题见 `docs/codex/worklogs/20261025-all-groups-index-audit.md`。下方逐团门槛均为历史，不再阻止本轮连续推进。



统一私密只读审阅 **v2 已发布，待统一验收**：[团体索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups)，draft [PR #33](https://github.com/KAtOReNA7/idol/pull/33)。38索引入口已替换/微调，13保留；42公开原字节图片补齐，原图与个人字段边界保持。111集中测试、类型、正式构建通过；102桌面/手机首页、153手机内页、51入口/桌面导航已验，153发布模式内页与42远端SHA通过。已修复ITZY媒体API缺图、Hyunny手帐缺图、统一CSS冲突、时间轴假空态和标签标题。133作品快照关系、14 hold事件、HURRICANE精确视频，以及真实保存/播放/原生缩放、完整Figma和用户IAB会话仍未解决或未验，详见[完整问题清单](https://github.com/KAtOReNA7/idol/blob/codex/all-groups-index-audit/docs/codex/all-groups-audit-20261025.md)。沿用现有51团设计与共享手帐，不宣称全团官网重做；官网来源和差异在清单披露。主站v186与旧审阅站未覆盖。

## 历史执行决定：Weeekly 新审阅站 v1（已确认，2026-10-25）

用户“同意，继续开发”已确认 Cherry Bullet v15。本轮仅推进 Weeekly，根据实际查看的 [官方 Weverse](https://weverse.io/weeekly/highlight)与[Genie《Bliss》官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428)重写白底灰粉黑字页面，弃用旧周历便签视觉。完整官方横幅/校园团照、六人Bliss同系列具名原照、申智阭历史照与七份历年档案；22发行/58本团署名曲目行、14既有作品/24影像槽、73既有关联与14事件。合约公告日、生效日和Weverse服务结束分开，不推定解散。

**复用 Cherry Bullet v15 的路由、只读公开投影、搜索、原图恢复和部分目录/详情结构；共享手帐沿用布局并换灰粉白黑。** 这是官方社区/发行语言的项目扩展，不是独立官网复刻，交审必须披露。

旧站容量不足，本轮独立 **v1 owner-private 只读审阅已发布**；55原字节资源、63静态文件共39,698,685 bytes，旧v33/v15与主站v186未改。36专项/回归、类型、正式构建、90项九宽布局、55连续交互及线上服务身份Chrome两宽13项核心检查通过；IAB登录继续35秒超时，完整用户会话、真实保存/播放、原生缩放及线上逐素材SHA仍未验。Figma33可编辑画板、55原图组件、五个完整页面和三个手帐子节点取稿；三宽时间轴40px重复缩进已修，字体替代及完整像素保真未过。

分支 codex/weeekly-review-completion / draft [PR #32](https://github.com/KAtOReNA7/idol/pull/32)，冻结基线 b8baf83c763328dbc6465e6655b18accf329d893，正式工程 apps/idol-site/。[打开 Weeekly 新站 v1](https://idol-weeekly-review-oct25.wuke40758.chatgpt.site/artists/weeekly/index.html)。详见 docs/codex/worklogs/20261025-weeekly-review-completion.md。原图、稳定ID、个人字段与权限保持，未合并main。

**等待 Weeekly 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：Cherry Bullet FNC 官方风格 v15（已确认，2026-10-25）

用户“同意，继续开发”已确认 Rocket Punch v12。本轮仅推进 Cherry Bullet，按实际查看的 [FNC 官方图库](https://fncent.com/CherryBullet/b/gallery/55485)与[Cherry Dash 发行页](https://fncent.com/?bid=album&m=bbs&ma_cate=1&ma_lang=1&mod=view&r=CherryBullet&uid=55694)重写白灰珊瑚红页面，弃用旧 RED FILE 视觉。官网logo失效、介绍页为空，使用文字品牌；这是公司官网语言的项目扩展，不称完整官网复刻。十份历史成员档案、九发行/28本团署名曲目、七既有作品/14影像槽、55既有关联及九事件。照片为官网具名原图；早期三人照片说明校正为2019年。

**复用 Rocket Punch v12 的路由、公开投影、搜索、原图恢复和部分目录/详情结构；共享手帐沿用布局并换白灰珊瑚红。** 团页重新编排，搜索/时间轴/手帐为项目扩展，交审必须披露。

同站 **v15 owner-private 只读审阅已发布**。35专项/回归、类型、正式构建、90项九宽布局与51连续交互通过；最终v15服务身份Chrome的12组桌面/手机核心流程与代码指纹核对通过；IAB最终刷新/恢复超时，完整用户会话、真实保存/播放与80%/125%原生缩放未验。Figma33可编辑画板、六个完整页面节点及三个MV手帐子节点取稿；公告日期、手帐品牌对比度与缺图提示已同步。字体替代和完整像素保真未过。432旧非root文件SHA保持，root仅新增入口；旧站v33与主站v186未改。原图、稳定ID、用户评分/备注/观看状态与权限保持。

分支 `codex/cherrybullet-review-completion` / draft [PR #31](https://github.com/KAtOReNA7/idol/pull/31)，冻结基线 `255424dc8608ec4f8ab4bf8ce170faad228d2e34`，正式工程 `apps/idol-site/`。[打开 Cherry Bullet v15](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/cherrybullet/index.html)。详见 `docs/codex/worklogs/20261025-cherrybullet-review-completion.md`。

**Cherry Bullet 已获用户网页确认；本轮 Weeekly 已使用独立审阅站。下方旧门槛均为历史。**

## 历史执行决定：Rocket Punch 官方发行视觉 v12（已确认，2026-10-25）

用户“同意，继续开发”已确认 EVERGLOW v11。本轮仅推进 Rocket Punch，依据实际查看的 [Woollim《BOOM》官方发行页](https://www.woolliment.com/album/boom)独立重写黑白黄、Open Sans、细线与完整团照，弃用旧票券视觉。这是公司官方发行页的项目扩展，不称独立团官网复刻。六位历年成员使用同系列官网具名原照、等大显示框；15发行/55本团署名曲目、11既有作品/20影像槽、54关系及13事件。合同结束日期与公告日期分开，不推定解散或当前活动阵容。

**团页视觉独立重写；路由、公开投影、搜索、原图恢复与手帐业务复用 EVERGLOW v11 / fromis_9 v10；共享手帐沿用布局并换黑黄配色。** 交审必须披露，目录/时间轴/手帐属于项目扩展。

同站 **v12 owner-private 只读审阅已发布**。43专项/回归、类型、正式构建、90项九宽布局、45连续交互与12组桌面/手机线上核心流程通过；线上补查为服务身份Chrome，非用户IAB会话。IAB实际读到首页，成员点击40秒超时，完整IAB流程未验。Figma30可编辑画板、七个关键完整节点取稿，字体替代和完整像素保真未过；自动capture完成但缺图，参考Frame已清理，原生画板保留。381旧非root文件SHA保持，root仅新增入口；旧站v33、主站v186未改。真实保存/播放、80%/125%原生缩放未验。

分支 `codex/rocketpunch-review-completion` / draft [PR #30](https://github.com/KAtOReNA7/idol/pull/30)，冻结基线 `1e49aa316c2c02bc7afc23fa915cdb548efded6d`，正式工程 `apps/idol-site/`。[打开 Rocket Punch v12](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/rocketpunch/index.html)。详见 `docs/codex/worklogs/20261025-rocketpunch-review-completion.md`。

**Rocket Punch 已获用户网页确认；下方旧门槛均为历史。**

## 历史执行决定：EVERGLOW 官网风格 v11（已确认，2026-10-25）

用户“同意，继续开发”已确认 fromis_9 v10。本轮仅推进 EVERGLOW，依据实际查看的 [CHXXTA 艺人官网](https://www.chxxta.com/everglow)与[官方社区](https://everglow.bstage.in/)重写黑底、紫色原字标、官网窄体字及完整四人团照，弃用旧棕橙放映室视觉。当前四人与历来六人分开；六张单人照沿用具名旧 Weverse 原图，明确标注历史时期。16项发行 / 42条本团署名曲目行、10既有作品 / 19影像槽、58既有关联及13原事件保持。

**团页视觉独立重写；路由、公开投影、搜索、原图恢复与手帐业务复用 fromis_9 v10 / IZ*ONE v8；共享手帐沿用布局并换黑紫配色。** 目录、搜索、时间轴和手帐是项目扩展，不称官网逐像素复刻，交审必须披露。

同站 **v11 owner-private 只读审阅已发布**。31专项/回归、类型、正式构建、90项九宽布局与46交互通过。Figma33可编辑画板、七个关键节点完整取稿，三宽时间轴缩进已修；字体替代和完整像素保真未通过，自动capture仍pending。330旧非root文件SHA保持，root仅新增入口；旧站v33与主站v186未改。线上IAB已实际读到首页及成员目录，后续操作60秒/读取40秒超时；线上完整交互、真实保存/播放及80%/125%原生缩放未验。

分支 `codex/everglow-review-completion` / draft [PR #29](https://github.com/KAtOReNA7/idol/pull/29)，冻结基线 `96f2f435554ce075d37a0fcec105ce6d75cca644`，正式工程 `apps/idol-site/`。[打开 EVERGLOW v11](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/everglow/index.html)。详见 `docs/codex/worklogs/20261025-everglow-review-completion.md`。

**等待 EVERGLOW 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：fromis_9 官网风格 v10（已确认，2026-10-25）

用户“同意，继续开发”已确认 IZ*ONE Panorama v8。本轮仅推进 fromis_9，依据实际查看的 [现行日本官网](https://fromis9.fanpla.jp/)及[具名资料页](https://fromis9.fanpla.jp/news/2/)重写白底绿字、银色标识、Sansita 斜体与完整团照，弃用旧邮简视觉。五位当前成员与历来九人分开；三张历史照片来自旧 PLEDIS 官网，张圭悧仍明确缺图。27项发行 / 93条本团曲目行、16既有作品 / 31影像槽、120既有关联和19事件，原图与稳定 ID 保持。

**团页视觉独立重写；路由、公开投影、原图恢复复用 IZ*ONE v8 / i-dle v5；共享手帐沿用 IZ*ONE v8 布局并换白绿色和 Sansita。** 搜索、发行、影像、时间轴和手帐为项目功能扩展，不称官网逐像素复刻，交审必须披露。

同站 **v10 owner-private 只读审阅已发布**。28专项/回归、类型、正式构建、90项九宽布局、66交互及桌面/手机10组线上核心流程通过；线上使用服务身份 Chrome，非用户 IAB 会话。Figma33可编辑画板、8个不同关键节点完整取稿，修复三宽时间轴缩进与手机手帐姓名换行；字体替代和完整像素保真仍待验，自动capture未回报完成。253旧非root文件SHA保持，root仅新增入口；旧站v33与主站v186未改。真实保存/播放、80%/125%原生缩放未验。

分支 `codex/fromis9-review-completion` / draft [PR #28](https://github.com/KAtOReNA7/idol/pull/28)，冻结基线 `6ca25655ae08986a1823b7ca263ac860a2793862`，正式工程 `apps/idol-site/`。[打开 fromis_9 v10](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/fromis9/index.html)。详见 `docs/codex/worklogs/20261025-fromis9-review-completion.md`。

**等待 fromis_9 网页确认后再开始 EVERGLOW 或下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：IZ*ONE Panorama 重设计 v8（已确认）（2026-10-25）

用户明确否决 v6 奶油玫瑰/Bodoni 展册视觉。本轮依据 [Panorama 时期韩国官网存档](https://web.archive.org/web/20210103153505/http://iz-one.co.kr/)实际取得的 HTML、CSS、原字标、字体与具名原图重写黑银页面；[BLOOM*IZ 预告历史镜像](https://iz-one.co.kr/20191103/)和 [Melon 官方专题](https://www.melon.com/musicstory/inform.htm?mstorySeq=10961)为辅助参考。原存档浏览器停在 loading，不冒称完整原站加载成功；依据是实际读取的源码、资产及辅助页面。

同一 owner-private 审阅站 **v8 已发布**。首页完整十二人团照与静态成员目录，成员/发行/影像/时间轴/手帐均换黑银视觉；新增17个官网原字节资产，旧原图保留。十二身份、18发行/81曲、17影像、10原生作品/108关系、12事件保持。**复用 i-dle v5 / IZ*ONE v6 数据、路由、搜索、原图恢复、只读投影及手帐业务组件；团页和手帐视觉编排重写，未沿用被否决的展册视觉。** 项目功能属于官网语言扩展，不称逐像素复刻。历史主题只在合法 IZ*ONE 往返内生效，不覆盖其他团体流程。

31专项/回归、类型、最终构建、90项九宽布局、53交互（含托管重定向）及三宽标签复验通过。Figma新版30可编辑画板、七个不同关键节点完整取稿；时间轴缩进/照片标签已修，专用字体缺失及全量像素对照仍待完善。230个受保护文件SHA不变，root、旧站v33和主站v186保持。桌面/手机八组线上核心流程通过（服务身份 Chrome，非用户 IAB 会话），细节见本轮日志；真实保存/播放与80%/125%原生缩放未验。

分支 `codex/izone-review-completion` / draft [PR #27](https://github.com/KAtOReNA7/idol/pull/27)，本轮冻结 `1d097a2d5253dc6c225c87af3ab9ad74f41c2402`。正式工程 `apps/idol-site/`，未合入 main。[打开 IZ*ONE v8](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)；详见 `docs/codex/worklogs/20261025-izone-panorama-redesign.md`。

**v6 及其旧 Figma 已被否决。等待新版 IZ*ONE 网页确认后再开始 fromis_9 或下一团，公共功能例外。**

## 历史交付：IZ*ONE v6（视觉已被否决，2026-10-24）

用户“同意，继续开发”已确认 i-dle v5；本轮仅推进 IZ*ONE。已发布同站 **v6 owner-private 只读审阅**：十二位历史成员、18项发行版本/81曲目、10既有作品/17影像槽、108既有关联与12原事件，原图及成员/作品手帐精确往返。181旧非root文件SHA保持，root仅加入口；旧站v33与主站v186未改。

**沿用 v186 引入的旧 IZ*ONE 候选奶油玫瑰、Bodoni字体及展册语言，该候选未曾获用户确认；不是官网复刻。** 日本旧官网只有重定向占位，韩国旧站现为预告镜像。照片来自DBKpop具名转载，发行来自Bugs；不能称官网原图。复用i-dle v5路由/公开投影与共享手帐布局及既有IZ*ONE配色，交审必须披露版本、范围、官网状况和差异。历史头像仅在合法IZ*ONE返回上下文启用，保留成员当前归属。

23专项/导航、类型、正式构建、90项九宽布局、51交互通过。旧timeline-navigation的11失败已在基线字节复现，未放宽pins。Figma30可编辑画板、5个不同关键节点完整取稿；已修隐藏占位与时间轴排布，字体替代和全量像素对照仍待完善。线上部署成功，IAB导航40秒及读取30秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/izone-review-completion`，基线 `10fd7beb2e6029783d739c26267b0fad5da3fd4a`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开IZ*ONE v6](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)。详见 `docs/codex/worklogs/20261024-izone-review-completion.md`。

**等待 IZ*ONE 网页确认后再开始 fromis_9 或下一团，公共功能例外。下方旧门槛均为历史。**

## 开工入口

- draft [PR #27](https://github.com/KAtOReNA7/idol/pull/27)，代码 `d5a747919f4c8ec3e18c215dcfdd8bb2cc8f4f79` 已推送并核对远端；以任务分支最新 HEAD 接续。
- GitHub为多电脑接续入口；活动分支 `codex/izone-review-completion`，base `codex/idle-review-completion`，正式工程 `apps/idol-site/`。先核对工作树、显式fetch、远端HEAD和PR，不从旧main开工。
- [本轮完整交接](worklogs/20261024-izone-review-completion.md)、[Figma索引](worklogs/20261024-izone-figma-frames.json)、[公开验证摘要](worklogs/20261024-izone-verification.json)。
- 审阅构建 `node scripts/build-izone-review.mjs --out <仓库外独立绝对目录>`，49资产，108已有关系。真实个人字段清空，写入禁用；正式评分及用户数据保持。
- Windows本机静态服务4194仅用于本轮QA，交付后关闭。禁止把云端localhost当用户电脑可访问地址。
- Sites v6 source `1278ea1f3e6a60c17045d412225c246688e33b89`，deployment `appgdep_6adcd0eb826c8191a00da11ef03dc3de` succeeded。IAB两次超时，线上渲染/交互未通过；不要照旧记录冒称线上全验。
- 原图和稳定ID不改；IVE/LE SSERAFIM/SAY MY NAME 的当前头像不被IZ*ONE历史照覆盖。沿用旧候选与共享布局必须在交审中明确披露。
- 等用户确认IZ*ONE后才开始fromis_9。i-dle v5、AtHeart v4及更早页面已确认，主站仍v186，未合并main。

## 历史记录

- [i-dle v5，已确认](worklogs/20261024-idle-review-completion.md)
- [AtHeart v4，已确认](worklogs/20261024-atheart-wide-layout-fix.md)
- [HITGS v2，已确认](worklogs/20261024-hitgs-review-completion.md)
- [VCHA v1，已确认](worklogs/20261024-vcha-review-completion.md)
