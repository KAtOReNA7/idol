# izna / ifeye v3 候选交接

> 独立候选，非完整网站、非已上线版本。请保留现有原生页面与后续修复，不直接覆盖生产源。

## 已核交付

- 文件：Astra_IZNA_Ifeye_Main_3ca624cf_v3.zip，Library 版本 3。
- ZIP：420,553 字节。
- SHA256：338c343c8670d54af53b70d289f043b7b59a07d18d3cc1ed208124dfc1d27ae2。
- 2026-10-22 已取得实际文件，安全解包为 74 个文件、1,154,787 字节；ZIP CRC、73 项文件清单和 15 项源码 after 校验值全部一致。本次未执行包内命令。
- source/ 包含本批完整 15 份源码，不是只有差分。原始 ZIP 中的 patches/update-from-v2.patch 仅适用于精确 v2 前像，不能直接套到当前网站；本便携交付不依赖该旧补丁。
- 常见凭证/私钥模式检查未发现命中。这不是对所有未知秘密形式的绝对保证。

原始交付与后续验收：
- [v3 交付记录](https://chatgpt.com/c/6ad0a72c-06d0-83ee-a6a1-b19e3b931767?messageId=e453628a-a0fc-5648-8a8d-c2928f2fc2cc)
- [用户确认真实浏览器复验通过并冻结候选](https://chatgpt.com/c/6ad0a72c-06d0-83ee-a6a1-b19e3b931767?messageId=af3fd02b-a89e-45bc-b482-92411a077a77)

## 保留的实现与边界

v3 实现成员详情本图重试、加载中、取消、再次失败和恢复后的键盘焦点，保留离开/卸载/晚到回调守卫。2026-10-21 后续验收已确认这些流程通过，不要求重复修同一缺陷。包内早于该验收的“等待浏览器复验”文字是历史状态。

保留 13 份成员资料、11 条发行、22 个视频槽、13 条事件、21 条具名关联、历史成员区、Hazy 三人 partial、DUMB HOT 父发行 null。18 项未确认预览及参演关系仍不得补成“全员已核”。Mamma Mia 490×266 预览不放大，不裁水印或时长。

Figma 仍未完成全量实图闭环。用户封面节点 821:52 必须保留 416×416、FIT 和原图身份：
- [izna 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=812-19251)
- [ifeye 作品库](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=812-1456)
- [受保护的 ifeye 封面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=821-52)

## 源码和宿主依赖

候选入口是 source/app/design-review/astra/{izna,ifeye}/，对应 source/components/design-review/ 和 source/lib/idol/design-review/astra-izna-ifeye-runtime/。

原始 v3 ZIP 没有 package.json、锁文件、完整主站依赖、部署配置或运行原图；本便携目录已按下节恢复15张原图，并映射复用基线另15张。它依赖 React、Next 兼容接口、主站 lib/idol/journey.ts 的 routeUrl、lib/idol/artist-navigation.ts 的 safeArtistReturn，以及只读图片解析、原生身份导航和评分能力契约。两项主站模块在真实 v186 原生源中存在，但本次未验证将此候选移植后的完整构建或实际评分保存。

截至本次核对，v186 原生源已有 app/artists/izna/ 与 app/artists/ifeye/ 页面，但没有本包的 15 个隔离候选目标路径。这证明“既有原生页”和“此隔离 v3 候选”不是同一份路径交付，不能据此声称 v3 已合入或已上线。

包内 3ca624cfb15055d7e4f2fa088fe32edbeb75bbe8 是历史主站摘包基线标识；在 KAtOReNA7/idol 未找到该 Git commit。不得构造该 SHA 的 GitHub 输入链接，也不得把仓库根部 Next sandbox 当作完整宿主。后续集成必须使用经核实的真实原生源码；正式工程 apps/idol-site 已由 `f24075fc98893793e82adbc92cadc9e58257728f` 导入并推送；此候选仍未应用。

## 素材已精确恢复，运行接线仍须核对

ASSETS.json 列出 30 项运行图片，共 11,044,378 字节；原始 v3 ZIP 不含这些原图。本次已完成有界恢复：15 项复用 v186 public 中完全相同字节，仅记录相对路径；另外 15 项原字节存于 assets/，共 8,054,282 字节。ASSET-RECOVERY.json 逐项记录位置、大小与 SHA256，无待恢复项。恢复图的大小、SHA256、尺寸和解码均通过，未重编码。Figma 截图不是运行原图替代。

- 21 项引用 Astra_15Groups_Batch02_Repair_20261020.zip，版本 6，7,961,687 字节，SHA256 f321bc7512ce38aea7dd2000c1265f534f4809145e1450f8a13bfda48fa6b61f。
- 5 项引用 Astra_15Groups_Batch02_vNext2_Delta_20261020.zip，版本 0，4,840,556 字节，SHA256 3fceebb84100eb739743d6cf61267044725fae87dc091d3a34b720874080e060。
- 4 项追加预览引用同一 izna/ifeye 交付项的历史 v2 包：Astra_IZNA_Ifeye_Main_3ca624cf_v2.zip，2,784,850 字节，SHA256 014c0dd5bcdacf639145ea35db0d02871ddad5e5d0598a48dc29b55ef2d7a1cc。v3 不能替代这一历史版本的图片字节。

三份历史输入均按上述大小、SHA256 和 ZIP CRC 核实，只按 ASSETS.json 指定条目提取匹配原图。原有 15 项不复制以免重复：集成时按 ASSET-RECOVERY.json 的 productionRelativePaths 从真实原生工程复用。新增 15 项按 candidateRelativePath 读取。30 项字节输入已闭合，不等于当前运行时 resolver、原生记录或评分能力已经完成接线。

本便携目录只保留完整本批 source/、ASSETS.json、SOURCE-TRANSITIONS.json、ASSET-RECOVERY.json、本说明与恢复原图；原始 ZIP 的执行报告、旧规则、设计脚本和测试注入器未随此便携目录复制。

## 接手顺序与禁止误用

1. 以当前项目根 AGENTS.md 与 docs/codex/ 的最新迁移决定为准；原包 evidence/rules/ 仅为历史证据，不恢复旧“暂不迁移”指令。
2. 保留 source/ 的完整本批源码与 ASSETS.json 身份映射，先核宿主接口、素材字节和现有改动，再决定隔离集成方式。
3. 不把 TEST ONLY 的浏览器注入器或布局当生产接线，不把禁用评分入口写成真实保存已完成。
4. 原包 evidence/ 中的执行记录只在本地供核对；不要把原始执行报告、临时路径或旧规则原样纳入新的项目交接文档。
5. 不发布、不覆盖生产、不修改用户记录。当前上线状态未由本次核查证明。

