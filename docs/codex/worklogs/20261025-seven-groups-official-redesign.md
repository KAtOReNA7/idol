# 七团官方参考重设计

## 最新交付：七团重设计v3已发布，等待统一验收（2026-10-25）

用户已批准参考清单，要求依次重做 MADEIN → QWER → PURPLE KISS → IVE → tripleS → RESCENE → ILLIT，弃用七团旧视觉与布局，全部完成后统一提供链接审核，不逐团等待。保留核实资料、原图、稳定 ID、个人记录及权限；其余 44 团设计保护。同步七团索引及手帐视觉，主站 v186 不覆盖。

七团全新网页、索引入口及手帐视觉已完成，统一 **v3 owner-private 只读审阅已发布，等待用户统一验收**：[团体索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups)。七团旧页面组件不再渲染；核实资料、稳定 ID、原图和共享手帐业务 DOM、播放器、编辑器与权限逻辑保留，视觉重新设计，不称官网逐像素复刻。其余44团页面与正式主站v186保持。

实现分支 `codex/seven-groups-official-redesign`，冻结基线 `c578183e608c01eb797da0591bf75e7b3b0ea98e`，发布网页固定代码 `4cd279717a25938bedeb543a145204d25e3fa95f`。28专项/回归、类型、正式构建、350项五宽布局、92交互、其余44团88项首页回归通过；线上服务身份Chrome的42项页面、14项手帐往返及51卡片索引通过，非用户IAB完整会话。Figma已同步112个可编辑画板及261原图/矢量组件，完整字体与像素保真未验。真实生产保存、全视频播放、80%/125%原生缩放以及既有资料缺口未关闭。

七团链接、来源差异、已解决/未解决问题见 `docs/codex/seven-groups-redesign-review-20261025.md`；可读验证摘要及Figma节点映射见 `docs/codex/seven-groups-redesign-verification-20261025.json`；过程见 `docs/codex/worklogs/20261025-seven-groups-official-redesign.md`。下方逐团门槛、参考待确认与实现中状态均为历史；不因技术检查通过自动登记七团设计获用户认可。

## 范围与环境

正式源 apps/idol-site；本机 Windows Chrome/Playwright 验证（Browser plugin not available），发布到现有 owner-private 全团审阅站。旧组件布局不作为实现模板，复用稳定数据与权限/路由业务。Sites 技能允许有界素材研究，三个子代理仅负责下载原字节公开素材，页面由主代理顺序实现。

## 历史过程记录（当前交付以上方及下方最终记录为准）

- 已 fetch，基线与远端一致，原工作树干净。
- 已读取官方参考证据和项目要求，确认七团顺序与统一交审授权。
- 已确认审阅站 owner-private 并使用 source helper 打开源 checkout。
- 实现与验证尚在进行。

### 历史：首轮实现进展

全新七团独立视觉结构与内页已编写；依次接入 MADEIN、QWER、PURPLE KISS、IVE、tripleS，再推进 RESCENE、ILLIT。MADEIN/QWER/PURPLE KISS/IVE 1440、390 两宽首页、成员/作品/时间轴、个人页与原图/返回首轮通过（每团10项）。正在更换手帐视觉和七团索引，不将首次通过扩大为最终整站通过。公开素材由三个有界素材任务补齐，源 URL/SHA/身份依据写入各团 manifest。

### 历史：七团代码完成，发布准备中

七团已全部接入全新 `components/seven-redesign` 渲染器，七个旧团页组件不再渲染。首页按批准的官网/官方专辑摄影分别重写，成员/发行/影像/时间轴/详情及七团索引同步，七团手帐 CSS 重写。复用公开资料、稳定 ID、路由、原图恢复、播放器、编辑器与权限业务；共享手帐的业务 DOM 保留，不称七团官网逐像素复刻。ILLIT 使用 Pixelify Sans 延展官方像素语言，并非官网同字体。

- MADEIN 当前官网四人首页摄影与六张 LOVE, AFRAID 具名单人照分开说明，保留 GAEUN 历史档案。
- QWER 保留四人真实乐器摄影；日本官网仅提供 SHOW DOWN 发行条目，不宣称韩国唱片目录完整。
- PURPLE KISS 采用 HIDE & SEEK 七人时期官方团照，个人照沿用具名档案来源；不按未具名概念照猜身份。
- IVE 使用 I’VE MINE 官方摄影与六人具名花絮照；tripleS 官网24人照按明确 S 编号/成员 ID 绑定；RESCENE 单人照沿用具名 Kitto 原图；ILLIT 单人照为具名 SUPER ME 官方概念照。

已通过 28 项专项/回归测试、TypeScript 与正式构建。最终本地 Chrome 验证：七团各10类页面 × 320/390/768/1024/1440 共350项布局，以及92项交互；44团桌面/手机首页88项回归；索引5宽、51卡片及7个新入口。审阅无写请求。浏览器插件不存在，采用本机 Playwright；不是生产保存/完整视频播放或原生缩放通过。

检查中修复：QWER 320px 发行标题溢出；PURPLE KISS 历史成员手帐未继承主题（仅在合法返回路径和当前/曾属团体关联匹配时生效）；相关平板手帐页头；索引768px页头溢出；ILLIT索引及手帐残留旧字体；PURPLE KISS首页阵容说明与新团照不一致。

Figma 新页 `1266:1095` 正在同步112个可编辑画板及261个原图/矢量组件，旧七团画板不作为新版本通过。259张原字节位图上传成功，2个SVG以可编辑矢量导入；首批 MADEIN 画板已实际截图并修复页头图层。完整同步与最终交付记录待补。自动 capture 仍 pending，使用官方资产上传与原生节点完成，不降低网页的只读网络边界。

发布准备尚在进行，不能使用旧统一审阅v2作为本次七团新设计链接。正式主站v186保持。

## 最终交付：v3已发布，等待统一验收

上述发布准备与Figma同步中状态现已完成。网页源提交 `4cd279717a25938bedeb543a145204d25e3fa95f` 已推送；固定该提交构建公开原字节资源映射后，42项发布模式页面、14项手帐往返及索引通过。

draft [PR #34](https://github.com/KAtOReNA7/idol/pull/34) 已创建并附加当前任务；base为 `codex/seven-groups-design-references`，与冻结基线一致，未合并main。收尾前再次fetch并核对当前远端HEAD一致，保留跨电脑接续入口。公开仓库可见性已核对；最终文档只保存公开来源、计数与设计节点，无服务凭证或新个人数据。

统一审阅站已发布 **v3**，Sites源码提交 `d3b7977f9a2bbf189c663abc9fa353929d250ac0`，版本ID `appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_8a78503752b08191868ebb46a14bc8ef`，部署 `appgdep_6add7ea2c03481919456107de23d9afa` 状态 `succeeded`。归档17,448,960 bytes / 170 files，SHA256 `56040f25316e1829be237c4f846ced78d4231c623d907e200ca7389c38175927`。项目保持owner-private，只允许owner，无新增用户或组。旧统一站v2的dist已保留本地备份，其他审阅站与正式主站v186未动。

实际线上服务身份Chrome验证42项页面、14项成员手帐往返及51卡片/七新入口通过，无破图、横向溢出或JS异常。该服务身份测试不等同用户IAB；索引已通过open_in_codex请求打开（queued），不能据此记为用户完整会话通过。

Figma新页 `1266:1095` 已完成112个原生可编辑画板（七团×八视图×1440/390）、261个原图/矢量组件（259位图原字节上传、2个SVG原生导入），共11491个文字节点及805图片实例，全部画板有内容。七团关键首屏实际截图检查，MADEIN页头层级、PURPLE KISS照片边距、ILLIT星点与阴影已修复并查看。Hammersmith One与Pixelify Sans可用，Arial/Impact等替换为Roboto/Anton；完整字体/旋转/装饰/像素保真未验。自动capture仍pending，不作为完成依据。修改scratch fetch例外并启动隐藏Chrome的替代路径曾被自动审核拒绝（仅返回blocked by policy），未执行；已通过官方原图上传及原生节点安全完成同一同步目标，不再尝试该路径。

最终问题清单、七团链接、来源/复用差异与分层验证见 [统一交审报告](../seven-groups-redesign-review-20261025.md)，可移交验证摘要和全部Figma节点映射见 [验证JSON](../seven-groups-redesign-verification-20261025.json)。历史133作品关系、14 hold事件、HURRICANE精确视频与本轮资料局限仍保留；真实生产保存、全视频播放、原生缩放和用户IAB完整会话未验。等待用户统一审核实际网页，不继续扩大重做范围。

当前机器证据目录：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/seven-redesign/`。最终包`review-final/`、发布固定ref包`review-public/`、线上结果`online-v3-checks.json`、设计稿节点`figma-final-audit.json`；测试/类型/构建日志为`tests-final.txt`、`types-final.txt`、`build-final.txt`。这些scratch文件不构成其他电脑的运行依赖；源码、原图manifest、交审报告和精简验证摘要已纳入分支。不要重新运行Figma批次导入，避免重复已完成画板。
