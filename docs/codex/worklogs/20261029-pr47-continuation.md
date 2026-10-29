# PR47 第二批逐团证据续作

- 日期：2026-10-29；执行环境：本机 Windows `E:\project\idol`，正式源码 `apps/idol-site/`。
- 用户决定：接 PR47 最新分支，逐团补缺，不重复已完成批次，无新证据继续保留；暂不部署，完成自主可做部分再请求帮助。
- 冻结开发基线：`b209073909b2f43254d836ffe139eba056582f09`，分支 `codex/group-evidence-followup-20261029`，包含 PR46／PR45 `dada774`／PR44；工作树开工干净，旧备份和 stash 未动。
- 远端与线上：显式 fetch 五个指定分支，PR44—47 均 draft/open/unmerged；仓库 public。正式 v201／既有部署 succeeded／访问 revision2 只读核实，未部署或保存新版本。
- 目标：45 团／161 分类项规范键对齐，原人工 CSV 与冻结队列不变；对有新依据的四个对象追加有限资料。完整事实关闭 0。

实际实现、来源和采用边界见 [报告](../pr47-continuation-20261029.md)。修改仅涉及三份应用数据：DOREMI 六人发行概念参考及既有原图、BEEP 日版待核观看线索、Password／Teddy Bear 日版两条节目档案说明。人物资料 104／537，通用回退 22／107；原 496 正式舞台、所有旧替代来源、51 团设计、私人关系／评分／备注／观看和权限保持。前批 MADEIN／Hey Gabby／ILLIT 不重做。

验证：47 项定向测试 45 通过、2 历史断言在 `b209073` 同样复现；新增 4 项通过，独立 31 项通过但与前者重叠。TypeScript 与正式构建通过。本地 9 布局／22 截图、12 次原图开关／12 次成员往返通过，使用公开目录合成夹具，私人写入 0；外链完整播放、音轨和真实 owner 保存没有验证。初次夹具／定位失败、模式校验修复及既有低对比度限制均留证，详见 `../evidence/20261029-pr47-continuation/validation.json` 与 `ui-continuation.json`。

HITGS 候选未达到同套与质量双条件，15 原件留本机 `E:\project\idol-local-backups\20261029-pr47-continuation\hitgs-candidates`；运行日志在该批次 `validation` 目录，QA 截图在相邻 `20261029-pr47-continuation-qa`，均不上传。生成 tsbuildinfo 单独备份后按基线字节恢复。浏览器／5189 QA 服务均已关闭。

交付：沿原 PR47 普通推送代码与本工作记录，推送后核远端 SHA 与 PR 状态，回执 `../evidence/20261029-pr47-continuation/github-delivery.json` 单独记录实现提交。未合并 main，不申请发布，不把 GitHub 回执当正式部署。

接续：优先 BEEP 日语整首起止／完整视频、两条日语节目完整官方片源、其余具名／统计／日期原始证据；没有新输入保持队列。正式来源换绑需新鲜 owner 空分、完整日志、线上原值另核。个人页统一排版仍待决定；其余权限与素材不扩围。
