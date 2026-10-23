# 项目协作入口

在为 Sol、Astra 或其他会话编写任务指令、接续实现、汇总验收之前，先阅读 [设计要求与验收基准](docs/design-requirements.md) 和 [跨会话派工与验收手册](docs/collaboration-playbook.md) 中的最新用户决定，再核对当前源码和最新交付。

## 最新执行决定（2026-10-23 SAY MY NAME v19）

- 上一会话在 KiiiKiii v18 交付后已收到用户“已确认，继续开发”；本会话恢复该确认并接续。KiiiKiii 页面已确认，本轮只推进原计划内 SAY MY NAME。
- 最新分支 **`codex/saymyname-review-completion`**，基于 `f91a66ce9466cd12c64ebe9a9b16d84739b45fc9`；正式工程 `apps/idol-site/`。draft [PR #11](https://github.com/KAtOReNA7/idol/pull/11)，代码提交 `5c28500cdeb5920ba3d7640b50065cffebe1d3b4`；文档以最新远端 HEAD 为准。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-saymyname-review-completion.md)。
- v19 owner-private 审阅已发布：八张2000×3000官网原图、成员搜索/原图、九发行搜索/详情、六影像/五舞台绑定/37关系及手帐往返。**等待 SAY MY NAME 人工确认后再开发下一团，公共功能例外。**
- 113项测试、类型及正式构建通过；9项交互与七页五个真视口通过。192旧审阅文件SHA不变，正式主站仍v186。真实保存、播放、线上浏览器、原生缩放与完整Figma仍待验；部署后的in-app browser打开超时，未冒称通过。

## 历史检查点（2026-10-23 KiiiKiii v18）

- 用户“已确认，继续开发”已确认 Hearts2Hearts v17。本轮只推进 KiiiKiii：五张同系列具名照片、等大成员卡片、成员/发行搜索详情、9视频与7事件、原生手帐往返；只读 v18 已发布。
- 最新接续分支 **`codex/kiiikiii-review-completion`**，基于 Hearts2Hearts 的 `62ca3f61e3059c60a4b0558bc73b12e624ca2e1c`；正式工程 `apps/idol-site/`。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-kiiikiii-review-completion.md)。draft [PR #10](https://github.com/KAtOReNA7/idol/pull/10)；代码提交 `3ea7995b42ebb9bb08e88f23463fba27dad9e634`，其后文档以最新远端HEAD为准。
- **现在等待 KiiiKiii 人工验收，确认前不开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15、ifeye v16、Hearts2Hearts v17 已获页面确认；正式主站 v186 未改。
- 最终114项专项/回归、类型与正式构建通过；实际桌面交互和七页五宽iframe通过，非顶层真视口/缩放/真实保存/线上浏览器。171旧审阅文件SHA不变；设计/素材/生产待办见日志。下方旧门槛为历史，不能覆盖本决定。

## 历史检查点（2026-10-23 Hearts2Hearts v17）

- 用户“已确认，继续开发”已确认 ifeye v16。本轮仅推进 Hearts2Hearts：官网八张同尺寸原图、成员与发行搜索、13作品版本、11事件、原生手帐往返；只读 v17 已发布。
- 最新接续分支 **`codex/hearts2hearts-review-completion`**，基于 `codex/ifeye-native-integration` 的 `abe3b0476d6585d0d2986182f90403106125fe7f`；正式工程 `apps/idol-site/`，draft [PR #9](https://github.com/KAtOReNA7/idol/pull/9)。先读 [RESUME](docs/codex/RESUME.md) 和 [本轮日志](docs/codex/worklogs/20261023-hearts2hearts-review-completion.md)。
- **现在等待 Hearts2Hearts 人工验收，确认前不开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15、ifeye v16 已获页面确认；正式主站 v186 未改。
- 57项专项、27项回归、类型与正式构建通过；实际桌面交互及五宽 iframe 通过，非顶层五视口/缩放/真实保存/线上浏览器。既有149审阅文件SHA不变，完整待办见日志。下方旧门槛为历史，不能覆盖本决定。

## 历史检查点（2026-10-23 ifeye v16）

- 最新接续分支 **`codex/ifeye-native-integration`**，基于 `codex/izna-review-followup` 的 `665fed58554fd83ddbcfc098228c6961943e9ebf`；正式工程 `apps/idol-site/`，draft [PR #8](https://github.com/KAtOReNA7/idol/pull/8)。先读 [RESUME](docs/codex/RESUME.md) 和最新远端，不从旧main开工。
- 用户本轮“已确认，继续开发”已确认izna v15。本轮接入ifeye原生页并发布v16：6成员、3发行、7影像、10真实图片及既有手帐往返，成员照片等大同行。见 [本轮日志](docs/codex/worklogs/20261023-ifeye-native-integration.md)。
- **当前等待ifeye人工验收；确认前不得开始下一团，公共功能例外。** GENBLUE v10、WOOAH v12、izna v15已认可页面继续保护；正式主站仍v186。
- 58项针对性测试、类型与正式构建通过；实际桌面/五宽iframe验证已记录，不能当顶层真视口/缩放。Figma实图/内页、7个精确视频预览、真实保存和线上浏览器仍待验。
- 正式剪枝dry-run被已有izna原图引用阻断，未apply；旧ifeye审计测试fixture35过3失败（YOUNG POSSE保留校验），未放宽生产pins。ifeye原图保留只减少删除项；不能据v16审阅包推出主站全量包通过。下方历史与多电脑规则继续适用。

## 2026-10-23 白天检查点（历史，当前接续以上方为准）

- GENBLUE v10和WOOAH v12页面已获用户确认，继续保护。本轮从 `codex/wooah-native-integration` 的 `121f410` 接续，在 `codex/izna-native-integration` 完成 izna 原生页面接入，当前待用户审阅；未获明确确认前不得开发 ifeye 或下一团，公共功能例外。最新接续读 [RESUME](docs/codex/RESUME.md)，检出 `codex/izna-native-integration` 最新远端 HEAD，不从旧 main 或最初handoff开始。
- izna [只读、owner-private 审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) 已发布 **v14**，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 待审阅。最新代码、发布与验证见 `docs/codex/worklogs/20261023-izna-hero-web.md`；本地5宽首页、查看原图/导航、失败恢复通过，100个非izna审阅文件SHA不变。发布后in-app browser单次打开超时，线上浏览器仍未复验，用户尚未确认整团。
- 2026-10-23 izna最新决定：用户认可Figma首屏后回复“可以 继续开发”，网页现已同步为大幅团照、简洁页头和图下入口，手机整幅原图，桌面保留六人完整构图。Figma设计证据见 `docs/codex/worklogs/20261023-izna-hero-figma.md`；Figma下方图片/其他页面、11个精确视频预览、80%/125%原生浏览器缩放、真实保存与主站全量发布仍待完成。等待用户确认v14网页，不将本次继续开发授权等同整团通过。
- 用户已决定迁移试用 Codex；GitHub 保存多台电脑共享的代码与开发阶段，不再要求主会话直接开发、云环境仅验证。首次执行读 [CODEX-FIRST-RUN](docs/codex/CODEX-FIRST-RUN.md)、[STATUS](docs/codex/STATUS.md)、[PRD](docs/codex/PRD.md)、[CURRENT-STATE](docs/codex/CURRENT-STATE.md) 和 [ACCEPTANCE](docs/codex/ACCEPTANCE.md)。
- 正式工程为 `apps/idol-site/`，根 Next sandbox 保留为历史样本。v186 基线与候选分别按各自清单核验，不用旧根代码冒充完整生产源，不依赖控制或读取 Sol/Astra 会话。
- Astra 与 Sol 均已收官，Sol 最终补遗见 `docs/codex/SOL-HANDOFF.md`；收官不代表全部团体已验收。已有完整原生源与候选足以继续。
- 新审核逐团区分设计、功能、资料、上线，包括此前已确认的团。旧通过记录是线索，不是自动通过凭据；保留已认可设计与全部有效产品要求，不新增 VCHA 单样板的全局门槛。
- 用户验收可打开网页，不承担基础错图、断链、布局与关联排错。GENBLUE/WOOAH首轮接入已完成；保护当前已认可页面，后续按STATUS逐团交付实际网页增量，不重复导入旧候选。
- 当前公开仓库和本次既有评分、备注、观看快照已于 13:22 UTC 获用户批准；不扩展为未来新增数据、秘密、凭证或发布授权。保持原图、稳定 ID、owner-only 保存与现有安全边界。未经当前生产授权不覆盖主站；有明确授权后可继续合规上线。

## 必须检查
- 先确认仓库、分支、提交和实际输入。根目录是历史 sandbox，`apps/idol-site/` 是精确 v186 原生源；候选独立放在 `handoffs/codex-20261022/`，未经评审不直接覆盖。
- 任务包含需求版本、目标团、真实产品增量、冻结基线、实际可读输入、允许/禁止修改范围、交付及验收标准、明确的阻塞停止条件。
- 明确代码/服务/浏览器分别在哪个环境；不得把云端 localhost 当作用户电脑可访问地址。
- 单测、HTTP、浏览器、集成、部署分层报告；不能跨版本或占位图/原图模式继承验收，也不能由 build/tests 或旧设计推出设计通过。浏览器受阻必须留待补查，不可记为通过。
- 已证实失败或被拒绝的路径不盲目重试；不要用清单、包装、通用外壳替代缺失前提。
- 保留用户评分、备注、观看状态和既有安全边界；文档不是新增权限授权，不保存凭证或未经授权的私有数据；本次既有快照的公开批准不得扩围。
- 给用户转发的任务正文用【】包裹，正文外给推荐模型/推理级别；交代实际负责人、收官/进行中状态与下一步，不编造旧会话已完成。

详细案例、检查清单和派工模板见上述手册。历史结论需按当前证据重新核实。

## 多电脑代码与进度接续

1. GitHub 是共享代码与开发进度入口。正式工程为 `apps/idol-site/`；根 Next sandbox 不是生产基线。
2. 每次开工先查工作树、fetch 最新远端，再读 `docs/codex/STATUS.md`、相关 worklog、活动分支和 PR。不能仅依据本地会话、旧检出或本地 LOCK 判断进度。
3. 每任务一个分支、一个 `docs/codex/worklogs/<task-id>.md`。先检查同任务是否已被接续；共享路由、类型、权限、保存和打包文件避免多机抢写。
4. 保留用户与其他电脑的未提交改动。禁止 force push、丢弃改动的 reset/clean、覆盖更新或不经比较的冲突消解。出现分叉先比较，保留双方有效改动。
5. 小提交同时保存代码和进度。合规 WIP 可推送独立分支，但须明确未验，不能标成已验 main 或生产。推送前核对仓库实际可见性与当前数据分享授权；秘密、认证令牌及含秘密的构建产物不入仓。
6. 结束或换机前提交并推送实际成果与 worklog，记录路径、依赖、素材、运行方式、测试结果、阻断、下一步、版本与预览/上线/人工验收状态。仅写“完成”不构成交接。
7. STATUS 维护已验基线、下一里程碑和任务链接；任务细节独立记录，减少多人同时改一个日志。合并后再更新基线，未合入与未验事项保持明确。
8. 设计、功能、资料、上线分别报告。测试、类型检查、合成数据、私有预览或旧版本通过均不能替代其他项。
9. 初次进入先读 `docs/codex/CODEX-FIRST-RUN.md`，核对正式源码和素材确已到达当前分支，再开始实际页面开发，不以旧沙箱或整理台账替代网页交付。

出现共享层冲突先比较活动分支/PR，明确路由、类型、权限、保存与打包文件的负责范围；不通过本地 LOCK 抢占所有权。代码与 worklog 同提交；结束或换机前 push 合规 WIP。若认证/权限拒绝，保留本地提交并准确记录阻断，不新建凭证绕过，不把未推送或未验结果写为共享完成。
