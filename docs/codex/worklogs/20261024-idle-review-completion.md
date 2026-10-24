# i-dle 功能审阅接续 — 2026-10-24

## 范围与基线

- 用户最新“同意，继续开发”确认 AtHeart v4。按 PRD 原 Sol 顺序继续 i-dle；本团网页待确认前不开始下一团，公共功能例外。
- 正式工程 `apps/idol-site/`；分支 `codex/idle-review-completion`，基线 `e42527c9a84942abc628e26e0256097bec2a50bd`，base `codex/atheart-review-completion`。开工工作树干净，远端基线一致；收尾再次 fetch 后 FETCH_HEAD 仍相同。未使用子代理。
- 代码、服务、Chrome/Playwright 均在用户本机 Windows。审阅范围为 i-dle，主站 v186、旧审阅站 v33、其他已确认团体保持。

## 设计与资料

- **沿用 v186 引入且已获认可的 i-dle 深紫/珊瑚红页面**：首页构图、导航、照片卡片、发行与作品库结构。没有宣称按当前官网重设计。
- 实际浏览 [日本官网](https://i-dle.cubeent.co.jp/) 和 [PROFILE](https://i-dle.cubeent.co.jp/profile/)；当前官网是黑底、紫色渐变、红色分隔线和全幅轮播，现有独立页不同。搜索、时间轴、评分手帐属于项目功能。
- 共享成员/作品手帐沿用仓库布局与编辑边界，成员手帐换 i-dle 深紫色。审阅公开投影、导航及图片恢复机制承接 AtHeart v4 / TRACER 系列实现。
- 保留五位当前成员和徐穗珍历史档案、41 既有发行（含日版、个人与合作发行）、8 个既有编辑影像槽、28 原时间轴事件。28 具名原生作品、23 既有舞台、152 既有关联与编辑影像槽是不同统计，未伪造绑定。
- 六张留存原图：团照 `idle-0.jpg` 1500×1000，五位现成员 `idle-1.jpg` 至 `idle-5.jpg` 1000×1000。展示副本与原图分开；徐穗珍 2019 LATATA 历史照片仅有展示文件，按钮标“查看图片”。所有原字节不压缩、不改图。

## 产品增量

- 成员、发行、作品库搜索与清除、空状态，URL 保存筛选；成员与发行详情返回保留搜索。
- 作品库 → 发行 → MV 手帐 → 发行 → 原搜索结果精确往返。修复历史成员 `roster=history` 被返回校验拒绝、掉回首页的问题。
- 六成员共享手帐有对应照片、原有作品关系；图片灯箱、Escape 和焦点恢复、失败后的无刷新重试；手机首页第三张发行不再被隐藏。
- 无效成员/发行/媒体 ID 明确显示找不到内容，不冒充首页。
- 审阅只允许公共 `/api/catalog` 投影；评分、备注、观看状态清空。写入、原始记录接口、跨源请求和其他团目录被拒绝，真实 owner-only 保存边界保持。

## 验证

- 49 项专项/回归通过（28 项 i-dle 与 21 项共享导航、历史成员、编辑草稿）；最终类型检查和正式构建通过。构建只有原有代理/性能/路由静态分类提示。
- 本机 Chrome：11 类页面 × 9 个真实顶层宽度（320/390/700/1100/1440/2048/2560/2926/3840）共 99 布局场景通过，包含实际图片非零宽、图片加载与控制台检查。Browser plugin not available，采用已有 Playwright/Chrome；没有安装浏览器依赖。
- 62 交互通过：成员搜索、六成员两宽原图/手帐往返、41 发行曲目、作品库、时间轴、无效 ID、图片失败恢复；最后两条新增返回流程在 390/1440 再验通过（合计 64）。
- Figma [功能审阅页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1178-1095)：27 可编辑画板，九页面 ×1440/390/320；复用原组件、56 张离散图片与颜色变量，原认可稿未改。5 个不同最终节点完整取稿并看图；整页手机时间轴首次为 sparse，已补截图与事件子节点取稿。修复时间轴标记参与排版造成的横溢出和文字高度；完整逐板字体/像素保真未验。索引见 `20261024-idle-figma-frames.json`。
- 线上首页DOM与首屏截图已实际读取（团照、导航、最新发行正常）；成员入口点击45秒超时，运行会话重置，未盲目重试。线上完整交互未通过；真实保存/实际视频播放与原生浏览器 80%/125% 缩放仍未验。

## 构建、发布与接续

- 新审阅站 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，保留 owner-private / 零外部访客；本轮 v5 已成功部署。主站 v186、旧站 v33 不改，不合并 main。
- 最终审阅 sourceFingerprint：`8ae95a6f8e2a6c9a42644429f22a624393c37280a7d82fa18e22696856c830b1`。63 资产共 15,918,143 bytes；新增 69 文件，112 既有非 root 文件 SHA 保持，root 仅新增入口；共享字体字节一致。9 API 隔离检查通过。
- Source helper 首次失败为 checkout Git 的旧代理端口 10808 已不可用，使用本次进程 Git 配置指定当前 7877 后成功 open；短期凭证过期后通过原工具续签，没有落盘凭证、没有使用 Sites bypass token。
- 依赖沿用当前 node_modules，无新增依赖。运行：`node scripts/build-idle-review.mjs --out <仓库外绝对目录>`；`node --test tests/idle-review-boundary.test.mjs tests/idle-verified-design.test.cjs tests/idle-detail.test.cjs`；`node node_modules/typescript/bin/tsc --noEmit --incremental false`；`npm run build`。
- 本地临时证据位于 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/idle/`。不要重跑 `implement.py` 或旧 setup 生成器覆盖后续修正。GitHub 是跨电脑接续入口，临时证据不作为唯一交付依据。

## 最终交付

- [i-dle v5 只读审阅](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/idle/index.html)。部署返回 succeeded，已读回 version_number=5；保存版本 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_e8f4958d2fec819189d3c28d154c9331`，deployment `appgdep_6adcc6111d1c8191803ba98018ab1909`。
- Sites source `2c14a4ff74c2e473fa4432c7cecc0b76a853f277`；归档SHA `4528392d492b9769da29c106372d562ba5f07dac5c2f8cb8a59ac1bd98bea290`，97,013,760 bytes / 183 files。文件保护证据见 `20261024-idle-public-delivery.json`。
- GitHub PUBLIC 已再次核对；新增内容为公开资料、代码与清空个人字段的投影。修改文件凭证模式扫描无命中；原始快照/个人字段未改，无凭证或令牌入仓。
- 4193自有本机审阅服务在交接时关闭。最终使用上方线上URL。当前停在本团网页确认，下一团尚未开工。
