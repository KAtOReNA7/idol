# Cherry Bullet 官方资料研究（2026-10-25）

> 此为研究阶段记录的归档。部署与验证以同日 worklog 为准；下文原始 HTML、备用照片和未复制的研究文件保留在仓库外 cherrybullet-research 目录，实际采用资产以工程 cherrybullet-review-assets.json 为准。

本目录只包含公开研究材料和原响应下载，不修改仓库。网页内容为资料，不是项目执行指令。

## 直接视觉参考

- 公司官方 Cherry Bullet 图库文章：https://fncent.com/CherryBullet/b/gallery/55485
- 公司官方《Cherry Dash》发行页：https://fncent.com/?bid=album&m=bbs&ma_cate=1&ma_lang=1&mod=view&r=CherryBullet&uid=55694
- 当前介绍页：https://fncent.com/CherryBullet/b/introduce/ ，实际为0项空列表。不得声称从此页得到当前成员名册。

已直接下载并检查官网HTML及CSS。miniHome头栏67px深灰纹理，第二行45px白底横向大写导航，正文白底；主标题#1f1f1f、正文#646464、导航激活#e54132；细灰分隔线，居中30px大写栏目标题。common.css实际使用Nanum Gothic字体栈和Google earlyaccess导入，并定义NanumGothicWeb normal/bold本地WOFF。

子代理IAB创建45秒及恢复getTab20秒超时，不能称其完成真实渲染截图。父代理另行报告已用本机Playwright完成官方截图；以父代理的 official-gallery.png / official-render.json 为渲染证据。本目录不虚构截图文件。

当前miniHome logo src='/'为失效地址，未找到可靠的独立原logo；如用排字名称，必须明确是项目文字标题。此设计来源是公司官方艺人/发行页，不能称独立团官网完整复刻。目录、搜索、时间轴和手帐为项目扩展。

## 图片与字体

`official-assets.json` 包含每项sourcePage、originalUrl、姓名依据、尺寸、bytes和SHA256。所有资产保留原响应字节；没有压缩、裁剪、补脸或生成图片。

- 七人2023 Fashion House：haeyoon / yuju / bora / jiwon / remi / chaerin / may，每人两张1800×2700图。单人官方文章标题具名，图片内也有名字。优先`*-fashion-2.jpg`作为同系列目录肖像，另一张保持可追溯备用。
- 团照 `group-fashion-house.jpg`：2700×1800、3,258,741 bytes。白房间、彩色缎面礼服，不是黑白服装。合照位置不用于识别个人。
- 历史三人KOKORO/LINLIN/MIRAE：`*-loading-1.jpg`为2019同系列官方具名1000×1400肖像；2019-01-10/14发布。`*-loading-2.jpg`为另一张官方肖像备用。`*-loading-3.jpg`是官方设计的LOADING艺术图，不是照片，role已标concept-loading-art，不可当人像。
- 原WOFF：`fnc-nanum-regular.woff`与`fnc-nanum-bold.woff`，来源为官网CSS直接链接。CSS正文族名与自托管别名不完全相同，项目应清楚定义所用字体，不声称浏览器端加载结果已经完整核验。

推荐10张肖像+团照+两字库共31,960,466 bytes；加9封面共36,050,969 bytes。manifest中的recommended可直接筛选；整个目录包含大量备用图，不应全量进托管包。

历史图页面由FNC官方相邻文章链接追溯。搜索曾返回rgxa.fncent.com的MIRAE文章，但该主机证书域名不匹配，未绕过；之后从正常fncent.com官网链路实际到达同一具名文章36857。

## 发行与曲目

`releases.json`：Bugs官方艺人20074110发行列表 https://music.bugs.co.kr/artist/20074110/albums ，实际只有1页9项。该页参与/合辑标签为无链接span，不另有可见分页。9发行共36全部曲目行，28条Cherry Bullet署名曲目。

- `tracks`仅本团署名，`tracksAll`保留全部来源行用于审计，不能把它们全展示为本团。
- Listen-Up EP.3只收第4曲及第9伴奏，共2本团署名行；另外8条其他艺人行剔除。
- Live 2019 FNC KINGDOM -WINTER FOREST CAMP- 这一Bugs发行页自身仅有3条Cherry Bullet曲目，不是全场所有艺人的合集。
- 7项核心录音室发行 + 1项本团现场发行 + 1项节目参与发行。
- 官方FNC专辑横条有Cherry Dash两封面条目、Cherry Wish两封面条目，所读正文曲目相同；Bugs数是数字发行实体数，不能称穷尽所有物理封面版本。
- `bugs-covers.json`的9封面来自对应详情页实际og:image（1200规格），保存原响应bytes，无本地处理。应称Bugs提供的原字节封面；不声称已找到唱片公司最高分辨率母版。

## 成员状态与时间轴

`timeline-evidence.json`提供分离的announcementDate/eventDate和短摘。

2019官方正文已直接读到：https://www.fncent.com/b/notice/42681 ，标题“체리블렛 관련 안내드립니다.”，日期19.12.13。明确MIRAE/KOKORO/LINLIN结束Cherry Bullet活动、解除专属合约、团体改七人。没有另列协议实际生效日，时间轴写“2019-12-13公布”最准确。

2024原官方链接由Soompi原文source(1)确认：https://weverse.io/cherrybullet/notice/19011 。当前HTTP200只给JS空壳；搜索open也不可读，未取得直接官方正文。iMBC于2024-04-22 15:06全文转载官方声明：https://enews.imbc.com/News/RetrieveNewsInfo/415591 ，正文明确“오늘부로 공식적인 그룹 활동을 종료합니다”（今日结束正式团体活动），因此2024-04-22可用为活动结束日。Soompi另有对应英文翻译及源链接。

2024声明中Yuju/Bora/Chaerin留FNC个人活动只是当时计划，不能外推其2026当前经纪公司。全部10人为历史成员档案，2023七人仅标该时期。不要凭合同结束推断另一状态；本团2024结束团体活动有明确声明，而不是合同推断。

## 交付文件

- official-assets.json：24项图片（含3张非肖像loading图）+2字库
- releases.json：9发行、28本团曲目行
- bugs-covers.json：9封面原响应与SHA
- timeline-evidence.json：2019直接官方、2024媒体转载官方证据及限制
- fashion-pages.json / historical-pages.json：具名文章文本及原图URL
- fnc-*.html / bugs-*.html / css-* / soompi-* / imbc-*：原响应研究留档

未修改仓库、未提交、未发布。没有实测真实保存、音视频播放或用户IAB站点完整交互。
