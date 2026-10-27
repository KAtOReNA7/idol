# 跨电脑接续：PR43已合入main，正式站v191

2026-10-27。正式工程是 `apps/idol-site/`。当前代码、来源证据和发布状态以[本轮报告](identity-completion-report-20261027.md)为准；GitHub推送与正式站部署分别验证。

## 当前成果

- Q–Y本轮补入697条；当前2828认人绑定、472作品、49团、628封面，现有成员关系缺图0。原871清单全部解决。
- Z完成43条旧低清替换，card_only0；31复用已审原件，12新原件14,862,076字节。旧43完整记录和文件保留。A–Y和Z均不得重复执行。
- 26团成员图库/原有按钮已经接入公共图；51团设计、Apple Music主站、个人字段、稳定ID/关系、访问权限及owner保存鉴权保持。个人页统一排版仍待用户决定。
- 133作品没有既有成员关系，不能猜测全员；18项未知统计仍开放，不伪造补齐。
- 54专项、最终TypeScript和正式构建通过；本地43提质三宽51布局/129原图流程、26团52布局/580图槽按钮/52原图流程通过；线上43提质51布局/129原图流程、29原图HTTP/完整字节/SHA通过。没有真实私人保存、全视频播放、原生缩放、用户IAB或新Figma验收。
- 正式站26团成员页390宽、290公共控件/271缩略图、26最大原图流程及9索引布局通过；首次脚本误拦正常浏览器校验造成两页超时，纠正后已过，见production-member-gallery-verification.json。作品页另有1条未归因console404，后续监听未复现，受检图均正常载入，保留记录不隐去。

## GitHub状态：已经进入main

[PR43](https://github.com/KAtOReNA7/idol/pull/43) 已于2026-10-27 18:44:04（北京时间）合并；合并提交 `cde017d9d2ad355a287dcdd1e099f6e59c556e12`，任务HEAD `47060f6d98697bed5820540ce0f4f01b15eb5b97`。普通merge保留完整历史，合并后全仓树与任务HEAD完全一致。后续交接文档也提交至main，接续时使用最新远端main，不把以上固定历史SHA当作当前HEAD。

正式应用实现a08ba097、原件ref7ee8a2d及辅助资产历史均已被main包含。不要再合入旧任务分支或辅助资产分支，不需要重复传输原件。未删除原分支，不reset、clean、rebase或强推。

**尚未克隆的电脑：**

```sh
git clone --branch main https://github.com/KAtOReNA7/idol.git idol
cd idol
git fetch origin refs/heads/main:refs/remotes/origin/main
git status --short
git switch -c codex/your-next-task origin/main
```

**已有仓库的电脑：**先检查并安全备份或提交本地未提交、未跟踪文件。确认工作树干净后执行下列命令，分支名换成当前任务的新名称：

```sh
git status --short --untracked-files=all
git fetch origin refs/heads/main:refs/remotes/origin/main
git switch -c codex/your-next-task origin/main
```

不要用reset/clean丢弃本地内容；若有未保护修改，先处理它们，不强制切换。新任务只基于显式fetch后的origin/main。

## 必读顺序与证据

依次读本文件、根AGENTS.md、STATUS.md、RESUME.md、mainline-consolidation-20261026.md，再读mainline-identity-merge-20261027.md、identity-photo-selection-policy-20261027.md和identity-completion-report-20261027.md。20261026主线整理报告为历史背景，最新状态以本文件及20261027合并记录为准。

- 缺图完成：`reports/20261027-quality-z/ledger.json/html/csv`，原871全部有选中原件。
- 旧704分类最终结果：`reports/20261027-quality-z/route-resolution.json`，六类全部逐tuple核对解决。
- 提质：`reports/20261027-quality-z/quality-reviewed-delta.json`、integration-verification.json。
- 成员页：`reports/20261027-quality-z/member-gallery/verification.json`、member-urls.json。
- 发布回执：`reports/20261027-quality-z/formal-v191-publication.json`；完整包与原件独立核对formal-independent-verification.json，生产复验production-browser-verification.json及production-originals-verification.json。
- 当前审计：`mv-identity-asset-audit-20261025.json`；当前运行时：`apps/idol-site/data/mv-public-media.json`。

选图顺序为同套概念/封套优先、同套写真其次、自然清晰幕后再次、MV帧后备。官方和民间同标准；人物具名与系列可追溯、完整原件、自然清晰是必要条件。优先同发行/近时期，认人用途后备必须明示未证MV同期，不伪填same_era或精确MV证据，不猜脸、不AI补脸或放大。缺图不能关闭评分，5条确无真人精确视频规则保持。

## 正式站状态与发布接续

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已成功上线 **v191 / succeeded**，包含707条相对v190新增绑定、43提质和26团成员图库修复，当前2828绑定。GitHub提交和正式部署已分别留证，无需重复部署相同内容。

同一项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`；v191源 `5644d219a4226d32fbb3d14a05033e3808f5692b`，部署 `appgdep_6ae07a8904008191b8de2068c80af476`。发布后只读确认public、1owner、0外部、0组，native/epoch6/快照0180f4aa-664f-48e9-a98a-958d4ae649f9/done206不变。公开目录全部字段和关系指纹发布前后相同。名称private不代表权限，DB/R2/MCP和owner保存鉴权必须保留。

旧P包曾上传超时，已被本轮成功发布取代，不能再作为当前阻塞或发布包。当前生产资源清单固定GitHub原件ref `7ee8a2d16e53358302ab8000af66a550bbb921cc`，5981原件中578随包、5403按既有同源流式交付、10受限副本/旧别名排除；原件不压缩。一般光栅打包预算已设4MiB（另保留两张原有公共海报211,510字节），完整gzip18,950,975字节，展开TAR42,063,872字节/1398文件，原生save在129729ms成功。

未来有新改动需发布时，先读取Sites技能，用原生helper打开同项目最新源，核对源HEAD与站点版本；凭证只在内存/隐藏stdin。按最新已推送原件commit重建production-asset-delivery.json，再同步正式源并构建完整新包。不要用旧P包/bafe825，也不要恢复24MiB预算导致超时重现。

发布前核对所有carrier字节、hosting/迁移、完整展开TAR容量、local素材逐SHA、remote素材不随包以及10受限副本排除；使用prepare-production-assets.mjs --apply，仅清理经SHA核对的生成副本。不要删除public原件、改变权限、关闭TLS或省略可正常打包的archive绕过上传故障。

save使用helper返回的同SHA/同包，拿到version_id后再deploy；不明结果先查询版本/部署，不重复创建。正式成功后复验新图片原图、主页/成员页/作品页，并比较公开目录字段关系指纹和原生存储状态。若再次上传受阻，清楚记录无新版本/部署，保留最新冻结包，避免无恢复证据的重复失败上传。

## 复制给下一台电脑

请接续GitHub项目https://github.com/KAtOReNA7/idol。PR43已合入main，后续只从最新main开始，不再接续旧任务或逐团分支。

先检查并保护本地未提交和未跟踪文件，显式fetch origin/main；工作树干净后从origin/main建立新的codex/任务分支。尚未克隆则先克隆main。禁止reset、clean、强推，不重复合并PR43或辅助资产分支。

依次阅读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md、docs/codex/mainline-consolidation-20261026.md、docs/codex/mainline-identity-merge-20261027.md，然后核对选图政策与完成报告。

正式工程apps/idol-site/，根目录是旧sandbox。正式站https://idol-lens-private.wuke40758.chatgpt.site/已上线v191。当前2828认人图绑定、628封面，现有关系缺图0、旧低清0；原871全部解决，A–Y补图及Z提质禁止重复。优先同套概念/封套照，官方和可追溯民间具名图集均可；保留完整原图，不猜脸、不放大或生成补脸，来源标签如实。

保持51团已确认设计、Apple Music主站、稳定ID/关系、个人评分/备注/观看记录、现有访问权限和owner保存鉴权。18项未知统计与133个无既有成员关系作品仍待核实，不能推定全员或伪造数据；个人页统一排版待用户另行决定。

先简短核对最新main与正式站状态，再继续实际工作。GitHub提交与正式站部署分别记录，不重复部署相同内容，不使用旧P包；未来发布按当前4MiB一般光栅预算及完整包/原件哈希校验流程执行。
