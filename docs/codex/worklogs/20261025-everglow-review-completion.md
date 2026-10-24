# EVERGLOW 官网语言重设计与审阅接入

- 用户“同意，继续开发”确认 fromis_9 v10；本轮仅推进 EVERGLOW，待本团确认再开始下一团。
- 分支 `codex/everglow-review-completion`，冻结 `96f2f435554ce075d37a0fcec105ce6d75cca644`。工作树干净，已 fetch 与查重远端分支/PR。正式工程 `apps/idol-site/`；本机 Windows 开发与 Chrome 验证。
- 已实际查看现行公司艺人页 https://www.chxxta.com/everglow 截图、HTML/CSS。黑底、白色窄体字、紫色官方字标、四人竖幅团照及细线。弃用旧棕橙放映室设计。官网社区 https://everglow.bstage.in/ 为辅助来源。
- 本团已有六身份（四当前/二历史）、十具名作品/九舞台、58既有关联。保留稳定 ID、历史归属、全部原图与用户评分/备注/观看状态。只读审阅仅投影公开字段，个人字段清空。
- 路由、公开投影、搜索、原图恢复和手帐业务复用 fromis_9 v10 / IZ*ONE v8；团页重新编排，共享手帐沿用布局并换黑紫配色。目录/搜索/时间轴/手帐是项目扩展，不称官网逐像素复刻，交审披露。
- Sites 已核同站 v10，owner 一人、external visitor 0；source helper 已打开 commit `0cdc7df6c534a553607a1f8a0065aa76f711bfe2`。发布仅限现有 owner-private 审阅站，主站 v186、旧站 v33、已确认页面保持。
- 官方研究由 Sites 技能要求的 bounded research 子代理完成；主代理实际查看官方截图。Figma、资料、布局、交互与上线分别记录，未执行项不认定通过。
## 已交付的页面与资料

- 首页以 CHXXTA 黑底、原紫色字标、官网 HGG 窄体字体及四人原团照独立重写；当前四人静态、等大照片，手机两列。保留历来六人搜索和详情，MIA / YIREN 为历史档案。
- 六张 Weverse 具名资料照没有新裁切或压缩，标注“旧 Weverse 官方资料照 · 非当前造型”，无公开拍摄日期则写未载。没有从合照位置推断身份。
- 16 项发行、42 条 EVERGLOW 署名曲目行（含不同版本、伴奏与合作，非 42 首不重复歌曲）；混合艺人合辑仅保留本团曲目。Bugs 原页 95 条总曲目未全部导入。Ghost Light 共同署名及 BETTER TOGETHER 群星合作保留。
- 十个既有作品、九个精确舞台、19 影像槽与 58 个已有单成员/单作品关系保持，不新增猜测评分关系。CODE 作品 `recvxyH5pznMiW`、MV `pe3EWBY7SIc`、舞台 `TcgHvftYjRM` 精确绑定。
- 发行/成员搜索、空结果、原图弹窗、失败重试、时间轴、成员/MV/舞台手帐与精确返回已接入。历史名册中的当前成员往返仍保留 `roster=history` 和 `q`。托管 `records.html` 到 `records` 的重定向兼容。
- 正式数据及评分、备注、观看状态未改。审阅个人字段为空且拒绝写入；手帐“本MV个人造型图暂缺”是清空私人照片后的明确缺图状态，不用通用头像冒充本MV造型图。
- 正式团页与共享层范围：`components/candidate/everglow-design.tsx`、两份本团CSS、公开资料/投影、上下文头像模块与审阅builder；共享 `app/page.tsx` 只增合法EVERGLOW返回上下文主题/头像，`artist-navigation.ts` 增发行路由白名单。

## 来源及视觉对照

实际参考官网：
- https://www.chxxta.com/everglow
- https://everglow.bstage.in/
- 名册/发行 https://music.bugs.co.kr/artist/20076399 及16项发行详情；资产来源、尺寸、字节与SHA在 `apps/idol-site/data/everglow-review-assets.json`。
- 官方hero 666×821、字标2516×371、HGG字体原字节；六张既有Weverse单人照、16封面、19视频缩略图，合计44资产 / 8,026,661 bytes。
- Bugs简介写2019-03-21，而首专发行页为2019-03-18；保留既有出道事件，不由此覆盖历史。

ImageGen概念只用于构图规划，未用于页面事实或图片资产，未获得用户设计确认。最终已在同次工具调用中查看概念与1440px网页截图：
1. 黑底、细线与紫色原字标保持；使用下载的官方字标而非生成字形。
2. 采用官网HGG字体，未把生成图的大字形当作精确字库。
3. 团照以完整原图显示，无文字覆盖；成员用真实具名旧Weverse照片，未使用生成图捏造的单人造型。
4. 页头是EVERGLOW品牌；未沿用概念的CHXXTA公司导航或生成宣传文案。
5. 四人成员同等尺寸，手机两列；发行与影像独立完整分区，为搜索和详情保留实际可用目录。
这是有意的事实/功能校正，不称与生成概念逐像素相同。

复用披露：路由、公开投影、搜索、原图恢复和手帐业务来自 fromis_9 v10 / IZ*ONE v8；共享手帐沿用布局并换黑紫色。团页独立重写；目录、搜索、时间轴和手帐是官网语言的项目扩展，不称官网逐像素复刻。

## 验证（本机Windows）

| 层级 | 实际结果 |
| --- | --- |
| 专项/回归 | `node --test tests/everglow-review-boundary.test.mjs tests/fromis9-review-boundary.test.mjs tests/izone-review-boundary.test.mjs`：31通过 |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit`成功 |
| 正式构建 | `npm run build`成功；仅构建，未部署正式主站 |
| 审阅隔离 | builder的9项API隔离场景通过；无真实写入 |
| 布局 | 10页面×320/390/700/1100/1440/2048/2560/2926/3840真实Chrome视口，共90项；无横溢、坏图、零宽图片或页面错误 |
| 交互 | 46项：六成员原图/焦点恢复/手帐往返×2宽、16发行详情、搜索空结果、CODE绑定、舞台重载、时间轴往返、未知ID、图片恢复、历史名册过滤恢复 |
| 本地IAB | 首页截图、成员目录、金施贤搜索/详情与原图弹窗实际操作；后续手帐往返未由IAB完成 |
| 线上IAB | v11首页和成员目录完整AX实际读到；搜索/详情批量操作60秒超时，后续状态读取40秒超时。不能认定该操作失败或通过，线上完整流程未验 |
| 未验 | 真实owner保存、播放器真实播放、80%/125%原生浏览器缩放 |

首次交互脚本误留了 fromis_9 的 LIKE YOU BETTER 预期，修为 CODE 后最终46项成功退出0；不把脚本错误记为产品故障。此次未重复扩大已有通过范围。Git diff检查采用 `core.whitespace=cr-at-eol` 识别Windows行尾；无内容空格错误。

复现：
```text
cd apps/idol-site
node --test tests/everglow-review-boundary.test.mjs tests/fromis9-review-boundary.test.mjs tests/izone-review-boundary.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/build-everglow-review.mjs --out <仓库外绝对scratch路径>
```
资料及布局/交互/增量SHA证据见同目录 `20261025-everglow-qa-proof.json`、`20261025-everglow-interactions-proof.json`、`20261025-everglow-increment-proof.json` 与 `20261025-everglow-sources.md`。

## Figma

文件 https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1228-1098 ，新page `1228:1098`。11类页面×1440/390/320共33可编辑画板，45图片组件（含两条共享播放器缩略图URL），图片原字节hash已读回；组件、文字、自动布局、矢量和本团变量可编辑，不是整页截图。结构证据见 `20261025-everglow-figma-proof.json`。

七个不同关键节点已实际完整get_design_context并查看截图：桌面hero/成员、手机hero/成员、桌面发行详情、手机时间轴与成员手帐。三宽时间轴的绝对标记误入横排flow造成偏移，本轮按DOM实测修正为文字相对LI x=0、marker x=-40；已重新取稿手机时间轴，文字未再被右侧裁切。

官方HGG字体在Figma不可用，明确使用Roboto Condensed；Arial/微软雅黑用Inter/Noto Sans SC。**字体保真和完整逐板像素保真未通过**，不能报告10/10。自动capture ID `f7d3bef0-70fa-483f-a582-0379baa42ce3` 多次poll仍pending；本地capture临时页含官方script，但IAB随后持续超时，无法继续诊断浏览器状态。未创建新capture重复提交、未把pending记成功；33原生画板独立完成。临时capture.html不在部署包中。

## v11 发布证据与保护

- Site `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，发布前核对owner一人、external visitor0。保持原受众。
- 地址 https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/everglow/index.html
- source helper commit `f4df22a9bd46fc3048ee55d66e174ce46ab4e1ff`；source fingerprint `cd25a6414d0f7cb38cb8b462bbc2d67f87ae4860895fade949301ef868c37d38`。
- version `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_f3c900b20cc4819199ca63c66e78e84c`，native读回 **version_number=11**。
- deployment `appgdep_6adcf572af908191a7d1660d163250b8`，native返回 **succeeded**，2026-10-24 18:14 UTC（本地10月25日）。
- archive SHA256 `b48f855933f2ed4f2fa6491c9834a22a54886a452896f1bfbecaff7f0126af46`，197,785,600 bytes / 383文件。静态内容197,479,185 bytes。
- 330既有非root文件SHA完全保持，51新增文件，root仅增加本团入口。旧审阅站v33和正式主站v186未改。
- source helper第一次credential过期后通过原工具renew；credential只在内存/hidden stdin使用，没有写入仓库。
- 已通过open_in_codex交付线上页，返回queued；不把此UI打开结果当作新的渲染验收。

## GitHub接续与剩余事项

GitHub实际public，用户已授权的既有快照分享范围保持；新增内容仅公开资料/原图/代码与验证证据，无新增个人数据或凭证。代码和本日志一起提交，推送独立分支，draft PR基于 `codex/fromis9-review-completion`，未合main。

**等待用户审阅EVERGLOW v11；确认前不开始下一团，公共功能例外。** 下轮先fetch最新远端并读取本分支HEAD及PR；设计、资料、功能、上线分别验收。未验的线上完整交互、真实保存/播放、原生缩放及Figma字体/像素对照保留为待办，不继承其他团结论。
