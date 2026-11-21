# 高清作品播放器续批核验（v209 候选）

本次固定快照取自 2026-11-21T17:23:25.962781+00:00。在 v208 的 19 个位置上新增 100 支，覆盖 27 团，合计 119 / 605 个已有原视频的作品可使用经核对的站内来源。[v208 原始核验](20261121-hd-work-players.md)

## 画面、版本和实播

沿用上一轮逐首冻结的 155 个候选、原片 ID 和转载署名。对新增条目核对原片预览图 SHA-256、转载的三个匹配时间、镜头相似度和片长。上一轮列出的三个语言或联名片尾疑项继续待核。画面证据及静音实播均未逐样本比对音轨。[新增条目的原题、署名和三个镜头](../evidence/20261122-work-player-continuation/verified.json)

另核 155 个投稿的公开检索摘要，其中 104 条含正文。版本关键词命中 Billlie《DOMINO ～ butterfly effect》的日语版和 ITZY《Not Shy》的 ZEPETO 英语版，原片与投稿题名均载明相应版本。[摘要筛查范围与版本标记](../evidence/20261122-work-player-continuation/verified.json)

新增来源均取得 Codex 内置浏览器静音实播读数，进度推进至少 1 秒。实际解码分辨率为71 支 1920 × 1080、1 支 1920 × 816、1 支 1760 × 1080、1 支 1675 × 1080、3 支 1620 × 1080、1 支 1576 × 1082、1 支 1512 × 1080、1 支 1481 × 1080、1 支 1424 × 1082、19 支 1280 × 720。截至快照，冻结队列尚有 37 支缺少可采纳的高清实播回执，其中 37 支已收到待核读数。[逐团目录及待核原因](../evidence/20261122-work-player-continuation/catalog-audit.json)

| 团体 | 本次新增作品 |
|---|---|
| MEOVV | 《DDI RO RI》、《In my hands》 |
| tripleS | 《Cherry Talk》、《Generation》、《Rising》 |
| YOUNG POSSE | 《ATE THAT》、《kawa》 |
| Candy Shop | 《Good Girl》 |
| VCHA | 《Little Miss》 |
| i-dle | 《Gimme Dat Love》、《Girlfriend》、《LATATA》、《LION》、《Senorita》、《TOMBOY》 |
| IZ*ONE | 《Panorama》 |
| fromis_9 | 《Vitamin ME》 |
| LOONA | 《PTT (Paint The Town)》、《So What》 |
| EVERGLOW | 《SLAY》、《ZOMBIE》 |
| Weeekly | 《After School》、《VROOM VROOM》 |
| WOOAH | 《SUMMER》 |
| Billlie | 《DOMINO ～ butterfly effect》、《RING ma Bell (what a wonderful world)》 |
| Kep1er | 《Galileo》、《KILLA (Face the other me)》 |
| NewJeans | 《Hurt》、《Super Shy》、《Zero》 |
| BABYMONSTER | 《FOREVER》、《HOT SAUCE》、《I LIKE IT》、《LIKE THAT》、《Love In My Heart》、《PSYCHO》、《Really Like You》、《SHEESH》、《SUGAR HONEY ICE TEA》、《Stuck In The Middle》、《WE GO UP》、《춤 (CHOOM)》 |
| ILLIT | 《ICONIC BY MISTAKE》、《NOT CUTE ANYMORE》、《NOT ME》、《Sunday Morning》、《Tick-Tack》 |
| aespa | 《Better Things》、《Dirty Work》、《KISS N TELL》、《LEMONADE》、《Live My Life》、《Rich Man》、《Savage》、《Switchblade (Feat. Ty Dolla $ign)》、《WDA (Whole Different Animal) (Feat. G-DRAGON)》、《Whiplash》 |
| IVE | 《I AM》、《I WANT》、《Off The Record》、《SUMMER FESTA》、《해야 (HEYA)》 |
| KISS OF LIFE | 《Countdown (BELLE Solo)》、《Kitty Cat (JULIE Solo)》、《Lucky》、《Play Love Games (HANEUL Solo)》 |
| STAYC | 《2 L0VE》、《GPT》 |
| NMIXX | 《Blue Valentine》、《DASH》、《DICE》、《KNOW ABOUT ME》、《O.O》 |
| Hearts2Hearts | 《ICONIC HEART》、《Lemon Tang》、《Pretty Please》、《RUDE!》、《STYLE》 |
| KiiiKiii | 《404 (New Era)》、《DANCING ALONE》、《Delulu》、《Pop Off Pop Off》 |
| ITZY | 《Boys Like You》、《Girls Will Be Girls》、《Imaginary Friend》、《Not Shy (English Ver.)》、《UNTOUCHABLE》、《Voltage》 |
| LE SSERAFIM | 《BOOMPALA》、《CELEBRATION》、《CRAZY》、《EASY》、《FEARLESS》、《Impurities》 |
| KATSEYE | 《Animal》、《Gnarly》、《Hootie Frutti》、《PINKY UP》、《Touch》 |

## 工程核对

使用本地正式工程的作品路由测试整份候选清单。119 个原视频返回匹配的站内播放器和上传者，238 个错误作品或视频组合得到拒绝，另逐项核对 119 个舞台入口。此快照记录播放器构建前的路由调用及本地浏览器回执。正式站验收须对应实际部署版本。[路由实测](../evidence/20261122-work-player-continuation/routing.json)
