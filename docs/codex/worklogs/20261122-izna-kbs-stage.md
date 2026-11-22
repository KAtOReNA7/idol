# izna《IZNA》Music Bank 舞台

从 izna 的「作品 → 舞台」选择《IZNA》，现在会直接打开 2024 年 11 月 29 日的 KBS《Music Bank》。卡片同时给出节目名和日期。旧书签的「站内观看舞台」也进入同一场，返回时保留原筛选。作品编号为 `rec28ldfRTrBGz`，这一场的视频为 `rTj06CFlDTU`，11 月 25 日的首发 MV 为 `d3mqW9wqqx0`。[KBS 节目正片](https://www.youtube.com/watch?v=rTj06CFlDTU) · [WAKEONE 官网](https://wake-one.com/en/artists/izna/) · [首发期《N/a》宣传稿](https://artist.mnetplus.world/main/stg/izna/contents/672b30329ac142701bcbdb90)

两幅舞台详情画在 izna 的 Night Refraction 页面，延续深海军蓝、浅银紫和无衬线字体。封面沿用已有 KBS 节目图，原源图 1280 × 720，页面用图 640 × 360、18,894 字节。手机和桌面都将播放按钮移至左下，使画面右侧成员的眼睛和表情完整可见。图下注明节目和频道，评分对应本场整体表现。[桌面设计](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1564-1442) · [手机设计](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1564-1496) · [KBS 原图](https://i.ytimg.com/vi/rTj06CFlDTU/maxresdefault.jpg) · [既有逐文件出处](../evidence/20261122-work-previews/stage-assets.csv)

两团共用的目录和旧书签已一并调整。izna 6 场、ifeye 3 场都能从已载入的目录打开相应舞台。目录资料尚未载入或实际来源发生冲突时，保留原生场次页。《BEEP》的日版明确借用了韩语原版舞台，韩语原版可以观看，原生评分仍要求片源唯一。七个成员和十四个身份唯一的视频共 21 个既有手帐入口继续生效。其他作品借用同一片源时，每一处都须明列来源作品、目标作品、团体和相符的同曲版本，才能从原演出的条目直接打开。[原生映射](../../../apps/idol-site/lib/idol/izna-native.ts) · [逐团回归](../../../apps/idol-site/tests/artist-mv-card-targets.test.cjs)

| 本机同条件操作 | 原版 | 开发版 |
| --- | --- | --- |
| 从筛选后的作品卡到站内播放器 | 2 次点击 | 1 次点击 |
| 旧书签的站外观看按钮 | 1 个 | 0 个 |
| 375 px 海报播放键距左、下沿 | 112、50 px | 13、13 px |
| 1425 px 海报播放键距左、下沿 | 262、135 px | 21、21 px |

Codex 内置浏览器以 375、1425 px 浏览宽度，在本机隔离数据上分别验收改动前后版本，4/4 通过。两宽均解码了节目封面，新按钮高 48 px、新页面横向溢出 0 px。站内详情展开了整体分、观看状态和作品点评三个字段，此次验收检查了入口、编辑表单和返回。两宽均保留舞台筛选及搜索词 IZNA。本轮未改私人数据，也未重新播放节目测码率。[完整浏览记录](../evidence/20261122-izna-kbs/local-browser.json)

应用提交 `fdb04e51`。Windows 与 WSL 各通过 59 项定向测试，覆盖九场真实目录、旧书签、两种影像版本、跨作品复用和评分绑定。正式站复验另随发布回执记录。
