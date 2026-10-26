# 跨电脑接续：1943条认人图候选已验，上传仍受阻；线上仍v11

更新：2026-10-26。先保护本地修改、fetch活动分支最新远端，读AGENTS/STATUS/RESUME。以下提交用于识别成果，不要求回退旧HEAD。

## 可直接转交的指令

【请接续 https://github.com/KAtOReNA7/idol 的 codex/mv-identity-quality-followup 最新远端，正式工程在 apps/idol-site/。先保护本地修改并明确fetch，不从旧main或根Next sandbox开始；读本文件与AGENTS/STATUS/RESUME、设计要求和协作手册最新决定。

用户已确认并上线v11。后续D/E新增19图与4张旧图提质、F/G新增18图均已apply并完成本地验证。候选累计1943绑定/321作品/44团，剩885缺图、43低清、18未知统计。不要重新apply A至G或4张旧图提升。导入器新增实际3:4有效宽540px硬门槛，不能只相信source_resolution标签；每批仍需具名/精确视频/原字节/实际画面审查，不凭脸、不以封套概念照代MV，不因缺图关闭成员评分。

发布仍受阻：前轮242.2MB、148.2MB包在westus3文件blob上传层300秒超时；本轮同148.2MB冻结包受控重试在southcentralus区域300,011ms超时。均未返回保存版本或部署ID。根域名能连接不等于大包上传恢复，勿仅据HEAD/GET成功循环重试。原生推送后发布此前accepted=false。最新Sites候选源已推送b57ea40acff8035bb02916868722dd14bab9e9cc，仍未保存/部署。待上传环境有实质恢复证据后，从同一项目最新候选源续发；不换权限、不建替代站、不省略本地可用archive。不具备可行上传条件时继续实际资料开发并如实保留阻断。

保持51团已确认设计、Apple Music主站、个人数据/ID/关系、5条精确无真人规则及owner-private只读。个人页统一排版仍待决定。继续可靠认人图、质量和统计缺口；按合理批次把代码、验证、报告、阶段和接续指令一起推送。先简短核对，再继续实际工作。】

推荐：Codex当前编程主力模型，高推理。精确版本和身份需逐项证据，不以抓图数量代替。

~~~sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
~~~

默认fetch可能只跟踪旧分支。核对本地/远端与工作树后快进或隔离，保留本地未提交修改和分叉。旧电脑E:/project/idol的izna工作区22处未提交修改及安全备份不能混入本任务。

## 已共享成果

- 活动分支codex/mv-identity-quality-followup / draft [PR #41](https://github.com/KAtOReNA7/idol/pull/41)，base为codex/mv-cover-and-identity-batch。没有合并main。
- 最新资料/实现固定提交970addc7ef30794ff800d02acedd965d093f63c1；后续证据与交接文档以活动分支最新HEAD为准。
- [本轮报告](mv-publication-recovery-report-20261026.md)、[验证JSON](mv-publication-recovery-verification-20261026.json)、[worklog](worklogs/20261026-publication-recovery-and-gaps.md)、[885缺图CSV](reports/20261026-recovery/missing-mv-identities.csv)、[51团完整表](reports/20261026-recovery/completion-report.html)。
- [F批](mv-batch-f-20261026.md)：ifeye NERDY1、KISS OF LIFE SWEAT2、SAY MY NAME ShaLala6。[G批](mv-batch-g-20261026.md)：Kep1er KILLA6、YOUNG POSSE MACARONI CHEESE2、COLD1。共18原图8,081,921 bytes。双语版本排除依据逐条保留，不称逐帧核验。
- 上批D/E19图及4张提质仍在，见[上批报告](mv-identity-quality-followup-report-20261026.md)。相对v11总计新增37绑定、4提质，仍有缺口。
- 统计18项有针对性检索记录，2项读到相关正文、16项仅检索层；0合格新数值，不能称全部事实核实。KiiiKiii LEESOL转刊候选仅pending，43低清未减。
- 导入器保存上一批receipt，实际像素门槛与F/G目录边界已测试；下一批/新日期需有界扩展。
- 所有研究子任务已收尾，不需要等待远程代理。

## 本轮实际验证

25专项、类型、正式构建、运行投影check通过。Windows同机Playwright+系统Chrome155（Browser plugin not available），320/390/1440：新增6作品18布局/54图/24流程；上批6作品在最终同一构建复验18布局/69图/29流程。合计36布局/123图/53原图流程，console error/warning、pageerror、非读取请求0。原图解码、Tab/Shift+Tab/Escape、焦点回归与返回作品库通过，截图实际查看。

18新远端原图HTTP/类型/长度/SHA/解码通过。735同站原文件SHA/长度、52路由CSS仅资源ref和行尾规范化后不变、公开payload仅52个loadedAt时间戳改变均通过。最终TAR859静态文件逐份和源输出SHA一致，无越界路径/符号链接。

候选未部署，因此没有本轮线上浏览器结果。真实个人保存、全视频完整播放、80%/125%原生缩放、用户IAB、新Figma和全仓测试未验。不要把本地结果写成线上或用户设计验收。

## Sites身份与候选恢复

|字段|值|
|---|---|
|同一指定站点|https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/|
|project_id|appgprj_6add2704bc6c81918d3e0e2f13130422|
|访问|owner-private静态只读，仅owner，无外部访客/允许组|
|最新保存/上线|v11，用户已确认|
|v11 saved version|appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4|
|v11部署|appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d|
|已发布源|c28c945987e22803b81ea266e6aaadf1ce972cb0|
|最新候选源HEAD|b57ea40acff8035bb02916868722dd14bab9e9cc，未保存/部署|
|candidate publicRef|970addc7ef30794ff800d02acedd965d093f63c1|
|静态输出|163,158,966 bytes / 859文件|
|冻结gzip包|148,157,598 bytes，SHA256 a07be14962b89df3cbb2ad4c63285560503952c74350c144acdf329c56bed192|
|同站预算|138MiB；695必要封面/索引/修复图共143,354,239 bytes保留站内|
|同站公开原图|724份；其余原图走已核不可变GitHub来源，未压缩|

apps/idol-site/.openai/hosting.json属于旧v186，不能拿来发布本轮。先读Sites技能，以上表project_id原生工具恢复专用源checkout并检查hosting.json/远端HEAD。当前源比线上新，源推送不等于发布。

源恢复后运行根部 hydrate-review-originals.mjs dist，从manifest固定970addc7提交恢复精确724份被ignore原图，并核字节/SHA；源README中的67是旧数，以manifest为准。Lu历史图已跟踪在同一Sites源，SHA256 b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9。其余既有UDTT受限图维持同一Sites范围；不把发布包上传公开GitHub。不得跨电脑复制旧代理、token或浏览器可执行路径。

本机源为E:/project/idol-review-source-oct26，冻结包E:/project/idol-recovery-qa-oct26/candidate-site.tar.gz，源码工作区干净。新电脑应恢复同一原生源而非依赖这些本机路径。

有上传环境实质恢复证据时，可原生helper重新打包同一最新候选、提交/推送、保存并私密发布；读取实际返回的版本/部署ID继续，未知结果先核对服务端，不能重复保存。最近失败request ID f8c4a417-c66f-4051-86ed-e8ad60d30b4f，可用于定位blob传输问题，根因仍未知。

若新增网页/资料后需重建：

~~~text
node scripts/build-all-review.mjs --out <仓库外绝对目录> --udtt-portrait <恢复Sites源>/dist/review-all/udtt/lu-historical.jpg --public-ref <已推送且包含全部公开原图的40位提交> --portrait-budget-mib 138
~~~

只清理经旧manifest/SHA确认的旧生成载体，不删源原图。保留同站必要封面，原图不压缩；容量/访问/源状态/完整TAR与当前构建逐份验证。

## 下批执行

1943绑定/321作品/44团；885已有关系缺图、43低清、18未知统计。284作品无公开认人图，其中133原无成员关系不能猜全员。H2H低像素拼图、ILLIT柔糊/版本歧义、AtHeart文字覆盖、无具名合照继续pending。官方具名MV拍摄照与MV截图分开，双语/表演版本需消歧。

Node>=22.13.0，使用apps/idol-site自身lockfile；依赖已齐不重复安装。新批先冻结当前审计SHA，import脚本默认dry-run；路径白名单目前batch-[abcdefg]-20261026。不重新apply旧delta。旧图替换另经promotion审查并保留旧原文件。

~~~text
node --test tests/mv-identity-batch.test.mjs tests/promote-mv-identity-alternatives.test.mjs tests/mv-public-media.test.cjs tests/mv-member-policy.test.cjs
node scripts/build-mv-public-media.mjs --check
npx tsc --noEmit
npm run build
~~~

代码、来源、验证、worklog和跨电脑入口同步提交推送；分别报告资料、功能、设计保护和上线状态。
