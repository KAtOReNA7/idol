# Codex 首次执行文件

更新：2026-10-23 晚间。先读 [RESUME](RESUME.md)、[STATUS](STATUS.md) 和根AGENTS，再按最新远端接续。

- 仓库：https://github.com/KAtOReNA7/idol
- **最新分支：`codex/ifeye-native-integration`**，基于 `codex/izna-review-followup` 的 `665fed5`；不是旧main或最初handoff。
- 正式目录：`apps/idol-site/`。取得完整仓库，专项测试需要handoffs/fixture。
- 当前：GENBLUE v10/WOOAH v12/izna v15页面已确认；**ifeye v16已发布，等待人工验收**。6成员、3发行、7影像、10原图及既有手帐往返已接入。
- 58项针对性测试、类型与正式构建通过；实际桌面浏览器/五宽iframe检查已记录。完整生产剪枝仍被旧izna引用阻断；旧ifeye审计fixture35过3失败，未执行剪枝apply。
- ifeye仍缺7个精确视频预览、Figma实图/内页闭环、顶层目标视口/原生缩放/线上浏览器/真实保存验收。正式主站仍v186。
- **未获用户明确确认ifeye前，不开发下一团，公共功能例外。**
- 本轮draft [PR #8](https://github.com/KAtOReNA7/idol/pull/8)以 `codex/izna-review-followup` 为base，未合并main。
- [最新worklog与发布证据](worklogs/20261023-ifeye-native-integration.md)。

新空目录：

```sh
git -c core.autocrlf=false clone --branch codex/ifeye-native-integration https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git log -5 --oneline
```

已有工作树保留改动、fetch、比较后再接续，不reset/clean/force push。按RESUME安装与运行；Sites环境先读当前技能，不复制旧机器凭证或依赖。每轮将代码、实测、阶段和下一步同提交推送GitHub，保护独立设计、原图、稳定ID、评分/备注/观看状态与owner-only写保护。
