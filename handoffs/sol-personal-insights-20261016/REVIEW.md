# 独立静态审查记录

审查范围为个人偏好分析新增模块、局部 CSS、最小 App 接线提案及合成测试入口。F 路只通过后端读取不可变 Git blob 并检查源码；没有访问 Windows/OS/本地文件系统、启动进程或浏览器、执行源码/测试、安装依赖、部署或创建凭证。结论是源码静态审查，执行状态全部为 not_run。

## 不可变证据

基线：1804f12d0c51963bb65864cf531113151b07eaf5。输入 17 文件的 UTF-8/SHA 校验由总负责人报告完成，本审查不将该校验冒称为 F 路独立运行结果。

| 文件 | 已读 Git blob |
| --- | --- |
| lib/idol/personal-insights/contract.ts | 2c6d702625dd522ed0c78e38a03cfc02a5580d23 |
| lib/idol/personal-insights/score.ts | 03d3bc66a13c2033330781ddaf2449c970d75021 |
| lib/idol/personal-insights/prepare.ts | 4d376da271ab94cd97211832fb42f975a51c8331 |
| lib/idol/personal-insights/members.ts | 73d8b61b3e3bf2385235f14dfe811d00a8abd868 |
| lib/idol/personal-insights/overview.ts | 8fc21573e953fed204022ec9b49cebcebe2183a4 |
| lib/idol/personal-insights/revisit.ts | f165489552e9b4c28e5030eca0c7b7500947a15a |
| lib/idol/personal-insights/index.ts | 79de0ac0426a1d030af29e93c1759188a1aed76c |
| components/personal-insights/PersonalInsights.tsx | b8b14e2f9d3f9e676bcac30a3de532a54d930ebc |
| components/personal-insights/personal-insights.css | 6ce33d3b60cc3790b4f78ab47b2febe64468deab |
| APP_WIRING.patch | e5a4c83a32c45542609bd6b4817b869a6245b6ff |

模型七文件与 UI/CSS 已全文静态阅读。最终 UI 相对先前已读全文仅有两行改动：团体说明明确为有作品但暂无评分；aria-controls 只在展开区域存在时给出。F 路已只读取回最终 blob 并比对这两处。精确归档 SHA 与最终测试文件清单以 MANIFEST.json 为准。

测试入口已补充只读核对：model.test.ts bdf1c3a9eea86330cfbac36d1a49c7182b03b3cc；properties.test.ts 2a42256d58fae1967ca3032b8de800a1d7fc26cb；component.test.tsx cf80bbc22ec6deb6d11b4a2c1a146bd555fe6564；runner eb4bf866f0cc44e320b00453c49f60c968b81bee；browser-checks.tsx 3a1db24c37655a3774f7d9d33dcd6381cd2729cc。27 个 Node 源码 case 与 11 个浏览器源码 case 的真实标题、合成输入和期待值均列入 TEST_PLAN.json，38 个均为 not_run。最终 SSR radio 断言按单个标签核对属性，避免依赖 React 属性序列化顺序；浏览器 callback 断言精确检查 g-1/m-0/w-0，未冒充全站导航测试。

## 已核对的行为

身份准备使用四表独立扫描，重复 ID 的全部行隔离，空 ID 隔离，作品占位排除。既有对象仅通过新容器只读引用，不修改或冻结输入；analyzeCatalog 返回的派生模型不带原实体引用，并递归冻结。生产 schema、分数字段与关系不被重写。

评分不做字符串转换；有效区间 0..10、0 值、11 个 bins、高分 >=9 和无样本 null 均值的实现一致。舞台必须有 stage 且宿主谓词明确准许，缺省和抛错均拒绝。MV 观看四状态和 knownCount 分母符合契约；舞台没有独立观看字段，不推断其已看状态。

团体按去重关系加入 canonical 团体，workCount 与评分分母分开，多团关联不破坏全局作品唯一数。排序在相同指标时回到原团体顺序。成员仅在单成员、单作品、两端存在且有作品反向 rating 链接时贡献；performance/styling 独立分母，valid 0 保留。纯非法和全空记录的聚合诊断可见；回溯只保留至少一轴有效的贡献记录 ID。

回看列表按作品身份和版本保留条目，高分排序稳定。MV 待评只认已观看与显式 null；undefined 不进入可行动列表。stageRevisit.watchedUnrated 固定空；UI 的 MV 待评范围不会随舞台评分切换而改成舞台。

组件每次 render 重新分析，避免只按 catalog 对象身份缓存而漏掉同对象刷新。主列表页长 10/20、trace 页长 20，非全部隐藏行；页码在缩小后钳制。仅在用户明确分页/展开/关闭后处理焦点；无 callback 时呈现文本，disabled 有原生属性与处理函数双重约束。按钮传 canonical ID，保留宿主导航职责。

UI 使用原生 table/caption/th、fieldset/radio/select/button；直方图 11 项有数量文本与可展开数据表。CSS 作用域、根 box-sizing、min-width:0 与表格内滚动为窄屏提供静态支持。没有真实视口/键盘/读屏证据，因此本审查不宣称 390px 可用性或无溢出已经实测。

App 补丁文本只增加 import 并替换单个 Insights JSX 调用。memberDisplayName(member) 与 stageHasValidBinding(stage) 的参数形态来自原 App 实际调用。onGroup/openGroup、onMember/openMember、onWork/id=>openWork(id) 沿用现有入口；没有新建 URL、全局导航、保存或队列机制。打开作品没有被 UI 表述为直接播放舞台。补丁未 apply，保存守卫与队列回归尚需真实宿主执行。

## 审查中已修正的问题

| 问题 | 实际修正 | 当前证据 |
| --- | --- | --- |
| 两轴皆非法被归为尚无评分，可能掩盖脏分数 | v1.1 新增 excluded.invalidScores；两轴均 null/undefined 才算 emptyScores；至少一轴有效才列成员 | members.ts/contract.ts 已读；UI 已展示聚合说明 |
| MV watched 被误用于推断舞台已看 | 舞台待评恒空；观看与待评明确为 MV | revisit.ts 与 UI 已读 |
| 排除记录聚合未呈现 | 成员区显示关系排除、空评分和非法分数计数 | 最终 UI 已读 |
| root box-sizing 依赖外部全局样式 | 模块根及后代自包含 border-box | CSS 已读 |
| 关闭 trace 后 aria-controls 指向不存在的区域 | 仅选中成员按钮设置 aria-controls；浏览器夹具按 aria-expanded 选触发器 | 最终 UI 与最终夹具均已读 |

以上是静态核对已入源码的修复，不是运行通过的记录。

## 剩余复现门槛

1. 旧 Insights 函数按最小改动要求保留未使用。若真实项目启用 unused lint/noUnusedLocals，可能形成门槛；本轮没有运行这些检查，也不为规避门槛扩大删除范围。
2. stage-source 和 member-display-name 源文件不在 17 输入文件中。接线使用 App 已确认的真实调用形态；最终 helper 类型、路径解析与宿主完整构建需在 dot 环境核验，不发明替代实现。
3. bounded DOM 只约束渲染行数，完整分析仍计算输入集合；未测运行时延、内存、首屏、交互或布局性能。0/100/1000/5000 与三个视口均需按计划执行。
4. 浏览器断言验证模块 DOM/焦点/callback，不替代真实 Tab/arrow/读屏，也不替代全站导航、未保存拦截与宿主队列回归。依赖应使用项目已有版本；本轮没有安装或改 package/lock。
5. 最小补丁的 git apply --check、严格类型检查、模型/属性/SSR、主 App 构建及原 17 文件相关既有回归均为 not_run。没有发布、凭证或数据迁移操作。

在本次已读的核心与 UI 源码中，修正上述问题后未发现新的明确静态阻塞项。该结论限于这些不可变源码，不能替代 TEST_PLAN.json 的真实执行结果。
