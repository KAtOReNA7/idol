# 跨电脑接续：全部MV主题与1957条认人图候选已验；线上仍v11

更新：2026-10-26。先保护本地修改、明确fetch活动分支最新远端，读AGENTS/STATUS/RESUME。下列提交识别成果，不要求回退旧HEAD。正式工程为 `apps/idol-site/`。

## 可直接转交的指令

【请接续 https://github.com/KAtOReNA7/idol 的 codex/mv-identity-quality-followup 最新远端，先保护本地修改并fetch，不从旧main或根Next sandbox开始。阅读本文件、AGENTS.md、docs/codex/STATUS.md、RESUME.md及设计要求/协作手册的最新决定。

用户已确认并上线v11。后续D至I批累计新增51条认人图、4张旧图提升；最新候选1957绑定/325作品/44团，仍871缺图、43低清、18未知统计。A至I均已apply，不能重复导入。保留具名、精确视频版本、原字节与实际3:4有效宽至少540px的门槛，不以概念照代替MV图，不因缺图关闭成员评分。

用户最新要求已实现：605真实作品依据本身团体加载现行主题；另23展示视频保持团内原生设计；主页0或未知X整项隐藏并重排。用户明确确认所有粉丝人数：万单位四舍五入为整数，不足一万显示整数人数。底层精度/来源日期保留。新增20精确视频日期、4支MV制作名单。保留51团已认可设计，独立团页除授权信息区外样式一致；主站目录与成员页布局、个人数据/ID/关系和owner-private只读保持。

实现09005390与本地全量三宽检查已完成；Sites最新候选源1c7d7d9dd157b0c595118c3cba5d71eae594c227已推送并打包，仍未上线。此前3次blob上传300秒超时，无新环境恢复证据，本批未重复上传，无新保存版本/部署ID。源推送不是发布。待真实上传恢复证据出现后从同一项目候选续发，不改权限、不建替代站、不绕过archive。无可行发布条件时继续可靠资料补齐并如实保留阻断。

继续871缺图、43低清和18未知统计；133无原成员关系作品不能推定全员，仅5条精确无真人规则关闭成员评分。个人页统一排版仍待用户决定。将代码、来源、验证、报告及跨电脑入口一起提交推送。先简短核对，再直接继续实际工作。】

```sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
```

默认fetch可能只跟踪旧分支。先核本地/远端及工作树，保留未提交修改和分叉再快进或隔离。旧电脑 `E:/project/idol` izna工作区22处未提交修改和5未跟踪文件已与 `E:/project/idol-local-safety-20261026/` 备份逐项核对保持，不能混入本任务。

## 最新成果与验证

- 活动分支 `codex/mv-identity-quality-followup` / draft [PR #41](https://github.com/KAtOReNA7/idol/pull/41)，base为 `codex/mv-cover-and-identity-batch`，未合并main。本批起点4e7c13adb7cad420081c01ad81c460fa720307c7，实现/公开资源固定09005390a7aa887e618a74dbff31ab108c634a07。后续文档以分支最新HEAD为准。
- [主报告](mv-style-completion-report-20261026.md)、[验证JSON](mv-style-completion-verification-20261026.json)、[日志](worklogs/20261026-mv-style-and-completion.md)、[871缺图CSV](reports/20261026-mv-style/missing-mv-identities.csv)、[51团表](reports/20261026-mv-style/completion-report.html)。历史发布诊断见 [恢复报告](mv-publication-recovery-report-20261026.md)。
- H/I共14条：SAY MY NAME UFO5、i-dle Girlfriend3、BABYMONSTER HOT SAUCE4/WE GO UP1、NewJeans Hype Boy HYEIN版1，共5,632,615原字节。H/I源JSON保留生成时状态与冻结审计SHA；已导入事实以当前审计和导入回执为准，不再apply。
- 605真实作品涵盖50团，51主题均登记；W!TCHX仅有展示视频，不虚构Work。颜色/字体证据在 `data/work-theme-tokens.json`，生成用 `scripts/build-work-theme-tokens.mjs`；`body .work-experience[data-work-theme]` 防止晚加载旧CSS覆盖。
- 20日期依据精确官方视频publishDate按Asia/Seoul显示，保留原时间戳。共享页只读映射精确作品/group/video，不覆盖已知日期、不改原快照。四MV制作名单见 `data/public-production-credits.json`，不是成员关系证据。
- 52专项、编辑流程mock、类型、正式构建、图片投影及主题tokens检查通过。本机Windows Playwright+Chrome155（Browser plugin unavailable），320/390/1440：605作品1815布局、23展示视频69布局、51团信息区153布局；新图15布局/42槽/19原图流程、另40往返与资料流程通过。console error/warning/pageerror为0，被监测作品/原图流程非读取请求0。
- 14新远端原图HTTP/类型/长度/SHA/解码、735站内原文件长度/SHA通过。51团CSS仅排除授权信息区规则和资源ref后AST相同；共享index.css为本次授权改动。公开payload仅20日期的40上下文值及52个loadedAt变化，其他字段深比较相同。
- 完整TAR909静态文件与源输出逐字节相同。工具额外生成的 `dist/.openai/hosting.json` 与源配置仅CRLF规范化差异，另行精确验证；无越界路径/符号链接。

候选未部署，没有本批线上浏览器结果。真实个人保存、全视频完整播放、80%/125%原生缩放、用户IAB、新Figma和全仓测试未验。技术验证及旧v11确认不等于用户验收本批新呈现。

## Sites身份与恢复

|字段|当前值|
|---|---|
|指定站点|https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/|
|project_id|appgprj_6add2704bc6c81918d3e0e2f13130422|
|访问|owner-private静态只读，仅owner，0外部访客/允许组|
|最新保存/上线|v11，用户已确认，本批原生工具复读仍为11|
|v11 saved version|appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4|
|v11部署|appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d|
|已发布源|c28c945987e22803b81ea266e6aaadf1ce972cb0|
|最新候选源HEAD|1c7d7d9dd157b0c595118c3cba5d71eae594c227，未保存/部署|
|candidate publicRef|09005390a7aa887e618a74dbff31ab108c634a07|
|静态输出|163,717,267 bytes / 909文件|
|冻结gzip包|148,240,469 bytes|
|包SHA256|dc1b54658ee0605bb30988b62cd5142bebe26121cadd9d5bdfa936ff99d57d75|
|同站原文件|724公开原文件；另11受限原文件留同一Sites范围，合计735份原文件验证|

`apps/idol-site/.openai/hosting.json` 属于旧v186，不能用于本轮发布。先读Sites技能，以表中project_id用原生工具打开专用源，核hosting.json与源HEAD。源比线上新，push成功不是部署成功。

恢复专用源后运行 `node --use-env-proxy hydrate-review-originals.mjs dist`，从manifest固定09005390恢复724份被ignore原文件，核字节/SHA。README已更新，仍以manifest为准。Lu历史图已跟踪在同一Sites源，SHA256 `b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9`。其他受限UDTT图留同一Sites范围，不把发布包或受限图传到公开GitHub，不跨电脑复制旧代理/token/浏览器路径。

本机源 `E:/project/idol-review-source-oct26`，包 `E:/project/idol-mv-theme-qa-oct26/candidate-site.tar.gz`，预览产物 `E:/project/idol-mv-theme-review-oct26`。新电脑从原生源恢复，不依赖这些本机路径。源helper拥有提交推送流程并清理临时远端，没有origin不表示未推送。

此前242.2MB、148.2MB两包在westus3超时，后来148.2MB包在southcentralus受控重试300,011ms超时；均无保存版本/部署ID。最近request ID `f8c4a417-c66f-4051-86ed-e8ad60d30b4f`。根域名HEAD/GET可连接不等于大包传输恢复，不循环重试。原生publish_on_push此前accepted=false，不能把源提交当发布。

有上传环境实质恢复证据后，可由原生helper从同一最新候选重新打包，使用其返回project_id/commit/archive保存并私密部署。仅在实际返回deployment ID后查状态，未知结果先核服务端，避免重复保存。不得省略本地已存在的匹配archive来绕过上传。

## 下批资料与重建

1957绑定/325作品/44团，871已有关系缺图、43低清、18未知统计；280作品无公开认人图，其中133无原成员关系不能猜全员。H覆盖19作品/70冻结缺图，I覆盖178作品/815冻结缺图；I有29作品官方正文受限、125仅库存/档案索引层。覆盖记录不是事实确认，也不是全部来源已穷尽。

继续精确视频/语言/表演版本消歧、具名来源与实际画面审查。H2H低像素拼图、ILLIT柔糊/版本歧义、AtHeart文字覆盖、无具名合照继续pending。统计未知与来源确认零保留区别；主页X隐藏是显示决定，不删证据。所有研究子任务已收尾，不需要等待代理。

Node>=22.13.0，使用apps/idol-site自身lockfile，依赖齐时不重复安装。导入脚本默认dry-run；路径白名单 `batch-[abcdefghi]-20261026`，新批需有界扩展并测试。旧图替换需promotion审核并保留原文件。

```text
node --test tests/group-information.test.mjs tests/work-experience.test.cjs tests/experience-route-precedence.test.cjs tests/group-detail-ssr.test.cjs tests/public-production-credits.test.cjs tests/public-video-dates.test.cjs tests/mv-identity-batch.test.mjs tests/promote-mv-identity-alternatives.test.mjs tests/mv-public-media.test.cjs tests/mv-member-policy.test.cjs
node tests/editor-flow.test.cjs
node scripts/build-mv-public-media.mjs --check
node scripts/build-work-theme-tokens.mjs --check
npx tsc --noEmit
npm run build
node scripts/build-all-review.mjs --out <仓库外绝对目录> --udtt-portrait <恢复Sites源>/dist/review-all/udtt/lu-historical.jpg --public-ref <已推送且含全部公开原图的40位提交> --portrait-budget-mib 138
```

只清理经旧manifest/SHA确认的生成载体，源原图不删、不压缩。重建后重新核必要封面、完整TAR和候选源字节一致，分别报告资料、功能、设计保护和真实上线状态。
