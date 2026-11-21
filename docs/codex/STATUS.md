# Idol Lens 当前状态

| 入口 | 当前可用版本 |
|---|---|
| 正式站 | v203，500 个舞台，29 张专项封面，106 个公开资料作品／546 槽。[发布回执](evidence/20261030-v203/release-publication.json) |
| GitHub 主线 | 已验收的 `0e77838a`。527 个舞台来源，31 张专项封面，108 个公开资料作品／557 槽。[版本与归档](evidence/20261121-repository-and-routes/github-consolidation.json) |
| 当前开发 | `codex/project-optimization-20261121`，已测应用 `f81dbefa`。17 团经视觉调整，IVE 恢复同期官网标志；NewJeans 等五团更新 22 张肖像。上一轮 23 团 121 支 MV 已更新 745 个认人位置。另有 527 个舞台来源、32 张专项封面、108 个公开资料作品／557 槽。[本轮实测与前后图](worklogs/20261121-artist-brand.md) · [工程路线图](PROJECT-AUDIT-AND-ROADMAP-20261121.md) |

## 内容与发布

- IVE 已把 2022 年 4 月日本官网白色图形标与韩国 STARSHIP 同期团照放上实页和 Figma，手机首页第一张成员照从第 952 像素提前到第 604 像素。NewJeans、ADYA、W!TCHX、GENBLUE、Rocket Punch 的 22 张默认目录图文件合计少 80.94%。51 团的背景、字体、页标按两宽逐屏留证；另有六份保留标志从官网取回，逐字节吻合。[本轮视觉实测](worklogs/20261121-artist-brand.md) · [一手设计资料与画板](evidence/20261121-artist-brand/sources.json)
- 上一轮默认展示的第三方具名 MV 截图由 1,226 个位置降至 508 个，IVE 从 77 降至 0。下批先补 i-dle，随后 Kep1er、XG、LOONA。[逐团余量](evidence/20261121-love-dive/media-measurement.json)

- 103 件作品对应 110 项待证事实。当前主动核验 10 项，等待新证据 81 项，取消必填 19 项。[逐项决定](evidence/20261121-repository-and-routes/content-disposition.json) · [原始审查](FEASIBILITY-REVIEW-20261101.md) · [定向研究](evidence/20261121-project-optimization/content-review.json)
- 开发版已补 QWER《SHOW DOWN》同视频第 14 秒的 1080p 封面，另有五首歌增加节目或表演资料。余下两张为 STAYC 日版《Teddy Bear》的已审区间和 IVE 日版《ELEVEN》的 P1 舞台画面。正式 v203 尚无批量 owner 核对工具，下一次发布另行授权并验收。[逐作品核验](evidence/20261121-repository-and-routes/content-followup.json) · [工具与时效](STAGE-OWNER-PREFLIGHT.md)
- 本地及 GitHub 托管的 Windows、Linux 均通过 `npm run verify`。全量 Node 测试在 Windows 有 197 项既有失败，Linux 有 193 项；两平台各修复 2 项、各新增 0 项，托管 Ubuntu 与本地 Linux 的失败逐项相同。51 团的首页与成员入口共 204 次浏览，另有 44 次成员原图及回焦实测。UDTT 公开降级态已验，受限原生成功态待核。[测试结果](evidence/20261121-artist-brand/tests.json) · [逐团检查](evidence/20261121-artist-brand/group-review.json) · [前轮 121 支 MV 浏览](evidence/20261121-love-dive/browser.json)
- 上轮工程优化的前后测量及平台差异见[实测报告](worklogs/20261121-project-optimization.md)。更早的状态、各团验收和回退说明见[历史全文](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/STATUS.md)。
