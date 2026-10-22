大型作品浏览与只读观看列表：独立模块交付候选

基线：a3e3be4，app/page.tsx、use-browse-journey.ts、journey.ts 与1804f12相同。
所有现有文件保持原样；APP_WIRING.patch 是独立提议，未自动接线/发布。

实现
- LibraryBrowser：原有公开名称搜索/队列/观看/舞台/排序 oracle，完整结果先排序再分页；24/48有界页，逐维撤销条件，条件化facet计数，加载/错误/空库/无匹配。
- ResultsView：受控1-based页码，跳页校验，明确范围/总数，主动分页后焦点；恢复先定位并挂载目标页，再等待restoreReady调用onRestoreReady。
- SequencePreview：原始完整ids与位置，只读有界预览，失效/筛除/成员关系断开状态；nextInSequence为下一支唯一依据，仅调用宿主onNext。
- examples/library-browser：真实组件生产构建宿主，SYNTHETIC seed20261016，100/1000/5000；内存历史前后退、Alt+Left、延迟布局、dirty拒绝/pending、删除/0分/未知ID、旧limit=96+anchor、旧累计加载对照。

运行
node --test tests/library-browser/*.test.cjs
node_modules/.bin/tsc -p tests/library-browser/tsconfig.json --pretty false
node_modules/.bin/vite build --config examples/library-browser/vite.config.ts
静态服务 handoff/library-browser/browser-build 后打开 /examples/library-browser/index.html；无需生产服务、账号、网络图片或写API。Vite dev仅本地调试，跨机器QA应搬运生产静态目录。

契约
输入CatalogView/Work/Group仍为宿主对象，不复制图像恢复或写逻辑。业务id唯一；重复非法catalog id保留首条、不合并。
resolveRestoreTarget优先完整业务id，再兼容work-前缀DOM id；输出业务id。旧limit绝不解释为page，无锚点退回合法页/搜索。
restoreReady是宿主样式/资料可用信号；onRestoreReady仅保证目标DOM已挂载，后续ResizeObserver/font几何稳定仍归宿主。
卡片renderWork必须提供实际可操作button/link；焦点优先该内部入口。模块不写URL/history/storage，不fetch或保存；“只读”说明不禁止筛选。
只读观看列表保持原始总数，即使当前或未来项筛除；未知current不跳第一首。不支持任意跳播或编辑。

APP_WIRING.patch触点
1. journey.ts：BrowseFilters可选page/pageSize，readEntry校验；旧limit原约束和默认值不变。
2. use-browse-journey.ts：提供libraryRestoreTarget/setLibraryPage/libraryRestoreMounted；用位置+恢复序列的挂载钥匙延后几何恢复；缺锚点聚焦搜索。沿用原mayLeave、continueWork、history几何/font/ResizeObserver。
3. app/page.tsx：只替换作品库呈现；原WorkCard/图片恢复、公开筛选、私有记录、异步团体不变；详情内接只读预览并共享navigationBlockedKeys/onNext。
该patch已apply --check及独立覆盖tsc；实际主App整合后的浏览器守卫/历史回归尚须dot验证。旧依赖源码字符串的App测试预期会因合理改版需要更新，不能将其当行为证据。

测试状态与限制
新增模型/React SSR/实际组件memo/提议hook测试合计27项通过；NODE_PATH="$PWD/node_modules"全旧套件1680项通过（初次缺NODE_PATH导致临时React夹具失败，保留原日志）；既有相关63项通过；模块/全工程tsc通过；生产静态构建通过。浏览器结果由独立QA归档，未完成项目标记not_run/pending，不能用SSR代替交互证明。
模型PERFORMANCE.json记录同seed原始7样本、median/p95，预先做完整order/facet一致性；不是浏览器性能，也不是冷启动测量。5000模型无提速承诺；收益目标是DOM有界，不声称解决尚未加载的服务端目录。
资料库上传与主站接线发布由父任务处理；本模块不上传真实个人记录或访问生产。

后续优化：查询模型memo明确依赖catalog及search/group/generation/queue/stageFilter/watch/sort七字段，分页只slice；新增实际组件调用计数回归。宿主加入原作被团体筛走、成员会话及断开下一支成员关联普通控件。性能改善需新版浏览器实测，不据memo推定。APP_WIRING.patch已从root整合树同步去旧quickQueueCounts及workScope语义依赖优化。

显式打开作品时ResultsView先focus该卡片可操作入口再调用宿主导航，覆盖Safari/touch/programmatic click不自动聚焦的情况；新增真实组件回调顺序测试，不修改WorkCard。

父任务实际整合构建已通过；同口径首载闭包从762105B/201161gzip增至779705B/206780gzip（+17600B/+5619gzip），不宣称首载更快。真实390px/5000同两次翻页event→2rAF代理五样本中位从455ms降至47.3ms，非严格paint归因。旧累计路径动作次数不同，不作为同路径速度结论；DOM分页24 vs累计96独立成立。完整浏览器原始证据及实际App验收由父任务归档。
