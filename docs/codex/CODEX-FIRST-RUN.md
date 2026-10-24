# Codex 首次执行文件

## 最新执行决定：HITGS 新审阅站 v2 待确认（2026-10-24）

用户“同意，继续开发”已确认 VCHA 新站 v1。本轮 HITGS 已发布同站 **v2 owner-private 只读审阅**：五成员、七发行/16曲目、八已有具名作品/13影像槽（8MV、5舞台）、五既有关系、七事件与手帐精确往返。28个既有非root文件SHA保持，root仅新增入口；旧站v33和正式主站v186未改。

弃用旧黄绿拼贴视觉，根据实际查看的 [Genie 官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15198)重写浅蓝深蓝页面。三个官方站入口均遇证书警告，未绕过，**不是官网复刻**。五成员照片为Kprofiles具名转载；七封面取Bugs原字节。沿用VCHA新站v1路由/公开投影、TRACER至VCHA原图/恢复/只读机制与共享手帐布局，共享手帐换色，交审必须披露。

22专项/回归、类型、正式构建、45项五宽真实视口布局、31交互通过。Figma已建21个可编辑画板并修复导航圆角/时间轴排布；两张大封面导入不完整，6个发行目录/详情画板及完整字体/像素保真仍待完成。线上部署成功，IAB导航/读取40秒超时；线上完整交互、真实保存/播放、80%/125%原生缩放未验。

分支 `codex/hitgs-review-completion`，基线 `9670b97ee1a33af09fe6cabdaf5d72c1839dff42`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开HITGS v2](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/hitgs/index.html)。详见 `docs/codex/worklogs/20261024-hitgs-review-completion.md`。

**等待 HITGS 网页确认后再开始 AtHeart 或下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：VCHA 新审阅站 v1（已确认，2026-10-24）

用户“同意，继续开发”已确认 KATSEYE v33。本轮 VCHA 已发布到新的 **owner-private 只读审阅站 v1**：六历史成员、四张VCHA发行、四条既有作品/八影像槽、六既有关系、九事件及手帐往返。旧站v33容量只余955,546 bytes，新站不压缩原图、不修改旧页面。正式主站仍v186。

弃用旧VCHA米色档案视觉，以实际查看的环球《Only One》官方发行艺术重写白底品红团页。旧VCHA域名现跳转JYP总站，GIRLSET域名现跳转官方商店；不能称VCHA官网复刻。复用六人历史照片、既有ID/资料、TRACER v30至KATSEYE v33导航/原图/只读机制及共享手帐布局；共享手帐改配色，交审明确披露。

31专项/回归、类型、正式构建、45项五宽布局与28交互通过。27个可编辑Figma画板、7个不同关键节点实际取稿；修复时间轴文字重叠，完整字体/装饰/像素保真待完善。线上部署成功、IAB标签可见但读取40秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/vcha-review-completion`，基线 `2870eb1589df4b51ae2163e4b52fcdc8f9cc371c`；正式工程 `apps/idol-site/`。原图、稳定ID、评分、备注、观看状态与权限保持。[打开VCHA新站v1](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/vcha/index.html)。详见 `docs/codex/worklogs/20261024-vcha-review-completion.md`。

**等待 VCHA 网页确认后再开始 HITGS 或下一团，公共功能例外。下方旧门槛均为历史。**

## 必须先读

先读 [RESUME](RESUME.md)、根AGENTS、[STATUS](STATUS.md)、[PRD](PRD.md)、[CURRENT-STATE](CURRENT-STATE.md)、[ACCEPTANCE](ACCEPTANCE.md)、设计要求和协作手册，再核对源码与实际输入。

- 活动分支 `codex/hitgs-review-completion`；正式工程 `apps/idol-site/`，根Next sandbox不是生产基线。
- VCHA新站v1及此前页面已确认，当前仅等待HITGS新站v2网页确认。主站仍v186，没有合并main。
- 本地Windows开发，localhost只代表本机。GitHub是跨电脑接续入口；显式fetch活动分支，保留工作树改动和双方有效提交。
- 原图、稳定ID、评分、备注、观看状态和权限保持；公开仓库分享授权不扩展到新私人数据或秘密。
- 代码、worklog、公开验证证据共同提交推送。设计、资料、功能、上线分层验收；沿用设计必须在交审中披露版本、范围、官网及差异。
- 新站/旧站ID与容量原因、依赖/运行/验证命令、Figma和待验项见 [HITGS交接](worklogs/20261024-hitgs-review-completion.md)。
