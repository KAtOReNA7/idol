# 跨电脑接续：仓库2124绑定/704缺图；正式站仍v190

## 最新选图决定：允许民间同套认人图（2026-10-27）

用户明确：官方和民间来源均可，认人图以同套、清晰、好看、人物匹配可靠为准，不是页面设计。**覆盖旧规则中强制精确 MV 拍摄/版本的限制**；具名概念/封套等同套照片可复审，不伪标成 MV 现场照。身份仍需可靠具名依据，保留原件，不猜脸、不生成补脸；51 团设计、个人数据/ID/关系/权限保持。完整新规则：`docs/codex/identity-photo-selection-policy-20261027.md`。

704 条逐条新路线在 `docs/codex/reports/20261027-gap-704-classification/policy-reroute.json`：优先复审旧用途/版本受限 171 条，再处理 93 条身份证据，其余扩大到民间同套图集。路线改变不等于图片补齐，本轮导入 0、缺口仍 704、未部署。旧分类和验收条件是历史证据，执行以本节新规则为准；导入器/来源类型/展示文案下一批需适配，不得伪填旧精确 MV 证据。

2026-10-27。正式工程`apps/idol-site/`，PR43包含N+O，尚未合并。GitHub提交、Sites候选源、正式部署分别记录。

## 剩余 704 条原因分类（2026-10-27）

按 O 批当前开放集合逐条复核：42 团、168 个精确作品/视频，八类合计 704；资料页无目标图 291、素材用途不符或未证 101、人物姓名未证 93、原生像素不足 77、版本不符或未消歧 70、研究待完成 56、清晰度/构图 11、入口失效 5。仅复核既有证据，不代表本轮重新全网检索或 704 条已补；图片导入 0，正式站未部署。优先研究 93 条身份对应和 26 条已定位幕后入口，仍须通过全部采用条件。

报告 `docs/codex/remaining-704-classification-20261027.md`；可筛选表/JSON/CSV 与 168 个作品队列在 `docs/codex/reports/20261027-gap-704-classification/`。704 条与当前审计 tuple 集合严格相等、原研究记录逐条可追溯；101 条和 56 条已进一步细分，Tick-Tack 旧细分类不覆盖 O 批最新身份问题。下一轮先读此报告再执行；原 O 清单及历史证据保留。仓库 2124/704、最近发布记录 v190 的 2121/707 及 N/O 三条待发布不变；43 旧低清、18 未知统计另行处理。

## 复制给下一台电脑

请接续 https://github.com/KAtOReNA7/idol 。先检查并保护本地未提交及未跟踪文件，显式fetch origin/main，工作树干净后从origin/main创建新的codex/任务分支，不reset、clean或强推；未克隆则先克隆。核对PR43；若未合并，fetch codex/mv-identity-gap-n-20261027并普通merge到新任务分支，纳入已完成N/O，不从旧逐团分支开始。

依次读NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、RESUME.md、mainline-consolidation-20261026.md，再读identity-gap-o-report-20261027.md。当前仓库2124绑定/350作品/45团、628封面、704缺图、43旧低清、18未知统计；A–O已导入，禁止重复。按docs/codex/reports/20261027-gap-o/ledger.json继续。Hearts2Hearts当前清单缺图已清零；O补MINJU《Tick-Tack》、IROHA《jellyous》，原871累计167已补。

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 仍v190，线上2121绑定/707缺图。N/O累计3条尚未上线。最新候选源5bea04aa67957540bf098d8bef50fa3daa6641b4已推送并完整打包；N上次文件blob上传300013ms超时无新版本/部署ID，O本轮无恢复证据，未重复同路径保存。上传恢复后先完成同一项目候选发布；缺口研究可并行推进。不得省略archive、改权限或发布旧产物绕过。

按最新 `identity-photo-selection-policy-20261027.md` 选图：官方和民间完整同套图集均可，清晰、好看、人物对应可靠优先；不再强制精确 MV 拍摄/版本证据。保留可靠具名依据、系列来源和完整原件，非 MV 同套图如实记录，禁止伪填精确 MV 证据字段。先复审 171 条旧用途/版本受限候选，再补民间具名对应。缺图保持评分，51 团设计及个人记录/权限不变。旧 O 原件和实际质量证据保留，但旧来源限制不再执行。导入器与显示文案适配仍待下一批实施。

## Git 操作

```sh
git clone --branch main https://github.com/KAtOReNA7/idol.git idol
# 已有仓库先保护全部修改，再执行下面步骤
git fetch origin refs/heads/main:refs/remotes/origin/main
git status --short
git log -1 --oneline origin/main
# 工作树干净后选择未占用任务名
git switch -c codex/your-next-task origin/main
# 仅当PR43尚未进入main时
git fetch origin refs/heads/codex/mv-identity-gap-n-20261027:refs/remotes/origin/codex/mv-identity-gap-n-20261027
git merge origin/codex/mv-identity-gap-n-20261027
```

以最新远端HEAD为接续点，不回退来源冻结值。O新原图固定ref为bc338bd5a1b555b50bd96c96ba6fe65c7ef137cc；N原件仍包含在新publicRef中。旧5488资源记录的字节、SHA、交付方式保持。

## 正式发布恢复

- 原项目appgprj_6acb4fa532b88191ae2588c24b724b17；v190已发布源0842a321033152cacd6c5a0c8c6790d654d33ea0、部署appgdep_6adf62e9eed08191bf2bd6c7251af40b。实际public/1owner/0外部/0组保持，名称private不代表权限。
- 最新N+O候选源5bea04aa67957540bf098d8bef50fa3daa6641b4；本机包E:/project/idol-gap-o-qa-20261027/formal-site.tar.gz，gzip39,664,383bytes，SHA256 2793aff66590a966b734f6e76968d278b54ab430e9fedcc5aebefbf1986436f1；完整TAR62,305,280bytes/1417文件。不是旧N包。
- 跨电脑读取Sites技能，用原生source helper打开同一项目最新源并重建打包。先用新credential打开；source参数仅校验checkout，不能替代fetch。token只放内存/隐藏stdin，不落盘；凭证到期需同项目续签。
- 保留.openai/hosting.json的DB/R2/MCP、23迁移、owner保存鉴权。正式build后执行node scripts/prepare-production-assets.mjs --apply；不运行旧宽泛prune。完整展开TAR并核对全部构建字节、601本地资源、4889远端缺席、10受限缺席、hosting/23迁移。
- 原生save使用helper返回的同包/同SHA；拿到真实version_id才deploy。结果不明先查get_site/list_site_versions。恢复前不重复N已失败的westus3上传；不得把推送/候选包当上线。
- 发布成功后验证N的STELLA及O两图的同源HTTP/字节/SHA、三宽作品及原图流程，复查公开目录字段指纹、native存储和访问状态。当前N/O线上未验。

## 本轮验证与局限

34相关测试、类型、正式构建、整图证据、固定GitHub原图及完整TAR通过。本地公开目录夹具三宽6布局/6新增图片槽/6原图流程通过；旧4个未补槽依赖正式存储，本地12条502保留，不视作新图失败也不冒称全页媒体通过。复验脚本reports/20261027-gap-o/verify-evidence.py需Pillow。

公开目录51团/338成员/614作品/2845关系全字段指纹58549f245db99f15021bf3bdc8fe65fd083eba3fa409a5901c38183b846d52d8保持；native epoch6、activeSnapshot0180f4aa-664f-48e9-a98a-958d4ae649f9、done206保持。没有真实私人写入。系统Chrome/Playwright，不代表用户IAB；完整视频、原生缩放、新Figma未验。

[本轮报告](identity-gap-o-report-20261027.md) · [704逐条表](reports/20261027-gap-o/ledger.html) · [验证](identity-gap-o-verification-20261027.json) · [原生状态](reports/20261027-gap-o/native-evidence.json)。N/M及v190报告保留历史。
