# Astra 15 团收官状态

> 2026-10-22 交接核对稿。本文件区分现有网站、独立候选、设计和验收，不以历史候选报告覆盖更新的原生实现。源码及素材是否已入仓，应以实际文件和提交为准。

## 两项已澄清的“旧交付缺口”

- GENBLUE 后续实图排版和 8 张 320 画板虽未进入 Astra 的旧 v0 包，主会话已独立完成原生 v2.2 并完成相应 QA。此项不作为 Codex 重做任务；保留当前原生候选，继续补真实未完成项和用户验收。
- izna / ifeye v3 实际文件已经取得并校验，不能列为“缺包”。其完整本批 15 份源码可保留；原始 ZIP 不含运行原图，但本次已精确恢复 15 项，并以相对路径复用 v186 另 15 项相同字节，30 项素材输入已闭合。它仍不是完整网站。历史浏览器重试/取消/焦点/生命周期复验已通过，但不能由此推断已合入或已上线。

## 逐团矩阵

“现有原生路由”表示在 v186 真实原生源码中已核对到页面入口，不代表该行全部新设计都已发布，也不替代实际页面验收。

| 团体 | 现有原生路由 | 可保留的独立成果 | 尚未闭合的事项 |
| --- | --- | --- | --- |
| Hearts2Hearts | /artists/hearts2hearts | 原生稿、主站页面 v1；保留后续两项 CSS 修复，勿被旧包覆盖 | 完整设计验收未闭合；历史部分浏览器超时待核；11 条视频父发行未确认 |
| SAY MY NAME | /artists/saymyname | 原生稿、截图、流程证据、主站页面 v1；保留时期关系和报道图语义 | 5 条视频父发行未确认；七人到八人的历史边界；不能用报道图替代视频预览 |
| izna | /artists/izna | 已取得完整本批 v3；正常态历史多宽检查和后续图片恢复流程复验保留 | 原生 Figma 缺图；宿主/评分能力与素材映射仍须按实际集成核对；候选上线未证实 |
| ifeye | /artists/ifeye | 同一 v3 交付；保留用户封面 821:52 和历史复验 | 原生 Figma 缺图；不能据既有原生页推断隔离 v3 已上线 |
| GENBLUE | /artists/genblue | Blue Cut 24 个主要实图画板；主会话原生 v2.2 已实现并 QA，不重做旧 v0 缺口 | 8 项精确视频图、8 条参演关联、BADASS 父发行 null；实际窄视口/超宽检查按主会话最新记录补齐；待用户验收，非正式上线确认 |
| VVUP | /artists/vvup | 主站隔离候选、完整构建与客户端验收记录 | Figma 未填槽；历史 Hyunny 图语义；旧候选路径清理与最终发布状态须按主会话源核对 |
| YOUNG POSSE | /artists/youngposse | 16 个 1440/390 实图画板及上下文；v2 已原生移植，主会话确认上线 | 保护已认可设计；其余资料缺项不得因上线自动归为完成 |
| BEWAVE | /artists/bewave | 首页、成员目录/详情、作品、时间轴五类页面候选 | 无完整原生设计验收证据；新候选的主站整页验收与上线未确认 |
| Candy Shop | /artists/candyshop | 五类页面候选 | 同上，不能把现有路由存在当新候选已验收 |
| ODD YOUTH | /artists/oddyouth | 五类页面候选 | 同上 |
| ADYA | /artists/adya | 主站候选、采恩历史拼图接入；构建、客户端及图片失败/焦点复验记录 | 采恩标准头像仍缺；与 VVUP 合计 2 槽已填、26 槽未填；最终发布状态未确认 |
| Geenius | /artists/geenius | 五类页面候选 | 无完整原生设计及新候选整页验收；YUINA 拼贴不可当标准头像 |
| TRACER | /artists/tracer | 五类页面候选 | 四名成员缺图；完整原生设计、新候选整页验收与上线未确认 |
| W!TCHX | /artists/witchx | 五类页面候选 | 无完整原生设计及新候选整页验收，最终上线未确认 |
| SPIA | /artists/spia | 五类页面候选和 Sera 历史图绑定 | Kaya、Hana 缺图；Sera 2025 个人活动照片不可冒充当前团体标准头像；新候选整页验收未确认 |

## GENBLUE 精确交接

保留 [GENBLUE 原生页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=851-1095) 与 [素材映射](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=931-1653)。源图在同一文件 0:1 页 928:1095–928:1109，不能重传、移动或按节点顺序猜成员。

| 页面 | 1440 节点 | 390 节点 | 320 节点 |
| --- | --- | --- | --- |
| 首页 | 851:1134 | 851:1421 | 946:1653 |
| 成员目录 | 851:1707 | 851:1797 | 946:1827 |
| 代表个人页 | 851:1888 | 851:1933 | 946:1907 |
| 作品库 | 851:1978 | 851:2203 | 946:1951 |
| 发行详情 | 851:2428 | 851:2479 | 946:2113 |
| MV 详情 | 851:2529 | 851:2572 | 946:2163 |
| 舞台详情 | 851:2615 | 851:2659 | 946:2206 |
| 时间线 | 851:2703 | 851:2773 | 946:2250 |

[当前原生候选预览](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue) 不是生产站。已实现和 QA 的内容保持不回退；真实 viewport 检查受阻的部分不能用缩放或 Figma 边界回读代替。

仍缺的 8 项精确视频预览：

| 作品 / workId | MV videoId | 舞台槽 videoId |
| --- | --- | --- |
| COCOCO / rec28ldfRTrCU6 | Ke5jk7Ngpqs | b7G7_EePN9s |
| ACT LIKE THAT / rec28ldfRTrCYg | 69QCKEYOAZs | wmD4rpR3Xb4 |
| BADASS / rec28ldfRTrQJ1 | _nzdeQrEg3Q | 6v3A6Y8EgjU |
| 夜市王 / recvxIZLjZmGMf | o5EdYwk8k9o | _FJCv4my4eI |

四个舞台槽原始类型是官方舞台化 DANCE PERFORMANCE，不得改称已核电视节目现场。六张成员资料图不证明当前活动人数；For You 九人封面保留历史语义；ACT LIKE THAT 200×200 封面不放大冒充高清。

## 交付版本和资料边界

以下是已有交付，不是本轮新开发。可从原交付/收官记录定位，不能用旧包整包覆盖当前原生源：

- 15 团 vNext3 合集：历史组装来源 v0。
- ADYA / VVUP：主站候选 v0。
- H2H / SMN：主站功能修订 v1，不含更晚两项 CSS 修复。
- YOUNG POSSE：内容修订 v2，对应 Library 版本 1。
- GENBLUE：旧代码候选 v0，不包含后来全部 Figma 更新，也不代表主会话当前原生 v2.2。
- izna / ifeye：Astra_IZNA_Ifeye_Main_3ca624cf_v3.zip，版本 3，420,553 字节，SHA256 338c343c8670d54af53b70d289f043b7b59a07d18d3cc1ed208124dfc1d27ae2；完整本批源码已实际取得。原始 v3 ZIP 未打包运行图；本次已另行精确恢复 15 项共 8,054,282 字节，另 15 项复用 v186 相同字节，30 项共 11,044,378 字节已闭合。主站依赖、图片解析与原生记录/评分接线仍须独立核对，不能据素材齐备声称候选已上线。

izna/ifeye 的 21 条具名关联、Hazy 三人 partial、DUMB HOT 父发行 null、18 项未确认预览保持原边界。ADYA/VVUP 的 19 个缺失预览槽对应 18 个视频 ID，不重复计为 19 个不同视频。

## 证据与使用规则

- [Astra 收官最终报告，2026-10-22](https://chatgpt.com/c/6ad0a72c-06d0-83ee-a6a1-b19e3b931767?messageId=f0fb51ae-6d44-5251-a80c-06bf32d6cfa9)
- [izna/ifeye v3 原始交付](https://chatgpt.com/c/6ad0a72c-06d0-83ee-a6a1-b19e3b931767?messageId=e453628a-a0fc-5648-8a8d-c2928f2fc2cc)
- [用户确认 v3 浏览器恢复流程复验通过](https://chatgpt.com/c/6ad0a72c-06d0-83ee-a6a1-b19e3b931767?messageId=af3fd02b-a89e-45bc-b482-92411a077a77)
- [原始 izna/ifeye 参考观察](https://github.com/KAtOReNA7/idol/blob/35c4e2aaab4d37ad23ec16791675f992471946ec/docs/design-reference-observations/izna-ifeye-20261021.md)

Astra 已提交收官报告，不代表全部 15 团开发/验收都已完成。当前没有必要让其重新导出全量工程或绕过旧环境阻塞。原生源码、精确素材、候选与生产状态分别保留，Codex 后续以项目实际文件为工作输入，不依赖继续控制旧会话。

