# 全团统一审阅：修复与遗留问题

[打开v2私密只读审阅](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups) · [Draft PR #33](https://github.com/KAtOReNA7/idol/pull/33)

111专项测试、类型和正式构建通过；42新增图远端SHA全部一致，153发布模式内页无坏图/错误占位/溢出。线上服务身份核心流程通过，用户IAB读取超时。等待统一人工验收。

范围：51团；Weeekly确认后的剩余开发、索引匹配、资料和图片补缺。基线为10afded，工作分支codex/all-groups-index-audit。正式主站v186与旧审阅站未覆盖。

## 已解决

|问题|完成内容|
|---|---|
|索引与实际团页风格不符|替换32个过时方向，微调6个（含IVE），保留13个已匹配入口；主图、字体与色彩承接当前团页。|
|NewJeans作品目录不全|保留25个既有MV版本，补17张精确视频预览与Zero曲目。|
|VVUP发行与历史照片缺失|补4张封面、7张视频预览、Hyunny官方历史照；历史成员不提升为现成员，照片接入个人手帐。|
|SAY MY NAME发行详情缺图|补7张官网封面；保留SOHA单人OST与剧集封面语义。|
|fromis_9张圭悧历史图缺失|补PLEDIS供图/Ilgan Sports具名新闻原图，标注历史照片。|
|Billlie查看原图实际打开展示WebP|七成员改用已保存原JPG。|
|UDTT路径与经历描述|兼容目录/index入口；陆雨婷精确入团日留空，以本人专访事件展示；主办方宣传照不再冒称专辑概念照。|
|ITZY审阅成员照依赖无法调用的API|取得既有JYP具名URL的5张原始响应图，团页/手帐直接读取，保留旧媒体身份。|
|统一站样式冲突、时间轴假空态|按团隔离CSS，注入实际时间轴；修复keyed图片未转换远端地址。|

新增42张公开原字节图片（NewJeans17、VVUP12、SAY MY NAME7、fromis_9 1、ITZY5），未重编码。UDTT素材单独留在私密包，陆雨婷历史图不替换成旧错误头像。

## 尚未解决或未验

- 133项作品（39团）没有本地快照参演关系；包含分队、独唱、合作、动画和不同版本，不能批量推定全员参演。下面给出精确名单。Billlie ZAP尤其需要与实时数据核对，已有历史关联批次可能晚于快照。
- BADVILLAIN《HURRICANE》rec28ldfRTrEng的精确视频URL仍为空；音源和同名预出道表演没有混填。
- 14项时间轴hold事件来源不足，保持隐藏。VVUP《4 Life》独立发行日、陆雨婷精确入团日等未证实事实仍保留未知。
- Figma全量字体/像素保真未完成。此次沿用现有51团设计与共享手帐功能，索引承接其风格；不宣称全团官网重做。
- 真实生产资料API、真实保存、全部视频实际播放、80%/125%原生浏览器缩放、完整用户IAB登录会话仍需后续验证。只读审阅不替代这些验证。

## 检查范围与证据

- 51真实路由、338成员、614原生作品、2828关系：ID重复和结构断链均0；605具名作品，9历史空占位未擅自赋名。
- 51原始时间轴结构校验通过，609 ready / 14 hold；新单团公开补充时间轴按其当前文件展示。
- 本地Chrome：51团×桌面1440/手机390首页；全部51团成员/作品/时间轴桌面点击；153对应手机内页；51索引逐一进入51不同团页、搜索、手机索引。
- 初次仅检查img失败会漏掉已替换成error占位的照片，因此追加error占位检查，发现并修复ITZY五图。不能将早期扫描解释为当时没有任何缺图。
- Browser plugin未提供，使用本机Playwright/Chrome；线上部署和用户会话情况在最终worklog单列。

## 设计沿用与来源披露

保留基线10afded中各团已认可或待统一验收的页面设计；其历史来源和官网差异继续有效。共享手帐沿用既有布局/路由/只读能力。以下37个索引入口按当前团页修改；来源为本轮源码盘点追溯到的参考，不代表本轮逐一完整打开官网或逐像素复制。

|团体|沿用页面组件|参考入口|
|---|---|---|
|MEOVV|`components/candidate/meovv-design.tsx`|[来源1](https://en.tblshop.com/meovv/profile.html)|
|izna|`components/izna/editorial.tsx`|[来源1](https://wake-one.com/en/artists/izna/)|
|tripleS|`components/candidate/triples-design.tsx`|[来源1](https://www.triples-official.jp/profile/)|
|MADEIN|`components/candidate/madein-design.tsx`|[来源1](https://www.madein-official.net/)|
|ifeye|`components/ifeye/editorial.tsx`|[来源1](https://www.hihat.co.kr/eng/artist/458)|
|GENBLUE|`components/genblue/bluecut-experience.tsx`|[来源1](https://www.tenentcorp.com/pages/genblue)|
|RESCENE|`components/candidate/rescene-design.tsx`|[来源1](https://themuze.kr/rescene)|
|UNIS|`components/design-review/unis-design-review.tsx`|[来源1](https://www.unv-jp.com/ja/articles/dJPdStB6njkXP8nwfksZmE)|
|BADVILLAIN|`components/candidate/badvillain-design.tsx`|[来源1](https://music.bugs.co.kr/artist/20212684)|
|QWER|`components/candidate/qwer-design.tsx`|[来源1](https://qwerjapan.com/news/2/)|
|VVUP|`components/vvup-artist.tsx`|[来源1](https://weverse.io/vvup/highlight?hl=ko)|
|YOUNG POSSE|`components/youngposse-artist.tsx`|[来源1](https://youngposseofficial.jp/profile)|
|BEWAVE|`components/bewave-artist.tsx`|[来源1](https://bewave.bstage.in/community/board/66f006fbfdbe825318d0519e/post/670a71aa813c344c968ab3c0)|
|Candy Shop|`components/candyshop-artist.tsx`|[来源1](https://candy-shop.jp/about)|
|ODD YOUTH|`components/oddyouth-artist.tsx`|[来源1](https://www.itopgroup.com/bbs/page.php?hid=ODDYOUTH)|
|ADYA|`components/adya-artist.tsx`|[来源1](https://prtimes.jp/main/html/rd/p/000001548.000003711.html)|
|Geenius|`components/geenius-artist.tsx`|[来源1](https://www.geeniushome.com/geenius)|
|TRACER|`components/tracer-artist.tsx`|[来源1](https://www.gleammedia.co.kr/artist)|
|W!TCHX|`components/witchx-artist.tsx`|[来源1](https://kpopmedia.co.kr/#artists) / [来源2](https://music.bugs.co.kr/artist/20222498)|
|SPIA|`components/spia-artist.tsx`|[来源1](https://world.kbs.co.kr/service/contents_view.htm?board_seq=451476&id=&lang=k&menu_cate=enternews) / [来源2](https://v.daum.net/v/pVzp4ekPJ0)|
|UDTT|`components/candidate/udtt-native-design.tsx`|[来源1](https://prtimes.jp/main/html/rd/p/000000006.000170584.html)|
|VCHA|`components/vcha-artist.tsx`|[来源1](https://www.universalmusic.com.br/2024/03/15/o-grupo-de-pop-feminino-vcha-faz-o-lancamento-duplo-de-only-one-e-favorite-girl/)|
|HITGS|`components/hitgs-artist.tsx`|[来源1](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15198)|
|AtHeart|`components/atheart-artist.tsx`|[来源1](https://atheart.me/) / [来源2](https://atheart.jp/contents/menu/176621)|
|i-dle|`components/candidate/idle-design.tsx`|[来源1](https://i-dle.cubeent.co.jp/profile/)|
|IZ*ONE|`components/candidate/izone-design.tsx`|[来源1](https://smart.mnetjp.com/profile/camtPhKL7AaZcltSDFILdS) / [来源2](https://web.archive.org/web/20210103153505/http://iz-one.co.kr/) / [来源3](https://music.bugs.co.kr/artist/20067467/albums) / [来源4](https://iz-one.co.kr/20191103/) / [来源5](https://www.melon.com/musicstory/inform.htm?mstorySeq=10961) / [来源6](https://world.kbs.co.kr/service/contents_view.htm?board_seq=351078&id=&lang=j&menu_cate=artist)|
|fromis_9|`components/candidate/fromis9-design.tsx`|[来源1](https://fromis9.fanpla.jp/) / [来源2](https://fromis9.fanpla.jp/news/2/) / [来源3](https://music.bugs.co.kr/artist/20047596/albums)|
|LOONA|`components/candidate/loona-design.tsx`|[来源1](https://www.universal-music.co.jp/loona/biography/)|
|EVERGLOW|`components/candidate/everglow-design.tsx`|[来源1](https://www.chxxta.com/everglow) / [来源2](https://everglow.bstage.in/) / [来源3](https://music.bugs.co.kr/artist/20076399/albums) / [来源4](https://www.einpresswire.com/article/847656903/everglow-signs-an-exclusive-contract-with-chxxta-company)|
|Rocket Punch|`components/candidate/rocketpunch-design.tsx`|[来源1](https://www.woolliment.com/album/boom) / [来源2](https://weverse.io/rocketpunch/notice) / [来源3](https://music.bugs.co.kr/artist/20088588/albums) / [来源4](https://prtimes.jp/main/html/rd/p/000000997.000029501.html)|
|Cherry Bullet|`components/candidate/cherrybullet-design.tsx`|[来源1](https://fncent.com/CherryBullet) / [来源2](https://fncent.com/?bid=album&m=bbs&ma_cate=1&ma_lang=1&mod=view&r=CherryBullet&uid=55694) / [来源3](https://fncent.com/CherryBullet/b/gallery/55485) / [来源4](https://music.bugs.co.kr/artist/20074110/albums)|
|Weeekly|`components/candidate/weeekly-design.tsx`|[来源1](https://weverse.io/weeekly/highlight) / [来源2](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428) / [来源3](https://music.bugs.co.kr/artist/20110282/albums) / [来源4](https://weverse.io/weeekly/media/2-144406028) / [来源5](https://prtimes.jp/main/html/rd/p/000000006.000117603.html)|
|WOOAH|`components/wooah/editorial.tsx`|[来源1](https://wooahjapan.jp/profile/)|
|PURPLE KISS|`components/candidate/purplekiss-design.tsx`|[来源1](https://www.jvcmusic.co.jp/-/Profile/A026967.html)|
|Billlie|`components/candidate/billlie-design.tsx`|[来源1](https://billlie.jp/profile/)|
|Kep1er|`components/design-review/kep1er-design-review.tsx`|[来源1](https://wake-one.com/en/artists/kep1er/)|
|NewJeans|`components/candidate/newjeans-design.tsx`|[来源1](https://www.newjeans.jp/profile/)|

另14个专属入口继续沿用对应团页视觉：BABYMONSTER、ILLIT、XG、aespa、IVE、KISS OF LIFE、STAYC、NMIXX、Hearts2Hearts、KiiiKiii、ITZY、LE SSERAFIM、SAY MY NAME、KATSEYE。IVE仅校正索引标题色。

这些专属卡片的资料/视觉来源入口如下。沿用的自有排版、目录、索引和手帐属于项目扩展；未把资料官网当作逐像素设计验收。

|团体|既有参考入口|
|---|---|
|BABYMONSTER|[官网/官方资料](https://www.ygfamily.com/en/artists/babymonster/profile)|
|ILLIT|[官网/官方资料](https://beliftlab.com/artist/profile/ILLIT?lang=en)|
|XG|[官网/官方资料](https://xgalx.com/en/xg/profile/)|
|aespa|[官网/官方资料](https://aespa-official.jp/)|
|IVE|[官网/官方资料](https://ive-official.jp/mob/pageShw.php?site=DIVE&cd=profile)|
|KISS OF LIFE|[官网/官方资料](https://columbia.jp/artist-info/kissoflife/prof.html)|
|STAYC|[官网/官方资料](https://www.highup-ent.com/en/stayc/)|
|NMIXX|[官网/官方资料](https://nmixx.jype.com/profile)|
|Hearts2Hearts|[官网/官方资料](https://hearts2heartsofficial.jp/profile/)|
|KiiiKiii|[官网/官方资料](https://www.starship-ent.com/musician/kiiikiii?page=1&tab=1)|
|ITZY|[官网/官方资料](https://itzy.jype.com/profile)|
|LE SSERAFIM|[官网/官方资料](https://www.sourcemusic.com/artist/profile/LE%20SSERAFIM)|
|SAY MY NAME|[官网/官方资料](https://saymyname.jp/profile/)|
|KATSEYE|[官网/官方资料](https://www.katseye.world/story-of-katseye/)|

## 缺少快照参演关系的精确作品

|团体|数量|作品（稳定ID）|
|---|---:|---|
|MEOVV|3|BODY (`rec28ldfRTrJ7M`)；LIT RIGHT NOW (`rec28ldfRTrJne`)；Hit 'Em (`rec28ldfRTrLsE`)|
|izna|3|BEEP (Japan Edition) (`rec28ldfRTrNsK`)；SASS & Racecar (`rec28ldfRTrNBu`)；Love All (`rec28ldfRTrNO2`)|
|tripleS|13|Cherry Gene (`rec28ldfRTrO2v`)；Just Do It (`rec28ldfRTrO81`)；Inner Dance (`rec28ldfRTrOdD`)；Password (`rec28ldfRTrOnV`)；Bubble Gum Girl (`rec28ldfRTrOs2`)；Cameo Love (`rec28ldfRTrOyh`)；Christmas Alone (`rec28ldfRTrOCl`)；Fly Up (`rec28ldfRTrOGv`)；Q&A (`rec28ldfRTrOKC`)；Baby Flower (Japanese Ver.) (`rec28ldfRTrOTb`)；Dream Dress (`rec28ldfRTrOXn`)；DNA (`rec28ldfRTrP1t`)；Welcome to Heaven (`rec28ldfRTrP5H`)|
|MADEIN|4|DADARIDA (`rec28ldfRTrCzF`)；DOPAMINE (`rec28ldfRTrCDJ`)；BLUE (`rec28ldfRTrPab`)；PUNG! (`rec28ldfRTrPi9`)|
|ifeye|2|Hazy (Daisy) (`recvxIZFknJ2Rq`)；loverfory (`recvxIZFpVLU0R`)|
|GENBLUE|1|夜市王 Night Market Queen (`recvxIZLjZmGMf`)|
|UNIS|2|もしもし♡ (MoshiMoshi♡) (`rec28ldfRTrQ4z`)；ギミサマ☆(GimmeSummer☆) (`recvxIZLpETQNx`)|
|BADVILLAIN|2|HURRICANE (`rec28ldfRTrEng`)；+82 (`rec28ldfRTrEsc`)|
|QWER|2|Our Voyage (`recvxIZLpET3tB`)；SHOW DOWN (`recvxIZRWKy9zg`)|
|VVUP|3|4 Life (`rec28ldfRTrFGi`)；House Party (`recvxIZLpEd8EW`)；Super Model (`recvxIZLpEopO1`)|
|YOUNG POSSE|5|Scars (`rec28ldfRTrGou`)；ㄱㅓ리에서... (With. 존박) (`rec28ldfRTrGwK`)；Pilot2 (`recvxIZY0lR25A`)；GO해 (`recvxIZY0lPdWr`)；미스터 2026 (`recvxJ03dOg1Gc`)|
|BEWAVE|1|SING ! (`rec28ldfRTrGEy`)|
|ADYA|1|RIZZ (`rec28ldfRTrHhL`)|
|TRACER|1|365 (`rec28ldfRTrPq2`)|
|VCHA|3|Little Miss (`recvxIZFpVFeiL`)；Tweak (`recvxIZFpVtElQ`)；CHAT (`recvxIZFpVm8cn`)|
|HITGS|7|A-HA! (`recvxIZnNLkXMl`)；GROSS (`recvxIZnNLuycR`)；HAPPY (`recvxIZnNLgpyC`)；CHARIZZMA (`recvxIZxXupyDR`)；Cherry Blossom (`recvxIZy35Xwr7`)；Little By Little (`recvxIZy35rUeY`)；Gulliver! (`recvxIZy3525BF`)|
|AtHeart|1|Butterfly Doors (`recvxIZy35ZBcF`)|
|IZ*ONE|1|D-D-DANCE (`recvxyH5pzi1oo`)|
|fromis_9|1|Touchdown (`recvxyOz5XFVzt`)|
|LOONA|1|LUMINOUS (`recvxyOz5XueI9`)|
|Rocket Punch|2|Ring Ring (`recvxyH5pzuYEC`)；ドキドキLOVE (`recvxyH5pzA9lj`)|
|Weeekly|3|Love (`recvxyH5pzoaOZ`)；Stranger (`recvxyH5pzr7Nc`)；Stranger (`recvxyH5pzV22X`)|
|WOOAH|3|WXW (Wish With W) (`recvxyH5pzrrSO`)；SUMMER (`recvxyH5pzQxpW`)；VOODOO DOLL (`recvxIYG1FSCws`)|
|PURPLE KISS|2|DOREMI (`recvxyH5pzFAPL`)；Breath (`recvxyH5pz4ojC`)|
|Billlie|2|GingaMingaYo (the strange world) (`recvxyH5pzbYAm`)；ZAP (`recvxyH5pz722q`)|
|NewJeans|3|Beautiful Restriction (`recvxyOz5Xr917`)；GODS (`recvxyOz5XqKXj`)；Be Who You Are (Real Magic) (`recvxyOz5XQZhy`)|
|BABYMONSTER|4|MOON (`rec28ldfRTrLcE`)；LIKE THAT (`rec28ldfRTrLgo`)；BILLIONAIRE (`rec28ldfRTrLku`)；Ghost (`rec28ldfRTrLow`)|
|ILLIT|7|Tick-Tack (`rec28ldfRTrJVj`)；little monster (`rec28ldfRTrK1S`)；It's Me (`rec28ldfRTrKy2`)；Almond Chocolate (`rec28ldfRTrLwE`)；Almond Chocolate (Korean Ver.) (`rec28ldfRTrLBw`)；See U Tonight (feat. YUNAH & MINJU of ILLIT) (`rec28ldfRTrLFz`)；I Got Your Back (Feat. JISOO, MOMOKA of HANA) (Korean Ver.) (`rec28ldfRTrLNM`)|
|XG|6|UNDEFEATED (`recvxDMFHNSJcd`)；MILLION PLACES (`recvxDMFHNSckK`)；GALA (`recvxDMFHNyJoh`)；HYPNOTIZE (`recvxDMFHN6iOl`)；ROCK THE BOAT (`recvxDMFHNzJyr`)；O.R.B (Obviously Reads Bro) (`recvxDMFHNyyeA`)|
|aespa|13|Next Level (Habstrakt Remix) (`recvxyHuKMisqR`)；Girls (BRLLNT Remix) (`recvxyHuKMiDs4`)；Spicy (Nitepunk Remix) (`recvxyHuKMyy5i`)；Better Things (æ-aespa Ver.) (`recvxyHuKMNTOs`)；Regret of the Times (2024 aespa Remake Ver.) (`recvxyHuKMXVDa`)；Get Goin' (`recvxyHuKMBHQA`)；Supernova (Grimes Remix) (`recvxyHuKMlGJW`)；Armageddon (Flava D Remix) (`recvxyHuKMCSdB`)；Supernova (Grimes Remix) (The Other World Ver.) (`recvxyHuKMwjsI`)；Rich Man (Yellow Claw Remix) (`recvxyHuKMlAhN`)；LEMONADE (Zedd Remix) (`recvxyHuKMxwnW`)；LEMONADE (Marlon Hoffstadt Remix) (`recvxyHuKMlNfX`)；LEMONADE (2Spade Remix) (`recvxyHuKMLz7L`)|
|IVE|1|BANG BANG (MINIVE VER.) (`recvxyHuKMwrIt`)|
|KISS OF LIFE|7|Nothing (`rec28ldfRTrMcf`)；Te Quiero (`rec28ldfRTrMgm`)；k bye (`rec28ldfRTrMsR`)；Painting (`rec28ldfRTrMwG`)；Lucky (Korean Ver.) (`rec28ldfRTrMEN`)；Don't mind me (`rec28ldfRTrMMV`)；WHAT! (`rec28ldfRTrMW0`)|
|STAYC|1|MWUAH (`recvxyH5pzbluu`)|
|NMIXX|3|Sprinkle Party (`recvxyOz5XsgVc`)；蜚蜚 (FEIFEI) (`recvxyOz5XRfn5`)；Caution (`recvxyOz5X6G1q`)|
|Hearts2Hearts|5|The Chase (`rec28ldfRTrI0Y`)；STYLE (`rec28ldfRTrI8S`)；FOCUS (`rec28ldfRTrIkV`)；Moonride (`rec28ldfRTrIC0`)；The Chase (`rec28ldfRTrJKM`)|
|KiiiKiii|3|딸기게임 (Strawberry Cheesegame) (`rec28ldfRTrINH`)；Delulu (`rec28ldfRTrIRO`)；Pop Off Pop Off (`rec28ldfRTrIZT`)|
|ITZY|3|Not Shy (English Ver.) (`recvxyOz5XmMQe`)；LOCO (Japanese Ver.) (`recvxyOz5X7zV3`)；SUPERPOWERS (`recvxyOz5XmFwB`)|
|SAY MY NAME|1|난 오늘 밤하늘에서 가장 빛나는 별이 된다 (Be a Star) (`rec28ldfRTrN8c`)|
|KATSEYE|7|Gnarly (`recvxIZd9vfxUk`)；Animal (`recvxIZdeZ4gBv`)；Gabriela (`recvxIZdeZKVcv`)；Touch (`recvxIZdeZTQpQ`)；PINKY UP (`recvxIZdeZhvRo`)；Gameboy (`recvxIZnIaGCNq`)；Hootie Frutti (`recvxIZnNLO1yO`)|
