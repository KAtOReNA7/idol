# v218 正式站 51 团首页指定 MV 卡的呈现时间与键盘顺序

2026 年 11 月 22 日，Codex 内置浏览器在同一热会话中访问 51 个团体首页，桌面正文宽 1,265 px，每团一次。首次观察到**各团采样规则指定的 MV 控件**，桌面中位数为 **1,493 ms**，范围为 510–6,550 ms。另测 Billlie 手机正文宽 375 px 一次。52 次访问中，实际 Tab 焦点均先到指定 MV 控件，后到指定专辑控件。原先将其称作「全页首个 MV 入口」扩大了测量范围。[52 条原始记录](../evidence/20261122-v218/formal-home-access.json) · [逐团采样选择器](../../../apps/idol-site/tests/fixtures/mixed-media-routes.cjs)

此前，正式 v212 的 51 个首页和 49 个目录中，有 96 页同时展示 MV 和专辑。375 和 1,265 px 两档的指定栏目均按 MV、专辑排列。扩大到栏目外的独立入口后，正式 v219 实测有 **7 团在两个宽度下均先出现发行入口**，共 14 个画面。下面列出位置及去向。[96 个混合页面的栏目排序](../evidence/20261122-v213/formal-media-order.json) · [7 团双宽的全页坐标](../evidence/20261122-v219/formal-early-releases.json)

## 取样卡之前还有哪些作品可以点

用 v218 的 48 个 React 团页组件和 3 个独立渲染器检查首页正文，确认 13 团的主视觉区在原取样卡前另有具名作品链接。正式 v218 在 1,265 px 下补测了这 13 个控件，从打开首页到首次观察到链接的中位数是 1,670 ms（1,358–3,052 ms），实际 Tab 中位数是第 7 次（第 6–13 次）。12 个首次观察到的链接通往站内作品，IZ*ONE 指向 YouTube。这组记录测量链接可见和获得焦点，未记录激活后的播放。[原路由组件夹具](../../../apps/idol-site/tests/fixtures/current-artist-pages.cjs) · [13 个主视觉入口的正式实测](../evidence/20261122-v218/formal-home-hero-entries.json)

| 团体 | 主视觉区较早的链接 | 取样卡指向 | 较早链接的位置 |
| --- | --- | --- | --- |
| IVE | LOVE DIVE | LOVE DIVE | `.ive-dive-actions a:first-child` |
| IZ*ONE | Panorama | Panorama | `.iz-screen-rail .iz-link:first-child` |
| BABYMONSTER | DRIP | DRIP | `.as-hero-buttons a.primary` |
| XG | WOKE UP | WOKE UP | `.nx-actions a.primary` |
| aespa | Armageddon | Armageddon | `.nx-actions a.primary` |
| UNIS | SWICY | SUPERWOMAN | `.uf-hero-actions a.uf-primary` |
| KISS OF LIFE | Sticky | SWEAT | `.kf-hero-actions a.primary` |
| STAYC | SO BAD | 2 L0VE | `.sc-hero-actions a.primary` |
| NMIXX | Heavy Serenade | Caution | `.nx-hero-actions a.primary` |
| KiiiKiii | I DO ME | Pop Off Pop Off | `.kk-hero-actions a.primary` |
| ITZY | WANNABE | Motto | `.iz-hero-rail a.primary` |
| LE SSERAFIM | ANTIFRAGILE | Come Over | `.lf-hero-actions a.primary` |
| SAY MY NAME | WaveWay | UFO (ATTENT!ON) | `.smn-hero-actions a.smn-button` |

前五团的两个控件对应同一作品，后八团分别对应两支不同 MV。UNIS 的团照和「观看 SWICY · MV」是独立元素，正式首页第 6 次 Tab 到达《SWICY》，原采样第 20 次才到《SUPERWOMAN》。IZ*ONE《Panorama》团照下的「观看与评分」在 v218 首次呈现和第 8 次 Tab 时均指向 YouTube，组件为该状态指定新标签，目录就绪后才改为站内详情。13 个主视觉区均通过链接选择作品，主视觉内没有嵌入播放器。[13 个入口的焦点和地址](../evidence/20261122-v218/formal-home-hero-entries.json) · [v218 的 IZ*ONE 首屏实现](https://github.com/KAtOReNA7/idol/blob/site/v218/apps/idol-site/components/candidate/izone-design.tsx#L25) · [UNIS 首页实现](../../../apps/idol-site/components/design-review/unis-design-review.tsx)

i-dle 和 Billlie 原来取样的就是主视觉中的图文 MV 链接，分别为《TOMBOY》和《RING X RING》。KISS OF LIFE、STAYC、LE SSERAFIM 原来取样的则是发行专题中的歌曲链接《SWEAT》《2 L0VE》《Come Over》。其后的指定专辑封面分别通往各团官方发行页。[取样控件与链接去向](../evidence/20261122-v218/formal-home-access.json)

另有 7 团的首页在最早的具名 MV 之前已经提供发行详情。逐一渲染对应落点，均有独立的发行标题和封面。IVE 可直接点封面，另六团可点宣传图旁的文字。正式 v219 的 14 次观察中，发行入口在 DOM 中排在 MV 之前，入口顶边的页面纵坐标也更小。下表分别给出桌面 1,265 px、手机 375 px 下各入口相对页面顶部的纵坐标。[逐次坐标、控件和去向](../evidence/20261122-v219/formal-early-releases.json)

| 团体 | 首页较早的发行入口 | 实际落点 | 桌面发行 → MV（px） | 手机发行 → MV（px） |
| --- | --- | --- | ---: | ---: |
| IVE | `.ive-dive-sleeve`，韩国单曲原版封面按钮 | `?section=works&release=ive-release-love-dive`，《LOVE DIVE》第二张单曲专辑 | 681 → 683 | 171 → 488 |
| Geenius | `.idol-geenius-introduction h2 a`，2024 Single: Voyage | `?section=works&release=voyage`，《Voyage》首支单曲 | 1,533 → 3,394 | 712 → 3,115 |
| SPIA | `.sp-hero-copy a.sp-button`，聆听 Deeeep | `?section=works&release=deeeep`，《Deeeep》第二张数字单曲 | 539 → 1,741 | 389 → 2,449 |
| EVERGLOW | `.eg-hero-copy a[href*="release="]`，发行详情 | `?section=records&release=everglow-bugs-4141746`，《CODE》迷你专辑 | 645 → 2,145 | 868 → 2,522 |
| Rocket Punch | `.rp-hero-copy a[href*="release="]`，BOOM 发行详情 | `?section=records&release=rocketpunch-bugs-4090900`，《BOOM》单曲 | 505 → 1,781 | 376 → 2,660 |
| Cherry Bullet | `.cb-hero-caption a[href*="release="]`，发行详情 | `?section=records&release=cherrybullet-bugs-4084323`，《Cherry Dash》迷你专辑 | 909 → 2,557 | 393 → 2,429 |
| Weeekly | `.wk-hero-caption a[href*="release="]`，发行详情 | `?section=records&release=weeekly-bugs-4104137`，《Bliss》迷你专辑 | 1,246 → 3,119 | 463 → 2,212 |

ifeye 和 UDTT 的原生首页在取样 MV 之前提供了目录入口。izna 则先列了一场可直接打开的《METRONOME》舞蹈表演，之后才到取样的 MV《DUMB HOT!》。舞台与 MV 分属不同版本。点击作品卡到详情按钮可见的正式读数另有记录，不能移用于上表的其他入口。[ifeye 首页](../../../apps/idol-site/lib/idol/ifeye-runtime/ifeye.mjs) · [izna 首页](../../../apps/idol-site/lib/idol/izna-runtime/izna.mjs) · [UDTT 首页](../../../apps/idol-site/lib/idol/udtt-native/presentation.mjs) · [作品卡点击记录](../evidence/20261122-v218/formal-first-work-details.json)

## 指定 MV 控件何时出现

| 桌面取样控件的去向 | 团数 | 首次观察中位数 | 最早至最晚 |
| --- | ---: | ---: | ---: |
| 全站作品详情 `/?view=works&work=…` | 45 | 1,515 ms | 510–3,115 ms |
| 团内作品详情 `/artists/…?section=works&…` | 4 | 783 ms | 536–1,028 ms |
| UDTT 原生作品链接 `#/udtt/work/…` | 1 | 6,550 ms | 6,550 ms |
| AtHeart 作品按钮 | 1 | 535 ms | 535 ms |
| 全部桌面团页 | **51** | **1,493 ms** | **510–6,550 ms** |

TRACER 的取样控件最早出现。四个团内路由分别来自 W!TCHX（536 ms）、BADVILLAIN（539 ms）、ifeye（1,027 ms）和 izna（1,028 ms）。UDTT 的目录请求在 1,445 ms 已完成，到观察到取样 MV 控件又间隔约 5.1 秒，原因尚待定位。[逐团目标与耗时](../evidence/20261122-v218/formal-home-access.json)

实际出现时刻介于最后一次未找到控件的 `lastMissingMs` 与首次找到的 `firstSeenMs` 之间。桌面 51 个区间宽度为 26–80 ms，中位数 42 ms。每团单次热会话的观测上界仅用于说明显示等待，打开详情、图片解码、起播及相对旧版的提升均需另测。[逐次轮询时刻](../evidence/20261122-v218/formal-home-access.json)

## 指定控件出现时的目录请求

浏览器在观察到取样卡时采样一次，约 350 ms 后复采。桌面两次采样实际间隔 356–398 ms，中位数 358 ms。下表累计当时已在 Resource Timing 中完成的目录请求。`transferSize` 含响应头，另两列分别给出编码和解码后的响应体。首字节时间按 `responseStart − requestStart` 计算。[逐请求记录](../evidence/20261122-v218/formal-home-access.json)

| 桌面采样时点 | 已完成请求 | 有记录的团数 | 传输合计 | 编码后响应体 | 解码后响应体 | 首字节中位数（范围） |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 首次观察到指定 MV 控件 | 27 | 27/51 | 377,517 B | 369,417 B | 2,416,206 B | 580 ms（553–2,069 ms） |
| 约 350 ms 后 | 29 | 29/51 | 393,614 B | 384,914 B | 2,482,914 B | 577 ms（553–2,069 ms） |

首次采样已有目录响应的 27 团，指定控件出现时间中位数为 1,874 ms，其余 24 团为 565.5 ms。复采新增 ifeye 和 izna 的两个响应，共 16,097 B。22 团到复采时仍无已完成的目录请求记录。尚在传输的请求和文档、图片等其他资源未计入表内。[两次采样的逐团差异](../evidence/20261122-v218/formal-home-access.json)

## 指定控件的实际 Tab 顺序

52 次访问中，指定 MV 控件均在指定专辑控件之前出现在 DOM 中并获得实际 Tab 焦点。桌面首次命中 MV 栏目的中位数为第 22 次 Tab（第 6–41 次），首次命中专辑栏目的中位数为第 29 次（第 7–51 次）。ifeye 和 WOOAH 在指定专辑控件前各有两次 MV 控件命中，各类取首次获得焦点的步数。[原始焦点序列](../evidence/20261122-v218/formal-home-access.json)

Billlie 在 375 px 宽度下于 **1,523–1,570 ms** 之间观察到《RING X RING》取样入口，第 6 次 Tab 到达该入口，第 8 次到达《the collective soul and unconscious: chapter two》发行入口。目录响应在 1,540 ms 完成，传输 10,939 B（编码后 10,639 B、解码后 75,236 B），首字节 561 ms。1,928 ms 复采时仍是同一响应。桌面取样为 1,515 ms，两个控件也位于第 6 和第 8 次 Tab。[Billlie 两个宽度的记录](../evidence/20261122-v218/formal-home-access.json)

IVE 取样卡的可见文字是箭头。按无障碍名称规则计算，链接名称为 `LOVE DIVEMV ↗`，歌名来自封面的 `alt`。共用此组件的七团有 20 张首页卡和 110 张作品目录卡，均含本卡作品名。原始数据的 `first.name` 是采样脚本记录的控件标签。[七团卡片实现](../../../apps/idol-site/components/seven-redesign/artist.tsx)
