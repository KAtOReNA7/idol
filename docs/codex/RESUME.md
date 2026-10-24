# 接续：IZ*ONE Panorama 重设计 v8 待确认

## 最新执行决定：IZ*ONE Panorama 重设计 v8 待确认（2026-10-25）

用户明确否决 v6 奶油玫瑰/Bodoni 展册视觉。本轮依据 [Panorama 时期韩国官网存档](https://web.archive.org/web/20210103153505/http://iz-one.co.kr/)实际取得的 HTML、CSS、原字标、字体与具名原图重写黑银页面；[BLOOM*IZ 预告历史镜像](https://iz-one.co.kr/20191103/)和 [Melon 官方专题](https://www.melon.com/musicstory/inform.htm?mstorySeq=10961)为辅助参考。原存档浏览器停在 loading，不冒称完整原站加载成功；依据是实际读取的源码、资产及辅助页面。

同一 owner-private 审阅站 **v8 已发布**。首页完整十二人团照与静态成员目录，成员/发行/影像/时间轴/手帐均换黑银视觉；新增17个官网原字节资产，旧原图保留。十二身份、18发行/81曲、17影像、10原生作品/108关系、12事件保持。**复用 i-dle v5 / IZ*ONE v6 数据、路由、搜索、原图恢复、只读投影及手帐业务组件；团页和手帐视觉编排重写，未沿用被否决的展册视觉。** 项目功能属于官网语言扩展，不称逐像素复刻。历史主题只在合法 IZ*ONE 往返内生效，不覆盖其他团体流程。

31专项/回归、类型、最终构建、90项九宽布局、53交互（含托管重定向）及三宽标签复验通过。Figma新版30可编辑画板、七个不同关键节点完整取稿；时间轴缩进/照片标签已修，专用字体缺失及全量像素对照仍待完善。230个受保护文件SHA不变，root、旧站v33和主站v186保持。线上验证结果见本轮日志；真实保存/播放与80%/125%原生缩放未验。

分支 `codex/izone-review-completion` / draft [PR #27](https://github.com/KAtOReNA7/idol/pull/27)，本轮冻结 `1d097a2d5253dc6c225c87af3ab9ad74f41c2402`。正式工程 `apps/idol-site/`，未合入 main。[打开 IZ*ONE v8](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)；详见 `docs/codex/worklogs/20261025-izone-panorama-redesign.md`。

**v6 及其旧 Figma 已被否决。等待新版 IZ*ONE 网页确认后再开始 fromis_9 或下一团，公共功能例外。**

## 历史交付：IZ*ONE v6（视觉已被否决，2026-10-24）

用户“同意，继续开发”已确认 i-dle v5；本轮仅推进 IZ*ONE。已发布同站 **v6 owner-private 只读审阅**：十二位历史成员、18项发行版本/81曲目、10既有作品/17影像槽、108既有关联与12原事件，原图及成员/作品手帐精确往返。181旧非root文件SHA保持，root仅加入口；旧站v33与主站v186未改。

**沿用 v186 引入的旧 IZ*ONE 候选奶油玫瑰、Bodoni字体及展册语言，该候选未曾获用户确认；不是官网复刻。** 日本旧官网只有重定向占位，韩国旧站现为预告镜像。照片来自DBKpop具名转载，发行来自Bugs；不能称官网原图。复用i-dle v5路由/公开投影与共享手帐布局及既有IZ*ONE配色，交审必须披露版本、范围、官网状况和差异。历史头像仅在合法IZ*ONE返回上下文启用，保留成员当前归属。

23专项/导航、类型、正式构建、90项九宽布局、51交互通过。旧timeline-navigation的11失败已在基线字节复现，未放宽pins。Figma30可编辑画板、5个不同关键节点完整取稿；已修隐藏占位与时间轴排布，字体替代和全量像素对照仍待完善。线上部署成功，IAB导航40秒及读取30秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/izone-review-completion`，基线 `10fd7beb2e6029783d739c26267b0fad5da3fd4a`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开IZ*ONE v6](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)。详见 `docs/codex/worklogs/20261024-izone-review-completion.md`。

**等待 IZ*ONE 网页确认后再开始 fromis_9 或下一团，公共功能例外。下方旧门槛均为历史。**

## 开工入口

- draft [PR #27](https://github.com/KAtOReNA7/idol/pull/27)，代码 `d5a747919f4c8ec3e18c215dcfdd8bb2cc8f4f79` 已推送并核对远端；以任务分支最新 HEAD 接续。
- GitHub为多电脑接续入口；活动分支 `codex/izone-review-completion`，base `codex/idle-review-completion`，正式工程 `apps/idol-site/`。先核对工作树、显式fetch、远端HEAD和PR，不从旧main开工。
- [本轮完整交接](worklogs/20261024-izone-review-completion.md)、[Figma索引](worklogs/20261024-izone-figma-frames.json)、[公开验证摘要](worklogs/20261024-izone-verification.json)。
- 审阅构建 `node scripts/build-izone-review.mjs --out <仓库外独立绝对目录>`，49资产，108已有关系。真实个人字段清空，写入禁用；正式评分及用户数据保持。
- Windows本机静态服务4194仅用于本轮QA，交付后关闭。禁止把云端localhost当用户电脑可访问地址。
- Sites v6 source `1278ea1f3e6a60c17045d412225c246688e33b89`，deployment `appgdep_6adcd0eb826c8191a00da11ef03dc3de` succeeded。IAB两次超时，线上渲染/交互未通过；不要照旧记录冒称线上全验。
- 原图和稳定ID不改；IVE/LE SSERAFIM/SAY MY NAME 的当前头像不被IZ*ONE历史照覆盖。沿用旧候选与共享布局必须在交审中明确披露。
- 等用户确认IZ*ONE后才开始fromis_9。i-dle v5、AtHeart v4及更早页面已确认，主站仍v186，未合并main。

## 历史记录

- [i-dle v5，已确认](worklogs/20261024-idle-review-completion.md)
- [AtHeart v4，已确认](worklogs/20261024-atheart-wide-layout-fix.md)
- [HITGS v2，已确认](worklogs/20261024-hitgs-review-completion.md)
- [VCHA v1，已确认](worklogs/20261024-vcha-review-completion.md)
