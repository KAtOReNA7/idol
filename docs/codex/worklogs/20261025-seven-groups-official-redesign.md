# 七团官方参考重设计

## 最新执行决定：七团参考已确认，依次重做并统一交审（2026-10-25）

用户已批准参考清单，要求依次重做 MADEIN → QWER → PURPLE KISS → IVE → tripleS → RESCENE → ILLIT，弃用七团旧视觉与布局，全部完成后统一提供链接审核，不逐团等待。保留核实资料、原图、稳定 ID、个人记录及权限；其余 44 团设计保护。同步七团索引及手帐视觉，主站 v186 不覆盖。

实现分支 `codex/seven-groups-official-redesign`，冻结基线 `c578183e608c01eb797da0591bf75e7b3b0ea98e`；已批准依据见 `docs/codex/seven-groups-design-references-20261025.md`，执行记录 `docs/codex/worklogs/20261025-seven-groups-official-redesign.md`。下方“参考待确认”及逐团门槛为历史。当前为实现中，尚未发布重做版本。

## 范围与环境

正式源 apps/idol-site；本机 Windows Chrome/Playwright 验证（Browser plugin not available），发布到现有 owner-private 全团审阅站。旧组件布局不作为实现模板，复用稳定数据与权限/路由业务。Sites 技能允许有界素材研究，三个子代理仅负责下载原字节公开素材，页面由主代理顺序实现。

## 进展

- 已 fetch，基线与远端一致，原工作树干净。
- 已读取官方参考证据和项目要求，确认七团顺序与统一交审授权。
- 已确认审阅站 owner-private 并使用 source helper 打开源 checkout。
- 实现与验证尚在进行。

### 首轮实现进展

全新七团独立视觉结构与内页已编写；依次接入 MADEIN、QWER、PURPLE KISS、IVE、tripleS，再推进 RESCENE、ILLIT。MADEIN/QWER/PURPLE KISS/IVE 1440、390 两宽首页、成员/作品/时间轴、个人页与原图/返回首轮通过（每团10项）。正在更换手帐视觉和七团索引，不将首次通过扩大为最终整站通过。公开素材由三个有界素材任务补齐，源 URL/SHA/身份依据写入各团 manifest。
