# 公开署名、认人参考与销量校正（2026-10-28）

本批已发布 **v196 / succeeded**：[正式站](https://idol-lens-private.wuke40758.chatgpt.site/)。GitHub实现 `ec13cce54daf3df0274f0fc1e9f86b17da554be7`，仍在 `codex/statistics-relations-followup-20261027` / [PR44](https://github.com/KAtOReNA7/idol/pull/44)，未合main。Sites源 `2d41b09d477112e65f72536cdeea2791ac9b3bf8`；部署 `appgdep_6ae0d4e45eac8191bf38dc9358b358d0` 于2026-10-27 16:44:36 UTC成功（北京时间2026-10-28 00:44）。GitHub提交与正式发布分别留证。

用户选择的7条报道时间轴已在v195发布，实际生效日期仍保留未知；本批接续新的内容补全。

## 本批处理

| 类别 | 处理 | 证据边界 |
|---|---|---|
| NMIXX《FEIFEI》 | 六人公开录音署名及同系列认人参考 | The Kraze逐名描述演唱并嵌入精确视频；不称逐人MV出镜核验 |
| BADVILLAIN《+82》 | Emma一人公开参演资料及认人参考 | OSEN具名，发行文章桥接精确上传；保留部分名单，不推定其余六人 |
| Weeekly《Stranger》韩文版 | 六人录音阵容、认人参考及无真人规则 | 成员本人采访明确不出镜，韩文锚点精确匹配；未独立完整播放，不影响其他上传版本 |
| Rocket Punch《ドキドキLOVE》 | 当期六人发行阵容及认人参考 | 唱片公司发行稿及发行日采访；含历史成员JURI，不改变当前团籍 |
| fromis_9销量 | 1,151,613 → 1,152,076 | 两张标准版用年榜替换同年已存月榜，净增463；保留39原月行及独立KiT/Weverse版本，不重复累加 |

四作品共19人次认人参考，使用既有完整原件，新增图片文件0。累计42作品、263人次、123份不同原件；参考照用于辨认演唱者，不宣称全部是目标MV同期妆造。Weeekly及Rocket Punch各为同一具名系列；同系列中个人衣服并不完全相同。BADVILLAIN仅一人。私人关系、评分、备注、观看记录不由公开署名自动创建。

fromis_9数据口径为韩国Circle公开月榜与两项年榜校正的来源覆盖下界，截至2026-07，不是全球终身销量。FUN FACTORY标准版56,468→56,121（−347），from our Memento Box标准版157,872→158,682（+810）。官方榜单当前正文仅返回壳，值由官方搜索索引与具名可读转录交叉支持，完整来源层级见统计证据。

## 仍未完成

- 131原无私人关系作品中：42有有限公开署名，6有确无真人证据；《Stranger》同时属于两类，去重覆盖47，仍84待证。这里的待证作品不等于既有关系缺图。
- 17未知统计仍为5个已存在X账号人数、9销量、3一位；内部保留未知，按用户决定显示或隐藏。tripleS销量371,716差异仍未闭合，fromis_9差异已解决。
- 482已匹配舞台、123待核舞台及9歌曲身份占位保持；本批未新增舞台绑定。新搜索线索未达到精确版本核验要求，不冒充完成。
- 7时间轴原事实生效日期仍未确认；v195已按用户选择显示报道记录。个人页面统一排版继续待用户决定。
- 已有2828公开认人绑定及12原生图保持，既有有效关系缺图0；632封面保持。A–Y/Z不重复。

2026-10-28后续诊断：Soridata下载页和验证码资源均返回429封禁HTML，不能完成自助下载。停止该路线，不再要求用户下载；改用已存36个月榜行及Circle年榜逐发行/版本核对。此前自动读取可能有关，但无法确定具体触发请求。见 `statistics/soridata-download-blocked.md`；不以其他聚合总数直接覆盖未解释差额。

## 证据与验证

本批证据目录：`docs/codex/evidence/20261028-followup/`。逐作品账本为 `131-work-resolution-ledger.json`；来源、原件SHA及范围见 `work-members/`、`root-credit-candidates/`；销量复算见 `statistics/`。

40项定向测试（9文件）、TypeScript和正式构建通过。已修正过期测试的“全局16作品”固定数，改为核对原13项研究子集；新增UI测试中的函数克隆和VM对象比较问题也已修复。没有以移除业务断言通过测试。

本地与正式分别通过12作品布局、57图片槽及12实际流程（4原图、4来源、4成员跳转）；另fromis9信息与Stranger无真人政策各3宽。正式使用实际匿名目录API，未使用relay或fixture；全部API200、无页面/控制台错误、应用写入0。本地因既有开发API限制，使用实时匿名正式GET响应原样转发，15次转发有SHA记录，不冒称本地原生存储验证。生产fromis9首次320/1440截图遇到目录重绘导致DOM节点断开，保存初次诊断，等待真实catalog响应后仅重验这两宽并通过；不是资料缺失或布局回归。

完整冻结包1402文件、展开TAR43,095,552 bytes、gzip19,132,841 bytes，SHA256 `9748724513c755e20c93d0377a3701b2c2649bb03f6c812f5efd091e4afaa089`。上传回执内容字节和42,936,320是另一统计口径，不等于带TAR头/填充的展开大小。全部包内字节、578本地原件、5418远端排除、10受限副本/别名排除、23迁移与hosting通过；原件manifest5996及固定ref、UDTT守卫/原件策略、authority源均保持v195。

实际用户Chrome既有登录的新标签只读核对：51团/338成员/614作品/2845原始评分行的保护字段完整hash与v195一致，不保存具体个人值。2845包含5既有空/无效行，有效关系2840，不当作缺图。native/epoch6/原快照/done206、public/1owner/0外部/0组/revision2及owner保存鉴权保持。原登录问题已解决，不要求用户重复登录。

各研究子目录README和findings保留准备候选时的原文状态；最终是否采用、数量和发布以根账本与publication-v196.json为准。不进行真实私人保存，不宣称全视频播放、原生缩放、新Figma或全仓测试通过。历史SSR夹具及favicon404继续列为遗留。


## 本批入口

- [NMIXX · FEIFEI](https://idol-lens-private.wuke40758.chatgpt.site/?view=works&work=recvxyOz5XRfn5)
- [BADVILLAIN · +82](https://idol-lens-private.wuke40758.chatgpt.site/?view=works&work=rec28ldfRTrEsc)
- [Weeekly · Stranger](https://idol-lens-private.wuke40758.chatgpt.site/?view=works&work=recvxyH5pzr7Nc)
- [Rocket Punch · ドキドキLOVE](https://idol-lens-private.wuke40758.chatgpt.site/?view=works&work=recvxyH5pzA9lj)
- [fromis_9 信息](https://idol-lens-private.wuke40758.chatgpt.site/artists/fromis9/)
