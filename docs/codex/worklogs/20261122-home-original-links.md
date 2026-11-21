# 首页团照首次打开原图

2026-11-22，Cherry Bullet、Rocket Punch 和 Weeekly。正式站 v216 中，三个首页的团照入口在照片刚出现时第一次点击均未打开，待页面交互就绪后再点击才出现原图。

首屏 HTML 现在直接提供原件链接。页面交互就绪后，普通点击、Enter 或空格打开原有原图弹窗，Esc 返回触发入口。修饰键点击沿用浏览器的链接操作。四张首页 WebP 预览继续按原优先级显示。

| 团体 | 从首页 HTML 直接打开原图，修改前 → 修改后 | 原件 |
| --- | --- | --- |
| Cherry Bullet | 0 → 1 个有效链接 | `/artist/cherrybullet/official/group-fashion-house.jpg` |
| Rocket Punch | 0 → 1 个有效链接 | `/artist/rocketpunch/official-boom/boom-1-group-original.jpg` |
| Weeekly | 0 → 1 个有效链接 | `/artist/weeekly/official/group-1.jpg` |

以相同项目快照渲染首页，逐一比对初始 HTML 的链接与原件地址。三套静态审阅包的路由转换均保持这些地址。TypeScript 检查通过，51 团图片路由、共用组件、弹窗及三个静态审阅包专项共 257 项通过。正式站的首次点击和返回由本次整合发布实测。

## 七团共用首页

IVE、ILLIT、MADEIN、PURPLE KISS、QWER、RESCENE 和 tripleS 的首页共用团照组件。IVE 的《LOVE DIVE》学院概念照和 2022 年 STARSHIP 官网档案照各有一个独立入口。其余六团各有一个团照入口。匿名首次访问这七团时，服务器先发导航与读取状态。目录加载后八个入口才随照片出现，首次点击均能打开对应原件。图片、组件及弹窗专项 221 项通过。[正式站两种加载情况](20261122-v218-release.md)

## 十一个独立团页

ADYA、AtHeart、BEWAVE、Candy Shop、Geenius、HITGS、ODD YOUTH、SPIA、TRACER、W!TCHX 和 YOUNG POSSE 共 12 个首页入口。AtHeart 同一张图可点照片或「查看原图」文字，两个入口均可直接访问其 PNG 原件。其余团体沿用各自已收录的团照、图注和原件映射。十一团的实际首页初始 HTML 和原件文件均通过逐项核对，TypeScript 检查通过。

连同这些团的历史审阅包测试共运行 429 项，417 项通过。其余 12 项在未包含十一团改动的开发分支上逐项复跑，失败用例和原因相同。九项被审阅包内跨团字体路径阻断，一项 YOUNG POSSE 历史替代视频身份不符，两项 SPIA 和 TRACER 的旧作品绑定断言失败。

## 其余七个团页与全团核对

BADVILLAIN、EVERGLOW、fromis_9、i-dle、IZ*ONE、LOONA 和 WOOAH 的七个首页团照入口均已绑定原件。LOONA 使用十二人历史团照。三张分队照片保留原有操作。WOOAH 首页另有六个历年成员入口、三个封面入口，共九处沿用既有行为。

使用相同项目快照渲染 51 团的内容组件，并核对本地原件，共找到 28 团、29 张全团原图、30 个入口。图片出现时已有有效原件链接的入口从 0 个增至 30 个。正式站的初始网页在 20 团提供 21 个链接，另 8 团的 9 个入口随目录出现，正式浏览器逐项点击后均打开了目标图片。IVE 有两张图，AtHeart 的两个入口指向同一张图。[逐入口地址](../../../apps/idol-site/tests/fixtures/home-group-originals.json) · [正式站首击](../evidence/20261122-v218/formal-first-clicks.json)

| 其余团页 | 核对结果 |
| --- | --- |
| GENBLUE、UNIS、VVUP、Kep1er、NewJeans、BABYMONSTER、XG、aespa、KISS OF LIFE、STAYC、NMIXX、Hearts2Hearts、KiiiKiii、ITZY、LE SSERAFIM、SAY MY NAME、KATSEYE | 首页图片附近没有针对团照的放大操作。 |
| MEOVV、VCHA、Billlie | MEOVV 的八个放大按钮是发行封面，VCHA 的入口打开《Only One》发行视觉，Billlie 的首图进入发行详情。 |
| ifeye、izna、UDTT | 服务器先发出加载状态，页面由客户端挂载。初始 HTML 没有可见的团照按钮。 |

七团和关联历史用例共 375 项，365 项通过。剩余 10 项与修改前逐项对照一致，包括 LOONA 历史资源/编辑器断言、i-dle 旧测试渲染器和 WOOAH 静态审阅包字体约束。51 团当前图片矩阵、共用弹窗和 BADVILLAIN 专项 229 项全部通过，TypeScript 检查通过。以上结果均来自本机渲染及自动化测试，线上整站验收范围以发布记录为准。
