# SAY MY NAME 原生完善与 v19 审阅

北京时间 2026-10-23 23:34 发布；当前 Codex 主代理负责代码、集成、浏览器和交付；一个子代理完成具名原图准备及只读独立复核。

## 基线与授权

- `KAtOReNA7/idol`，正式工程 `apps/idol-site/`。从最新 `codex/kiiikiii-review-completion` 的 `f91a66ce9466cd12c64ebe9a9b16d84739b45fc9` 接续，分支 `codex/saymyname-review-completion`。远端在提交前复核未移动，不合并旧 main。
- 当前本地目录最初为空，已取得该分支完整文件与依赖。旧会话「接续真实工程开发」（`6ada168a-09ac-83ea-a7b8-4b47ed36cd4d`）在 KiiiKiii v18 交付后收到用户“已确认，继续开发”；本会话要求继续。因此 KiiiKiii 页面确认已满足，只推进原计划中的 SAY MY NAME。
- 保留逐团网页确认规则、原图、稳定 ID、个人记录和 owner-only 写保护。未覆盖正式 v186 主站。

## 页面增量

- 保留既有淡紫纸面、棋盘章节、Oswald/Nunito 字体、完整八人团照及独立唱片布局。
- 八张日本官网具名 PNG 原图接到首页/成员目录/个人详情，统一 2:3 容器并 contain 展示；不裁切 SOHA 的全身构图。支持中文/艺名搜索、空结果、刷新保留及原图查看，Escape 关闭恢复焦点。
- 九项精选发行增加搜索、内部详情、来源、精确影像入口和发行→手帐→发行→搜索结果往返。SOHA 个人 OST、日语版与原版分开，未收录视频不借用其他版本。两张既有发行展示图可查看，另外七项仍诚实缺封面。首页“最新发行”改为“近期发行”，不把截至 2026-10-15 的精选目录冒称当日完整目录。
- 保留六支本团影像（五 MV、一音乐故事）、五个现有舞台绑定、两个仅观看替代现场、八个单轴事件、37 条本团成员作品关系。早期七人作品不加入后来的 SHUIE。
- 原生 artist projection 会额外包含 HITOMI 过去在 IZ*ONE 的九支作品；这是正式个人档案的既有历史关系。本团审阅模型按 groupId 选出六支本团影像，未将历史作品改挂本团，也未修改正式投影行为。

## 素材与设计证据

`data/saymyname-portraits.json` 记录每张的具名官网 anchor、稳定 memberId、源 URL、字节、SHA256、尺寸。八张均 HTTP 200 / image/png、2000×3000、完整解码和逐张视觉检查通过，共 21,215,769 bytes。保持下载原字节，原私有接口保存在 `previousImage`，未动 snapshot 或用户附件。

官网 profile 首次 PowerShell 请求成功，提供八个具名对应；后续 Python 请求返回 403，停止该路径。八个独立 PNG 地址成功。证据中网页哈希明确为成功响应解码后 UTF-8 快照，不冒称原 HTTP 字节。

实际读取 Figma 文件 `zeLNExz4TbpWRW3uiahef7` 的 `239:1102` 设计上下文及截图。该文档登记的是旧占位结构稿，缺实图且配色/字体早于当前代码中的 609 增量；本轮保留较新的现有网页设计，没有据旧稿回退。完整实图与新增内页的 Figma 对照、官网/Spotify 全面视觉研究仍未完成，不宣称整团设计验收完成。

## 工程与隔离

新增 `review/saymyname/`、`scripts/build-saymyname-review.mjs` 和显式公开编辑模型。复用非视觉只读传输与共享 App，不复用其他团视觉。构建进程读取已有 snapshot 核验身份，浏览器不获得原始 snapshot；评分、备注、观看状态、收藏、私人照片均清空。只允许同源 GET display-v1 目录；写入 405、其余 API 404、外部 fetch 403，CSP connect-src none。真实评分保存未纳入本审阅。

共享 `safeArtistReturn` 只增加本团九个合法发行键，原有未知值、重复键、外站及跨团拒绝继续生效。物理 index.html 保留查询，继承原生 history/dirty/save 生命周期。

## 验证

- 113 项通过：本团、KiiiKiii、Hearts2Hearts 审阅与共享导航回归。完整输出在 [tests.txt](../evidence/20261023-saymyname-review-completion/tests.txt)。独立子代理另做 29 项定向检查并复核公开模型，无可复现缺陷。
- TypeScript `--noEmit --incremental false` 0 错误；正式 `npm run build` 成功，见 [build.txt](../evidence/20261023-saymyname-review-completion/build.txt)。当前 Windows Sites 包装器的 npm shim 找错路径，改用已安装 npm 的绝对 JS 入口运行原 package 脚本，未修改依赖或框架。
- Git/npm 全局遗留代理 10808 无监听；本次命令使用环境已有 7877，不更改全局设置。初次 Windows clone 的 CRLF 转换导致生成文件检查误报；逐项以 Git blob 验证后恢复 LF 原字节，最终 diff 不含无关文件。
- Browser 插件未列出，按 frontend-testing-debugging 技能使用已安装 Chrome 与 bundled Playwright，无新增浏览器依赖。服务与浏览器均在当前 Windows，`127.0.0.1:4178`。
- 9 条真实交互检查：成员搜索→原图→MV→精确舞台→返回、成员列表与刷新、发行搜索→详情→作品→返回→目录、时间轴→作品→返回、封面 Escape 和焦点、无应用运行时错误。见 [interaction-results.json](../evidence/20261023-saymyname-review-completion/interaction-results.json)。
- 首页、成员目录、成员详情、发行目录、发行详情、作品库、时间轴，七页×320/390/1440/2048/2560真实浏览器 CSS 视口，共35页，无横向溢出、缺失图片、JS/console错误。此处是真 viewport，仍不等同真手机硬件或原生80%/125%缩放。见 [viewport-results.json](../evidence/20261023-saymyname-review-completion/viewport-results.json)及同目录截图。
- 浏览器最初全页截图未等待 lazy 图片，未当作图片失败/通过证据；最终截图逐图解码。一次测试定位器误将 timeline 按钮当链接导致工具超时，改用真实控件后完整脚本通过。最终构建 fingerprint `d6c533be164d1a9b8a6fdde461c04dbcb3e8309277dc8cc64a153ece2f8767d2`，新指纹仅来自检出换行恢复，最终交互复测通过。

## 发布

- [SAY MY NAME v19 审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/saymyname/index.html)，owner-private。
- QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，Sites source `ef1d2082de92fb79e4de3fdf5962d213a4e26a8e`。
- deployment `appgdep_6adb7e60da5c8191b5cd636e75a49eb5`，`succeeded`；version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_40212b03830c81918aefaf0ccfb3981c`。
- 原有192个 out 文件SHA保持；增加24文件，共216个静态文件。原图/旧页面均未替换。gzip 56,774,145 bytes；完整展开TAR 65,701,376 bytes，含217常规文件（包括hosting），低于256MiB门槛。
- 线上 in-app browser 首次打开超时，未绕过或反复重试；部署成功不能替代线上独立浏览器复验。正式主站保持 v186。

## 下一步

GitHub 代码、原图、证据与进度已在 `5c28500cdeb5920ba3d7640b50065cffebe1d3b4` 推送；draft [PR #11](https://github.com/KAtOReNA7/idol/pull/11) 基于 KiiiKiii 分支，未合并。后续文档提交以该分支最新远端 HEAD 为准。收尾逐项复核发布清单的151个源码输入，哈希全部一致；本机4178预览进程已停止，交付使用上方线上地址。

1. 等待用户 SAY MY NAME v19 网页反馈并修本团；确认前不开发下一团，公共功能例外。
2. 本团待补：七张精确发行封面、三支剩余影像预览/舞台图与MV成员造型图、完整 Figma 实图/主要内页、官网/Spotify 全面视觉研究、原生80%/125%缩放、真实播放/owner保存及线上浏览器复验。
3. 保留其他团历史待办、旧izna生产剪枝引用阻断、ifeye旧审计fixture失败；本轮不做全站剪枝apply，审阅包成功不代表正式主站全量包通过。
4. 新电脑读取 `docs/codex/RESUME.md`，检出本分支最新远端HEAD；本地预览进程可重建，不随提交迁移。代码、证据与此日志一并推送GitHub。
