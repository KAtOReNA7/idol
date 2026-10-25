# 当前完整报告：v11，附v9/v8历史记录

用户已确认v11。2026-10-26再次核对指定正式站点部署成功，已包含全部当前已完成修改；最新接续分支为`codex/mv-cover-and-identity-batch`。本次发布核对与仓库同步见[工作记录](worklogs/20261026-v11-publication-confirmation.md)。剩余缺口仍如下记录。

2026-10-26最新：作品封面遮挡已修复，新增657条认人图；累计1906条/312作品/42团，仍922条缺图、47条需提高清晰度、18项统计未知。保留当前设计、原图、稳定ID、个人记录及owner-private只读权限。

当前完整结果：[v11报告](mv-cover-identity-batch-report-20261026.md)、[51团完整表](reports/20261026-v11/completion-report.html)、[922条待补CSV](reports/20261026-v11/missing-mv-identities.csv)、[验证](mv-cover-identity-batch-verification-20261026.json)及[可重复补图方法](mv-identity-batch-method-20261026.md)。

下方为v9及v8历史记录，旧累计/缺口数字不代表当前版本。

---

# 全团开发完整报告：当前 v9，附 v8 历史原件

2026-10-26：用户确认v8后，续作v9已发布到同一指定正式地址。当前完整51团数据、个人页模块表与待补项见 [v9报告](data-gap-followup-report-20261026.md)、[完整HTML](reports/20261026-v9/completion-report.html)、[1579条待补认人图CSV](reports/20261026-v9/missing-mv-identities.csv)及[验证证据](data-gap-followup-verification-20261026.json)。

v9新增112条认人图（累计1249条/218作品/42团），修复两历史个人详情与七个手帐入口，XG一位改为来源确认0。仍1579条图待补、47条需提高清晰度、18项统计未知；个人页统一排版尚未实施。保留已确认视觉、原字节、稳定ID、个人记录及owner-private只读边界。

以下是已发布并获确认的 **v8历史报告**；其1137/1691等数字只代表v8，保持原件以便比较，不是当前累计。

---

# 全团资料、MV图片与个人页布局完整报告（v8）

2026-10-26 用户已确认当前成果，指定站点已发布v8。本报告保存该版本结果；后续修复另记，不回写历史缺口为已完成。

- [正式站点](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/) · [线上完整报告](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/review-all/completion-report.html)
- [完整待补认人图CSV](reports/20261026-v8/missing-mv-identities.csv) · [发布时HTML原件](reports/20261026-v8/completion-report.html)
- [验证摘要](statistics-mv-identity-verification-20261025.json) · [实现日志](worklogs/20261025-statistics-mv-identity-completion.md)

88项测试、类型检查及正式构建通过。本地605作品详情与255信息区布局通过；线上服务身份Chrome验证51团信息区、22作品抽样、40共享布局/5流程、40独立页封面布局与6交互。真实保存、全视频播放、80%/125%原生缩放、用户IAB及新Figma同步未验。保留owner-private只读，个人评分与备注未进入审阅包。

---

## 51团社交人数、销量与一位补全研究

核查完成：2026-10-25T16:25:50.998058+00:00（本地日期2026-10-26；任务沿用20261025文件名）。

本轮只新增公开统计证据，不修改原始私有快照、个人评分、备注、稳定ID或图片。前端读取的来源、日期、精度、范围与缺失标记均保存在 `apps/idol-site/data/group-statistics-completion-evidence.json`。

## 完成情况

51团的153个INS/X/YouTube账号入口均有具名身份来源：既有官方入口、官方视频说明、官方Linktree，或可追溯的公开艺人目录。此处“核到身份”不等于153个平台均已直接登录或实时读取；AIMCONTENTS身份目录为2026-02快照，存在更名差异的条目单独说明。本轮未找到可证实不存在的平台，因此没有按不存在隐藏的平台；VCHA下展示的三个账号当前均为GIRLSET。

- 人数：147项可核查公开值，6项人数缺失按用户要求显示0。INS/X统一万单位；YouTube保留公开舍入精度后转换万。
- 销量：42团有数值；其中新增10团公开累计或可复算下限。9团仍没有合格累计，显示0。
- 一位：27团正数，20团公开来源明确记录0，4团当前累计无法核实显示0。
- 界面显示0不强行改写事实：`observedValue=null`和`unavailable`与`observedValue=0`、`confirmed-zero`严格区分。

## 来源与口径

人数优先保留已验证官方YouTube公开观察；INS/X主要取具名[Chartmetric](https://chartmetric.com/)艺人页2026-10-25刷新数据，保留K/M原始显示精度。小团补充[AIMCONTENTS](https://aimcontents.com/)公开[2026-09月度SNS数据](https://aimcontents.com/data/sns-female.json)及[账号目录](https://aimcontents.com/data/metadata-female.json)。月度数字不冒充今天的实时精确人数。IZ*ONE、GENBLUE采用带日期的J-enta公开搜索索引快照，直接页面曾返回更旧缓存，日期与该限制已入证据；IZ*ONE、Cherry Bullet INS另用HypeAuditor具名页。

销量不加总Circle与Hanteo，不将单张、单周或单日销量当成团体累计。新增公开下限的卡片标题为“已公开累计”，详情说明韩国Circle范围和来源可见月份，不称全球完整累计。已有32团可追溯统计保留其原口径。

一位统计限定团体署名的韩国音乐节目，不包含年末颁奖、成员solo和来源单列的跨团项目。Soridata明确0仅表示该来源快照；没有公布截至日时asOf保留null。

## 已处理的差异与仍保留的问题

- ODD YOUTH：按官方Linktree将错误X链接ODDYOUTHOfficial_修正为oddyouth_offcl，人数绑定正确账号。
- EVERGLOW：新公司everglow.offcl / everglow_offcl人数未核实；旧账号2025-03的51万X/197万YouTube等数据未移植到新账号。新YouTube继续使用已验证13.2万。
- VCHA：当前INS、YouTube与X身份为GIRLSET，subjectName统一GIRLSET。INS120万为2026-10-25 Chartmetric公开刷新值、YouTube117万为2026-10-25官方频道观察；均非VCHA历史人数，未因此改成员或作品归属。
- SPIA：AIMCONTENTS及具名外部目录登记INS official_spia；另有资料指向spia__official，未确认两handle连续关系。7.8万只绑定来源登记的official_spia，不能移植给另一账号。subjectName仅写SPIA，差异放备注。
- fromis_9：X realfromis_9与2025官方发行视频说明、2026活动记录交叉核对，当前统计取50.73万；YouTube新旧频道单独处理，未拿AIM旧频道128万覆盖新频道37.1万。
- MADEIN：本团韩国公开月榜累计129,653；MADEIN S的35,587及LIMELIGHT不并入。
- tripleS：来源艺人页2,458,789+与可见36行月表不一致。选月表可复算2,087,073+；371,716差额仍未解释。
- fromis_9销量：37行月表合计1,036,604+，截至2025-07；来源汇总有1,037,067+及较新缓存1,152,076+，没有可复算新增月表，不冒充最新完整累计。
- aespa一位：Chukkae54含Karina solo《Up》1；排除solo取53，Soridata一致。
- NewJeans一位：Chukkae、Karchives、Soridata支持35，旧Kpopping36差异保留。
- IVE一位：采用逐曲可复算83（另两个来源支持），旧Kpopping82的2026-03-06歌曲归属/03-07条目差异保留。
- LE SSERAFIM一位：本团10首合计37；Soridata另列合作1次；Kpopping39仍未完整解释。本条采用明确排除跨团项目的37。
- 缺失人数曾检索到无日期Twstalker关联账号卡片（VVUP 30K、GIRLSET 38K、Cherry Bullet 187K等）；没有直接账号时间证据，不作为当前核实值。人数缺失并不是已证实没人关注。

## 全51团统计

† 按用户要求显示0，公开真实值仍未知。‡ 来源明确记录为0。+ 公开累计下限；不能解读为全球完整累计。所有日期与精度见对应JSON条目。

| 团体 | INS | X | YouTube | 唱片销量（张） | 音乐节目一位 |
| --- | ---: | ---: | ---: | ---: | ---: |
| MEOVV | [330万](https://chartmetric.com/artist/12657434) | [16.62万](https://chartmetric.com/artist/12657434) | [168万](https://www.youtube.com/@MEOVV_OFFICIAL) | [484,033](https://koreansalestwt.blogspot.com/2026/08/meovv-sales-summary.html) | [2](https://kpopping.com/categories/music/total-wins) |
| izna | [210万](https://chartmetric.com/artist/13043848) | [19.93万](https://chartmetric.com/artist/13043848) | [206万](https://www.youtube.com/@izna_offcl) | [606,405](https://koreansalestwt.blogspot.com/2025/06/izna-sales-summary.html) | [3](https://kpopping.com/categories/music/total-wins) |
| tripleS | [110万](https://chartmetric.com/artist/9902273) | [23.24万](https://chartmetric.com/artist/9902273) | [297万](https://www.youtube.com/@triplescosmos/videos) | [2,087,073+](https://soridata.com/sales/TripleS.html) | [6](https://kpopping.com/categories/music/total-wins) |
| MADEIN | [37.2万](https://chartmetric.com/artist/12643598) | [6.45万](https://chartmetric.com/artist/12643598) | [19.4万](https://www.youtube.com/@MADEIN_U/videos) | [129,653+](https://soridata.com/sales/MADEIN.html) | [0‡](https://soridata.com/artists/MADEIN.html) |
| ifeye | [29.65万](https://chartmetric.com/artist/13652339) | [2.05万](https://chartmetric.com/artist/13652339) | [30.4万](https://www.youtube.com/@ifeye/videos) | [48,843](https://koreansalestwt.blogspot.com/2026/04/ifeye-sales-summary.html) | [0‡](https://soridata.com/artists/Ifeye.html) |
| GENBLUE | [14.2127万](https://www.j-enta.com/en/artist/752/GENBLUE) | [0†](https://linktr.ee/genblue.official) | [17.1万](https://www.youtube.com/@GENBLUE_OFFICIAL/videos) | [36,056](https://koreansalestwt.blogspot.com/2025/10/genblue-sales-summary.html) | 0† |
| RESCENE | [120万](https://chartmetric.com/artist/11613059) | [8.17万](https://chartmetric.com/artist/11613059) | [131万](https://www.youtube.com/@RESCENE_official/videos) | [273,282](https://koreansalestwt.blogspot.com/2024/09/rescene-sales-summary.html) | [6](https://www.soompi.com/article/1863305wpp/watch-rescene-takes-2nd-win-for-love-attack-on-inkigayo-performances-by-stray-kids-wayv-and-more) |
| UNIS | [200万](https://chartmetric.com/artist/11682802) | [10.81万](https://chartmetric.com/artist/11682802) | [93.5万](https://www.youtube.com/@UNIS_Offcl/videos) | [192,571](https://koreansalestwt.blogspot.com/2024/08/unis-sales-summary.html) | [1](https://kpopping.com/categories/music/total-wins) |
| BADVILLAIN | [33.07万](https://chartmetric.com/artist/11960179) | [2.47万](https://chartmetric.com/artist/11960179) | [18.7万](https://www.youtube.com/@BADVILLAIN_BPM/videos) | 0† | [0‡](https://soridata.com/en/artists/BADVILLAIN.html) |
| QWER | [67.86万](https://chartmetric.com/artist/11144202) | [5.31万](https://chartmetric.com/artist/11144202) | [135万](https://www.youtube.com/@QWER_Band_official/videos) | [420,031](https://koreansalestwt.blogspot.com/2024/04/qwer-sales-summary.html) | [3](https://kpopping.com/categories/music/total-wins) |
| VVUP | [50.78万](https://chartmetric.com/artist/11653998) | [0†](https://linktr.ee/vvup_official) | [41.7万](https://www.youtube.com/@vvup_official/videos) | 0† | [0‡](https://soridata.com/artists/vvup.html) |
| YOUNG POSSE | [39.03万](https://chartmetric.com/artist/11143151) | [3.37万](https://chartmetric.com/artist/11143151) | [37.5万](https://www.youtube.com/@YOUNGPOSSEUP) | [55,596](https://koreansalestwt.blogspot.com/2024/03/young-posse-sales-summary.html) | [0‡](https://soridata.com/en/artists/YOUNG-POSSE.html) |
| BEWAVE | [23.7万](https://aimcontents.com/data/sns-female.json) | [0.5167万](https://aimcontents.com/data/sns-female.json) | [21.2万](https://www.youtube.com/@BEWAVE_official) | 0† | [0‡](https://soridata.com/en/artists/BEWAVE.html) |
| Candy Shop | [18.9万](https://aimcontents.com/data/sns-female.json) | [0.8134万](https://aimcontents.com/data/sns-female.json) | [4.71万](https://www.youtube.com/@BRAVE.CandyShop) | [7,606](https://koreansalestwt.blogspot.com/2024/06/candy-shop-sales-summary.html) | [0‡](https://soridata.com/en/artists/Candy-Shop.html) |
| ODD YOUTH | [9.3万](https://aimcontents.com/data/sns-female.json) | [1.6144万](https://aimcontents.com/data/sns-female.json) | [5.68万](https://www.youtube.com/@ODD_YOUTH) | [51,013](https://koreansalestwt.blogspot.com/2025/05/odd-youth-sales-summary.html) | [0‡](https://soridata.com/artists/odd-youth.html) |
| ADYA | [3.2万](https://aimcontents.com/data/sns-female.json) | [1.5618万](https://aimcontents.com/data/sns-female.json) | [1.56万](https://www.youtube.com/@OFFICIAL_ADYA/videos) | [7,321+](https://soridata.com/artists/adya.html) | [0‡](https://soridata.com/artists/adya.html) |
| Geenius | [5.59万](https://chartmetric.com/artist/11461125) | [1.16万](https://chartmetric.com/artist/11461125) | [5.08万](https://www.youtube.com/@geenius_official/videos) | 0† | [0‡](https://soridata.com/artists/Geenius.html) |
| TRACER | [0.6338万](https://aimcontents.com/data/sns-female.json) | [0.651万](https://aimcontents.com/data/sns-female.json) | [0.359万](https://www.youtube.com/channel/UCpZnxkISd-bM8j5pPlhOHjA) | 0† | 0† |
| W!TCHX | [11.8万](https://aimcontents.com/data/sns-female.json) | [0.6271万](https://aimcontents.com/data/sns-female.json) | [0.854万](https://www.youtube.com/@witchxofficial) | 0† | [0‡](https://soridata.com/artists/W-TCHX.html) |
| SPIA | [7.8万](https://aimcontents.com/data/sns-female.json) | [0.115万](https://aimcontents.com/data/sns-female.json) | [0.0387万](https://aimcontents.com/data/sns-female.json) | 0† | [0‡](https://soridata.com/artists/spia.html) |
| UDTT | [4万](https://aimcontents.com/data/sns-female.json) | [0.5399万](https://aimcontents.com/data/sns-female.json) | [9.81万](https://www.youtube.com/@udtt_official) | 0† | [0‡](https://soridata.com/artists/UDTT.html) |
| VCHA | [120万](https://chartmetric.com/artist/11069217) | [0†](https://socialcounts.org/youtube-video-live-view-count/iQzBz-JV2zg) | [117万](https://www.youtube.com/@girlset) | 0† | 0† |
| HITGS | [12.5万](https://aimcontents.com/data/sns-female.json) | [1.0797万](https://aimcontents.com/data/sns-female.json) | [9.67万](https://www.youtube.com/channel/UCgiJf4Qcigccr9lAXAA9hFQ) | [50,450](https://koreansalestwt.blogspot.com/2025/10/hitgs-sales-summary.html) | [0‡](https://soridata.com/en/artists/HITGS.html) |
| AtHeart | [21.28万](https://chartmetric.com/artist/13847334) | [1.56万](https://chartmetric.com/artist/13847334) | [149万](https://www.youtube.com/@AtHeart_TITAN) | [27,549](https://koreansalestwt.blogspot.com/2026/09/atheart-sales-summary.html) | [0‡](https://soridata.com/artists/AtHeart.html) |
| i-dle | [1310万](https://chartmetric.com/artist/1019577) | [240万](https://chartmetric.com/artist/1019577) | [989万](https://www.youtube.com/@official_i_dle) | [8,005,431](https://koreansalestwt.blogspot.com/2021/01/gidle.html) | [73](https://kpopping.com/categories/music/total-wins) |
| IZ*ONE | [187.4206万](https://hypeauditor.com/instagram/official_izone/) | [115.7685万](https://www.j-enta.com/en/artist/304/IZ%2AONE) | [232万](https://www.youtube.com/channel/UCe_oTYByLWQYCUmgmOMU_xw) | [2,123,434](https://koreansalestwt.blogspot.com/2020/09/izone.html) | [26](https://kpopping.com/categories/music/total-wins) |
| fromis_9 | [190万](https://chartmetric.com/artist/795272) | [50.73万](https://chartmetric.com/artist/795272) | [37.1万](https://www.youtube.com/@fromis9_official) | [1,036,604+](https://soridata.com/en/sales/fromis-9.html) | [19](https://kpopping.com/categories/music/total-wins) |
| LOONA | [190万](https://chartmetric.com/artist/364106) | [74.42万](https://chartmetric.com/artist/364106) | [188万](https://www.youtube.com/c/loonatheworld) | [647,815](https://koreansalestwt.blogspot.com/2021/03/loona-sales-summary.html) | [4](https://kpopping.com/categories/music/total-wins) |
| EVERGLOW | [0†](https://linktr.ee/everglow_offcl) | [0†](https://linktr.ee/everglow_offcl) | [13.2万](https://www.youtube.com/@everglow_offcl) | [318,947](https://koreansalestwt.blogspot.com/2021/03/everglow-sales-summary.html) | [3](https://kpopping.com/categories/music/total-wins) |
| Rocket Punch | [29万](https://aimcontents.com/data/sns-female.json) | [9.6726万](https://aimcontents.com/data/sns-female.json) | [19.8万](https://www.youtube.com/c/RocketPunch/videos) | [154,678](https://koreansalestwt.blogspot.com/2021/06/rocket-punch-sales-summary.html) | [0‡](https://soridata.com/en/awards/Rocket-Punch.html) |
| Cherry Bullet | [64.6786万](https://hypeauditor.com/instagram/cherrybullet/) | [0†](https://world.kbs.co.kr/service/contents_view.htm?board_seq=412529&id=&lang=j&menu_cate=artist) | [23.4万](https://www.youtube.com/channel/UCMj-rf97DfMsZ6LbPa8Eoww) | [105,675](https://koreansalestwt.blogspot.com/2021/06/cherry-bullet-sales-summary.html) | [0‡](https://soridata.com/en/artists/Cherry-Bullet.html) |
| Weeekly | [105.2万](https://aimcontents.com/data/sns-female.json) | [25.967万](https://aimcontents.com/data/sns-female.json) | [41.5万](https://www.youtube.com/channel/UC5rp2rDRSpyKNj-QLytC-tw/videos) | [320,555](https://koreansalestwt.blogspot.com/2021/04/weeekly-sales-summary.html) | [0‡](https://soridata.com/artists/weeekly.html) |
| WOOAH | [64.26万](https://chartmetric.com/artist/3682882) | [12.76万](https://chartmetric.com/artist/3682882) | [42.8万](https://www.youtube.com/channel/UCNeLbWtlJzTsavMC70zY0dQ/videos) | [124,730](https://koreansalestwt.blogspot.com/2022/08/wooah-sales-summary.html) | [0‡](https://soridata.com/en/artists/Woo-ah.html) |
| PURPLE KISS | [56.18万](https://chartmetric.com/artist/4101739) | [17.7万](https://chartmetric.com/artist/4101739) | [69.7万](https://www.youtube.com/channel/UCor8nQnEdMs4eBcU-uVBQ8g) | [304,153](https://koreansalestwt.blogspot.com/2021/10/purple-kiss-sales-summary.html) | [0‡](https://soridata.com/artists/purple-kiss.html) |
| Billlie | [120万](https://chartmetric.com/artist/7930611) | [31.61万](https://chartmetric.com/artist/7930611) | [85.6万](https://www.youtube.com/channel/UCyc9sUCxELTDK9vELO5Fzeg) | [401,196+](https://soridata.com/artists/billlie.html) | [1](https://kpopping.com/categories/music/total-wins) |
| Kep1er | [350万](https://chartmetric.com/artist/8289414) | [110万](https://chartmetric.com/artist/8289414) | [253万](https://www.youtube.com/channel/UC8whlOg70m2Yr3qSMjUhh0g) | [1,827,491+](https://soridata.com/artists/kep1er.html) | [7](https://kpopping.com/categories/music/total-wins) |
| NewJeans | [1280万](https://chartmetric.com/artist/9527296) | [200万](https://chartmetric.com/artist/9527296) | [871万](https://www.youtube.com/channel/UCMki_UkHb4qSc0qyEcOHHJw/videos) | [8,878,571](https://koreansalestwt.blogspot.com/2023/01/newjeans-sales-summary.html) | [35](https://chukkae.com/artists/newjeans) |
| BABYMONSTER | [1050万](https://chartmetric.com/artist/11322734) | [100万](https://chartmetric.com/artist/11322734) | [1340万](https://www.youtube.com/@BABYMONSTER) | [3,573,282](https://koreansalestwt.blogspot.com/2024/11/babymonster-sales-summary.html) | [2](https://kpopping.com/categories/music/total-wins) |
| ILLIT | [830万](https://chartmetric.com/artist/11141960) | [58.89万](https://chartmetric.com/artist/11141960) | [726万](https://www.youtube.com/@ILLIT_official) | [3,000,170](https://koreansalestwt.blogspot.com/2024/11/illit-sales-summary.html) | [23](https://kpopping.com/categories/music/total-wins) |
| XG | [340万](https://chartmetric.com/artist/8365677) | [56.14万](https://chartmetric.com/artist/8365677) | [488万](https://www.youtube.com/channel/UC12HMtO5MYph9dCZZ7yygng) | [119,593](https://koreansalestwt.blogspot.com/2024/05/xg-sales-summary.html) | 0† |
| aespa | [1700万](https://chartmetric.com/artist/4080594) | [530万](https://chartmetric.com/artist/4080594) | [900万](https://www.youtube.com/@aespa) | [12,048,373+](https://soridata.com/artists/aespa.html) | [53](https://chukkae.com/artists/aespa) |
| IVE | [700万](https://chartmetric.com/artist/8157684) | [200万](https://chartmetric.com/artist/8157684) | [532万](https://www.youtube.com/@IVEstarship) | [12,629,129+](https://soridata.com/artists/IVE.html) | [83](https://chukkae.com/artists/ive) |
| KISS OF LIFE | [300万](https://chartmetric.com/artist/10805316) | [25.42万](https://chartmetric.com/artist/10805316) | [216万](https://www.youtube.com/@KISSOFLIFE_official) | [526,464+](https://soridata.com/sales/Kiss-of-Life.html) | [5](https://kpopping.com/categories/music/total-wins) |
| STAYC | [200万](https://chartmetric.com/artist/4073115) | [72.46万](https://chartmetric.com/artist/4073115) | [186万](https://www.youtube.com/channel/UCod5V2dpnpJLklGvVOv5FcQ) | [2,083,451](https://koreansalestwt.blogspot.com/2021/05/stayc-sales-summary.html) | [21](https://kpopping.com/categories/music/total-wins) |
| NMIXX | [610万](https://chartmetric.com/artist/8433383) | [130万](https://chartmetric.com/artist/8433383) | [482万](https://www.youtube.com/channel/UCnUAyD4t2LkvW68YrDh7fDg) | [6,136,607](https://koreansalestwt.blogspot.com/2022/10/nmixx-sales-summary.html) | [23](https://kpopping.com/categories/music/total-wins) |
| Hearts2Hearts | [600万](https://chartmetric.com/artist/13489232) | [50.33万](https://chartmetric.com/artist/13489232) | [432万](https://www.youtube.com/@hearts2hearts.official) | [1,624,164](https://koreansalestwt.blogspot.com/2025/11/hearts2hearts-sales-summary.html) | [9](https://kpopping.com/categories/music/total-wins) |
| KiiiKiii | [170万](https://chartmetric.com/artist/13489212) | [15.15万](https://chartmetric.com/artist/13489212) | [75万](https://www.youtube.com/@KiiiKiii_starship/videos) | [456,994](https://koreansalestwt.blogspot.com/2026/02/kiiikiii-sales-summary.html) | [5](https://kpopping.com/categories/music/total-wins) |
| ITZY | [1920万](https://chartmetric.com/artist/1402414) | [660万](https://chartmetric.com/artist/1402414) | [1000万](https://www.youtube.com/c/ITZY) | [7,586,125](https://koreansalestwt.blogspot.com/2021/03/itzy-sales-summary.html) | [49](https://kpopping.com/categories/music/total-wins) |
| LE SSERAFIM | [1130万](https://chartmetric.com/artist/9149614) | [230万](https://chartmetric.com/artist/9149614) | [893万](https://www.youtube.com/channel/UCs-QBT4qkj_YiQw1ZntDO3g) | [7,822,438](https://koreansalestwt.blogspot.com/2022/11/le-sserafim-sales-summary.html) | [37](https://chukkae.com/artists/le-sserafim) |
| SAY MY NAME | [42.66万](https://chartmetric.com/artist/12857140) | [7.08万](https://chartmetric.com/artist/12857140) | [49.7万](https://www.youtube.com/@sa2m2nam3/videos) | [349,010+](https://soridata.com/sales/SAY-MY-NAME.html) | [1](https://kpopping.com/categories/music/total-wins) |
| KATSEYE | [980万](https://chartmetric.com/artist/12149515) | [38.32万](https://chartmetric.com/artist/12149515) | [1510万](https://www.youtube.com/@katseyeworld/videos) | [538,256](https://koreansalestwt.blogspot.com/2025/07/katseye-sales-summary.html) | [2](https://kpopping.com/categories/music/total-wins) |

## 仍以0占位的项目

- 社交人数：GENBLUE X、VVUP X、VCHA X、EVERGLOW X、EVERGLOW INS、Cherry Bullet X。
- 累计销量：BADVILLAIN、VVUP、BEWAVE、Geenius、TRACER、W!TCHX、SPIA、UDTT、VCHA。
- 一位当前累计：GENBLUE、TRACER、VCHA、XG。XG旧快照曾为0，但不将过旧快照认定为当前核实总数。

## 数据验证

已验证51团覆盖、每团平台唯一、153账号均有身份来源、147个非缺失人数均有数值来源、所有null观察值的显示值为0、20个确认零均有明确零来源、5份月表合计与4组一位逐曲合计可复算。没有修改UI或业务字段，也没有执行Git提交。

---

## MV封面与认人图补充审查（2026-10-26）

本次只处理公开图片与证据，不改个人评分、备注、稳定ID或作品成员关系。1137条是公开可交付图片绑定，不把1978个旧私密附件引用计作已发布。

## 已完成

- 605条现有作品的精确YouTube视频封面全部取得，另补23个独立团页编辑视频槽，共628张原字节封面（73,433,666 bytes）。605条包含正式MV、舞台、音频及其他版本，不能称605支正式MV。
- 1137个已有成员/作品/精确视频组合取得公开认人图，覆盖40团205条作品；使用1130个原文件（674,286,471 bytes）。186条沿用已核过的原SHA，494条为精确MV来源页具名图（其中H2H八格为临时清晰度），457条为无重复视频版本的具名MV章节图。
- 保留原图原字节；39张封面和认人图中的明确连续黑/白外边以sourceCrop展示裁切。自然白背景不自动当作白边。H2H八格根据原图打印的名字划定单人区域，不作人脸身份推断。
- 所有下载成功来源的联系表、全部检测到的边框候选、24个更换的宽镜头候选，以及最终H2H八格实际看图。展示框统一3:4由主代理实现；本证据不宣称已完成线上视觉验收。
- 1758个使用中的唯一原文件SHA256/字节数核对通过，全部成员绑定存在于原目录，全部裁切矩形在原始尺寸范围内。

## 3:4展示裁切复查（2026-10-26）

- 1137条认人图按实际3:4展示算法生成19页联系表并全部检查，再对照3页候选原图检查明显切脸、切头及留边问题。
- 完成125条纯展示裁切调整，新增精确3:4矩形或修正原矩形；现在223条认人图使用sourceCrop。未增加资产、作品或成员关系，47条小卡片清晰度限制保持。
- tripleS《Rising》NaKyoung右侧切脸已重新居中；五张竖向肖像调整头顶对齐；补去aespa《Black Mamba》四张黑边和LOONA《Hi High》十二张截图灰边。H2H八格具名区域及原有特殊裁切证据保留。
- 125条调整后的3:4联系表三页再次核对，1758个使用中原文件SHA256/字节数重新核对一致。完整逐条旧/新矩形见JSON的displayCropReview.adjustments。
- 原图本来已截断的头顶、暗光、柔焦和极近特写仍属于来源限制，不能通过展示裁切恢复；本检查不代替集成后的浏览器验收，也不统一宣称高清。

## 未解决与限制

- 仍有400条作品未取得本轮公开认人图，其中133条没有既有成员关系。尚缺1691条已有成员关系的公开合格图；不得据此推定全员参演或关闭成员评分。
- 12条旧已审核候选当前没有成员/作品关系（UNIS SWICY 2人、KATSEYE Touch 3人、Billlie ZAP 7人），已移出可投影数组并保留在 unboundApprovedCandidates；不自动新增关系。
- 47条仅适合小卡片；H2H《The Chase》八格明确标为“本 MV 具名截图（清晰度待提升）”。源图尺寸较大不代表人物脸部一定清楚，其余图也不统一承诺高清。
- 第三方图库包含柔焦、暗光、局部远景或多人舞蹈镜头。已换24个较宽镜头为同一具名图库中更好候选，仍需后续逐张提高清晰度/单人构图。
- DBKpop原548条全部恢复；原有公开候选215条中203条成功：11条403、1条原SHA变化未纳入。旧Nxde五张双联图不作为主图，使用已审核后继单人图。
- WordPress原549条中434条成功；102条当前图注缺失/歧义、3条章节变化、10条尺寸未达最低可读阈值保留。额外ILLIT15条、RESCENE30条是新查来源；ILLIT Tick-Tack五条因原版与Performance版本并存暂缓。
- QWER追加查询仍只有未具名团照、概念照和花絮视频入口，缺少精确具名MV单图；未以概念照替代。
- “无真人成员出演”的分类由主代理独立核实，本图片审查不据缺图、动画标签或缺关系自行关闭评分。

## 逐团覆盖

下表按稳定作品目录统计，编辑专用23封面不虚构成可评分作品。团体W!TCHX没有本目录稳定作品，另补4个既有编辑视频封面。

|团体|作品封面|有公开认人图的作品|已有关系图已补/总数|仍缺|
|---|---:|---:|---:|---:|
|ADYA|3/3|1|5/10|5|
|aespa|36/36|15|57/94|37|
|AtHeart|2/2|0|0/6|6|
|BABYMONSTER|19/19|4|16/96|80|
|BADVILLAIN|6/6|3|20/28|8|
|BEWAVE|2/2|0|0/2|2|
|Billlie|13/13|6|36/70|34|
|Candy Shop|3/3|2|8/12|4|
|Cherry Bullet|7/7|3|27/55|28|
|EVERGLOW|10/10|7|42/58|16|
|fromis_9|16/16|7|44/120|76|
|Geenius|6/6|0|0/10|10|
|GENBLUE|4/4|1|6/18|12|
|Hearts2Hearts|13/13|1|8/64|56|
|HITGS|8/8|0|0/5|5|
|i-dle|28/28|9|49/152|103|
|ifeye|4/4|0|0/12|12|
|ILLIT|21/21|3|15/77|62|
|ITZY|32/32|21|101/138|37|
|IVE|25/25|7|42/144|102|
|IZ*ONE|10/10|2|2/108|106|
|izna|9/9|1|7/37|30|
|KATSEYE|8/8|1|5/6|1|
|Kep1er|16/16|4|34/134|100|
|KiiiKiii|9/9|1|3/30|27|
|KISS OF LIFE|25/25|7|22/61|39|
|LE SSERAFIM|20/20|11|53/95|42|
|LOONA|10/10|7|82/105|23|
|MADEIN|8/8|3|16/22|6|
|MEOVV|10/10|3|15/35|20|
|NewJeans|25/25|11|40/91|51|
|NMIXX|20/20|8|46/106|60|
|ODD YOUTH|3/3|0|0/15|15|
|PURPLE KISS|13/13|8|52/72|20|
|QWER|7/7|0|0/21|21|
|RESCENE|10/10|6|30/50|20|
|Rocket Punch|11/11|5|30/54|24|
|SAY MY NAME|6/6|1|7/37|30|
|SPIA|1/1|0|0/5|5|
|STAYC|17/17|8|46/91|45|
|TRACER|1/1|0|0/0|0|
|tripleS|25/25|4|36/143|107|
|UDTT|1/1|0|0/4|4|
|UNIS|6/6|2|14/30|16|
|VCHA|4/4|1|6/6|0|
|VVUP|7/7|3|12/16|4|
|Weeekly|14/14|8|53/73|20|
|WOOAH|14/14|4|20/56|36|
|XG|23/23|1|7/115|108|
|YOUNG POSSE|14/14|5|23/39|16|

## 来源与可复查证据

逐图片来源页、原图URL、SHA256、尺寸、精确视频证据级别、原图标签、展示裁切与逐作品缺口见同名JSON。主要新增来源：

- [DBKpop具名MV图库](https://dbkpop.com/db/kpop-who-is-who/)：页面须包含精确videoId，图注须明确成员。
- [K-Pop Girl Groups 101](https://allaboutkpopgirlgroups.wordpress.com/band-and-member-profiles/)：图注、MV章节和唯一原版作品同时匹配；页面通常不嵌精确videoId，不宣称独立逐帧核验。
- [H2H具名MV图](https://kprofiles.com/hearts2hearts-who-is-who/)：当前《The Chase》段落链接精确MV，八格原图内印成员名。
- 既有审核候选还包括Dispatch、Soompi、Vogue、Teen Vogue等具名且SHA固定的来源，详见JSON。

证据完成时间为2026-10-26；文件名保留本轮任务20261025编号。

---

## 个人页面模块排版现状统计

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
