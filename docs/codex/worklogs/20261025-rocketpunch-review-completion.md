# Rocket Punch 官网参考重设计与审阅接续

- 用户“同意，继续开发”已确认 EVERGLOW v11；本轮仅推进原 Sol 顺序中的 Rocket Punch。确认本团前不开始下一团。
- 分支 `codex/rocketpunch-review-completion`，冻结基线 `1e49aa316c2c02bc7afc23fa915cdb548efded6d`；已fetch并核远端，无同任务分支/PR。正式工程 `apps/idol-site/`，本机Windows代码/服务/Chrome。
- 六个既有成员ID（含JURI历史档案）、11具名作品/9舞台及54既有关联，保持稳定身份、历史归属及用户评分/备注/观看状态。
- 旧票券视觉不构成已认可设计，本轮先实际查看官方页面后独立重写；路由、公开投影、原图恢复和手帐业务可复用 EVERGLOW v11 / fromis_9 v10，视觉复用范围在交审明确披露。
- 同一审阅站已核为owner一人、external visitor0，当前v11；source helper opening commit `f4df22a9bd46fc3048ee55d66e174ce46ab4e1ff`。只更新owner-private审阅；正式主站v186、旧站v33及已确认页保持。
- 来源研究由Sites技能要求的有界子代理执行；主代理负责查看实际参考、实现、Figma、验证、发布与GitHub交接。

## 页面、资料与业务边界

旧票券视觉已弃用。本轮实际参考 [Woollim《BOOM》官方发行页](https://www.woolliment.com/album/boom)，独立重写黑底、白色 Open Sans、鲜黄链接、方角图片及细线排版。这是公司发行详情页的视觉延展，不是独立团官网或逐像素复刻。日本旧域名当前转为商城，已从本团手帐上下文移除失效官网入口。

- 六位历年成员使用2023 BOOM同系列官网具名照片；身份由原URL韩文文件名核对，未凭脸辨认。中文名与原稳定ID保持。完整团照1984×1403，成员显示框等大；SUYUN原照为横幅，列表cover、详情及原图contain，原字节保持，不能称六张原照尺寸一致。
- 15项Bugs发行 / 55条本团署名曲目行，含伴奏、版本、OST及合作，非55首不重复歌曲，也不宣称全球发行全集。SODA注明尹景、素姬、多玹三人演唱；混合合辑只保留本团署名曲目。
- 11条既有作品 / 20影像槽（11 MV、9舞台）/ 54既有关联。Ring Ring原版和Acoustic以各自作品ID精确绑定发行；不按同名模糊合并，不创建猜测评分关系。
- 成员、发行和影像搜索/空结果，15发行详情，原图、图片失败恢复、筛选、时间轴和成员/MV/舞台手帐往返。补上Rocket Punch历史名册路由白名单，修复JURI带历史过滤参数往返丢失详情。
- 公开审阅投影清空评分、备注、观看状态和私人照片，拒绝写入与原始记录读取。正式用户字段与安全边界未改；原MV私人造型图不以通用肖像冒充。
- 正式工程只修改本团设计、资料/头像、审阅builder与有限共享接入：`app/page.tsx`增加合法本团上下文头像/主题及官网入口，`artist-navigation.ts`增加发行白名单，`member-affiliation.ts`增加历史名册路径。

**复用披露：路由、公开投影、搜索、原图恢复及手帐业务承接 EVERGLOW v11 / fromis_9 v10；共享手帐沿用布局并换黑黄配色。团页视觉独立重写，搜索/目录/时间轴/手帐为项目扩展。**

## 时间轴与来源

新公开时间轴 `apps/idol-site/data/rocketpunch-timeline-public.json` 共13事件。旧canonical `data/artist-timelines/rocketpunch.json` 恢复并保持基线原字节，SHA256 `2147fe17b40c214784b2b7e753d94e47b463382148724f17fc3256de6cf8addf`；未放宽旧审计pins。

- JURI合同结束为2024-05-24：官方公告提供“24日”，同期Soompi具日期报道补年月。
- 四人2024-12-31为公告中的计划结束日期，保留`status:announced`、`plannedDate`与空`eventDate`，不自动兑现为已发生事件。
- SUYUN公司公告确认合同已结束；2026-08-06仅作为本人公开信发表日`announcementDate`，精确合同日未知，`eventDate:null`。不推定解散或2026当前共同活动阵容，也不重写业务归属。

官方Weverse正文依据实际search/open读取；本地raw HTML只返回shell，不用空HTML冒充正文证据。短摘与日期边界见 [timeline-evidence](../evidence/20261025-rocketpunch/timeline-evidence.json)，研究记录见 [sources](../evidence/20261025-rocketpunch/sources.md)。图片原URL、尺寸、字节与SHA见 `apps/idol-site/data/rocketpunch-review-assets.json`。

## 视觉对照记录

ImageGen概念只用于排版探索，未作为人物、封面、日期或URL资料源，也未获用户确认。概念图与网页1440/390截图已经实际并排查看，最终差异如下：

1. 保留黑白黄、Open Sans、细分割线和方角；字体由实际官网CSS核实，正文修为真实可变字体，避免全站误用粗体。
2. 六静态成员等大展示；概念中的生成人物全部替换为官网具名原照。SUYUN列表裁切只发生于显示框，详情及原图保留完整构图。
3. 首页完整六人团照，无滤镜和文字遮挡；图片字节不裁切、不压缩。
4. 发行桌面三列、手机两列；概念中的虚构封面/发行日期换为Bugs真实资料。
5. 手机首屏堆叠，导航保持可见；增加原图、发行详情、搜索与只读审阅提示是实际产品要求。
6. 共享手帐沿用已有功能与结构，单独换配色；不把它称作官方原页面。

本轮不宣称与官网、概念或Figma逐像素一致。截图本地路径及SHA见 [screenshot-references](../evidence/20261025-rocketpunch/screenshot-references.json)。

## 本机验证

环境为Windows本机；源码 `D:/porject/idol/apps/idol-site`，本地审阅 `http://127.0.0.1:4198`。流程：团页→成员搜索→详情→原图→手帐→精确返回；另验证发行/影像/时间轴。

| 检查 | 实际结果 |
| --- | --- |
| 专项/回归 | Rocket Punch、EVERGLOW、fromis_9、IZ*ONE四组review-boundary共43通过 |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit`成功 |
| 正式构建 | `npm run build`成功；不等于主站已部署 |
| 审阅隔离 | builder 9项API隔离检查通过，54关系公开投影 |
| 布局 | IAB九宽×十页90项；本机Chrome独立同样90项，无横溢、坏图、零宽图片或应用console/page errors |
| 连续交互 | 45项通过：六人两宽原图/手帐/返回、历史查询、15发行、Ring Ring版本、筛选、时间轴、未知ID与失败重试 |
| 页面健康 | 目标URL/标题正确、内容非空、无框架错误层；截图已实际检查桌面/手机 |
| IAB本地交互 | 首页、成员详情、原图弹窗、成员手帐及返回已实际操作 |
| 截图限制 | IAB整页截图报 `Unable to capture screenshot`；按frontend测试技能用本机Chrome补截图/连续验证。Browser插件未列出，CUA可用 |
| 未验 | 真实owner保存、播放器真实播放、80%/125%原生浏览器缩放 |

新增时间轴测试第一次错误地把groups数组直接当validator context，修为含groups/members/works的完整context后通过；未降低校验。曾试旧 `timeline-production.test.cjs`，首次临时bundle React解析失败、补NODE_PATH后仍有旧全51团总数/旧布局断言；未将这次尝试算通过，未改旧pins。新公开时间轴由专项严格validator及浏览器呈现验证。

复现命令：
```text
cd apps/idol-site
node --test tests/rocketpunch-review-boundary.test.mjs tests/everglow-review-boundary.test.mjs tests/fromis9-review-boundary.test.mjs tests/izone-review-boundary.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/build-rocketpunch-review.mjs --out <仓库外绝对路径>
```

证据：[布局](../evidence/20261025-rocketpunch/layout-proof.json)、[IAB布局](../evidence/20261025-rocketpunch/iab-layout-proof.json)、[交互](../evidence/20261025-rocketpunch/interactions-proof.json)。

## Figma

[本团原生页面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1236-1095)：30个可编辑画板，十类页面×1440/390/320，44图片组件、五颜色变量，复用共享STAGE按钮组件`3:2`。图片用原字节导入，hash已读回；不是把网页截图flatten成界面。

七个不同关键完整节点已实际get_design_context：桌面首页、成员详情、发行详情、手机成员目录、时间轴、手机成员手帐主体、手机MV手帐主体。大手帐画板返回sparse后取完整主体节点，不把sparse计为完成。修复了时间轴误横排、36个列表肖像实例FILL及字体字重；详情图仍完整。

自动capture `e3931b96-a8ec-4646-ba2e-938764438cda`完成，但截图缺图片，仅用于文字/结构参考，不能证明图片保真。参考Frame`1242:1095`已在实际查看后删除，原生30画板保留。临时capture脚本/页面未进入发布白名单，正常CSP已恢复。

英文Open Sans已使用；中文以Noto Sans SC替代网页Microsoft YaHei。**完整字体和逐板像素保真未通过**。节点与修复记录见 [Figma证据](../evidence/20261025-rocketpunch/figma-proof.json)。

## 发布与GitHub接续

- Site `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`，再次核对owner一人/external0/custom。原受众保持。
- source helper commit `e34abc2f2b0425e95f581b07b9abbdb93eb8f6ec`，source fingerprint `42ffc76d6246d01d6eb60aae90779b0f905b278af3cc65fe42914b43879a8737`。
- 增量51文件；381既有非root文件SHA保持，root只增加Rocket Punch入口。静态预计225,469,156 bytes，保留原图无需外链或压缩。见 [增量证据](../evidence/20261025-rocketpunch/increment-proof.json)。
- 正式主站v186和旧站v33未改，未合main。GitHub实际PUBLIC、本人ADMIN已复核。新增分享仅公开资料/原图/代码和验证证据，未扩展既有私有快照分享范围。
- 发布结果、线上验证和draft PR在下段记录，以实际回读为准。

**本团交审后等待用户确认，确认前不开始下一团，公共功能例外。**

## v12 发布结果与线上验证

原生发布工具返回succeeded，随后get_site读回version_number=12。version `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_46c2c16f717081918332a41af037c000`，deployment `appgdep_6add01274e78819195ced01eca2176cf`，2026-10-24 19:04 UTC（本地10月25日）。archive 215964286 bytes，SHA256 `786a7236ef2743d21a13c607bd0f28c5d3c91ec407112e5a9dcb51bab696ec86`。

[打开Rocket Punch v12](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/rocketpunch/index.html)。IAB首页AX完整读到，初次导航45秒超时、恢复后成员点击40秒超时；不把它当线上完整流程通过。Browser插件未列出，按frontend-testing-debugging技能使用本机Chrome补验。Sites工具返回的服务访问token仅在内存并限同站请求头使用，没有访客身份、没有真实保存，未写入源码/日志/文件。首次漏Bearer前缀返回401，按Sites文档修正后200；无权限调整。线上脚本首次误用data-event-id计数为0，实际DOM有全部13事件；改为data-timeline-event-id后通过，非产品数据丢失。

1440与390各六组，共12组核心流程通过，console/page errors为空：首页图片/布局、团照原图、JURI历史搜索/详情/手帐精确往返、BOOM曲目/搜索返回、BOOM作品绑定/返回、13事件与时间轴往返。证据见 [online-proof](../evidence/20261025-rocketpunch/online-proof.json)。真实保存、真实播放、80%/125%原生缩放仍未验。

代码提交 `91d025810d072f9a3a79cf8a30d81d90ef27135e` 已推送，draft [PR #30](https://github.com/KAtOReNA7/idol/pull/30) 已创建并附加本会话，base为 `codex/everglow-review-completion`。后续接续以远端分支最新文档HEAD为准；当前等待Rocket Punch网页确认。
