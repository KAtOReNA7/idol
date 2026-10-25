# 全团资料与功能补齐

## 用户决定及执行范围

2026-10-25用户确认七团v3全部通过，51团页面设计均已认可；继续既有开发目标，保护设计、原图、稳定ID、个人记录和owner-only写入。冻结基线`352affd5f439726058cf12795151bc3568b273b8`，工作分支`codex/all-groups-data-completion`，正式工程`apps/idol-site/`。

先核对133项“快照无参演关系”的真实语义，补充可证实的资料/图片，不能将录音名单当MV出镜、将公开关联当个人评分记录。BADVILLAIN《HURRICANE》并非找不到官方视频：旧记录留有MV与Performance Video两候选，因原评分版本不明确而未绑定。用户本轮明确选择正式MV `00tUzCOPI6g`；据此进行有条件的读取展示补齐，保留原始快照和所有个人字段。

## 环境与边界

- 本机Windows源码/Chrome验证；Browser plugin not available，使用既有Playwright，不装新浏览器。
- Sites源checkout为现有全团审阅站，已通过source helper打开，当前v3且owner-private。
- 只读审阅发布，不覆盖正式主站v186，不新增原生评分记录，不执行生产保存。
- Sites技能允许有界素材研究，两个子任务只读核查公开视频/封面与已有成员参与证据；主代理负责源码与发布。
- GitHub已fetch，开工工作树干净，基线与远端一致；本轮发现的已核资料与实际网页增量同提交推送。

## 已实现的网页增量

- MADEIN S《BLUE》补入Bugs 1200×1200正版封面及来源，原字节147719 bytes；当前登记四项MADEIN发行均有图，不宣称历年目录完整。
- BADVILLAIN《HURRICANE》依据用户选择绑定正式MV `00tUzCOPI6g`，补1280×720原始预览图；音源发行2024-06-24与MV公开2024-07-10分开。仅对稳定作品ID、唯一团体ID、曲名和空URL同时匹配的读取结果补齐；后来已绑定的URL不覆盖，原始快照与个人字段不改。
- 四项作品的15条公开资料接入作品详情和成员详情：ifeye Hazy三位具名MV幕后参与者、tripleS Password八位录音分队成员、ILLIT See U Tonight两位署名艺人、I Got Your Back韩语版两位HANA署名成员。三种证据性质明确分开；不生造个人评分行，不影响均分，不推定全员出镜。其中ifeye三条已有团页证据本轮接入共享手帐，非新发现。
- 团体数据投影保留精确署名客串成员及其对应作品；已有个人关系仍走原来的成员作品区，避免重复。
- 两条时间轴据新读取的官方正文升级ready：i-dle全员续约2024-12（月精度）、NewJeans Attention首支MV公开2022-07-22（日精度）。稳定事件/作品ID保持，历史来源、改前改后事件及完整文档SHA保存在`docs/codex/evidence/20261025-data-completion/timeline-evidence.json`。
- 旧14条hold逐项复核：2条本轮解决、4条已有公开替代/限定表述、8条继续待核。canonical层为611 ready/12 hold；这不等于当前页面仍缺12项，也不等于只剩8项资料缺口。

## 检查结果

- 77项针对性/回归测试通过，类型检查和正式生产构建通过。测试包含个人字段保持、空值/零分、精确版本、不覆盖新URL、公开资料与个人评分隔离、原图SHA与时间轴日期精度。
- 本机Chrome实测70项布局（10类本轮目标页×5宽，加10团首页×2宽）、5条操作流程通过；无JS异常、坏图、横向溢出或写请求。实际查看BLUE、HURRICANE、Password、See U Tonight与两条时间轴截图。
- 6项旧browser-catalog/catalog-concurrency测试失败已在冻结基线复现。修正其过时的owner/public reader夹具、canEdit环境与请求匹配后通过，未放宽生产权限。
- 扩展执行旧`timeline-production.test.cjs`暴露历史SSR夹具失配：当前与冻结文本/JSON读取覆盖复核均为8过44失败（非独立完整checkout）（43团断言及after hook），包括旧标题/旧DOM假设。该套件未通过；本轮只补两条有证据的SHA/ready预期与Windows模块查找，未批量放宽其页面断言。本轮实际页面时间轴已用Chrome验证；旧SSR套件维护仍是技术待办。
- 原图来源和SHA见两个`data-completion-20261025/manifest.json`。线上服务身份验证和发布信息将在完成后追加。

## 保留的限制与接续

- 沿用51团用户已认可设计和共享手帐业务布局，本轮仅增加公开资料区、原图及时间轴数据；不是按官网重做。参考沿用各团既有来源，新增来源在manifest、公开资料和证据文档逐项记录。
- 133是旧快照中无个人rating关系的作品数量。4作品15条公开资料不等于关闭15个个人关系缺口。Billlie ZAP与KATSEYE Touch共10条历史native关系已有真实ID，本轮未查实时生产，不能重复创建。
- 仍待核的8条涉及AtHeart2、BEWAVE1、Geenius1、GENBLUE2、UDTT2；Candy Shop原刊日、ifeye官方全文/实际执行、Rocket Punch合同实际生效日仍有各自限制，详见14项研究报告。
- 真实生产保存、全量视频完整播放、80%/125%原生缩放及用户IAB完整会话未验；本轮未同步新增资料到Figma。正式主站v186未覆盖，未合并main。

## v4发布

- GitHub已核PUBLIC，新增内容仅公共资料/两原字节图片/用户版本选择与开发证据，无新增个人评分快照或凭证。代码固定提交`0741347992ce86b8dabe276347e104de94b13c8e`已推送。
- 同一owner-private只读审阅站v4已部署成功：https://idol-all-groups-review-oct25.wuke40758.chatgpt.site 。Sites源提交`a924dbd993f409067be0f80de0feb22e788aa94a`，版本`appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_851c4c79ef448191b8c93268c98f43c7`，部署`appgdep_6adde15d1f60819192c1566a583dd82e`。
- 发布包引用上述GitHub固定提交的原字节素材；两个新增图片HTTP 200且SHA/字节数与本地完全一致。旧v3 dist备份在本机scratch，未入Sites源仓。
- open_in_codex已请求显示审阅站，返回queued；不作为IAB完整验证。

- 发布后服务身份Chrome完成40项两宽布局、5条操作流程及51团索引验证，无页面JS错误、坏图或应用写请求。初次末尾断言把1次Cloudflare平台挑战POST误列为应用写入，核对路径后单独归类；没有绕过平台挑战。线上HURRICANE桌面及BLUE手机截图已实际查看。
- 公开资料/设计/上线按各自证据报告；完整问题清单在`docs/codex/all-groups-data-completion-review-20261025.md`，机器可读摘要在同名verification JSON。

- Draft [PR #35](https://github.com/KAtOReNA7/idol/pull/35) 已创建并附加当前聊天，base为`codex/seven-groups-official-redesign`。本轮代码与最终交接均推送独立分支，未合并。
