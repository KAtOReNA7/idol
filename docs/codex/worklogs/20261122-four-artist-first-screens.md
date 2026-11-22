# Candy Shop、Geenius、SPIA 与 NewJeans 首页

四个首页分别从各团官网或发行方留存的图像出发。在项目 Figma 中先完成 1440 px 和 390 px 两幅可编辑的首页稿，逐幅读取构图、图片和导出画面，再按稿调整页面。Candy Shop、Geenius、SPIA 先前的三份代码候选已退回上版，再按新画板实现。八幅 Figma 实际导出的对照图保留在本次记录中。[八幅画板导出](../evidence/20261122-four-artist-first-screens/figma-boards.webp)

| 团体 | 桌面 | 手机 | 首页内容与出处 |
| --- | --- | --- | --- |
| Candy Shop | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-1842) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-1856) | 保留日本官网完整四人主图，渐变字标和星形在单独的深梅紫色栏内。主页简介和照片出处相邻，唱片区的入口打开完整发行目录。[日本官网](https://candy-shop.jp/) · [四人原图](https://candy-shop.jp/image/image_directly/candyshop/key-01.jpg) |
| Geenius | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-3629) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-3645) | HOMe 艺人页的花标和五人肖像组成页首。《Voyage》使用本版 MV 的封面并可打开对应作品，其后保留单曲发行详情，五个社交账号收在可展开列表。[HOMe 艺人页](https://www.geeniushome.com/geenius) · [《Voyage》官方 MV](https://www.youtube.com/watch?v=KnoZi2E7RDw) |
| SPIA | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-10597) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1425-10618) | 采用 Campus Entertainment 提供、KBS 于 2024 年 6 月 5 日刊载的五人宣传照，旁边展示《Deeeep》发行封套上的五人插画。手机保留照片、封面和播放入口的次序。Bugs 本次直连返回 403，封面取自仓库已登记的同版发行原图。[KBS 报道](https://world.kbs.co.kr/service/contents_view.htm?board_seq=451476&id=&lang=k&menu_cate=enternews) · [《Deeeep》发行](https://music.bugs.co.kr/album/4102374) |
| NewJeans | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1428-2038) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1428-2058) | 韩国出道官网的 NJ 导航图标、橙色字标与同幅五人插画，搭配 Day 1 相册第 21 张五人合照。图注明示 2022 年 7 月，名册继续区分四名现役和历史成员丹妮尔。《Attention》入口保留首发 MV 的视频和评分关系。[2022 年 7 月官网](https://web.archive.org/web/20220724172456/https://newjeans.kr/) · [相册原图](https://web.archive.org/web/20220724191743id_/https://newjeans.kr/imgs/boost-a/19b0e1df4b12af665a96e063cb50abae/0722_0_21.jpg) · [《Attention》官方 MV](https://www.youtube.com/watch?v=js1CtxSY38I) |

NewJeans 的旧首页先显示四人照和日本官网字标，两个文件合计 393,488 字节。出道五人照、橙色字标组合与 NJ 图标合计 224,091 字节，减少 169,397 字节（43.05%）。统计按实际默认展示的文件各计一次，点击后读取的原图另计。Candy Shop 的首页默认团照从 223,386 降至 136,378 字节，四人完整原图仍可打开。按页面加载耗时或整页传输衡量的结果需实测另记。[原图和默认图投递清单](../../../apps/idol-site/data/production-asset-delivery.json)

Windows 定向检查中，八份回归文件共 153 项通过，覆盖首屏、作品身份、照片、图片投递和受限原件。另测四团的素材、目录、选版及评分回读 36/36，四团首页与作品库排序及主推 MV 身份 5/5。几组检查有重叠。首页鼠标首击和键盘 Enter 冷启动曾令 NewJeans 和 Rocket Punch 离开团页。本机 Codex 内置浏览器复验两团两种操作共 4/4，均打开正确原图，Esc 关闭后返回原页和原控件。[冷启动四次实测](../evidence/20261122-four-artist-first-screens/local-cold-originals.json) · [本机浏览器检查脚本](../qa/group-entry-content.mjs)

四团定稿在本机 Codex 浏览器逐页复验。实际正文宽 375 和 1425 px 共 8/8，照片、标志和适用的封面都已解码并位于正文内。手机上 Candy Shop、Geenius、SPIA、NewJeans 四张主照分别显示为 343 × 229、343 × 429、335 × 223、343 × 229 px。桌面依次为 779 × 520、620 × 776、660 × 440、800 × 534 px。Geenius《Voyage》和 NewJeans《Attention》两宽都指向对应作品。[四团本地双宽实测](../evidence/20261122-four-artist-first-screens/local-first-screens.json)

本记录对应本地实现。正式站的发布和线上操作结果由当批发布回执记录。
