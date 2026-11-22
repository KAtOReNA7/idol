# KISS OF LIFE 舞台目录与 ADYA 冷启动

KISS OF LIFE 团页选择「可看舞台」后，原先 24 张作品卡的首图和「观看与评分」均打开 MV，也显示 MV 分。现在每张卡用对应舞台的封面、发布者、视频日期和整体舞台分，整卡一个站内入口。《Te Quiero》写明 MV 与舞台是同一支官方表演视频。《Sticky》舞台使用 7 月 9 日的 STUDIO CHOOM 版本。仅有其他现场可看的作品显示「仅供观看」，来源变化或评分绑定失效时保留原有记录。[KISS OF LIFE《Te Quiero》](https://www.youtube.com/watch?v=pYn96ujbJX0) · [STUDIO CHOOM《Sticky》](https://www.youtube.com/watch?v=CXN-qdYRCfc) · [五个封面与官方来源](../evidence/20261122-kiof-stage-catalog/official-covers.json)

用同一份团体目录分别渲染 v244 发布时的作品卡与开发版。24 张卡中，第一个链接直达舞台由 0 张增至 24 张，展示整体舞台分由 0 张增至 24 张。键盘遍历这批卡片的链接由 72 个减少到 24 个。MV 和全部作品目录保留原入口。[24 张卡的同输入对照](../evidence/20261122-kiof-stage-catalog/matched-input.json)

作品目录沿用纸色、深红、Oswald 标题与 Space Grotesk 辅助字体。项目 Figma 原《STICKY》舞台详情只有播放器示意。新加的 1440 / 390 px 舞台目录首排按实际顺序放入 THE FIRST TAKE 日语《SWEAT》、Mnet《WHAT!》和 1theK《SWEAT》。另外绘制《Te Quiero》搜索结果两宽及《Sticky》搜索手机页，本批作为作品筛选的专项状态登记。整体作品目录的其他状态按原索引继续。[团体官网](https://kissoflife.jp/) · [发行方资料](https://columbia.jp/artist-info/kissoflife/prof.html) · [桌面目录](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1572-1137) · [手机搜索](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1572-1253) · [五幅设计](../evidence/20261122-kiof-stage-catalog/figma-views.webp)

本机 Codex 内置浏览器实际正文宽 375、1425、305 px。每个宽度都点开《Te Quiero》和《Sticky》，档案封面与目录封面分别同为 1280 × 720 和 640 × 360。六次均命中本人所选作品的舞台整体分，返回后恢复搜索、舞台筛选与原卡焦点。24 张卡均只有一个目标，两个样例的入口标签高 44 px，页面无横向溢出。视频保持暂停。[逐宽实点回执](../evidence/20261122-kiof-stage-catalog/dual-catalog-browser.json)

同一次测试还把 ADYA 的目录数据延迟 9 秒。在每个宽度先点《RIZZ》，返回后立即再点一次。六次都在目录数据到达之前凭已有作品及官方视频身份进入舞台整体评分，返回后原卡获得焦点。已经加载的数据若显示舞台来源变更，目录采用当前绑定；表单和当前记录不继承不相符的分数。ADYA 的代码为 `76829690`，定向 48/48。KISS OF LIFE 的代码为 `2d0f459d`，涉及作品卡与该团的定向 34/34。正式站发布与首次点击结果见相应版本交付。[ADYA 此前的评分与来源](20261122-adya-rizz.md)

51 团登记目录中 47 团有舞台筛选。按整段官方视频身份比对，10 团 13 首明确共用 MV 和舞台的完整视频。修正后 9 条从目录首击进入舞台，YOUNG POSSE 1 条经其原生舞台详情进入正确的整体分。BABYMONSTER 和 BADVILLAIN 的 3 首没有独立舞台筛选。izna《SASS & Racecar》另用实际原生目录渲染器核对。这组统计覆盖公开投影、精确视频 ID、完整区间及旧 YouTube 记录；不同剪辑的舞台目录另有跨团专项。[51 团范围、13 首去向和排除条件](../evidence/20261122-kiof-stage-catalog/same-video-51-groups.json)
