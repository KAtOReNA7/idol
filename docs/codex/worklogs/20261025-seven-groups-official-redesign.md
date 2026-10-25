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

### 七团代码完成，发布准备中

七团已全部接入全新 `components/seven-redesign` 渲染器，七个旧团页组件不再渲染。首页按批准的官网/官方专辑摄影分别重写，成员/发行/影像/时间轴/详情及七团索引同步，七团手帐 CSS 重写。复用公开资料、稳定 ID、路由、原图恢复、播放器、编辑器与权限业务；共享手帐的业务 DOM 保留，不称七团官网逐像素复刻。ILLIT 使用 Pixelify Sans 延展官方像素语言，并非官网同字体。

- MADEIN 当前官网四人首页摄影与六张 LOVE, AFRAID 具名单人照分开说明，保留 GAEUN 历史档案。
- QWER 保留四人真实乐器摄影；日本官网仅提供 SHOW DOWN 发行条目，不宣称韩国唱片目录完整。
- PURPLE KISS 采用 HIDE & SEEK 七人时期官方团照，个人照沿用具名档案来源；不按未具名概念照猜身份。
- IVE 使用 I’VE MINE 官方摄影与六人具名花絮照；tripleS 官网24人照按明确 S 编号/成员 ID 绑定；RESCENE 单人照沿用具名 Kitto 原图；ILLIT 单人照为具名 SUPER ME 官方概念照。

已通过 28 项专项/回归测试、TypeScript 与正式构建。最终本地 Chrome 验证：七团各10类页面 × 320/390/768/1024/1440 共350项布局，以及92项交互；44团桌面/手机首页88项回归；索引5宽、51卡片及7个新入口。审阅无写请求。浏览器插件不存在，采用本机 Playwright；不是生产保存/完整视频播放或原生缩放通过。

检查中修复：QWER 320px 发行标题溢出；PURPLE KISS 历史成员手帐未继承主题（仅在合法返回路径和当前/曾属团体关联匹配时生效）；相关平板手帐页头；索引768px页头溢出；ILLIT索引及手帐残留旧字体；PURPLE KISS首页阵容说明与新团照不一致。

Figma 新页 `1266:1095` 正在同步112个可编辑画板及261个原图/矢量组件，旧七团画板不作为新版本通过。259张原字节位图上传成功，2个SVG以可编辑矢量导入；首批 MADEIN 画板已实际截图并修复页头图层。完整同步与最终交付记录待补。自动 capture 仍 pending，使用官方资产上传与原生节点完成，不降低网页的只读网络边界。

发布准备尚在进行，不能使用旧统一审阅v2作为本次七团新设计链接。正式主站v186保持。
