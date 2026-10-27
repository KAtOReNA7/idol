# 跨电脑接续：正式v196，PR44未合并

正式工程为 `apps/idol-site/`。根目录旧sandbox不是发布工程。以本文件最新交付为准，保留后文列明的历史证据。

## 最新选源决定：舞台采用打歌节目／练习室（2026-10-28）

2026-10-28后续：用户已确认Right Now固定练习室 `y4Tr8LE5yV4` 完整。官网应援页证实原歌为英／日／韩混合，不是全英语；官方练习室页没有English Ver标识。完整性已记为用户确认，不要求重复检查；具体音轨与原发行是否一致仍待独立核对，未绑定或部署。证据 `docs/codex/evidence/20261028-stage-policy/right-now-user-check.json`。

用户否决此前推荐的QWER `l9GLV8Kd-MU`、NewJeans `saY9KS7mKvI`、ITZY `BnmwjH-suLg`三个候选；所需现场版一般为音乐节目打歌或练习室，不要演唱会录像。新政策见 `docs/codex/stage-selection-policy-20261028.md`，覆盖旧“排除练习室／接受演唱会”的选源规定。三项只在研究建议，未绑定评分；旧研究保留但不得继续推荐。

先核真实场合，不能因官方上传／电视转播就当普通打歌节目。演唱会／巡演退出候选，音乐节等活动不默认充当打歌来源；其他棚内表演单独核验类型。完整同曲、同语种／版本要求及原评分保护继续有效。图片来源放宽不适用于舞台录像。已有482选源数不等于新标准合格数，123旧缺口也不包含新查出的历史来源替换需求。

IVE WAVE／CRUSH的Golden Wave活动与XG MILLION PLACES巡演需要寻找替代；XG HOWLING的Music Bank类型符合要求。已评分来源不可静默更换；替换前核owner原评分／绑定，空分数按原安全条件采用新来源。复筛报告 `docs/codex/stage-policy-review-20261028.md`，逐项清单 `docs/codex/evidence/20261028-stage-policy/`。

本轮是用户标准记录与研究队列重排，未替换线上舞台或修改应用，正式站保持v196。运行时practice排除和concert接受逻辑仍须随后按本政策调整，不能将本轮报告写成已发布过滤修复。下方旧候选优先级不覆盖本决定。

## 最新审计：v196已发布，剩余问题已分类（2026-10-28）

已显式fetch并核对：此前完成的应用修改均已推送任务分支，正式站仍为 **v196 / succeeded**；[PR44](https://github.com/KAtOReNA7/idol/pull/44) open/draft、未合main。审计起点 `e3f390d72d49a92184b6674b52e1c5b8c1d713f7` 与远端一致，正式应用目录与已发布实现 `ec13cce54daf3df0274f0fc1e9f86b17da554be7` 无差异。本轮只更新审计与交接文档，没有应用改动、私人写入或重复部署。

当前匿名线上结构：51团、338成员上下文、605具名作品和9历史占位。2840有效关系＝2828公共图片绑定＋12原生有图，既有关系缺图0；628作品／展示视频封面另加4舞台海报，具名作品日期／标题／频道空值0。5双端空关系行保留。结构覆盖不等于本轮全量图片目视／下载检查，A–Y/Z不重做。

剩余84作品人物证据按9类处理，123未匹配舞台按24同版只读候选／6版本未证／36仅别版节选／6观看线索／51无有用补充处理；17统计未知（X5／销量9／一位3）及tripleS销量差371,716仍开放，7时间轴报道已展示、原事实生效日未证。各维度重叠，不相加成总缺失作品数。个人页统一排版仍待用户决定。

新发现2项应用标签待修：IVE I WANT的TVDaily来源应为原始媒体；NewJeans Right Now的韩语别版推断证据不足。旧时间轴SSR测试实测52项9过43失败，须逐项区分夹具与实际问题。favicon匿名HEAD为403，当前浏览器404未确认。tripleS年榜、三舞台及Caution幕后已有新候选，但均未应用。Soridata下载与验证码均被封禁，停止请求，不要求用户下载SQL，改查Circle年榜与可核转录。

完整报告 `docs/codex/current-gap-classification-20261028.md`，逐项清单及校验回执 `docs/codex/evidence/20261028-current-audit/`；离线复算 `python docs/codex/scripts/verify-current-audit-20261028.py`。下一步先修两项标签与旧SSR回归，再按证据队列补充；保护51团设计、完整原图、稳定ID／关系、个人记录、访问与owner鉴权。下方较早统计及Soridata下载建议不覆盖本节。

## 最新已上线：v196；公开署名与销量校正（2026-10-28）

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已为 **v196 / succeeded**。GitHub实现 `ec13cce54daf3df0274f0fc1e9f86b17da554be7`；Sites源 `2d41b09d477112e65f72536cdeea2791ac9b3bf8`，部署 `appgdep_6ae0d4e45eac8191bf38dc9358b358d0`。继续 `codex/statistics-relations-followup-20261027` / [PR44](https://github.com/KAtOReNA7/idol/pull/44)，未合main。GitHub与正式部署分别记录。

新增NMIXX FEIFEI六人、BADVILLAIN +82仅Emma、Weeekly Stranger六人、Rocket PunchドキドキLOVE六人公开资料，共4作品19人次；累计42作品263认人参考槽、123份既有原件，新增原图文件0。录音／发行名单不冒称逐人MV出镜；私人关系不新增。Stranger韩文9qRmlYPJB10经本人采访确认无真人，保留演唱者认人参考与MV评分、关闭成员评分，未独立完整播放。原5规则保持，另一上传版本不继承。

fromis_9月榜与年榜差额已复算，1,151,613→1,152,076，净增463；39原月行和独立版本保留，不重复加总。仍为韩国Circle来源覆盖下界，不是全球累计。17未知统计与tripleS单项销量差异仍开放；Soridata下载和captcha.php均返回封禁HTML，下载路线暂停，不再要求用户完成；改查Circle年榜和已存月行，详见statistics/soridata-download-blocked.md。

131原无关系作品中42公开署名与6无真人重叠1，去重47，剩84待证；不是既有关系缺图。2828公共绑定+12原生图无缺图、632封面保持；482舞台已配、123待核及9歌曲身份占位不变。7时间轴事实日期仍未证实，但报道展示已于v195完成。A–Y/Z不重做，个人页统一排版待用户决定。

40定向测试、TypeScript、正式构建、1402文件完整包通过；实际owner个人字段与关系完整hash和v195一致，native/epoch6/原快照/done206、public/1owner/0外部/0组保持。详见 `docs/codex/category-followup-v196-20261028.md` 与 `evidence/20261028-followup/`。未真实私人保存、全视频播放、原生缩放或新Figma验收。下方v195及更早为历史。

## 安全接续

先保护本地未提交和未跟踪文件，显式fetch主线及任务分支，不reset、clean或强推。PR43已合main；PR44尚未合main，已上线v192–v196仍在该任务分支。先核对PR44最新状态：未合并时接续下面任务分支；若已合并且最新main包含本轮实现，再从最新main建立新codex/任务分支。

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
2. `docs/codex/stage-selection-policy-20261028.md` 与 `evidence/20261028-stage-policy/`，再看 `docs/codex/current-gap-classification-20261028.md` 与 `evidence/20261028-current-audit/`，再看 `docs/codex/category-followup-v196-20261028.md`、`docs/codex/timeline-reported-records-v195-20261028.md`、`category-resolution-v194-20261027.md`、`category-resolution-20261027.md`。
3. 必要时查看 `docs/codex/current-gap-classification-20261027.md` 与 `evidence/20261027-category-resolution/work-members/README.md`；以10月28日审计的当前集合覆盖历史分类统计。
4. `docs/codex/identity-photo-selection-policy-20261027.md`；必要时再看 `mainline-identity-merge-20261027.md` 与历史主线整理报告。

## 已完成与保护项

A–Y补图及Z提质已完成，原871清单全部解决；不得重做。图片来源可为官方或可追溯的民间具名同套图集，优先同套概念/封套、同套写真、自然清晰幕后，MV帧为后备。完整原件保留，不猜脸、不AI补脸或放大；同系列认人后备如实标记，不能假称目标MV同期。缺图不关闭评分；原5个确无成员规则保持；v196新增Stranger韩文精确版本，合计6个规则。

v193补齐26作品30空字段、公开资料与SUHYEON ZAP近景，处理5项时间轴事实和3统计口径冲突；v194按用户选择绑定IVE WAVE/CRUSH、XG HOWLING/MILLION PLACES四舞台并加4封面，注明只核官方资料、未完整播放。v195只增加7报道展示层，canonical事实未改。个人页统一排版尚待用户决定。

## 下一步

- 先修IVE I WANT原始媒体标签与Right Now未证版本断言，保留观看／评分边界；维护旧SSR测试52项中的43个失败，不预设全部为夹具问题。
- 新候选：tripleS Performante Cosmo年榜替换净增2,415待审核，ASSEMBLE25 Cosmo净增2,751仍须消歧月行；QWER FAKE IDOL、Right Now、Not Shy English和NMIXX Caution幕后见10月28日逐项清单，均未应用。
- 17未知统计与1销量分歧：只采用可溯源、口径明确、可复算数据。未知内部null，适用显示0；0/未知X隐藏，无账号另行省略。未知X账号存在，不把未知人数误写为没有账号。
- 84待核作品：已有说明读取和格式分类，但人物证据并未全面完成。优先具名幕后、制作字幕、采访和明确录音/发行阵容；公开资料独立于私人关系，不自动推全员。
- 123舞台：已刷新搜索，部分候选深查；继续精确歌曲/语种/版本核对。新绑定前只读核对原stage与stageScore，未知原评分对应版本不能随意重绑。四已授权绑定不重复。
- 7时间轴hold：展示已补，实际生效日期仍未确认；来源不足时继续保留报道标签。不要将记录日作为生效日。
- v196账本及证据为 `docs/codex/evidence/20261028-followup/`；各研究子目录README仍保留候选准备时原文，是否采用以根账本和publication-v196回执为准。
- tripleS差额仍371,716。Soridata下载及验证码资源均被429封禁页拦截；停止请求，不让用户继续重试或把SQL作为前提。改用既存36月行与Circle年榜逐发行/版本/年替换复算；完整诊断见 `evidence/20261028-followup/statistics/soridata-download-blocked.md`。

## 发布及验证

同一项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`。v196回执 `evidence/20261028-followup/publication-v196.json`；包核验 `package-verification-v196.json`；实际用户Chrome只读保护 `owner-v196-verification.json`；四作品/销量本地与生产QA见该目录的 `work-members/v196-*-qa.json`。

正式受众实际为public、1owner/0外部/0组，名称private不代表权限；不得自行调整。native/epoch6/快照0180f4aa-664f-48e9-a98a-958d4ae649f9/done206保持。不要将 shell/API 未带浏览器cookie的登录错误当作用户未登录；旧Chrome标签失效时在同一浏览器创建新标签，只读检查，不重复要求登录。

未来有应用变更时先读Sites技能，用原生source helper打开同项目，凭证只放内存/隐藏stdin。原件ref当前 `b8eac29b77eebf12103f0f5174d41c73744a3ba3`；5996原件=578随包+5418同源流式远端，10受限副本/别名排除。一般光栅预算4MiB，保留既有2公共海报，不修改原字节。UDTT源码守卫现36项，有变更须独立复核精确hash，不放宽扫描。

核对完整TAR、所有构建字节、hosting/23迁移及原件后save同SHA同包，再deploy返回version_id；未明结果先查状态，不重复发布。正式成功后验证受影响布局、来源/原图流程及个人字段完整hash；不记录具体私人评分/备注。GitHub提交与Sites部署分别记录。

## 可复制指令

请接续 https://github.com/KAtOReNA7/idol 的最新 `codex/statistics-relations-followup-20261027` / PR44。PR43已合main，但PR44尚未合；先保护本地未提交/未跟踪文件，显式fetch main及任务分支并核对PR状态。未合并时接续最新任务分支；已合并才从包含本轮成果的最新main建codex/分支。不要reset、clean或强推。

先读docs/codex/NEXT-COMPUTER-HANDOFF.md、根AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md，再按交接读取最新报告与选图政策。正式工程apps/idol-site/，正式站https://idol-lens-private.wuke40758.chatgpt.site/已上线v196。2828公共图片绑定+12原生图无缺图，628作品／展示视频封面另加4舞台海报，A–Y/Z禁止重做。42作品263公开资料人次、84作品待证；17未知统计、1销量分歧、123舞台待核及7事实hold仍开放。保持设计、完整原图、ID/关系、个人数据、现有访问与owner鉴权；个人页统一排版待决定。先简短核对远端与线上，再继续证据补全；候选、GitHub提交与正式部署分别记录。

最新逐项路线以docs/codex/current-gap-classification-20261028.md及其证据目录为准。先修2项舞台标签及旧SSR测试43失败，再继续候选核验；Soridata路线已封禁，不再要求下载SQL。本轮审计没有应用变更，正式站保持v196。

舞台新标准：优先音乐节目打歌或官方练习室；不采用演唱会。先读stage-selection-policy-20261028.md及新审计清单，撤回三个用户否决候选，重新检查已有来源；不能沿用旧24同版候选作为合格计数，不静默移动原评分。
