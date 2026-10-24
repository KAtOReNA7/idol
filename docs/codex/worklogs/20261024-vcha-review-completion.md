# VCHA 页面与手帐接续（2026-10-24，新审阅站 v1 待确认）

用户本轮“同意，继续开发”已确认 KATSEYE v33。本轮仅推进原 Sol 批次内 VCHA；执行者为当前 Codex，没有新增子代理。**等待 VCHA 网页确认后再开始 HITGS 或下一团，公共功能例外。**

- 基线：`2870eb1589df4b51ae2163e4b52fcdc8f9cc371c`，任务分支 `codex/vcha-review-completion`；开工工作树干净，GitHub 无同任务分支或 PR。收尾 ls-remote 复核 KATSEYE 仍为该 SHA。
- 正式工程：`apps/idol-site/`，Windows 本机开发和浏览器。根 sandbox 不是生产源；正式主站仍 v186，不合并 main。
- 需求：当前设计要求、跨会话手册、逐团网页确认与官网/复用披露规则。真实增量为独立 VCHA 团页、精确导航、原图、搜索、历史分章、已有手帐往返与只读审阅。
- 可改：VCHA 团页/样式/公开资料/审阅构建，公开导航中 VCHA 条目，共享成员照片的 VCHA 专属映射；禁止改写用户评分、备注、观看状态、稳定 ID、关系与访问权限，禁止覆盖其他已确认团。
- 阻塞边界：身份/来源冲突时不猜；权限拒绝不绕过；线上浏览器超时记未验，不能以构建或部署状态代替实际交互。

## 视觉参考与复用披露

已实际浏览、截图并读取以下页面：

- `https://vcha.jype.com/` 现跳转 `https://www.jype.com/zh`，不是仍在运行的 VCHA 独立官网。
- `https://www.girlset.com/` 现跳转 `https://shop.girlset.com/`，当前为蓝色 CHAT 商店，属于后续时期。
- [环球《Only One》官方发行页](https://www.universalmusic.com.br/2024/03/15/o-grupo-de-pop-feminino-vcha-faz-o-lancamento-duplo-de-only-one-e-favorite-girl/)提供本轮实际查看的发行艺术参考。

**弃用仓库中未获认可的 VCHA 米色档案稿，团页重写为白底、品红、大字和等大照片。它是《Only One》官方发行艺术的原创延展，不是现存 VCHA 官网复刻，也没有把 GIRLSET 商店冒充历史官网。**

复用 v186 导入后保留的六人历史照片、发行/视频身份，以及 TRACER v30 至 KATSEYE v33 沿用的导航、原图查看器、图片恢复和只读隔离机制。共享手帐继续使用原布局和保存边界，仅追加 VCHA 配色与具名照片映射。Figma 基础按钮复用 `Ke/Action`，没有复用 KATSEYE 团页视觉。交审必须披露以上范围。

照片为 2024 出道概念照，来源保留在成员详情和清单中，属于具名媒体发布，不声称是现时官网肖像。中文名注明页面转写。桌面六人同行，手机两列，图片完整 contain，原图字节保留。

## 页面与资料范围

六位历史成员（Lexi、Camila、Kendall、Savanna、KG、Kaylee），四张 VCHA 发行（SeVit、Ready for the World、Girls of the Year、Only One），四条有实际 URL 的已有作品与八个精确 MV/舞台槽、六条已有成员作品关系、九条时间轴事件（八个确定日期，一个更名日期待确认）。其中六个视频为 GIRLSET 时期，单独分章，不代表 VCHA 原六人阵容。

成员/发行/影像搜索、空结果恢复、原图弹窗及键盘焦点恢复、精确视频详情、六人成员手帐往返、发行搜索到影像和手帐、单根时间轴与作品往返已接入。原快照的无 URL“VCHA · 待补作品”未进入公开审阅，没有给它赋新名称或 ID，生产记录未改。

新增 Girls of the Year 的 JYP MV 与 MTV 舞台精确发布者预览图，均 1280×720，已看图解码并保留水印；原来六张 GIRLSET 预览图沿用。

| 文件 | SHA256 |
|---|---|
| `public/artist/vcha/videos/rBHK8Z8cwmQ.jpg` | `83e8bc71d7787f88a4e2c2b7a1e667b423a4a98aa6091ccda7a9d8d29273ac28` |
| `public/artist/vcha/videos/QQWa8GY1uiI.jpg` | `f46c4eeb835d3574dddf13763005975cd2a5fb81f3b23e75ae63750673dd7b34` |

## 分层验证

Browser plugin not available；本机既有 Playwright / Chrome 验证 `http://127.0.0.1:4190`，这是用户电脑本地服务。线上使用已登录 IAB，不能把本地结果转记线上通过。

| 层次 | 当前证据 |
|---|---|
| 专项/回归 | 31 项通过：新原生页/投影隔离、已有 VCHA 审阅、八视频预览、公开时间轴和 KATSEYE 回归 |
| 类型/正式构建 | `npx tsc --noEmit --incremental false`、`npm run build` 最终退出 0 |
| 真实视口 | 320/390/1440/2048/2560 × 九类页面，共45检查，无横向溢出、坏图、console/pageerror |
| 实际交互 | 28场景通过：搜索、原图、Escape/焦点、六成员×两宽往返、八个视频槽、发行到视频再到手帐、时间轴返回、图片失败重试 |
| 时间轴 | 交互脚本以实际 `[data-timeline-event-id]` 验证非空与往返，实际页面截图核对9事件；早期布局脚本用了旧 selector，计数0是脚本字段错误，不当作事件缺失或通过证据 |
| 数据边界 | 6条既有关系清空私人字段；9项API隔离；审阅无保存按钮。未改原始 snapshot 或新增保存权限 |
| 原图 | 21资产（19图片、2字体）全部本地原字节，4,519,566 bytes；无需 GitHub Raw 外链或压缩 |
| 线上 | 新站 v1 部署 succeeded；IAB 清单可见 VCHA 标题与URL，getTab 40秒超时并重置，线上渲染和完整交互仍未验 |
| 待验 | 真实保存、完整视频播放、80%/125%原生浏览器缩放、完整Figma字体与逐字像素对照；只读审阅不构成生产保存验收 |

复现（正式工程目录）：

```powershell
$env:NODE_PATH='D:/porject/idol/apps/idol-site/node_modules'
node --test tests/vcha-native-review.test.mjs tests/vcha-review.test.mjs tests/vcha-video-posters.test.cjs tests/vcha-timeline-public.test.mjs tests/katseye-review.test.mjs
npx tsc --noEmit --incremental false
npm run build
node scripts/build-vcha-review.mjs --out <仓库外独立绝对目录>
```

## Figma

[新 VCHA 设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1136-1095)共27个可编辑画板，九类页面×1440/390/320，含共享成员手帐。原生 text、image、vector、auto layout，照片使用19份原图填充；临时素材捕获根已清理，旧设计未删。

首页桌面/手机、320成员详情与发行详情、手机时间轴、共享手帐等7个不同节点实际 get_design_context 含截图取稿。修复大标题换行，以及三个时间轴画板的 inline 标题碎片重叠、读屏隐藏标签显露；最终320时间轴再次取稿确认。见[画板索引](20261024-vcha-figma-frames.json)。Space Grotesk 代替网页展示字体，Inter/Noto Sans SC 近似 Arial/Microsoft YaHei；部分装饰及完整字体度量尚未逐像素同步，不声称全量保真或人工设计已通过。

## 私有发布与容量

[VCHA 新站 v1 审阅](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/vcha/index.html)。此处版本号为新站 v1，不是旧站 v34。

旧 Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 的 v33 已有506文件、267,479,910 bytes，距256MiB只余955,546 bytes，本轮JS/CSS/manifest已超余量。因此另建后续审阅站，没有修改旧站源码、文件或权限，没有删旧图片或压缩原图。新站根页提供VCHA与旧站入口。

- 新 Site：`appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，owner/custom，唯一owner、0外部访客。
- Sites source：`0c6814931efbdecfa2a2dc9a908f7c5875de3a38`。
- Version：`appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_952e80c5b4608191aa27592f324e7aa6`。
- Deployment：`appgdep_6adc980a04988191bc479d1782c8607b`，2026-10-24T11:35:46.674720+00:00 succeeded。
- 审阅 fingerprint：`24d98a7c75cb942e67448abe25cb7356a45da23f746285e16fdc58e792b39398`。
- [公开发布证据](20261024-vcha-public-delivery.json)不包含凭证或私有账户资料。

Sites源位于本机证据目录的 `site-source/`，manifest使用新project_id、static.directory=`out`。构建输出复制时排除临时 `figma-media.html`，新建根入口，helper打包并推送后同版部署。短期凭证到期后只刷新同站，通过隐藏stdin传入，没有落盘。

证据根：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/vcha/`。包含官方研究、实际截图、qa/interactions JSON、tests/build-final日志、Figma输入、静态review-v2与新站source；不将本机截图冒充线上截图。

## GitHub 与接续

仓库 `KAtOReNA7/idol` 本轮已核实公开可写；沿用此前对当前代码及既有快照的分享授权，不扩展到新私人数据。当前提交仅公开资料、代码和交接文档，snapshot/用户字段未变。Git全局10808代理失效，命令级 `git -c http.proxy=` 直连；不修改全局设置。本地fetch refspec仅旧KiiiKiii，收尾需显式fetch当前任务基线，不把无输出的默认fetch视为全远端更新。

代码和本日志已同提交 `7df98a3981c10958270b634cdab9555ab7e86240` 正常推送，draft [PR #23](https://github.com/KAtOReNA7/idol/pull/23)已附本会话，base 为 `codex/katseye-review-completion`。首次直连push网络超时，核对现有127.0.0.1:7877代理在监听后，使用命令级该代理成功推送；全局10808配置未改，没有force push。

收尾清理审阅入口末尾两个空行（无运行行为变化），相对基线的 `git diff --check` 已通过；部署保留实际v1源和fingerprint，不因空白/文档补录重复发布。自己的4190静态服务已停止，永久审阅使用新站链接。最终交接补录另行提交并推送。

不合并main、不覆盖正式v186。下次先fetch本分支最新远端HEAD并读本日志，保留未提交改动，不reset/clean/force push。VCHA网页未确认前不开始下一团。
