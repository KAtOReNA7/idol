# 共享开发状态

更新：2026-10-22。交接分支为 `handoff/codex-20261022`；每次先 fetch 并读实际 HEAD、活动分支/PR 和 worklog，不把本地聊天当共享进度。

最新用户决定（北京时间 2026-10-22）：**逐团完成 → 发网页地址 → 等用户人工确认 → 再开发下一团**。公共功能可继续。当前目标仅 GENBLUE；WOOAH、izna、ifeye 等保持待开始，不按原计划并行开工。用户随后报告验收链接 HTTP 404；已补齐静态入口并重新发布，线上可达性尚未独立确认，见 [访问修复](worklogs/20261022-genblue-routefix.md)。

## 已核基线与交接入口

- 正式工程：`apps/idol-site/`。源码提交 `f24075fc98893793e82adbc92cadc9e58257728f` 已正常推送并读回确认。
- 来源为 Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350`，不是本仓库可 fetch 的历史 commit。原生子树 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；[基线清单](SOURCE-MANIFEST.json)覆盖3954文件、642362678字节；1863张图575168413字节保持原样。
- 本次入口、文档和三个隔离候选与本文件同提交；可用 `git log -1 -- docs/codex/STATUS.md handoffs/codex-20261022` 查询实际交付提交。候选目录已到位，不等于已应用或上线。
- main 仍为 `b9e101262c696c2c77ed6aee62d004370c53cd21` 的旧 Next sandbox。本交接未合并 main。
- v186 纯 TypeScript 检查已通过：`tsc --noEmit --incremental false`，exit 0、0 diagnostics。仅复用相同依赖；fresh-clone 安装、完整构建、浏览器与生产不据此记为通过。
- 用户 13:22 UTC 明确保持仓库公开，并批准本次已有评分、备注、观看快照公开入仓；不包含秘密，也不扩展到未来新增敏感数据或无关导出。

## 产品与收官状态

| 范围 | 当前状态 | 接续边界 |
| --- | --- | --- |
| 线上主站 | v186 A-only | 未发布 MEOVV B 或本轮两团候选 |
| GENBLUE | BlueCut 已接入正式工程；审阅链接 404 后已发布入口修复版 | [直接页面入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html)；用户可达性/真实浏览器/保存未验，主站包体超限，其他团暂停 |
| WOOAH | native v1.2 隔离候选已入仓 | 等 GENBLUE 用户通过后再开发，保留现有候选 |
| MEOVV B | 四段patch及四份真实readback已入仓；未上线 | pins只绑定当次产物，完整Sites TAR容量与最终发布仍待验 |
| izna/ifeye v3 | 15份源、30图依赖闭合，隔离候选已入仓 | 15图复用基线，15图恢复；宿主/resolver/评分接线未完成 |
| Astra | 已收官 | 不代表15团全部设计/上线通过 |
| Sol | 本轮已收官，最终反馈已归档 [SOL-HANDOFF](SOL-HANDOFF.md) | 13:38形成、13:53主会话完整读取；不等于全部团体产品验收通过 |

## 下一里程碑与任务索引

从 [CODEX-FIRST-RUN](CODEX-FIRST-RUN.md) 开始。第一轮在独立任务分支将 GENBLUE/WOOAH 至少一团接入真实工程，补 catalog、稳定ID、精确关联及既有记录入口，交可打开预览；不只写计划或文档。共享层避免抢写；如 pruner 与 GENBLUE 7图冲突成为依赖，精确修保留规则，不关闭 guard 或删原图。

- [本次有界交接记录](worklogs/20261022-repository-handoff.md)
- [GENBLUE 本轮审阅版](worklogs/20261022-genblue-review.md)：`codex/genblue-native-integration` / PR #3；补夜市王具名 MV 图及双向成员入口、0.1 评分步进和构建审计。最终类型/构建/62 项专项通过；私有只读审阅站已发布。正式展开 TAR 271.328125 MiB 超限，浏览器与真实保存未验，主站未发布、人工待反馈。[首轮接入历史](worklogs/20261022-genblue-native-integration.md) 保留。
- [新任务 worklog 模板](worklogs/TEMPLATE.md)
- [GENBLUE 验收链接 404 修复](worklogs/20261022-genblue-routefix.md)：同一 PR #3；物理团页、静态回退配置、路径规范化已发布到审阅站。10 项相关回归及类型检查通过；线上浏览器/HTTP 可达性未独立复验，不能宣称 404 已在用户端消失。

每次结束/换机前代码与 worklog 同提交并 push 合规 WIP。未验 WIP 不混成已验 main；合并与实际验证后才更新已验基线。当前无生产发布授权就交预览，有明确授权后可按验收门槛继续，不永久停在候选。

## Sol 最终补遗（2026-10-22）

主会话已独立复核通过 `253633c5bcf2b58c06a54c4d817df9d168182fcf` 的有界入口/候选交接；这不是产品验收或上线通过。用户13:52已收到原字节首次执行文件，可直接开工。本补遗归档Sol最终反馈与Photo v1历史设计参考，不覆盖combined中的native v1.2，不阻塞接手。Photo v1已取回；私有合成QA关键返回/队列/原图及80%/125%已过，真实catalog/保存/精确视口/生产仍待验。

原 `PACKAGE-SHA256.json` 与交接worklog保留253633c5提交时的范围；本次新增8文件用参考目录的 `SHA256SUMS` 核验，状态文档后续更新不回写旧交付快照清单。首次执行正文与正式源码不变。
