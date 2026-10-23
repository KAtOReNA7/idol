# Codex 首次执行文件

更新：2026-10-24。先读[RESUME](RESUME.md)，再读根AGENTS、STATUS、PRD和验收文档。

- 仓库 `KAtOReNA7/idol`；最新分支 `codex/youngposse-review-completion`。
- 正式工程 `apps/idol-site/`，不是根Next sandbox；运行与验证见RESUME。
- 前八团含VVUP v20页面已确认；YOUNG POSSE v21已发布，等人工确认后再开发下一团，公共功能例外。
- 138测试、类型、正式构建、28交互/3失败恢复和35真视口页面通过。完整设计/资料/真实保存/播放/缩放/线上浏览器边界见[日志](worklogs/20261024-youngposse-review-completion.md)，主站仍v186。
- 保留原图、稳定ID、用户记录与owner-only边界；先fetch比较，不reset/clean/force push。
- 当前origin可能只有单分支fetch refspec；按RESUME显式fetch目标分支，不把缺远端跟踪引用误报为远端分支不存在。
- 每轮代码、worklog与证据一起推送，不把本地未推或未验记为共享完成。
