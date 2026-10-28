# 跨电脑接续：正式v199，PR44未合并

正式工程为 `apps/idol-site/`。根目录旧sandbox不是发布工程。

## 先保护与核对

1. 检查并保护本地未提交、未跟踪文件，记录可恢复备份；不要reset、clean或强推。
2. 显式fetch `origin/main` 和 `origin/codex/statistics-relations-followup-20261027`，读回[PR44](https://github.com/KAtOReNA7/idol/pull/44)。最近main为`852f7506a4f921fff4e4d24fe70e8d607c7d40f5`（v191）；PR44仍draft/open，包含v192–v199。
3. 干净后从最新origin/main新建codex/任务分支。PR44未合并则普通merge其最新远端分支；已合并则从包含它的最新main继续。不能把main旧v191覆盖正式站，不重复合PR43/辅助资产分支。
4. 依次读本文件、AGENTS.md、STATUS.md、RESUME.md、[本轮报告](continuous-stage-person-report-20261028.md)、[舞台政策](stage-selection-policy-20261028.md)及当前两份队列。

本机分支 `codex/statistics-relationship-followup-20261028`，交付远端 `codex/statistics-relations-followup-20261027`。SHA为证据，工作基线必须读取最新远端。

## 当前交付

## 最新交付：v199上线，8舞台替换与35作品人物资料（2026-10-28）

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线 **v199 / succeeded**。GitHub实现`c17f6d0a14161068d160cad9f8b3a371cd4a64db`已普通推送并读回PR44任务分支；PR44仍draft/open、未合main。Sites源`747aa997a7512592a305a5e21161ded078fa519d`，部署`appgdep_6ae1cb52942c8191b0f93d099994fd3e`；两种交付分别记录于 `docs/codex/evidence/20261028-continuous/publication.json`。51团设计、Apple Music主站、个人评分/备注/观看、稳定ID/关系、访问和owner鉴权保持。

19项旧活动来源全部有界重研，实际替换8项（6练习室、2打歌），剩11；正式来源仍493，原112新增缺口保持。用户授权一次专用Chrome只读导出，09:19:46.252Z真实owner备份中8项空分、206条日志无目标、线上旧对象与本地一致，67秒后导入。0分不为空；完整旧来源与历史保留，其余485舞台/606状态相同。私人写入0，专用标签已关闭；这次授权不扩大为日常Chrome使用。8新原封面1280×720共824340bytes，628作品/展示封面＋23舞台封面；无放大或重绘。

本轮公开人物资料新增35作品/165槽，累计80作品/444槽/202份既有原件，新增认人原图文件0。部分录音、发行、创作、拍摄与报道参与分别标注，不推定MV全员出镜或新建私人评分关系。原131无私人关系作品中80署名＋6无真人重叠1，去重覆盖85、仍46待证。原2828公共绑定/12原生图、既有关系缺图0、旧低清0保持，A–Y/Z不重导。

CandyShop/BEWAVE/Geenius三条报道及tripleS两项Cosmo年度记录补强原始来源，不改变canonical事实日期、数值、销量口径或7项日期待证。15未知统计（X5/销量7/一位3）保持；tripleS下界2092239及差额366550、fromis_9下界1152076保持。统计研究覆盖不等于新数值已采用。

167项定向与16项资源/守卫检查通过（5项重叠，共178项），TypeScript、正式构建及本地/线上各141布局、495图片检查、105原图流程、8海报原字节检查通过，详见validation与browser-summary；早期脚本标签/空历史容器断言修正和异步图片解码复核独立留证，不冒称应用修复；GET-only验证所拦Cloudflare自动POST与应用错误分开统计。旧SWEAT测试两个不可取得Git引用故障另列。3353正式源文件字节相同，5375缺席均为固定远端原件；完整TAR1421文件/45297664bytes、578既有随包/5418远端、全部23舞台封面、10受限排除、hosting/23迁移元数据核对通过。public/1owner/0外部/0组/revision2、native/epoch6/原快照/done206保持。未再次全量读回所有私人字段，未真实保存、全视频播放/逐句音轨、原生缩放或新Figma验收。

当前队列 `docs/codex/evidence/20261028-continuous/remaining-stage-ledger.json`（112新缺口＋11替换）和 `remaining-person-statistics.json`（46人物＋15统计＋7日期/独立差额）；报告 `docs/codex/continuous-stage-person-report-20261028.md`。优先Codex内置页；来源失败只暂停对应路线，不停止其他可行开发。个人页统一排版仍待用户决定。下方v198及更早数字是历史。


## 接续重点

- 舞台112新缺口：场合/类型29、未找到合规来源34、完整范围3、参与者14、语种/编配28、原发/访问4。另11旧活动来源替换单列，493有源不等于493都符合新规则。先打歌节目，再完整官方练习室，同精确版本同级比赞；演唱会/活动不可因高赞代入。核owner空分、完整新鲜日志与线上来源原值后才能替换；已有评分不得静默迁移。之前8替换和11练习室均不重导。
- 人物46：按 `evidence/20261028-continuous/remaining-person-statistics.json` 逐项范围继续。只证部分便保留部分；具名发行阵容、创作者、录音者与MV镜头是不同事实。复用原件时保留真实系列，不因填图猜全员或扩大私人关系。
- 统计15及7事实日期：原始来源的口径与有效日期须分开；Circle Album/Retail不相加，tripleS366550差额未解释前不灌入下界，未知X不填0。无新证据时保留未知。
- 版本线索：STYLE两MV同发行已证但精确同音轨未证；DNA/Password练习室标题镜像实际为活动影像；LUMINOUS转载未有完整原发链。用户否决的3精确ID继续排除，Right Now固定练习室完整性已获用户确认，不反复询问。

## 发布与保护

保持51团设计、Apple Music主站、ID/原关系、原图、评分/备注/观看、owner鉴权与现有受众。个人页统一排版未获另行决定。公共目录51团/338成员/614作品/2845关系含5双空行保持。原生快照`0180f4aa-664f-48e9-a98a-958d4ae649f9`与done206保持；原始owner备份只在本地，不上传仓库或站点。

优先Codex内置页。IAB本轮一次40秒超时，前轮两次30秒超时；不能以反复重试消耗整轮。一次性Chrome只读导出已完成并关页，不可当持续授权。临时隔离的公开页面验证不用用户浏览器资料或登录，不进行私人保存。

同一Sites项目`appgprj_6acb4fa532b88191ae2588c24b724b17`，helper先开最新正式源。仅同步已核应用变更；不要把根目录全部原图复制进发布包。既有资源manifest5996/ref`b8eac29b77eebf12103f0f5174d41c73744a3ba3`，578随包/5418固定远端，19舞台封面随包、4旧舞台封面按既有固定远端交付。构建后必须先运行 `node scripts/prepare-production-assets.mjs --apply` 再打包；由原脚本核实并移除生成的固定远端副本与10受限副本，绝不删除public原件。若runtimeGuard因授权数据变更触发，先独立验证精确变更范围及受限记录/鉴权不变，只刷新对应数据bytes/SHA，不能移除或放宽守卫。本轮该记录见build-guard-refresh.json。完整展开TAR容量、全部构建文件字节、DB/R2/MCP/hosting和23迁移元数据逐项核对。GitHub推送、Sites源推送、保存版本、部署终态、正式页面验证分别留证。

## 可复制到另一台电脑的指令

请接续 https://github.com/KAtOReNA7/idol 。先保护本地未提交和未跟踪文件，显式fetch origin/main与codex/statistics-relations-followup-20261027并核对PR44。干净后从最新origin/main建codex/任务分支；PR44未合并时普通merge其最新远端分支，已合并时使用包含它的最新main。不要reset、clean或强推。

依次读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md及docs/codex/continuous-stage-person-report-20261028.md。正式工程apps/idol-site/，正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线v199。493舞台，剩112新增缺口及11旧来源替换；公开人物80作品444参考槽、剩46作品待证；15未知统计、7事实日期和tripleS366550差额仍开放。原有关系认人缺口0，所有已导批次不得重复。按打歌优先、练习室其次继续，保留评分、设计、原图、ID/关系、访问和owner鉴权。优先Codex内置页，不沿用已结束的一次Chrome授权。先简短核远端和线上，再实际开发；同步代码、证据和交接，GitHub与正式部署分别验证。
