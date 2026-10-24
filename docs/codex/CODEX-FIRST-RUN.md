# Codex 首次执行文件

## 最新执行决定：VCHA 新审阅站 v1 待确认（2026-10-24）

用户“同意，继续开发”已确认 KATSEYE v33。本轮 VCHA 已发布到新的 **owner-private 只读审阅站 v1**：六历史成员、四张VCHA发行、四条既有作品/八影像槽、六既有关系、九事件及手帐往返。旧站v33容量只余955,546 bytes，新站不压缩原图、不修改旧页面。正式主站仍v186。

弃用旧VCHA米色档案视觉，以实际查看的环球《Only One》官方发行艺术重写白底品红团页。旧VCHA域名现跳转JYP总站，GIRLSET域名现跳转官方商店；不能称VCHA官网复刻。复用六人历史照片、既有ID/资料、TRACER v30至KATSEYE v33导航/原图/只读机制及共享手帐布局；共享手帐改配色，交审明确披露。

31专项/回归、类型、正式构建、45项五宽布局与28交互通过。27个可编辑Figma画板、7个不同关键节点实际取稿；修复时间轴文字重叠，完整字体/装饰/像素保真待完善。线上部署成功、IAB标签可见但读取40秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/vcha-review-completion`，基线 `2870eb1589df4b51ae2163e4b52fcdc8f9cc371c`；正式工程 `apps/idol-site/`。原图、稳定ID、评分、备注、观看状态与权限保持。[打开VCHA新站v1](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/vcha/index.html)。详见 `docs/codex/worklogs/20261024-vcha-review-completion.md`。

**等待 VCHA 网页确认后再开始 HITGS 或下一团，公共功能例外。下方旧门槛均为历史。**

## 必须先读

先读 [RESUME](RESUME.md)、根AGENTS、[STATUS](STATUS.md)、[PRD](PRD.md)、[CURRENT-STATE](CURRENT-STATE.md)、[ACCEPTANCE](ACCEPTANCE.md)、设计要求和协作手册，再核对源码与实际输入。

- 活动分支 `codex/vcha-review-completion`；正式工程 `apps/idol-site/`，根Next sandbox不是生产基线。
- KATSEYE v33及此前页面已确认，当前仅等待VCHA新站v1网页确认。主站仍v186，没有合并main。
- 本地Windows开发，localhost只代表本机。GitHub是跨电脑接续入口；显式fetch活动分支，保留工作树改动和双方有效提交。
- 原图、稳定ID、评分、备注、观看状态和权限保持；公开仓库分享授权不扩展到新私人数据或秘密。
- 代码、worklog、公开验证证据共同提交推送。设计、资料、功能、上线分层验收；沿用设计必须在交审中披露版本、范围、官网及差异。
- 新站/旧站ID与容量原因、依赖/运行/验证命令、Figma和待验项见 [VCHA交接](worklogs/20261024-vcha-review-completion.md)。
