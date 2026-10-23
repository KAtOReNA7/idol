# Codex 首次执行文件

更新：2026-10-23。**先读取 [新电脑接续文档 RESUME](RESUME.md)**，再按 [STATUS](STATUS.md) 和活动PR接续。

- 仓库：https://github.com/KAtOReNA7/idol
- 当前完整接续分支：`codex/izna-native-integration` 最新远端HEAD；实现提交 `c998df46a6cd258c11cbbf7a6fb7642a2bacee3b` 已推送并读回，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 以WOOAH分支为基线。详细记录见 [本轮工作日志](worklogs/20261023-izna-native-integration.md)。
- 来源：`handoff/codex-20261022` → GENBLUE任务分支 → WOOAH任务分支（`121f410`，PR #5）→ izna任务分支。最初handoff不会自动获得后续增量；旧main仍是sandbox。
- 正式工程只在 `apps/idol-site/`。必须克隆完整仓库，包含专项测试需要的handoffs/fixture。
- GENBLUE v10、WOOAH v12页面已获用户确认，继续保护；izna原生集成已实现、待用户审阅。
- izna [只读、owner-private审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) 已发布v13，等待用户确认，线上浏览器未复验。发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`。
- **izna未获明确用户确认前不得开发ifeye或下一团**，公共功能除外。Figma实际图片落地、11个精确视频预览、80%/125%原生浏览器缩放、真实保存和主站全量发布仍未完成。

新空目录检出：

```sh
git -c core.autocrlf=false clone --branch codex/izna-native-integration https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git log -5 --oneline
```

已有工作树先保留改动、fetch、检查远端和PR，不能reset/clean/force push。阅读顺序：RESUME、根AGENTS、STATUS、PRD、设计/协作要求、ACCEPTANCE和最新worklog。安装、运行、验证、Sites身份及剩余事项均以RESUME的实际入口执行，不复制旧电脑临时目录或凭证。

继续开发应保护已认可设计、原图、稳定ID、评分/备注/观看记录与现有owner-only保存，不重复导入已接入的旧候选，不以文档和测试数量代替网页增量。每轮结束代码与worklog同提交，push后核对远端SHA，供下一台电脑继续。
