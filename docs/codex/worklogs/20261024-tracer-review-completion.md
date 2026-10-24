# TRACER 官网风格原生页与 v30（2026-10-24，待网页确认）

## 决定、环境与范围
用户确认 Geenius v29，本轮只推进 TRACER；待本团网页确认后再开始 W!TCHX，公共功能例外。起点 `d94c11d0554d4414a02cf09630fce0b516b35816`，分支 `codex/tracer-review-completion`，正式工程 `apps/idol-site/`。代码、服务和浏览器在本机 Windows。GitHub 连接器及显式 ls-remote 已核 Geenius 远端未变、无并行 TRACER 分支/PR。仓库 PUBLIC，沿用既有公开代码/素材授权，不加入新增私有数据或凭证。主站 v186 和 main 未变。

## 可见交付与设计依据
[TRACER v30 审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/tracer/index.html) 已发布。首页、成员目录/详情、发行目录/详情、视频与舞台详情、时间轴和共享成员/作品手帐可往返。

实际查看 [GLEAMMEDIA ARTIST](https://www.gleammedia.co.kr/artist) 的桌面与手机页面，以白底、玫红导航、银色官方 logo、横幅、团照和四张具名成员图重设计；弃用仓库旧信号控制台视觉。功能复用范围是路由、稳定 ID、原图查看器、只读审阅和共享手帐；作品目录、时间轴及手帐为官网语言的项目扩展。字体 DM Sans / Noto Sans SC，不宣称官网逐像素复刻。以冻结起点为复用版本边界，之后任何旧设计沿用仍须在交审消息披露。

实现位于 components/tracer-artist、lib/idol/candidate/tracer-native、lib/idol/tracer-photos、data/tracer-*、review/tracer 和 build-tracer-review 脚本。共享 app/page.tsx 只增加同时匹配 TRACER group ID 与稳定成员 ID 的照片映射；approved-video-poster 仅增加两个精确元组。

## 资料与素材
- 四成员：希真 Heejin、昭垠 Soeun、恩妃 Eunbi、世贞 Sejeong。身份据官网图片印刷名字；Soeun 正常图 SOEUN、悬停档案 SOWON 差异如实保留。当前活动状态无一手公告，按历史名册表述。
- 《365》2024-11-05，一项发行，两曲：365 / 365 (Inst.)。核对 [Bugs](https://music.bugs.co.kr/album/20682344) 与 [Genie 专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14789)。
- 原生作品 `rec28ldfRTrPq2`：MV 槽 `924WxkHMdxU` 为官方 Performance Video Part.1（2025-01-06，231秒）；stage 槽 `vno_QqLrhK0` 为 it's Live Band LIVE（2024-12-27，340秒）。三个事件按各自日期独立展示。
- 既有成员评分关系为 0，不伪造关系 ID。四人的公开视频参与据官方描述；空白作品 `rec28ldfRTrHrQ` 不赋名、不展示。评分、备注、观看状态与权限未改。
- 官方原图、无损资料图、显示 WebP 与精确视频缩略图保留；审阅共 24 资源、132101644 字节。没有为上传限额压缩或删除原图。

## 验证
28 项专项/回归通过：
```powershell
cd apps/idol-site
node --test tests/tracer-content.test.mjs tests/tracer-review-catalog.test.mjs tests/tracer-review-routing.test.mjs tests/tracer-review-isolation.test.mjs tests/geenius-content.test.mjs tests/geenius-review-isolation.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
```
类型、正式构建和 git diff --check 通过。Browser plugin not available；本地使用现有 Playwright/Chrome，线上使用 CUA IAB。

| 层次 | 实际结果 |
|---|---|
| 本地布局 | 9类页面 × 320/390/1440/2048/2560，45项真视口通过；页面非空、无框架覆盖层 |
| 连续交互 | 成员搜索 → 原图 → Escape及焦点恢复 → 精确视频 → 既有手帐 → 返回通过 |
| 恢复与绑定 | 空搜索清除、非法视频恢复、图片失败重试、五宽已知EasyList规则及双视频槽绑定共9场景通过 |
| 独立复审 | 14布局；发现共享成员手帐“暂无照片”，限定ID映射修复；四成员 × 390/1440共8场景复验，返回保留member和q |
| 浏览器错误 | 本地页面错误为空 |
| 审阅隔离 | 9项API隔离检查，0 sanitizedRelations；只读合成资料 |
| 线上 | 首页完整AX、MEMBERS点击后四成员目录成功；希真详情点击工具60秒超时，恢复标签后截图确认详情与图片已到达 |
| 未验 | 完整线上交互/原图弹窗、真实视频播放、真实保存、80%/125%原生缩放；只读审阅不进行真实写入 |

共享返回按钮原本正确，未修改返回逻辑。TRACER 共享 CSS 遗留 secondary 白字规则已整理；未把静态疑点称为已复现线上故障。

## Figma
[TRACER 页面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1076-1095)：10类页面 × 1440/390/320，共30个可编辑画板，85本地组件、102图片槽。原生 auto-layout、文本、vector icons、离散图片实例，无整页UI栅格。颜色变量、文字样式和 DM Sans/Noto Sans SC 已读回。

11个不同节点实际 get_design_context（含修复后手帐）；节点与读回见 [索引](20261024-tracer-figma-frames.json)。WebP 在 Figma 不渲染，已仅为 Figma 无损转 PNG；网页原图不变。修正138处同行文字/箭头分组、共享页头和标点孤行。完整逐板像素对照、细小字体度量和播放器提示外观仍有待办。临时 capture root 已删除，审阅捕获脚本已移除并恢复 connect-src 'none'。

## 发布
- Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，实际 v30，owner/custom owner-only，0外部访客。
- Deployment `appgdep_6adc642c08dc8191a50a685b4eb42759`，succeeded，2026-10-24T07:55:14.356163+00:00。
- Version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_f82eb763538081918d4e89cf5bed3d10`。
- 最终 source `5754bdb9434fda7dfa033a7f0d0eff6cf97e46f1`，基于旧 source `5405d5b12ad8216a0438ab22d8e93096825cff57`；这不是 GitHub 工程提交。
- 审阅 fingerprint `c166c5066909f8fcff6a235f7165886824d5927fae8ff45966269f03d6c3304e`。
- 423个旧静态文件 SHA 不变，新增29，最终452文件、258176845字节；最终archive 239745540字节。原图导致一次 receive-pack 超限后，仓库外副本从旧source分4次≤36MiB普通增量push完成；最终树与完整提交 `74f96f6d1db45e43eff22cd4ccdced0e1205b233` 完全相同，未force push。已发布，不重复部署。

## 证据与接续
本机证据根：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/`。
`tracer/browser.json`、`additional-qa.json`、`site-additive-proof.json`、`source-upload-batches.json`、`build-final.log`、`online-final.png`、`home-1440-viewport.png`、`home-390.png`；独立复审见 `tracer-research/independent-*`。公开摘要见 [发布证据](20261024-tracer-public-delivery.json)。不把含临时凭证、签名链接或私人快照的工具全量响应入仓。

GitHub draft [PR #19](https://github.com/KAtOReNA7/idol/pull/19) 已创建并附到本会话，base 为 `codex/geenius-review-completion`。代码与本日志已同提交 `3dca0012bd6f809270d82ec019085a0b229c5110` 并正常推送；本次文档提交补实际PR，不merge main。线上交付标签已保留；本机临时审阅服务 session 45760 已停止。下一步为用户网页确认以及明确未验项，不先开发 W!TCHX。

提交前规范化五个新增 JSON 的 CRLF→LF，并修正文档字体名称为 DM Sans。重新构建审阅包，30 个运行文件逐字节相同；仅来源 manifest 的源码指纹变为 `2f341331777ac43813a1dbf95550c09c8d2b101127b258fc39594bc39d692255`。发布指纹保留为原值，不为纯换行重复发布。最终 staged diff --check 通过。
