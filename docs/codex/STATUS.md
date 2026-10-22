# 共享开发状态

更新：2026-10-23，北京时间。当前完整接续分支为 **`codex/wooah-native-integration`**（PR #5），继承最初 `handoff/codex-20261022`；正式目录 `apps/idol-site/`。每次先fetch并读实际HEAD/活动PR，不从旧main开工。新电脑先读 [RESUME](RESUME.md)。

最新用户决定：GENBLUE v10已获认可；WOOAH三项布局修正v12发布后，用户回复 **“OK 保存目前开发进度”**，本次页面确认通过。本轮仅保存交接，尚未启动第三团；以后仍逐团交地址、明确通过再继续，公共功能例外。浏览器、真实保存、精确视频配图和主站发布的未完成项保留。

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
| GENBLUE | BlueCut 已接入正式工程；v10 页面获用户明确认可 | [已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html)；开发侧真实浏览器/保存未验，主站包体超限事项仍保留 |
| WOOAH | 已修正为团照首屏、五人同组、统一4:5成员照片；只读审阅v12已发布 | [本次已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)；本轮类型、干净构建、20+37项检查及剪枝dry-run通过；真实浏览器/保存未验，24个视频配图仍缺；本次保存后再接续，尚未启动第三团 |
| MEOVV B | 四段patch及四份真实readback已入仓；未上线 | pins只绑定当次产物，完整Sites TAR容量与最终发布仍待验 |
| izna/ifeye v3 | 15份源、30图依赖闭合，隔离候选已入仓 | 15图复用基线，15图恢复；宿主/resolver/评分接线未完成 |
| Astra | 已收官 | 不代表15团全部设计/上线通过 |
| Sol | 本轮已收官，最终反馈已归档 [SOL-HANDOFF](SOL-HANDOFF.md) | 13:38形成、13:53主会话完整读取；不等于全部团体产品验收通过 |

## 下一里程碑与任务索引

从 [RESUME](RESUME.md) 和 [CODEX-FIRST-RUN](CODEX-FIRST-RUN.md) 开始，当前最新网页代码为 `821f385`，本文检查点提交位于其后。首次接入GENBLUE/WOOAH的目标已经完成，不重复导入候选。下次先核对用户新要求、环境与活动PR，再选择一个未完成团或必要公共工作；逐团人工确认门槛继续生效。

- [本次保存检查点](worklogs/20261023-resume-checkpoint.md)：两团页面获确认，新电脑完整接续入口已整理。
- [本次有界交接记录](worklogs/20261022-repository-handoff.md)
- [GENBLUE 本轮审阅版](worklogs/20261022-genblue-review.md)：`codex/genblue-native-integration` / PR #3；补夜市王具名 MV 图及双向成员入口、0.1 评分步进和构建审计。最终类型/构建/62 项专项通过；私有只读审阅站已发布。旧轮正式展开 TAR 271.328125 MiB 超限，浏览器与真实保存未验、主站未发布；后续 v10 页面已获用户认可。[首轮接入历史](worklogs/20261022-genblue-native-integration.md) 保留。
- [WOOAH 三项布局反馈修正](worklogs/20261023-wooah-layout-feedback.md)：同一PR #5，团照前置、首页/成员目录五人统一、原图保留，v12已获用户本次页面认可。
- [新任务 worklog 模板](worklogs/TEMPLATE.md)
- [GENBLUE 验收链接 404 修复](worklogs/20261022-genblue-routefix.md)：同一 PR #3；物理团页、静态回退配置、路径规范化已发布到审阅站。10 项相关回归及类型检查通过；线上浏览器/HTTP 可达性未独立复验，不能宣称 404 已在用户端消失。
- [WOOAH 正式接续](worklogs/20261022-wooah-native-integration.md)：基于 GENBLUE 修复提交 `c523b0b` 的 `codex/wooah-native-integration`；56 条成员/MV 精确关系、5 个时间轴作品入口、资料来源修订、独立只读审阅入口与原图保留守卫已落地。首轮v11后已修正为v12并获页面确认，保留已认可 GENBLUE；PR 以 GENBLUE 分支为基线，不从旧 main 开工。

每次结束/换机前代码与 worklog 同提交并 push 合规 WIP。未验 WIP 不混成已验 main；合并与实际验证后才更新已验基线。当前无生产发布授权就交预览，有明确授权后可按验收门槛继续，不永久停在候选。

## Sol 最终补遗（2026-10-22）

主会话已独立复核通过 `253633c5bcf2b58c06a54c4d817df9d168182fcf` 的有界入口/候选交接；这不是产品验收或上线通过。用户13:52已收到原字节首次执行文件，可直接开工。本补遗归档Sol最终反馈与Photo v1历史设计参考，不覆盖combined中的native v1.2，不阻塞接手。Photo v1已取回；私有合成QA关键返回/队列/原图及80%/125%已过，真实catalog/保存/精确视口/生产仍待验。

原 `PACKAGE-SHA256.json` 与交接worklog保留253633c5提交时的范围；本次新增8文件用参考目录的 `SHA256SUMS` 核验，状态文档后续更新不回写旧交付快照清单。首次执行正文与正式源码不变。
