# Codex 首次执行文件

更新：2026-10-24。先读[RESUME](RESUME.md)，再读根AGENTS、STATUS、PRD和验收文档。

- 仓库 `KAtOReNA7/idol`；当前分支 `codex/bewave-review-completion`，正式工程 `apps/idol-site/`。
- YOUNG POSSE v21及此前页面已确认。BEWAVE已实现并验证，上传连接已恢复，v22 owner-private 审阅已发布；等待本团人工确认，不开始Candy Shop，公共功能例外。
- 115专项/回归、类型、正式构建、34交互、3失败恢复和35真视口页面通过。13项旧超时测试框架失败基线可重现；完整Figma/真实保存/播放/缩放/线上浏览器仍待验，见[日志](worklogs/20261024-bewave-review-completion.md)。
- 保留原图、稳定ID、用户记录与owner-only边界。主站仍v186；不merge main。
- 先显式fetch目标分支再比较，不reset/clean/force push；当前origin可能仅有旧分支refspec。
- 每轮代码、worklog与证据一起推送，不把本地结果或上传失败记为线上完成。
