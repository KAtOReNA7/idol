# WOOAH 正式接续与页面审阅

> 后续：用户提出三项布局反馈，已按[2026-10-23 修正记录](20261023-wooah-layout-feedback.md)更新审阅页；WOOAH仍未获人工通过。以下保留首轮v11事实。

- 用户决定：2026-10-22 北京时间，在 GENBLUE v10 修复版地址后回复“这一版可以 继续开发吧”。GENBLUE 本次页面获人工认可，允许下一团；仍执行逐团交地址、逐团确认，当前仅 WOOAH。
- 代码基线：`c523b0bcfdc58b5d05542fd802383c4df441c92e`，来自 `codex/genblue-native-integration`，继续承接 `handoff/codex-20261022`，不从旧 main 开发。
- 当前任务分支：`codex/wooah-native-integration`；正式路径 `apps/idol-site/`。
- 原始输入：`handoffs/codex-20261022/combined-integration` 的 WOOAH native v1.2；23 个专属文件、1569734 B 逐项 SHA/bytes 核对通过后接入，导航只追加 WOOAH，保留原五团注册与 GENBLUE 增量。
- 页面设计：保留 Sol Photo v1 对应的黑色时尚实图方案。Figma `zeLNExz4TbpWRW3uiahef7` 的首页 390 节点 `945:1869` 已于本轮通过 get_design_context 取得代码与截图；真实照片和明确中文名的原有槽位保留，图片不从截图提取。全节点映射见既有 `sol-wooah-photo-v1-reference/photo-round/FIGMA-NODES.md`。
- 开发范围：精准成员与 MV 双向浏览；已有事件到作品的时间轴入口；资料来源修订；只读审阅构建与静态直接入口。
- 安全与数据：仅读取已批准的既有快照核稳定身份，不写真实评分/备注/观看状态；不改正式主站身份、共享范围、权限或保存实现。
- 浏览器边界：此前 cloud browser URL policy 拒绝无恢复证据，本轮不重试或换通道绕过；实际布局/交互/视口/缩放须保持未验。GENBLUE 用户认可不替代 WOOAH 验收。

## 本轮结果

阶段：正式工程接入和工程验证完成；同一 owner-private 审阅站 v11 已发布，等待 WOOAH 单团人工确认。正式主站仍为 v186，未发布本轮代码。

### 实际网页增量

- 保留既有 Sol Photo v1 实图设计、6 位成员档案与 24 个视频（14 MV、10 舞台）。15 张编辑图片保持原字节，合计 4517289 B；不把专辑封面充当 MV 截图。
- 接入 56 条既有唯一成员／MV 关系：出道 MV 关联 6 人，之后有明确记录的 10 支 MV 各关联 5 人。其余 3 支 MV 与 10 个舞台不推测成员。成员详情可到关联 MV，MV 详情可回成员；使用稳定 ID 和唯一作品／视频身份核对，重复或跨团关系拒绝绑定。
- 保留共享记录入口及既有保存权限。精确视频评分单独绑定，0、null、小数正确区分；不将 MV 分数套到舞台。
- 时间轴保留 6 个发行入口，新增 EXCLAMATION、WISH、Catch the Stars、JOY、Pit-a-Pat 对应的 5 个明确作品入口；沿用实际 workId，不按标题或日期猜关联。
- 更正成员背景及来源标签，移除无充分依据的主唱／领舞排名。SONGYEE 的 2020-08-14 离队公告来源与照片来源分别显示；日本官方档案列出的五人不被写成已核实的 2026 当前活动阵容。
- 新增 WOOAH 专用只读审阅构建：复用真实组件及共享记录页，提供物理 HTML 入口，记录链接在打开、新标签和历史导航时均留在 WOOAH 审阅路径。既有 GENBLUE 页面资源保持原字节。

### 资料依据

- NANA、WOOYEON：[2024 原采访](https://www.koreajoongangdaily.com/entertainment/after-17-month-hiatus-wooah-promises-its-back-for-good/10052139)。
- SORA：[2020 Edaily 采访](https://www.edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01118486625805984)。
- LUCY 及无固定职位说明：[2020 TenAsia 采访](https://www.tenasia.co.kr/article/2020052128104)；MINSEO：[2021 团体采访](https://www.allkpop.com/article/2021/01/interview-wooah-reveals-a-day-in-their-life-and-shares-a-special-message-for-wows)。
- SONGYEE：[出道介绍](https://www.wowtv.co.kr/NewsCenter/News/Read?articleId=A202005040057)；[转载 NV 声明的 Mydaily 离队报道](https://v.daum.net/v/20200814140041623?s=print_news)。

### 验证与保护

- `npx tsc --noEmit --incremental false --pretty false`：exit 0。
- WOOAH / GENBLUE 原生集成、时间轴、导航、返回及保存保护测试：44/44 通过，含 WOOAH 49 个实际组件 SSR 路径。SSR 与模拟导航不代表真实浏览器通过。
- WOOAH 审阅路由与 API 隔离：8/8 通过。构建时另有 9 项请求隔离检查；所有评分／备注／个人照片均为空，只有 56 条已净化关系，非 GET 拒绝，未知接口、身份接口和图片代理拒绝，不回落到真实网络。
- 资源保护回归：37/37 通过。WOOAH 正在使用的 `group-original.png` 仅在 3 个源文件、2 个实际编译载体及原图 SHA/bytes 全部匹配时精确放行；85 个旧 display 删除候选保持不变，86 个原图仍强制保留。
- 官方 `build-site.mjs` 在隔离原生源码副本干净构建成功。首次副本含上轮遗留 dist，唯一载体保护正确拒绝；保存旧产物后重建，完整 `prune-unused-build-assets.mjs` **dry-run** 通过，没有执行 apply。client 原始 481508043 B，候选节省 210208884 B，计算后 271299159 B；这不是最终 TAR 大小或可发布证明。
- 审阅构建 149 个源码输入 SHA 核对一致、62 项资源 6428301 B，15 张实图 SHA 一致；实际 TAR 逐项检查入口和资源。构建未修改个人记录或生产保存接口。
- 开发侧真实浏览器、手机／桌面布局、缩放、在线 URL/MIME 和真实保存未验：现有浏览器 URL policy 拒绝后未改通道绕过。设计截图只用于原设计比对，不作网页截图凭据。

### 已发布审阅版本

- [WOOAH 人工审阅入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)。本轮明确使用物理 HTML 地址，保留无扩展名路由和 SPA 回退。
- 原站点 ID `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，仍为 owner-private；未更换主站或扩大共享范围。
- Sites v11，版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_7f099dcb1cd081919cdf2deb06699506`；部署 `appgdep_6ada35411f408191bffab883bf03d206` 返回 succeeded。
- 发布 UTC `2026-10-22T16:09:44.780294+00:00`（北京时间 2026-10-23 00:09）。Sites source `2061dfc1a53382ab41a8d431ede14bf2f1539481`。
- 本地审阅归档：101 文件，文件内容 13129063 B，实际展开 TAR 13230080 B，gzip 9733675 B。gzip SHA256 `99c2b1c818658e78a794426910742954e9a9ac990c7be7b56af4067cf29b0870`；该值与服务端重新规范化的存储哈希不是同一对象。
- sourceFingerprint `4da1359a15afe49ee3588da1a49935a9e748ab9db8951b75c4f681401d6a3a2b`；审阅 manifest SHA256 `5602db772db5a8e7ad2203dce9f926bcf1c9ed0b5cc5362fba9e7deafe82a4ed`。
- GitHub 交接分支 `codex/wooah-native-integration`，以 `codex/genblue-native-integration` 为 PR 基线，继续继承 handoff。代码、本文、STATUS 同提交；实际提交可用 `git log -1 -- docs/codex/worklogs/20261022-wooah-native-integration.md` 查询，PR 中记录发布与验证回执。未合并旧 main。

### 复现入口

在 `apps/idol-site` 使用既有依赖环境运行类型检查，以及 `node --test tests/wooah-native-integration.test.cjs tests/wooah-timeline.test.cjs tests/genblue-native-integration.test.cjs tests/genblue-review-routing.test.mjs tests/artist-navigation.test.cjs tests/artist-roster-return.test.cjs tests/navigation-save-guard.test.cjs`。

审阅构建命令为 `node scripts/build-wooah-review.mjs --out <仓库外独立绝对输出目录>`；审阅路由与隔离验证使用 `node --test tests/wooah-review-routing.test.mjs tests/wooah-review-isolation.test.mjs`。资源守卫验证使用 `node --test tests/prune-unused-display-assets.test.mjs`。新电脑需按 Sites 官方环境安装依赖、干净构建并重查载体；不要把旧 dist 带入。

## 下一步

先请用户确认 WOOAH 页面，未明确通过前不开发第三团。后续仍需补开发侧真实浏览器验收和真实保存检查；24 个视频的精确预览配图仍缺，不使用专辑封面或示意图冒充。完整主站包体需重新打包计量并另行处理，本轮未 apply 剪枝或发布主站；旧轮 271.328125 MiB TAR 仅为历史测量，不能当作本轮实际归档大小。
