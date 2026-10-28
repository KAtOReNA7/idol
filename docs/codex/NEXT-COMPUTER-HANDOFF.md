# 跨电脑接续：正式v198，PR44未合并

正式工程是`apps/idol-site/`，根目录旧sandbox不是发布工程。以下为当前状态，历史报告保留原始时点。

## 先保护并核对

1. 检查并保护本地未提交与未跟踪文件，记录备份路径／可恢复提交；不要reset、clean或强推。
2. 显式fetch `origin/main`与`origin/codex/statistics-relations-followup-20261027`，读回[PR44](https://github.com/KAtOReNA7/idol/pull/44)状态。最近核main为`852f7506a4f921fff4e4d24fe70e8d607c7d40f5`，PR44仍draft/open，包含v192–v198；main上的v191不可覆盖正式站。
3. 工作树干净后从最新origin/main新建codex/任务分支。PR44未合并时普通merge它最新远端分支；已合并则使用包含它的最新main。不要重复合PR43或辅助资产分支。
4. 依次阅读本文件、AGENTS.md、STATUS.md、RESUME.md、[本轮报告](stage-practice-fill-report-20261028.md)、[舞台政策](stage-selection-policy-20261028.md)、[剩余舞台表](evidence/20261028-stage-fill/remaining-stage-ledger.json)。旧[current-gap-classification](current-gap-classification-20261028.md)仍提供人物／统计逐项历史原因，数字以本次为准；当前81人物／15统计／7时间轴队列见[remaining-person-statistics.json](evidence/20261028-stage-fill/remaining-person-statistics.json)。

本机分支`codex/statistics-relationship-followup-20261028`；交付远端为`codex/statistics-relations-followup-20261027`。以实际fetch到的最新HEAD为准，冻结SHA仅作证据。

## 交付回执

- 正式地址：https://idol-lens-private.wuke40758.chatgpt.site/ ，**v198 / succeeded**。
- GitHub实现：`365c0244af3dd94e8a112e6238d9ee7cd9aba5e1`，已推送／读回；交接提交在其后。PR44未合main。
- Sites源：`3af1db15c0fb3c15a07343c79ff0fa9a971f6263`；部署：`appgdep_6ae1941749f08191aafaa7fbbc2b356e`。
- [publication.json](evidence/20261028-stage-fill/publication.json)分别记录GitHub和Sites；仅push不等于上线。

本轮新增11练习室：tripleS Untitled、izna DUMB HOT!、EVERGLOW Promise、Weeekly 7days Tension、IZ*ONE Vampire、Rocket Punch Bubble Up!、Kep1er Yum／RESCUE TAYO、LOONA HULA HOOP、NewJeans Supernatural／Right Now。旧482来源及评分绑定不变，累计493。11精确ID与原图见[adoption.json](evidence/20261028-stage-fill/adoption.json)及[poster-evidence.json](evidence/20261028-stage-fill/poster-evidence.json)，禁止重导。节目优先、完整官方练习室其次，先筛同曲同语种／编配／参与者，再同级比赞；演唱会和活动不可因高赞代入。

Right Now采用普通练习室`4xer6EPtYdw`；固定版`y4Tr8LE5yV4`完整性已经用户确认，仍是只读补充。官方单曲资料支持版本对应，但本轮未完整播放或逐句比对音轨，限制已显示。不要恢复被撤回的“韩语别版”推断，也不要把练习室称现场真唱。3个用户否决ID继续拦截。

原123待核全部经过有界研究，实际采用11、余112：类型／场合27，未找到合格来源34，完整范围3，参与者14，语种／编配28，原发／可访问性6。逐项证据和下一步在最新ledger，不声称全网无视频。另19历史活动来源单列替换任务；现有493不等于493都按新规则重新通过。替换旧来源必须先核owner评分及精确绑定，已有评分不可静默迁移。

本轮公开人物资料新增Weeekly Stranger英文、HITGS GROSS和CHARIZZMA，3作品16人次；累计45作品279参考槽128份既有原件。录音／发行名单不冒称MV出镜；私人关系和6无真人策略不变。131原无私人关系作品中45署名＋6无真人重叠1，覆盖50、仍81待证。BADVILLAIN 5,367和BEWAVE725仅是明确Circle Album两周／单周下界；15未知统计为X5／销量7／一位3。Geenius217仅单日Retail研究，不写入Album累计。tripleS下界2,092,239、差额366,550，fromis_9 1,152,076保持。

## 保持与验证

51团、338成员上下文、614作品（605具名＋9旧占位）、2845原始关系含5双空行。2828公共认人绑定＋12原生有图，现有有效关系缺图0、旧低清0，原A–Y/Z不得重做。628作品／展示封面＋15舞台封面；新增11原封面共1,228,050bytes，Vampire原生640×480未放大，其余1280×720。

保持51团设计、Apple Music主站、稳定ID/关系、所有原图、个人评分／备注／观看和owner保存鉴权。public／1owner／0外部／0组／revision2、native／epoch6／快照`0180f4aa-664f-48e9-a98a-958d4ae649f9`／done206保持。owner导出时间2026-10-28T05:27:38.361Z，新11项导入在15分钟窗口内且确认空分；0分不是空。原始导出仅在本地忽略目录及用户桌面，不提交GitHub或发布包；公开证据仅计数/hash。发布后核原生状态和日志，未再次全量读取个人值，无真实私人写入。

186定向测试、TypeScript及正式构建通过；本地与线上各51布局、11封面字节/SHA、48次人物图片加载（16槽×3宽）、9原图开关通过。线上真实匿名API不替换目录，本地使用公开夹具；隔离临时无头测试不操作用户Chrome。IAB两次30秒超时，不反复重试或要求用户关闭浏览器。线上首次独立海报GET遇403，改核正常页面图片响应；只读测试拦截Cloudflare自动POST的网络日志另行归类，不是私人写入，未绕过验证码。优先使用Codex内置标签页，必要时选独立验证。

同一Sites项目`appgprj_6acb4fa532b88191ae2588c24b724b17`；源码helper先打开最新正式源，再精确同步构建。3341文件字节一致，5375缺席均属既有固定远端原件，Site专用.gitignore是明确差异。资源manifest保持5996、ref`b8eac29b77eebf12103f0f5174d41c73744a3ba3`、578随包／5418远端；另11新舞台原图随包，不能漏打包。10受限副本／别名排除，不能删除public原件或绕过UDTT守卫。当前包1413文件、完整展开44,048,384bytes，23迁移及元数据文件、DB/R2/MCP核对通过。保存版本和部署终态分别读回，完整包不得省略。

未验完整视频播放／逐句音轨、真实私人保存、原生缩放、新Figma、全仓所有测试或全量原图重新目视。个人页统一排版仍待用户决定。首次本地hydration期间details交互失败保留，等待初始化后通过，不冒称修复该问题。

## 下一步

1. 按112逐项表找第一方节目／完整练习室，优先已有明确候选；19历史来源替代另核精确版本、点赞与owner评分。YouTube后段429已停，不绕过限流。
2. 继续81作品人物证据，Caution、HITGS HAPPY／A-HA!等仍待精确署名；不以团体名单推定全部出演。
3. 继续15未知统计、tripleS366,550差额及7个原事实生效日。Soridata下载／验证码被封路线停止，按Circle具体发行／版本／周期和可核转录研究，不混Album与Retail。
4. 每轮同步代码、公开证据、交接文件；GitHub和正式站分别验证。保护私人原始导出，不提交账号或个人内容。

## 可复制到另一台电脑的指令

请接续GitHub项目 https://github.com/KAtOReNA7/idol 。先保护本地未提交和未跟踪文件，显式fetch origin/main与codex/statistics-relations-followup-20261027并核对PR44。干净后从最新origin/main创建codex/任务分支；PR44未合并时普通merge其最新远端分支，避免main的v191覆盖正式v198；已合并则从包含它的最新main继续。不要reset、clean或强推。

依次读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md、docs/codex/stage-practice-fill-report-20261028.md。正式工程apps/idol-site/，正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线v198。已有493舞台，原待核余112，19历史活动替代另列；81作品人物证据、15未知统计与tripleS366550差额仍开放。现有关系缺图0，A–Y/Z和本轮11舞台／3署名／2统计不得重复导入。保留评分、原图、51团设计、ID/关系、权限与owner鉴权。优先Codex内置标签页，不操作用户日常Chrome。先简短核对远端与线上，再实际开发；GitHub提交与正式部署分别记录。
