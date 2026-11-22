# ITZY 与 LE SSERAFIM 的官方团标、成员照与观看入口

ITZY 首页采用 JYP 官方图库的五人合照，使用日本官网的白色透明团标。该标志是官网常设标志。青绿色取自合照布景，浅黄色呼应衣料。五张成员头像均保留 JYP 具名的 1004 × 1280 原图。首屏的《WANNABE》直接进入已有作品。合照的原始发布日期未注明。[JYP 图库](https://itzy.jype.com/gallery) · [JYP 成员档案](https://itzy.jype.com/profile) · [日本官网团标](https://www.itzyjapan.com/static/itzy/official/common/logo_of_white_202208_x9LXPfqs.png)

LE SSERAFIM 首页采用 SOURCE MUSIC 艺人页的 800 × 280 正式标志及 1800 × 788 五人合照。页面使用深蓝黑背景，淡紫色用于当前导航和主要操作。五张 750 × 1125 的具名照来自日本官网。资料保持现有五人与历史成员 KIM GARAM 的区分，首屏的《ANTIFRAGILE》保留原作品入口。[SOURCE MUSIC 艺人页](https://www.sourcemusic.com/artist/profile/LE%20SSERAFIM) · [官网标志](https://sourcemusic.com/resources/artist/ee7a25f9-b7a4-4422-bb36-1206a7896f9b.png) · [日本官网](https://www.le-sserafim.jp/)

两团在项目文件中原先均未找到可对应的画板。本轮新建 12 张画板，使用 44 份公开原件，共有 110 张图卡实例和 24 条跨栏目原型连接。桌面单张 MV 图框为 424 × 239，手机为 165 × 93。成员照片保留各自原图的宽高比，并以中文名、艺名、在团状态标识本人。发行封面均用完整方图。LE SSERAFIM 将《HOT》《CRAZY》《EASY》与三张较新的专辑统一排在 MV 之后。

| 页面 | ITZY，1440 / 375 | LE SSERAFIM，1440 / 375 |
| --- | --- | --- |
| 首页 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1113) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1354) | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1604) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1864) |
| 成员 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1214) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1454) | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1718) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1977) |
| 作品 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1260) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1497) | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-1769) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1463-2025) |

在同份公开目录和同一 React 路由渲染器上，逐卡比较可点地址。原来每张图卡都有两个去往同一 MV 的链接，舞台单筛点封面也会先进入 MV。新卡片的封面和标题共用一个链接。在默认列表中有舞台的作品另保留「看舞台」。在舞台单筛中直接打开对应场次，并显示该场次的发布日期和标题。未登录访客不会看到私人的均分和评分占位，所有者仍可查看自己的记录。

| 同条件比较 | 原页面 | 新页面 |
| --- | ---: | ---: |
| ITZY 全部 32 支作品的链接总数 | 94 | 62 |
| LE SSERAFIM 全部 20 支作品的链接总数 | 60 | 40 |
| 两团作品卡内重复指向同一录影的链接 | 52 | 0 |
| ITZY 舞台单筛中，封面第一步就进入本场舞台 | 0/30 | 30/30 |
| LE SSERAFIM 舞台单筛中，封面第一步就进入本场舞台 | 0/20 | 20/20 |

Codex 内置浏览器在本地正式页面使用 375 × 844 和 1425 × 900 两种尺寸实测。ITZY 首图解码为 1800 × 1202，LE SSERAFIM 为 1800 × 788。四个首页均无横向溢出。逐项核对两团舞台单筛中的 50 个首链接，每个宽度实际点击各团第一场，进入舞台详情并返回原筛选。Windows 与 WSL 分别通过 43 项专项回归，Windows 类型检查通过。[浏览器回执](../evidence/20261122-v239/itzy-lesserafim-local-browser.json)
