# GitHub 主线整理 · 2026-10-26

用户授权：整理众多分支，将已完成成果合并主线。整合分支为 `codex/mainline-consolidation-20261026`，通过非 squash 的 merge PR 进入 `main`，保留完整历史及不可变图片提交。未强推、未重写历史、未部署站点。

## 实际完成结果

[PR #42](https://github.com/KAtOReNA7/idol/pull/42) 已成功合并，合并提交 `99a8ef14712f3312aaf5db3e1691527d36b2884f`。远端原54条分支现为3条：`main`、`codex/member-photo-consensus`、`handoff/sol-safe-source-20261016`。原51条已整合非main分支加本轮整合分支，共52条已逐条核对完整SHA、主线包含关系及远端归档tag，原子推送删除成功。52个对应恢复标签仍在远端。

原40个开放草稿PR（#2–#41）均已更新说明并关闭；它们的head完整进入main，GitHub状态为closed而非逐个操作merged。PR42状态为merged；复查开放PR为0。无GitHub checks/statuses配置，本次依据上述本地实际验证合并，没有绕过失败CI。

本机已切换到跟踪 `origin/main` 的 `main`；原仅追踪KiiiKiii单分支的fetch配置已在本仓库改为追踪全部heads，并清理失效远端跟踪引用，未删除本地历史分支。接续文件中的基线已同步。此次结果补记只改文档。

## 核查与选择

- 开工工作树干净，显式 fetch 全部远端 heads；发现本地为浅克隆后执行 unshallow。完整历史确认旧 main `b9e101262c696c2c77ed6aee62d004370c53cd21` 是最新实现 `a27cc9793fd0d00ef3fea062e346627eadeb7575` 的祖先（0/124），不是需要丢弃一边的分叉。
- 盘点54条原远端分支、40个开放PR（#2–#41）。48个分支HEAD已被最新实现包含；另外3条smoke工具分支文件与现有代码完全一致，通过普通merge保留提交；1条开发计划分支新增两份历史文档并标明时效。
- 整合后52个原分支HEAD可从整合提交到达，包含旧main。除main外51条在合并成功后先推送 `archive/20261026/<原分支名>` tag，核对远端tag SHA，再清理分支。回滚分支同样保留原SHA标签，不丢历史。
- `codex/member-photo-consensus`：两个独立提交，修改旧根sandbox的照片冲突选择、精确视频校验及测试。尚未评估适用于正式工程，不为减少分支而混入产品。
- `handoff/sol-safe-source-20261016`：九个独立历史交接提交，含旧候选、补丁和导入脚本。保留研究来源，不整包覆盖当前正式工程。
- 上述两条仍保留分支。不是漏合，也不宣称所有候选都已完成产品集成。

完整54条原分支与SHA：`mainline-branch-inventory-20261026.json`；40个PR的原head/base/SHA：`mainline-pr-inventory-20261026.json`。PR内容已包含后收拢旧草稿状态，历史描述仍保留。

## 改动与验证

正式 `apps/idol-site/` Git子树与 `a27cc9793fd0d00ef3fea062e346627eadeb7575` 完全一致；因此51团设计、原图字节、ID/关系、个人数据与权限实现未改。README、AGENTS、STATUS、RESUME、首次执行与跨电脑交接入口改为最新main；旧过程记录保留。

本次在整合工作树运行：

- 正式工程 `node --test tests/mv-identity-batch.test.mjs tests/mv-public-media.test.cjs tests/mv-member-policy.test.cjs tests/public-asset-delivery.test.cjs`：27/27通过。
- 正式工程 `npx tsc --noEmit`、`npm run build`：通过。构建仍提示大chunk及部分动态路由不能静态分类，非构建失败。
- 根工具 `node --test tests/repo-hygiene.test.mjs tests/validate-image-manifest.test.mjs`：35/35通过。
- 旧工具测试最初34过1失败：Windows禁止创建换行文件名。改为在测试临时Git索引中构造同一NUL分隔路径，仍实际执行CLI并断言拒绝。仅该临时索引命令局部设 `core.protectNTFS=false`；无工作树检出，不改仓库/全局配置，不跳过用例。
- 对全部计划清理HEAD做祖先检查，清理前再次核对远端SHA；标签推送与删除采用完整具体ref，不删除未整合分支。

未运行全仓测试、未重新做网页/真实保存/视频/缩放/Figma验收；本轮不把历史验证扩大为新结论。正式站保持v190；707缺图、43旧低清、18统计未知与个人页统一设计待决定均保持。

## 恢复与下一步

新电脑读取 `NEXT-COMPUTER-HANDOFF.md`，保护本地修改，fetch main，再从origin/main开新任务分支。当前缺口表是 `reports/20261026-gap-m/ledger.json`，A–M不得重导。

如需恢复已清理的某分支，先从清单取归档tag，fetch该精确tag，再 `git switch -c codex/recovered-task <该tag>`。恢复旧分支不意味着可以覆盖当前main。两个独立旧候选分支需单独评估有效差异后再决定移植或归档。
