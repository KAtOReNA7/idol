# ITZY 与 LE SSERAFIM 的 MV 和舞台详情

《WANNABE》和《ANTIFRAGILE》从团页或作品库进入同一个详情。ITZY 原详情仍用奶白、黑和荧光黄，LE SSERAFIM 原详情仍用浅米和橙色。新详情沿用两团已经完成的官网视觉设计。ITZY 使用青绿、浅黄和直立的 Space Grotesk，LE SSERAFIM 使用深蓝黑、淡紫和 Oswald。每支 MV 的成员卡保留独立的评分入口及原图出处。[两团官网与来源](20261122-itzy-lesserafim-official-design.md)

| 状态 | 1440 稿 | 375 稿 |
| --- | --- | --- |
| ITZY《WANNABE》MV | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-1345) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-1604) |
| ITZY《WANNABE》2020-03-15 表演版 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-1486) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-1716) |
| LE SSERAFIM《ANTIFRAGILE》MV | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-2171) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-2430) |
| LE SSERAFIM《ANTIFRAGILE》2022-10-18 特别表演版 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-2312) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1483-2542) |

八张稿使用从正式 React 详情读取的四张视频封面和十张成员照，并在 Figma 读回图层、出处链接和导出图。ITZY 五张为《IT’z ME》具名发行概念照。LE SSERAFIM 五张为《UNFORGIVEN》Dewy Sage 跨期认人参考。画板中的私人输入为空。两版都有 44 px 的播放及成员评分操作，每个版本使用自己的视频封面。[《IT’z ME》彩领具名照](https://dbkpop.com/2020/02/26/itzy-itz-me-chaeryeong-teaser-photos-hd-hr/) · [Dewy Sage 五人出处](https://dbkpop.com/2023/04/12/le-sserafim-unforgiven-teaser-concept-photos-dewy-sage-ver-uhd-hq-hr/)

| 主题取值 | ITZY | LE SSERAFIM |
| --- | --- | --- |
| 正文背景旧值 → 新值 | #fffdf5 → #e5efe8 | #f4f1e9 → #0d1721 |
| 新稿主要按钮 | #f4e6a1，文字 #153e3c | #d1bcff，文字 #0d1721 |
| 主要按钮正文对比度 | 9.34∶1 | 10.63∶1 |
| 卡片上出处文字对比度 | 5.06∶1 | 8.22∶1 |

以上对比度依 CSS 色值的相对亮度计算。用同一份底库投影检查了 614 支作品与全部 51 团。每支作品均能从本人团体关系选到主题。32 支 ITZY 和 20 支 LE SSERAFIM 即使带上另一团的返回网址也仍显示本团主题。另外 49 组的生成值逐组无差异。横查团页当前根样式与详情登记色值时，izna、RESCENE、BEWAVE、W!TCHX、SPIA、NewJeans、IVE、STAYC、NMIXX 有至少一处背景或正文字面值差异。各主题可能按栏目换色，后续需在相应页面与画稿判定。

Codex 内置浏览器在本地正常详情入口以 375 px 和 1425 px 的实际正文宽度检查了 8 个状态。两团 MV 和舞台的背景、文字、选中项、播放按钮及直立标题字体均与设计相符，8 页均无横向溢出。正常隔离目录中两支作品没有成员关系。另用同一个 WorkDetail 和相同样式载入底库具名关系及本机空的评分表，两个宽度的 20/20 张照片下均可操作本人「评分与备注」，实际展开四次并切换至舞台。舞台页收起 MV 的成员区，切回时能复用该区。没有写入正式评分。[正常入口双宽回执](../evidence/20261122-v239/itzy-lesserafim-detail-theme.json) · [全组件成员操作回执](../evidence/20261122-v239/itzy-lesserafim-detail-full-fixture.json)

Windows 与 WSL 上，作品主题、独立审阅样式、两团栏目和成员评分共 50/50 项通过。TypeScript 与 51 团主题再生成校验通过。正式发布由发布批次另行记录。
