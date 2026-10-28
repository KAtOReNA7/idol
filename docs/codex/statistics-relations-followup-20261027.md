# 统计与无既有关系作品续作 · 2026-10-27

本轮从显式 fetch 后的 `origin/main` `852f7506a4f921fff4e4d24fe70e8d607c7d40f5` 开始，新分支 `codex/statistics-relations-followup-20261027`。开工工作树干净，PR43合并提交已包含；没有 reset、clean、强推或重导 A–Y/Z。正式工程为 `apps/idol-site/`。

## 本轮实际完成

- EVERGLOW 新 INS `@everglow.offcl` 补入 **86,501**，按既定规则显示 **9万**。这是 [J-Enta按账号列出的历史快照](https://www.j-enta.com/en/artist/386/EVERGLOW)，原始日期 **2026-05-30**，本轮核查日2026-10-27。页面保留日期和“非实时”来源说明，不使用旧账号 `@official_everglow` 的2400599人。
- 未知统计 **18→17**：剩5项社媒、9项销量、3项一位。未知值在证据中仍为null；按用户既有要求展示0，未知/零X整项隐藏。没有把未知改成“确认零”。
- 新增 **12支 tripleS 作品、106个人次的公开署名**。连同原4支，公开资料覆盖16支无既有关系作品。另修正《Password》错指《Untitled》的来源，8人名单核对后保持不变。
- 为全部 **133支无既有成员关系作品**建立逐项台账；其中16支有部分参演或录音署名资料，117支仍待核实。本轮深入核读的是13支 tripleS，不能把台账登记说成133支全部穷尽研究。
- **没有创建私人关系或评分行**。原133数量不减少；公开录音署名不等于逐人MV出镜核验。

2828认人图绑定、628封面、现有关系缺图0、旧低清0保持。没有新增/替换认人图，不重复原871已完成工作。官方和民间具名同套图均可采用的政策已符合用户最新要求；保持清晰自然、身份可靠和来源标签真实。

## 作品资料

| 作品 | 公开署名人数 | 采用依据 |
|---|---:|---|
| Cherry Gene | 8 | 公司消息确认AAA/KRE合作；KProfiles具名名单，明确标民间资料 |
| Just Do It | 4 | Korea JoongAng Daily引用MODHAUS的NXT名单 |
| Inner Dance | 4 | Genie官方发行正文Glow名单 |
| Password（来源修正） | 8 | Sony对应发行公告及Natalie授权JOYSOUND具名正文 |
| Bubble Gum Girl | 6 | Korea Times发行现场报道sun分队 |
| Cameo Love | 6 | 同上，moon分队 |
| Christmas Alone | 24 | 报道明确24人录音，不从当前名册自动推定 |
| Fly Up | 6 | 发行报道neptune分队 |
| Q&A | 6 | 发行报道zenith分队 |
| Baby Flower -Japanese Ver.- | 24 | Sony明确完全体日语发行；SMEJ同期具名名单 |
| Dream Dress | 6 | SMEJ官方公告moon名单 |
| DNA | 6 | SMEJ官方公告sun名单 |
| Welcome to Heaven | 6 | SMEJ官方公告neptune名单 |

逐作品精确workId/videoId、姓名、原始链接、来源层级及验证边界：[研究证据](evidence/20261027-statistics-relations/triples-credits.json)。13支视频核对官方oEmbed标题/账号；未完整播放或逐人核验出镜。图像缺失不影响评分的规则与5条确无真人精确视频规则保持。

## 统计中仍未解决的问题

| 范围 | 结论与排除原因 |
|---|---|
| GENBLUE / Cherry Bullet X | 第三方0/0、无更新日期为占位；不作为确认0 |
| VVUP / EVERGLOW新X | 推荐卡缺日期；旧账号人数不能移植 |
| GIRLSET X（VCHA资料入口） | 28K/38K缓存冲突，统计日期不明；不转作VCHA旧品牌人数 |
| BADVILLAIN销量 | 二手《Overstep》5367是单张数；Circle原表未独立读取，暂不纳入累计 |
| VVUP销量 | Weverse公告《VVON》实体延期至10月29日，本轮尚未到发行日 |
| BEWAVE / UDTT销量 | 单店商品计数12及17/3不能代替全渠道累计 |
| Geenius / TRACER / W!TCHX / SPIA / VCHA销量 | 缺可核累计；同名OST、数据库0+、数字发行或新品牌数据不能补作总计 |
| GENBLUE一位 | ACT LIKE THAT单曲页面明确0，THE SHOW第二名；不代表全团累计。纠正旧“空表”描述 |
| TRACER / VCHA一位 | TBA或旧讨论不是全时期累计依据 |

完整18项复查、采用与拒绝原因：[统计研究台账](evidence/20261027-statistics-relations/statistics-review.json)。保留原始显示政策，未伪造缺失数据。

## 验证与遇到的问题

- 27项相关测试通过；TypeScript通过；正式Worker构建通过。覆盖精确work/group/video绑定、成员姓名、无私人评分写入、历史统计日期、原图代理与无成员视频规则。
- 本地使用线上公开目录夹具检查手机390和桌面1440，共28处布局、2次成员跳转；无页面异常，已人工查看手机署名与信息区截图。不是生产私人数据写入测试。
- v192线上真实公开目录复验同样28处布局、2次成员跳转通过，无页面异常，截图已核看。首轮在EVERGLOW信息区截图时遇到元素刷新脱离DOM；保留失败回执，等待模块稳定后从未完成项续测通过，没有改页面来绕过检查。
- 初次Git fetch连接迟滞，重新采用局部代理及HTTP/1.1后完成，未改变全局代理。Sites短期源凭据过期后正常续签，凭据不入文件或日志。
- Windows默认CRLF转换导致首次生成数据检查失败；仅在新Sites checkout设置LF。恢复5份清单固定原件文本的原字节后完整包通过；另8份本轮规范化影响的历史文件已恢复。GitHub应用仅2份数据和2份测试变动，设计、原件、个人数据及鉴权未改。
- 完整TAR **42,507,776 bytes / 1,398文件**，gzip **19,052,341 bytes**。每个包文件与构建产物逐字节核对；578本地原件SHA通过，5403远端原件未混入包，10受限副本排除。4MiB一般光栅预算与固定原件ref保持。
- 本轮不声称全仓测试、真实私人保存、全视频播放、逐人MV出镜、原生缩放、用户IAB或新Figma验收。个人页统一排版仍待用户决定。

## GitHub与正式部署（分别记录）

GitHub实现：`8cc3d9f92df7095f54b92993152b79324ba69268` 已推送新任务分支，[PR44](https://github.com/KAtOReNA7/idol/pull/44) 尚未合main。报告和交接更新随同分支提交，不自动合并。

Sites **v192 / succeeded**，源 `721a0cf28e26d48c611bd2a06183412d1889e861`，部署 `appgdep_6ae0a42959108191aa2c4a64d61f87e9`；见[发布回执](evidence/20261027-statistics-relations/publication.json)与[线上复验](evidence/20261027-statistics-relations/production-browser/verification.json)。正式地址：https://idol-lens-private.wuke40758.chatgpt.site/ 。

发布前后51团/338成员/614作品/2845关系的全部公开投影字段逐项一致；native/epoch6/原快照/done206及public/1owner/0外部/0组保持，未调用私人保存。

后续优先继续117支暂无公开署名作品的精确版本研究；其余16支仅完成有限公开署名，不把它们标为完整MV演员核验。17项统计保留来源冲突和缺口。任何关系扩展须有具体证据，不创建虚构私人评分行。
