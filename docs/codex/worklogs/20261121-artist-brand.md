# IVE 官网标志、成员肖像与 51 团视觉复查

2026-11-21。与上一轮开发交付 `0e3ced18` 比较，本轮实际调整了 17 个团页。测试、浏览器截图与素材指纹对应应用 `f81dbefa`。GitHub 主线为已验收的 `0e77838a`，Sites 控制面读回正式 v203。[被测代码](https://github.com/KAtOReNA7/idol/commit/f81dbefaddb2612ce4317cda5d1fdc58541d0a1c) · [跨平台测试与线上回读](../evidence/20261121-artist-brand/tests.json)

## IVE

旧版实际路由与 Figma 页头均用字体排出“IVE”。项目已存的日本官网页头图片与存档原件逐字节相同，但页面没有使用这张图。本次用 2022 年 4 月 3 日日本官网菜单的白色图形标志，对原图只裁去透明边。主视觉取自 4 月 14 日韩国 STARSHIP 官网存档，另配同期学院造型团照和 4 月 5 日韩国发行的唱片封面。日本站的团标、韩国官网照片和唱片各有独立出处。[白色原标](https://web.archive.org/web/20220403230308id_/https://ive-official.jp/contents/1/DIVE/common/menu_logo-site.png) · [同期官网样式](https://web.archive.org/web/20220401030602id_/https://ive-official.jp/contents/1/DIVE/css/common.css) · [STARSHIP 当期官网](https://web.archive.org/web/20220414055634/http://www.starship-ent.com/profile/musician/ive.php) · [素材来源与指纹](../evidence/20261121-artist-brand/sources.json)

首页、目录与个人资料现在共用深蓝底和银白姓名。英文标题使用自托管 Instrument Serif 正体与斜体，正文采用 DM Sans，中文配 Noto。首页将学院团照与唱片放在标题旁，蓝色官网团照横向展开；手机首屏直接看到前两位成员。Figma 的桌面和手机各有首页、六人成员板，均已导出核对照片、标志与姓名对比度。[桌面首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1315-3311) · [手机首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1315-3358) · [桌面成员](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1315-3330) · [手机成员](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1315-3376)

| 首张成员图距文档顶部，CSS 像素 | 改前 | 改后 | 提前 |
|---|---:|---:|---:|
| 首页，390 × 900 | 952 | 604 | 348 |
| 首页，1440 × 900 | 1,244 | 913 | 331 |
| 成员目录，390 × 900 | 396 | 329 | 67 |
| 成员目录，1440 × 900 | 432 | 293 | 139 |

两次测量使用相同合成输入、Chromium 和窗口高度。另在 320、375、600、720、721、768、1024、1280 像素检查首页及目录，六人成员均可达，操作区没有相互覆盖。实测打开当年官网大图、唱片、成员原照和返回目录的键盘焦点。[测量与字体读数](../evidence/20261121-artist-brand/ive-layout.json) · [手机首页对照](../evidence/20261121-artist-brand/ive-home-390.webp) · [桌面首页对照](../evidence/20261121-artist-brand/ive-home-1440.webp) · [手机目录对照](../evidence/20261121-artist-brand/ive-members-390.webp) · [桌面目录对照](../evidence/20261121-artist-brand/ive-members-1440.webp)

## 五团的成员肖像

| 团体 | 这次采用的照片及原件入口 | 改前默认图合计 | 改后默认图合计 |
|---|---|---:|---:|
| NewJeans | 从日本官网《How Sweet》五人发行图版分别取景，交叉核对成员版标签。四位现役与历史成员 DANIELLE 各归其位，可打开官方整版、原资料照及 DANIELLE 的 SPUR 原封面 | 774,365 B | 310,108 B |
| ADYA | 五张 2023 年公司采访供图统一取景，保留全幅。页头采用 Starting House 标志影片字标 | 2,413,430 B | 162,616 B |
| W!TCHX | 从公司五张具名原卡裁出 3:4 肖像，可打开原卡；页头字标源自同一公司官网图形 | 255,250 B | 147,788 B |
| GENBLUE | 从 TEN Entertainment 六张横版资料卡分别取景，保留完整卡上的资料与公司字标 | 649,334 B | 498,248 B |
| Rocket Punch | 将 SUYUN 的《BOOM》横照裁成竖幅，保留原照。页头加入 Woollim 标志影片图章 | 2,189,826 B | 78,562 B |
| **22 张合计** | 按稳定成员 ID 对应同一个目录位置，各计一次 | **6,282,205 B** | **1,197,322 B** |

默认文件合计少 5,084,883 B，下降 80.94%。该值按 Git 中的文件长度计算，实际访问流量还取决于缓存和放大操作。Figma 原文件已同步五组具名选图；每团材料板标出来源，个人资料入口保留原图。[改前改后选图](../evidence/20261121-artist-brand/portrait-comparison.webp) · [22 张图的身份、裁切及指纹](../evidence/20261121-artist-brand/portraits.json) · [NewJeans 发行页](https://www.newjeans.jp/news/eefrjs) · [五个 Figma 画板和公司来源](../evidence/20261121-artist-brand/sources.json)

## 全团检查与工程修复

在最终生产构建的本地 Worker 上，逐团打开首页和成员目录，分别用 390 × 900、1440 × 900 验证实际页面标题、背景、字体、标志与图片解码。204 次检查没有横向溢出、脚本异常或页面报错。ifeye 与 izna 在 Shadow DOM 内检查。UDTT 在两个公开入口核到可重试的降级态；受限原生页头、成员图的成功态待 owner 环境验证。数据为公开身份与合成空评分，固定远端大图在浏览器用仓库原字节响应。[51 团逐屏读数](../evidence/20261121-artist-brand/group-review.json) · [前 17 团画面](../evidence/20261121-artist-brand/group-review-1.webp) · [中间 17 团](../evidence/20261121-artist-brand/group-review-2.webp) · [后 17 团](../evidence/20261121-artist-brand/group-review-3.webp)

除上述六团，ILLIT、RESCENE、PURPLE KISS 补回图形页标。七团共用模板接入自托管字体，MADEIN、tripleS、RESCENE 收紧成员目录。Weeekly、fromis_9、SPIA、VCHA 分别采用符合各自设计的淡莓粉、薄荷绿、鼠尾草绿和浅粉。AtHeart 的网页字体与原 Figma 的 Inter、Noto 对齐，原官网黑白双层导航继续使用。其余团页保留各自已审的纸色、摄影、图形与排版。[AtHeart 官网研究及原字体差异](20261024-atheart-review-completion.md) · [逐团结果](../evidence/20261121-artist-brand/group-review.json)

页头记录区分团体图形、已有设计字标与共站 STAGE 导航。NewJeans、AtHeart、TRACER、EVERGLOW、fromis_9 和 IZ*ONE 又从官网或当期存档成功取回原图，六份 SHA-256 均与仓库原件相同。TRACER 的团体图形在页面内容中。18 团沿用设计字标，官方图形仍需单独出处。共站导航的 STAGE 标志保留其站点入口含义。[六份原件回读](../evidence/20261121-artist-brand/retained-mark-checks.json) · [标志清单与实际页头](../evidence/20261121-artist-brand/group-review.json)

22 位成员均从真实目录点进资料，手机及桌面共 44 次打开并解码对应原图，关闭后焦点回到原按钮。此项复验发现 GENBLUE 在页面刷新数据时会重挂成员组件、关闭灯箱。修复后六人两宽均通过。另将 Hearts2Hearts《The Chase》和 Billlie《RING X RING》的旧测试接到现行表单，实测切换舞台来源保留草稿并阻止错存。[逐人操作结果](../evidence/20261121-artist-brand/original-viewers.json) · [GENBLUE 修复](https://github.com/KAtOReNA7/idol/commit/b07e88f6878009f4daf1748600be95057f17f0b9)

本地 Windows、WSL Linux 和 GitHub 托管 Windows、Ubuntu 均通过 `npm run verify`，包括类型检查、现行回归、生产构建、素材及构建后检查。完整 `npm test` 仍有历史失败，逐平台、文件、用例名与出现次数比较，Windows 从 199 降至 197，Linux 从 195 降至 193，新增失败均为 0。托管 Ubuntu 与本地 Linux 的失败逐项相同。原有 5,418 个生产远存路径和 309 个认人远存路径逐一比对 Git blob，均与各自固定提交一致。本轮代码及截图在开发分支交付，正式站发布需另行授权。[完整测试口径](../evidence/20261121-artist-brand/tests.json) · [GitHub Actions](https://github.com/KAtOReNA7/idol/actions/runs/44900302720) · [原件核验](../evidence/20261121-artist-brand/assets.json)

## 下一批顺序

1. 先补 i-dle，随后 Kep1er、XG、LOONA 的 MV 具名资料，余量分别为 64、49、49、47 个截图位置。按作品时期、阵容和成员核对，继续保留旧画面和出处。[上一轮逐团余量](../evidence/20261121-love-dive/media-measurement.json)
2. 核 STAYC、ITZY、NMIXX、aespa、LE SSERAFIM 的成员入口。这五团在 390 像素下先展示完整团照和公司介绍，目录第一张候选人像在第 1,010 至 1,562 像素。用已有设计做直接进入成员区的交互对照，同时按一手资料继续核 18 个沿用的设计字标。[本轮手机实测](../evidence/20261121-artist-brand/group-review.json)
3. 工程迭代接着核 IVE／BADVILLAIN、MEOVV 的旧详情断言，覆盖草稿、换源、原图与返回焦点。继续按同平台失败清单确认修复效果；UDTT 成功态在可核受限原件的环境验收。[全项目顺序与工具](../PROJECT-AUDIT-AND-ROADMAP-20261121.md)
