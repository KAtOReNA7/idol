# 跨电脑接续：同套认人图持续补齐，仓库2293绑定/535缺图

## 当前续作：Q批新增162，仓库2293绑定／535缺图（2026-10-27）

用户明确要求全部认人图完成前持续开发，只有确需用户确认的关键节点才暂停。按同套概念/封套优先的新规则，Q162条已入库，125张完整原件217,661,221 bytes；原871已补336、剩535，628封面、43旧低清、18未知统计保持。A–Q禁止重复导入。最新逐条清单`docs/codex/reports/20261027-gap-q/ledger.json`，报告`docs/codex/identity-gap-q-report-20261027.md`。

2131旧选中绑定/628封面/既有关系和评分策略保持；34相关测试、TypeScript、三宽117布局/486新图及原图流程通过，1项P之前已复现的旧源字符串断言仍失败。51团设计、个人数据、访问与owner保存鉴权保持。正式站仍v190：P完整包上传300009ms超时后未生成版本/部署，Sites候选源bafe825a0d84501f66825919a281e63ddb033a15仅含P，不能直接发布Q。N/O/P/Q共172条待发布，GitHub推送与正式上线分别记录。继续R及剩余535，不因完成一个批次停止。


2026-10-27。正式工程 `apps/idol-site/`，PR43承载N/O/P/Q，尚未合并。GitHub提交与正式站部署分开记录。

## 复制给下一台电脑

请接续 https://github.com/KAtOReNA7/idol 。先检查并保护本地未提交和未跟踪文件，显式 fetch origin/main；工作树干净后从最新 origin/main 建立新 codex/ 任务分支，不 reset、clean 或强推。未克隆则先克隆。核对 PR43，若尚未合并，fetch codex/mv-identity-gap-n-20261027 并普通 merge 到新分支，以纳入已完成N/O/P/Q，不回退旧逐团分支。

依次读本文件、AGENTS.md、docs/codex/STATUS.md、RESUME.md、mainline-consolidation-20261026.md，然后读 identity-photo-selection-policy-20261027.md 和 identity-gap-q-report-20261027.md。最新仓库2293绑定/386作品/45团、628封面、535缺图，43旧低清、18未知统计；原871已补336。A–Q禁止重复导入，最新逐条清单为 docs/codex/reports/20261027-gap-q/ledger.json。

用户最新选图顺序：同套概念照/封套照优先，其次同套写真、自然清晰幕后，MV截图只作后备。官方、粉丝站和民间图集都可；人物有可靠具名依据、同套可追溯、清晰自然好看即可，不再强制精确MV拍摄/版本。保持完整原件、不猜脸、不生成补脸或插值放大。图片仍绑定原作品/成员评分关系，但如实标注认人参考，不能冒称MV造型证据。页面设计与个人评分/备注/观看、ID/关系、访问和owner保存鉴权保持。

P已实现source_named_photo_set校验和对应运行时标签，补IVE《BANG BANG》YUJIN/GAEUL/REI及RESCENE《Heart Drop》《Bloom》各Liv/Minami，共7绑定、5原图。先复审剩余概念/封套候选，不重复导入。原540px机械门槛暂未改，个别清晰横图可单独研究展示方案，不把机械门槛当用户新要求。个人页统一排版仍待决定。

## Git 操作

```sh
git clone --branch main https://github.com/KAtOReNA7/idol.git idol
# 已有仓库先保护全部修改，再执行
git fetch origin refs/heads/main:refs/remotes/origin/main
git status --short
git log -1 --oneline origin/main
git switch -c codex/your-next-task origin/main
# 仅当PR43尚未进入main时
git fetch origin refs/heads/codex/mv-identity-gap-n-20261027:refs/remotes/origin/codex/mv-identity-gap-n-20261027
git merge origin/codex/mv-identity-gap-n-20261027
```

以远端最新HEAD接续，以下冻结值仅为原图来源：P `25f63e605aee686bbdd37154084bd81546fd8a0c`；O `bc338bd5a1b555b50bd96c96ba6fe65c7ef137cc`。新delivery清单引用P不可变提交，旧5490资源记录保持，新增5原件。

## 正式发布仍待完成（以下P以前说明为历史；以上Q和Q报告优先）

最近核实正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 为v190/2121绑定/707缺图；N/O/P累计10条待发布。本轮P已用原生get_site读回最新版本190及public/1owner/0外部/0组，未保存新版本或部署；详见P目录site-state.json。

原项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`，v190发布源 `0842a321033152cacd6c5a0c8c6790d654d33ea0`、部署 `appgdep_6adf62e9eed08191bf2bd6c7251af40b`。已核原权限public/1owner/0外部/0组保持，名称private不代表权限。DB/R2/MCP和owner保存鉴权不得改变。

旧N文件blob上传300013ms超时；旧O候选Sites源 `5bea04aa67957540bf098d8bef50fa3daa6641b4` 及本机旧O包仅含N/O，**不含P，不可直接用于本批发布**。P正式本地构建与资源清单已经更新；下一台电脑必须先读取Sites技能、在同一项目同步最新P代码和清单、重新构建并打完整包。不能把GitHub推送当上线，不能省略archive或改权限绕过上传故障。

使用同项目新凭证打开原生source helper；token只在内存/隐藏stdin，不落盘。源参数不代替fetch；核对最新Sites与GitHub的真实差异后同步。保留hosting的DB/R2/MCP和23迁移。正式build后使用 scripts/prepare-production-assets.mjs --apply，不运行旧宽泛prune。完整TAR逐文件核对构建字节、601本地素材、4894远端素材不随包及10受限副本排除；旧O完整TAR的验证不能替代P新包。

保存必须携带helper返回的同包/同SHA，拿到真实version_id再deploy；结果不明先查get_site/list_site_versions，避免重复创建。发布后验证N/O/P新增10条的同源原图HTTP/SHA与三宽作品和原图流程，再核对公开目录指纹、native存储和权限。最后一次已核存储epoch6/原快照/done206；本轮P未读回生产存储。

## 本轮验证与剩余事项

42项相关测试（含7项资源交付）、TypeScript、正式构建通过；本地只读目录夹具三宽9布局/21新图/21原图流程通过。额外10项旧测试失败在修改前版本同样复现，详见P报告。15次旧api/media本地502因无正式存储保留，不宣称全媒体无错。真实保存、全视频播放、原生缩放、用户IAB和新Figma未验。

源图证据和当前清单均在 reports/20261027-gap-p/。旧704分类与policy-reroute是上批快照；执行时须对照当前697开放tuple，不能将研究路线数量算作已补数量。
