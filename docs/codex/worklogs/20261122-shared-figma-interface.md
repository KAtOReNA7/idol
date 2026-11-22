# 团体索引、成员评分与原图查看

项目 Figma 的历史索引稿在团卡上同时列出公司、出道年、成员数与作品数，并设两个入口。历史评分稿使用单一分数，原图稿展示成员作品图的尺寸示意。这三份稿保留作历史版本。开发树先撤去此次索引卡、简介、内嵌名单与冷启动弹窗的视觉改动，然后以实际索引顺序、当前团体页、公开发行阵容与照片重做画板。新的 16 幅桌面和手机稿逐一读回了可编辑图层、样式、图片与渲染。浏览、来源查找、授权和评分绑定沿用正式工程。[旧索引稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=77-520) · [旧评分卡](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=3-6) · [旧原图稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=76-507)

| 访客操作 | 桌面 Figma | 手机 Figma | 页面实现 |
| --- | --- | --- | --- |
| 在索引中找团 | [1440 视口，正文 1100](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1447-1301) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1447-1343) | 3:2 团照下显示团名、公司。整张卡打开同一个团。公司可以换行。 |
| 浏览首页推荐 | [1440 视口，正文 1100](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1447-1320) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1447-1362) | 沿用 IVE、ILLIT、tripleS、BADVILLAIN 及 KATSEYE 的登记图与推荐顺序。「全部 51 个团体」保留完整索引入口。 |
| 在信息栏读团体介绍 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1352) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1359) | 一段事实简介随团页继承字体与颜色。ILLIT 为信息栏示例。各团已有首屏简介继续放在各自画板规定的位置。 |
| 本人在《BILLIONAIRE》选择成员 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1446-1180) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1446-1364) | 「成员与评分」中注明《DRIP》发行阵容，每张具名资料照下均有本人的评分入口，可以另开原图和出处。 |
| 展开一位成员的评分 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1446-1232) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1446-1416) | 表现分、造型分和保存都位于所选照片下。画板使用空字段，尚未修改时保存按钮呈禁用态。 |
| 游客阅读《BILLIONAIRE》资料 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1453-1508) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1453-1575) | 独立「成员资料」区保留七人的真实照片、名字、公开出处和原图。当页没有本人写入权限。 |
| 团页首次打开原图 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1379) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1400) | 冷启动使用与界面同版的关闭图标，完整照片居中显示。关闭可返回原位置与焦点。 |
| 图片失败后重试 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1388) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1448-1409) | 隐藏失败的图像，显示「图片暂时打不开。」与独立重试按钮，关闭按钮仍可用。 |

索引与首页使用同一组已有公开团图，登记时保留各自的官网、公司或发行来源。评分画板的七张公开资料照按现有成员与视频身份取图，六张来自 YG 的《WE GO UP》公开物料，RAMI 使用项目留存的 Genie 资料。它们用于辨认《DRIP》原发行阵容。《BILLIONAIRE》的完整出镜名单未由这组资料逐人证明。原图状态以 2022 年韩国官网 NewJeans 出道五人相册作示例。[索引图片与来源](../../../apps/idol-site/data/music-index-artwork.json) · [YG 公开物料](https://artist.ygfamily.co.kr/ARTISTS/BABYMONSTER/music/WEGOUP/teaser/index.html) · [Genie 资料](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14146) · [《DRIP》原发行名单](https://enews.imbc.com/News/ViewAmp/435475) · [NewJeans 出道官网](https://web.archive.org/web/20220724172456/https://newjeans.kr/)

本机 Codex 内置浏览器实测中，375 px 与 1425 px 的完整索引均有 51 张团卡，公司字号均为 13 px。上版 CSS 对应手机与桌面分别为 10 px 与 11 px。首页推荐在两个宽度分别可见四张和五张，手机第五张的位置取舍已记入体验讨论。ILLIT 的公开简介两宽都只有一段，手机为 16 px，桌面为 18 px，标签与正文间距均为 8 px。游客进入《BILLIONAIRE》时，两宽各见七条公开成员资料，实际可写控件为零。[手机回执](../evidence/20261122-shared-figma-interface/local-presentation-375.json) · [桌面回执](../evidence/20261122-shared-figma-interface/local-presentation-1425.json) · [使用取舍](../20261122-USABILITY-DISCUSSION.md)

成员评分入口及表单保存按钮按画稿设为至少 44 px 高。成员身份、同卡双分、保存重试、只读状态、团卡和图片恢复等十个 Windows 测试文件共 98/98 通过，素材投递与隐私构建两份专项共 14/14 通过。TypeScript 类型检查通过。原图首击和回焦此前已在两团的四次本机冷启动通过。新版失败后重试已经单测，正式站本人控件的像素与点击、生产构建和全量回归结果由发布批次独立记录。[原图冷启动四次](../evidence/20261122-four-artist-first-screens/local-cold-originals.json) · [可重复的公共界面实测](../qa/group-entry-content.mjs)

[索引与推荐画板导出](../evidence/20261122-shared-figma-interface/figma-cards.webp) · [本人评分画板导出](../evidence/20261122-shared-figma-interface/figma-scores.webp) · [游客资料画板导出](../evidence/20261122-shared-figma-interface/figma-visitor.webp) · [团体介绍与原图画板导出](../evidence/20261122-shared-figma-interface/figma-details.webp)
