# 51 团信息区公开统计研究（2026-10-25）

本报告对应 `apps/idol-site/data/group-information-facts.json`，仅涉及公开的社媒人数、唱片销量和音乐节目一位。未修改私人评分、备注、观看状态、原始社媒受保护目录、稳定 ID 或保存权限。

## 结果与显示口径

- 51 团均有结构化条目。韩国发行累计销量 32 团有来源数值，9 团来源内部矛盾而不显示数字，10 团仍缺完整统计。
- 打歌一位累计 23 团有可展示数字，4 团跨来源冲突而不显示数字，24 团缺少完整证据。未把榜单缺席或未检索到获奖报道当成 0。
- 新公开信息层已覆盖 **51 团、117 个已核实账号身份**，其中 **58 条有数字**：49 条为 2026-10-25 正常公开 YouTube 页面新观察，9 条为 2026-10-14 独立历史观察。INS 35 个身份/4 个计数，X 31 个身份/4 个计数，YouTube 51 个身份/50 个计数。
- 原始目录的 146 条 INS/X/YouTube 历史计数在当前 snapshot 下全部未通过既有 sourceHash guard，因此 **未直接重新绑定或显示**。前台新数字来自独立公开证据；K/M/万统一换算为“万”，不加“约”，仍保留平台舍入精度和真实观察日，不声称精确到个人或实时更新。
- 销量按来源的 **韩国 Circle/Gaon 实体发行统计（出货口径）** 展示；不称全球总销量，不混加日本单列数字，不拿单专首周数当团体累计。LOONA 另限为“团体专辑累计（韩国榜单）”，未覆盖出道前个人及分队企划。
- 销量来源未给出统一截止日，故 `asOf` 为 null，`checkedAt` 为 2026-10-25。只有已核到截止日的指标显示“截至某日”；查阅日与统计截止日分开。

## 来源与核查方式

销量从 [Korean Sales 艺人目录](https://koreansalestwt.blogspot.com/2021/03/artist-sales-summary-directory.html) 实际读取 41 个团体累计页。逐页比对韩国头部累计、韩国专辑行之和、年度行之和与韩日头部数字之和，并检查明显年份、标题冲突。该站是第三方整理，JSON 状态为 `source-reported`，不是“官方已核实”。[Circle 官方专辑榜](https://circlechart.kr/page_chart/album.circle?termGbn=month)定义的口径为发行量（出货减退货）。

一位累计实际读取 [kpopping 全艺人累计](https://kpopping.com/categories/music/total-wins)，并以 [Chukkae 女团累计](https://chukkae.com/music-shows/records/girl-groups)及[全艺人累计](https://chukkae.com/music-shows/records)交叉比较。两者均为第三方整理；只有报道逐项补足的 RESCENE 标为 `news-verified`。部分来源未注明统一截止日期，不能把这些数字描述为截至 10 月 25 日的官方全量复算。

读取限制：社媒账号页出现 403、登录限制或仅返回页脚时，不采用无日期搜索快照填入当前粉丝数。本地下载的 kpopping HTML 是 Cloudflare 挑战页；有效数字来自网页读取工具，不能把该 HTML 当成成功读取证明。

## 全部团体清单

销量栏单位为张，一位栏单位为次。“社媒”显示本轮信息层的“有数值平台/已核实账号平台”。所有日期按平台分别保留。

| 团体 | 韩国发行累计销量 | 打歌一位累计 | 社媒：计数/身份 | 统计来源 |
| --- | ---: | ---: | ---: | --- |
| MEOVV | 484,033 | 2 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2026/08/meovv-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| izna | 606,405 | 3 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2025/06/izna-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| tripleS | 冲突，待核 | 6 | 1/1 | [销量](https://koreansalestwt.blogspot.com/2023/03/triples-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| MADEIN | 冲突，待核 | 待补 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2025/02/madein-sales-summary.html) |
| ifeye | 48,843 | 待补 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2026/04/ifeye-sales-summary.html) |
| GENBLUE | 36,056 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2025/10/genblue-sales-summary.html) |
| RESCENE | 273,282 | 6（截至 2026-08-16） | 1/2 | [销量](https://koreansalestwt.blogspot.com/2024/09/rescene-sales-summary.html) · [一位](https://www.soompi.com/article/1863305wpp/watch-rescene-takes-2nd-win-for-love-attack-on-inkigayo-performances-by-stray-kids-wayv-and-more) |
| UNIS | 192,571 | 1 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2024/08/unis-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| BADVILLAIN | 待补 | 待补 | 1/1 | 待补 |
| QWER | 420,031 | 3 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2024/04/qwer-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| VVUP | 待补 | 待补 | 1/1 | 待补 |
| YOUNG POSSE | 55,596 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2024/03/young-posse-sales-summary.html) |
| BEWAVE | 待补 | 待补 | 1/1 | 待补 |
| Candy Shop | 7,606 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2024/06/candy-shop-sales-summary.html) |
| ODD YOUTH | 51,013 | 待补 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2025/05/odd-youth-sales-summary.html) |
| ADYA | 待补 | 待补 | 1/2 | 待补 |
| Geenius | 待补 | 待补 | 1/3 | 待补 |
| TRACER | 待补 | 待补 | 1/3 | 待补 |
| W!TCHX | 待补 | 待补 | 1/1 | 待补 |
| SPIA | 待补 | 待补 | 0/1 | 待补 |
| UDTT | 待补 | 待补 | 1/2 | 待补 |
| VCHA | 待补 | 待补 | 1/1 | 待补 |
| HITGS | 50,450 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2025/10/hitgs-sales-summary.html) |
| AtHeart | 27,549 | 待补 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2026/09/atheart-sales-summary.html) |
| i-dle | 8,005,431 | 73 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2021/01/gidle.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| IZ*ONE | 2,123,434 | 26 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2020/09/izone.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| fromis_9 | 冲突，待核 | 19 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2021/03/fromis9-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| LOONA | 647,815（仅团体专辑） | 4 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2021/03/loona-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| EVERGLOW | 318,947 | 3 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2021/03/everglow-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| Rocket Punch | 154,678 | 待补 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2021/06/rocket-punch-sales-summary.html) |
| Cherry Bullet | 105,675 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2021/06/cherry-bullet-sales-summary.html) |
| Weeekly | 320,555 | 待补 | 1/1 | [销量](https://koreansalestwt.blogspot.com/2021/04/weeekly-sales-summary.html) |
| WOOAH | 124,730 | 待补 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2022/08/wooah-sales-summary.html) |
| PURPLE KISS | 304,153 | 待补 | 1/1 | [销量](https://koreansalestwt.blogspot.com/2021/10/purple-kiss-sales-summary.html) |
| Billlie | 冲突，待核 | 1 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2022/05/billlie-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| Kep1er | 冲突，待核 | 7 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2022/08/kep1er-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| NewJeans | 8,878,571 | 冲突，待核 | 1/2 | [销量](https://koreansalestwt.blogspot.com/2023/01/newjeans-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| BABYMONSTER | 3,573,282 | 2 | 3/3 | [销量](https://koreansalestwt.blogspot.com/2024/11/babymonster-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| ILLIT | 3,000,170 | 23 | 3/3 | [销量](https://koreansalestwt.blogspot.com/2024/11/illit-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| XG | 119,593 | 待补 | 3/3 | [销量](https://koreansalestwt.blogspot.com/2024/05/xg-sales-summary.html) |
| aespa | 冲突，待核 | 冲突，待核 | 3/3 | [销量](https://koreansalestwt.blogspot.com/2022/08/aespa-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| IVE | 冲突，待核 | 冲突，待核 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2022/05/ive-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| KISS OF LIFE | 冲突，待核 | 5 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2023/11/kiss-of-life-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| STAYC | 2,083,451 | 21 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2021/05/stayc-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| NMIXX | 6,136,607 | 23 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2022/10/nmixx-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| Hearts2Hearts | 1,624,164 | 9 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2025/11/hearts2hearts-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| KiiiKiii | 456,994 | 5 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2026/02/kiiikiii-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| ITZY | 7,586,125 | 49 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2021/03/itzy-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| LE SSERAFIM | 7,822,438 | 冲突，待核 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2022/11/le-sserafim-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| SAY MY NAME | 冲突，待核 | 1 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2025/03/say-my-name-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |
| KATSEYE | 538,256 | 2 | 1/3 | [销量](https://koreansalestwt.blogspot.com/2025/07/katseye-sales-summary.html) · [一位](https://kpopping.com/categories/music/total-wins) |

## 已解决的统计差异

- i-dle：Chukkae 按旧名与新名拆成 70 次及 3 次，合计 73，与 kpopping 的 73 一致；不是另加一套相同获奖。
- tripleS：kpopping 团体 5 次，官方分队 Visionary Vision 1 次；按包含官方分队的团体口径合计 6，与 Chukkae 一致。页面来源说明应保留这一范围。
- RESCENE：kpopping 5 次、Chukkae 6 次。使用 [2026-07-14 首次一位报道](https://www.soompi.com/article/1854632wpp/watch-rescene-takes-tearful-1st-ever-win-on-the-show-with-pretty-girl)、[8 月 15 日 Pretty Girl 第 4 次报道](https://www.soompi.com/article/1863174wpp/watch-rescene-takes-4th-win-and-1st-ever-triple-crown-for-pretty-girl-on-music-core-performances-by-stray-kids-kiiikiii-and-more)及[8 月 16 日 LOVE ATTACK 第 2 次报道](https://www.soompi.com/article/1863305wpp/watch-rescene-takes-2nd-win-for-love-attack-on-inkigayo-performances-by-stray-kids-wayv-and-more)，确认截至 2026-08-16 为 6 次；之后是否有新增仍待更新，未称已核实 10 月最新总数。
- ILLIT：从 [BELIFT 官方资料页](https://beliftlab.com/artist/profile/ILLIT)确认 X Artist 指向 [ILLIT_official](https://x.com/ILLIT_official)。原先未取得的 X 人数已找到 2026-10-14 的独立公开观察 31.5 万；不是旧 guard 记录，不能混用 ILLIT_twt 成员运营账号。

## 尚未解决的销量冲突

这些条目保留原始证据与来源，但 `value` 为 null。未擅自选择更大的数字，也未把推算值写成已核实总量。

- **tripleS**：来源头部累计 2,124,086 张，与该页 10 条韩国专辑累计之和 2,123,697 张不一致。 来源年度行之和 2,143,415 张，与韩国及日本头部数值之和 2,143,625 张不一致。
- **MADEIN**：来源首张发行写为 ONE MORE TIME，且把出道后销量列为 2023 年；与已核实的 MADEIN 发行目录冲突，暂不采用该累计。
- **fromis_9**：来源年度行之和 1,201,917 张，与韩国及日本头部数值之和 1,182,406 张不一致。
- **Billlie**：来源头部累计 471,380 张，与该页 8 条韩国专辑累计之和 470,781 张不一致。
- **Kep1er**：来源年度行之和 2,147,658 张，与韩国及日本头部数值之和 2,207,897 张不一致。
- **aespa**：来源头部累计 12,171,912 张，与该页 9 条韩国专辑累计之和 12,170,372 张不一致。
- **IVE**：来源年度行之和 13,517,915 张，与韩国及日本头部数值之和 13,526,131 张不一致。
- **KISS OF LIFE**：来源年度行之和 792,096 张，与韩国及日本头部数值之和 552,525 张不一致。
- **SAY MY NAME**：来源年度行将首专时期标为 2023 年，与 2024 年出道/发行日期不符；暂不采用该累计。

## 尚未解决的一位冲突

- **NewJeans**：kpopping 为 36，Chukkae 为 35；统计口径或漏项尚未逐期厘清，暂不选用任一数值。
- **aespa**：kpopping 为 53，Chukkae 为 54；统计口径或漏项尚未逐期厘清，暂不选用任一数值。
- **IVE**：kpopping 为 82，Chukkae 为 83；统计口径或漏项尚未逐期厘清，暂不选用任一数值。
- **LE SSERAFIM**：kpopping 为 39，Chukkae 为 37；统计口径或漏项尚未逐期厘清，暂不选用任一数值。

LE SSERAFIM 的差异可能涉及跨团合作曲归属，但未逐期核实，因此未据推测消除冲突。来源未收录的其他团体继续标为待补，不能推断其从未取得一位。

## 社媒追加核查与账号身份例外

原始 `social-facts.json` 的 188 条团体观察（含 TikTok）全部 sourceHash 失配，缺行 0、缺源字段 0。guard 正确拒绝这些观察；无法从只存哈希的证据恢复哪项原值改变，未放宽或重新签名 guard。初稿所述 146 条 INS/X/YouTube 仅为原始库存，不能视为实际可用展示数据。

本轮先核对 14 个已批准团页 `content.social` 的官方身份，只搬账号，不搬同源旧人数；随后实际读取官网出站链接及正常公开 YouTube header。YouTube 官方艺人频道标识、频道名、稳定频道 ID 或官方网站链接互相核对。公司官网证书失败、403、失效页面、超时截断均不绕过。计数只取完整 `ytInitialData` 中频道 header 的订阅文案，不读取推荐视频频道计数。

49 条当日新观察保留页面 SHA、频道 ID、公开 URL 与 UTC 观察时间。9 条独立历史观察为 aespa、ILLIT、XG、BABYMONSTER 的 INS/X 共 8 条，以及 BABYMONSTER YouTube 1 条；其 2026-10-14 原日期、rawDisplay、public_rounded 与固定提交中的观察记录链接均保留。BABYMONSTER 当前抓取连续网络失败，因此 YouTube 仍是历史 1340 万，未伪装今天取得。

- **VCHA / GIRLSET**：当前取得的 117 万 YouTube 订阅属于 GIRLSET，更名前的 VCHA 历史人数不可据此倒推。
- **W!TCHX**：本次频道 8540 订阅（0.854 万）与已批准官方歌词影像 oEmbed 的频道身份一致。INS/X 仅有第三方线索，尚未补入当前官方身份。
- **SPIA**：频道身份由已批准公开影像资料保留；公开频道页当前不返回有效内容，人数空值，不能认定为 0。INS/X 还缺足够独立官方身份证据。
- **UDTT**：官方活动主办方新闻稿直链确认 INS；公司 Logo Motion 报道的内嵌视频经 YouTube oEmbed 确认 `@udtt_official`。本次 9.81 万订阅有完整公开 header。
- **Rocket Punch**：官方 Weverse 三平台 Related links 已重新确认；前两次普通下载不完整，第三次完整读取到 19.8 万订阅。
- **IVE**：旧 artist 记录明确标记对话恢复且原截图/HTML丢失，未采用其 INS/X 人数。YouTube 本次重新取得 532 万，可展示。
- **ILLIT**：无可靠日期的搜索快照 296.8K 未采用；X 31.5 万来自独立 10 月 14 日记录，YouTube 726 万来自本次公开 HTML。

截至本次收尾，INS/X 大部分账号身份已补，数字仍因登录、403、限流及无独立日期证据待补。账号继续可访问，缺数显示待核，不将失效 guard 的数字补回。完整逐平台记录见 `docs/codex/group-social-observations-20261025.json`。
## 数据结构检查

已校验 51 个唯一 slug 与目录 groupId 一致；销量/一位数值均为非负整数或 null；有数值条目均有 HTTPS 来源；所有冲突值均为 null；查阅日与统计截止日分开。报告只记录资料研究完成度，不代表页面布局、图片、生产保存或线上发布已通过。
