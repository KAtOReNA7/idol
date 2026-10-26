# 跨电脑接续：正式v190 / 原871已补164，剩707

更新：2026-10-26。正式工程 `apps/idol-site/`，活动分支 `codex/mv-identity-quality-followup`，draft [PR41](https://github.com/KAtOReNA7/idol/pull/41)，未合main。以远端最新HEAD为准；279a1e9、9733e6b是本轮基线/原图提交，不是要求回退的接续点。

## 可直接复制给下一台电脑

请接续 https://github.com/KAtOReNA7/idol 的 codex/mv-identity-quality-followup 最新远端。先检查并保护本地未提交及未跟踪文件，显式fetch该分支，不从旧main开始，不reset/clean/强推。阅读本文件、AGENTS.md、docs/codex/STATUS.md和docs/codex/RESUME.md，简短核对后实际开发。

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线v190，M批Hearts2Hearts Butterflies/Pretty Please/RUDE!24条已核验导入发布，不要重复。A至M已apply。现2121绑定/348作品/45团，628封面；原871累计已补164，剩707。43旧低清、18未知统计仍开放。当前逐条表为docs/codex/reports/20261026-gap-m/ledger.json；L表及旧731数字为历史。

继续707开放tuple；H2H当前表仅余Lemon Tang STELLA一条。旧字幕关键词不是人物身份，须实际查看官方画内姓名/自我介绍/直接指认人工字幕与主体对应；不能凭脸、服装、站位猜认，也不能以同专辑概念图替代精确MV拍摄。原生有效3:4宽≥540px，保留完整原图；来源限制准确披露，不放大、生成或补脸。5个确无真人精确视频规则保持，缺图不得关闭评分。个人页统一排版仍待用户决定。51团视觉、Apple Music主站、稳定ID/关系、个人评分备注观看状态及权限保持。

## 获取代码

新电脑：`git clone --branch codex/mv-identity-quality-followup --single-branch https://github.com/KAtOReNA7/idol.git idol`

已有目录先保护修改，再执行：

```sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
git switch codex/mv-identity-quality-followup
git merge --ff-only origin/codex/mv-identity-quality-followup
```

默认remote.fetch可能仍只追踪旧分支。若本地分叉或该分支在其他worktree，先保护双方状态，不强制覆盖。原图较多，保留完整Git字节；Windows Git换行转换可能改变SVG/固定声明文件，必须先比对Git blob，仅换行等价时恢复原字节，不能放宽SHA校验。

## 发布与验证事实

- 项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`；v190源 `0842a321033152cacd6c5a0c8c6790d654d33ea0`，部署 `appgdep_6adf62e9eed08191bf2bd6c7251af40b` / succeeded。实际access_mode=public、1owner/0外部/0组，按原样保持；站点名private不意味着可擅改受众。
- M原图固定ref `9733e6bbddaa989e700090c08eea98ba2a009217`，24完整1920×1080PNG/45,098,917bytes。视频仅研究证据，不发布整段视频。Butterflies CARMEN帽上沿、RUDE! YUHA部分头顶原生出框已披露；未假称发行方原照或成片逐帧比对。
- 27专项、类型、构建通过；本地公开只读目录夹具与线上真实目录各9布局/72图片槽/24原图流程。24线上原图HTTP/长度/SHA全通过；5463旧清单记录保持，未重复全量HTTP下载旧图。原生epoch6/原快照/done206及公开目录全部投影字段/关系指纹保持，非逐项私人记录检查。
- Browser plugin not available，采用系统Chrome/Playwright，非用户IAB。真实保存、全视频完整播放、原生缩放、新Figma未验。线上唯一控制台错误favicon.ico404已定位，非图片失败，未在本轮改图标。新电脑无正式DB，本地真实目录API无法直接验证，用明确标注的公开目录快照夹具做布局检查，不修改产品权限绕过。
- 复用Sites原生source helper打开完整正式源，不用旧静态审阅工程覆盖Worker。保留DB/R2/MCP及owner保存鉴权，短时credential仅内存/stdin，不写文件。原图先push，再更新有限清单不可变ref；601资源随包、4886原图按原字节同源流式交付，9受限副本+1别名排除。
- 完整TAR62,668,288bytes/1417文件逐字节校验后才发布；push不等于上线。读取Sites技能与原生get_site，正常续签同项目凭据，保存版本后部署，不重复创建站点，不绕过archive。

报告：[M批完整结果](identity-gap-m-report-20261026.md)，[逐条清单](reports/20261026-gap-m/ledger.html)，[证据目录](reports/20261026-gap-m/)，[日志](worklogs/20261026-h2h-m-native-verification.md)。历史[v189报告](formal-release-v189-closeout-20261026.md)保留。无新的个人页设计授权；后续从707缺口继续。
