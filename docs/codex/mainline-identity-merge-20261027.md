# 认人图完成成果合入main（2026-10-27）

用户确认本轮成果并明确要求合并主线。[PR43](https://github.com/KAtOReNA7/idol/pull/43) 已成功合并，GitHub读回状态merged，时间2026-10-27 18:44:04（北京时间）。后续开发只从显式fetch后的最新origin/main新建codex/任务分支。

## 合并证据

- 合并前main：`c15995737b58c67a25edff2da5ebbdc7b1cd2c93`。
- 已验证任务HEAD：`47060f6d98697bed5820540ce0f4f01b15eb5b97`，本地与远端一致、工作树干净。
- 普通merge提交：`cde017d9d2ad355a287dcdd1e099f6e59c556e12`；调用时固定expected head，保留所有提交及不可变图片引用。
- 合并前后全仓树相同：`aa54968d4acdabdd4620dbeed661d66295df656e`。
- 正式apps/idol-site子树相同：`6e37250fff77b21be48b95702726cde24615babb`。
- 实现HEAD及固定原件ref7ee8a2d均为新main祖先，未删除分支、未reset/clean/强推。

GitHub合并前为CLEAN/MERGEABLE，当前HEAD没有check结果，不能称CI通过。应用代码没有新增变化，沿用本轮54专项、类型、正式构建和线上复验证据，不为文档合并重复构建或扩大验收声明。合并后仅更新协作入口、跨电脑指令和本回执；这些文档也进入main，以远端最新HEAD为接续点。

## 成果及边界

当前2828认人绑定、472作品、49团、628封面，现有关系缺图0、旧低清0，原871全部解决。A–Y补图和Z提质已执行，禁止重复。26团成员页已接入公共认人图，51团设计、稳定ID/关系、个人数据及权限边界保持。

18项未知统计与133个无既有成员关系作品仍开放，不推定全员；个人页统一排版待用户另行决定。真实私人保存、全视频播放、原生缩放、用户IAB和新Figma未验。生产作品页曾有1条未归因console404，受检图与原图流程通过，后续成员/索引补验未复现，原记录保留。

## 正式站单独记录

正式站https://idol-lens-private.wuke40758.chatgpt.site/保持本轮成功发布的v191，源5644d219a4226d32fbb3d14a05033e3808f5692b，部署appgdep_6ae07a8904008191b8de2068c80af476。本次主线合并及文档补记没有新部署，不能将Git合并登记为新站点版本。

完整核对见[JSON证据](reports/20261027-quality-z/mainline-merge-verification.json)；下一台电脑直接使用[NEXT-COMPUTER-HANDOFF](NEXT-COMPUTER-HANDOFF.md)末尾复制指令。20261026主线整理为历史背景，后续不再合入PR43、旧逐团或辅助资产分支。
