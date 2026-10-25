# 全团统计、MV封面/认人图补齐与个人页布局盘点

- 用户确认v7，可以继续开发；冻结基线`d412376bd7f72df83d6a6bf46d9cd8e3b0a78f65`，分支`codex/statistics-mv-identity-completion`。已查工作树、fetch；正式源码为`apps/idol-site/`。
- 统计：继续寻找全部INS/X/YouTube人数、累计销量与打歌一位。用户本轮明确允许确无数据或实在找不到时显示0；证据必须区分真实零与未找到，不伪造人数、时点或全球口径。没有官方账号的平台不显示，现有项目自适应排版。
- MV：检查所有既有团体涉及作品的精确视频封面及对应成员同MV时期/同妆造高清认人图，统一显示尺寸、避免黑白留边，原图保留。成员身份以来源具名/明确用户确认核验，不用普通档案照冒充MV造型。
- 用户澄清：**仅没有成员出镜的MV关闭成员评分，仅保留MV评分；缺合格认人图不构成关闭理由。** 无关联记录、资料缺失、动画/歌词等类型标签本身都不能代替出镜证据。
- 个人页面：只统计51团当前实际成员详情路由、模块顺序、布局家族和覆盖缺口，交用户决定后续统一，不提前重构。
- 范围：保留已认可团页风格、既有稳定ID和个人评分/备注/观看状态。网站继续同一`appgprj_6add2704bc6c81918d3e0e2f13130422` owner-private只读审阅；旧v186不覆盖。保存功能的无人规则需在正式源码前后端一致验证，不能误称静态站已进行真实保存。
- 资料研究按Sites技能允许的有界委派分为统计、MV素材、个人布局三项；共享UI、保存与打包由主代理维护。临时研究/截图位于仓库外`C:/Users/61919/.codex/visualizations/2026/10/25/statistics-mv-identity/`。
- 已读取Sites与frontend-testing-debugging技能。Browser插件未提供，后续使用现有Playwright/system Chrome进行本机渲染验证，保持部署/HTTP/浏览器/保存各层报告。
- 最终发布与未解决项见下方2026-10-26交付记录；早期公共检查点不代表最终覆盖数量。

## 公共素材检查点（未发布）

已核对GitHub仓库仍为public。新增目录仅公开可重新取得的图片原字节，未增加私人附件或个人分数。628封面及1149精确成员/作品/视频公开图绑定已投影；部分为低清/来源具名章节，不能称全量高清完成。51团255视口信息区与605作品手机详情结构首轮通过，原图交互脚本选择器待修，最终字节/边框和新增图复验进行中。该检查点先推公共原图以取得固定SHA，供后续同站包引用；不代表发布或用户验收。


## v8交付（2026-10-26）

### 发布与代码

- 同一用户指定站点已发布v8，保留owner-private/只读：[团体索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups)、[完整报告](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/review-all/completion-report.html)、[待补图CSV](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/review-all/missing-mv-identities.csv)。旧正式站v186与main未改。
- 公共原图检查点`90e33cd9fb56f0cd99ad94f5c6afe7eb812e2a2c`已推送；新增目录仅公开来源图片。后续最终数据清单隔离12个无当前关系候选，最终可用绑定1137条，不是检查点1149条。
- Sites项目`appgprj_6add2704bc6c81918d3e0e2f13130422`，源提交`28ce1d204bd2500a8f1a459e00531c795c8ef348`；部署`appgdep_6ade34f6f4a88191a422f47f764017db`，版本`appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_920bd0cbe62081918eaadf4abbd41b69`，返回succeeded。随后get_site确认v8及仅owner访问。
- 可接续Sites目录`C:/Users/61919/.codex/visualizations/2026/10/25/group-photo-refresh/site-generated-originals`；其`.openai/hosting.json`才是此次站点ID。归档237,673,210 bytes；同站1099份原文件，静态包259,073,299 bytes。其余公开原图引用GitHub固定SHA；不压缩改写原图。
- 沿用已确认51团设计和公共Apple Music风格布局，本轮仅补资料、照片、来源、裁切与必要规则。个人页未统一重构。

### 资料与实现

- `group-statistics-completion-evidence.json`：153账号均有身份来源；147人数有可查值、6项未知显示0；42团销量有公开累计/可复算下限、9团未知；27团一位正数、20团确认0、4团未知。统一万单位，保留原公开精度、日期、范围、来源；未知不是确认零。未找到能证实不存在的平台，当前每团3平台，逻辑支持不存在时不展示。
- 修复ODD YOUTH错误X入口；VCHA显示现名GIRLSET账号而不改历史作品归属；EVERGLOW新账号不移植旧粉丝数。SPIA INS handle来源冲突、tripleS/fromis_9销量汇总差异和一位来源差异保留注释。销量不将局部月份冒充全球总数。
- 封面628张：605条已有非占位作品+23个独立页精确视频槽，包含MV、表演、歌词等版本。1137条精确成员/作品/视频认人绑定、40团205作品；原字节1758个唯一文件均在本地及GitHub固定SHA远端通过HTTP/长度/SHA核对。
- 统一3:4显示；39封面去嵌入边框、223认人图使用显示裁切。1137条实际3:4联系表全查，调整125个人物构图（含NaKyoung右侧切脸）。原图入口保留完整字节；普通档案照不再冒充同MV图。第三方具名章节图未独立逐帧核验，来源等级明确。
- 修复WOOAH、YOUNG POSSE、BEWAVE、Candy Shop、GENBLUE原本未渲染封面的目录，并接入ifeye/izna原生Shadow DOM封面。ReliableImage原图模式跳过去边放大；ITZY小屏封面越界已修复。
- 无成员规则仅绑定5个workId及当前videoId：NewJeans GODS、XG UNDEFEATED动画版、aespa Better Things æ版、ITZY Not Shy English ZEPETO、Hearts2Hearts STYLE Teenieping。前端明确提示；两种服务端保存路径在写入事务前禁止成员score/stylingScore更新，保留旧值/备注及作品MV评分。缺图不关闭。
- 个人页盘点338上下文/331人、336有效独立详情与338共享页，7类编排。NMIXX/JINNI、LE SSERAFIM/KIM GARAM两历史独立详情缺失；4团33详情默认折叠、7团56详情无叙述简介/经历、BADVILLAIN7详情缺直达共享入口。共享页279有经历、323有作品关系、15有公开作品资料；个人社媒0收录不是现实无账号。基线v7，结构盘点主动屏蔽媒体，不当作图像验收。

### 验证与剩余

- 88项专项/回归、`npx tsc --noEmit --incremental false`、正式`npm run build`通过；测试仅合成数据。维护了过时封面断言，同时保留历史原图SHA测试和全量精确封面/身份绑定、舞台隔离及保存规则测试。
- 本地255信息区布局、605作品手机详情、6交互；40共享布局/5流程；8团40独立页封面布局；最终125裁切修改涉及73作品复查/6交互通过。1758个远端原图HTTP/SHA核对全过。报告两张51行表通过。
- 线上使用服务身份Chrome，非用户本人IAB。共享40布局/5流程、8团40独立页封面检查通过；信息区及作品抽样最终结果以验证JSON为准。首轮WOOAH在字体/容器布局尚未稳定时读到scrollWidth416，单独复核3秒后390且无越界元素；检查器改为等待document.fonts.ready及双动画帧，再复验51团，不改生产CSS掩盖问题。
- 仍有1691条既有关系缺合格公开认人图，400作品无本轮公开认人图（含133条原本无成员关系）；47条card_only需提高清晰度。QWER无安全具名单人MV图；12条无关系旧候选隔离，不擅自增加评分关系。完整逐项缺口见报告/CSV与素材审计。
- 真实生产保存、所有视频完整播放、80%/125%原生缩放、用户本人IAB、新Figma同步未验。open_in_codex返回queued，不视为用户浏览器通过。
- 大型审计JSON换行从CRLF归一LF导致较大diff，未改写已推送提交。结束前须提交最终实现、证据和文档并推送本分支；draft PR基于`codex/group-photo-information-refresh`，不合并main。

最终线上复验通过：51团手机信息区、22条作品封面/认人图抽样、5条无成员规则与1条原图/关闭交互；无运行时错误。结合此前线上40共享布局/5流程、40独立页封面检查，均为v8服务身份Chrome，未扩大到用户IAB或全量线上作品验收。
