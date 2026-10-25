# 项目协作入口

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

分支 `codex/seven-groups-design-references`，基线 `d53f5f8403f8ef929c1724b4b96636ff87df1129`。7团参考、实际查看证据、销量口径与差异见 [参考清单](docs/codex/seven-groups-design-references-20261025.md)；执行记录见 [本轮日志](docs/codex/worklogs/20261025-seven-groups-design-references.md)。正式主站v186、统一审阅v2与其他审阅站未改。

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

## 历史执行决定：i-dle 新审阅站 v5（已确认，2026-10-24）

用户“同意，继续开发”已确认 AtHeart v4，按原 Sol 顺序继续 i-dle。沿用 v186 引入且已获认可的深紫/珊瑚红视觉，补齐成员/发行/影像搜索、原图、失败恢复与手帐精确往返。实际参考日本官网 https://i-dle.cubeent.co.jp/ 及 profile：现官网黑底、紫色渐变、红线与全幅轮播，**不能称本轮是官网复刻**。共享手帐沿用仓库布局并换色；审阅机制承接 AtHeart v4，交审必须披露。

分支 `codex/idle-review-completion`，基线 `e42527c9a84942abc628e26e0256097bec2a50bd`；正式工程 `apps/idol-site/`。五当前成员及一历史档案、41发行、28原生作品/23舞台、152既有关联与28原事件；个人字段清空，原图/稳定ID/权限保持。49专项/回归、类型、正式构建、99项九宽布局及64交互通过。27可编辑Figma画板、5个不同节点完整取稿，时间轴溢出已修；完整字体/像素保真、线上完整交互、真实保存/播放、80%/125%缩放未验。

同一 owner-private 新审阅站 v5 已发布，线上首页DOM与截图已读到，成员点击45秒超时；112旧非root文件SHA保持；旧站v33、主站v186未改。[打开 i-dle v5](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/idle/index.html)。详见 `docs/codex/worklogs/20261024-idle-review-completion.md`。**等待 i-dle 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：AtHeart 新审阅站 v4（已确认，2026-10-24）

用户“同意，继续开发”已确认 HITGS 新站 v2。本轮 AtHeart 已发布同站 **v4 owner-private 只读审阅**：七成员、九发行/18曲、25影像槽（15音乐影像、10表演/现场）、两条具名原生作品/四精确MV舞台版本、六既有关系与八条ready事件及手帐往返。原生两条hold事件和空白作品保留原状。62个既有非root文件SHA保持，root仅新增入口；旧站v33与主站v186未改。

弃用旧米色书信视觉，依据实际查看的 [AtHeart官网](https://atheart.me/) 重写黑底白字、黑色标识栏、白色图标导航和大幅团照。七成员原图与九发行资料来自 [日本官网](https://atheart.jp/contents/menu/176621)。搜索/详情/时间轴是项目扩展，不宣称逐像素复刻。复用 **HITGS v2** 路由/公开投影和 TRACER 至 HITGS 原图/恢复/只读机制；共享手帐沿用 **VCHA 新站 v1布局** 并换黑白，交审必须披露。

24测试、类型、最终正式构建、45项五宽真实视口布局和61项交互通过。Figma27个可编辑画板、7个不同节点实际取稿，修复标识与时间轴；Arial/Microsoft YaHei缺失而使用替代字体，字体保真及完整逐板像素对照未通过。线上部署成功且首页完整DOM已实际读到；成员点击20秒超时、随后状态读取40秒超时，线上完整交互、真实保存/播放、80%/125%原生缩放未验。

分支 `codex/atheart-review-completion`，基线 `b9e07d0855888d023327998f96d104f98fa67e94`，代码 `6e527a21f582fe0d9aad493025741f7f31bc59d0`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开AtHeart v4](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/atheart/index.html) · draft [PR #25](https://github.com/KAtOReNA7/idol/pull/25)。详见 `docs/codex/worklogs/20261024-atheart-review-completion.md`。

**等待 AtHeart 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

v4修复补充：用户反馈首页发行区元素丢失，已复现为窗口留白与main限宽冲突，2560/2926px封面实际宽度为0。发行区现继承共享section内边距，320–3840px九宽×三页共27布局和九次发行往返通过；108既有文件、44资产、JS与root保持，仅CSS/三个HTML内容版本/manifest更新。Figma现有桌面首页发行区已同步并取稿。线上v4部署成功，IAB本轮导航40秒超时，未宣称线上视觉通过。见 `docs/codex/worklogs/20261024-atheart-wide-layout-fix.md`。v3的图片加载/整页溢出检查不足以发现内部零宽，不能据旧“45项通过”认定宽屏视觉正确。


## 历史执行决定：HITGS 新审阅站 v2（已确认，2026-10-24）

用户“同意，继续开发”已确认 VCHA 新站 v1。本轮 HITGS 已发布同站 **v2 owner-private 只读审阅**：五成员、七发行/16曲目、八已有具名作品/13影像槽（8MV、5舞台）、五既有关系、七事件与手帐精确往返。28个既有非root文件SHA保持，root仅新增入口；旧站v33和正式主站v186未改。

弃用旧黄绿拼贴视觉，根据实际查看的 [Genie 官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15198)重写浅蓝深蓝页面。三个官方站入口均遇证书警告，未绕过，**不是官网复刻**。五成员照片为Kprofiles具名转载；七封面取Bugs原字节。沿用VCHA新站v1路由/公开投影、TRACER至VCHA原图/恢复/只读机制与共享手帐布局，共享手帐换色，交审必须披露。

22专项/回归、类型、正式构建、45项五宽真实视口布局、31交互通过。Figma已建21个可编辑画板并修复导航圆角/时间轴排布；两张大封面导入不完整，6个发行目录/详情画板及完整字体/像素保真仍待完成。线上部署成功，IAB导航/读取40秒超时；线上完整交互、真实保存/播放、80%/125%原生缩放未验。

分支 `codex/hitgs-review-completion`，基线 `9670b97ee1a33af09fe6cabdaf5d72c1839dff42`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开HITGS v2](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/hitgs/index.html)。详见 `docs/codex/worklogs/20261024-hitgs-review-completion.md`。

**等待 HITGS 网页确认后再开始 AtHeart 或下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：VCHA 新审阅站 v1（已确认，2026-10-24）

用户“同意，继续开发”已确认 KATSEYE v33。本轮 VCHA 已发布到新的 **owner-private 只读审阅站 v1**：六历史成员、四张VCHA发行、四条既有作品/八影像槽、六既有关系、九事件及手帐往返。旧站v33容量只余955,546 bytes，新站不压缩原图、不修改旧页面。正式主站仍v186。

弃用旧VCHA米色档案视觉，以实际查看的环球《Only One》官方发行艺术重写白底品红团页。旧VCHA域名现跳转JYP总站，GIRLSET域名现跳转官方商店；不能称VCHA官网复刻。复用六人历史照片、既有ID/资料、TRACER v30至KATSEYE v33导航/原图/只读机制及共享手帐布局；共享手帐改配色，交审明确披露。

31专项/回归、类型、正式构建、45项五宽布局与28交互通过。27个可编辑Figma画板、7个不同关键节点实际取稿；修复时间轴文字重叠，完整字体/装饰/像素保真待完善。线上部署成功、IAB标签可见但读取40秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/vcha-review-completion`，基线 `2870eb1589df4b51ae2163e4b52fcdc8f9cc371c`；正式工程 `apps/idol-site/`。原图、稳定ID、评分、备注、观看状态与权限保持。[打开VCHA新站v1](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/vcha/index.html)。详见 `docs/codex/worklogs/20261024-vcha-review-completion.md`。

**等待 VCHA 网页确认后再开始 HITGS 或下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：KATSEYE v33（已确认）（2026-10-24）

用户“同意，继续开发”已确认 SPIA v32；本轮继续原 Sol 批次内 KATSEYE。已发布 **v33 owner-private 只读审阅**，六成员、十发行、九条原生作品（含合作）/17影像槽、11既有关系、14事件及手帐往返。补上成员/发行搜索、原图与精确返回，修复手机隐藏导航/首页影像及审阅入口空时间轴。

**沿用 v186 导入后现存 KATSEYE 松绿米白独立视觉及共享手帐布局**，不是按当前官网重做；实际参考 https://www.katseye.world/the-members/ 当前为粉红青绿、衬线字及三列肖像，交审必须披露差异。六张具名官网照片沿用。32张既有公开图片以GitHub固定提交原字节交付，HTTP/SHA全部核对；498旧文件不变，未压缩原图。

43测试、类型、正式构建、45项五宽布局、38交互与5项时间轴往返通过。Figma新增27个可编辑画板、5个最终关键节点实际取稿；展示字体、逐字间距及全量像素保真仍待完善。线上部署成功、IAB标签可见但读取35秒超时；线上完整交互、真实保存/播放及80%/125%原生缩放未验。设计、资料、功能、上线分别验收。

分支 `codex/katseye-review-completion`，基线 `d1abaf88a1b37101ae7de03326669d4d0073c2f0`；正式工程 `apps/idol-site/`，主站仍v186，未合并main，用户字段/稳定ID/权限保持。[打开 KATSEYE v33](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/katseye/index.html)。详见 `docs/codex/worklogs/20261024-katseye-review-completion.md`。

**等待 KATSEYE 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：SPIA v32（已确认）（2026-10-24）

用户“同意，继续开发”已确认 W!TCHX v31。本轮 SPIA 已发布 **v32 owner-private 只读审阅**：五成员、两发行/四曲、四精确视频、五事件和既有手帐往返。未找到可访问独立官网，采用实际查看的《Deeeep》公司宣传素材作原创视觉延展；五人照片为 Kprofiles 具名转载，不能称官网原图。弃用旧 SPIA 蓝色期刊视觉。复用 **TRACER v30** 精确评分绑定/目录投影及 **W!TCHX v31** 导航、原图、恢复与只读机制；共享手帐沿用布局并换 SPIA 配色，交审明确披露。

37 项专项/回归、类型、正式构建、45 项五宽布局、成员主流程和 28 个补充交互/恢复场景通过。Figma 33 个可编辑画板、8 个节点取稿及关键排布修复已完成，完整逐字像素对照待验。483 旧审阅文件 SHA 不变；为满足 256 MiB 限额，五张原 PNG 由公开 GitHub 固定提交提供，远端 SHA 一致，未压缩改图。线上导航/读取工具两次超时，线上渲染和交互未复验；真实保存/播放、80%/125% 原生缩放待验。

[打开 SPIA v32](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/spia/index.html) · draft [PR #21](https://github.com/KAtOReNA7/idol/pull/21)。分支 `codex/spia-review-completion`，起点 `88d9b3e4e40cc0ed3411b2067a1e8e250482108c`；主站仍 v186，未合并 main，原图/稳定 ID/用户字段/权限保持。**等待 SPIA 网页确认后再开始下一团，公共功能例外。** 详见 `docs/codex/worklogs/20261024-spia-review-completion.md`。

## 历史决定：W!TCHX v31（已确认，2026-10-24）

用户“同意，继续开发”已确认 TRACER v30。本轮 W!TCHX 已依据实际查看的 [K-POP MEDIA / IN MEDIA A&D 官网艺人区](https://kpopmedia.co.kr/#artists)重做黑青品红页面，发布 **v31 owner-private 只读审阅**：五成员、三发行/六曲、六精确视频、六事件及手帐往返。复用 **TRACER v30** 路由、原图查看器、只读机制与共享成员手帐布局/功能；团页视觉独立重写，团照沿用 Bugs 原图。目录、详情、搜索、时间轴与手帐属于官网语言的项目扩展。

44测试、类型、正式构建、45项五宽真视口布局、完整主流程、8恢复/广告规则场景、16成员/视频补查通过。Figma 27个可编辑画板及12个节点完整取稿已完成，全部逐字像素对照仍待验。452个旧审阅文件SHA不变。线上自动导航和读取超时，只见tab标题/URL，不能宣称线上渲染或交互通过；真实保存/播放、80%/125%原生缩放待验。原图、稳定ID、用户字段和权限保持；公开视频尚未接入评分手帐，不给原生空白作品赋名。

分支 `codex/witchx-review-completion`，起点 `7b9bcdb32a1c589e4cf0cfd9a8d10c1852edfa07`，主站仍v186，未合并main。[打开 W!TCHX v31](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/witchx/index.html)。**等待本团网页确认后再开始下一团，公共功能例外。** 详见 `docs/codex/worklogs/20261024-witchx-review-completion.md`。沿用仓库设计继续在交审时披露版本、范围及官网差异。

## 历史决定：TRACER v30（现已确认）

用户“同意，继续开发”已确认 Geenius 官网重设计 v29。本轮 TRACER 已按实际查看的 [GLEAMMEDIA 官网艺人页](https://www.gleammedia.co.kr/artist)重新设计，发布 **v30 owner-private 审阅**：四份成员档案、一项发行/两曲、两个精确视频、三个事件及已有手帐往返。白底玫红、官方横幅/银色标识和成员图取自官网语言；弃用旧信号控制台视觉，复用路由、原图查看器、只读审阅与共享手帐功能，目录/时间轴/手帐属于官网风格的项目扩展。

28 项专项/回归、类型、正式构建、45 项五宽真视口布局和 9 个额外恢复/绑定场景通过；独立复审发现的共享成员照片缺失已修复，四成员 × 两宽共 8 场景复验。Figma 已有 30 个可编辑画板和 11 个节点的实际取稿；完整逐板像素对照及细小字体度量仍待完善。423 个旧审阅文件 SHA 不变。线上首页、成员目录及希真详情已实际读到/截图；详情点击工具曾超时，恢复后截图确认页面已到达，不能扩大为线上完整流程通过。真实保存/播放、原图弹窗与 80%/125% 原生缩放未完成线上验证。

[打开 TRACER v30](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/tracer/index.html)。分支 `codex/tracer-review-completion`，基于 `d94c11d0554d4414a02cf09630fce0b516b35816`；正式工程 `apps/idol-site/`，主站仍 v186。保留原图、稳定 ID、评分、备注、观看状态和权限。**等待 TRACER 网页确认后再开始 W!TCHX，公共功能例外。** 详见 `docs/codex/worklogs/20261024-tracer-review-completion.md`。长期规则：以后沿用仓库设计须在交审时披露版本、范围、官网和差异。

## 历史决定：Geenius 官网重设计 v29（现已确认）

用户明确否决 Geenius v28 的仓库既有视觉，仅认可图片。本轮继续 `codex/geenius-review-completion` / PR #18，以 https://www.geeniushome.com/geenius 为直接视觉参考，重新处理字体、构图、导航、成员及作品内页和共享手帐；保留已核实图片、资料、稳定 ID、评分、备注、观看状态与访问权限。v28 的纸色蓝灰方案及旧 Figma 不构成设计通过。主站仍 v186，更新仅限同一 owner-private QA。**Geenius 重新交审并获确认前不开始 TRACER，公共功能例外。** 过程见 `docs/codex/worklogs/20261024-geenius-official-redesign.md`。

v29 官网风格重设计已发布，27 个可编辑 Figma 画板已同步；39 项专项/回归、类型、正式构建和 45 项真实视口布局通过。394 个其他团审阅文件 SHA 不变。线上 IAB 导航超时，真实保存/播放和原生缩放仍未验，等待本轮网页确认。

**长期交审规则：此后任何团体若沿用仓库已有设计，必须在交给用户审核的消息中明确说明沿用了哪一版/哪些部分，同时给出实际参考官网及差异；不能将旧设计沿用描述为按官网重新设计。** 用户此次要求不授权重做已确认的其他团。

## 历史交付：Geenius v28（视觉已被用户否决）

用户在 ADYA v27 修复后回复“同意，继续开发”，已确认 ADYA。本轮 Geenius 纸色蓝灰页面及 owner-private QA **v28** 已发布：五人成员、三项发行、七个精确视频、四事件与已有手帐往返。39项专项/导航回归、类型、正式构建、45项五宽布局和12个交互/恢复/广告规则场景通过。Figma有27个可编辑画板（含共享手帐）及16个图片组件；字体度量、少数标记/控件细节仍待逐板对照。线上导航及读取自动化超时，仅标签页标题/地址可见；真实保存/播放、80%/125%原生缩放未验。**等待 Geenius 网页确认后再开始 TRACER，公共功能例外。** 分支 `codex/geenius-review-completion`，主站仍v186；原图、稳定ID、评分、备注、观看状态和权限保持。详见 `docs/codex/worklogs/20261024-geenius-review-completion.md`。下方旧门槛为历史。

## 历史执行决定：ADYA（v27 已获确认）

用户“同意，继续开发”已确认 ODD YOUTH v25。本轮 ADYA 原生黑底朱红页面及 owner-private QA **v27** 已发布：五人成员、五发行、六独立视频、五事件与已有手帐往返。49项专项/回归、类型、正式构建、45项五宽布局和10个综合交互场景通过。Figma已建立24个可编辑画板并校正关键首屏/内页；共享手帐画板和完整逐字间距对照仍待同步。线上首页已打开，成员点击自动化超时，不能据此宣称线上交互全过；真实保存/播放和80%/125%原生缩放待验。**等待 ADYA 网页确认后再开始下一团，公共功能例外。** 分支 `codex/adya-review-completion`，主站仍v186；原图、稳定ID、评分、备注、观看状态和访问权限保持。详见 `docs/codex/worklogs/20261024-adya-review-completion.md`。下方旧门槛为历史。


v27修复补充：用户反馈的大片内容缺失已复现为广告拦截规则误隐藏。ADYA团页已改为idol-adya命名空间并为审阅脚本/样式添加内容版本参数；同一EasyList规则下五宽布局、20张图片、标题及成员搜索/原图流程通过。20专项、类型、构建通过。线上自动浏览器本轮仍超时；见 `docs/codex/worklogs/20261024-adya-adblock-fix.md`。


## 历史执行决定：ODD YOUTH（现已获确认）（2026-10-24）

用户“同意，继续开发”已确认 Candy Shop v23。本轮仅推进 ODD YOUTH，分支 `codex/oddyouth-review-completion`，起点 `a1c55190a4c0b2d96bf149f128a62a0e3473868d`。蓝白原生页及 owner-private QA **v25** 已发布：五成员、五发行/12曲目、11视频、五事件与已有手帐往返。49专项/回归、类型、正式构建、40布局与29交互检查通过；24个可编辑Figma画板及关键上下文已建立，完整共享壳保真细节仍待同步。线上v24首页可打开，后续点击超时；原生缩放、真实保存/播放未验。**等待本团网页确认后再开始下一团，公共功能例外。** 主站仍v186；原始照片、稳定ID、评分、备注、观看状态和访问权限保持。详见 `docs/codex/worklogs/20261024-oddyouth-review-completion.md`。下方旧团门槛为历史。

## 历史执行决定：Candy Shop（现已获确认）（2026-10-24）

用户“好的这个团同意，继续开发”已确认 BEWAVE v22。本轮 Candy Shop 已实现并发布 **v23 owner-private 审阅**，分支 `codex/candyshop-review-completion`，基于 `7a9b57bebc306dbe07addb7797255725aec6e05d`。五份成员档案（四位官网列示成员及结菜历史档案）、三张发行、七个精确视频预览、六事件、原图和既有手帐往返已接入。50项专项/回归、类型、正式构建通过；八类页面五宽实际视口和图片失败重试已验。Figma 24个可编辑画板及9处设计上下文已完成。线上自动浏览器导航超时，真实保存/播放与80%/125%原生缩放未验。**等待 Candy Shop 网页确认后再开发 ODD YOUTH**。正式工程 `apps/idol-site`，主站仍v186；详见 `docs/codex/worklogs/20261024-candyshop-review-completion.md`。下方旧团门槛仅为历史。


在为 Sol、Astra 或其他会话编写任务指令、接续实现、汇总验收之前，先阅读 [设计要求与验收基准](docs/design-requirements.md) 和 [跨会话派工与验收手册](docs/collaboration-playbook.md) 中的最新用户决定，再核对当前源码和最新交付。

## 历史执行记录（2026-10-24 BEWAVE，现已获确认）

用户在YOUNG POSSE v21后回复“可以 继续开发”，该页面已确认。本轮仅推进BEWAVE，分支 `codex/bewave-review-completion`，基于 `81a572d8944c6604a08e5302c77e4cafbfb950c7`。BEWAVE原生页与只读审阅已实现，**BEWAVE 已恢复并发布 v22 owner-private 审阅；等待本团人工确认，不开始Candy Shop，公共功能例外**。正式主站仍v186。六人历史相册、4发行/5影像槽/2既有关系、四事件、搜索/原图及手帐往返已验证。115专项/回归、类型、正式构建、34交互、3失败恢复和七页五宽真视口通过；另有13项旧测试框架失败在基线重现。设计、资料、功能、上线分别验收。

- 接续见 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261024-bewave-review-completion.md)；draft [PR #14](https://github.com/KAtOReNA7/idol/pull/14)，代码 `2d46a53` 已推送。
- 272旧QA文件SHA复核不变；Figma已有21个可编辑画板，本次同步6处搜索控件、3尺寸知言已关联作品及来源链接，修复320px标题换行高度。完整逐板对照、共享手帐及其余控件同步待完成。线上浏览器读取超时/401，未宣称线上交互通过。

## 历史检查点（2026-10-24 YOUNG POSSE v21）

- 用户“可以 继续开发”已确认VVUP v20；本轮只推进YOUNG POSSE。**等待YOUNG POSSE页面人工确认后再开发下一团，公共功能例外。**
- 最新分支 **`codex/youngposse-review-completion`**，基于VVUP的 `75c22b7ec26f53fbbf14db1b253a8cce52a59d81`。正式工程 `apps/idol-site/`；draft [PR #13](https://github.com/KAtOReNA7/idol/pull/13)，代码 `7c51709`，接续见[RESUME](docs/codex/RESUME.md)及[本轮日志](docs/codex/worklogs/20261024-youngposse-review-completion.md)。
- [YOUNG POSSE v21 owner-private审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/youngposse/index.html)：保留Posse in Frame设计，五人等大照片、成员搜索、真正原图、15发行/22影像槽/39关系、14事件与原生手帐往返。Figma首页和成员目录1440/390共20照片槽布局同步。
- 138测试、类型、正式构建通过；28交互、3失败恢复和七页五宽真视口通过。237旧QA文件SHA不变。真实保存/播放、原生缩放、线上已登录浏览器、完整Figma与两项发行缺口仍待办；正式主站仍v186。

## 历史检查点（2026-10-24 VVUP v20）

- 用户已用“可以 继续开发”确认SAY MY NAME v19；本轮仅推进VVUP。**等待VVUP页面人工确认后再开发下一团，公共功能例外。**
- 最新分支 **`codex/vvup-review-completion`**，基于 `06601304be62beff7fea7a5f87fa9e3336e71c64`；正式工程 `apps/idol-site/`。draft [PR #12](https://github.com/KAtOReNA7/idol/pull/12)，代码提交 `48c2c7bb410a4fae8adf35550bd7609bf226c0d0`；接续见 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261024-vvup-review-completion.md)，以远端最新HEAD接续。
- [VVUP v20 owner-private审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/vvup/index.html)已发布：深色酸黄独立页，四位官方成员/历史档案、原图、七发行/三封面、七影像/六舞台/16关系、时间轴与手帐往返；桌面/手机Figma首页16槽实图已写入。
- 117测试、类型和正式构建通过；21项实际交互/状态、七页五宽真视口通过。216旧QA文件SHA不变；正式主站仍v186。真实保存/播放、线上已登录浏览器、原生缩放、完整Figma内页与缺图仍待验。

## 历史检查点（2026-10-23 SAY MY NAME v19）

- 上一会话在 KiiiKiii v18 交付后已收到用户“已确认，继续开发”；本会话恢复该确认并接续。KiiiKiii 页面已确认，本轮只推进原计划内 SAY MY NAME。
- 最新分支 **`codex/saymyname-review-completion`**，基于 `f91a66ce9466cd12c64ebe9a9b16d84739b45fc9`；正式工程 `apps/idol-site/`。draft [PR #11](https://github.com/KAtOReNA7/idol/pull/11)，代码提交 `5c28500cdeb5920ba3d7640b50065cffebe1d3b4`；文档以最新远端 HEAD 为准。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-saymyname-review-completion.md)。
- v19 owner-private 审阅已发布：八张2000×3000官网原图、成员搜索/原图、九发行搜索/详情、六影像/五舞台绑定/37关系及手帐往返。**等待 SAY MY NAME 人工确认后再开发下一团，公共功能例外。**
- 113项测试、类型及正式构建通过；9项交互与七页五个真视口通过。192旧审阅文件SHA不变，正式主站仍v186。真实保存、播放、线上浏览器、原生缩放与完整Figma仍待验；部署后的in-app browser打开超时，未冒称通过。

## 历史检查点（2026-10-23 KiiiKiii v18）

- 用户“已确认，继续开发”已确认 Hearts2Hearts v17。本轮只推进 KiiiKiii：五张同系列具名照片、等大成员卡片、成员/发行搜索详情、9视频与7事件、原生手帐往返；只读 v18 已发布。
- 最新接续分支 **`codex/kiiikiii-review-completion`**，基于 Hearts2Hearts 的 `62ca3f61e3059c60a4b0558bc73b12e624ca2e1c`；正式工程 `apps/idol-site/`。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-kiiikiii-review-completion.md)。draft [PR #10](https://github.com/KAtOReNA7/idol/pull/10)；代码提交 `3ea7995b42ebb9bb08e88f23463fba27dad9e634`，其后文档以最新远端HEAD为准。
- **现在等待 KiiiKiii 人工验收，确认前不开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15、ifeye v16、Hearts2Hearts v17 已获页面确认；正式主站 v186 未改。
- 最终114项专项/回归、类型与正式构建通过；实际桌面交互和七页五宽iframe通过，非顶层真视口/缩放/真实保存/线上浏览器。171旧审阅文件SHA不变；设计/素材/生产待办见日志。下方旧门槛为历史，不能覆盖本决定。

## 历史检查点（2026-10-23 Hearts2Hearts v17）

- 用户“已确认，继续开发”已确认 ifeye v16。本轮仅推进 Hearts2Hearts：官网八张同尺寸原图、成员与发行搜索、13作品版本、11事件、原生手帐往返；只读 v17 已发布。
- 最新接续分支 **`codex/hearts2hearts-review-completion`**，基于 `codex/ifeye-native-integration` 的 `abe3b0476d6585d0d2986182f90403106125fe7f`；正式工程 `apps/idol-site/`，draft [PR #9](https://github.com/KAtOReNA7/idol/pull/9)。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-hearts2hearts-review-completion.md)。
- **现在等待 Hearts2Hearts 人工验收，确认前不开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15、ifeye v16 已获页面确认；正式主站 v186 未改。
- 57项专项、27项回归、类型与正式构建通过；实际桌面交互及五宽 iframe 通过，非顶层五视口/缩放/真实保存/线上浏览器。既有149审阅文件SHA不变，完整待办见日志。下方旧门槛为历史，不能覆盖本决定。

## 历史检查点（2026-10-23 ifeye v16）

- 最新接续分支 **`codex/ifeye-native-integration`**，基于 `codex/izna-review-followup` 的 `665fed58554fd83ddbcfc098228c6961943e9ebf`；正式工程 `apps/idol-site/`，draft [PR #8](https://github.com/KAtOReNA7/idol/pull/8)。先读 [RESUME](docs/codex/RESUME.md) 和最新远端，不从旧main开工。
- 用户本轮“已确认，继续开发”已确认izna v15。本轮接入ifeye原生页并发布v16：6成员、3发行、7影像、10真实图片及既有手帐往返，成员照片等大同行。见 [本轮日志](docs/codex/worklogs/20261023-ifeye-native-integration.md)。
- **当前等待ifeye人工验收；确认前不得开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15已认可页面继续保护；正式主站仍v186。
- 58项针对性测试、类型与正式构建通过；实际桌面/五宽iframe验证已记录，不能当顶层真视口/缩放。Figma实图/内页、7个精确视频预览、真实保存和线上浏览器仍待验。
- 正式剪枝dry-run被已有izna原图引用阻断，未apply；旧ifeye审计测试fixture35过3失败（YOUNG POSSE保留校验），未放宽生产pins。ifeye原图保留只减少删除项；不能据v16审阅包推出主站全量包通过。下方历史与多电脑规则继续适用。

## 2026-10-23 白天检查点（历史，当前接续以上方为准）

- GENBLUE v10和WOOAH v12页面已获用户确认，继续保护。本轮从 `codex/wooah-native-integration` 的 `121f410` 接续，在 `codex/izna-native-integration` 完成 izna 原生页面接入，当前待用户审阅；未获明确确认前不得开发 ifeye 或下一团，公共功能例外。最新接续读 [RESUME](docs/codex/RESUME.md)，检出 `codex/izna-native-integration` 最新远端 HEAD，不从旧 main 或最初handoff开始。
- izna [只读、owner-private 审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) 已发布 **v14**，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 待审阅。最新代码、发布与验证见 `docs/codex/worklogs/20261023-izna-hero-web.md`；本地5宽首页、查看原图/导航、失败恢复通过，100个非izna审阅文件SHA不变。发布后in-app browser单次打开超时，线上浏览器仍未复验，用户尚未确认整团。
- 2026-10-23 izna最新决定：用户认可Figma首屏后回复“可以 继续开发”，网页现已同步为大幅团照、简洁页头和图下入口，手机整幅原图，桌面保留六人完整构图。Figma设计证据见 `docs/codex/worklogs/20261023-izna-hero-figma.md`；Figma下方图片/其他页面、11个精确视频预览、80%/125%原生浏览器缩放、真实保存与主站全量发布仍待完成。等待用户确认v14网页，不将本次继续开发授权等同整团通过。
- 用户已决定迁移试用 Codex；GitHub 保存多台电脑共享的代码与开发阶段，不再要求主会话直接开发、云环境仅验证。首次执行读 [CODEX-FIRST-RUN](docs/codex/CODEX-FIRST-RUN.md)、[STATUS](docs/codex/STATUS.md)、[PRD](docs/codex/PRD.md)、[CURRENT-STATE](docs/codex/CURRENT-STATE.md) 和 [ACCEPTANCE](docs/codex/ACCEPTANCE.md)。
- 正式工程为 `apps/idol-site/`，根 Next sandbox 保留为历史样本。v186 基线与候选分别按各自清单核验，不用旧根代码冒充完整生产源，不依赖控制或读取 Sol/Astra 会话。
- Astra 与 Sol 均已收官，Sol 最终补遗见 `docs/codex/SOL-HANDOFF.md`；收官不代表全部团体已验收。已有完整原生源与候选足以继续。
- 新审核逐团区分设计、功能、资料、上线，包括此前已确认的团。旧通过记录是线索，不是自动通过凭据；保留已认可设计与全部有效产品要求，不新增 VCHA 单样板的全局门槛。
- 用户验收可打开网页，不承担基础错图、断链、布局与关联排错。GENBLUE/WOOAH首轮接入已完成；保护当前已认可页面，后续按STATUS逐团交付实际网页增量，不重复导入旧候选。
- 当前公开仓库和本次既有评分、备注、观看快照已于 13:22 UTC 获用户批准；不扩展为未来新增数据、秘密、凭证或发布授权。保持原图、稳定 ID、owner-only 保存与现有安全边界。未经当前生产授权不覆盖主站；有明确授权后可继续合规上线。

## 必须检查
- 先确认仓库、分支、提交和实际输入。根目录是历史 sandbox，`apps/idol-site/` 是精确 v186 原生源；候选独立放在 `handoffs/codex-20261022/`，未经评审不直接覆盖。
- 任务包含需求版本、目标团、真实产品增量、冻结基线、实际可读输入、允许/禁止修改范围、交付及验收标准、明确的阻塞停止条件。
- 明确代码/服务/浏览器分别在哪个环境；不得把云端 localhost 当作用户电脑可访问地址。
- 单测、HTTP、浏览器、集成、部署分层报告；不能跨版本或占位图/原图模式继承验收，也不能由 build/tests 或旧设计推出设计通过。浏览器受阻必须留待补查，不可记为通过。
- 已证实失败或被拒绝的路径不盲目重试；不要用清单、包装、通用外壳替代缺失前提。
- 保留用户评分、备注、观看状态和既有安全边界；文档不是新增权限授权，不保存凭证或未经授权的私有数据；本次既有快照的公开批准不得扩围。
- 给用户转发的任务正文用【】包裹，正文外给推荐模型/推理级别；交代实际负责人、收官/进行中状态与下一步，不编造旧会话已完成。

详细案例、检查清单和派工模板见上述手册。历史结论需按当前证据重新核实。

## 多电脑代码与进度接续

1. GitHub 是共享代码与开发进度入口。正式工程为 `apps/idol-site/`；根 Next sandbox 不是生产基线。
2. 每次开工先查工作树、fetch 最新远端，再读 `docs/codex/STATUS.md`、相关 worklog、活动分支和 PR。不能仅依据本地会话、旧检出或本地 LOCK 判断进度。
3. 每任务一个分支、一个 `docs/codex/worklogs/<task-id>.md`。先检查同任务是否已被接续；共享路由、类型、权限、保存和打包文件避免多机抢写。
4. 保留用户与其他电脑的未提交改动。禁止 force push、丢弃改动的 reset/clean、覆盖更新或不经比较的冲突消解。出现分叉先比较，保留双方有效改动。
5. 小提交同时保存代码和进度。合规 WIP 可推送独立分支，但须明确未验，不能标成已验 main 或生产。推送前核对仓库实际可见性与当前数据分享授权；秘密、认证令牌及含秘密的构建产物不入仓。
6. 结束或换机前提交并推送实际成果与 worklog，记录路径、依赖、素材、运行方式、测试结果、阻断、下一步、版本与预览/上线/人工验收状态。仅写“完成”不构成交接。
7. STATUS 维护已验基线、下一里程碑和任务链接；任务细节独立记录，减少多人同时改一个日志。合并后再更新基线，未合入与未验事项保持明确。
8. 设计、功能、资料、上线分别报告。测试、类型检查、合成数据、私有预览或旧版本通过均不能替代其他项。
9. 初次进入先读 `docs/codex/CODEX-FIRST-RUN.md`，核对正式源码和素材确已到达当前分支，再开始实际页面开发，不以旧沙箱或整理台账替代网页交付。

出现共享层冲突先比较活动分支/PR，明确路由、类型、权限、保存与打包文件的负责范围；不通过本地 LOCK 抢占所有权。代码与 worklog 同提交；结束或换机前 push 合规 WIP。若认证/权限拒绝，保留本地提交并准确记录阻断，不新建凭证绕过，不把未推送或未验结果写为共享完成。
