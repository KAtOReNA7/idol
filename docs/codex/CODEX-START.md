# Codex 开发入口

当前入口已更新为 [RESUME：新电脑接续](RESUME.md)，简短首次执行指引见 [CODEX-FIRST-RUN](CODEX-FIRST-RUN.md)。当前完整分支是 `codex/izna-native-integration`，来源为 `codex/wooah-native-integration` 的 `121f410`；正式目录 `apps/idol-site/`，根main仍是旧沙箱。

2026-10-22首轮“至少接入GENBLUE/WOOAH之一”的任务已完成。用户已确认GENBLUE v10与WOOAH v12页面；不重复接入，不用旧候选覆盖后续修正。旧的2–3团并行交付安排已被逐团人工确认规则取代。

当前第三团 [izna只读、owner-private审阅页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html) 已发布v13，等待用户确认，线上浏览器未复验；GitHub实现已推送，draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6) 以WOOAH分支为基线。发布与验证证据见 `docs/codex/worklogs/20261023-izna-native-integration.md`。**未获明确用户确认前不得开发ifeye或下一团**，公共功能除外；Figma实际图片落地、11个精确视频预览、80%/125%原生浏览器缩放、真实保存和主站全量发布仍未完成。

开始任务先读根AGENTS、RESUME、STATUS、PRD、设计要求与协作手册、ACCEPTANCE，再核对最新远端/PR和实际输入。用户的最新决定优先；未验的浏览器、真实保存、容量与生产发布保持未验。

每次仅选择一团做实际网页增量，给出地址等待明确确认，再开始下一团；公共工作例外。共享模块避免抢写，代码与进度通过GitHub独立分支/PR保存。没有当前生产发布授权就不覆盖主站，已有授权按对应范围执行。
