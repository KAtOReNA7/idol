# Hearts2Hearts 原生完善与 v17 审阅

日期：2026-10-23。执行：Codex；本轮已交付网页，等待用户人工验收，下一团尚未开始。

## 依据、基线与范围

用户最新“已确认，继续开发”确认 ifeye v16，允许推进下一团。继续遵守一个团交网页、人工确认后再下一团，公共功能例外。正式工程 `apps/idol-site/`，GitHub `KAtOReNA7/idol`，任务分支 `codex/hearts2hearts-review-completion`，基于 `codex/ifeye-native-integration` 的 `abe3b0476d6585d0d2986182f90403106125fe7f`。已重新核对远端和活动 PR，没有接续冲突；main 仍旧 sandbox。GitHub 当前 public；只新增公开官网图片、公开编辑资料和合成只读验证，不新增私人导出或凭证。

此团已有完整独立蓝色网格/柠檬黄/爱心/暖色团照原生实现，本轮在其上完成可用目录和跨页往返。未重做其他团视觉；API、真实保存、权限、快照、依赖与锁文件未改。

## 网页实际增量

- 八张官网具名成员原图永久落在 `public/artist/hearts2hearts/portraits/`，全部 1000×1000，共 1,284,531 字节；SHA 与此前已有私有成员原图的记录逐张完全相同。身份由官网具名路径和既有清单核对，没有靠人脸推断；保留旧 media route 与原始证据字段。`data/hearts2hearts-portraits.json` 保存来源、身份页、大小、SHA。
- 首屏继续使用八人团体照。成员首页/目录同组、同尺寸、不裁切；目录可按中文名或艺名搜索、清空、处理无结果；搜索后顺序编号仍保持原成员身份。个人页可以打开原图，Escape 关闭后焦点回到原按钮。
- 发行目录展示三张精选发行，支持名称/类型/日期检索；发行详情→精确作品→返回发行详情→原搜索列表保留上下文。范围明确为精选三张，不宣称完整或最新唱片目录。
- 原生影像库保留 13 个作品版本，10 个正式舞台绑定；其余两条替代现场保持 view_only。STYLE 合作版是版本未确认，FOCUS Remix 是不同编配，不把它们升级为正式可评分舞台。保留 64 条已有单成员/单作品关系，未凭八人阵容笛卡尔生成关系；The Chase 的三个业务记录继续独立。
- 审阅页接入既有 11 条历程事件，并可跳入真实作品再返回事件。生产本来通过 ArtistsLayout 注入时间轴；审阅入口现在显式注入同一份已审资料，不以空时间轴冒充完成。
- 审阅边界使用真实 Hearts2Hearts 组件和真实共享 App。仅显式白名单字段进入浏览器；全部评分/null、备注/空、观看状态/空、私人照片/null。GET display catalog 之外的请求拒绝，CSP connect-src none；无真实 API、身份调用或写入 fallback。

## 参考与视觉证据

本轮实际读取 Figma `zeLNExz4TbpWRW3uiahef7` 的原生首页 `591:1393`，取得设计上下文与真实截图，对照保留暖色八人团照、字标、浅蓝网格、黄/紫点缀和等大成员网格。旧 `214:*` IMAGES PENDING 不是本轮依据。成员与发行目录新增检索不是声称已完成新的 Figma 逐页验收；其余内页尚未逐帧核对。

本轮打开日本官网成员页 `https://hearts2heartsofficial.jp/profile/`、官网首页和环球 Moonride 产品页；下载八张官方原图并解码、做联系表查看。官网当前还有更新发布，故保留精选范围，没有将旧资料升级为完整最新收录。网页文字/下载图片不等于 Spotify 或官网整页视觉研究；本轮未完成该项。

## 验证

正式目录执行，复用已有依赖：

```sh
NODE_PATH="$PWD/node_modules" node --test tests/hearts2hearts-*.test.*
NODE_PATH="$PWD/node_modules" node --test tests/artist-navigation.test.cjs tests/ifeye-review-catalog.test.mjs tests/ifeye-review-routing.test.mjs tests/ifeye-review-isolation.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
node scripts/build-hearts2hearts-review.mjs --out /absolute/dedicated/scratch/output
```

57 项 Hearts2Hearts 专项、27 项导航/ifeye 回归通过；类型 0 错误；官方 Sites build-site.mjs 完成正式 Vinext/Vite Worker 构建。最后仅改审阅适配器的 referrer 规范化，11 项路由/打包测试再次通过。首次旧测试因临时目录不能解析 React 而失败，使用 NODE_PATH 后恢复；唯一旧素材断言已改为验证本地原图 SHA 与旧 media route，不放松原图身份校验。

审阅构建可复现并检查 9 项 API 隔离、原图 SHA、浏览器无 snapshot/server/save 模块。包内 16 份图片/字体，共 2,851,535 字节；JS 938,434 字节、CSS 118,011 字节。最终 sourceFingerprint `379d4da4276484d5e8a6e436cc634df280b2b3e813455da19612465d617212c3`。

浏览器为 managed Linux 内部 `terminal.local:4173`，1363×936 桌面。实际完成中文/英文成员搜索、原图/Escape/焦点、STELLA→The Chase MV→GtPPT-qSXj8 舞台→原成员和搜索/焦点、Moonride 发行检索往返、13→12 舞台过滤、FOCUS Remix 只观看说明、11 事件历程往返与事件焦点、刷新保留查询、320 宽菜单展开。

首页、成员、发行页均做 320/390/1440/2048/2560 iframe CSS 宽度检查，无横向溢出。实际 clientWidth 因滚动条为 305/375/1425/2033/2545；八图均解码为 1000×1000，显示边长分别约 129/164/314/358/358，同行统一。**这不是五种顶层真视口，也不是 80%/125% 原生缩放验证。**

发现并修复审阅静态目录跳转丢查询的问题：真实 href 和浏览器地址保留 `index.html`，仅在 review 构建内适配最终跳转/referrer 和时间轴规范路径；继续执行原生安全、dirty/save、history/return 守卫。源代码模式不符合预期则构建失败，不静默替换。生产共享 hook 与安全 allowlist 未改。部分批量 Playwright 操作未触发状态变更，改用 AX 控件和逐步状态检查；不声称快速批量导航通过。

完整截图曾超时，已保存桌面首屏实图；该图只包含第一行四位，不冒充八人全页截图。见 [浏览器证据](../evidence/20261023-hearts2hearts-review-completion/browser-qa.json) 与 [截图](../evidence/20261023-hearts2hearts-review-completion/members-desktop.jpg)。其余测试日志、构建摘要、审阅 manifest、旧文件 SHA 同目录。

## 发布

验收链接：https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/hearts2hearts/index.html

- 原 owner-private 审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`；保留原访问范围。
- **v17，succeeded**；Sites source `7cbb32739686fce2240c0444fc632fc3398123e3`。
- version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_353ce38aa04481919786146f0803c6b8`；deployment `appgdep_6adb65f5222c8191a98439d0d579a7ae`。
- 后端保存展开 TAR 36,833,280 字节、172 文件；171 个 out 文件加 hosting manifest。此前 149 审阅文件 SHA 全部不变，本轮仅加 22 文件。临时 QA iframe HTML 未打包。
- 正式主站仍 v186 A-only，未覆盖。发布状态由 Sites 返回并读回 version/source 核对；managed cloud browser 只允许内部预览，未把它当部署地址的线上浏览器/HTTP可达性证明。

## 下一步与尚未完成的范围

1. 等用户确认 Hearts2Hearts v17，只处理本团反馈或公共功能；确认前不得开发下一团。
2. 精确视频预览、同 MV 成员造型图、其余 Figma 内页/官网/Spotify视觉研究、顶层真视口及缩放、线上浏览器、真实 owner 保存仍待验。Moonride 外部 YouTube 缩略图在本环境失败，保留诚实重试/原视频入口；不能声称实际播放通过。
3. Review 的评分为空且不可写，不能当私人记录或生产保存验收。Moonride 无既有成员关系，未编造参演名单；其他无同 MV 图片保留缺图状态，不用官网肖像冒充造型。
4. 生产剪枝/完整 TAR 容量与部署另验。本轮未重跑或绕过此前 izna 原图引用剪枝阻断、ifeye 旧审计 fixture 的 3 个失败；该历史问题保留，不把 v17 静态包当主站全量包通过。
5. 新电脑从 RESUME 取最新分支，fetch并检查有无后续电脑提交；保留工作树，不从旧 main/handoff重新开发。GitHub draft PR 创建后回填，未合并 main。
