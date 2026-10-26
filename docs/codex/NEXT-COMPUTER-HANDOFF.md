# 跨电脑接续：正式站v187已上线，原871补图继续

## 最新交付：正式站 v187 已上线，继续原871补图（2026-10-26）

用户明确要求将全部当前成果发布至 https://idol-lens-private.wuke40758.chatgpt.site/ ，覆盖旧“本轮不覆盖v186”限制。正式项目 appgprj_6acb4fa532b88191ae2588c24b724b17 已从v186更新到 **v187 / succeeded**；源20cd45cfd14e14e4547868d1aa247d05102c707c，部署appgdep_6adefd76bd408191be209fed85c9bc48。GitHub实现5aaa879，PR41；审阅v11是另一个Site，不能替代正式发布。

全应用保留DB/R2/MCP及原owner保存鉴权；正式项目原生access_mode=public、仅1owner/0外部/0组，按原状态保留，没有改成其他受众。原生存储仍native/epoch6/done206/原快照，公开目录51团338成员614作品2845关系的字段与关系指纹发布前后一致；未实际保存个人记录。

已确认主页、成员目录/详情、MV作品页在正式地址更新。三宽320/390/1440共12布局及导航、82可见图片最终载入检查和3个最大原图流程通过，详见验证文件实际计数。旧图片2.2GB采用固定GitHub0635659有限清单同源流式交付，原字节不改；4721来源原图完整HTTP/SHA通过，601资源随包，9受限副本及1同SHA旧别名排除。完整TAR62,147,072bytes、1417文件、全部构建字节与hosting/迁移核对通过。

原871中J已补3，**目前仍868**；A至J不得重导。发布后K批新图研究进行中，尚未apply；发现Melon移动版公开正文可正常读取，可按具名MV现场继续补图，不把来源恢复算图片完成。个人页统一排版仍未额外重设计。入口与完整证据见 [正式发布报告](formal-release-v187-report-20261026.md)。

以下为此前分类交接，涉及“线上仍v11/不覆盖v186”的表述仅对应旧审阅项目或历史限制，正式发布以本节为准。

# 跨电脑接续：871条分类已登记，J补3条后仍868；线上仍v11

更新：2026-10-26。先保护本地修改、明确 fetch 活动分支最新远端，再读 AGENTS / STATUS / RESUME。下面提交用于识别已完成成果，不要求回退旧 HEAD。正式工程 `apps/idol-site/`。

## 可直接转交的指令

【请接续 https://github.com/KAtOReNA7/idol 的 codex/mv-identity-quality-followup 最新远端；先保护本地未提交修改并明确fetch，不从旧main或根Next sandbox开始。读本文件、AGENTS.md、docs/codex/STATUS.md、RESUME.md、设计要求与协作手册最新决定，简短核对后直接继续实际工作。

用户已确认并上线v11。后续D至J累计新增54条认人图、4张旧图提升；当前候选1960绑定/326作品/44团，仍868认人图缺口、43旧低清、18未知统计。A至J均已apply，不可重复导入。

最新任务已将原始871条缺图全部按精确作品/视频/成员关系分类，并逐条给出问题、来源入口、处理步骤与采用条件；196作品/45团。8类主要问题493/156/62/59/56/40/4/1，共871。本轮J解决3条（PHARITA1、ODD YOUTH2），开放集合与当前868审计完全一致；分类完整不等于全网逐条研究完成。先读docs/codex/mv-gap-remediation-report-20261026.md与reports/20261026-gap-remediation/ledger.json或HTML。

先处理43条同精确视频已有通过来源的缺口，再查360条已有成员资料页的目标章节。继续各条具体解决路线；只用具名、精确视频版本、原字节、实际3:4有效宽至少540px且清晰合格的图片，不猜人脸，不以概念/广告/其他语言或剪辑版代图，不因缺图关闭成员评分。Lily Roller Coaster旧章节解析误判已纠正，但原图构图不合格仍待换；不要继续记成错歌。14横图原比例展示是未实施提案，不能自行降低导入门槛。

605作品页面依各团现行主题、23展示视频原生样式、主页0/未知X隐藏、所有粉丝按整数万四舍五入/不足万显示整数人已实现；保留底层精度与来源。51团已认可设计、主站/成员布局、个人评分备注观看记录、稳定ID/关系及owner-private只读保持。133无原成员关系作品不推定全员，仅5条精确无真人规则关闭成员评分。个人页统一排版仍待用户决定。

J实现4cba985，Sites最新候选源a5ea40846f69679628aa1f141d817c3d70781a0a已推送、完整发布包已验；线上仍v11。此前3次blob上传300秒超时，暂无实质恢复证据，本轮未重复失败上传，没有新保存版本/部署ID。源推送不等于上线。恢复后从同一项目候选源续发，不改权限、不建替代站，不省略匹配archive绕过上传。将代码、来源、验证、报告、接续状态一并提交推送。】

```sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
```

默认fetch可能只跟踪旧分支。先核本地/远端和工作树，保留未提交修改与分叉后再快进或隔离。旧电脑 `E:/project/idol` 的izna工作区22处未提交修改和5未跟踪文件已与 `E:/project/idol-local-safety-20261026/` 备份复核保持，不能混入。

## 成果与验证

- 分支 `codex/mv-identity-quality-followup`，draft [PR #41](https://github.com/KAtOReNA7/idol/pull/41)，base为`codex/mv-cover-and-identity-batch`，未合main。本轮冻结起点ef52512f772d93e80cea3e00300b5ed4f5a93573；J实现/公开资源固定4cba985af060284122ef46541df4ea9c1ade4e0c。文档以分支最新HEAD为准。
- [本轮报告](mv-gap-remediation-report-20261026.md)、[验证JSON](mv-gap-remediation-verification-20261026.json)、[日志](worklogs/20261026-mv-gap-classification-and-remediation.md)、[871逐项HTML](reports/20261026-gap-remediation/ledger.html)、[CSV](reports/20261026-gap-remediation/ledger.csv)、[复算脚本](reports/20261026-gap-remediation/build-ledger.py)。前轮全量MV/粉丝验证在[mv-style-completion报告](mv-style-completion-report-20261026.md)，不得把旧871数字冒充当前剩余。
- 871冻结审计SHA：5f10f1e10d96c6cbc434cc8e331baf7ae9c2f6375cee8e0f32c39fbb41dbfd5b；原成员/作品/视频/评分ID、全量集合、分类总数、解法字段完整性通过。原证据H65/I264/其余542，分工证据截止状态早于J导入时以总表/J回执为准。
- J共3条737,104原字节；Genie PHARITA新文件保留旧审批哈希，重新审核当前发布者版本。ODD YOUTH两图来自新的具名官方MV拍摄专题，Maika为侧脸；均未声称独立逐帧验证。
- 25专项、类型、正式构建、public projection通过；现有构建路由静态分类/bundle提示保留。Chrome三宽320/390/1440：6布局/9新图/5原图流程；清单筛选/搜索/详情/CSV导出三宽通过。未宣称全仓测试。
- 3新远端原图HTTP/尺寸/长度/SHA/解码通过；52路由CSS只规范化ref/换行后相同，52公开上下文只有loadedAt变化，个人字段/稳定ID/关系/只读值相同。735同站原文件SHA保持。
- 完整TAR909静态文件逐字节匹配源；额外dist/.openai/hosting.json仅CRLF规范化，另行核验。无越界路径、符号链接或重复路径。
- 候选未部署，没有本轮线上浏览器结果。真实保存、全视频完整播放、80%/125%原生缩放、用户IAB、新Figma与全仓测试未验。

## Sites身份与恢复

|字段|当前值|
|---|---|
|指定站点|https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/|
|project_id|appgprj_6add2704bc6c81918d3e0e2f13130422|
|访问|仅owner，0外部访客、0允许组，静态只读|
|最新保存/上线|v11；本轮源推送后原生工具复读仍为11|
|v11 saved version|appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4|
|v11部署|appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d|
|已发布源|c28c945987e22803b81ea266e6aaadf1ce972cb0|
|最新候选源HEAD|a5ea40846f69679628aa1f141d817c3d70781a0a，未保存/部署|
|candidate publicRef|4cba985af060284122ef46541df4ea9c1ade4e0c|
|静态输出|163,718,174 bytes / 909文件|
|冻结gzip包|148,240,824 bytes|
|包SHA256|0bbf66b55dc24f6ffee1d6a0349527e2183df9f11c270b93ebc8e91254807c13|
|同站原文件|724公开原文件；另11受限原文件留同一Sites范围，合计735份|

`apps/idol-site/.openai/hosting.json`属于旧v186，不能用于本轮发布。先读Sites技能，以表中project_id原生打开专用源，核hosting配置与HEAD。源比线上新，push不等于部署。

恢复专用源后运行 `node --use-env-proxy hydrate-review-originals.mjs dist`，按manifest固定4cba985恢复724被ignore原文件并核长度/SHA；README已更新。Lu历史图已跟踪在同一Sites源，SHA256 `b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9`。其他受限UDTT图留同一Sites范围，不把发布包或受限图上传公开GitHub，不复制旧token/代理/浏览器会话。

本机专用源 `E:/project/idol-review-source-oct26`，发布包 `E:/project/idol-gap-triage-oct26/candidate-site.tar.gz`，预览输出 `E:/project/idol-gap-review-oct26`。新电脑从原生源恢复，不依赖本机路径；源helper拥有提交推送流程并清除临时远端，没有origin不代表未推送。

前3次blob上传300秒超时，最近request ID `f8c4a417-c66f-4051-86ed-e8ad60d30b4f`，均无新保存版本/部署ID；此前原生publish_on_push_accepted=false。本轮未再试同一失败上传。根域名HEAD可通不等于大包上传恢复。仅有实质恢复证据后，原生helper从同一最新候选重新打包，使用其返回project/commit/archive保存并私密部署；拿到实际deployment ID才查状态，未知结果先核服务端。

## 重建与注意

在仓库根运行 `python docs/codex/reports/20261026-gap-remediation/build-ledger.py` 复算871冻结关系；运行 `node docs/codex/reports/20261026-gap-remediation/render-ledger.mjs docs/codex/reports/20261026-gap-remediation/ledger.json docs/codex/reports/20261026-gap-remediation/ledger.html` 重建本轮HTML。后续补图要新建下一批，保留本轮871冻结账本及J回执，不篡改历史数字使验证看似通过。

正式静态包：在apps/idol-site运行 `node scripts/build-all-review.mjs --out <新输出目录> --udtt-portrait <同一Sites源恢复的Lu原文件路径> --public-ref <已推送40位GitHub实现SHA> --portrait-budget-mib 138`。确认输出manifest与源提交匹配；按既有安全同步脚本先逐文件校验，再移除明确过期的生成资源。不要从旧main、旧v186、根目录sandbox或历史候选基线重新开发。
