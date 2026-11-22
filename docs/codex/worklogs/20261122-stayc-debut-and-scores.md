# STAYC《SO BAD》照片与全站成员评分入口

High Up 的出道发行页逐人列出 SUMIN、SIEUN、ISA、SEEUN、YOON 和 J 的 2020 年 11 月写真。《SO BAD》原先六张都来自 2021 年《STAYDOM》，现已换成这次出道发行的同组照片。新版沿用六条原作品、成员与评分绑定，卡上保留旧作品图及其出处。《ASAP》继续使用《STAYDOM》系列。团体名录和个人档案沿用《2:LOVE》六张资料照。团标文件已与 High Up 样式表中 `.artist-logo.stayc` 对应的 SVG 原件核对。[出道发行](https://www.highup-ent.com/en/stayc/star-to-a-young-culture/) · [成员官网](https://www.highup-ent.com/en/stayc/) · [官网团标](https://www.highup-ent.com/wp-content/themes/highup/images/logo-stayc.svg) · [逐人出处](../evidence/20261122-stayc-debut/sources-and-frames.json)

同为 480 × 640 的六张评分卡从 290,958 B 减至 247,942 B，减少 43,016 B（14.8%）。六份 1200 × 1680 原件共 4,414,796 B，访客开大图时才取对应文件。六名成员的档案页也能在站内灯箱查看 High Up 具名原图，由原来的图片进入各自来源。手机与桌面实测 SUMIN 的 720 × 1008 预览和 1200 × 1680 原图均正常解码，关闭后焦点回到头像。[素材与读数](../evidence/20261122-stayc-debut/sources-and-frames.json) · [本地浏览器](../evidence/20261122-stayc-debut/local-browser.json)

| STAYC 页面 | 桌面设计 | 手机设计 |
| --- | --- | --- |
| 成员名录，《2:LOVE》六人 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1109) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1161) |
| SUMIN 档案 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1213) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1242) |
| 《SO BAD》官方 MV 及六人评分 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1271) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1324) |
| SBS《人气歌谣》，2020-11-15 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1377) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1495-1402) |

成员页使用团体首页已采用的冰蓝色，作品页沿用该团的浅绿和墨绿。Figma 导出复核时，YOON、J 和舞台三张源图虽已导入，导出时显示为空。将相同像素的 PNG 放回后，八份画面均可见对应人物或视频封面。《SO BAD》MV 封面和 SBS 舞台封面各自取自对应视频。[八张画面](../evidence/20261122-stayc-debut/figma-examples.jpg) · [手机六人卡](../evidence/20261122-stayc-debut/mv-mobile-six.jpg)

## 各团的本人评分入口

初次双宽实测发现，成员照下方先出现图注、旧作品图和成员信息，最后才到评分。原有评分记录的按钮高 31 px。共享实现按四种真实场景重新对稿，再把本人操作放到本人照片的下一个元素。图注、出处、原作品图、成员入口和评分绑定均保留。名册选中的成员会直接展开表现分、造型分及保存，访客只读视图沿用原有资料与权限。

| 可评情形 | 桌面组件 | 手机组件 |
| --- | --- | --- |
| 原有作品记录，《SO BAD》ISA | [296 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1558) | [336 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1568) |
| 具名发行阵容，《BILLIONAIRE》RUKA | [196 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1578) | [166 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1587) |
| 团体认人参考，《loverfory》Kasia | [196 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1596) | [166 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1605) |
| 手选名册成员，《2 L0VE》SUMIN | [296 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1614) | [336 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1503-1628) |

Codex 内置浏览器用相同真实页面组件和隔离的空分记录，按实际正文宽 375、1425 px 重新点开上述四种卡。八次评分按钮都与照片等宽，间距 8 px、高 44 px，两项评分输入都能打开。《SO BAD》六人逐张测量，手机间距从 220 px 降至 8 px，桌面从 237 px 降至 8 px。切到舞台后可见成员评分卡为零，舞台封面独立解码为 640 × 360。[四类八个可编辑组件](../evidence/20261122-stayc-debut/shared-score-figma.json) · [导出图](../evidence/20261122-stayc-debut/figma-shared-scores.jpg) · [四类实测](../evidence/20261122-stayc-debut/local-score-variants.json)

全团体回归使用工程内的 51 团、614 项目录数据。599 支可评分 MV 的 3,466 张初始卡和 729 张手选卡逐一验证本人照片、紧邻评分按钮及读屏名称。729 次隔离保存均成功读回，覆盖仅有历史团体关联的 132 名册选择。六个定向测试文件共 72/72 通过，TypeScript 检查通过。此轮本机验收走到舞台封面切换，实际播放、正式站写入及上线状态按发布回执记录。[覆盖结果](../evidence/20261122-stayc-debut/score-coverage.json)
