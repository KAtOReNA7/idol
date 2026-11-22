# KISS OF LIFE 三个分享栏目

成员、作品和时间轴的分享链接首开时直接显示对应栏目。同一组匿名链接在正式 v255 和隔离开发服务各得到六个 HTTP 200。v255 的首份 HTML 都先展示团首页。新版本的成员、作品和时间轴首份 HTML 分别包含 4 位成员、25 支作品和 17 条事件。选择「可看舞台」会直接列出 24 个舞台，搜索《Sticky》的 MV 会得到一支作品。访客打开私人的高分队列会看到该队列仅本人可见。[逐路由与素材读数](../evidence/20261123-v256/kissoflife-share-directories.json)

## 视觉与实际入口

黑色团内导航使用日本官网 600 × 128 的透明白色原团标，纸色正文和深红链接沿用项目现有的 KISS OF LIFE 设计。成员名录使用 2026 年 8 月 28 日《SWEAT -JAPANESE EP-》的四张同期写真，每张保留完整构图。作品目录每支作品只有一个进入对应 MV 的主入口，有同版舞台时在下方另给操作。韩语和日语《SWEAT》分别对应 1theK Originals 和 THE FIRST TAKE。韩语《Sticky》的舞台对应 STUDIO CHOOM。日语《Sticky》的发行事件没有关联影像。[日本官网成员区](https://kissoflife.jp/#biography) · [官网团标](https://kissoflife.jp/images/logo.png) · [发行方资料](https://columbia.jp/artist-info/kissoflife/prof.html)

| 栏目 | 桌面 Figma | 手机 Figma |
| --- | --- | --- |
| 成员名录 | [1440 × 957](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1693-2144) | [390 × 960](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1693-2212) |
| 作品与舞台 | [1440 × 3847](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1694-2184) | [390 × 3647](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1694-2420) |
| 大事时间轴 | [1440 × 2164](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1695-2507) | [390 × 2315](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1695-2817) |

六个可编辑画板均已读取截图、实例和实际链接，两种宽度各有 4 张成员照、25 张版本对应封面、24 个独立舞台入口，以及 19 个事件关联。手机出道事件的六个作品可换行，最短链接的触控区为 44 × 44 px。匿名目录支持原生 GET 搜索、清空及带原筛选返回。每个 MV、舞台和事件中的作品链接都有自己的返回锚点。

## 图片、来源与验证

同四张原件为 496,328 B。四张 360 px 预览为 149,598 B，减少 69.86%，540 px 一组为 257,686 B，减少 48.08%。这些读数来自相同输入的编码文件和本机匿名 HTTP 响应。两档预览、四张 720 px 原图均已完整解码。成员详情继续提供既有资料，目录首图按浏览宽度与屏幕像素密度选择。[逐人像素和字节](../evidence/20261123-v256/kissoflife-share-directories.json)

正常路由、目录、原入口返回和舞台等 11 组专项共 110/110 通过，包含八项本批新增测试。TypeScript 检查通过。确认了访客看不到新目录中的私人队列或分数，隔离所有者的《Te Quiero》MV 8 分、舞台 0 分正确分开。四名成员和 25 支作品的公开数据与已有目录逐字段核对。独立开发服务在 5194 端口提供 4 人、25 作、24 舞台和零条个人评分。

内置浏览器在正文 375 px 发现两个冷开问题。迅速进入《Midas Touch》音源发行事件并返回，会落到另一条同名发布会事件；日语《SWEAT》舞台的首次返回也曾失焦。现在复用发行曲目页的首次点击处理。原页面的历史记录及详情的原生返回地址都指向具体控件。修后浏览器在时间轴尚未就绪时点第二条《Midas Touch》，返回后聚焦音源发行事件的作品链接；日语《SWEAT》返回相同舞台卡，保留关键词和舞台筛选，合计 2/2。相同组件仅用于另外一个团的公开分享时间轴，BABYMONSTER 的 18 个事件关联也已采用各自的原锚。本团两个版本的《SWEAT》均已实开对应舞台详情。本批没有更换片源或启动视频。正式双宽与双平台全套结果随合批发布记录。
