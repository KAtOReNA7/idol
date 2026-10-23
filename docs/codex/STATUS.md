# 共享开发状态

更新：2026-10-23，北京时间。当前完整接续分支为 **`codex/izna-native-integration`**，从 `codex/wooah-native-integration` 的 `121f410` 接续，继承最初 `handoff/codex-20261022`；正式目录 `apps/idol-site/`。实现提交 `c998df46a6cd258c11cbbf7a6fb7642a2bacee3b` 已推送并读回，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 的base为WOOAH、head为izna任务分支。每次先fetch并读实际HEAD/活动PR，不从旧main开工。发布与验证证据见 [本轮工作日志](worklogs/20261023-izna-native-integration.md)，源分支PR #5保留溯源。新电脑先读 [RESUME](RESUME.md)。

最新阶段：GENBLUE v10已获认可；WOOAH三项布局修正v12发布后，用户回复 **“OK 保存目前开发进度”**，该团页面确认通过。本轮第三团izna原生集成已实现，v13私有只读审阅已发布，线上浏览器未复验，等待用户确认；**未获明确确认前不得开发ifeye或下一团**，公共功能例外。Figma实际图片落地、11个精确视频预览缺口、80%/125%原生浏览器缩放、真实保存和主站全量发布仍未完成，不能混成已验收。

## 已核基线与交接入口

- 正式工程：`apps/idol-site/`。源码提交 `f24075fc98893793e82adbc92cadc9e58257728f` 已正常推送并读回确认。
- 来源为 Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350`，不是本仓库可 fetch 的历史 commit。原生子树 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；[基线清单](SOURCE-MANIFEST.json)覆盖3954文件、642362678字节；1863张图575168413字节保持原样。
- 2026-10-22原始入口、文档和三个隔离候选的交付历史保留；可用 `git log -- docs/codex/STATUS.md handoffs/codex-20261022` 查询。候选目录到位不等于已应用或上线，当前接入状态见下表。
- main 仍为 `b9e101262c696c2c77ed6aee62d004370c53cd21` 的旧 Next sandbox。本交接未合并 main。
- v186 纯 TypeScript 检查已通过：`tsc --noEmit --incremental false`，exit 0、0 diagnostics。仅复用相同依赖；fresh-clone 安装、完整构建、浏览器与生产不据此记为通过。
- 用户 13:22 UTC 明确保持仓库公开，并批准本次已有评分、备注、观看快照公开入仓；不包含秘密，也不扩展到未来新增敏感数据或无关导出。

## 产品与收官状态

| 范围 | 当前状态 | 接续边界 |
| --- | --- | --- |
| 线上主站 | v186 A-only | 未发布 MEOVV B 或本分支的团体增量 |
| GENBLUE | BlueCut 已接入正式工程；v10 页面获用户明确认可 | [已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html)；开发侧真实浏览器/保存未验，主站包体超限事项仍保留 |
| WOOAH | 已修正为团照首屏、五人同组、统一4:5成员照片；只读审阅v12已发布 | [已确认页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah/index.html)；该轮类型、干净构建、20+37项检查及剪枝dry-run通过；真实浏览器/保存未验，24个视频配图仍缺；保护已认可页面 |
| MEOVV B | 四段patch及四份真实readback已入仓；未上线 | pins只绑定当次产物，完整Sites TAR容量与最终发布仍待验 |
| izna | 正式工程原生宿主、精确resolver、既有评分/手帐与返回接线已实现；7份含历史成员档案、8项只浏览发行、15个影像槽位、12条具名MV关系、20张原图 | [v13审阅入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)已发布，只读、owner-private；待用户确认，线上浏览器未复验。发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`；未完成项见本页顶部 |
| ifeye v3 | 原始源码与素材保留在隔离候选中 | 尚未原生接入；izna未获明确确认前不开发 |
| Astra | 已收官 | 不代表15团全部设计/上线通过 |
| Sol | 本轮已收官，最终反馈已归档 [SOL-HANDOFF](SOL-HANDOFF.md) | 13:38形成、13:53主会话完整读取；不等于全部团体产品验收通过 |

## 下一里程碑与任务索引

从 [RESUME](RESUME.md) 和 [CODEX-FIRST-RUN](CODEX-FIRST-RUN.md) 开始，检出 `codex/izna-native-integration` 最新远端HEAD；源分支检查点为 `121f410`，`821f385`仅保留为此前WOOAH网页代码溯源。下一里程碑是等待用户确认已发布的izna v13，并补线上浏览器复验；可处理izna反馈或公共功能，不能提前开发ifeye或其他下一团。首次接入GENBLUE/WOOAH的目标已经完成，不重复导入旧候选。

- [izna 原生接续](worklogs/20261023-izna-native-integration.md)：当前任务，`codex/izna-native-integration` / draft PR #6；v13审阅已发布，精确版本与验证以该日志为准，用户审阅未确认。
- [此前两团保存检查点](worklogs/20261023-resume-checkpoint.md)：两团页面获确认，新电脑完整接续入口已整理。
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
