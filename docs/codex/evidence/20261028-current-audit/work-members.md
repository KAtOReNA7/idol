# v196 作品人物证据与图片口径复审

审计时间：2026-10-28T01:18:56.279538+08:00。基于本轮匿名线上投影 2026-10-27T17:14:27.535762+00:00，以及当前 v196 数据；只读审计，无应用变更、导入、提交或部署。未访问 Soridata。

## 核对结果

- **42 公开署名作品 + 6 已证无成员视频 − 1 重叠 + 84 未覆盖 = 131**，与 fresh 线上无既有成员关系的有名作品集合完全相等；无重复、漏项或已覆盖作品误计。
- 重叠是 Weeekly 韩文《Stranger》：演唱者参考与无人真人出镜可同时成立，成员评分仍关闭。英文版本独立开放。
- 42 项只有“公开资料有范围地覆盖”，不是42份完整MV演员名单：现有类型为 {"partial_mv_participation": 2, "official_recording_lineup": 15, "named_artist_credit": 2, "documented_project_lineup": 19, "documented_mv_participation": 4}。263个公开参考槽来自123个原图路径，不新增私人评分关系。

## 现有认人图与封面数量含义

- 原始关系2845行中，5行成员与作品均为空，是历史空行；有效单成员/单作品关系2840、重复tuple0。2828精确公共绑定+12原生有图=2840，当前有效关系缺图0。
- 2828是绑定条数，原图路径2572个；不能说2828张独立照片。12原生有图是Touch3、SWICY2、ZAP7，未进公共绑定清单不等于空白。原生图HTTP/SHA证据来自10月27日，本轮只重新核线上presence与集合。
- SUHYEON《ZAP》已有同次拍摄近景显示覆盖，旧全身构图待优化不能继续写成缺图或未解决近景问题。
- **632总数=605作品封面+23展示视频封面+4另存的舞台海报**。mv-public-media清单仍628；当前605有名作品均有精确视频封面，9旧占位作品不算缺封面。

## 84项按材料类型重新排队

| 类别 | 数量 | 缺什么 | 下一步与完成条件 |
|---|---:|---|---|
| 表演／现场版本 | 16 | 精确表演版本的具名阵容；另一MV或录音阵容不能证明本次实演。 | 先查原发布频道字幕/片尾与官方演出公告，再查当次具名幕后、电视台或主办方名单。 逐人身份与本视频版本对应；只证部分就标部分，不补当前全团。 |
| 特殊短片／品牌片／特别视频 | 11 | 短片中的成员、演员与纯叙事画面尚未区分。 | 优先制作公司/导演项目页、品牌/官方幕后及片尾署名，再找具名采访；必要时完整观看并记录证据时间点。 公开录音署名和演员出镜分别标注；完整视频与可靠来源支持无成员时才禁评。 |
| 常规MV | 26 | 与该MV或该次发行直接相关的逐人署名；团体简介不够。 | 查官方发行物内页、MV拍摄日记、Melon/Genie具名幕后、发行期采访或可靠具名报道。 可采用有范围的录音/发行署名或已证部分参演，但不能将其写成完整MV演员名单。 |
| 歌词视频 | 3 | 歌词版是否含真人片段，以及歌曲录音署名。 | 先完整检查精确歌词版开头至片尾，再读发行内页/官方录音名单；有真人则找具名镜头来源。 Lyric字样不是无真人证明；歌曲演唱者参考不自动开启成员评分。 |
| Remix／重混影像 | 11 | 各重混及Other World版独立的制作/真人画面证据。 | 先找SM/iScreaM/重混发行页和导演/动画制作档案；整片核验有无真人，再核原录音是否明确沿用及其署名。 不因remix或AI标签禁评，不从原MV转移出镜名单；有明确无成员来源或完整视觉证据再采用。 |
| 语言／不插电版本 | 7 | 该语言或编曲版本的参与人/拍摄版本链。 | 查日本/地区发行官网、版本内页、制作说明与具名幕后；先消歧同名不同videoId。 仅在来源证明沿用录音/影像时继承相应公开署名；否则版本独立核验。 |
| 项目／合作／频道企划 | 4 | 项目特定成员名单，不是品牌大使/作词者/团体当前简介。 | 查项目主办方、品牌/发行方、制作人说明、确切项目幕后和参与者采访。 区分作词作曲、录音、MV演员、舞台嘉宾四种身份；有证到哪层就标哪层。 |
| 影视／动画OST | 5 | 音轨演唱者与剧集演员/动画角色、MV真人插入的区分。 | 查影视官方音乐片尾、原声发行内页、平台剧集宣传与具名录音报道，再完整核目标MV是否含录音棚/歌手段落。 仅剧集画面或OST字样不能自动禁评；歌手可有公开录音参考，不能建立剧中演员的成员关系。 |
| 角色特别版 | 1 | 角色影像是否整片无成员真人（包括片头片尾/真人插入）。 | 核完整74秒MINIVE精确视频及片尾，辅以IVE/角色项目官方发布与制作方说明。 不把角色名称当作无真人证明，也不继承原BANG BANG演员名单。 |

分类是检索路线，不是已经证实的人物结论。Lyric、Remix、动画角色、OST标题均不能代替整片核验；有真人但缺照片的作品仍不能关闭成员评分。官方或民间具名同套图均可，图库放宽不能替代作品人物证据。

## 已失效或容易误读的旧分类

- +82、FEIFEI仍残留`currentFormatCategory=unavailable`，但已被v196公开署名覆盖。Doki Doki Love及韩文Stranger也残留旧格式字段；若只数该字段会得到88而非84，必须先按当前覆盖集合过滤。
- YOUNG POSSE《Scars》已读标题是MAPSQUARE Music，没有证明常规MV格式；本审计从旧standard_mv改走项目合作路线。剩余类别因此为常规MV26、合作项目4。没有改应用数据。
- 133是旧冻结口径；Touch和ZAP已有关系，当前131。旧127下载失败、A–Y/Z不是本轮图像缺口。
- 同名不同版本不是重复：The Chase歌词/表演、Supernova Grimes/Other World、Stranger韩/英各自保留精确videoId。

## 新增可执行来源入口（未采用）

- NMIXX《Caution》：日本[官网MOVIE](https://nmixxjapan.com/s/222o/)精确指向`eJd4ii5avNw`；新定位官方[MV幕后 tZO08cGQxM4](https://www.youtube.com/watch?v=tZO08cGQxM4)，2026-06-05发布。下一步核具名字幕、片尾及拍摄对应；官网独立PROFILE六人和Lily/Haewon作词作曲署名不能直接充当演员或全员演唱证据。
- 沿用待核入口：Rich Man Yellow Claw [Blognone报道](https://www.blognone.com/node/148254)与Supernova Grimes [导演简历](https://coloso.co.kr/products/3dartist-parkxohee2)。前者有明确无成员报道及目标嵌入，仍待完整视觉检查；后者不能混同Other World版本。
- NewJeans《Be Who You Are》少量检索只得到合作报道/团体简介和另一场现场报道，未新增可采用个人作品署名。

## 逐作品路线清单

| 团体 | 作品 | 视频 | 类别 |
|---|---|---|
| MADEIN | DADARIDA | [kLd8bHVpUUw](https://www.youtube.com/watch?v=kLd8bHVpUUw) | 表演／现场版本 |
| MADEIN | DOPAMINE | [PYEOubLoXDo](https://www.youtube.com/watch?v=PYEOubLoXDo) | 表演／现场版本 |
| VVUP | 4 Life | [A-Hr8aYSEx0](https://www.youtube.com/watch?v=A-Hr8aYSEx0) | 特殊短片／品牌片／特别视频 |
| YOUNG POSSE | Scars | [IVXJXo_AZyw](https://www.youtube.com/watch?v=IVXJXo_AZyw) | 项目／合作／频道企划 |
| YOUNG POSSE | ㄱㅓ리에서... (With. 존박) | [QsOnTCwooDs](https://www.youtube.com/watch?v=QsOnTCwooDs) | 表演／现场版本 |
| BEWAVE | SING ! | [BbcxmtNaesk](https://www.youtube.com/watch?v=BbcxmtNaesk) | 表演／现场版本 |
| ADYA | RIZZ | [-Xqhrnql7mg](https://www.youtube.com/watch?v=-Xqhrnql7mg) | 表演／现场版本 |
| Hearts2Hearts | The Chase | [80-Q7b1qaFg](https://www.youtube.com/watch?v=80-Q7b1qaFg) | 歌词视频 |
| Hearts2Hearts | FOCUS | [Txyb_mVaPyE](https://www.youtube.com/watch?v=Txyb_mVaPyE) | Remix／重混影像 |
| Hearts2Hearts | Moonride | [gNUMxMuxH20](https://www.youtube.com/watch?v=gNUMxMuxH20) | 常规MV |
| KiiiKiii | 딸기게임 (Strawberry Cheesegame) | [OncJ5v1keww](https://www.youtube.com/watch?v=OncJ5v1keww) | 歌词视频 |
| KiiiKiii | Delulu | [BTlj6Sls7KE](https://www.youtube.com/watch?v=BTlj6Sls7KE) | 特殊短片／品牌片／特别视频 |
| KiiiKiii | Pop Off Pop Off | [UsbRoaH6y-Q](https://www.youtube.com/watch?v=UsbRoaH6y-Q) | 常规MV |
| MEOVV | BODY | [yFGsw8phPn4](https://www.youtube.com/watch?v=yFGsw8phPn4) | 表演／现场版本 |
| MEOVV | LIT RIGHT NOW | [peFN4squVuQ](https://www.youtube.com/watch?v=peFN4squVuQ) | 特殊短片／品牌片／特别视频 |
| Hearts2Hearts | The Chase | [GtPPT-qSXj8](https://www.youtube.com/watch?v=GtPPT-qSXj8) | 表演／现场版本 |
| ILLIT | Tick-Tack | [1yMzV0NdB9g](https://www.youtube.com/watch?v=1yMzV0NdB9g) | 表演／现场版本 |
| ILLIT | little monster | [xRU1XXHIpIc](https://www.youtube.com/watch?v=xRU1XXHIpIc) | 特殊短片／品牌片／特别视频 |
| ILLIT | It's Me | [el7A_SI7sxs](https://www.youtube.com/watch?v=el7A_SI7sxs) | 表演／现场版本 |
| BABYMONSTER | LIKE THAT | [M8r3x4Re8-I](https://www.youtube.com/watch?v=M8r3x4Re8-I) | 表演／现场版本 |
| BABYMONSTER | BILLIONAIRE | [Gz_yRl6703c](https://www.youtube.com/watch?v=Gz_yRl6703c) | 表演／现场版本 |
| BABYMONSTER | Ghost | [sRLbqYkoaLc](https://www.youtube.com/watch?v=sRLbqYkoaLc) | 特殊短片／品牌片／特别视频 |
| MEOVV | Hit 'Em | [vYq_Xzj8HUM](https://www.youtube.com/watch?v=vYq_Xzj8HUM) | 表演／现场版本 |
| ILLIT | Almond Chocolate (Korean Ver.) | [qjebIv8FYMI](https://www.youtube.com/watch?v=qjebIv8FYMI) | 表演／现场版本 |
| KISS OF LIFE | Nothing | [U-8TNlJ1Mw4](https://www.youtube.com/watch?v=U-8TNlJ1Mw4) | 特殊短片／品牌片／特别视频 |
| KISS OF LIFE | Te Quiero | [pYn96ujbJX0](https://www.youtube.com/watch?v=pYn96ujbJX0) | 表演／现场版本 |
| KISS OF LIFE | k bye | [a6PBMuqpGto](https://www.youtube.com/watch?v=a6PBMuqpGto) | 特殊短片／品牌片／特别视频 |
| KISS OF LIFE | Painting | [xWHWl0vG-38](https://www.youtube.com/watch?v=xWHWl0vG-38) | 特殊短片／品牌片／特别视频 |
| KISS OF LIFE | Lucky (Korean Ver.) | [3L-v6Xh64FE](https://www.youtube.com/watch?v=3L-v6Xh64FE) | 语言／不插电版本 |
| KISS OF LIFE | Don't mind me | [mAPPUwHVHmk](https://www.youtube.com/watch?v=mAPPUwHVHmk) | 特殊短片／品牌片／特别视频 |
| KISS OF LIFE | WHAT! | [EJ2fIbl35Oc](https://www.youtube.com/watch?v=EJ2fIbl35Oc) | 特殊短片／品牌片／特别视频 |
| SAY MY NAME | 난 오늘 밤하늘에서 가장 빛나는 별이 된다 (Be a Star) | [W_VWfNkTamw](https://www.youtube.com/watch?v=W_VWfNkTamw) | 特殊短片／品牌片／特别视频 |
| izna | BEEP (Japan Edition) | [LiZAgfmoQwc](https://www.youtube.com/watch?v=LiZAgfmoQwc) | 语言／不插电版本 |
| izna | SASS & Racecar | [xZ5Ej-tLEjM](https://www.youtube.com/watch?v=xZ5Ej-tLEjM) | 表演／现场版本 |
| izna | Love All | [xu0fU46Cd7M](https://www.youtube.com/watch?v=xu0fU46Cd7M) | 歌词视频 |
| MADEIN | PUNG! | [aer_X9NmhTc](https://www.youtube.com/watch?v=aer_X9NmhTc) | 常规MV |
| TRACER | 365 | [924WxkHMdxU](https://www.youtube.com/watch?v=924WxkHMdxU) | 表演／现场版本 |
| UNIS | もしもし♡ (MoshiMoshi♡) | [DrU5bxPcH0s](https://www.youtube.com/watch?v=DrU5bxPcH0s) | 常规MV |
| Rocket Punch | Ring Ring | [FypWEDYseBY](https://www.youtube.com/watch?v=FypWEDYseBY) | 语言／不插电版本 |
| Weeekly | Love | [VACXoKdmofo](https://www.youtube.com/watch?v=VACXoKdmofo) | 项目／合作／频道企划 |
| Weeekly | Stranger | [FY9PFBxxKR8](https://www.youtube.com/watch?v=FY9PFBxxKR8) | 语言／不插电版本 |
| WOOAH | WXW (Wish With W) | [ZtiThQN5ETc](https://www.youtube.com/watch?v=ZtiThQN5ETc) | 常规MV |
| WOOAH | SUMMER | [8DwTAa5hPsA](https://www.youtube.com/watch?v=8DwTAa5hPsA) | 常规MV |
| PURPLE KISS | DOREMI | [os4driLeAiU](https://www.youtube.com/watch?v=os4driLeAiU) | 语言／不插电版本 |
| PURPLE KISS | Breath | [5oIIzNGeXco](https://www.youtube.com/watch?v=5oIIzNGeXco) | 常规MV |
| Billlie | GingaMingaYo (the strange world) | [a7d5aFNh-YE](https://www.youtube.com/watch?v=a7d5aFNh-YE) | 语言／不插电版本 |
| STAYC | MWUAH | [udOf9JGMA7U](https://www.youtube.com/watch?v=udOf9JGMA7U) | 常规MV |
| aespa | Next Level (Habstrakt Remix) | [EROYsCK0vK4](https://www.youtube.com/watch?v=EROYsCK0vK4) | Remix／重混影像 |
| aespa | Girls (BRLLNT Remix) | [ZlcvaEpCEJ4](https://www.youtube.com/watch?v=ZlcvaEpCEJ4) | Remix／重混影像 |
| aespa | Spicy (Nitepunk Remix) | [dn-fzIgHkg0](https://www.youtube.com/watch?v=dn-fzIgHkg0) | Remix／重混影像 |
| aespa | Regret of the Times (2024 aespa Remake Ver.) | [xjBY3MLdvVQ](https://www.youtube.com/watch?v=xjBY3MLdvVQ) | 常规MV |
| aespa | Get Goin' | [wPnjKZFgeiE](https://www.youtube.com/watch?v=wPnjKZFgeiE) | 影视／动画OST |
| aespa | Supernova (Grimes Remix) | [4kMcaEz1WrQ](https://www.youtube.com/watch?v=4kMcaEz1WrQ) | Remix／重混影像 |
| aespa | Armageddon (Flava D Remix) | [GnVRCX-Sfek](https://www.youtube.com/watch?v=GnVRCX-Sfek) | Remix／重混影像 |
| aespa | Supernova (Grimes Remix) (The Other World Ver.) | [tY2q55Sw3jA](https://www.youtube.com/watch?v=tY2q55Sw3jA) | Remix／重混影像 |
| aespa | Rich Man (Yellow Claw Remix) | [lWIQ72KFgrg](https://www.youtube.com/watch?v=lWIQ72KFgrg) | Remix／重混影像 |
| aespa | LEMONADE (Zedd Remix) | [P2loH5EOnr8](https://www.youtube.com/watch?v=P2loH5EOnr8) | Remix／重混影像 |
| aespa | LEMONADE (Marlon Hoffstadt Remix) | [zBiB0jww7_8](https://www.youtube.com/watch?v=zBiB0jww7_8) | Remix／重混影像 |
| aespa | LEMONADE (2Spade Remix) | [yMvsKWGPEIU](https://www.youtube.com/watch?v=yMvsKWGPEIU) | Remix／重混影像 |
| IVE | BANG BANG (MINIVE VER.) | [rNGPgQB4Be8](https://www.youtube.com/watch?v=rNGPgQB4Be8) | 角色特别版 |
| fromis_9 | Touchdown | [peoZYyEvY-k](https://www.youtube.com/watch?v=peoZYyEvY-k) | 影视／动画OST |
| NewJeans | Beautiful Restriction | [jgD_U2t6qXQ](https://www.youtube.com/watch?v=jgD_U2t6qXQ) | 影视／动画OST |
| NewJeans | Be Who You Are (Real Magic) | [XEsrFIQOWZg](https://www.youtube.com/watch?v=XEsrFIQOWZg) | 项目／合作／频道企划 |
| ITZY | LOCO (Japanese Ver.) | [ytTlH0EpSqI](https://www.youtube.com/watch?v=ytTlH0EpSqI) | 语言／不插电版本 |
| ITZY | SUPERPOWERS | [-1llaBEyOXA](https://www.youtube.com/watch?v=-1llaBEyOXA) | 影视／动画OST |
| NMIXX | Sprinkle Party | [0T8d3pRjmi4](https://www.youtube.com/watch?v=0T8d3pRjmi4) | 影视／动画OST |
| NMIXX | Caution | [eJd4ii5avNw](https://www.youtube.com/watch?v=eJd4ii5avNw) | 项目／合作／频道企划 |
| LOONA | LUMINOUS | [lLug6h74acE](https://www.youtube.com/watch?v=lLug6h74acE) | 常规MV |
| XG | MILLION PLACES | [c5Fc6r4A9d8](https://www.youtube.com/watch?v=c5Fc6r4A9d8) | 常规MV |
| WOOAH | VOODOO DOLL | [nYrezqbjl3E](https://www.youtube.com/watch?v=nYrezqbjl3E) | 常规MV |
| HITGS | A-HA! | [1XOmTvPWQSs](https://www.youtube.com/watch?v=1XOmTvPWQSs) | 常规MV |
| HITGS | GROSS | [HcJUfVPvU4Y](https://www.youtube.com/watch?v=HcJUfVPvU4Y) | 常规MV |
| HITGS | HAPPY | [3ensCfpaUWI](https://www.youtube.com/watch?v=3ensCfpaUWI) | 常规MV |
| HITGS | CHARIZZMA | [GGYo0Ya-4xE](https://www.youtube.com/watch?v=GGYo0Ya-4xE) | 常规MV |
| HITGS | Cherry Blossom | [6GUKqEfiX1I](https://www.youtube.com/watch?v=6GUKqEfiX1I) | 常规MV |
| HITGS | Little By Little | [L9VNIOcfSOU](https://www.youtube.com/watch?v=L9VNIOcfSOU) | 常规MV |
| HITGS | Gulliver! | [IM-N8trjDzk](https://www.youtube.com/watch?v=IM-N8trjDzk) | 常规MV |
| ifeye | loverfory | [ecQSl-6NSTA](https://www.youtube.com/watch?v=ecQSl-6NSTA) | 常规MV |
| GENBLUE | 夜市王 Night Market Queen | [o5EdYwk8k9o](https://www.youtube.com/watch?v=o5EdYwk8k9o) | 常规MV |
| UNIS | ギミサマ☆(GimmeSummer☆) | [sqYNGZJWNcw](https://www.youtube.com/watch?v=sqYNGZJWNcw) | 常规MV |
| QWER | Our Voyage | [FifVV3t38Vk](https://www.youtube.com/watch?v=FifVV3t38Vk) | 常规MV |
| YOUNG POSSE | Pilot2 | [GaqBpWroH68](https://www.youtube.com/watch?v=GaqBpWroH68) | 常规MV |
| YOUNG POSSE | GO해 | [J997YfFCw2I](https://www.youtube.com/watch?v=J997YfFCw2I) | 常规MV |
| YOUNG POSSE | 미스터 2026 | [lFxXpXk35Eo](https://www.youtube.com/watch?v=lFxXpXk35Eo) | 常规MV |

每项的缺证、完成条件、精确URL、旧分类、已读正文SHA与检索种子保存在同目录`work-members.json`。没有新增署名、无成员规则或照片；没有把检索命中写成已解决。

## 检查范围

本轮完成集合、关联、精确视频、封面及类型归类核对，并作少量定向来源检索。未重新下载全部图片，未逐片完整观看84个作品，未执行私人保存，也不声称全网资料已穷尽。
