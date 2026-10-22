# vcha · 公开内容恢复增量 v2

沿用上一版独立布局和素材。本增量只恢复公开数据与实际页面呈现、修正作品返回及版本入口，不重新采图、不写生产或私人状态。

| 恢复范围 | 实际数量 |
|---|---:|
| 成员完整公开行与个人履历 | 6 |
| 原始成员经历段 | 10 |
| 原始 ready 事件 | 9 |
| 单根从远到近日期轴 | 8 |
| 轴外可读无日期公告 | 1 |
| 原有 MV—舞台真实父作品对 | 4 |

`reconciliation.js` 接入原始公开输入，`shared/reconcile.js` 由根项目维护。成员 `publicBaseline`、`careerPeriods`、`careerSources` 与事件 `canonicalEvent` 原样保留；原版成员与时间轴保存在 `previousPublicMember`、`previousTimeline`。本团 `sourceTimeline`、`sourceTimelineGaps` 保留完整原始记录及内部缺口。确切事件ID及日期对应见 `event-preservation-map.json`。

个人页实际展示个人正文、公开角色、公开状态、历史成员语义和每段经历的来源。空结束日期不擅自解释为“至今”；经历公告日、生效日及原始事件标签分别显示。

时间轴主排序取原始事件日，缺事件日才取公告日，绝不使用计划日代替。未定日期公告保留在轴外可读区。`public-copy.js` 只提供前台简短正文，不覆盖原始 `summary`；页面不展示内部复核话术。公告与计划日期、月精度保留区分。

作品筛选进入详情及显式返回保留本团完整 URLSearchParams，含未知字段与重复参数；不新增保存系统。`video-relations.js` 仅允许 MV 与舞台通过已知生产 `rec…` 父作品ID精确关联：MV `id/workId` 对应舞台 `parentWorkId/workId/sourceWorkId/parentWorkIds`。空值、候选键、同名、日期、videoId、舞台自身实体ID及发行记录均不能推断版本关系；原始作品与视频绑定未改。

验证命令：在源码根运行 `node --test groups/billlie/reconciliation.test.mjs`。2026-10-20实际执行28项，28通过、0失败、0跳过；覆盖三团独立原始输入深比较、全部个人页履历与来源渲染、40条原始ready事件及5条无日期公告、筛选/详情/返回与submit处理器、24个既有视频对及无绑定负例。测试中的合成无绑定记录仅在进程内临时加入并finally移除，不落入素材或生产数据。

数据与 assets 文件逐字节对比上一版结果见 Billlie 目录 `reconciliation-validation.json`。本轮没有浏览器点击、1440/390/320实际视觉、宽屏或缩放验收，也没有Figma落地验收；Node渲染与处理器测试不能替代这些检查。原包尚存的视频配图、候选发行ID等素材缺项继续沿用，不新增推定关系。dot负责生产接入与最终审核。
