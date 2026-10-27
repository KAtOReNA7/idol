# 跨电脑接续：正式v195，PR44未合并

当前正式工程为 `apps/idol-site/`。根目录旧sandbox不是发布工程。本文件是当前操作入口；历史发布记录留在报告及Git历史中，不能使用旧v191/main指令覆盖最新成果。

## 最新已上线：v195；继续证据补全（2026-10-28）

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已为 **v195 / succeeded**。GitHub实现 `fdb7193052fb8caed7cc99f3d98b05afef20dacc`；Sites源 `2d8d23c8d04ce092ae82f7768a72a162cc0f352a`，部署 `appgdep_6ae0ceb763ec8191b583bee182827045`。继续 `codex/statistics-relations-followup-20261027` / [PR44](https://github.com/KAtOReNA7/idol/pull/44)，未合main。不要以旧main覆盖本分支；GitHub提交和正式部署分别记录。

按用户选择，AtHeart2、BEWAVE1、CandyShop1、Geenius1、UDTT2共7项以报道/目录/转载记录展示，注明生效日期未确认；7个事实hold、稳定ID和5份canonical原文件保持。Sena仅为社区转载线索，原始发布日期未知。登录读取已恢复：用户本来已登录，旧浏览器连接及无cookie请求才是原因；同一Chrome新标签只读核对个人字段和关系完整hash与v194完全一致。未私人保存。

151项定向测试、TypeScript、正式构建、1402文件完整包通过；本地/正式各15布局、8来源点击及2个UDTT来源守卫通过。native/epoch6/原快照/done206，public/1owner/0外部/0组及owner保存鉴权保持。详见 `docs/codex/timeline-reported-records-v195-20261028.md` 及其证据。

当前38作品244人次公开资料；131原无关系作品=38有限公开资料+5无真人+88待证。88均已分类，86说明已读、2受阻，但未穷尽逐曲人物研究或全片核查。2828公共图片绑定+12原生图无缺图，632封面（628旧+4新舞台）；482已配舞台，123待证（57未找到/50版本不符/16受阻）及9歌曲身份占位，未完成全部候选核验。17未知统计（5X/9销量/3一位）、tripleS/fromis9两销量分歧仍开放。7项报道展示完成不等于原事实确认。

继续寻找新的具名人物/精确版本及统计来源，研究记录独立于已发布计数；不得推定全员、虚构统计、重复A–Y/Z。51团设计、Apple Music主站、完整原图和个人数据保护；个人页统一排版待用户决定。未真实私人保存、全视频播放、原生缩放或新Figma；历史SSR失败和favicon404仍列出。以下旧章节只作历史，不能覆盖本节。

## 安全接续

先保护本地未提交和未跟踪文件，显式fetch主线及任务分支，不reset、clean或强推。PR43已合main；PR44尚未合main，已上线v192–v195仍在该任务分支。先核对PR44最新状态：未合并时接续下面任务分支；若已合并且最新main包含本轮实现，再从最新main建立新codex/任务分支。

尚未克隆时：

```sh
git clone --branch codex/statistics-relations-followup-20261027 https://github.com/KAtOReNA7/idol.git idol
cd idol
git fetch origin refs/heads/main:refs/remotes/origin/main refs/heads/codex/statistics-relations-followup-20261027:refs/remotes/origin/codex/statistics-relations-followup-20261027
git status --short --untracked-files=all
```

已有仓库时，先 `git status --short --untracked-files=all` 并备份或提交本地工作，干净后显式fetch上述两分支。现有任务分支无分叉时使用 `git merge --ff-only origin/codex/statistics-relations-followup-20261027`；否则保留两边修改并检查差异，不强制覆盖。没有本地任务分支则 `git switch --track origin/codex/statistics-relations-followup-20261027`。

## 阅读顺序

1. 本文件、根 `AGENTS.md`、`docs/codex/STATUS.md`、`docs/codex/RESUME.md`。
2. `docs/codex/timeline-reported-records-v195-20261028.md`、`category-resolution-v194-20261027.md`、`category-resolution-20261027.md`。
3. `docs/codex/current-gap-classification-20261027.md` 与 `evidence/20261027-category-resolution/work-members/README.md`，以v195当前数字覆盖历史分类统计。
4. `docs/codex/identity-photo-selection-policy-20261027.md`；必要时再看 `mainline-identity-merge-20261027.md` 与历史主线整理报告。

## 已完成与保护项

A–Y补图及Z提质已完成，原871清单全部解决；不得重做。图片来源可为官方或可追溯的民间具名同套图集，优先同套概念/封套、同套写真、自然清晰幕后，MV帧为后备。完整原件保留，不猜脸、不AI补脸或放大；同系列认人后备如实标记，不能假称目标MV同期。缺图不关闭评分；原5个确无成员规则保持。

v193补齐26作品30空字段、公开资料与SUHYEON ZAP近景，处理5项时间轴事实和3统计口径冲突；v194按用户选择绑定IVE WAVE/CRUSH、XG HOWLING/MILLION PLACES四舞台并加4封面，注明只核官方资料、未完整播放。v195只增加7报道展示层，canonical事实未改。个人页统一排版尚待用户决定。

## 下一步

- 17未知统计与2销量分歧：只采用可溯源、口径明确、可复算数据。未知内部null，适用显示0；0/未知X隐藏，无账号另行省略。未知X账号存在，不把未知人数误写为没有账号。
- 88待核作品：已有说明读取和格式分类，但人物证据并未全面完成。优先具名幕后、制作字幕、采访和明确录音/发行阵容；公开资料独立于私人关系，不自动推全员。
- 123舞台：已刷新搜索，部分候选深查；继续精确歌曲/语种/版本核对。新绑定前只读核对原stage与stageScore，未知原评分对应版本不能随意重绑。四已授权绑定不重复。
- 7时间轴hold：展示已补，实际生效日期仍未确认；来源不足时继续保留报道标签。不要将记录日作为生效日。
- 新研究暂存 `docs/codex/evidence/20261028-followup/`；候选未集成/未发布不计入v195。

## 发布及验证

同一项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`。v195回执：`evidence/20261027-category-resolution/publication-v195.json`；包核验 `package-verification-v195.json`；实际用户Chrome只读保护 `auth/owner-v195-verification.json`；生产五团 `work-members/reported-five-production-qa.json`。

正式受众实际为public、1owner/0外部/0组，名称private不代表权限；不得自行调整。native/epoch6/快照0180f4aa-664f-48e9-a98a-958d4ae649f9/done206保持。不要将 shell/API 未带浏览器cookie的登录错误当作用户未登录；旧Chrome标签失效时在同一浏览器创建新标签，只读检查，不重复要求登录。

未来有应用变更时先读Sites技能，用原生source helper打开同项目，凭证只放内存/隐藏stdin。原件ref当前 `b8eac29b77eebf12103f0f5174d41c73744a3ba3`；5996原件=578随包+5418同源流式远端，10受限副本/别名排除。一般光栅预算4MiB，保留既有2公共海报，不修改原字节。UDTT源码守卫现36项，有变更须独立复核精确hash，不放宽扫描。

核对完整TAR、所有构建字节、hosting/23迁移及原件后save同SHA同包，再deploy返回version_id；未明结果先查状态，不重复发布。正式成功后验证受影响布局、来源/原图流程及个人字段完整hash；不记录具体私人评分/备注。GitHub提交与Sites部署分别记录。

## 可复制指令

请接续 https://github.com/KAtOReNA7/idol 的最新 `codex/statistics-relations-followup-20261027` / PR44。PR43已合main，但PR44尚未合；先保护本地未提交/未跟踪文件，显式fetch main及任务分支并核对PR状态。未合并时接续最新任务分支；已合并才从包含本轮成果的最新main建codex/分支。不要reset、clean或强推。

先读docs/codex/NEXT-COMPUTER-HANDOFF.md、根AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md，再按交接读取最新报告与选图政策。正式工程apps/idol-site/，正式站https://idol-lens-private.wuke40758.chatgpt.site/已上线v195。2828公共图片绑定+12原生图无缺图，632封面，A–Y/Z禁止重做。38作品244公开资料人次、88作品待证；17未知统计、2销量分歧、123舞台待核及7事实hold仍开放。保持设计、完整原图、ID/关系、个人数据、现有访问与owner鉴权；个人页统一排版待决定。先简短核对远端与线上，再继续证据补全；候选、GitHub提交与正式部署分别记录。
