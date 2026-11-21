# 项目协作入口

正式工程在 `apps/idol-site/`，根目录另有独立的历史 Next 沙盒。开工先看[当前状态](docs/codex/STATUS.md)、[开发顺序](docs/codex/PROJECT-AUDIT-AND-ROADMAP-20261121.md)及对应 worklog。

## 版本与协作

- GitHub 的 `main` 指向用户验收的版本。进行中的工作在 `codex/project-optimization-20261121`；先检查工作树、fetch 远端、对比提交，再接续。仓库含其他电脑的改动、本机 stash 和私人备份，保留各自的历史。分叉时比较有效差异，禁止强推或用 reset、clean 丢弃修改。
- 代码、验证结果与 `docs/codex/worklogs/` 同步交付，推送后从远端读回提交。历史分支、PR 和恢复入口见[整理回执](docs/codex/evidence/20261121-repository-and-routes/github-consolidation.json)。发布正式站需要用户当次授权。
- 详细的历史决策与逐团原文固定于[已验收提交中的协作记录](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/AGENTS.md)。多机协作细则见[协作手册](docs/codex/AGENTS-MULTI-MACHINE.md)。

## 产品与数据

- 保留 51 团各自获准的设计与原图、稳定作品和成员 ID、历史成员、关系、个人评分、备注与观看状态。成员页沿用已批准的模块顺序。[成员页验收](docs/codex/member-layout-implementation-20261030.md)
- 私人保存和导出沿用 owner 鉴权。仓库公开权限仅覆盖此前获准的内容。新私人导出、凭证和本机备份只保存在仓库外。
- 新舞台先集中准备，每批 1–5 项。核真实 owner 身份、目标空分、完整保存日志、线上前像及来源身份。0 是有效评分。严格替换限 300 秒，新增限 900 秒；保留旧来源及绑定历史。已确认的看片与旧批次按回执接续。[保护与导入协议](docs/codex/STAGE-OWNER-PREFLIGHT.md)
- 来源优先打歌节目和练习室，同曲后备按获准范围明示版本或节选。作品、视频、分 P、区间和出镜证据须匹配。公开认人参考与私人关系分开。统计未知值、展示用 0 和实际生效日期沿用原语义。
- 研究按[已采纳的逐项处置](docs/codex/evidence/20261121-repository-and-routes/content-disposition.json)执行。10 项定向核验，81 项有新证据时重开，19 项取消必填。新事实单独留证。统计与日期已收口；tripleS 使用截至 2026-06 的 Circle Album 下界 2,118,570+。

## 验证与交付

在正式工程运行 `npm run verify` 和 `npm test`。分别记录单测、生产构建、素材、浏览器与线上结果。比较同平台、同输入的前后结果，注明实际浏览宽度、数据来源和待核范围。[运行说明](apps/idol-site/README.md)

原件投递依赖固定提交 `b8eac29b77eebf12103f0f5174d41c73744a3ba3` 的 5,418 条路径。保留该提交可达及原字节。UDTT 受限原件沿用精确素材校验和投递范围。候选包先核验来源、适用版本和调用方。历史失败、人工确认和发布回执保留其原始语境。
