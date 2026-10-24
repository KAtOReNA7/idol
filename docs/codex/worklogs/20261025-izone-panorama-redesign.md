# IZ*ONE：Panorama 官网时期重设计

- 用户明确否决 v6 奶油玫瑰展册视觉，要求从 FIESTA / Panorama 时期官网或官方平台参考重新设计。v6 与旧 Figma 不构成设计认可。本轮仅 IZ*ONE，不开始 fromis_9。
- 当前分支 `codex/izone-review-completion` / draft PR #27，冻结基线 `1d097a2d5253dc6c225c87af3ab9ad74f41c2402`。开工工作树干净、已 fetch；正式工程 `apps/idol-site/`。本机 Windows 开发、预览与 Chrome 验证。
- 保留稳定 ID、用户评分/备注/观看状态、既有关系、原图与权限。更新同一 owner-private 审阅站；主站 v186、旧站 v33、其他团体不变。

## 实际参考与取舍

1. [Panorama 时期韩国官网，2021-01-03 存档](https://web.archive.org/web/20210103153505/http://iz-one.co.kr/)：取得官网 HTML、原版 One-reeler CSS、12 位具名成员照片、团照、IZ*ONE / One-reeler / Act IV 字标。CSS 明确黑底、银灰文字、OneReelerSerif / Oswald、整幅聚光灯照片与开放目录。存档浏览器因旧资源加载未完成停在黑色 loading，不声称完整原站交互通过；设计依据是实际取得的源码与逐一查看的原始视觉资产。
2. [2020-12-01 Cinema Homepage 存档](https://web.archive.org/web/20201201132720/http://iz-one.co.kr/)：实际取得 HTML，Scene #2 幻灯片、One-reeler 标题和 reel controller；[Soompi 当时报道](https://www.soompi.com/article/1439386wpp/izone-begins-countdown-to-december-comeback-with-1st-teasers-for-one-reeler-act-iv)交叉确认 Cinema Homepage。
3. [BLOOM*IZ 官方预告页历史镜像](https://iz-one.co.kr/20191103/)：实际截图并点击彩色门；黑底、光谱渐变、开门与纸屑动画。这是第三方镜像，不能称当前官网。
4. [Melon Panorama 官方宣传专题](https://www.melon.com/musicstory/inform.htm?mstorySeq=10961)：实际阅读与截图，包含 One-reeler 发行介绍、TMI 和 MV 幕后。仅辅助时期语境，不借用 Melon 通用站壳作为团体风格。

设计以 Panorama 官网为主，放弃旧展册视觉。项目成员目录须直接展示全员，故不照搬原站逐帧才可见的交互。搜索、时间轴和评分手帐属于同一语言下的功能扩展，不宣称原官网逐像素复刻。只复用数据、稳定路由、原图/恢复、只读投影及手帐业务组件；团页及手帐视觉重新编排。

## 实现与资料

- 重写 `izone-artist.css` 与 `izone-experience.css`，新增独立 CinemaHero。首屏使用完整 2400×1600 团照与原版字标；十二人成员目录静态展示，桌面四列、手机单列，不依赖轮播才能看齐。
- 成员详情、发行目录/详情、影像目录、时间轴及共享手帐改为同一黑银语言。首页精选 Panorama 和 FIESTA，Panorama 观看入口精确绑定既有 `recvxyH5pzBdad`。
- 新增 `public/artist/izone/panorama-official/` 共 17 个官网存档原字节文件：十二人照片、团照、三个字标和 One-reeler 专用字体。照片高度保留真实 1599/1600/1601px 差异，不拉伸、不裁剪、不压缩；清单记录来源、尺寸、大小与 SHA。旧图全部保留。
- 官网存档日期 2021-01-03 仅作为存档时间，未冒充照片首次公开日。十二成员稳定 ID 与身份、18 发行/81 曲目、17 影像资料逐项和 v6 比较不变；10 原生作品、108 既有关联、12 时间轴事件及个人字段和权限保持。
- 修复成员手帐按当前团体回退旧主题：只有 `safeArtistReturn` 校验通过的 IZ*ONE 历史路径和确属本团的成员才能使用新主题；作品优先级与 IVE / LE SSERAFIM / SAY MY NAME 当前团体流程保持。新增主题隔离回归测试。
- 审阅动态手帐样式加入内容 SHA 参数，团页 JS/CSS 继续内容版本，避免更新后缓存混用。照片说明标签加深背景并提高文字对比度。
- 复用 i-dle v5 / IZ*ONE v6 业务组件、数据、路由、搜索、原图恢复及只读公开投影；团页视觉和手帐编排重写。没有沿用 v6 奶油玫瑰/Bodoni 展册视觉；搜索、目录、时间轴、手帐属于官网语言的项目扩展，不能宣称逐像素复刻。

## 验证

| 层次 | 本轮结果 |
| --- | --- |
| 单元/边界/导航/主题隔离 | `node --test tests/izone-review-boundary.test.mjs tests/artist-navigation.test.cjs tests/experience-route-precedence.test.cjs tests/candidate-style-loading.test.cjs`：31 通过 |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit` 通过；仅生成的 tsbuildinfo 恢复至 HEAD |
| 正式构建 | 最终样式修正后 `npm run build` 通过；既有代理及 route 静态分类提示保留 |
| 布局 | 十类页面 × 320/390/700/1100/1440/2048/2560/2926/3840 = 90 项真视口检查；无溢出、坏图、零宽图、页面错误 |
| 交互 | 51 项通过，含十二成员 × 390/1440 原图、Escape/焦点、黑色手帐与精确返回，18 发行详情、搜索/清空、筛选刷新、MV/时间轴往返、未知记录和断图重试 |
| 修正复验 | 照片说明标签在 1440/390/320 检查颜色和边界通过；最终样式复跑 90 布局通过 |
| 保护 | 230 个非 IZ*ONE 页面文件及既有原图 SHA 不变，含 root；17 新资产，7 个 IZ*ONE 页面/脚本/样式/manifest 文件更新 |

第一次截图发现成员手帐仍是旧浅色，已实际修复并纳入 24 次成员往返中的主题断言，未以原有布局测试掩盖视觉错误。初次 Figma 标签调整影响照片容器尺寸，读回定位后恢复三宽原图边界并重新取稿。旧 timeline-navigation 的 11 个 fixture SHA 失败已在 v6 基线确认，本轮未放宽 pins，未将该套测试算为通过。

## Figma

[Panorama 新设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1206-1095)，session `153f4b34-96cb-490d-8d1c-f41650473dec`。旧页 `1193:1095` 明确标注“v6 旧展册 / 视觉已被否决”。

新页包含十类页面 × 1440/390/320 共 30 个可编辑画板，53 个内容图片组件，使用真实字标/照片、文本、SVG、Auto Layout、语义颜色变量和通用 STAGE/Button 业务控件。无整页截图填充。完整节点映射见 `20261025-izone-panorama-figma-frames.json`。

七个不同关键节点实际取得完整 design context 和图像：桌面/手机首屏、发行详情、成员详情、时间轴、成员手帐主要区域、MV 手帐主要区域。大型根节点稀疏响应均继续读对应子节点；另检查了完整桌面首页、手机首页、成员手帐和 MV 手帐截图。修复三宽 36 行时间轴的绝对图标被误计入正文缩进，以及 39 处照片说明标签。

**Figma 字体保真未通过**：OneReelerSerif / Arial / Microsoft YaHei 不可用，明确替换为 Cormorant / Inter / Noto Sans SC；网页实际使用原 One-reeler 字体与原字标。全量逐字/逐像素对照仍待完成，不以画板数量推定设计已被认可。

## 发布

- 同一个 owner-private 审阅站 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，owner 一人、外部访客 0；分享范围未改变。
- 已发布 **v8**：[IZ*ONE Panorama 重设计](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)。主站 v186、旧站 v33 和其他已确认团体保持。
- 最终托管 source commit `420fa36c06026e05bc7e907e427b19948a7ef1c4`；源指纹 `81a641f227e986d5072f3df290296956efde4f3b052c2efbfd7cd8bd1b1bcd73`。
- 版本 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_cb9dcca71c04819186b94e7355fbf5df`，deployment `appgdep_6adce1b38be48191a6be286ac784ce4f`，2026-10-24 16:50:10 UTC succeeded。
- 归档 145,909,760 bytes / 255 files；静态文件 145,709,151 bytes。65 个审阅资产合计 47,570,730 bytes，9 个 API 隔离检查，108 个已清理的既有关联。未压缩原图，不包含 capture/QA 脚本或凭证。
- v7 重设计先发布，线上核验发现下面的托管地址兼容缺陷，再发布 v8 修复。较早 `34780ec` 是打包后统一源码换行前的托管中间提交，没有另建用户版本。

## 线上地址修复

线上使用 Sites 文档支持的服务访问凭证，仅通过同域请求头注入，不写入客户端代码或仓库，不替代访问者身份。首次请求漏写 Bearer 前缀返回 401，修正验证脚本后成功取得 v7 首页、24 图片、成员搜索/详情和原图。随后发现成员手帐超时实际停在“此审阅页仅提供 Izone”：托管将 `/review-izone/records.html` 307 重定向为 `/review-izone/records`，而旧审阅路由只认 `.html`。

只在本团 `review/izone/routes.mjs` 将精确的 extensionless 别名映射回既有记录入口，未拓宽其他路径、身份、读写或共享生产路由。新增别名/隔离单测；在模拟同一 307 的本地服务器上运行 53 项交互（既有 51 项及直接链接/刷新两项）全部通过。正式工程构建未受影响；本次最终审阅构建和 31 项测试通过。

## v8 线上核心流程复验

最终 `live-check.json` 为 `passed: true`，错误列表为空。本机 headless Chrome 通过 Sites 支持的同域服务访问头验证已部署 v8，在 1440px 和 390px 各完成四组流程：

- 首页：每宽 24 张图片加载正常，无横向溢出或坏图。
- 成员搜索、原图、成员手帐与精确返回：均通过，包含托管的无后缀记录入口。
- 发行详情与返回搜索结果：均通过。
- Panorama 精确作品绑定与返回：均通过。

合计八组线上核心流程通过，不扩大为所有线上交互或用户 IAB 登录会话通过。首次 v8 发行断言发生在新页面渲染前；补上曲目列表的显式等待后复跑成功，无需修改产品代码。IAB 打开请求返回 queued，仅作为用户审阅入口，不算浏览器验证。

## 接续

本机 `apps/idol-site/`；审阅构建 `node scripts/build-izone-review.mjs --out <仓库外独立绝对目录>`，按现有锁文件依赖运行。证据暂存 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/izone-redesign/`，不是跨电脑运行依赖；清单、验证摘要和 Figma 节点索引入仓，认证值及临时签名 URL 不入仓。

实现提交 `291465d`；本次文档补记记录最终八组线上核心流程结果。真实保存/播放、80%/125% 原生缩放、Figma 完整字体与全像素保真未验。等待用户确认新版 IZ*ONE 网页后才推进 fromis_9 或下一团，公共功能例外；不把部署成功当成设计已获认可。
