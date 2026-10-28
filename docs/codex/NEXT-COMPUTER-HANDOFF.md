# 跨电脑接续：正式v197，PR44未合并

本文件为当前接续入口，历史报告保留原始状态，不覆盖这里的最新交付。正式工程是`apps/idol-site/`，根目录旧sandbox不是发布工程。

## 先保护并核对来源

1. 检查本地未提交与未跟踪文件。若有，先备份到工作目录外或用可恢复提交保护，并记录路径／SHA；不要reset、clean或强推。
2. 显式fetch `origin/main`和`origin/codex/statistics-relations-followup-20261027`，读回[PR44](https://github.com/KAtOReNA7/idol/pull/44)状态。当前main为`852f7506a4f921fff4e4d24fe70e8d607c7d40f5`，PR44仍draft/open，包含v192–v197；main上的v191不应覆盖当前正式站。
3. 工作树干净后，从最新origin/main新建codex/任务分支；若PR44尚未合并，普通merge其最新远端分支，纳入已发布应用。若已合并，只使用包含它的最新main。不要重复合PR43或辅助图片分支。
4. 依次阅读本文件、根AGENTS.md、STATUS.md、RESUME.md、[本轮报告](stage-policy-continuation-20261028.md)、[舞台政策](stage-selection-policy-20261028.md)、[当前分类](current-gap-classification-20261028.md)。旧主线整理见mainline-consolidation-20261026.md和mainline-identity-merge-20261027.md。

本机工作分支`codex/statistics-relationship-followup-20261028`；交付远端仍为PR44的`codex/statistics-relations-followup-20261027`。以实际fetch到的最新HEAD为准，下面冻结SHA只作证据，不要回退它们。

## 已交付

- 正式地址：https://idol-lens-private.wuke40758.chatgpt.site/ ，**v197 / succeeded**。
- GitHub应用实现：`a9d582b8f777ecaf8a7bec7a6313fa7e787f3862`，已推送／读回；后续交接提交在其后。
- Sites源：`12d6600bdde596666c9a26543284634b6badccc8`；部署：`appgdep_6ae1841550c88191972a859b5dfe1649`。
- 回执：[publication.json](evidence/20261028-continuation/publication.json)。GitHub提交与正式部署是两套记录，不能互相代替。

本轮落实打歌节目／官方完整练习室优先。86条旧补充记录保留并分类，新增Right Now固定练习室`y4Tr8LE5yV4`只读候选；结构为79候选＋8线索，展示41候选＋7线索、隐藏39活动等记录。正式来源仍482，新增绑定0。新导入先按政策和版本筛选，再按节目优先、练习室其次同级比赞，演唱会高赞不再拦合规候选。三个否决ID全局阻止新采用：QWER `l9GLV8Kd-MU`、NewJeans `saY9KS7mKvI`、ITZY `BnmwjH-suLg`。不能仅因标题有Concert／CON-TOUR就排除it's Live或Simply K-Pop。

Right Now练习室完整性已由用户确认，不要再问；官方原曲为英／日／韩混合，练习室没有English Ver标识，实际音轨是否与原发行一致仍待比对。旧Music Bank“韩语别版”推断已撤回，Supernatural证据不再越界用于Right Now。IVE I WANT TVDaily来源改为press_original，并按活动类型隐藏。均未绑定评分。

tripleS同年同版年榜替换净增5,166，公开累计下限为**2,092,239张**，旧来源汇总差额仍**366,550**。36原月行保留，其中5行贡献被2项年榜替换，不重复相加。fromis_9仍1,152,076；其他50团统计不变。不要重复应用本轮替换。

## 已完成内容与保护边界

- 51团、338成员上下文、614作品（605具名＋9历史占位）。2845原始关系行含5既有双端空行，有效2840。
- 2828公共认人绑定＋12原生有图，现有有效关系缺图0、旧低清0；原871全部解决，A–Y／Z禁止重导。628作品／展示封面＋4舞台海报，具名作品日期／标题／频道无空值。
- 131原无私人关系作品中，42有公开署名（263人次、123份既有原件），6有无真人证据，Stranger两类重叠1，去重覆盖47，仍84待证。不要把这些作品自动补成全员私人关系。
- 保持51团设计、Apple Music主站、完整原图、ID／关系、个人评分／备注／观看记录、现有访问和owner保存鉴权。缺图不得关闭评分；6条无真人规则只适用其精确上传。
- 实际权限保持public／1owner／0外部／0组／revision2；native／epoch6／原快照`0180f4aa-664f-48e9-a98a-958d4ae649f9`／done206保持。本轮真实私人写入0，未重新读取owner所有字段，不能冒称全量个人值hash验收。
- 个人页统一排版仍待用户另行决定。

## 下一步

1. 核Right Now练习室实际音轨与原发行对应；完整性已有确认。找到确定替代时先核owner原评分、精确来源和保存日志，不能静默移动已有评分。
2. 按现有清单继续123原待核舞台；19项历史活动来源另外寻找节目／练习室替代，含IVE WAVE／CRUSH的Golden Wave活动、XG MILLION PLACES巡演。482旧选源数不是新政策合格数，不能以482−19计算完成数。
3. 按[current-gap-classification](current-gap-classification-20261028.md)继续84作品人物证据，保留部分名单、同名版本、来源层级和不确定性。Caution等已存候选须先查重复与证据，不能研究发现就算采用。
4. 17未知统计仍为X人数5、销量9、一位3；tripleS另有366,550差额。Soridata下载和验证码路线已429封禁，停止该路线，不要求用户下载SQL。用已存36月行、Circle逐发行／版本／年及可读具名转录继续核对。
5. 7报道时间轴已显示，原事实生效日期仍未知；不要用报道日冒充生效日。旧43个时间轴失败和4个core过期断言已修，不必重做。

## 验证与发布流程

159项定向测试（含52时间轴、39核心）、TypeScript与正式构建通过，本地及线上各15布局／15交互通过，线上15次直接匿名API成功。只读测试拦截14次Cloudflare挑战POST产生的对应网络日志单独归类，应用错误和写入均0；正式页面复验记录在[production-browser.json](evidence/20261028-continuation/production-browser.json)。本地目录502时使用实时匿名正式目录，在内存用本地新代码重建补充字段，不能把该本地夹具叫原生存储验收。本地曾出现一次未能定位的fromis9属性初始化警告，后续未复现，未宣称修复。

同一Sites项目`appgprj_6acb4fa532b88191ae2588c24b724b17`。用Sites官方source helper打开最新源后同步；保持DB/R2/MCP和受众。源码与GitHub3326文件字节相同，5375不在此checkout的文件均属于已固定远端原件；Site专用.gitignore有明确差异。本机70处checkout换行已规范到GitHub字节，未改语义。

固定资源manifest为5996条、ref `b8eac29b77eebf12103f0f5174d41c73744a3ba3`；578随包／5418远端，10受限副本或别名排除。先完整构建，再运行prepare-production-assets.mjs审计／仅清理生成副本；不得删public原件、改变UDTT守卫或省略archive绕过上传。v197包1402文件，展开42,729,984bytes；保存回执的42,618,880是不同统计口径。确认全部包内字节、完整展开TAR、hosting和23迁移，再保存／部署并读回终态。

未验真实私人保存、全视频播放、全量图片重新目视、原生缩放、新Figma或全仓测试。各历史README保留准备时状态，最终是否采用以对应发布回执及本文件为准。

## 可复制到另一台电脑的指令

请接续GitHub项目 https://github.com/KAtOReNA7/idol 。先保护本地未提交和未跟踪文件，显式fetch origin/main与codex/statistics-relations-followup-20261027并核对PR44状态。工作树干净后从最新origin/main建codex/任务分支；PR44未合并时普通merge其最新远端分支，避免用main的v191覆盖正式v197。已合并则直接使用包含它的最新main。不要reset、clean或强推。

依次读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md、docs/codex/stage-policy-continuation-20261028.md，再读舞台政策和当前问题分类。正式工程apps/idol-site/；正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线v197。认人图现有关系缺口0，A–Y/Z禁止重复。舞台规则、两标签和过期测试已修；Right Now完整性已确认，仅音轨待核。继续84作品人物证据、123舞台待核、17未知统计及tripleS366550差额；保护设计、原图、ID/关系、私人数据和权限。先简短核对最新远端与线上，再实际开发；候选、GitHub提交和正式部署分别记录。
