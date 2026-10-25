# 旧14条hold时间轴逐项复核（只读研究，2026-10-25）

范围：`apps/idol-site/data/artist-timelines/*.json` 中 `reviewStatus=hold` 的14条旧canonical事件，对照当前各团公开数据和可访问官方来源。本研究只写scratch，不改源码、日期、个人记录、快照或生产数据，不发布网站。仓库中的其他变更属于主代理工作，不是本研究修改。

## 结论及计数口径

旧14条并不等于当前网页有14项空缺。本次可区分为：

- **2条取得明确官方正文，可提出更新**：i-dle全员续约（2024-12，月精度）；NewJeans《Attention》首支MV公开（2022-07-22，日精度）。本研究未实际修改。
- **4条已有当前公开替代或修订**：Rocket Punch 1条已有同ID的ready事件；Candy Shop 1条已有“公告报道”事件；ifeye 2条已有“活动公告/恢复计划”事件。它们并不代表所有日期与执行事实都已解决。
- **8条仍保留原证据限制**：AtHeart 2、BEWAVE 1、Geenius 1、GENBLUE 2、UDTT 2。未找到足以改成完整已确认事件的新直接证据。

即使接入本次2条，不能把总数简单写成“仍缺8条”：Candy Shop原公告原刊日期、ifeye两份官方完整正文与实际生效事实仍缺；Rocket Punch实际合同生效日仍未知。更准确的交付表述是“旧14条已逐项分流：2条可更新、4条已有公开事件、8条仍保留待核”。

当前只有 `cherrybullet-timeline-public.json`、`rocketpunch-timeline-public.json`、`weeekly-timeline-public.json` 三个此命名文件。其他团可能在native/editorial数据中单独提供时间轴。`lib/idol/timeline/production.ts`仍加载旧canonical文档，不能仅统计这一层推断所有页面实际呈现。

## 逐项记录

| # | 原canonical事件 | 当前页面/资料状态 | 本轮结论及日期边界 | 来源 |
|---|---|---|---|---|
| 1 | AtHeart `e-atheart-aurora-hiatus-observed` | 旧hold；当前仍8 ready / 2 hold，没有独立确认初次暂停起点 | **仍待核**。2026-03-13原始采访的记者背景描述支持当时未参加出道活动；不支持初始暂停日、结束日或现在状态。未采医学细节。 | [CBS原始访谈](https://m.nocutnews.co.kr/news/amp/6484186)，沿用已有证据；本轮未重抓 |
| 2 | AtHeart `e-atheart-aurora-second-hiatus-announcement` | 旧hold；缺第二次暂停的直接公司正文 | **仍待核**。2026-08-18为二手报道/公告线索；不能补实际生效日或当下状态。 | [Soompi报道](https://www.soompi.com/article/1863734wpp/athearts-aurora-to-go-on-hiatus-due-to-health-just-2-months-after-return)，沿用已有线索；本轮未重抓 |
| 3 | BEWAVE `e-bewave-six-member-phase-end-announcement` | 当前 `bewave-native-design.json` 有出道、发行、Christmas Eve分队、知言solo四事件，无该重整事件 | **仍待核**。2025-09-04公告线索与计划2025-10-31结束六人阶段分开；未取得原公司X正文和实际执行证据。memberIds空，不能据译文拼写绑定人或将重整称为解散。 | [KoreaIN二手翻译](https://revistakoreain.com.br/2025/09/bewave-anuncia-mudancas-na-formacao-do-grupo/)，沿用旧证据；本轮未重试失败X |
| 4 | Candy Shop `e-candyshop-yuina-hiatus-announcement` | **已有公开替代**：`data/candyshop-native-design.json` 的 `e-candyshop-yuina-hiatus-report`，2024-05-09，dateLabel=公告报道 | 页面并非没有此历史活动安排。保留“报道日”语义；旧hold仍缺原官方发布位置与独立日期。不是退团证明，不补活动实际起始日。 | [当前报道来源](https://www.starnewskorea.com/music/2024/05/09/2024050908033147420)、[Brave署名公告转载图](https://0.soompi.io/wp-content/uploads/2024/05/08105357/Yuina.jpeg)。本轮核对本地公开数据，未重抓这两源 |
| 5 | Geenius `e-geenius-spoiler-book-instrumental` | 当前 `geenius-native-design.json` 无此器乐QR预公开事件；其他已核发行正常存在 | **仍待核**。2026-01-15仍仅零售产品日期；此次有限搜索亦只见零售/二手目录。不能把Spoiler Book器乐QR载体与完整人声《Love Don’t Change》合并或声称后者已发行。 | [YES24产品页](https://www.yes24.com/product/goods/170657075)，旧证据；[新增搜索见到的零售目录](https://www.kpopalbums.com/products/geenius-spoiler-book-1st-instrumental-album-qr-version)仅线索，不作升级 |
| 6 | GENBLUE `e-genblue-swing-dance-single` | 当前 `genblue-bluecut.json` 五事件中无该事件；已有发行目录线索 | **仍待核实际首次发行正文**。2025-08-04目录日与合作事实有支持，但本次有限搜索没有补到公司/合作方明确实际首发正文。可保留目录元数据，不能把多站重复目录当独立首发证明。 | [原LINE目录](https://music-tw.line.me/album/7742428)；本轮搜索结果另有[Apple目录](https://music.apple.com/us/album/swing-dance-%E5%8B%95%E7%95%AB-%E5%A6%96%E6%9E%9C%E5%B0%8F%E5%AD%B8-%E7%89%87%E5%B0%BE%E6%9B%B2-single/1828905104)、[Bugs目录](https://music.bugs.co.kr/album/38434652?wl_ref=S_tr_01_01)、[CNA合作报道](https://www.cna.com.tw/news/amov/202508130313.aspx)，仅搜索结果，不宣称完整正文复验 |
| 7 | GENBLUE `e-genblue-oh-chinese-single` | 当前五项时间轴无该华语版事件；独立华语版目录存在 | **仍待核实际首次发行正文**。2025-04-29目录日不能被4月28日MV日替代；此次有限搜索未出现新直接正文。 | [LINE华语版目录](https://music-tw.line.me/album/7685105)，旧证据 |
| 8 | i-dle `e-idle-cube-renewal` | 旧hold理由为缺全员续约原句；本次官方稿完整正文已取得 | **可更新**：2024-12，month；全员与CUBE续约事实confirmed。来源在2025-05-02发表，正文明确去年12月；不补签署日/生效日，不把稿件日当续约发生日。 | [CUBE ENTERTAINMENT JAPAN官方稿](https://prtimes.jp/main/html/rd/p/000000059.000124555.html)，本轮实际open读取正文 |
| 9 | ifeye `e-ifeye-sasha-hiatus-announcement` | **已有公开替代**：`data/ifeye-editorial.json` 的 `e-ifeye-sasha-hiatus-notice`，2026-03-03公告日、eventDate=null | 当前页面已展示限定活动公告。旧canonical缺直接全文问题仍在；不能把3月公告当1月部分行程暂停的起始日，也不是退团。SASHA稳定memberId=`recvxAPQCFuwFz`。 | [Mnet Plus官方平台入口](https://artist.mnetplus.world/main/stg/ifeye/contents/699fd28a83e517146af565b2)，沿用旧索引/标题证据，本轮不重试旧0行路径 |
| 10 | ifeye `e-ifeye-sasha-resume-announcement` | **已有公开替代**：同editorial的 `e-ifeye-sasha-return-plan`，2026-06-15公告日、eventDate=null | 当前页已有恢复计划，不等于实际恢复事件。6月25日追加将首个参与计划改为7月1日，仍缺完整直接正文及独立实际参与证明。不能因计划日期已过而升confirmed。 | [6月15日计划公告](https://artist.mnetplus.world/main/stg/ifeye/contents/6a2f5fc4a92a684281b0a9f3)、[6月25日追加](https://artist.mnetplus.world/main/stg/ifeye/contents/6a3c9d091d4a5353e1f3e17b)，沿用旧索引证据，本轮未重试 |
| 11 | NewJeans `e-newjeans-attention-mv` | 旧hold理由为缺MV首次公开原文；本次HYBE JAPAN官方稿已直接读取 | **可更新**：2022-07-22，day，行为为Attention首支MV公开，confirmed。保留workId=`recvxyOz5X2J0A`。不能改成音源/实体专辑发行或另一个Performance MV版本的日期。 | [HYBE JAPAN官方稿](https://prtimes.jp/main/html/rd/p/000000148.000045862.html)，本轮实际open读取正文 |
| 12 | Rocket Punch `e-rocketpunch-suyun-contract-announcement` | **已经解决并公开**：`data/rocketpunch-timeline-public.json` 同ID为ready/confirmed，announcementDate=2026-08-06、eventDate=null；组件与审阅入口均import该公开文件 | 公司和本人原文已证明合同结束事实，8月6日只证明本人公开信发表日，精确合同生效日未知。本轮再次直接读到两原文，不是新增解决项。不能继续在用户报告中列作“缺本人原文”。 | [Woollim官方公告](https://weverse.io/rocketpunch/notice/38032)、[SUYUN本人原文](https://weverse.io/rocketpunch/artist/3-238220157)；已有 `docs/codex/evidence/20261025-rocketpunch/timeline-evidence.json` |
| 13 | UDTT `e-udtt-jessica-provisional-join-candidate` | 旧hold；仅活动主办方的历史简介 | **仍待核**。主办方称Jessica临时加入，不是公司人事公告；日期未知。不能当永久入团，不能与Lu Yuting合并，memberIds留空。 | [主办方原稿/东京新闻承载](https://adv.tokyo-np.co.jp/prtimes/article75656/)，旧证据；本轮未重抓 |
| 14 | UDTT `e-udtt-sena-predebut-departure-candidate` | 旧hold；同主办方历史简介 | **仍待核**。仅预出道阶段离开线索；缺公司或本人声明，不能倒推3月26日或任何精确日期，不新建/猜测memberId。 | [同主办方原稿](https://adv.tokyo-np.co.jp/prtimes/article75656/)，旧证据；本轮未重抓 |

## 两项可更新的最小证据

### i-dle：只确认月精度续约事实

- 发行者：VT CUBE JAPAN / CUBE ENTERTAINMENT JAPAN。
- 稿件日期：2025-05-02 13:00。
- 原文最小片段：`昨年12月にメンバー全員がCUBE ENTERTAINMENTと再契約`。
- 本次实际读取正文第46行。第40行列MIYEON、MINNIE、SOYEON、YUQI、SHUHUA；事实为当时五人全员续约。
- 建议字段：eventDate `{value:'2024-12', precision:'month'}`，status `confirmed`，reviewStatus `ready`。announcementDate可保持null，以免把回顾新闻稿日期冒充最初续约公告日；稿件时间保存在sourcePublishedAt。
- 标题建议“全员与CUBE续约”，摘要明确“CUBE日本官方后续稿确认全员于2024年12月续约；具体签署日与合同生效日未公开”。不改其他更名节点。

### NewJeans：首支MV公开，与音源和Performance MV分开

- 发行者：HYBE JAPAN。
- 稿件日期：2022-07-22 12:00。
- 原文最小片段：`本日（22日）0時に公開したコンテンツ`，该句接着明确指向Attention MV。
- 本次实际读取正文第37行；第41行另外说明当日正午Performance MV计划、8月1日音源及8月8日实体发行，证明这些是不同节点。
- 建议字段：eventDate `{value:'2022-07-22', precision:'day'}`，status `confirmed`，reviewStatus `ready`；保留stable eventId/workId。仅修改该首支MV事件，不创建/改名其他作品。

## 对主代理的实施提示

1. 如果实施两项更新，应把本次明确原文与访问日期作为新证据，不能仅覆盖旧 `checkedAt` 让历史摘要看似已核；最好保留旧证据解释与新增来源。
2. 当前网页来源不统一，更新canonical后需确认对应团页/审阅投影是否真正消费它。不能只改JSON就宣称线上已更新。
3. Rocket Punch已有public ready可以作为同步canonical/统计口径的依据，但若父任务只做证据报告，则无需改变已批准页面。
4. Candy Shop与ifeye替代条目要保持各自“报道”“公告”“计划”性质；不重复显示同一过程，不为消除hold计数而丢失限定语。
5. 本报告的8项未核是本次有界研究结果，不是断言永远无法取得证据；没有发现新证据即保持待核，不推测。
