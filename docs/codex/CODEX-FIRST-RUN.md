# Codex 首次执行文件

更新：2026-10-23 晚间。先读 [RESUME](RESUME.md)、[STATUS](STATUS.md) 和根 AGENTS，再按最新远端接续。

- 仓库：https://github.com/KAtOReNA7/idol
- **最新分支：`codex/izna-review-followup`**，基于 `codex/izna-native-integration` 的 `aa9e044`；不是旧main，也不是最初handoff。
- 正式目录：`apps/idol-site/`。必须取得完整工作树，专项测试需要handoffs/fixture。
- 当前：GENBLUE v10/WOOAH v12已确认；izna v15私有只读审阅已发布，四张已有精确视频图已接入作品库/播放器。52项测试、类型/正式构建通过，浏览器分步操作和320/390 iframe窄窗口通过。
- 待办：用户整团确认、11个精确视频预览、同MV成员图、Figma内页、当前版本真视口/原生缩放/线上浏览器、快速连续点击位置稳定性和真实保存。正式主站仍v186。
- **未获用户明确确认izna前，不开发ifeye或下一团，公共功能例外。**
- [最新worklog与发布证据](worklogs/20261023-izna-review-followup.md)。

新空目录：

```sh
git -c core.autocrlf=false clone --branch codex/izna-review-followup https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
git log -5 --oneline
```

已有工作树先保留改动、fetch、比较分支，不reset/clean/force push。按RESUME安装、运行和验证；Sites环境先读当前Sites技能，不复制旧机器凭证或依赖。

继续开发保护独立设计、原图、稳定ID、评分/备注/观看记录和owner-only写保护，不重复导入旧候选。每轮将代码、实测结果、阶段、阻塞和下一步同提交推送GitHub，供新电脑接续。
