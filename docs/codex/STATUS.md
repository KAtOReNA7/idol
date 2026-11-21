# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v203，500 个舞台，29 张专项封面，106 个公开资料作品／546 槽。[发布回执](evidence/20261030-v203/release-publication.json) |
| GitHub 主线 | 已验收的 `0e77838a`。527 个舞台来源，31 张专项封面，108 个公开资料作品／557 槽。[版本与归档](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`，已测应用 `eebbca8c`。527 个舞台来源，32 张专项封面，108 个公开资料作品／557 槽。[本轮开发与测试](worklogs/20261121-repository-and-routes.md) · [工程路线图](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 内容与发布

- 103 件作品对应 110 项待证事实。当前主动核验 10 项，等待新证据 81 项，取消必填 19 项。[逐项决定](evidence/20261121-repository-and-routes/content-disposition.json) · [原始审查](FEASIBILITY-REVIEW-20261101.md) · [定向研究](evidence/20261121-project-optimization/content-review.json)
- 开发版已补 QWER《SHOW DOWN》同视频第 14 秒的 1080p 封面，另有五首歌增加节目或表演资料。余下两张为 STAYC 日版《Teddy Bear》的已审区间和 IVE 日版《ELEVEN》的 P1 舞台画面。正式 v203 尚无批量 owner 核对工具，下一次发布另行授权并验收。[逐作品核验](evidence/20261121-repository-and-routes/content-followup.json) · [工具与时效](STAGE-OWNER-PREFLIGHT.md)
- 本地和 GitHub 托管的 Windows、Linux 均通过 `npm run verify`。完整主套在本地 Windows 还有 199 项失败，Linux 还有 195 项，与已验收主线按同平台、同名用例比较，新增失败各为 0。托管 Ubuntu 的 195 个失败名称与本机 WSL 一致。手机与桌面的 102 个团页入口、作品库三档宽度均通过。[测试清单](evidence/20261121-repository-and-routes/validation.json) · [浏览器与传输](evidence/20261121-repository-and-routes/browser-and-transfer.json) · [托管复验](evidence/20261121-repository-and-routes/github-delivery.json)
- 上轮工程优化的前后测量及平台差异见[实测报告](worklogs/20261121-project-optimization.md)。更早的状态、各团验收和回退说明见[历史全文](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)。
