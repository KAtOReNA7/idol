# 51团社交人数、销量与一位补全研究

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
