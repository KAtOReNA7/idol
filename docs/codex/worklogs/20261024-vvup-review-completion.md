# VVUP 原生完善与 v20 私有审阅

北京时间 2026-10-24。当前主代理负责实现、集成、验证和发布；复用既有素材子代理核实具名来源和发行封面，没有并行修改共享代码。

## 基线与决定

- 仓库 `KAtOReNA7/idol`，正式工程 `apps/idol-site/`。基于 `codex/saymyname-review-completion` 的 `06601304be62beff7fea7a5f87fa9e3336e71c64`，当前分支 `codex/vvup-review-completion`。
- 用户在 SAY MY NAME v19 后回复“可以 继续开发”，已确认该页面。本轮仅推进原 Astra 名单中的 VVUP。VVUP 交付后等待页面反馈，再开始下一团；公共功能例外。
- 既有成员/作品/关系 ID、原图、评分、备注、观看状态及 owner-only 保存边界均保留。正式主站仍 v186；未合并 main。

## 页面与数据增量

- 新增独立 `components/vvup-artist.tsx` 与 `vvup-native.css`，由正式 `/artists/vvup` 路由使用。沿用更新的 Figma 深炭黑、酸黄、浅蓝与 Archivo Italic 标题；旧 generic candidate 保留为历史源。共享手帐的 VVUP 样式同步颜色和标题字体，其他团样式未改。
- 首页四张等大官方具名照片，中文名/艺名分行；成员搜索、详情、原图、关联作品和个人记录往返。官方四人为 Kim/Paan/Suyeon/Jiyoon；Hyunny 历史档案单列。底层五人的旧 `groupIds` 不代表当前名册，本轮未改原关系，而以具名画像的稳定 ID 决定官方展示范围。
- 七项发行搜索/详情，三张1200×1200正式封面，作品及搜索条件连续返回。VVON只关联已收录主打 Super Model MV；七个 release ID 显式允许返回。保留 `roster=history` 上下文，未知键、重复键、外部站点仍拒绝。
- 七支精确视频、六个既有舞台绑定、16条成员作品关系、九个时间轴事件。4 Life 仍为 `Special Video (Full ver.)`，不进入 MV 筛选；其实际发行日仍未知，延期计划与平台目录日期不冒充实际发行日。Doo Doom Chit音源3月13日与既有视频3月12日分开。
- 没有审核通过的精确视频配图时显示中性播放入口，不拿唱片封面充当MV截图。Hyunny照片、早期四张发行封面和MV个人造型缺口诚实保留。

## 素材与 Figma

`data/vvup-review-assets.json` 记录13个图片文件、来源、字节、SHA256和尺寸，总计2,324,878 bytes。保留8张原始文件（团体、4成员、3封面）及5张既有展示衍生图。新增封面合计1,619,384 bytes，下载后未改字节；成员670×670与团图670×223保持原图和完整构图，不宣称最大母版或更高分辨率。

具名来源重新读取 Weverse，发行页复核 Bugs。历史原始工具证据文件在当前检出缺失，因此清单区分本轮页面读取和保留的历史元数据，没有编造旧证据文件。Locked On已用Bugs明确发行字段复核2024-04-01。4 Life平台目录2025-01-10不是足够的实际日期证据。

Figma文件 `zeLNExz4TbpWRW3uiahef7`，page `802:1095`；桌面 `802:1096`、手机 `802:1097` 均实际读取 `get_design_context` 和截图。本轮8张真实图分别写入两个原生画板，共16个图片槽，FIT保留构图；节点、填充与上下文摘要见 [figma-evidence.json](../evidence/20261024-vvup-review-completion/figma-evidence.json)，最终截图同目录。内页完整原生Figma、官网/Spotify完整视觉研究仍未完成。

对照差异：网页增加必要的只读审阅提示与发行导航；首页影像展示最近两支，时间轴展示全部9条而不是Figma样本2条。桌面时间轴提高字号并采用日期/标题分栏，手机保持单轴；团图显示宽度不超过670，未因大屏强行放大。未将这些差异写成像素一致或设计验收通过。

## 工程和验证

新增 `review/vvup/` 与构建脚本；复用原生页及共享App，通过公开字段白名单清空个人分数、备注、观看、收藏和私人图片。构建在Node中核验源ID，原始snapshot与保存模块不得进入浏览器包。只允许本团 display-v1 GET；写入405、其他API404、外部fetch403，CSP connect-src none。真实保存未包含在此预览。

- **117项测试全过**：VVUP资料/资源/安全隔离/实际构建和路由，SAY MY NAME、KiiiKiii、共享导航回归。见 [tests.txt](../evidence/20261024-vvup-review-completion/tests.txt)。新增JSON导入最初不兼容旧VM测试加载器，已改为明确ID允许表，并有全七项一致性测试。测试复制时的旧团数量/素材路径已修正，最终全通过。
- TypeScript `--noEmit --incremental false --pretty false` exit0；正式 `npm run build` exit0，见 [build.txt](../evidence/20261024-vvup-review-completion/build.txt)。Windows使用已安装Node/npm-cli绝对路径运行原脚本，无依赖变更。
- Browser plugin not available；按测试技能使用已安装Chrome和bundled Playwright，未装新依赖。服务与浏览器均在Windows、`127.0.0.1:4179`。
- **21项交互/状态检查**：中英文成员搜索、原图及封面Escape/焦点恢复、成员→MV→精确舞台→返回、历史成员→记录→返回保留阵容、发行→作品→返回保留查询、时间轴→作品/历史成员→返回、空结果和未知身份、手机共享详情与控制台。首次历史记录测试定位错用了“返回VVUP”，实际控件为“返回成员主页”；修正定位后完整脚本通过，非应用缺陷。
- 七页×320/390/1440/2048/2560真实浏览器CSS视口，共35页，无横向溢出、损坏图、空页、框架错误覆盖层和console/pageerror。另检390宽共享影像详情。见 [browser-results.json](../evidence/20261024-vvup-review-completion/browser-results.json)及截图。不是原生浏览器80%/125%缩放或真实手机硬件测试。
- 最终审阅源码指纹 `11dc99428d14cee88dd54eaddcb1a0677036742f7b5bd0adf9721b199ced25f9`；13图片+字体共14资源3,066,246 bytes。全部资源字节与源校验一致；提交前复核153个源码输入SHA与发布manifest完全一致。

## 发布与 GitHub 交付

- [VVUP 私有审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/vvup/index.html)。v20已由get_site复核；owner-private仅当前owner，外部用户0。
- QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`；Sites source `e4d3aef4882c64e5872ffb16956c194c25c86f25`。
- deployment `appgdep_6adb8a1a6ddc81919c80dfadafbbf2ea` 返回 `succeeded`；version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_2f3d98bdcd748191b37cbb9e34608b9b`。
- 原216个静态文件SHA全部不变，增加21文件到237。gzip59,653,371 bytes，展开常规文件内容69,724,222 bytes（含hosting，不等同含TAR块填充的归档长度）。旧dist未更改。组装脚本首次在拷贝证据manifest时路径仍是旧团而失败，静态增量和旧文件SHA已完成；单独补拷正确manifest并复核216旧文件后才打包发布。
- GitHub代码、素材、证据与进度在 `48c2c7bb410a4fae8adf35550bd7609bf226c0d0` 推送；draft [PR #12](https://github.com/KAtOReNA7/idol/pull/12)，base为 `codex/saymyname-review-completion`，未合并。其后文档提交以分支最新远端HEAD为准，不把Sites提交混同GitHub提交。

线上地址已交给Codex浏览器面板，工具返回queued；没有已登录线上浏览器检查，不宣称线上页面已独立复验。

## 下一步与边界

1. 等待用户VVUP页面确认，先处理本团反馈，不提前开始下一团。
2. 待补Hyunny具名照片、四张早期发行封面、七支精确影像预览及MV个人造型；不猜成员参与或发行日期。
3. 完整Figma主要内页、进一步视觉研究、原生缩放、真实播放/owner保存和已登录线上浏览器复验仍待办。本地浏览器通过与部署succeeded不能代替这些项。
4. 保留其他团历史未验项、izna生产剪枝引用阻断与ifeye旧fixture失败；此轮未剪枝apply，不据QA包推出主站全量包合格。
5. 新电脑从 [RESUME](../RESUME.md) 检出当前分支最新远端HEAD，正式工程运行原Vite/Vinext脚本；不从旧main接续。本轮自有4179预览已停止，以线上地址交付。
