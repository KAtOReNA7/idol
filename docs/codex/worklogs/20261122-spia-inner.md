# SPIA 的成员、作品与时间轴

飞书第 18 条指出 SPIA 的设计过于简单。团页从《Deeeep》2024 年 6 月的公司宣传照、唱片封面和公司发布的团标取色。成员目录沿用五张具名同系列转载照片。已核准的首页在 v238 上线。本批在本地把未有对应新稿的内页配色先退回旧版，再在项目 Figma 绘制以下七对可编辑画板，检查导出及组件后实现。[发行资料](https://music.bugs.co.kr/album/4102374) · [KBS 公司供图](https://world.kbs.co.kr/service/contents_view.htm?board_seq=451476&id=&lang=k&menu_cate=enternews) · [画板导出](../evidence/20261122-spia-inner/figma-boards.webp)

| 页面 | 桌面 1440 | 手机 390 |
| --- | --- | --- |
| 成员 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8045) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8076) |
| 作品 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8107) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8150) |
| 成员档案 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8193) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8217) |
| 发行详情 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8241) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8264) |
| 舞台详情 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8287) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8304) |
| MV详情 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8321) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8338) |
| 时间轴 | [桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8355) | [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1507-8385) |

目录保留同一组四个影像版本和两张发行。每张卡把封面、片名与版本合成一个可聚焦的链接。原站相同内容原有 14 个链接，现在有 6 个，键盘完整浏览少经过 8 个重复入口。作品影像在两张发行之前。时间轴保留节目日期、音源发行与原始来源，移除了内部绑定和录入说明。手机上的成员、发行详情缩短大图到基本资料的距离。

本机 Codex 自带浏览器实测 375 / 1425 px 共 14 个页面。均无横向溢出，名册均有五人，时间轴均有五个事件，两档目录所有卡片都只有一个可操作入口。两份映射到共享作品封面的 MV 已逐像素比对，和 Figma 对应原海报完全相同。页面沿用获准的来源图片和已有字体。本批定向测试 125/125。正式站复验及飞书状态见发布回执。[修改前目录](../evidence/20261122-spia-inner/formal-before.json) · [本机双宽结果](../evidence/20261122-spia-inner/local-browser.json)
## 站内播放与评分页

从 SPIA 目录进入《Daddy’s Little Girl》时，原正式站的播放器仍使用白色背景、森林绿操作和 Playfair Display。另在 Figma 按实际站内导航、原版 MV 与 THE SHOW 海报、五名成员照片、本人评分和整体舞台分绘制四稿。[MV 桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1515-8045) · [MV 手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1515-8102) · [舞台桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1515-8152) · [舞台手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1515-8183)

两版实际作品组件在 375 与 1425 px 都使用深蓝背景、粉色播放与版本按钮及 700 字重 DM Sans 标题。MV 与舞台切换后保持各自的视频封面，两档无横向溢出。隔离目录此次只有作品记录；正式成员照片和评分控件另在原站复验。[四稿导出](../evidence/20261122-spia-inner/work-boards.webp) · [切换与色值实测](../evidence/20261122-spia-inner/local-native-works.json)

## 成员照片的访问体积

五张具名原件各为 640 × 800。保留同一取景，首页、成员目录和本人详情先读取 480 × 600 WebP，点开本人原图再读原 PNG。相同五个位置首次所需图片从 3,829,747 字节降为 252,050 字节，减少 93.4%。内置浏览器本地已解码五张预览，并从娜熙档案打开 640 × 800 原件。[逐张字节](../evidence/20261122-spia-inner/portrait-previews.json) · [实际读取](../evidence/20261122-spia-inner/local-member-previews.json)
