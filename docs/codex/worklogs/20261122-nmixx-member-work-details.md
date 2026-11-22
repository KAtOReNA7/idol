# NMIXX 成员档案、MV 与舞台

NMIXX 项目页原有六张桌面和手机详情稿，分别对应 LILY、MV 和舞台。图层检查确认六张均无图片填充。新稿采用 JYP 官网白字标、LILY 的 1412 × 1800 官方档案照、《Roller Coaster》两版各自的封面，以及 JYP 于 2023 年 7 月 4 日逐人发布的六张本曲概念照。个人档案照、作品概念照和表演版封面分别保留来源。团体首页的既有设计继续使用。[JYP 官方档案](https://nmixx.jype.com/profile) · [LILY 本曲照片公告](https://nmixx.jype.com/notice/z11cyqda?NoticeNumber=276) · [六人照片逐项记录](../evidence/20261122-member-release-portraits/photos.csv)

| 页面 | 1440 稿 | 390 稿 |
| --- | --- | --- |
| LILY 的档案与作品造型 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-2054) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-2093) |
| 《Roller Coaster》MV | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1195) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1653) |
| 从本人的照片展开 LILY 评分 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1336) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1766) |
| 2023-07-05 表演版 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1535) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1960) |

八张 Figma 稿均读回设计上下文与渲染图。MV 稿和评分展开稿共含 24 个个人照片实例。共享详情原用灰紫色背景，现与 JYP 团页统一为米色背景、深棕文字与操作、Space Grotesk 标题。当前成员的档案照可打开大图，并直接前往 JYP 具名档案。成员页的作品图采用与 MV 页相同的版本、作品和成员绑定，该成员的评分与照片仍属于本人。[本人评分稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1491-1336)

底库中有 20 支 NMIXX 作品。打开成员档案里的已有私人作品关系时，原页面绕过了两套已经登记的照片。现在为五支作品的 33 个人物位置使用登记的作品图，保留 2022 年原阵容与历次照片出处。另四支作品使用《AD MARE》的概念照认人参考，《Roller Coaster》六张来自同曲宣传。以下字节数按相同作品及成员逐项读取默认请求的本地图片文件，不计浏览器缓存、网络耗时或按需打开的大图。

| 成员档案中的作品 | 位置数 | 原图片字节 | 现图片字节 |
| --- | ---: | ---: | ---: |
| Young, Dumb, Stupid | 6 | 3,819,503 | 194,166 |
| O.O | 7 | 4,176,148 | 225,708 |
| DICE | 7 | 1,667,586 | 225,708 |
| Funky Glitter Christmas | 7 | 8,003,310 | 225,708 |
| Roller Coaster | 6 | 5,899,999 | 249,200 |

新增站点素材 0 字节。大图沿用既有原件，《Roller Coaster》六个卡位的默认图片合计减少 95.8%。两套本团登记由服务端传给成员页。Windows 与 WSL 上的 NMIXX 页面、51 团作品主题、照片版本与个人评分专项各 49/49 通过，TypeScript 与主题再生成校验通过。正式发布另行记录。

Codex 内置浏览器在本机以 375 px 和 1425 px 的实际正文宽度，从 LILY 档案打开本人原图，并点《Roller Coaster》卡片进入 MV，展开 LILY 的个人评分，再切到表演版。两种宽度上，六位成员的照片和本人评分入口各有六组，12/12 个入口都在本人照片下方，页面均无横向溢出。背景和按钮的实测色值分别为 `#f1ece2` 和 `#302b24`。桌面首屏六张实测解码为 480 × 640。手机初次读取时两张已解码，另外四张处于懒加载位置。本次使用正式组件、本地公开图和隔离的空评分，没有改动私人记录。[双宽操作回执](../evidence/20261122-nmixx-member-work-details/local-browser.json)
