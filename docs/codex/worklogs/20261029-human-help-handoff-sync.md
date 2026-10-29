# 新电脑接续与人工填写保护（2026-10-29）

## 目标与实际输入

本轮仅同步人工清单工具和交接，不改正式应用，不重复部署 v201。正式工程为 `apps/idol-site/`。已先读 NEXT-COMPUTER-HANDOFF，再核 AGENTS、STATUS、RESUME、续接指令、人工清单、v201报告、舞台与选图政策，以及设计要求和协作手册。当前用户指令与最新交接覆盖旧逐团分支、v186/v190及旧发布状态。

用户说明已换新电脑，不知道新增人工答案位置。当前收到的是接续指令；远端 `dada774` 的人工 CSV 161 行、45 团，三个人工栏均为空。本机原有 22 个改动均为脚本、测试或清单文件，没有额外人工补充表。不能推定旧电脑没有其他文件，也不能把未知位置的材料当成已收到。

## 本地保护与远端

- 原工作树：`E:\project\idol`，`codex/izna-native-integration`，`aa9e0446c47d3de8cd0c893f86fc0112248d9aaf`。
- 17 个修改文件和 5 个未跟踪文件已复制到 `E:\project\idol-local-backups\20261029-human-handoff-103333`，22 项 SHA-256 逐一相等；备份目录另有 manifest、状态和 staged/unstaged 二进制补丁。本地备份未提交。
- 新建 stash `2d1acc90331c12ba56d339418a3295a063327fe3`，名称 `codex-preserve-local-before-human-handoff-20261029`。保留原改动，不自动应用。其他电脑交接中的 `7779dd2...` 是不同恢复点，未将其当成本机 stash。
- 显式 fetch `main`、`codex/statistics-relations-followup-20261027` 和 `codex/stage-person-followup-v199-20261028` 后，main 为 `852f7506a4f921fff4e4d24fe70e8d607c7d40f5`，PR44 为 `21b12a6f0d49f355ee639ae87bb2b294ba58513f`，PR45 为 `dada774ba79aba8e9863a88822e71644669ce7cb`。GitHub API 核实两 PR 均 draft/open/unmerged；PR45 的 base 为 PR44 分支，祖先检查通过。
- 工作树干净后，从最新 origin/main 创建 `codex/human-help-handoff-sync-20261029`，普通 merge PR45 远端，结果 fast-forward 到 dada774。确认同时包含 PR44、v201实现与人工清单；未 reset、clean、强推或应用旧 stash。
- 仓库当前 public；本次仅提交代码、公开队列的验证摘要与交接，不含新私人导出或真实人工答案。沿用仓库已有 Codex 提交身份，不改用户全局 Git 配置。

## 本轮修复

原 `build-checklist.py` 用写入模式重建 CSV，并把“我的补充／补充来源／时间点或截止日”全部写空。用户填写后重跑会丢失答案。

现在生成器在第一步读取现存 CSV：只要任一人工栏含内容（包括空格），或表头、列数、引号、UTF-8编码无法安全识别，就明确停止。在停止之前不写 Markdown、CSV 或 validation。原表保留供人工核查；这不是自动采用或公开提交答案的流程。空模板仍可重建，不改变 161 项事实集合。真实工作树的生成产物本轮没有重写。

新增临时目录回归测试，使用合成填写内容；不读取个人评分或私有备份。根 AGENTS 与接续文档同步当前任务、新旧 stash 区别、无新人工答案状态，以及换机须纳入本任务保护修复的要求。

## 验证

- `python docs/codex/evidence/20261029-human-help/test-build-checklist.py`：6 个测试方法、18 个场景通过。涵盖中文、逗号、换行、仅来源、仅时间、空格，错误表头、缺列、多列、空行、损坏引号、非法编码、空文件，以及空模板稳定重建与首次生成。拒绝重建场景逐字节核对三个产物均不变。
- `python docs/codex/scripts/verify-post-v200-progress-20261028.py`：274 项离线一致性检查通过。其输出 `publicationBaselineVersion: 200` 是既有发布前历史字段，不代表当前正式版本；当前线上版本另查 Sites 为 v201。
- 独立审计确认新增舞台109 workId、旧替换11 recordId、人物24 workId、统计7 key、日期7 eventId分别与冻结队列完全相等。161行／45团及6个无当前任务团保持；另有1销量差额和2照片限制，分类不可相加为独立缺歌数。
- CSV、生成的 Markdown、原 validation、两份按团 JSON、两份冻结队列与 dada774 均无差异；正式应用 Git 子树保持 `5bdd4cb1e31af3ec823e0d6ce89bde6f25ea8411`，工作树无应用差异。
- 本轮不涉及应用改动，未重跑应用构建或浏览器验收，不继承旧测试作为本轮新验收。原图、51团设计、ID/关系、评分/备注/观看、鉴权和访问策略没有修改。

## 线上状态与发布边界

2026-10-29 10:35（Asia/Shanghai）通过 Sites 的 get_site、get_site_version 与 get_deployment_status 只读核实：正式站 active，最新版本 v201，源 `374ebe6de70a2e51641361740dde68246aed8b1c`，既有部署 `appgdep_6ae2262ced008191a526c05ac512fcf5` 为 succeeded。public / 1 owner / 0 external / 0 groups / revision2。一次公开首页 GET 返回 HTTP 200、HTML、标题 `stage. · 私人女团手帐`，21385字节。

这是部署元数据与首页可达性检查，不是全站视觉或功能验证。未取写凭证、未保存版本、未部署、未读私人记录、未写数据或修改权限。本轮未重新核对 native/epoch/日志或私人字段，保留 v201 原回执作为历史证据。详细只读状态见 `../evidence/20261029-handoff-sync/resume-verification.json`。

## 交付与下一步

GitHub 提交/远端读回与正式站状态分开留证；新任务普通推送，draft PR 以 PR45 分支为 base，避免将已在 PR44/45 的大批成果再次作为本轮增量。未合并 main 或 PR44/45，未部署新版本。最终 GitHub 提交和 PR 回执另记于 `../evidence/20261029-handoff-sync/github-sync.json`。

继续等待具体可核查的团体、作品/版本、链接、姓名/时间点、统计口径或原公告。可直接在聊天里提供，不要求找到旧电脑路径。未取得新证据的 109 新舞台、11 旧替换、24 人物、7 统计、7 日期、350635销量差与两项照片限制继续保留。个人页统一排版仍待决定；未来换绑先取得新鲜 owner 数据、完整保存历史和线上旧源核对，不复用过期导出。若后续收到真实填写文件，先保护，逐项查证；不因本次空模板已获公开授权而自动上传新内容。
