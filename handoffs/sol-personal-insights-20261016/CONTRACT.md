# 个人偏好分析共享契约 v1.1

交付基线：`1804f12d0c51963bb65864cf531113151b07eaf5`。本契约适用于新增 `lib/idol/personal-insights/`、`components/personal-insights/`、`tests/personal-insights/`。交付根的文档与补丁是交接资料，不作为生产目录直接覆盖。所有执行结果为 `not_run`；本轮只做源码静态审查。

## 输入、身份与边界

输入为现有 `CatalogView`，沿用 `../types` 的 Group、Member、Work、RatingView；不增改持久化字段、评分、关系、API 或 schema。四表数组异常缺失时按空表防御。实体 ID 必须是非空字符串；仅用 trim 判断是否为空，不改写原 ID。每表按原 ID 精确比较，重复 ID 的全部行隔离，不取首条；空 ID 行隔离。诊断分别返回四表重复 ID 列表与空 ID 行数。

Work 的 truthy `placeholder` 不进入任何作品统计或关联分析。placeholderCount 按原作品数组计数，可能与重复/空 ID 诊断重叠，不是互斥分桶。canonical 作品顺序为原输入中身份唯一、非占位的顺序；uniqueWorkCount 是该作品数。

分析只读评分、观看状态、必要 ID/关系和展示名称/版本。不读取 favorite、私人笔记、回忆、档案描述、来源文本或图片，不把已有 Group.average/ratedCount 当作统计源。不写 API、存储、历史、导航、队列或原输入对象，不引入网络、时钟、随机数、遥测或凭证。

## 评分与观看

有效评分是实际 number、有限且处于闭区间 0..10；不转换字符串。0 有效，小数保留。均分仅按有效样本计算；无有效样本时为 null。高分阈值为 >=9。bins 固定 11 项：[0,1)、[1,2)、…、[9,10)，最后一项仅为精确 10。

ScoreStats 含 eligibleCount、ratedCount、mean、highCount、bins、missingCount、invalidCount、unqualifiedCount。合格作品中的 null/undefined 计 missingCount，其余非法值计 invalidCount；eligibleCount = ratedCount + missingCount + invalidCount。不合格舞台先计 unqualifiedCount，不再进入上述三项。MV 与舞台完全分开。

舞台资格默认拒绝：Work 必须有 stage，且宿主 `isStageScoreEligible(work)` 精确返回 true；缺少回调、false、异常均拒绝。回调应纯且确定，不依赖调用次数。现有 stage-source 文件未在输入中，不能在分析模块猜测绑定规则。

watching 仅描述 MV 的 Work.watched，不能推断舞台已看：
- 已观看：watched；
- 未观看：unwatched；
- 空串：unmarked，是合法已知状态；
- 其他值：unknown。
total 为 canonical 作品数；knownCount = watched + unwatched + unmarked；watchedRatio = watched / knownCount，knownCount 为 0 时为 null。UI 四类比例各用 total 为分母并明确标注 MV。

## 团体与成员

团体比较仅连接 canonical 团体 ID。同一作品在同一团体的重复关系只计一次，多团作品可同时属于多个团体，因此团体总数不能相加还原全局数。workCount 包括该团体所有 canonical 关联作品；stats 使用本域的资格和有效评分分母。有作品但暂无有效评分的团体保留；无关联作品的团体不列。排序支持 mean、samples、high，降序；null 均分置后；平局保留原团体顺序。

成员评分仅使用 canonical Rating。先对每条 Rating 的 memberIds/workIds 去重，必须各有且仅有一个不同 ID、两端实体存在、且对应 Work.ratingIds 包含该 Rating.id，才能贡献。多目标进 ambiguousRelations；缺目标或目标被身份/占位规则隔离进 missingRelations；缺作品反向链接进 unlinkedRatings。不能从多成员评分复制个人分数，也不能凭单向关系猜测归属。

performance 用 Rating.score，styling 用 Rating.stylingScore，各有独立 sampleCount、mean、invalidCount。某轴空缺不当作 0，另一轴仍可贡献。成员行只在至少一轴有有效样本时出现。ratingIds/workIds 为至少一轴有效的贡献记录及作品，去重且保留首次贡献顺序，用于有界展开回溯。

v1.1：两轴都无有效分数时，原始两轴均为 null/undefined 才进 excluded.emptyScores；否则进 excluded.invalidScores。纯非法记录不会成为偏好成员行，但有聚合诊断。部分非法轴及同成员其他非法记录仍可进入该维度 invalidCount；维度 invalidCount 与 excluded 计数不应相加理解为互斥记录数。

## 回看列表

每域 highRated 只含该域有效评分 >=9 的 canonical 作品，舞台还需合格。按分数降序，平局按 canonical 作品顺序；保留真实 workId/name/version，不按歌名合并版本。条目 reason 为 high-score。

MV watchedUnrated 只含 Work.watched 精确为已观看且 Work.score 精确为 null 的作品，reason 为 watched-unrated，score 为 null。undefined 可在统计中防御计作缺分，但不是契约内显式待评动作，不能入队。stageRevisit.watchedUnrated 恒为空；切到舞台评分范围也不能将 MV 已看待评改名为舞台。

列表仅展示与调用宿主回调，不建立、替换或持久化播放队列。打开作品不等于承诺直接播放舞台。

## 导出模型与组件

`analyzeCatalog(catalog, options)` 一次准备身份后组合 uniqueWorkCount、watching、mv/stage、mvGroups/stageGroups、members、mvRevisit/stageRevisit、diagnostics。输出只包含新派生对象、数组、ID 和标量，并递归冻结。输入原对象不被修改或冻结。内部 PreparedCatalog 的新容器可以保留只读实体引用；ReadonlyMap 是类型边界，不宣称 Object.freeze 可以冻结 Map 的内部条目。

PersonalInsights 接收 catalog、memberLabel(member)，以及可选 isStageScoreEligible、onGroup(id)、onMember(id)、onWork(id)、disabled。每次 render 重新分析，支持宿主刷新时仍使用同一 catalog 对象。无回调时显示不可动作文本；disabled 同时约束原生控件和动作处理。成员名称由现有宿主 memberDisplayName 一参数回调提供。

三类主列表每页 10 或 20，成员作品回溯每页 20；只展开选中成员的当前页。数据缩小时立即钳制页码。分页/展开后的焦点仅响应明确操作，不因普通刷新主动抢焦点。原生表格、fieldset/radio/select/button 与可滚动表格容器构成基础交互；aria-controls 仅在真实 trace 区域存在时引用。CSS 使用 pi- 命名空间，不改全局元素规则。完整数据分析与分页计算仍遍历输入；有界 DOM 不代表已经测得大数据性能。

## 主 App 接线提案与只读范围

APP_WIRING.patch 仅加 PersonalInsights import，并将原 Insights 调用替换为：
```tsx
<PersonalInsights catalog={data} onGroup={openGroup}
  onMember={openMember} onWork={id=>openWork(id)}
  memberLabel={memberDisplayName}
  isStageScoreEligible={work=>stageHasValidBinding(work.stage)}/>
```
这是提案，未在本轮 apply。stageHasValidBinding 的实际既有调用为 stageHasValidBinding(stage)；memberDisplayName 的实际既有调用为 memberDisplayName(member)。沿用 openGroup/openMember/openWork，保留主 App 的保存守卫、导航与默认队列语义。旧 Insights 函数保留，避免超出只替换调用和最小 import 的授权；unused lint/noUnusedLocals 须由 dot 在真实环境核验。

除提案的两处文本外，17 个输入文件、全局导航、个人记录检索、保存/API、timeline、image、生产数据与资源、依赖配置均不在本轮修改范围。测试仅使用显式合成数据，不得回传覆盖生产。

## 执行状态

静态审查不等于类型检查、SSR、浏览器或性能验证。模型/属性/组件测试、独立浏览器断言、390/768/1280 视口、0/100/1000/5000 合成规模、键盘与读屏、主 App 接线/保存回归均为 not_run。复现命令、实际源码 case 与验收值见 TEST_PLAN.json。没有运行测试、部署或创建凭证；仅由协调者按预期 HEAD 校验更新授权交接分支，不修改 main。
