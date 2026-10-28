# 跨电脑接续：正式v201，PR45增量与PR44均未合并

正式工程为 `apps/idol-site/`，根目录旧sandbox不是发布工程。

## 先保护与核对

1. 检查并保护本地未提交、未跟踪文件，记录可恢复备份；不要reset、clean或强推。本机旧任务16文件保存在stash `7779dd2e08e211b1219c474b16838e9915ee1a0e`（8已修改＋8未跟踪），保留且不自动应用旧v196补丁。
2. 显式fetch `origin/main`、`origin/codex/statistics-relations-followup-20261027` 和 `origin/codex/stage-person-followup-v199-20261028`，核对 [PR44](https://github.com/KAtOReNA7/idol/pull/44) 与 [PR45](https://github.com/KAtOReNA7/idol/pull/45)。最近main为 `852f7506a4f921fff4e4d24fe70e8d607c7d40f5`，PR44为 `21b12a6f0d49f355ee639ae87bb2b294ba58513f`，两PR均draft/open。PR45包含本轮v201，base是PR44分支。
3. 干净后从最新origin/main新建codex/任务分支。如果main已包含v201实现，使用该最新main；否则普通merge最新PR45远端（已包含PR44）。仅PR44合并时仍须纳入PR45。不要从旧逐团分支续作，不要仅拉PR44而丢失v200，不重复合PR43/辅助资产分支。
4. 依次读本文件、AGENTS.md、STATUS.md、RESUME.md、[最新未发布报告](generic-reference-statistics-followup-20261029.md)、[v200发布报告](v200-evidence-followup-20261028.md)、[v199历史报告](continuous-stage-person-report-20261028.md)、[舞台政策](stage-selection-policy-20261028.md)与[选图政策](identity-photo-selection-policy-20261027.md)。以本轮两份剩余队列为准。

## 最新交付：正式v201，未解决清单按用户选择保留（2026-10-29）

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已 **v201／succeeded／496舞台**。GitHub实现 `7cfba28a24b260163f4c5f7eb55c87a28da731d8`，Sites源 `374ebe6de70a2e51641361740dde68246aed8b1c`，部署 `appgdep_6ae2262ced008191a526c05ac512fcf5`。两种交付分别留证，PR44／PR45仍draft/open、未合main；不要重复部署v201。

已发布24作品的独立通用认人参考（11团119槽／63既有原件），明确“未核实本作参与／出镜”，不创建成员评分或私人关系；原102作品527署名参考槽／233原件保持。24作品事实仍待证。WOOAH同套校服已落实；HITGS同次拍摄未证、MADEIN569×854原尺寸限制保留，新候选不符条件未采用，不猜脸或放大。

VVUP Album单周下界1787、UDTT两个指定日Retail下界103，tripleS下界2108154／未解释差350635已上线。7未知统计（4销量／3一位）保留null并按设置显示0，7实际生效日期保持报道记录。用户明确接受109新增舞台缺口与11旧替换作为本轮未解决清单，不以错误版本补数。个人页统一排版仍待另行选择。

此次发布同时包含前批DADARIDA、IYKYK、SPAGHETTI成员版3新增及Right Now固定机位，四项不得重导；对应原版优先，打歌→练习室（同条件固定机位）→官方制作表演，成员版仅放宽客串范围并标明差异。未来换绑须重新核新鲜owner空分、完整日志和线上原值，旧导出已过期。

152专项、TypeScript、正式构建、274离线聚合通过；本地通用参考48布局／238图槽与成员跳转／11原图、统计6布局／18来源／4守卫通过。完整包1425文件逐字节核验；578随包／5418固定远端、23随包舞台封面＋4远端、10受限排除、DB/R2/MCP与23迁移元数据保持。发布前后public／1owner／0外部／0组／revision2及native／epoch6／原快照／done206一致。发布前保存日志206行ID/状态完整分页核对无4目标作品，但payload有截断，不冒称完整个人值hash。私人写入0。

[完整报告](generic-reference-statistics-followup-20261029.md)、[发布回执](evidence/20261028-post-v200/release-publication.json)、[GitHub回执](evidence/20261028-post-v200/github-followup-sync.json)。两份remaining队列是本轮发布前冻结的事实/来源集合，其中local-only字段是当时状态；当前上线状态以release-publication为准，不改历史采用回执。正式匿名实测12代表布局／38图槽／3原图／4新海报原字节通过，使用真实公开目录51团／338成员上下文／614作品，无夹具或身份令牌；仅代表抽查，不称全团目视。详见ui/production-v201.json。既有关系缺图0、低清0，51团设计／完整原图／ID／个人记录／权限保持。旧v200、未发布及9未知字段均为历史。

## 最新交付：v200上线，5项X人数与11作品人物资料（历史发布记录）

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已为 **v200 / succeeded**。GitHub实现 `aac36bd631ee1a84780fa1dbfb404561bba32dcf` 已推送并读回；本轮分支 `codex/stage-person-followup-v199-20261028` / [PR45](https://github.com/KAtOReNA7/idol/pull/45) 以PR44分支为base。PR44、PR45均draft/open、未合main。Sites源 `e27a7adf04140b130cd1d10568100c13f6258bde`，部署 `appgdep_6ae1efcd18648191bc43e2760bc2f9eb`，回执 `docs/codex/evidence/20261028-v200/publication.json`。GitHub与部署分别核对，不重复部署已成功版本。

采用用户明确提供的GENBLUE 3277、VVUP 2.9万、GIRLSET 3.8万、EVERGLOW新账号1万、Cherry Bullet 18.5万；保留原文精度和2026-10-28观察日期，不冒称实时抓取。未知统计15→10（7销量、3一位）。公开人物新增11作品44槽，累计91作品488槽/229份既有原件；去重覆盖原131无私人关系作品中的96，剩35待证。录音、创作、发行、封套和Performance发布范围分别标注，不推定MV全员出镜、不新增私人关系。2828公共绑定＋12原生图、现有关系缺图0/旧低清0保持，所有已导批次不重做。

舞台复查12作品/21精确查询，新增采用0；正式493来源，112新增缺口＋11旧来源替换保持。按打歌优先、完整官方练习室其次；替换前必须有新鲜owner评分/完整日志/线上来源核对，旧Chrome一次性授权已结束。本轮没有owner全量导出或舞台绑定变更。7事实日期、tripleS下界2,092,239及差额366,550、fromis_9下界1,152,076保持。个人页统一排版仍待用户决定。

129项互不重复定向测试、TypeScript、正式构建、1421文件完整包字节核验通过；13项本轮应用文件精确同步，230受保护源文件保持。发布后public/1owner/0外部/0组/revision2与native/epoch6/原快照/done206保持；私人写入0，不声称全量个人字段hash复验。Codex内置页创建45秒超时，正式匿名HTTP403；未绕过或转用旧Chrome授权。四团本地完整HTML通过，VVUP客户端信息未验；正式打开queued不等于浏览器显示/视觉验收。

下一台电脑先保护本地修改，显式fetch main、PR44分支与PR45分支并核两PR。干净后从最新origin/main新建codex/任务分支；若main尚未包含v201，普通merge最新PR45远端（已包含PR44），不能只接PR44或用旧main覆盖。保留本机stash `7779dd2e08e211b1219c474b16838e9915ee1a0e`（8已修改＋8未跟踪），不自动重放旧v196补丁。禁止reset/clean/强推。最新报告 `docs/codex/v200-evidence-followup-20261028.md`，当前队列在 `docs/codex/evidence/20261028-v200/remaining-person-statistics.json` 和 `remaining-stage-ledger.json`；下方v199及更早章节均是历史。

## v200发布时队列与优先办法（历史，当前以前文为准）

- [人物/统计队列](evidence/20261028-v200/remaining-person-statistics.json)：35作品人物证据、10未知统计（7销量、3一位）、7事实生效日期及tripleS独立差额。只证部分便保留部分；录音、发行、创作、封套与MV出镜是不同事实，不能推定全员或扩大私人关系。五项X人工观察已采用，不再重复索取。
- [舞台队列](evidence/20261028-v200/remaining-stage-ledger.json)：112新增缺口，分类为场合/类型29、未找到合规来源34、完整范围3、参与者14、语种/编配28、原发/访问4；另11旧来源替换单列。493有源不等于493全符合新标准。v198新增11练习室、v199替换8舞台均不重做；队列中的旧研究记录与v200新增12作品研究分别注明范围。
- 打歌优先、完整官方练习室其次，同精确版本同级比赞。演唱会/活动不因官方上传或高赞成为打歌来源。新来源须核精确歌曲/版本/完整范围；任何换绑须新鲜owner空分、完整保存日志和线上旧来源原值一致，0分不为空。没有新鲜核对就保留现状。
- DEBUT SONG不能误用I DO ME；Gameboy不能误用相邻歌曲练习室；LIT原曲日韩混合。STYLE同发行不等于同音轨，DNA/Password所谓练习室转载实际是活动；LUMINOUS原发链仍不足。被否决的3精确ID继续排除。Right Now固定练习室完整性已由用户确认，不再询问；普通版4xer6EPtYdw已在v198采用，固定版y4Tr8LE5yV4保留只读补充。
- 统计须保留口径：Circle Album/Retail不相加，tripleS下界2,092,239及366,550差额未解释前不合并；fromis_9下界1,152,076保持。未知不写成实际零值。报道日期不冒称正式生效日。

## 历史发布流程参考（v200；当前包以v201回执为准）

保持51团设计、Apple Music主站、原图、稳定ID/原关系、评分/备注/观看、owner鉴权和现有受众。既有2828公共图片绑定＋12原生图、现有关系缺图0、旧低清0；所有已导批次禁止重复。628作品/展示封面＋23舞台封面保持。个人页统一排版待用户另行决定。

原生快照 `0180f4aa-664f-48e9-a98a-958d4ae649f9`、epoch6与done206保持。私人原始导出仅在本地忽略目录，不上传GitHub或站点。当前只做源代码保护与状态/日志数量核验，未重读全量私人字段，不冒称全量hash复验。

优先Codex内置页；本轮创建45秒超时，正式匿名HTTP403，停止失败路线且不绕过。旧一次性Chrome授权已完成并关页，不可复用。本轮正式打开返回queued，不是页面显示/视觉验收成功。VVUP客户端信息区仍未验证；四团本地完整HTML验证不能代替浏览器交互验收。

同一Sites项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`，helper先打开最新正式源。只同步本轮已核应用文件，不将根目录全部原图放进发布包。保留资源manifest5996/ref `b8eac29b77eebf12103f0f5174d41c73744a3ba3`、578随包/5418固定远端、19舞台封面随包/4固定远端、10受限排除。构建后运行 `node scripts/prepare-production-assets.mjs --apply` 再打包，不删除public原件，不放宽runtime guard。完整TAR与构建字节、DB/R2/MCP/hosting/23迁移元数据逐项核对。

v200包1421文件、展开45,805,568bytes；服务端归一化archive的大小/hash独立记录，不宣称与本地TAR字节相同。正式源已有30项差异（29换行、1固定远端忽略表）经过核查，不覆盖。GitHub推送、Sites源、保存版本、部署终态、实际页面验证分别留证；v200已成功，无须重复部署。

## 可复制到另一台电脑的指令

请接续 https://github.com/KAtOReNA7/idol 。先保护本地未提交与未跟踪文件，显式fetch origin/main、codex/statistics-relations-followup-20261027和codex/stage-person-followup-v199-20261028，核对PR44/PR45。干净后从最新origin/main建codex/任务分支；若main未包含v201，普通merge最新PR45远端（已含PR44）。不要reset、clean或强推，不自动恢复旧stash。

依次阅读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md、docs/codex/generic-reference-statistics-followup-20261029.md及evidence/20261028-post-v200/当前两份剩余队列。正式工程apps/idol-site/，正式站已v201/496舞台；109新增缺口与11旧来源替换按用户选择保留，102作品527署名参考槽，另24作品119通用认人槽（不证本作参与、不开放成员评分），24事实待证；7未知统计、7事实日期和tripleS350635差额仍开放。9空歌曲行是有意保留团体占位，不猜歌。新增DADARIDA、IYKYK、SPAGHETTI成员版和Right Now固定机位已采用，所有旧批次不要重导。对应原版优先，打歌→练习室（同条件固定机位优先）→官方制作表演；允许完整同语种官方成员版后备，明确客串差异。再次换绑须重新取得真实新鲜owner导出，不修改capturedAt。保留设计、原图、ID/关系、个人评分/备注/观看、访问与owner鉴权；优先内置页，不复用旧Chrome授权。v201已成功发布，不重复导入或部署；继续有新证据的待补项目，GitHub同步与正式发布分别留证。
