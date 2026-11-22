# GENBLUE《COCOCO》成员图与本人评分

2024 年 9 月 2 日韩国出道 MV 与 9 月 3 日的 Performance 在同一作品下有各自的封面和入口。开发版 `95947a30` 把首发 MV 的六张章节图换成天空娱乐于 8 月 29 日发布的《COCOCO》官方概念照。原先六张横向图片仍可从各人的卡片打开。新版按原来的成员与作品 ID 保存评分。[天空娱乐官网](https://www.tenentcorp.com/pages/genblue/) · [概念照发行报道](https://www.mnews.tw/story/20240831opb002) · [韩国发行日报道](https://www.mk.co.kr/en/musics/11105477) · [六人姓名与造型](https://www.marieclaire.com.tw/entertainment/news/81313)

| 成员 | 采用的照片 | 天空娱乐具名原帖 |
| --- | --- | --- |
| AYAKO | 第 1 张 | [AYAKO](https://x.com/GENBLUE_ten/status/1829085664148894033) |
| AYEON | 第 2 张 | [AYEON](https://x.com/GENBLUE_ten/status/1829085797242622002) |
| LILI | 第 1 张 | [LILI](https://x.com/GENBLUE_ten/status/1829085464877510785) |
| NICO | 第 1 张 | [NICO](https://x.com/GENBLUE_ten/status/1829085372992700479) |
| XXIN | 第 1 张 | [XXIN](https://x.com/GENBLUE_ten/status/1829085562839674942) |
| YUAN | 第 1 张 | [YUAN](https://x.com/GENBLUE_ten/status/1829085897939095954) |

旧 MV 两宽画稿把主要操作标为「打开官方视频」，播放器区域写着「预览暂缺」。新版四幅分别展示完整 MV 详情和 AYEON 展开评分，均已在项目 Figma 读回图层和截图。成员卡沿用团体的蓝色、银灰底和 Roboto Condensed 标题，桌面三列、手机一列。六位成员各有独立的折叠卡组件，另有 AYEON 的展开组件。[桌面 MV](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1579-1988) · [手机 MV](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1579-2120) · [桌面评分](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1579-2244) · [手机评分](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1579-2365)

同一作品六张默认图片共从 6,685,309 B 减至 333,380 B，节省 6,351,929 B（95.01%）。卡片预览为 480 × 640，六份完整原件为 2727–2730 × 4096，合计 9,372,719 B，点开个人大图时才取对应原件。原件和预览已纳入本地公开素材投递。[照片、字节数和逐人来源](../evidence/20261122-genblue-cococo/design-and-sources.json)

内置浏览器用相同的空白成员记录对比前后版本，正文 375 和 1425 px 的四组检查均通过。手机照片与本人按钮等宽，从 314 px 增至 333 px，桌面由 321 px 增至 347 px。两宽均逐个打开六人的新旧大图，以及照片正下方的表现分、造型喜欢、记忆点和备注。按钮高 44 px，距照片 8 px。次日 Performance 的独立封面和返回均通过。[四组逐人实测](../evidence/20261122-genblue-cococo/local-browser.json)

隔离库使用正式工程的记录与保存接口。手机为 AYEON 写入 0 分并模拟回执丢失，再次提交后只增加一个版本和一条日志。桌面重新打开读到 0，清空保存为 null，再次保存 0。其余五人始终为空。Windows、WSL 各通过 61/61 项专项测试。页面结构回归覆盖 51 团、599 支可评分 MV 的 3,466 张初始成员卡与 729 张手选卡，共 4,195 个作品成员组合，每张均有本人照片和评分入口。本次浏览器检查覆盖照片、评分与版本切换，正式发布与视频播放按各自回执验收。[本次隔离读写](../evidence/20261122-genblue-cococo/local-browser.json) · [全站覆盖口径](../evidence/20261122-stayc-debut/score-coverage.json)
