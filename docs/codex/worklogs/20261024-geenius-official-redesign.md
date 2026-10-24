# Geenius 官网风格重设计（2026-10-24）

## 最新用户决定：Geenius 按官网重新设计（2026-10-24）

用户明确否决 Geenius v28 的仓库既有视觉，仅认可图片。本轮继续 `codex/geenius-review-completion` / PR #18，以 https://www.geeniushome.com/geenius 为直接视觉参考，重新处理字体、构图、导航、成员及作品内页和共享手帐；保留已核实图片、资料、稳定 ID、评分、备注、观看状态与访问权限。v28 的纸色蓝灰方案及旧 Figma 不构成设计通过。主站仍 v186，更新仅限同一 owner-private QA。**Geenius 重新交审并获确认前不开始 TRACER，公共功能例外。** 过程见 `docs/codex/worklogs/20261024-geenius-official-redesign.md`。

**长期交审规则：此后任何团体若沿用仓库已有设计，必须在交给用户审核的消息中明确说明沿用了哪一版/哪些部分，同时给出实际参考官网及差异；不能将旧设计沿用描述为按官网重新设计。** 用户此次要求不授权重做已确认的其他团。

## 起点与范围

起点 `ea08240d62974c299e9a690b44d8778384951793`，工作树干净，开工及交付前已 fetch 活动分支，无远端新增。本次针对官网视觉重设计，旧 v28 的功能验证仅作回归线索，不能继承设计验收。正式工程为 `apps/idol-site`；继续现有分支和 draft [PR #18](https://github.com/KAtOReNA7/idol/pull/18)，未合并 main，未覆盖正式主站 v186。

## 官网证据与实际重设计

已重新打开 [HOMe 艺人官网](https://www.geeniushome.com/geenius)，在 1440 和 390 真视口记录完整页面、文字及可见元素尺寸。不是继续使用旧纸色方案，也不是仅换背景色。

| 官网直接参考 | 本轮实现及差异 |
| --- | --- |
| 黑底白字，蓝色当前栏目；桌面正文宽 980px | 同宽单列、黑底白字；蓝色交互色为可读性调亮 |
| 左对齐 120px 无衬线 GEENIUS；下方整幅团照 | 移除居中书名、纸色图框和左右分栏；完整团照直接占据整列 |
| 2024 Single: Voyage 下划线标题、双栏简介、纵列社媒链接 | 保留该内容顺序；使用已核实的中文简介；新增链接来自官网可见链接 |
| 五人 193×551 窄幅肖像并排 | 首页五列等高肖像；档案目录/详情仍提供完整照片与真正原图，原文件不裁改 |
| 官网 390 视口仍生成 980px 横向内容 | 网页响应式缩至实际宽度，完整团照不裁切；手机成员两列，简介一列 |
| DIN Neuzeit Grotesk / Helvetica W01 Light | 使用已有开放字体 DM Sans 与 Noto Sans SC 作兼容替代；不冒称官网字体逐像素一致 |
| 官网只有展示内容 | 成员搜索/详情、发行/影像/舞台/时间轴和手帐按同一黑白视觉扩展；中文辅助导航与只读提示保留 |

旧 Instrument Serif、纸色、蓝灰墨色、装裱边框和书页目录已移除。成员页改为无框肖像与大号英文姓名，作品以封面和视频为主体，时间轴改为日期/事件分行。共享手帐改为黑底、无衬线字、整列播放器与下方记录信息。只复用既有照片、功能组件及开放字体文件，没有沿用 v28 视觉设计。

五成员、三发行、七精确视频、四事件、来源链接、搜索返回条件、原图、失败恢复和既有手帐往返保持。没有修改 `snapshot.json`、稳定 ID、评分、备注、观看状态、保存处理或权限；审阅继续清空个人字段、仅允许 GET 白名单，写入 405。

## 新版验证

代码、浏览器、静态服务器均在用户 Windows，端口 4186；Browser 插件未提供，按 frontend-testing-debugging 使用已有 Playwright/Chrome，没有安装依赖。

- 39 项 Geenius 专项与导航回归通过；包括所有照片字节 SHA、关系、版本绑定、0/null、只读边界与审阅构建。
- TypeScript `tsc --noEmit --incremental false` 通过；最终 CSS/字体同步后正式 `npm run build` 再次通过。
- 首页、成员目录/详情、发行目录/详情、影像、舞台、时间轴、共享手帐共九类页面 × 320/390/1440/2048/2560：45 项真实视口检查通过，无文档横向溢出、坏图或应用异常。
- 三个连续流程：成员搜索→原图→Escape 焦点恢复→精确 I.L.Y→手帐→返回；发行搜索→个人署名→返回/刷新；舞台过滤→精确 stage。
- 九项恢复/广告规则检查：空搜索清除、非法视频恢复、单图失败重试、五宽同组 EasyList 规则（首页均 16/16 图可见）、五 I.L.Y 精确单成员和 work ID。
- 播放按钮产生正确 `youtube-nocookie.com/embed/NLa_eJYKcfQ`；仅验证播放器入口，没有宣称实际音视频播放成功。
- 本地 IAB 成功读取新版完整首页。发布后 IAB 导航在 45 秒超时并重置内核；没有继续盲重试。已将实际线上 URL 排入用户面板；线上内容及交互仍未验证。
- 真实保存、实际音视频播放、80%/125% 原生浏览器缩放仍未验；不会由 build、本地检查或发布成功推定通过。

本机证据：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/geenius-official/`，包括官网 JSON/截图、各页五宽截图、`browser.json`、`additional-qa.json`、`records-qa.json` 和 `build.log`。最终视口截图在所有图片解码后重拍，避免把瞬间加载截图当成缺图证据。

## Figma 同步

[本轮页面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1047-1095) 的 27 个画板已原位替换，保留画板 ID 和 16 个照片组件；新增 18 个导航/搜索组件。页面标题为“Geenius · HOMe 官网重设计 / 20261024”。颜色变量已更新为黑、白、灰及蓝色交互，文字实际读回为 DM Sans / Noto Sans SC。

全部界面由自动布局、可编辑文字、SVG 向量和照片实例构成，没有完整 UI 截图填充。新版索引见 `20261024-geenius-official-figma-frames.json`。关键首页、手机成员、桌面成员详情、320 手帐截图及成员页设计上下文已核查；修正大字换行、逗号/搜索标签拆行、返回箭头和手帐返回上下文。仍不宣称全部逐字间距和浏览器/Figma 字体度量像素一致；MV 个人截图缺项仍明确显示，未用概念照冒充。

## 私有发布 v29

- [实际审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/geenius/index.html)，2026-10-24 06:45:55 UTC 发布成功，并读回确认版本 **29**。
- Site：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`；开工读回 owner-only、0 外部访客，本轮访问范围未改。
- Sites source：`5405d5b12ad8216a0438ab22d8e93096825cff57`。
- 版本：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_046c78e16e5081918640c2ea5ca378b4`。
- Deployment：`appgdep_6adc5418ff1081918caa1f515b055414`，终态 `succeeded`。
- 归档 125,593,600 字节、424 文件（423 静态文件及 hosting）；SHA256 `2ddd823a045e8f9c2b981fca565b287a60ff48a814041b630d094998a444d5bf`。
- 改动仅七个 Geenius 审阅 HTML/JS/CSS/manifest 文件；394 个非 Geenius 原文件逐个 SHA 不变，字体已存在且字节一致。
- 构建指纹 `90c56bd9f2197d31bb13260ae31503a0c52fb5dd2ab91a5a6ce6f2b053a451a9`；24 资源 / 7,957,981 字节，10 关系，9 项 API 隔离检查。

## 接续

复核 GitHub 仓库为 PUBLIC；本轮仅公开代码、资料、设计证据和规则更新，没有增加私有快照或凭证。代码与本日志同提交并推送 `codex/geenius-review-completion`；以该分支最新远端 HEAD 为准。PR #18 保持 draft，base 仍为 `codex/adya-review-completion`。

下一步等待用户审核 **v29 新设计**；确认前不推进 TRACER。以后交审时必须明确披露是否沿用仓库设计及具体沿用范围。可重复构建：在正式工程执行 `node scripts/build-geenius-review.mjs --out <仓库外独立目录>`，启动本地静态服务访问 `/artists/geenius/index.html`。
