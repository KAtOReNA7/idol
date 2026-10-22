# 共享开发状态

更新：2026-10-22。交接分支为 `handoff/codex-20261022`；每次先 fetch 并读实际 HEAD、活动分支/PR 和 worklog，不把本地聊天当共享进度。

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
| GENBLUE/WOOAH | 私有 synthetic QA 候选；combined-integration已入仓 | 待真实工程接入与人工反馈；不是生产验收 |
| MEOVV B | 四段patch及四份真实readback已入仓；未上线 | pins只绑定当次产物，完整Sites TAR容量与最终发布仍待验 |
| izna/ifeye v3 | 15份源、30图依赖闭合，隔离候选已入仓 | 15图复用基线，15图恢复；宿主/resolver/评分接线未完成 |
| Astra | 已收官 | 不代表15团全部设计/上线通过 |
| Sol | 最新收官最终反馈尚未见 | 不写为完成；已有完整源足以继续，不阻断全部开发 |

## 下一里程碑与任务索引

从 [CODEX-FIRST-RUN](CODEX-FIRST-RUN.md) 开始。第一轮在独立任务分支将 GENBLUE/WOOAH 至少一团接入真实工程，补 catalog、稳定ID、精确关联及既有记录入口，交可打开预览；不只写计划或文档。共享层避免抢写；如 pruner 与 GENBLUE 7图冲突成为依赖，精确修保留规则，不关闭 guard 或删原图。

- [本次有界交接记录](worklogs/20261022-repository-handoff.md)
- [新任务 worklog 模板](worklogs/TEMPLATE.md)：尚无首轮产品任务被此文件宣称已认领或完成。

每次结束/换机前代码与 worklog 同提交并 push 合规 WIP。未验 WIP 不混成已验 main；合并与实际验证后才更新已验基线。当前无生产发布授权就交预览，有明确授权后可按验收门槛继续，不永久停在候选。
