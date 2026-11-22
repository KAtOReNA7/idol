# 舞台筛选里的 59 张卡

在 v244 正式站的 375 px 目录中，VVUP 6 张、LOONA 9 张、STAYC 14 张、NMIXX 16 张、KiiiKiii 8 张、SAY MY NAME 6 张。访客点封面、歌曲标题或主操作，59 张都会进 MV。找到次入口才会打开舞台。KISS OF LIFE 的另外 24 张有单独修复和回执。[v244 正式基线](../evidence/20261122-v245/formal-before.json) · [KISS OF LIFE 同版核验](../evidence/20261122-kiof-stage-catalog/same-video-51-groups.json)

v245 候选的六团实际目录上，59/59 张首个链接都打开该作品的舞台。卡上采用该次演出的封面、发布标题、频道与日期，显示整体舞台分。STAYC 日版《Teddy Bear》沿用《Premium MelodiX!》分 P 及对应区间的节目画面，并说明此场尚无站内高清。LOONA 的「舞台」页签同步到地址，打开节目再返回可继续浏览原筛选。MV 和未分类目录保留原有入口。[六团产品组件](../../../apps/idol-site/components/artist-stage-directory-card.tsx) · [回归](../../../apps/idol-site/tests/artist-film-primary.test.cjs)

| 团体 | 代表录制 | 桌面、375 px 画稿 |
| --- | --- | --- |
| VVUP | Doo Doom Chit · M COUNTDOWN EP.833 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-1265) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-1277) |
| LOONA | Butterfly · M COUNTDOWN EP.607 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-2902) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-2914) |
| STAYC | SO BAD · SBS Inkigayo | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-2927) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-2939) |
| NMIXX | Roller Coaster · 官方表演版 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3539) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3551) |
| KiiiKiii | I DO ME · 1theK | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3564) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3576) |
| SAY MY NAME | WaveWay · STUDIO CHOOM | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3681) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1570-3693) |

从 12 幅可编辑画稿读回标题、评分、主操作及实际封面。六幅手机画稿导出后逐张检视节目图、字号与按钮。[六团手机画稿](../evidence/20261122-stage-directory-targets/six-mobile-designs.webp)

横查用公开目录、真实路由和三团原生渲染器。51 团注册路由共有 47 个独立舞台筛选，其余四团检查明确标为舞台的入口。535 个入口中，474 个直接打开作品舞台，44 个通过本次演出的团内详情到达站内舞台，17 个打开独立演出资料。首个入口错开 MV 共 0 个。17 个资料页分布在 AtHeart、ODD YOUTH、W!TCHX、SPIA、IVE 和 BADVILLAIN。目录核对计的是页面去向，播放解码另行实测。[逐团账目](../evidence/20261122-stage-directory-targets/groups.json) · [可复跑脚本](../../../apps/idol-site/scripts/audit-artist-stage-cards.cjs)

六团源码和 KISS OF LIFE、ADYA 所在的目录专项共 27/27 通过，覆盖正常舞台、MV 分 9.5 与舞台分 0、来源变化、仅供观看的现场和带搜索与队列的返回。横查还发现 VCHA 4 个、HITGS 5 个已绑定录制的详情先显示 YouTube 跳转，站内观看在其后。AtHeart 的 10 个演出版本有 2 个能准确对应现有舞台，其余单独核原片。三团另行调整入口。
