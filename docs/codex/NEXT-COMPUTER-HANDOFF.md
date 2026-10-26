# 跨电脑接续：1925条认人图候选已验，发布上传受阻；线上仍v11

更新：2026-10-26。先fetch活动分支最新远端，读STATUS/RESUME与本文件。下面的提交用于识别成果，不是让下一台电脑回退到旧HEAD。

## 可直接转交的指令

【请接续 https://github.com/KAtOReNA7/idol 的 codex/mv-identity-quality-followup 最新远端，正式工程在 apps/idol-site/。先保护本地修改并fetch，不从旧main或根Next sandbox开始；核对AGENTS、STATUS、RESUME、设计要求、协作手册和本文件最新决定。

用户已确认并上线v11。本批19条新认人图与4张旧图提质已apply并完成本地验证，候选累计1925绑定/316作品/44团，剩余903条缺图、43张旧图待提质、18项统计未知。不要重跑已apply的A/B/C/D/E或旧图提升delta。继续按具名、精确MV、有效像素与实际3:4要求补图，不凭脸、不跨视频版本、不拿概念照代替MV图，不因缺图关闭成员评分。

本批发布受阻：242.2MB和148.2MB两个包都在OpenAI文件blob上传层300秒超时，未保存新版本/未产生部署ID；恢复核对最新仍v11。Sites推送后私密发布返回accepted=false。Sites候选源码e709d347e61bb867e41c441a961e9266c08bd824已推送，尚未上线。若新电脑有已验证可用的上传环境，可按同一项目恢复源与原图后续发；不要盲目重试旧失败路径，不换权限、不建替代站、不省略本地可用archive规避上传流程。工具/网络仍不可用就保留具体阻断，继续不依赖发布的实际资料/代码工作。

保持51团已确认设计和Apple Music主站、稳定ID、个人数据、既有关联、5条精确无真人规则、owner-private只读权限。个人页统一排版仍待用户决定。按合理批次交付实际网页/资料增量、验证、报告及GitHub提交推送；沿用已给授权，不重复等待旧逐团确认。先简短汇报核对版本/阻断/本批目标，再继续实际开发。】

推荐：Codex当前编程主力模型，高推理。资料身份和版本需逐条核对，不能只抓图计数。

已有仓库的默认fetch可能仅跟踪旧分支，可明确获取本任务：

~~~sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
~~~

检查本地/远端及工作树后再快进或建隔离工作区，保留现有修改和分叉。

## 当前共享成果

- 分支：codex/mv-identity-quality-followup，draft [PR #41](https://github.com/KAtOReNA7/idol/pull/41)，基线codex/mv-cover-and-identity-batch的3d36849735767b374075e03779a35b61ba5b900e；未合并GitHub main。
- 公开原图/运行实现：e3f9933f999a1c18c5efb40f76e1732b10a4d94b。发布预算工具：b8071d937a37df7d296de52f4f6e6b9a8b8fd51c。后续文档与证据以分支最新HEAD为准。
- [本批报告](mv-identity-quality-followup-report-20261026.md)、[验证JSON](mv-identity-quality-followup-verification-20261026.json)、[本轮worklog](worklogs/20261026-mv-identity-quality-followup.md)、[903条待补CSV](reports/20261026-v12/missing-mv-identities.csv)。目录名v12是候选归档，不是已保存/已上线版本。
- [D批](mv-batch-d-20261026.md)：ifeye r u ok? 3，ODD YOUTH I Like You 4；[E批](mv-batch-e-20261026.md)：GENBLUE ACT LIKE THAT与BADASS各6。[旧图提升](mv-quality-promotions-20261026.md)：Jisun WE GO、小娟/Minnie/雨琦TOMBOY共4。
- 19公开原文件10,475,508 bytes已完整入仓，未压缩；4个旧主图完整留为alternate，旧原文件仍在。研究/最终3:4联系表、截图、原字节验证在reports/20261026-v12/和reports/20261026-quality-promotions/。
- 本批主代理与研究子任务均已收尾，无须等待远程代理。原电脑旧izna工作区22个未提交文件保留且另存补丁备份；不能把它们混入此任务。

## 实际验证和边界

- 23专项、类型与正式构建、运行投影check通过。2种预算错误CLI实测拒绝，防止把必要封面/索引图移出站内。
- Windows同机Playwright+实际系统Chrome155，320/390/1440：18作品布局、69图加载/3:4、29原图/键盘焦点/返回流程通过，console warning/error、pageerror、非读取请求均0。首份大包本地也通过；最终小包独立复验，不继承v11。
- 23受影响远端原图及588份改GitHub传输图，HTTP/类型/长度/SHA/解码全通过。最终735份同站原文件长度/SHA通过；724为/artist公开原图，其余含既有私密UDTT。
- 52路由CSS仅固定资源引用与行尾规范化后相同。实际bundle深比仅catalog.loadedAt构建时间戳不同，其他公开值、ID、关系相同。
- 候选线上浏览器未验（根本未部署）；真实保存、全视频完整播放、80%/125%原生缩放、用户IAB、新Figma、全仓测试未验。不能用本地或旧v11结果替代。

## Sites身份：候选源与已上线版本分开

|字段|当前值|
|---|---|
|指定站点|https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/|
|project_id|appgprj_6add2704bc6c81918d3e0e2f13130422|
|权限|owner-private，静态只读，仅owner，无外部访客|
|最新已保存/已上线|v11，用户已确认|
|v11保存版本|appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4|
|v11成功部署|appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d|
|v11已发布源|c28c945987e22803b81ea266e6aaadf1ce972cb0|
|最新候选源仓库HEAD|e709d347e61bb867e41c441a961e9266c08bd824，未保存/部署|
|候选publicRef|e3f9933f999a1c18c5efb40f76e1732b10a4d94b|
|最终静态 / gzip包|163,153,529 / 148,157,406 bytes|
|同站预算|138MiB，695份必要封面/索引/修复图共143,354,239 bytes仍在站内|

**apps/idol-site/.openai/hosting.json仍属于旧v186项目，不能用于本次发布。** 先读Sites技能，以同一project_id的原生工具恢复专用源checkout，核对其中hosting.json和实际远端HEAD。候选源HEAD比已上线源新，不得据此宣称已上线。

恢复后运行根部hydrate-review-originals.mjs dist：依据manifest从固定公开GitHub提交恢复精确忽略的724份原图并核长度/SHA；源README的67是旧数。按新机实际网络配置，不复制旧代理、token或Chrome路径。Lu历史图已跟踪在同一Sites源，SHA256=b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9；其他既有UDTT限制图保持原Sites范围，发布包不进公开GitHub。

若直接续发已冻结候选，可恢复原字节后用Sites原生helper从同一e709源打包、推送和发布，无需重新开发。若有新的网页/数据变化，从正式工程生成新的仓库外输出：

~~~text
node scripts/build-all-review.mjs --out <仓库外绝对目录> --udtt-portrait <恢复Sites源>/dist/review-all/udtt/lu-historical.jpg --public-ref <含全部公开原图且已推送的40位GitHub提交> --portrait-budget-mib 138
~~~

默认预算仍230MiB，仅本批为降低上传负担用138；不能低于必要封面/索引。原图通过固定GitHub传输，未重压缩。同步新产物时只删除经旧manifest/SHA确认的旧生成载体，不删源码原图。再核ignore精确清单、容量、权限及当前源状态；有新证据恢复后做受控发布，未成功则如实保留阻断，不建立循环重试或新站。

## 下批缺口与使用工具

当前1925绑定覆盖316作品/44团；903条已有关系缺图、43低清主图、18未知统计。289作品无公开认人图，其中133原无成员关系不能猜全员。部分统计本批实际复查无新合格数值，未宣称18项全部重新覆盖。个人页统一排版仍待决定。

H2H 390px拼图、ILLIT柔糊/精确版本歧义、AtHeart文字覆盖候选继续pending；Kaede及LOONA6个旧图备选也未提升。官方具名MV现场照可采用，但须明确区别于MV截图；没有精确版本依据的同歌/同妆造不能套用。

正式工程安装Node>=22.13.0，在apps/idol-site使用自身lockfile运行npm run install:ci。新批次先冻结当前审计SHA，使用scripts/import-mv-identity-batch.mjs默认dry-run；路径白名单目前精确到batch-[abcde]-20261026，新日期/批次需有界扩展。旧图提升用scripts/promote-mv-identity-alternatives.mjs，仍默认dry-run并另审；不偷偷覆盖原图。

~~~text
node --test tests/mv-identity-batch.test.mjs tests/promote-mv-identity-alternatives.test.mjs tests/mv-public-media.test.cjs tests/mv-member-policy.test.cjs
node scripts/build-mv-public-media.mjs --check
npx tsc --noEmit
npm run build
~~~

以上是校验命令，不要重新apply已完成的D/E或提升delta。每批代码、来源、报告和worklog同提交，推送前复查公开仓库与数据分享范围；结束维护STATUS/RESUME与本入口，分别报告资料、功能、设计保护和上线状态。
