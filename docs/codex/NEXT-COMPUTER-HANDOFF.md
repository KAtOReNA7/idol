# 跨电脑接续：认人图缺口与43条旧低清均已清零

2026-10-27。正式工程是 `apps/idol-site/`。当前代码、来源证据和发布状态以[本轮报告](identity-completion-report-20261027.md)为准；GitHub推送与正式站部署分别验证。

## 当前成果

- Q–Y本轮补入697条；当前2828认人绑定、472作品、49团、628封面，现有成员关系缺图0。原871清单全部解决。
- Z完成43条旧低清替换，card_only0；31复用已审原件，12新原件14,862,076字节。旧43完整记录和文件保留。A–Y和Z均不得重复执行。
- 26团成员图库/原有按钮已经接入公共图；51团设计、Apple Music主站、个人字段、稳定ID/关系、访问权限及owner保存鉴权保持。个人页统一排版仍待用户决定。
- 133作品没有既有成员关系，不能猜测全员；18项未知统计仍开放，不伪造补齐。
- 47专项、最终TypeScript、43提质三宽51布局/129原图流程、26团52布局/580图槽按钮/52原图流程通过。没有真实私人保存、全视频播放、原生缩放、用户IAB或新Figma验收。

## GitHub状态

任务分支 `codex/mv-identity-gap-n-20261027`，draft [PR43](https://github.com/KAtOReNA7/idol/pull/43)。本地Q–Y提交及成员页修复已完成，完整原件正分批同步，任务分支最终远端读回仍待完成。辅助资产分支 `codex/asset-transfer-20261027` 只用于完整原件传输，不是应用开发基线。

先保护所有未提交、未跟踪文件；显式fetch最新main。工作树干净后从origin/main创建新的codex/分支；若PR43尚未合并，再fetch并普通merge任务分支。不要从旧逐团分支开工，不reset、clean或强推，不将固定原件SHA当成接续HEAD。

```sh
git clone --branch main https://github.com/KAtOReNA7/idol.git idol
# 已有仓库先保护本地修改和未跟踪文件，再继续
git fetch origin refs/heads/main:refs/remotes/origin/main
git status --short
git switch -c codex/your-next-task origin/main
# 仅当PR43尚未进入main时
git fetch origin refs/heads/codex/mv-identity-gap-n-20261027:refs/remotes/origin/codex/mv-identity-gap-n-20261027
git merge origin/codex/mv-identity-gap-n-20261027
```

## 必读顺序与证据

依次读本文件、根AGENTS.md、STATUS.md、RESUME.md、mainline-consolidation-20261026.md，然后读identity-photo-selection-policy-20261027.md和identity-completion-report-20261027.md。

- 缺图完成：`reports/20261027-quality-z/ledger.json/html/csv`，原871全部有选中原件。
- 旧704分类最终结果：`reports/20261027-quality-z/route-resolution.json`，六类全部逐tuple核对解决。
- 提质：`reports/20261027-quality-z/quality-reviewed-delta.json`、integration-verification.json。
- 成员页：`reports/20261027-quality-z/member-gallery/verification.json`、member-urls.json。
- 当前审计：`mv-identity-asset-audit-20261025.json`；当前运行时：`apps/idol-site/data/mv-public-media.json`。

选图顺序为同套概念/封套优先、同套写真其次、自然清晰幕后再次、MV帧后备。官方和民间同标准；人物具名与系列可追溯、完整原件、自然清晰是必要条件。优先同发行/近时期，认人用途后备必须明示未证MV同期，不伪填same_era或精确MV证据，不猜脸、不AI补脸或放大。缺图不能关闭评分，5条确无真人精确视频规则保持。

## 正式站状态与发布接续

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 仍为v190、2121绑定，707条本地新增绑定及43提质/成员图库修复待上线。不能把GitHub提交或Sites源推送写成正式部署。

同一项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`；v190源 `0842a321033152cacd6c5a0c8c6790d654d33ea0`，部署 `appgdep_6adf62e9eed08191bf2bd6c7251af40b`。最新只读确认public、1owner、0外部、0组，原生epoch6/原快照/done206不变。名称private不代表权限，DB/R2/MCP和owner保存鉴权必须保留。

P完整包曾原生blob上传300009ms超时，未创建新版本。`bafe825a0d84501f66825919a281e63ddb033a15`及旧P包仅含P，绝不能代发Q–Y/Z/成员页修复。读取Sites技能，用原生helper打开同项目源；凭证只在内存/隐藏stdin。按最新已推送GitHub原件commit重建production-asset-delivery.json，再同步正式源并构建完整新包。

发布前核对所有carrier字节、hosting/迁移、完整展开TAR容量、local素材逐SHA、remote素材不随包以及10受限副本排除；使用prepare-production-assets.mjs --apply，仅清理经SHA核对的生成副本。不要删除public原件、改变权限、关闭TLS或省略可正常打包的archive绕过上传故障。

save使用helper返回的同SHA/同包，拿到version_id后再deploy；不明结果先查询版本/部署，不重复创建。正式成功后复验新图片原图、主页/成员页/作品页，并比较公开目录字段关系指纹和原生存储状态。若再次上传受阻，清楚记录无新版本/部署，保留最新冻结包，避免无恢复证据的重复失败上传。

## 复制给下一台电脑

请接续GitHub项目https://github.com/KAtOReNA7/idol。保护本地所有修改和未跟踪文件，显式fetch origin/main，干净后从最新main建codex/分支。核对PR43，若尚未合并则普通merge其最新远端任务分支。按NEXT-COMPUTER-HANDOFF规定顺序读最新文档。正式工程apps/idol-site；当前2828认人绑定、628封面、现有关系缺图0、旧card_only0，原871全部解决；A–Y补图和Z提质禁止重复。保持51团设计、个人字段/ID/关系/访问和owner保存鉴权。先核对GitHub实际HEAD与正式站真实版本；若发布仍滞后，使用最新已推送原件和应用代码重建同项目源及完整包，不能使用旧P包。18未知统计与133无成员关系作品仍有资料范围限制，个人页统一排版待用户另行决定。简短汇报核对结果后继续实际工作，并分别登记GitHub与正式部署状态。
