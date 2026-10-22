# Codex 首次执行文件

请直接接续开发女团资料与作品观看评分网站，不只初始化工程、改写文档或制定计划。GitHub 是多台电脑共享代码与进度的唯一交接入口。

## 仓库与当前交接边界

- 仓库：https://github.com/KAtOReNA7/idol
- 交接分支：`handoff/codex-20261022`。如随后已有明确合并记录，改用该记录确认的主分支，不猜测。
- 正式工作目录：`apps/idol-site/`。仓库根目录的旧 Next sandbox 不是生产基线，不能拿来替代正式项目启动或部署。
- 完整 v186 源已由 `f24075fc98893793e82adbc92cadc9e58257728f` 正常推送并读回；当前交接提交还提供本文和三个隔离候选。main 仍为旧 sandbox 的 `b9e101262c696c2c77ed6aee62d004370c53cd21`，不可误从该 main 启动正式开发。
- 仓库保持公开。用户于 2026-10-22 13:22 UTC 明确批准本次现有评分、备注、观看快照随源码进入该公开仓库。批准不扩展为未来新增敏感数据或无关导出的公开分享；密钥、认证令牌、浏览器会话和含秘密的构建产物始终不得入仓。源码推送回执已核；首次检出仍须验证实际分支与清单。

## 第一步 读取共享进度并核对实际输入

1. 已有检出先运行 `git status --short`，保留所有未提交改动。不得强制切分支、reset、clean、force push 或覆盖其他电脑的更新。
2. 查看远端后执行 `git fetch origin`，核对最新交接分支、活动分支与 PR。工作树不干净时先识别改动归属，不自行丢弃。
3. 依次读根 `AGENTS.md`、`docs/codex/STATUS.md`、`PRD.md`、`CURRENT-STATE.md`、`ACCEPTANCE.md`，再读本任务相关 worklog 与候选说明。当前 STATUS 已随本次提交提供；如果本地看不到，先核是否检出了正确分支。
4. 检查当前分支是否实际含 `apps/idol-site/package.json`、完整源清单、候选与可访问素材。逐项验证清单，不把 Sites source ID 当作可 fetch 的 GitHub commit。
5. 若当前检出缺少完整源，先核对分支并 fetch 已交付的源码提交 `f24075fc98893793e82adbc92cadc9e58257728f`。准确报告当前缺件，只暂停依赖该输入的步骤；不要误启动旧 sandbox，也不把错误检出扩展成所有开发等待旧会话。

新电脑可从以下入口检出（保留原字节，已有工作目录不要覆盖）：

```sh
git -c core.autocrlf=false clone --branch handoff/codex-20261022 https://github.com/KAtOReNA7/idol.git idol
cd idol
git status --short
git fetch origin
git rev-parse HEAD:apps/idol-site
```

首次未改动的正式子树应为 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；核对 [完整源清单](SOURCE-MANIFEST.json) 的3954路径、bytes/SHA/Git blob/mode。合法后续变更应有自己的基线差异与 worklog，不为命中旧hash而丢弃改动。

三个输入入口：[combined-integration](../../handoffs/codex-20261022/combined-integration/README.md)、[MEOVV B](../../handoffs/codex-20261022/meovv-b/README.md)、[izna/ifeye v3](../../handoffs/codex-20261022/astra-izna-ifeye-v3/README.md)。候选均隔离，先读说明；不能把源码来源ID当可取Git commit，也不依赖旧电脑临时目录。

## 第二步 复现正确工程

源与素材到齐后，从最新被确认的基线新建本任务分支，例如 `codex/genblue-native-integration`；先检查远端是否已有同任务分支，避免多机重复接手。

进入 `apps/idol-site/`，读取其 README、package、锁文件与环境要求。使用该项目真实脚本安装和启动，不使用根 sandbox 命令。先做不生成构建密钥的类型与静态检查，再打开实际预览。

新 build 可能生成 prerender、revalidation、draft preview 内部密钥。不能沿用旧 MEOVV B 操作批准推定新密钥或新发布已获授权；按当前权限要求处理。生成值不得进入 GitHub 或前端。源码校验、类型检查、构建、浏览器与上线必须分别记录，不跨版本继承通过状态。

## 第三步 交付至少一团实际网页增量

优先把 GENBLUE BlueCut v2.2 或 WOOAH editorial v1.2 中至少一个候选接入真实工程。按实际依赖与用户反馈选择先后，不停在检查或写文档。

- 保留已认可 Billlie、UDTT 4+1、YOUNG POSSE、i-dle，以及 GENBLUE/WOOAH 各自独立视觉，不套统一皮肤。GENBLUE 最新 Figma 变化已在 native v2.2 实现，不因旧 v0 包而重复重做。
- 补真实 catalog、稳定 ID、成员作品精确关联、既有记录入口和连续浏览路径；共享层只做必要小改，不另建评分或保存系统。
- 现有评分、备注、观看状态公开读，编辑仅 owner。不能修改用户已有值、冒充真实保存，或扩大访问范围。
- 页面覆盖首页、成员目录与详情、作品库、MV/舞台详情、评分或既有手帐、单轴只读最早优先时间轴及返回。
- 中文名默认可见；真实具名图片不拉伸、不猜人、不错配。缺图诚实保留，发行封面不能冒充 MV 或舞台图。
- 流程保持实看官网/Spotify/正式视觉 → Figma 原生实图设计与取稿 → React → 实际浏览器 QA → 用户人工验收。沿用已完成证据，不重复搬运素材。
- 检查 320/390/1440 真视口、2048/2560 大屏与 80%/100%/125% 缩放。受阻就记受阻，不能把缩放或窄容器当真视口通过。
- 如容量阻塞接入，先修旧 pruner 与 GENBLUE 仍用的 7 张 batch-b 图冲突，再验证完整 Sites TAR 上限 256 MiB 且至少留 2 MiB。不要关闭 guard 或删除原始素材。

交付真实可打开的预览地址、实际版本、四项验收状态和剩余事项。没有生产发布授权就先交预览；有明确授权后才按上线门槛继续。用户尚未认可的候选不标完成。

## 第四步 每次结束或换机前保存进度

- 每任务独立分支与 `docs/codex/worklogs/<task-id>.md`，先读活动分支/PR，避免不同电脑抢写同一共享文件。
- 小提交保存代码与对应 worklog，推送合规的 WIP，并明确未验项目；未验 WIP 不混入已验 main。推送前再次核对仓库可见性与数据授权，当前批准仅覆盖本次已有评分、备注、观看快照，不扩展到新增敏感数据或无关导出。
- worklog 写清实际 commit/分支、改动路径、依赖和素材、运行方法、已做测试及结果、受阻项、下一步、预览/上线/人工验收状态，不能只写“做完了”。
- `docs/codex/STATUS.md` 只维护已验基线、当前里程碑与任务索引；任务细节各写自己的 worklog，减少共同编辑冲突。
- 下一台电脑从 GitHub 的代码、STATUS、worklog、分支和 PR 恢复，不依赖上一台电脑的会话、临时目录或本地 LOCK。

结束汇报请给：实际网页结果、分支与 commit、预览链接、四项验收状态、GitHub 已保存的下一步，以及仍需用户决定的唯一必要问题。
