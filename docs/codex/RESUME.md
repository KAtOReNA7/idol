# 接续：HITGS 新审阅站 v2 待网页确认

## 最新执行决定：HITGS 新审阅站 v2 待确认（2026-10-24）

用户“同意，继续开发”已确认 VCHA 新站 v1。本轮 HITGS 已发布同站 **v2 owner-private 只读审阅**：五成员、七发行/16曲目、八已有具名作品/13影像槽（8MV、5舞台）、五既有关系、七事件与手帐精确往返。28个既有非root文件SHA保持，root仅新增入口；旧站v33和正式主站v186未改。

弃用旧黄绿拼贴视觉，根据实际查看的 [Genie 官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15198)重写浅蓝深蓝页面。三个官方站入口均遇证书警告，未绕过，**不是官网复刻**。五成员照片为Kprofiles具名转载；七封面取Bugs原字节。沿用VCHA新站v1路由/公开投影、TRACER至VCHA原图/恢复/只读机制与共享手帐布局，共享手帐换色，交审必须披露。

22专项/回归、类型、正式构建、45项五宽真实视口布局、31交互通过。Figma已建21个可编辑画板并修复导航圆角/时间轴排布；两张大封面导入不完整，6个发行目录/详情画板及完整字体/像素保真仍待完成。线上部署成功，IAB导航/读取40秒超时；线上完整交互、真实保存/播放、80%/125%原生缩放未验。

分支 `codex/hitgs-review-completion`，基线 `9670b97ee1a33af09fe6cabdaf5d72c1839dff42`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开HITGS v2](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/hitgs/index.html)。详见 `docs/codex/worklogs/20261024-hitgs-review-completion.md`。

**等待 HITGS 网页确认后再开始 AtHeart 或下一团，公共功能例外。下方旧门槛均为历史。**

## 开工入口

- 仓库 KAtOReNA7/idol，正式工程 `apps/idol-site/`；活动分支 `codex/hitgs-review-completion`，PR base `codex/vcha-review-completion`。
- 先检查工作树，显式fetch活动分支并比较最新远端HEAD。默认fetch refspec只覆盖旧KiiiKiii，不能据默认fetch判断最新进度；不reset/clean/force push。
- [HITGS完整交接](worklogs/20261024-hitgs-review-completion.md)、[发布证据](worklogs/20261024-hitgs-public-delivery.json)、[Figma画板索引与缺口](worklogs/20261024-hitgs-figma-frames.json)。以任务分支最新远端HEAD接续。
- 新站 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a` v2；旧站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 仍v33；正式主站仍v186。不能混淆版本或覆盖主站。
- 审阅构建 `node scripts/build-hitgs-review.mjs --out <仓库外独立绝对目录>`；28资产（26图片及2字体）全部本地原字节。静态审阅清空个人字段，生产保存未验。
- 代码、服务、Playwright均在用户本机Windows；服务4191仅为本地验证，最终交审使用线上URL。
- 本轮未新增子代理。Figma 21画板、6处不同节点截图证据，尚缺6个发行画板；13MB封面capture仍pending，9MB封面返回空图片层，不应盲目反复创建capture。
- 真实保存/播放、原生缩放、线上完整交互仍待验；用户确认HITGS后才开始AtHeart，公共功能例外。

## 历史记录

- [VCHA新站v1，已确认](worklogs/20261024-vcha-review-completion.md)
- [KATSEYE v33，已确认](worklogs/20261024-katseye-review-completion.md)
- [SPIA v32，已确认](worklogs/20261024-spia-review-completion.md)
- 历史阶段和长期协作规则见 [STATUS](STATUS.md)、[设计要求](../design-requirements.md)、[协作手册](../collaboration-playbook.md)。
