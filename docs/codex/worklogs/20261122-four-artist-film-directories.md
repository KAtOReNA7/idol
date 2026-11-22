# IVE、QWER、PURPLE KISS 和 ILLIT 的作品入口

四团均按访客进入作品目录时首先看到的实际图片核对。IVE 的《LOVE DIVE》页面在 1425 px 正文宽度已经可以完整看见第一张片图。站内综合栏目英文改为 MUSIC，保留已验收的深蓝银色页面。2022 年 STARSHIP 官网用 ALBUM 指发行，本站同一栏目还提供 MV 与舞台。现行长页设计稿同步把影像导航、MV 展示和其他影像放在专辑前。桌面稿中 MV 容器从内容顶端 384 px 开始，发行在 5684 px；手机分别为 415 和 12195 px。[2022 年 STARSHIP 官网](https://web.archive.org/web/20220414055634id_/http://www.starship-ent.com/profile/musician/ive.php) · [官方《LOVE DIVE》发行页](https://ive-official.jp/mob/news/diarKijiShw.php?site=DIVE&id=156860) · [桌面长页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1267-1167) · [手机长页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1267-1175)

| 团体 | 采用的素材与版式 | 作品目录设计 |
| --- | --- | --- |
| QWER | 日本官网把日期、发行类型与作品名放在醒目位置。《Our Voyage》《SHOW DOWN》等按日期与片名逐行陈列，每张封面直接进入本版。沿用乐队黑橙色和本站已有的 League Spartan。[日本发行官网](https://qwerjapan.com/discography/detail/7814/) | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1934) · [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1966) |
| PURPLE KISS | Melon 发行专题展示《Zombie》的 MV 拍摄现场和《HIDE & SEEK》画报。作品目录沿用既定的紫、荧光绿和照片印相边。当前两版《DOREMI》分别展示英文或韩文版本、日期、对应缩略图与独立入口。[《HIDE & SEEK》同期发行专题](https://m.melon.com/musicstory/detail.htm?mstorySeq=11666) · [Victor 官方发行索引](https://www.jvcmusic.co.jp/-/Discographylist/A026967.html) | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1994) · [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-2022) |
| ILLIT | BELIFT《SUPER REAL ME》页面列出主影像、REAL ME 与 SUPER ME 影片等独立版本。本站沿用蓝色窗口与像素字形，首项展示大图，其余影片并列在侧边，手机改为纵向。本团韩文特别视频和原版《I Got Your Back》保持各自的图片、名称与记录。[BELIFT 官方发行页](https://beliftlab.com/artist/discography/ILLIT/8?lang=en) | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-2050) · [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-2080) |

六张新画稿采用 24 处准确视频预览图及六处官网团标。目录保留歌曲顺序和各自作品、节目、评分的原有绑定。站内实际图片替代文字使用具体作品版本，搜索、无结果、书签和返回继续接受原有网址。[六张设计](../evidence/20261122-four-artist-film-directories/designs.webp)

同一 Codex 内置浏览器对照正式 v246 和本机候选。在 844 px 高的视口内，第一张封面距顶位置越小，访客越早看到实际可点内容。可见作品数计入部分可见的图。[改前](../evidence/20261122-v247/four-other-catalogs-before.json) · [本机复验](../evidence/20261122-v247/four-other-catalogs-local.json)

| 正文宽度 | 团体 | 首图距顶（px） | 首图实际可见高度（px） | 首屏可见作品数 |
| ---: | --- | ---: | ---: | ---: |
| 375 | IVE | 477 → 477 | 190 → 190 | 1 → 1 |
| 375 | QWER | 644 → 312 | 190 → 77 | 1 → 4 |
| 375 | PURPLE KISS | 645 → 303 | 174 → 87 | 1 → 6 |
| 375 | ILLIT | 632 → 311 | 190 → 191 | 1 → 3 |
| 1425 | IVE | 507 → 507 | 222 → 222 | 3 → 3 |
| 1425 | QWER | 786 → 315 | 58 → 186 | 2 → 3 |
| 1425 | PURPLE KISS | 720 → 292 | 124 → 217 | 3 → 6 |
| 1425 | ILLIT | 706 → 293 | 138 → 374 | 3 → 4 |

四团目录共有 25、7、13、21 张主作品卡。逐团每张使用一张对应封面，两宽均未产生横向溢出。手机的 QWER 和 PURPLE KISS 用较小封面换来整屏多个可选作品，ILLIT 第一张仍为大图。

v247 正式上线后，四团两宽的第一张封面位置及首屏作品数均与上表相同，首屏所有图片已解码。IVE 的综合导航两宽都显示 MUSIC。另在 QWER 和 ILLIT 的 375 px 正文、PURPLE KISS 的 1425 px 正文，分别将搜索缩到零结果并清除，恢复 7、21、13 张作品卡。三次点开 MV 或舞台均到达所选作品，返回后恢复该入口焦点。三页实际顺序均为 MV 在前、唱片在后。[正式站两宽](../evidence/20261122-v247/catalogs-formal-fold.json) · [三团搜索与返回](../evidence/20261122-v247/catalogs-formal-flows.json)
