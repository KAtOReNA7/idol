# 两张日语版舞台封面及十首作品的节目资料

2026-11-21。在开发分支上的 32 张专项封面基础上补齐两张。十项定向核验各有一条公开资料，其中五条新增、五条补充。作品页共提供 28 个来源链接，舞台目录仍为 527 条。[逐项证据、指纹与核验范围](../evidence/20261121-broadcast-research/review.json)

## 舞台封面

| 作品 | 采用画面 | 页面绑定 |
|---|---|---|
| STAYC《Teddy Bear》日语版 | 《Premium MelodiX!》19:14 的六人舞台全景，画面保留节目角标和曲名 | 仅适用 BV1bo4y1x7LV 的 P1，CID 1115512650，已审单曲时段 18:05–21:13。[原节目](https://www.tv-tokyo.co.jp/melodix_premium/backnumber/202305.html) · [取帧](../evidence/20261121-broadcast-research/teddy-bear-japan-p1-1154s.jpg) |
| IVE《ELEVEN》日语版 | 《MUSIC STATION》P1 02:18。该分 P 内还包含成员介绍与 MV 插段，选取了舞台开始后的队形 | BV19D4y1r7c6 的 P1，CID 867429881。P2 和 P3 各有不同 CID。[原节目](https://post.tv-asahi.co.jp/post-198780/) · [取帧](../evidence/20261121-broadcast-research/eleven-japan-p1-138s.jpg) |

两张图均从指定分 P 的 480p 视频元素定位取帧。按播放器显示比例保留为 853 × 480，WebP 共 184,156 字节。测试逐个更换作品、视频分 P、CID 及区间确认封面适用范围，并验证实际播放器的图片、观看入口与完整显示比例。[发布素材清单](../../../apps/idol-site/data/stage-broadcast-posters-20261121.json)

## 作品页的节目资料

| 作品 | 页面可以查到的内容 |
|---|---|
| QWER《FAKE IDOL》 | 查看双曲演奏的原稿与转载。以 B 站 P1 的画面曲名及音轨定位，约 0:21 起演奏本曲，3:00 转场，3:29 起为第二曲。 |
| YOUNG POSSE《YOUNG POSSE UP》 | 可对照改编混音单曲的合作与编舞署名、团体的较短编舞版。三位合作歌手在影片中的逐人出镜情况仍待核实。 |
| ODD YOUTH《Best Friendz》 | 增加 KBS 2025-01-17《Music Bank》单曲舞台，可与公司的英语编舞版、原 Brand MV 对照。两条 KBS 官方上传的三个预览位置分别逐字节一致。 |
| IZ*ONE《Buenos Aires》 | 区分 2019-06-21 朝日《MUSIC STATION》和 07-06 富士《MUSIC FAIR》。后者的独立片段可用服饰和舞台布景与官网剧照比对。 |
| WOOAH《Shining On You》 | 韩国文化院活动公告和 Koreanet 原稿明确 Side B 为活动解锁的 MV 版本。 |
| Weeekly《Happy Christmas》 | 比较 YAOKI 的 Special Video 与 1theK 发行版，三个预览位置依次出现相同镜头。整片一致性及独立舞台仍待核实。 |
| aespa《Welcome To MY World》 | 提供 JTBC 的节目片段与 Golden Disc 同场全景，四位成员可见。nævis 在节目声轨中的参与范围仍待核实。 |
| aespa《KISS N TELL》 | 交叉核对日本官网、NTV 节目单、播出时刻及转载视频 1。该段约 2:44，画面可见四位成员和伴舞。 |
| LE SSERAFIM《FEARLESS》日语版 | NTV 合集 P1 单独收录本曲，片长约 2:50，P2 为《Blue Flame》。 |
| IVE《WAVE》 | 绑定原舞台处可查到 2023-05-26《MUSIC STATION》六人版本及 REI 回归报道。六人场在 P1，P2 的标题对应五人场。 |

资料按作品 ID、团体 ID 与原 MV ID 投递。《WAVE》的附注还要求原有舞台的精确来源键。音乐节目单、唱片署名、部分画面、音轨与完整观看分别按实际材料说明。无需替换评分绑定即可从作品页查阅这些来源。81 项待新证据的内容和 19 项已取消的必填项沿用已采纳的逐项处置。[作品页公开文字与来源](../../../apps/idol-site/data/stages/research-followups-20261121.json) · [研究队列](../evidence/20261121-repository-and-routes/content-disposition.json)

《Buenos Aires》《Shining On You》《Happy Christmas》《KISS N TELL》的舞台页此前只提供了返回 MV 的按钮。这四页现在可在视频位置直接选择“查看资料与来源”，展开资料并将键盘焦点移至标题。已有其他表演的作品继续在相同位置提供观看入口。

## 验证

Windows 下运行了六个相关测试文件，38 项全部通过。覆盖新增精确封面、来源变化、非匹配作品、相邻历史资料、公开数据投递和真实播放器服务端渲染。节目核验使用匿名来源，未操作私人评分或保存日志。[验证记录](../evidence/20261121-broadcast-research/review.json)

在本地正式构建和隔离合成 D1 上，用 Chromium 以 390 × 900、1440 × 900 打开十首作品的舞台页，分别展开来源，逐条核对 28 个链接和文字。四首仅有资料的作品在两宽共 8 次按 Enter 展开成功，焦点均落在标题。另打开两首已有正式舞台的作品，在两宽共 4 次解码出 853 × 480 的新封面并核准原分 P 外链。共 24 次浏览，页面异常 0 次。[逐页浏览与显示尺寸](../evidence/20261121-broadcast-research/browser.json)

发布前从正式站匿名回读 614 首作品、500 个舞台。此次十首作品的公开资料说明当时为 0 条。以相同的两个视口打开正式站，STAYC 日版《Teddy Bear》只显示标题和外链，IVE 日版《ELEVEN》处于暂无舞台状态。[两个正式页面前像与十项资料基线](../evidence/20261121-broadcast-research/production-before.json)
