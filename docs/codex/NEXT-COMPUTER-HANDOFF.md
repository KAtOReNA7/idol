# 跨电脑接续：N已补1条，仓库剩706；正式站仍v190

更新：2026-10-27。正式工程 `apps/idol-site/`。当前分支 `codex/mv-identity-gap-n-20261027` 从最新main c159957创建；[PR43](https://github.com/KAtOReNA7/idol/pull/43)尚未合并。GitHub与Sites发布分开，不能把候选源推送当上线。

## 可直接复制给下一台电脑

请接续 https://github.com/KAtOReNA7/idol 。先检查并保护本地未提交及未跟踪文件，显式fetch origin/main，工作树干净后从origin/main创建新的codex/任务分支，不reset、clean或强推。若未克隆则先克隆。核对PR43；若尚未合并，fetch codex/mv-identity-gap-n-20261027并普通merge到新任务分支，纳入已经完成的N增量。不要从旧逐团分支开始，不重复导入A–N。

依次读取本文件、AGENTS.md、STATUS.md、RESUME.md、mainline-consolidation-20261026.md，再读identity-gap-n-report-20261027.md。简短核对远端最新进度后实际开发。

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 仍v190（2121绑定/707缺图）。仓库候选已为2122绑定/348作品/45团、628封面、706缺图，原871累计已补165。N解决Hearts2Hearts《Lemon Tang》STELLA；当前清单内该团无缺图。43旧低清、18未知统计仍开放。当前清单是docs/codex/reports/20261027-gap-n/ledger.json，不要使用旧M表重复补STELLA。

先在上传环境恢复后完成同一正式项目候选发布，再继续706条缺口。候选源5e00cd94933a1c84f9eb7299a7127977f601f644已推送并构建打包；本机一次archive上传在sdmntprwestus3.oaiusercontent.com等待300013ms超时，没有新版本/部署ID，复查最新仍190。没有恢复证据不要反复同路径上传，不得省略已有archive、发布旧产物或改变权限绕过。

继续采用明确人物身份及精确MV依据的原生高清素材。先枚举官方多图帖全部图片，本次首图失败、第二张成功；不能把仅检查首图写成整个来源不可用。有效3:4宽至少540px，保留完整原图，不猜脸、发色、服装或站位，不放大、生成或补脸；缺图不能关闭成员评分。保留51团设计、Apple Music主站、稳定ID/关系、个人评分/备注/观看记录、既有访问和owner保存鉴权。个人页统一排版仍待用户决定。

## 获取代码

```sh
# 尚未克隆时
git clone --branch main https://github.com/KAtOReNA7/idol.git idol
# 已有目录先保护所有修改，再执行
git fetch origin refs/heads/main:refs/remotes/origin/main
git log -1 --oneline origin/main
# 确认工作树干净；选择未占用的新任务名
git switch -c codex/your-next-task origin/main
# 仅在PR43尚未进入main时执行，先核对该远端分支最新状态
git fetch origin refs/heads/codex/mv-identity-gap-n-20261027:refs/remotes/origin/codex/mv-identity-gap-n-20261027
git merge origin/codex/mv-identity-gap-n-20261027
```

main优先规则保持；上面的merge是在新main任务分支纳入未合并交付，不是回退旧逐团分支。遇到本地未提交或分叉先保护，不能覆盖。N原图固定GitHub ref `593c32634bbf6d567c3438c0c1a9b47de2f87b70`，交付清单实现 `526f63b59df9aa66990c086b74b30bafd7ef42d5`；请以新分支最新远端HEAD为接续点，不回退这些来源冻结值。

## 正式发布恢复

- 项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`；当前v190源 `0842a321033152cacd6c5a0c8c6790d654d33ea0`，部署 `appgdep_6adf62e9eed08191bf2bd6c7251af40b`。实际public、1owner/0外部/0组保持，名称private不代表权限。
- N候选源 `5e00cd94933a1c84f9eb7299a7127977f601f644`；包在本机 `E:/project/idol-gap-n-qa-20261027/formal-site.tar.gz`，gzip39,660,191 bytes，SHA256 `a704192a178d2a316ffa4c71a59ad234936aacb5e131e73f9bb74c536c50186b`，完整TAR62,303,744 bytes/1417文件。跨电脑不要假设此路径存在：读取Sites技能，用同项目原生source helper取回候选源，依原流程重建/推送/打包并使用新返回值保存，不能把新包配旧SHA。
- 已有source参数仅校验checkout，不保证fetch；需更新已有干净源时按helper打开流程取远端最新源。token只在内存/stdin，不写文件。保留`.openai/hosting.json`的DB/R2/MCP、23个迁移文件及owner保存鉴权。新原图已固定GitHub ref；601素材随包、4887原图有限清单同源原字节流式交付，9受限副本+1别名排除。
- 不运行旧宽泛prune。执行正式build后`node scripts/prepare-production-assets.mjs --apply`；完整展开TAR、所有构建字节、601本地资源、4887远端资源缺席、受限10项缺席，以及hosting/迁移映射逐项校验。Windows只在与Git blob换行等价时恢复原字节，不能放宽哈希检查。
- 调用save后取得真实version_id才deploy；保存结果不明先读get_site/list_site_versions，不能猜版本号。成功后核对STELLA新图HTTP/872917bytes/SHA、三宽作品页及原图流程、公开目录指纹、native存储和权限。当前N线上验证未做，因为根本未部署。

## 已有验证和剩余项

35专项、类型、正式构建通过；本地公开只读目录夹具320/390/1440三宽3布局/24图/3次原图流程通过。新原图GitHub HTTP/字节/SHA通过，5487旧交付记录逐对象保持。正式站上传尝试前后公开目录51团/338成员/614作品/2845关系全部投影字段指纹保持，native/epoch6/原快照/done206保持；没有真实私人记录保存或逐条私人字段读回。

Browser plugin not available，系统Chrome/Playwright验证，不代表用户IAB。真实保存、完整视频播放、原生缩放、新Figma未验。ILLIT/ITZY本轮没有取得可验收候选，不计完成。Okinawa BH2ND只登记新入口，字幕限流和完整视频下载问题未解决，不使用部分视频冒充完整原件证据。

报告：[N批](identity-gap-n-report-20261027.md)；[最新逐条表](reports/20261027-gap-n/ledger.html)；[原生失败/权限/存储证据](reports/20261027-gap-n/native-evidence.json)。旧M及v190报告保留为已上线基线。
