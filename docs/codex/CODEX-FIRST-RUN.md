# Codex 首次执行文件

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

## 历史执行决定：i-dle 新审阅站 v5（已确认，2026-10-24）

用户“同意，继续开发”已确认 AtHeart v4，按原 Sol 顺序继续 i-dle。沿用 v186 引入且已获认可的深紫/珊瑚红视觉，补齐成员/发行/影像搜索、原图、失败恢复与手帐精确往返。实际参考日本官网 https://i-dle.cubeent.co.jp/ 及 profile：现官网黑底、紫色渐变、红线与全幅轮播，**不能称本轮是官网复刻**。共享手帐沿用仓库布局并换色；审阅机制承接 AtHeart v4，交审必须披露。

分支 `codex/idle-review-completion`，基线 `e42527c9a84942abc628e26e0256097bec2a50bd`；正式工程 `apps/idol-site/`。五当前成员及一历史档案、41发行、28原生作品/23舞台、152既有关联与28原事件；个人字段清空，原图/稳定ID/权限保持。49专项/回归、类型、正式构建、99项九宽布局及64交互通过。27可编辑Figma画板、5个不同节点完整取稿，时间轴溢出已修；完整字体/像素保真、线上完整交互、真实保存/播放、80%/125%缩放未验。

同一 owner-private 新审阅站 v5 已发布，线上首页DOM与截图已读到，成员点击45秒超时；112旧非root文件SHA保持；旧站v33、主站v186未改。[打开 i-dle v5](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/idle/index.html)。详见 `docs/codex/worklogs/20261024-idle-review-completion.md`。**等待 i-dle 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

## 历史执行决定：AtHeart 新审阅站 v4（已确认，2026-10-24）

用户“同意，继续开发”已确认 HITGS 新站 v2。本轮 AtHeart 已发布同站 **v4 owner-private 只读审阅**：七成员、九发行/18曲、25影像槽（15音乐影像、10表演/现场）、两条具名原生作品/四精确MV舞台版本、六既有关系与八条ready事件及手帐往返。原生两条hold事件和空白作品保留原状。62个既有非root文件SHA保持，root仅新增入口；旧站v33与主站v186未改。

弃用旧米色书信视觉，依据实际查看的 [AtHeart官网](https://atheart.me/) 重写黑底白字、黑色标识栏、白色图标导航和大幅团照。七成员原图与九发行资料来自 [日本官网](https://atheart.jp/contents/menu/176621)。搜索/详情/时间轴是项目扩展，不宣称逐像素复刻。复用 **HITGS v2** 路由/公开投影和 TRACER 至 HITGS 原图/恢复/只读机制；共享手帐沿用 **VCHA 新站 v1布局** 并换黑白，交审必须披露。

24测试、类型、最终正式构建、45项五宽真实视口布局和61项交互通过。Figma27个可编辑画板、7个不同节点实际取稿，修复标识与时间轴；Arial/Microsoft YaHei缺失而使用替代字体，字体保真及完整逐板像素对照未通过。线上部署成功且首页完整DOM已实际读到；成员点击20秒超时、随后状态读取40秒超时，线上完整交互、真实保存/播放、80%/125%原生缩放未验。

分支 `codex/atheart-review-completion`，基线 `b9e07d0855888d023327998f96d104f98fa67e94`，代码 `6e527a21f582fe0d9aad493025741f7f31bc59d0`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开AtHeart v4](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/atheart/index.html) · draft [PR #25](https://github.com/KAtOReNA7/idol/pull/25)。详见 `docs/codex/worklogs/20261024-atheart-review-completion.md`。

**等待 AtHeart 网页确认后再开始下一团，公共功能例外。下方旧门槛均为历史。**

v4修复补充：用户反馈首页发行区元素丢失，已复现为窗口留白与main限宽冲突，2560/2926px封面实际宽度为0。发行区现继承共享section内边距，320–3840px九宽×三页共27布局和九次发行往返通过；108既有文件、44资产、JS与root保持，仅CSS/三个HTML内容版本/manifest更新。Figma现有桌面首页发行区已同步并取稿。线上v4部署成功，IAB本轮导航40秒超时，未宣称线上视觉通过。见 `docs/codex/worklogs/20261024-atheart-wide-layout-fix.md`。v3的图片加载/整页溢出检查不足以发现内部零宽，不能据旧“45项通过”认定宽屏视觉正确。


## 历史执行决定：HITGS 新审阅站 v2（已确认，2026-10-24）

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

- 活动分支 `codex/izone-review-completion`，draft PR #27；正式工程 `apps/idol-site/`，根Next sandbox不是生产基线。
- i-dle新站v5及此前页面已确认，当前等待IZ*ONE Panorama重设计v8网页确认。主站仍v186，没有合并main。
- 本地Windows开发，localhost只代表本机。GitHub是跨电脑接续入口；显式fetch活动分支，保留工作树改动和双方有效提交。
- 原图、稳定ID、评分、备注、观看状态和权限保持；公开仓库分享授权不扩展到新私人数据或秘密。
- 代码、worklog、公开验证证据共同提交推送。设计、资料、功能、上线分层验收；沿用设计必须在交审中披露版本、范围、官网及差异。
- 新站/旧站ID与容量原因、依赖/运行/验证命令、Figma和待验项见 [AtHeart交接](worklogs/20261024-atheart-review-completion.md)。
