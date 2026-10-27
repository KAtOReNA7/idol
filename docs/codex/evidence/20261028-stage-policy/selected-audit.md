# 已有482项舞台按新标准复筛

依据用户2026-10-28最新决定及 `docs/codex/stage-selection-policy-20261028.md`。本轮只读检查当前 `apps/idol-site/data/stage-videos.json` 的全部482个作品绑定（472个不同视频ID），结合已存公开来源资料。**482已选源不再等于482符合新的打歌／练习室标准。**

没有新网络请求、连续全片观看、收音测试、私人数据读取、应用或评分修改。具体行的workId、videoId、sourceUrl、源JSON定位和判断理由全部见 `selected-audit.json`。来源文件SHA已冻结并在结束时核对未变。

## 互斥分类

| 分类 | 作品绑定数 | 判断边界 |
|---|---:|---|
| 资料明确为巡演／音乐节／校园节等活动 | 19 | 18个不同视频；登记替换研究，不能静默迁移已有评分。 |
| 活动、展示会、年末／颁奖或特殊节目需复核 | 23 | 明确活动与疑似活动分别在逐条理由说明，不统一伪称“已证实演唱会”。 |
| 常规音乐节目 | 153 | 题名给出节目且发布者对应；仅类型符合，不表示新核听、音质或精确语种全已复验。 |
| 其他电视音乐节目／回归特别节目 | 17 | 包括回归秀、音乐访谈、综艺演出；不自动等同常规打歌。 |
| 专门制作Performance／Studio Choom等 | 189 | 单列，不能冒称练习室或用户全部认可。 |
| 录音棚／电台／专门session | 73 | 单列，收音未新核验，不自动填入新标准缺口。 |
| 录制场合证据不足 | 8 | 泛称Live Clip、Special Stage或节目背景不足，继续查原说明。 |
| **合计** | **482** | 逐workId无重复遗漏。 |

本批已有选源中没有题名明确标识的练习室版本（0项），不代表外部不存在。旧规则此前排除练习室，需要下一轮按新政策重新找候选。

分类先人工处理精确视频和活动例外，再按节目名称与实际发布者、源资料类型归类。**it's Live的Band LIVE Concert不因Concert字样判演唱会；Simply K-Pop CON-TOUR不因TOUR字样判巡演。** IVE仅写Tokyo Dome的LUCID DREAM因证据不足放入待核，不从地点名直接推定类型。MEN CONCERT同样保留“系列名或活动待核”。

## v194四项优先结论

| 作品 | 精确视频 | 新标准判断 |
|---|---|---|
| IVE WAVE | `_rn2nefy610` | Golden Wave Tokyo活动，JTBC播出不使其成为常规打歌；重新找合格替代。 |
| IVE CRUSH | `crGAr4NQRa4` | 同上。 |
| XG MILLION PLACES | `nd2aaJ9AQjA` | 艺人原公告／标题明确东京巨蛋the first HOWL巡演；重新找替代。 |
| XG HOWLING | `mf4X6i5cm_Q` | KBS Music Bank常规节目类型符合；本轮未重新全片核听。 |

IVE两项的活动性质另有同期Kstyle报道和活动票务资料支持，见 `docs/codex/evidence/20261027-category-resolution/stages/formal-candidates-next-check.json` 及 `additional-research.json`。XG MILLION PLACES有XGALX官方链接 `https://xgalx.com/xg/news/detail.php?id=1125428`。前次授权作为历史保留，不据新标准删除旧评分。

## 19项明确活动来源：替换研究名单

下列“明确”指已存官方／原发布者精确题名、类型说明或活动资料能确认演出场合；不是本轮重新全片观看，也不评价每段实际音质。

| 团体／作品 | workId | 视频ID | 来源与理由 |
|---|---|---|---|
| ITZY · ROCK & ROLL | `recvxyOz5XmoUV` | [`1m67ssYnOU4`](https://www.youtube.com/watch?v=1m67ssYnOU4) | 艺人官方标题明确CONCERT CAM与TUNNEL VISION东京演出，非练习室。 |
| Kep1er · Grand Prix | `recvxyOz5XiuDr` | [`d-dktScWxKo`](https://www.youtube.com/watch?v=d-dktScWxKo) | KCON发布者正文明确2024-05-10至12、KCON STAGE与K-POP Fan & Artist Festival，非凭频道名推断。 |
| ILLIT · It's Me | `rec28ldfRTrKtW` | [`a2AvaSdqN28`](https://www.youtube.com/watch?v=a2AvaSdqN28) | 艺人官方明确2026 Weverse Con Festival现场；同视频被两个作品ID选中。 |
| ILLIT · It's Me | `rec28ldfRTrKy2` | [`a2AvaSdqN28`](https://www.youtube.com/watch?v=a2AvaSdqN28) | 艺人官方明确2026 Weverse Con Festival现场；同视频被两个作品ID选中。 |
| Kep1er · Straight Line | `recvxyOz5XmIH0` | [`DZgK9S4pliA`](https://www.youtube.com/watch?v=DZgK9S4pliA) | KCON发布者正文明确2024-05-10至12、KCON STAGE与K-POP Fan & Artist Festival，非凭频道名推断。 |
| KiiiKiii · 딸기게임 (Strawberry Cheesegame) | `rec28ldfRTrINH` | [`BwF8zZ_ZZDY`](https://www.youtube.com/watch?v=BwF8zZ_ZZDY) | 主办学校教育电视台署名、高丽大学石塔大同祭2026-05-21第三日、直拍三项共同指向校园音乐节。 |
| STAYC · POPPY | `recvxyH5pzbUId` | [`wuICiuOUFGE`](https://www.youtube.com/watch?v=wuICiuOUFGE) | KBS WORLD JAPAN精确元数据写2024 Music Bank Global Festival in JAPAN与2024-12-14；是海外Festival活动，非普通周播打歌。 |
| aespa · Switchblade (Feat. Ty Dolla $ign) | `recvxyHuKMDKAR` | [`sVwYpHqdt3o`](https://www.youtube.com/watch?v=sVwYpHqdt3o) | 艺人官方精确标题明确2026-27 LIVE TOUR SYNK:COMPLæXITY；旧kind节目完整表演没有反映巡演来源。 |
| Billlie · DOMINO ～ butterfly effect | `recvxyH5pz62TB` | [`OTLdHfo0hTc`](https://www.youtube.com/watch?v=OTLdHfo0hTc) | 艺人官方SHOW-CON Domino Effect IN JAPAN Stage Cam，既有类型为演唱会完整舞台。 |
| IVE · Supernova Love | `recvxyHuKMEruy` | [`qPoTrGxOOEA`](https://www.youtube.com/watch?v=qPoTrGxOOEA&t=1981s) | 艺人官方Lollapalooza Berlin整场中的Supernova Love章节，已存精确33:01–36:28范围。 |
| KATSEYE · Gnarly | `recvxIZd9vfxUk` | [`Rz47IBr1GXM`](https://www.youtube.com/watch?v=Rz47IBr1GXM) | 艺人官方Lollapalooza Chicago 2025 Gnarly演出，既有证据明确音乐节现场。 |
| XG · SOMETHING AIN'T RIGHT | `recvxDMFHNzaOb` | [`BWASDZZtO6w`](https://www.youtube.com/watch?v=BWASDZZtO6w) | Capital活动发布者明确Summertime Ball 2026现场；既有证据另存主办方单曲歌单。 |
| XG · Tippy Toes | `recvxDMwzBm3rz` | [`vJ1Yrh7_SSw`](https://www.youtube.com/watch?v=vJ1Yrh7_SSw) | 艺人官方WORLD TOUR THE CORE、代代木体育馆舞台，非练习室或常规打歌。 |
| XG · IS THIS LOVE | `recvxDMFHNojjN` | [`0A-XylDBKEU`](https://www.youtube.com/watch?v=0A-XylDBKEU) | 艺人官方the first HOWL巡演东京巨蛋终场单曲。 |
| NewJeans · Cool With You / Get Up | `recvxyOz5Xr6ek` | [`Xw-rOxA0ItI`](https://www.youtube.com/watch?v=Xw-rOxA0ItI) | 艺人官方Lollapalooza 2023整场中的Cool With You/Get Up连续章节，非单独打歌版。 |
| aespa · Live My Life | `recvxyHuKMKGBh` | [`gf2a-oVSn0k`](https://www.youtube.com/watch?v=gf2a-oVSn0k) | 主办学校KTN发布、2026高丽大学IPSELENTI音乐节，既有分类亦为音乐节。 |
| IVE · WAVE | `recvxyHuKM2wRG` | [`_rn2nefy610`](https://www.youtube.com/watch?v=_rn2nefy610) | 同期Kstyle报道与Golden Wave Tokyo票务/节目元数据定位2024-10-12活动；JTBC播出不改变活动来源。 |
| IVE · CRUSH | `recvxyHuKMCtUB` | [`crGAr4NQRa4`](https://www.youtube.com/watch?v=crGAr4NQRa4) | 同期Kstyle报道与Golden Wave Tokyo票务/节目元数据定位2024-10-12活动；JTBC播出不改变活动来源。 |
| XG · MILLION PLACES | `recvxDMFHNSckK` | [`nd2aaJ9AQjA`](https://www.youtube.com/watch?v=nd2aaJ9AQjA) | XGALX原官方公告及艺人视频明确the first HOWL东京巨蛋巡演终场。 |

ILLIT同一Weverse Con视频被两个既有作品ID引用，因此19项对应18个视频；这里保留原ID，不合并记录。NewJeans与IVE的整场章节虽有明确起止，仍然来源于音乐节，不因切成单曲而满足新场合要求。

## 23项需核活动性质或特殊节目范围

| 团体／作品 | workId / 视频ID | 待核点 |
|---|---|---|
| KISS OF LIFE · Bad News | `rec28ldfRTrBcK` / `5C2YqvRFbDc` | MMA2023颁奖礼祝贺演出；不是普通周播打歌，是否保留需按新范围处理，未擅称演唱会。 |
| KISS OF LIFE · Nothing | `rec28ldfRTrMcf` / `6TgOZTsJ9ro` | 艺人官方Media Showcase，明确展示会，不是普通打歌/练习室。 |
| KISS OF LIFE · Who is she | `rec28ldfRTrMIP` / `uESHVS-PBpE` | 艺人官方Media Showcase，明确展示会，不是普通打歌/练习室。 |
| ITZY · BET ON ME | `recvxyOz5XJvBE` / `DxPNHmdEAUY` | 艺人官方SHOWCASE，需区分媒体/粉丝活动与棚录。 |
| i-dle · Blow Your Mind | `recvxyOz5X4npx` / `TengT6urQFI` | Yonhap原始报道的媒体Showcase Stage，需按新范围复核。 |
| i-dle · DUMDi DUMDi | `recvxyOz5XLh4T` / `H_HKE1mwzuo` | 艺人ONLINE MEDIA SHOWCASE，线上媒体展示不自动等同演唱会，也非练习室。 |
| i-dle · HWAA | `recvxyOz5XybW2` / `55TEB82zfVk` | 艺人ONLINE MEDIA SHOWCASE，需依新范围复核。 |
| i-dle · Where Do We Go | `recvxyOz5XN2pg` / `KLxtOB-T-qI` | 逢い-dle命名活动，现有说明只列社媒，缺活动性质；疑似粉丝活动需查公告。 |
| i-dle · Wife | `recvxyOz5Xg5or` / `sj8jWrOGmjM` | YONSEI UNIVERSITY现场标题；应核具体大学活动公告，不能仅凭学校名断言音乐节。 |
| NewJeans · GODS | `recvxyOz5XqKXj` / `uiz7EsMPsuw` | Worlds2023总决赛开幕式，明确赛事活动演出，非音乐打歌或练习室；按新范围复核，不误称单团演唱会。 |
| IVE · ELEVEN | `recvxyHuKM1bdl` / `dHdABwhhDj8` | 2021 KBS Song Festival年末特别节目，非普通Music Bank；需区分电视年末节目与演唱会要求。 |
| IVE · LUCID DREAM | `recvxyHuKM9jTG` / `hK756ZnBNr0` | 官方标题只说Tokyo Dome Special Clip；疑似演唱会，但已读摘录不足以判定完整活动性质，应查具体演出公告。 |
| ILLIT · I Got Your Back (Feat. JISOO, MOMOKA of HANA) | `rec28ldfRTrKFT` / `dp18Jb3cK8s` | PRESS START命名活动，需查主办/场次性质，不能当普通节目。 |
| ILLIT · 時よ止まれ (Toki Yo Tomare) | `rec28ldfRTrKdZ` / `oUDNUv7D3n8` | GLITTER DAY IN JAPAN命名活动，需核是否见面会/演唱会及录制条件。 |
| ILLIT · 비밀찾기 (Secret Quest) | `rec28ldfRTrLJK` / `BYhw_ZuAbPc` | 2025 MBC GayoDaejejeon年末特别节目FullCam，非普通周播；新范围适用性待核。 |
| IZ*ONE · Beware | `recvxyH5pza6ks` / `7drR1Jm8jr4` | KCON:TACT线上活动，需区分虚拟制作/舞台录制与演唱会，不能仅凭KCON词等同露天收音。 |
| LOONA · Star | `recvxyOz5XLBUV` / `bMkttyH8McQ` | KCON:TACT线上活动，需查录制形式与用户收音要求。 |
| MADEIN · BLUE | `rec28ldfRTrPab` / `CTWubB07qto` | 143 FREAL LIVE活动，现有元数据未明确是演唱会还是专门制作；待核。 |
| MEOVV · In my hands | `rec28ldfRTrJDu` / `3G77VQ3suEE` | M COUNTDOWN X MEGA CONCERT混合品牌；虽有节目期号，需确认是否活动舞台而非普通棚录。 |
| QWER · Discord | `rec28ldfRTrEQV` / `80LpOAf5VCY` | 媒体原始Showcase录像，非普通打歌/练习室。 |
| Rocket Punch · Fiore | `recvxyH5pzVSjp` / `1c2iWCVULoE` | 日媒记者展示现场，标题明确在媒体前首次表演；新范围适用性待核。 |
| UNIS · ギミサマ☆(GimmeSummer☆) | `recvxIZLpETQNx` / `kwqBkjVS8wY` | CLUB CITTA UNI Sparkle Special Showcase，需区分粉丝/媒体展示及收音要求。 |
| YOUNG POSSE · ㄱㅓ리에서... (With. 존박) | `rec28ldfRTrGwK` / `QsOnTCwooDs` | MEN CONCERT是系列名或现场活动尚未核清，旧类型写录音棚；不能见CONCERT就判定巡演。 |

## 8项上下文不足

| 团体／作品 | workId / 视频ID | 现有标题 |
|---|---|---|
| ITZY · Algorhythm | `recvxyOz5X8JOE` / `TuP6PXGIuPo` | ITZY 「Algorhythm」Live Performance |
| ITZY · Break Ice | `recvxyOz5XEQxy` / `B8lpa34sryk` | 둘째이모 김다비 X ITZY (있지) - 얼음깨 (Break Ice) XR 라이브 @ 네이버 NOW. [2021년 잘잘잘] |
| Kep1er · I do! Do you? | `recvxyOz5XCVRl` / `mJqtCswL5V0` | [최초공개] Kep1er(케플러) - I do! Do you? (4K) |
| BEWAVE · SING ! | `rec28ldfRTrGEy` / `j1a4xi__JgE` | BEWAVE 'SING !' Live Clip |
| PURPLE KISS · Can We Talk Again | `recvxyH5pzTspK` / `I5tNnkuCEFU` | [LIVE] 퍼플키스- 'Can We Talk Again' ㅣ오래 기다리셨습니다. 통컬에서 처음 선보이는 스페셜 라이브🎤💜 [통통컬처] |
| Rocket Punch · FLASH | `recvxyH5pzb37S` / `bMPpZlok6aU` | 'FLASH' Special Stage - 로켓펀치(Rocket Punch) |
| Weeekly · Check It Out | `recvxyH5pzj7Wt` / `76_n_Z8loY8` | Play Game with Weeekly! : Stage #2 Check It Out |
| Billlie · RING X RING | `recvxyH5pzBi6D` / `wBMRRQKEweU` | 'HOT DEBUT' 미스테리 아우라 'Billlie'의 'RING X RING' 무대 |

## 明确撤回的三个研究推荐

QWER `l9GLV8Kd-MU`、NewJeans `saY9KS7mKvI`、ITZY `BnmwjH-suLg` 均不在这482项已选视频中；它们是此前研究候选，用户已明确否决，不再推荐。ITZY这一个练习表演候选被否决，不等于排除所有练习室版本。

## 后续实施边界

先为19项明确活动来源寻找常规打歌或艺人练习室替代，再逐项核23项特殊/活动来源。其余源按真实类型分列，不能为了报高完成率一概标合格。候选仍需同曲、同语种／编配、准确成员范围和完整单曲；串烧、片段、单人focus不直接替代。

替换前由主任务owner只读核原评分及绑定；已有分数保留原精确来源，不让新视频继承旧分值。缺少合格替代时留研究任务，不删除源造成含义丢失。本轮新增的是来源类型问题和替换队列，不能把19或23机械加入旧123后宣称所有不同ID都“没有舞台”。

全部482逐项记录已覆盖；此次不声称全网穷尽、官方身份重新全量校验、完整音画复验或用户视觉验收。选源数据和原评分保持，GitHub文档同步由主任务处理，正式站未因本审计改变。
