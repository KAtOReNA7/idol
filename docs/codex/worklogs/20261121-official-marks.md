# 十八团标志来源、页头与发行时期

上一轮 51 团视觉检查中，有 18 个团页沿用设计字标。本轮为其中 17 团找到可识别的团体标志，分别接入首页和成员等栏目。VVUP 的雪地字标来自 2024 年 12 月 29 日官方账号头像，采用在《4 Life》的发行详情。十八张展示图共 457,898 字节。六张沿用原件字节，另十二张依页头底色和原图留白调整。已分别核对 18 份来源文件和 18 张展示图的长度及 SHA-256。[逐份来源、处理和指纹](../evidence/20261121-official-marks/source-marks.json) · [Figma 对照板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1348-1109)

| 来源 | 本次采用的标志 |
|---|---|
| 官网、艺人平台和同期官网存档 | izna 日本官网独立图形、ifeye 官方平台、BEWAVE 官方平台、Candy Shop 日本官网、Geenius 公司图形、VCHA 2024 年 JYP 官网、i-dle 的 CUBE 日本官网、WOOAH 2024 年日本官网、Billlie 日本官网、KATSEYE 2024 年出道官网 |
| 公司供图、标志影片和官方频道 | YOUNG POSSE 出道公告中的 RBW／DSP 供图、ODD YOUTH 的 TOP Media 标志影片、BADVILLAIN 官方频道的金色 BV 图形、Cherry Bullet《Cherry Dash》时期字标、Weeekly《Bliss》时期字标 |
| 唱片与发行时期图形 | SPIA 两张唱片上的 SP 团章、HITGS 首张唱片上独立的 HITGS 标签、VVUP《4 Life》期间的官方头像 |

例如，WOOAH 使用 2024 年存档页头图。VCHA 使用《Only One》发行当日的 JYP 页头。Cherry Bullet 在实际手机和桌面页头均为炭黑底；最初试色的深红字为 2.34∶1，改用官网频道头像字形的浅色像素中位数，前景 `#e2d3b8` 对 `#1f1f1f` 为 11.18∶1。Figma 图板保留了十八个独立素材图层、可编辑名称和来源标签。[WOOAH 当年官网](https://web.archive.org/web/20240618122436id_/https://wooahjapan.jp/) · [VCHA 当年官网](https://web.archive.org/web/20240315070515id_/https://vcha.jype.com/) · [Cherry Bullet 官方频道](https://www.youtube.com/@CherryBulletOfficial) · [画板图层回读](../evidence/20261121-official-marks/figma.json)

## ifeye 的公司及历史署名

11 月 2 日 HI-HAT 的官方公告列出六名成员，确认原专属合约于 11 月 1 日结束，六人于 11 月 2 日起以 ifeye 名义转入 초록뱀뮤직。两个实际日期分别进入团体时间轴和六名成员的公开关联。此前 HI-HAT 官网的五人宣传照沿用原摄影署名，并链接到仍展示该照片的官网存档。SASHA 六月的恢复安排继续按当时能核实的计划呈现。[公司公告](https://artist.mnetplus.world/main/stg/ifeye/contents/6ae7804cde658677642a4ed3) · [历史官网照片来源](https://web.archive.org/web/20261018112905/https://www.hihat.co.kr/eng/artist/458) · [六人的身份记录](../evidence/20261121-official-marks/ifeye-company.json)

## 验证

本地 Windows 生产 Worker 使用隔离的合成 D1。在 Chromium 的 390 × 900、1440 × 900 视口逐一打开 17 团的首页和成员目录，另打开两宽的《4 Life》详情，共 70 次。68 个页头和两幅发行期头像均完成解码，34 次从成员页操作页标返回。页面异常、框架错误覆盖层和横向溢出均为 0。固定远存的历史素材由仓库原字节提供，页标由生产 Worker 直接提供。Cherry Bullet 调色后另外实开两宽首页与成员页，四次均通过。[逐页浏览器读数](../evidence/20261121-official-marks/browser.json) · [18 个手机实页截取](../evidence/20261121-official-marks/mobile-mastheads.webp)

历史日期断言继续验证十月的整文件 SHA 和 623 个历史事件。目前共有 625 个事件，其中 623 项可展示，2 项继续待证。按实际日期、公告日、历史摄影署名、六个稳定成员 ID 及无作品绑定分别检验本次两个新增事件。五个时间轴文件和一组日期收口回归共 113 项，全部通过。UDTT 和 AtHeart 的报道卡分别核对十月原文、现行的「0（未查得）」、确有出处的采访或公告日，以及仍为空的实际生效日期。另一批团页与原生路由检查 31 项，30 项通过，ifeye 历史审阅包依赖的 Rocket Punch 字体触发原有独立构建检查。[十月历史测试清单](../evidence/20261121-project-optimization/remaining-tests.json) · [日期收口记录](../evidence/20261101-closeout/closure.json)

## 正式站

正式 v203 对本轮十八条新素材路径全部返回 404。发布后从同一域名匿名 GET，十八个路径全部返回 200，每个文件的大小和 SHA-256 均与来源清单吻合。[上线前逐文件回读](../evidence/20261121-official-marks/production-before.json) · [发布后逐文件回读](../evidence/20261121-official-marks/production-assets.json)

在正式站再次以 390 × 900 和 1440 × 900 两档完成 70 次浏览。68 个团页页头及两幅《4 Life》头像均解码并通过浏览器端指纹核验，34 次点击均返回同一个团的主页。ifeye 原生时间轴在两档均展示 11 月 1 日和 11 月 2 日两个实际日期。可见内容、脚本异常和横向尺寸均已检查。第一次并发检查时，Cherry Bullet 手机成员页导航超过 65 秒；单独读取返回 200，手机和桌面的浏览与跳转随后均通过。另复跑了截图时曾重新挂载的 ifeye 页头，以及晚于标志加载的 Billlie 成员目录标题。[正式站 70 次浏览、重试与跳转](../evidence/20261121-official-marks/production-browser.json) · [十八组正式站画面](../evidence/20261121-official-marks/production-mastheads.webp)
