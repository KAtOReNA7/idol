# 舞台练习室补齐、人物资料与统计续作（2026-10-28）

本轮已在正式工程 `apps/idol-site/` 完成本地实现与验证：新增11条精确舞台来源，已选来源482→493，原123条待核舞台剩112；新增3作品16人次公开发行署名；补入2项有明确周期的销量下界，未知统计17→15。GitHub提交与正式站部署尚待主任务填写独立回执，本报告不把本地完成或源目录同步写成已上线。最近已确认的正式基线为v197。

| 交付位置 | 本报告状态 |
| --- | --- |
| 本地正式工程 | 实现及下列验证完成 |
| GitHub任务分支／PR44 | 本轮提交、推送读回与最终提交ID待填写；不据此宣称合并main |
| 正式站 | 本轮版本、Sites源ID、部署ID及线上复验待填写 |

正式站地址：[idol-lens-private](https://idol-lens-private.wuke40758.chatgpt.site/)。本轮证据位于 [20261028-stage-fill](evidence/20261028-stage-fill/)，源目录同步记录见 [source-sync.json](evidence/20261028-stage-fill/source-sync.json)；该记录不是正式部署回执。

普通打歌节目优先、完整官方练习室其次的规则继续生效。候选先核真实场合、同曲同语种／版本及合作阵容，再比较合格候选的点赞；演唱会、节庆活动、制作型表演、别语种和节选不能凭点赞更高入选。用户否决的三个视频继续排除。原123条待核作品均经过本轮有界公开来源研究，不代表穷尽全网或完成逐条完整播放；后段YouTube请求遇HTTP429后停止新增该路线，没有绕过限制。

本轮采用的11条均为有官方文档依据的练习室来源，精确视频、频道、点赞观察时间、网页指纹和采用理由见 [adoption.json](evidence/20261028-stage-fill/adoption.json)、[reviewed-adoption.json](evidence/20261028-stage-fill/reviewed-adoption.json) 及 [TAYO增量核验](evidence/20261028-stage-fill/reviewed-adoption-tayo.json)。研究候选文件与正式导入回执分别保留，候选数量不计入新增绑定。

| 团体 | 作品 | 本轮采用来源 |
| --- | --- | --- |
| tripleS ∞! | Untitled | [官方练习室](https://www.youtube.com/watch?v=e-6iU-nTTs4) |
| izna | DUMB HOT! | [官方练习室](https://www.youtube.com/watch?v=RgRCjpL6lAU) |
| EVERGLOW | PROMISE | [UNICEF合作曲官方练习室](https://www.youtube.com/watch?v=axGr455BjFE) |
| Weeekly | 7days Tension | [官方练习室编舞视频](https://www.youtube.com/watch?v=zue8OsuCkXE) |
| IZ*ONE | Vampire | [官方练习室](https://www.youtube.com/watch?v=vr9h-epSUZQ) |
| Rocket Punch | Bubble Up! | [官方练习室](https://www.youtube.com/watch?v=0Ar41kC-ECk) |
| Kep1er | Yum | [官方练习室](https://www.youtube.com/watch?v=1p4Ta_74wFI) |
| LOONA | HULA HOOP | [官方练习室](https://www.youtube.com/watch?v=GdllW3A0Q8k) |
| NewJeans | Supernatural | [官方练习室](https://www.youtube.com/watch?v=FKHqiV-9xLA) |
| NewJeans | Right Now | [官方普通练习室](https://www.youtube.com/watch?v=4xer6EPtYdw) |
| Kep1er × TAYO | RESCUE TAYO | [官方合作方练习室](https://www.youtube.com/watch?v=9mNMhHVj2Aw) |

Right Now固定练习室 `y4Tr8LE5yV4` 的完整性沿用用户确认，不再次索要确认；本轮按合格候选点赞选择普通练习室，固定版仍保留观看参考。原曲为英／日／韩混合，未伪标English Ver。版本采用依据为精确单曲与官方练习室资料的对应关系，未独立逐句比对音轨，也没有据此判断现场真唱。11条均未宣称本轮完整连续播放。

11条只在真实owner导出确认舞台评分为空后导入，旧482条来源和精确评分绑定逐条保持，未替换任何既有已评分来源。分批回执为 [首10条](evidence/20261028-stage-fill/adoption-receipt.json) 和 [TAYO第11条](evidence/20261028-stage-fill/adoption-receipt-tayo.json)。新增11张舞台封面保留原字节；Vampire高清地址404后采用原生640×480封面，未放大，其他来源及尺寸见 [poster-evidence.json](evidence/20261028-stage-fill/poster-evidence.json)。这些封面不是新增认人照片。

剩余112条已按主要阻碍互斥分类，可从 [JSON逐项表](evidence/20261028-stage-fill/remaining-stage-ledger.json) 或 [CSV逐项表](evidence/20261028-stage-fill/remaining-stage-ledger.csv) 接续。

| 主要阻碍 | 数量 | 后续处理 |
| --- | ---: | --- |
| 场合或素材类型不符 | 27 | 查普通音乐节目或完整官方练习室，活动、接力舞及制作型表演不凑数 |
| 未找到合格来源 | 34 | 扩展精确歌曲名、原语言标题及官方频道档案；未找到不写成不存在 |
| 单曲完整范围未证 | 3 | 核完整单曲边界和时长，排除串烧、节选和剪辑 |
| 参与者范围不符或未证 | 14 | 查合作方原始上传、具名阵容和完整合作版本，不漏合作艺人 |
| 语种或编配版本未匹配 | 28 | 核对应英文／日文／韩文及特殊编配，不能用原韩版替代 |
| 原始发布或可访问性未证 | 6 | 追溯第一方公开原档；访问受限保留原因，不将转载升级官方 |
| 合计 | 112 | 各条保留已查来源与下一步路线 |

另有19条历史活动来源需要寻找替代，属于独立队列，不并入112，也不从493直接扣除。此次未替换这些旧源；[历史来源研究](evidence/20261028-stage-fill/replacement-a.json) 中的新线索仍需精确版本、点赞及owner评分核验。493表示已有精确选源数量，不表示493条都重新通过新政策的全部采用条件。

人物资料本轮定向核6作品，采用Weeekly《Stranger》英文版六人、HITGS《GROSS》五人及《CHARIZZMA》五人的公开录音／发行阵容，共3作品16人次。累计45作品、279认人参考槽、128份不同的既有原件；新增认人原图文件0。署名来源与逐人MV出镜分开，不由发行名单推定真人出镜，不创建私人关系、不改变评分策略。原42作品记录、6项无真人规则及原件保持，NMIXX《Caution》、HITGS《HAPPY》《A-HA!》仍待更精确证据。详见 [人物研究及本地集成记录](evidence/20261028-stage-fill/person-followup.json)。

131条原无私人关系作品中，公开署名与既有无真人规则去重覆盖50条，剩81条人物证据开放。这个缺口与既有关系认人图不同：2828公共绑定＋12原生图保持，既有有效关系缺图0、旧低清0，A–Y/Z没有重导。保留51团设计、Apple Music主站、稳定ID和关系、完整原图；个人页统一排版仍待用户决定。

销量新增BADVILLAIN《OVERSTEP》2024年第23／24周2,962＋2,405＝5,367张，以及BEWAVE《BE;WAVE》2024年第16周725张。来源为Circle Album Chart原页所用公开接口的当周 `Album_CNT`，显示明确单周／两周下界；不采用范围未明的 `Total_CNT`，不与重叠月榜、年榜、Hanteo或Retail相加，也不称全团全球完整累计。Geenius 217已核为2026-05-18单日Retail零售记录，仅留研究，未写入销量。其余49团统计和两团社媒／一位字段保持。

9项原未知销量均有本轮结果，仍7项未知；连同5项社媒、3项一位，共15项未知统计。tripleS公开下界2,092,239及未解差额366,550、fromis_9的1,152,076保持。完整前值、后值和可还原哈希见 [统计采用提案](evidence/20261028-stage-fill/statistics-adoption-proposal.json)，原始榜单观察见 [统计来源](evidence/20261028-stage-fill/statistics-primary-observations-c.json)，9项结果见 [统计续查](evidence/20261028-stage-fill/statistics-followup.json)。未请求Soridata下载或绕过验证码。

最终定向测试186／186通过，TypeScript及正式构建通过；这不是全仓全部测试声明。新增统计测试以及旧年度／分类测试保留历史哈希守卫，通过本轮 `expectedBefore` 还原旧cohort，不删除保护断言。

本地只读浏览器验证51布局通过：11新增舞台三宽33布局、旧绑定3布局、人物资料9布局、统计6布局；另有11封面字节／SHA核对、48认人图片加载和9次原图打开／关闭交互。最终页面错误、控制台问题及资源失败均0，详情见 [本地浏览器汇总](evidence/20261028-stage-fill/local-browser-summary.json)。采用隔离Chrome与匿名本地目录夹具，不冒称用户浏览器或线上owner验收。首次原生details在hydration期间的交互结果单独保留，未宣称该历史问题已修。

导入前通过既有已登录owner会话取得真实原生导出，时间为2026-10-28 05:27:38 UTC；原始导出仅留本地。可公开的 [保护摘要](evidence/20261028-stage-fill/owner-baseline.json) 仅含计数和哈希，无账号身份、cookies、备注或评分原值。日志基线206，真实私人写入0；本轮未改访问配置和owner保存鉴权。该导入前证据不代替发布后的完整个人值读回复验。

未执行完整视频播放、逐句音轨比对、真实私人保存、原生缩放或新Figma验收。正式发布和线上复验完成后，须在本报告及独立发布回执中分别补齐GitHub提交、Sites源、部署版本／ID和读回结果；未取得回执前保持发布待完成状态。
