# 共享开发状态

## 最新执行决定：VCHA 新审阅站 v1 待确认（2026-10-24）

用户“同意，继续开发”已确认 KATSEYE v33。本轮 VCHA 已发布到新的 **owner-private 只读审阅站 v1**：六历史成员、四张VCHA发行、四条既有作品/八影像槽、六既有关系、九事件及手帐往返。旧站v33容量只余955,546 bytes，新站不压缩原图、不修改旧页面。正式主站仍v186。

弃用旧VCHA米色档案视觉，以实际查看的环球《Only One》官方发行艺术重写白底品红团页。旧VCHA域名现跳转JYP总站，GIRLSET域名现跳转官方商店；不能称VCHA官网复刻。复用六人历史照片、既有ID/资料、TRACER v30至KATSEYE v33导航/原图/只读机制及共享手帐布局；共享手帐改配色，交审明确披露。

31专项/回归、类型、正式构建、45项五宽布局与28交互通过。27个可编辑Figma画板、7个不同关键节点实际取稿；修复时间轴文字重叠，完整字体/装饰/像素保真待完善。线上部署成功、IAB标签可见但读取40秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/vcha-review-completion`，基线 `2870eb1589df4b51ae2163e4b52fcdc8f9cc371c`；正式工程 `apps/idol-site/`。原图、稳定ID、评分、备注、观看状态与权限保持。[打开VCHA新站v1](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/vcha/index.html)。详见 `docs/codex/worklogs/20261024-vcha-review-completion.md`。

**等待 VCHA 网页确认后再开始 HITGS 或下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：KATSEYE v33（已确认）（2026-10-24）

用户“同意，继续开发”已确认 SPIA v32；本轮继续原 Sol 批次内 KATSEYE。已发布 **v33 owner-private 只读审阅**，六成员、十发行、九条原生作品（含合作）/17影像槽、11既有关系、14事件及手帐往返。补上成员/发行搜索、原图与精确返回，修复手机隐藏导航/首页影像及审阅入口空时间轴。

**沿用 v186 导入后现存 KATSEYE 松绿米白独立视觉及共享手帐布局**，不是按当前官网重做；实际参考 https://www.katseye.world/the-members/ 当前为粉红青绿、衬线字及三列肖像，交审必须披露差异。六张具名官网照片沿用。32张既有公开图片以GitHub固定提交原字节交付，HTTP/SHA全部核对；498旧文件不变，未压缩原图。

43测试、类型、正式构建、45项五宽布局、38交互与5项时间轴往返通过。Figma新增27个可编辑画板、5个最终关键节点实际取稿；展示字体、逐字间距及全量像素保真仍待完善。线上部署成功、IAB标签可见但读取35秒超时；线上完整交互、真实保存/播放及80%/125%原生缩放未验。设计、资料、功能、上线分别验收。

分支 `codex/katseye-review-completion`，基线 `d1abaf88a1b37101ae7de03326669d4d0073c2f0`；正式工程 `apps/idol-site/`，主站仍v186，未合并main，用户字段/稳定ID/权限保持。[打开 KATSEYE v33](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/katseye/index.html)。详见 `docs/codex/worklogs/20261024-katseye-review-completion.md`。

**等待 KATSEYE 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：SPIA v32（已确认）（2026-10-24）

用户“同意，继续开发”已确认 W!TCHX v31。本轮 SPIA 已发布 **v32 owner-private 只读审阅**：五成员、两发行/四曲、四精确视频、五事件和既有手帐往返。未找到可访问独立官网，采用实际查看的《Deeeep》公司宣传素材作原创视觉延展；五人照片为 Kprofiles 具名转载，不能称官网原图。弃用旧 SPIA 蓝色期刊视觉。复用 **TRACER v30** 精确评分绑定/目录投影及 **W!TCHX v31** 导航、原图、恢复与只读机制；共享手帐沿用布局并换 SPIA 配色，交审明确披露。

37 项专项/回归、类型、正式构建、45 项五宽布局、成员主流程和 28 个补充交互/恢复场景通过。Figma 33 个可编辑画板、8 个节点取稿及关键排布修复已完成，完整逐字像素对照待验。483 旧审阅文件 SHA 不变；为满足 256 MiB 限额，五张原 PNG 由公开 GitHub 固定提交提供，远端 SHA 一致，未压缩改图。线上导航/读取工具两次超时，线上渲染和交互未复验；真实保存/播放、80%/125% 原生缩放待验。

[打开 SPIA v32](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/spia/index.html) · draft [PR #21](https://github.com/KAtOReNA7/idol/pull/21)。分支 `codex/spia-review-completion`，起点 `88d9b3e4e40cc0ed3411b2067a1e8e250482108c`；主站仍 v186，未合并 main，原图/稳定 ID/用户字段/权限保持。**等待 SPIA 网页确认后再开始下一团，公共功能例外。** 详见 `docs/codex/worklogs/20261024-spia-review-completion.md`。

## 历史决定：W!TCHX v31（已确认，2026-10-24）

用户“同意，继续开发”已确认 TRACER v30。本轮 W!TCHX 已依据实际查看的 [K-POP MEDIA / IN MEDIA A&D 官网艺人区](https://kpopmedia.co.kr/#artists)重做黑青品红页面，发布 **v31 owner-private 只读审阅**：五成员、三发行/六曲、六精确视频、六事件及手帐往返。复用 **TRACER v30** 路由、原图查看器、只读机制与共享成员手帐布局/功能；团页视觉独立重写，团照沿用 Bugs 原图。目录、详情、搜索、时间轴与手帐属于官网语言的项目扩展。

44测试、类型、正式构建、45项五宽真视口布局、完整主流程、8恢复/广告规则场景、16成员/视频补查通过。Figma 27个可编辑画板及12个节点完整取稿已完成，全部逐字像素对照仍待验。452个旧审阅文件SHA不变。线上自动导航和读取超时，只见tab标题/URL，不能宣称线上渲染或交互通过；真实保存/播放、80%/125%原生缩放待验。原图、稳定ID、用户字段和权限保持；公开视频尚未接入评分手帐，不给原生空白作品赋名。

分支 `codex/witchx-review-completion`，起点 `7b9bcdb32a1c589e4cf0cfd9a8d10c1852edfa07`，主站仍v186，未合并main。[打开 W!TCHX v31](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/witchx/index.html)。**等待本团网页确认后再开始下一团，公共功能例外。** 详见 `docs/codex/worklogs/20261024-witchx-review-completion.md`。沿用仓库设计继续在交审时披露版本、范围及官网差异。

## 历史决定：TRACER v30（现已确认）

用户“同意，继续开发”已确认 Geenius 官网重设计 v29。本轮 TRACER 已按实际查看的 [GLEAMMEDIA 官网艺人页](https://www.gleammedia.co.kr/artist)重新设计，发布 **v30 owner-private 审阅**：四份成员档案、一项发行/两曲、两个精确视频、三个事件及已有手帐往返。白底玫红、官方横幅/银色标识和成员图取自官网语言；弃用旧信号控制台视觉，复用路由、原图查看器、只读审阅与共享手帐功能，目录/时间轴/手帐属于官网风格的项目扩展。

28 项专项/回归、类型、正式构建、45 项五宽真视口布局和 9 个额外恢复/绑定场景通过；独立复审发现的共享成员照片缺失已修复，四成员 × 两宽共 8 场景复验。Figma 已有 30 个可编辑画板和 11 个节点的实际取稿；完整逐板像素对照及细小字体度量仍待完善。423 个旧审阅文件 SHA 不变。线上首页、成员目录及希真详情已实际读到/截图；详情点击工具曾超时，恢复后截图确认页面已到达，不能扩大为线上完整流程通过。真实保存/播放、原图弹窗与 80%/125% 原生缩放未完成线上验证。

[打开 TRACER v30](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/tracer/index.html)。分支 `codex/tracer-review-completion`，基于 `d94c11d0554d4414a02cf09630fce0b516b35816`；正式工程 `apps/idol-site/`，主站仍 v186。保留原图、稳定 ID、评分、备注、观看状态和权限。**等待 TRACER 网页确认后再开始 W!TCHX，公共功能例外。** 详见 `docs/codex/worklogs/20261024-tracer-review-completion.md`。长期规则：以后沿用仓库设计须在交审时披露版本、范围、官网和差异。

## 历史决定：Geenius 官网重设计 v29（现已确认）

用户明确否决 Geenius v28 的仓库既有视觉，仅认可图片。本轮继续 `codex/geenius-review-completion` / PR #18，以 https://www.geeniushome.com/geenius 为直接视觉参考，重新处理字体、构图、导航、成员及作品内页和共享手帐；保留已核实图片、资料、稳定 ID、评分、备注、观看状态与访问权限。v28 的纸色蓝灰方案及旧 Figma 不构成设计通过。主站仍 v186，更新仅限同一 owner-private QA。**Geenius 重新交审并获确认前不开始 TRACER，公共功能例外。** 过程见 `docs/codex/worklogs/20261024-geenius-official-redesign.md`。

v29 官网风格重设计已发布，27 个可编辑 Figma 画板已同步；39 项专项/回归、类型、正式构建和 45 项真实视口布局通过。394 个其他团审阅文件 SHA 不变。线上 IAB 导航超时，真实保存/播放和原生缩放仍未验，等待本轮网页确认。

**长期交审规则：此后任何团体若沿用仓库已有设计，必须在交给用户审核的消息中明确说明沿用了哪一版/哪些部分，同时给出实际参考官网及差异；不能将旧设计沿用描述为按官网重新设计。** 用户此次要求不授权重做已确认的其他团。

## 历史交付：Geenius v28（视觉已被用户否决）

用户在 ADYA v27 修复后回复“同意，继续开发”，已确认 ADYA。本轮 Geenius 纸色蓝灰页面及 owner-private QA **v28** 已发布：五人成员、三项发行、七个精确视频、四事件与已有手帐往返。39项专项/导航回归、类型、正式构建、45项五宽布局和12个交互/恢复/广告规则场景通过。Figma有27个可编辑画板（含共享手帐）及16个图片组件；字体度量、少数标记/控件细节仍待逐板对照。线上导航及读取自动化超时，仅标签页标题/地址可见；真实保存/播放、80%/125%原生缩放未验。**等待 Geenius 网页确认后再开始 TRACER，公共功能例外。** 分支 `codex/geenius-review-completion`，主站仍v186；原图、稳定ID、评分、备注、观看状态和权限保持。详见 `docs/codex/worklogs/20261024-geenius-review-completion.md`。下方旧门槛为历史。

## 历史执行决定：ADYA（v27 已获确认）

用户“同意，继续开发”已确认 ODD YOUTH v25。本轮 ADYA 原生黑底朱红页面及 owner-private QA **v27** 已发布：五人成员、五发行、六独立视频、五事件与已有手帐往返。49项专项/回归、类型、正式构建、45项五宽布局和10个综合交互场景通过。Figma已建立24个可编辑画板并校正关键首屏/内页；共享手帐画板和完整逐字间距对照仍待同步。线上首页已打开，成员点击自动化超时，不能据此宣称线上交互全过；真实保存/播放和80%/125%原生缩放待验。**等待 ADYA 网页确认后再开始下一团，公共功能例外。** 分支 `codex/adya-review-completion`，主站仍v186；原图、稳定ID、评分、备注、观看状态和访问权限保持。详见 `docs/codex/worklogs/20261024-adya-review-completion.md`。下方旧门槛为历史。


v27修复补充：用户反馈的大片内容缺失已复现为广告拦截规则误隐藏。ADYA团页已改为idol-adya命名空间并为审阅脚本/样式添加内容版本参数；同一EasyList规则下五宽布局、20张图片、标题及成员搜索/原图流程通过。20专项、类型、构建通过。线上自动浏览器本轮仍超时；见 `docs/codex/worklogs/20261024-adya-adblock-fix.md`。


## 历史执行决定：ODD YOUTH（现已获确认）（2026-10-24）

用户“同意，继续开发”已确认 Candy Shop v23。本轮仅推进 ODD YOUTH，分支 `codex/oddyouth-review-completion`，起点 `a1c55190a4c0b2d96bf149f128a62a0e3473868d`。蓝白原生页及 owner-private QA **v25** 已发布：五成员、五发行/12曲目、11视频、五事件与已有手帐往返。49专项/回归、类型、正式构建、40布局与29交互检查通过；24个可编辑Figma画板及关键上下文已建立，完整共享壳保真细节仍待同步。线上v24首页可打开，后续点击超时；原生缩放、真实保存/播放未验。**等待本团网页确认后再开始下一团，公共功能例外。** 主站仍v186；原始照片、稳定ID、评分、备注、观看状态和访问权限保持。详见 `docs/codex/worklogs/20261024-oddyouth-review-completion.md`。下方旧团门槛为历史。

## 历史执行决定：Candy Shop（现已获确认）（2026-10-24）

用户“好的这个团同意，继续开发”已确认 BEWAVE v22。本轮 Candy Shop 已实现并发布 **v23 owner-private 审阅**，分支 `codex/candyshop-review-completion`，基于 `7a9b57bebc306dbe07addb7797255725aec6e05d`。五份成员档案（四位官网列示成员及结菜历史档案）、三张发行、七个精确视频预览、六事件、原图和既有手帐往返已接入。50项专项/回归、类型、正式构建通过；八类页面五宽实际视口和图片失败重试已验。Figma 24个可编辑画板及9处设计上下文已完成。线上自动浏览器导航超时，真实保存/播放与80%/125%原生缩放未验。**等待 Candy Shop 网页确认后再开发 ODD YOUTH**。正式工程 `apps/idol-site`，主站仍v186；详见 `docs/codex/worklogs/20261024-candyshop-review-completion.md`。下方旧团门槛仅为历史。


更新：北京时间2026-10-24。

[打开 W!TCHX v31](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/witchx/index.html) · [本轮日志](worklogs/20261024-witchx-review-completion.md) · [接续入口](RESUME.md)。

GitHub：`codex/witchx-review-completion`，draft [PR #20](https://github.com/KAtOReNA7/idol/pull/20)，base `codex/tracer-review-completion`；代码提交 `b9008f36e2cb67330d425366dd4fd8af36c3138b` 已推送。后续交接以任务分支最新远端HEAD为准。

## 已核基线与交接入口

- 正式工程：`apps/idol-site/`。源码提交 `f24075fc98893793e82adbc92cadc9e58257728f` 已正常推送并读回确认。
- 来源为 Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350`，不是本仓库可 fetch 的历史 commit。原生子树 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；[基线清单](SOURCE-MANIFEST.json)覆盖3954文件、642362678字节；1863张图575168413字节保持原样。
- 2026-10-22原始入口、文档和三个隔离候选的交付历史保留；可用 `git log -- docs/codex/STATUS.md handoffs/codex-20261022` 查询。候选目录到位不等于已应用或上线，当前接入状态见下表。
- main 仍为 `b9e101262c696c2c77ed6aee62d004370c53cd21` 的旧 Next sandbox。本交接未合并 main。
- v186 纯 TypeScript 检查已通过：`tsc --noEmit --incremental false`，exit 0、0 diagnostics。仅复用相同依赖；fresh-clone 安装、完整构建、浏览器与生产不据此记为通过。
- 用户 13:22 UTC 明确保持仓库公开，并批准本次已有评分、备注、观看快照公开入仓；不包含秘密，也不扩展到未来新增敏感数据或无关导出。

## 产品与收官状态

| 范围 | 当前状态 | 接续边界 |
| --- | --- | --- |
| 线上主站 | v186 A-only | 未发布 MEOVV B 或本分支的团体增量 |
| GENBLUE | BlueCut 已接入正式工程；v10 页面获用户明确认可 | [已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html)；开发侧真实浏览器/保存未验，主站包体超限事项仍保留 |
| WOOAH | 已修正为团照首屏、五人同组、统一4:5成员照片；只读审阅v12已发布 | [已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)；该轮类型、干净构建、20+37项检查及剪枝dry-run通过；真实浏览器/保存未验，24个视频配图仍缺；保护已认可页面 |
| MEOVV B | 四段patch及四份真实readback已入仓；未上线 | pins只绑定当次产物，完整Sites TAR容量与最终发布仍待验 |
| izna | 原生页、7份含历史成员档案、8项只浏览发行、15影像、12条具名MV关系与20原图；v15补四张精确MV图 | [v15页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)本轮获用户确认；其11个视频预览、Figma内页/真视口/缩放/线上浏览器/真实保存等历史待办保留 |
| ifeye | v3设计已原生接入，6成员、3发行、7影像、10原图、5事件；9公开MV参与关系、6既有个人记录 | [v16审阅入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/ifeye/index.html)已获用户页面确认；仅私有只读审阅，历史未验项继续保留 |
| Hearts2Hearts | 独立蓝网格设计完善，8官网原图、成员/发行搜索、13版本、11事件、64既有关系和真实组件往返 | [v17审阅入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/hearts2hearts/index.html)已获用户页面确认；真实保存/视频图片/真视口/设计内页/主站待验 |
| KiiiKiii | 独立酸绿设计完善，v18页面已确认 | 历史照片、资料/设计/保存待办保留 |
| SAY MY NAME | 淡紫唱片设计完善；v19页面已确认 | 历史资料、设计、保存与上线未验项保留 |
| VVUP | 独立深色酸黄设计；v20页面已确认 | 历史素材、资料/设计/保存未验项保留 |
| YOUNG POSSE | v21页面已获用户确认 | 历史资料、设计及真实保存待办保留 |
| BEWAVE | v22 页面已获用户确认 | 历史未验项保留 |
| Candy Shop | 独立粉紫唱片设计；v23已获用户确认 | [打开页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/candyshop/index.html)；线上交互、真实保存/播放和原生缩放待验 |
| ODD YOUTH | 蓝白相册 v25 已获用户页面确认 | 真实保存/播放、原生缩放及Figma共享壳细节等历史未验项保留 |
| ADYA | 黑底朱红独立页；v27已获用户页面确认 | 线上交互、真实保存/播放、原生缩放及共享手帐Figma仍待验；见本轮日志 |
| Geenius | HOMe 官网风格 v29 已获用户确认；v28旧视觉已否决 | 历史线上交互、真实保存/播放、缩放和Figma细节待办保留 |
| TRACER | GLEAMMEDIA 官网风格 v30 已获用户确认 | 28测试、45布局、30个可编辑Figma画板；线上首页/成员目录/希真详情已验证，完整流程和真实保存/播放待验 |
| W!TCHX | 公司官网黑青品红v31已发布，待网页确认 | 44测试、45布局、27可编辑Figma画板；线上浏览器、真实保存/播放和缩放待验 |
| Astra | 已收官 | 不代表15团全部设计/上线通过 |
| Sol | 本轮已收官，最终反馈已归档 [SOL-HANDOFF](SOL-HANDOFF.md) | 13:38形成、13:53主会话完整读取；不等于全部团体产品验收通过 |

## 下一里程碑与任务索引

从 [RESUME](RESUME.md) 开始，显式 fetch `codex/witchx-review-completion` 最新远端 HEAD。W!TCHX v31 等待网页确认，确认前不开始下一团；公共功能例外。

- [W!TCHX 官网风格原生页与 v31](worklogs/20261024-witchx-review-completion.md)：当前轮次，待网页确认。
- [TRACER 官网风格原生页与 v30](worklogs/20261024-tracer-review-completion.md)：已获用户确认。
- [Geenius 官网重设计 v29](worklogs/20261024-geenius-official-redesign.md)：已获用户确认；v28旧设计已否决。

- [Candy Shop 原生完善](worklogs/20261024-candyshop-review-completion.md)：历史轮次，v23已获页面确认。
- [BEWAVE 原生完善](worklogs/20261024-bewave-review-completion.md)：历史轮次，v22已获页面确认。
- [YOUNG POSSE 原生完善与v21](worklogs/20261024-youngposse-review-completion.md)：已获页面确认。
- [VVUP 原生完善与v20](worklogs/20261024-vvup-review-completion.md)：历史轮次；页面现已确认。
- [SAY MY NAME 原生完善与v19](worklogs/20261023-saymyname-review-completion.md)：历史轮次；页面现已确认。

- [KiiiKiii 原生完善与v18](worklogs/20261023-kiiikiii-review-completion.md)：历史轮次；KiiiKiii v18现已确认。
- [Hearts2Hearts 原生完善与v17](worklogs/20261023-hearts2hearts-review-completion.md)：历史轮次；Hearts2Hearts v17已获页面确认。
- [ifeye 原生接入与v16审阅](worklogs/20261023-ifeye-native-integration.md)：历史轮次；用户已确认ifeye v16。
- [izna 手帐图片接线与v15审阅](worklogs/20261023-izna-review-followup.md)：前一轮次，四个精确视频预览接通，v15现已获页面确认。
- [izna 首屏网页同步](worklogs/20261023-izna-hero-web.md)：前一轮次；已按批准稿同步、完成本地检查并发布v14，等待网页确认，主站未改。
- [izna Figma首屏调整](worklogs/20261023-izna-hero-figma.md)：前一设计轮；桌面/手机首屏与真实团照已落地，用户随后同意继续开发，网页同步见上一项。
- [izna 原生接续](worklogs/20261023-izna-native-integration.md)：`codex/izna-native-integration` / draft PR #6；v13审阅已发布，精确版本与验证以该日志为准，用户审阅未确认。
- [此前两团保存检查点](worklogs/20261023-resume-checkpoint.md)：两团页面获确认，新电脑完整接续入口已整理。
- [本次有界交接记录](worklogs/20261022-repository-handoff.md)
- [GENBLUE 本轮审阅版](worklogs/20261022-genblue-review.md)：`codex/genblue-native-integration` / PR #3；补夜市王具名 MV 图及双向成员入口、0.1 评分步进和构建审计。最终类型/构建/62 项专项通过；私有只读审阅站已发布。旧轮正式展开 TAR 271.328125 MiB 超限，浏览器与真实保存未验、主站未发布；后续 v10 页面已获用户认可。[首轮接入历史](worklogs/20261022-genblue-native-integration.md) 保留。
- [WOOAH 三项布局反馈修正](worklogs/20261023-wooah-layout-feedback.md)：同一PR #5，团照前置、首页/成员目录五人统一、原图保留，v12已获用户本次页面认可。
- [新任务 worklog 模板](worklogs/TEMPLATE.md)
- [GENBLUE 验收链接 404 修复](worklogs/20261022-genblue-routefix.md)：同一 PR #3；物理团页、静态回退配置、路径规范化已发布到审阅站。10 项相关回归及类型检查通过；线上浏览器/HTTP 可达性未独立复验，不能宣称 404 已在用户端消失。
- [WOOAH 正式接续](worklogs/20261022-wooah-native-integration.md)：基于 GENBLUE 修复提交 `c523b0b` 的 `codex/wooah-native-integration`；56 条成员/MV 精确关系、5 个时间轴作品入口、资料来源修订、独立只读审阅入口与原图保留守卫已落地。首轮v11后已修正为v12并获页面确认，保留已认可 GENBLUE；PR 以 GENBLUE 分支为基线，不从旧 main 开工。

每次结束/换机前代码与 worklog 同提交并 push 合规 WIP。未验 WIP 不混成已验 main；合并与实际验证后才更新已验基线。当前无生产发布授权就交预览，有明确授权后可按验收门槛继续，不永久停在候选。

## Sol 最终补遗（2026-10-22）

主会话已独立复核通过 `253633c5bcf2b58c06a54c4d817df9d168182fcf` 的有界入口/候选交接；这不是产品验收或上线通过。用户13:52已收到原字节首次执行文件，可直接开工。本补遗归档Sol最终反馈与Photo v1历史设计参考，不覆盖combined中的native v1.2，不阻塞接手。Photo v1已取回；私有合成QA关键返回/队列/原图及80%/125%已过，真实catalog/保存/精确视口/生产仍待验。

原 `PACKAGE-SHA256.json` 与交接worklog保留253633c5提交时的范围；本次新增8文件用参考目录的 `SHA256SUMS` 核验，状态文档后续更新不回写旧交付快照清单。首次执行正文与正式源码不变。
