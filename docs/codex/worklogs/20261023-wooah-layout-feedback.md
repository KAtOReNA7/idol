# WOOAH：团照首屏与统一成员照片

- 时间：2026-10-23，北京时间。
- 用户反馈：WOOYEON／朴镇更被独立放大；首屏使用单人写真而非团照；其他成员照片尺寸不一。两张用户截图已实看，不将其当作新版本浏览器验证。
- 分支：`codex/wooah-native-integration`，接续提交 `0b19e11594dd95d3962f0b36c7166bff5164d466`，同一 [PR #5](https://github.com/KAtOReNA7/idol/pull/5)，正式代码 `apps/idol-site`。仍继承 `handoff/codex-20261022`，旧 main 未动。
- 原因：旧候选在代码中将 WOOYEON 指定为 featured 并从首页下方成员列表排除；团体合照下移；图片使用原比例 height:auto、底部对齐，目录还有专属跨列与错位。属于排版判断问题，不是用户侧图片加载问题。

## 修正

1. 首屏改用既有五人团体合照 `design.hero`，最大799px、保持799×533原比例；将下方重复的官方资料与来源合并到首屏。
2. 首页及成员目录都用完整五人数组和同一个等宽网格。移除单独个人主图、排除逻辑、三联/双联布局；历史SONGYEE继续另列。
3. 名册统一4:5照片视窗；桌面五列、中屏三列、窄屏两列，任何成员均不单独放大。中文名、艺名与来源区域对齐。
4. 名册仅CSS显示裁切，不重写图片文件：WOOYEON左侧对齐保留脸部，NANA顶部对齐保留帽子与头部；另三张本身为4:5。WOOYEON右侧部分身体与右下Singles字样会在目录视窗外，摄影来源独立显示；个人详情和查看原图保持完整图片，不声称整幅在名册无裁切。
5. 所有原图、成员ID、56条成员/MV关系、时间轴、真实保存逻辑保持。只读审阅中的个人数据仍为空。

## 验证

- TypeScript：`npx tsc --noEmit --incremental false --pretty false` exit0。
- 现有原生WOOAH、时间轴、审阅路由与隔离测试20/20。扩展现有49路径SSR检查：团照首页唯一出现、五人均在同一网格且各出现一次、成员链接保留、历史成员不混入五人网格。
- 官方干净原生构建成功；原图守卫37/37、完整pruner dry-run通过，未apply。仅按实际审查后的组件与两个编译文件更新SHA/bytes pins，85个旧display候选及全部原图保留规则不变。
- 本轮dry-run：clientBefore489898749 B，saved210208884 B，计算后279689865 B；不是最终TAR或生产容量通过证明。
- 独立素材审查确认现有WOOYEON无另一份已核来源竖图；左侧4:5视窗保留原图x=0..864/y=0..1080区域，可保留脸与头发。CSS裁切不等于新照片，原图未改。
- 审阅149个源码输入哈希与当前树一致。62项资源仍为6428301 B，未新增图片；审阅站94个非WOOAH文件字节保持，GENBLUE页面保留。
- 本轮未运行真实浏览器：已有URL policy拒绝未恢复，不重试或换通道绕过。首屏/手机/320/390/1440/2048/2560/缩放、控制台、真实点击与保存仍未验。用户反馈优先于旧Figma候选；未把旧画板宣称为本轮修改的设计验收。

## 发布回执

- 同一 owner-private 审阅站已更新至 v12；[WOOAH 审阅地址](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)。
- Sites source `fff05becda0f21d25794cec6f5ce3275425574af`；版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_d68d3c6bd4988191a6fd8b849d0bc2a6`；部署 `appgdep_6ada3ad6a8dc81919bedc3b19fb37abe` succeeded，UTC `2026-10-22T16:33:36.698178+00:00`（北京时间2026-10-23 00:33）。
- 归档101文件、内容13131117 B、实际展开TAR13230080 B、gzip9733809 B；本地gzip SHA256 `26f3c21cabddd81a7864311418f3a8866e939e1f82cc17662afa67ff4e847a83`。
- sourceFingerprint `580b7c129b5ad889477e6a25105a35f6906d5cb2b4a10a1739cefd426a9ea155`；manifest SHA256 `826cb29be4c51e6cefe709cae5c160db55a16989d86510d19d828560bcf01017`。
- 代码、STATUS与本日志在同一任务分支提交并同步PR #5；实际GitHub提交使用 `git log -1 -- docs/codex/worklogs/20261023-wooah-layout-feedback.md` 查询。

## 下一步

请用户复核WOOAH本轮三处修改；明确通过前不开发下一团。精确视频配图24项、真实浏览器/保存、正式主站容量与发布仍按既有worklog待办处理。当前交付为同站点只读审阅修正，不覆盖v186主站。
