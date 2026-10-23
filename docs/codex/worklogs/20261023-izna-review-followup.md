# izna：手帐视频预览接线与 v15 审阅

更新：2026-10-23，北京时间。用户在检查另一台电脑进度、讨论推理档位后说“好 你开始继续开发”。本轮继续 izna 收尾，不把该授权写成整团验收。

## 基线与范围

- 仓库 `KAtOReNA7/idol`，正式目录 `apps/idol-site/`。
- 完整工作树从 `codex/izna-native-integration` 的 `aa9e0446c47d3de8cd0c893f86fc0112248d9aaf` 克隆，初始工作树干净；本轮独立分支 `codex/izna-review-followup`。交付前再次读取原分支 HEAD，仍为 aa9e044。
- 已读根 AGENTS、RESUME、STATUS、PRD、设计要求、协作手册、ACCEPTANCE 和当前源码。没有从 main 开发，没有重导入候选或覆盖另一台电脑的进度。
- 当前仓库经 GitHub 连接器核对仍公开。新增内容仅公开图片绑定、代码、合成只读 QA 证据与进度；评分、备注、观看状态、原图和依赖锁文件未改。
- 上游 PR #6 保留。本轮 PR 以 `codex/izna-native-integration` 为 base；最新入口以 RESUME/本分支远端 HEAD 为准。

## 实际问题与网页增量

浏览器复现：izna 成员页进入 Mamma Mia 作品详情时有本地图，进入既有手帐后播放器显示“封面暂时打不开”。作品列表和播放器使用共享 `approvedVideoPoster`，该映射没有接入 izna 已有的四张精确视频预览，因而回退到外部缩略图。

本轮把以下已有原图接入共享作品卡片与播放器，不新增或替换图片：

| 作品 | 稳定 workId | 精确视频 ID | 原图尺寸 |
| --- | --- | --- | --- |
| IZNA | rec28ldfRTrBGz | d3mqW9wqqx0 | 1920×1080 |
| Mamma Mia | rec28ldfRTrNwO | 2fyFx2u5fbU | 490×266 |
| METRONOME | rec28ldfRTrNSv | NQRGAh7ukh8 | 1920×1080 |
| DUMB HOT! | rec28ldfRTrNYh | _kxr2D8-tq8 | 2560×1440 |

- `data/izna-video-posters.json`：仅展示字段，精确 workId/videoId/view 三项匹配；既有 editorial/assets 中的 SHA、字节和尺寸由测试逐一核对。
- `lib/idol/approved-video-poster.ts`：复用现有入口，追加四个精确 MV 绑定与可选原生尺寸。
- `components/app-image-presentation.tsx`、`components/work-video-player.tsx`、`app/page.tsx`：作品卡片和播放器使用相同预览；contain、不拉伸，带尺寸的图片不超过原生分辨率。Mamma Mia 不冒充高清、不放大到整块播放器大小。
- 其他视频或舞台不借用这四张图，剩余 11 个精确视频预览仍缺。评分、播放地址、版本切换、重试逻辑与 owner-only 保存边界保持。
- 首页构图、成员图、Figma、其他团体页面未改；审阅站 100 个非 izna 文件 SHA 全部保持。

## 本轮验证

环境：ChatGPT managed Linux；从 GitHub 新克隆；Sites 官方安装器成功安装 687 packages，未改 package/lock。正式完整应用只用于类型/构建验证；浏览器运行的是隔离、合成、只读审阅构建，不是真实服务端或生产写入。

| 检查 | 实际结果 |
| --- | --- |
| TypeScript `tsc --noEmit --incremental false --pretty false` | exit 0，0 diagnostics |
| Sites 官方 `build-site.mjs` 正式 Vinext 构建 | exit 0 |
| izna-video-posters、work-video-player、approved-video-poster、retained-video-posters、katseye-video-poster | 28/28 通过 |
| izna-native-integration、izna-review-catalog、izna-review-routing、izna-review-isolation | 24/24 通过 |
| 四张原图及全部 20 个已有原图绑定 | SHA/尺寸/字节校验通过 |
| 只读构建 | 23 个资源；14,282,401 B；12 条净化关联；9 个 API 隔离检查 |
| 浏览器 1363×936 | 四张作品卡片/播放器均真实解码，Mamma Mia 实际显示 490×266；其他三张播放器图片框约 682.59×383.08 |
| 成员→Mamma Mia→评分/观看记录→返回→成员 | 分步真实点击通过；返回作品后焦点回到“评分与观看记录 ↗” |
| MV→舞台→MV | 舞台页面不出现该 MV 的本地图，返回 MV 恢复正确图片 |
| 320/390 iframe 窄窗口 | 手帐图片真实加载；clientWidth/scrollWidth 分别 305/305、375/375；没有横向溢出 |
| 浏览器错误 | 检查时无应用 error/warn；扩展自身 metadata 错误另行排除 |
| 已有审阅页保护 | 100 个非 izna 文件 SHA 不变；只有 review-izna/app.js 与 manifest.json 更新 |

Browser 插件的专用 js 工具未暴露，依技能使用 CUA cloud browser 和 Sites 受支持的 `terminal.local:4173` 内部预览。没有安装/改用外部浏览器，没有访问部署域名绕过该浏览器的站点限制。页面身份、非空正文、无框架报错覆盖层、图片、截图与交互均实际检查。

两次快速批量点击发生目标漂移并导致等待目标超时；读取当前 DOM 后分步点击完成验证。未确定是自动化定位还是页面位置恢复时序问题，因此不声称快速连续操作已通过，也未据此改导航代码。一次跨 iframe 的 contentDocument 读取不受工具支持，改用 frameLocator 读取各框内实际 HTML/图片。

**窄窗口不是顶层真视口或浏览器缩放验收。** 本轮未重跑 1440/2048/2560 真视口、80%/125% 原生缩放；不得继承 v14 的其他机器结果为 v15 通过。截图在本轮会话中实际查看；仓库保存结构化观测与日志，不宣称有独立导出的 PNG。

证据：`docs/codex/evidence/20261023-izna-review-followup/` 中的 `poster-tests.txt`、`integration-tests.txt`、`browser-observations.json`、`archive.json`。

## 发布结果

- 审阅站仍为 owner-private：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`。
- 官方 source workflow 打开 v14 source `02191c188af0a0d373581afd89b8e7d292c6d61a`，只合入 izna 重建产物。打包前短期 source 凭证到期，按工具提示为同一站续期后成功；未保存任何凭证。
- 最终 review sourceFingerprint：`c40080548bb0cc5d0260e09236d1316d2447bf4f0418f1f96c9f971657085df7`。
- Sites source commit：`fef02183457ff9a79f08cacf605e351fcbe3896d`（不是 GitHub commit）。
- 已保存、已部署 **v15**，2026-10-23 11:49:49 UTC 返回 `succeeded`；get_site_version 已读回版本 15 与同一 source。
- 版本 ID：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_a037108af82c819196648d5935902d81`。
- 部署 ID：`appgdep_6adb49d73ae0819195536e3c55bb95f3`。
- [人工审阅地址](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)。
- 本地实际展开 TAR 29,132,800 B（27.783203125 MiB）；gzip 24,438,167 B；SHA-256 `427904b77ebda70d1e756b350ca35deec68726f78feccc7af07276b8470ae411`。临时窄窗口页面在打包前移除。服务端保存后的归档元数据为 29,112,320 B/131 files，二者分开记录。
- 没有覆盖正式主站；正式站仍 v186 A-only。部署成功不代表线上浏览器、真实登录/保存、视频外链播放或人工验收通过。本环境无 open_in_codex 工具，未宣称完成线上自动打开。

## 下一步

1. 用户审阅 v15，继续修 izna 反馈；未明确确认整团前，不开发 ifeye 或其他下一团。
2. 在支持的浏览器补顶层真视口、原生缩放、部署后在线复验，并复查快速连续点击时的位置稳定性。
3. 补余下 11 个精确视频预览、同 MV 成员图及 Figma 内页；不借发行封面或普通人像充当对应视频素材。
4. 真实保存和主站完整包/生产发布仍单独待办。既有 GENBLUE 320px 40px 溢出保持已知问题，本轮未修。
5. 新电脑从 `codex/izna-review-followup` 最新远端 HEAD 接续，先读 RESUME/STATUS；旧 izna 分支是上游基线。
