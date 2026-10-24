# 接续：i-dle 新审阅站 v5 待确认

## 最新执行决定：i-dle 新审阅站 v5 待确认（2026-10-24）

用户“同意，继续开发”已确认 AtHeart v4，按原 Sol 顺序继续 i-dle。沿用 v186 引入且已获认可的深紫/珊瑚红视觉，补齐成员/发行/影像搜索、原图、失败恢复与手帐精确往返。实际参考日本官网 https://i-dle.cubeent.co.jp/ 及 profile：现官网黑底、紫色渐变、红线与全幅轮播，**不能称本轮是官网复刻**。共享手帐沿用仓库布局并换色；审阅机制承接 AtHeart v4，交审必须披露。

分支 `codex/idle-review-completion`，基线 `e42527c9a84942abc628e26e0256097bec2a50bd`；正式工程 `apps/idol-site/`。五当前成员及一历史档案、41发行、28原生作品/23舞台、152既有关联与28原事件；个人字段清空，原图/稳定ID/权限保持。49专项/回归、类型、正式构建、99项九宽布局及64交互通过。27可编辑Figma画板、5个不同节点完整取稿，时间轴溢出已修；完整字体/像素保真、线上完整交互、真实保存/播放、80%/125%缩放未验。

同一 owner-private 新审阅站 v5 已发布，线上首页DOM与截图已读到，成员点击45秒超时；112旧非root文件SHA保持；旧站v33、主站v186未改。[打开 i-dle v5](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/idle/index.html)。详见 `docs/codex/worklogs/20261024-idle-review-completion.md`。**等待 i-dle 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 开工入口

- 仓库 KAtOReNA7/idol，正式工程 `apps/idol-site/`，活动分支 `codex/idle-review-completion`，base `codex/atheart-review-completion`。draft [PR #26](https://github.com/KAtOReNA7/idol/pull/26)，代码 `889fdcf` 已推送，以 GitHub 最新任务 HEAD 接续。
- 先检查工作树，显式 fetch 活动分支并比较远端；默认 refspec 有限，不通过 reset/clean/force push 丢弃更改。
- [本轮交接](worklogs/20261024-idle-review-completion.md)、[Figma索引](worklogs/20261024-idle-figma-frames.json)。保留原认可的 i-dle 视觉，不将功能补齐描述为按官网重设计。
- 审阅构建 `node scripts/build-idle-review.mjs --out <仓库外独立绝对目录>`；63资产、28作品、23舞台、152已有关系，个人字段均清空。
- 本机 Windows：本轮临时静态服务4193已关闭；真实保存/播放、原生缩放与线上完整交互未验。不要重跑 `implement.py` 等临时生成器覆盖修正。
- Sites v5，source `2c14a4ff74c2e473fa4432c7cecc0b76a853f277`，成功部署 `appgdep_6adcc6111d1c8191803ba98018ab1909`。线上首页已实际读到/截图，成员点击45秒超时，不宣称线上全流程通过。
- i-dle 网页获确认后才开始下一团；AtHeart v4及更早确认保持，主站v186未改。

## 历史记录

- [AtHeart v4，已确认](worklogs/20261024-atheart-wide-layout-fix.md)
- [HITGS v2，已确认](worklogs/20261024-hitgs-review-completion.md)
- [VCHA v1，已确认](worklogs/20261024-vcha-review-completion.md)
