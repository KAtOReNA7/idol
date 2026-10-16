# 个人偏好分析 · 纯代码交接

源码实现已交付，运行测试由 dot 执行。本交接不代表主线已接入、编译通过或全站验收完成。

## 文件与还原

输入使用此前核验的17份纯代码，基线 `1804f12d0c51963bb65864cf531113151b07eaf5`。
此目录是独立交接包；将 lib/idol/personal-insights/、components/personal-insights/、tests/personal-insights/ 三棵目录按原路径放入 dot 工作副本，或在检查后应用 IMPLEMENTATION.patch。两种还原方式二选一。

APP_WIRING.patch 单独审阅。它针对上述输入 App，只增加 PersonalInsights import 并替换旧 Insights 的唯一调用，不触及导航、保存守卫、搜索、时间轴或图片恢复。
当前主线若已变化，dot 应按同样 props 做小范围移植，不强行应用旧上下文。
旧 Insights 函数按指令保留，可能需要 dot 对照现有 lint 规则处理未使用提示。

## 接口

`PersonalInsights({catalog,onGroup,onMember,onWork,memberLabel,isStageScoreEligible,disabled})`。
memberLabel 透传宿主既有 memberDisplayName；舞台资格透传 `work => stageHasValidBinding(work.stage)`。
没有资格 adapter 时不统计舞台。舞台只提供整体评分分析；观看覆盖和已看待评属于 MV。
宿主回调仍负责路由、历史上下文与保存守卫；模块不自行读 URL、请求数据或写 storage。
输入无须复制，冻结的输入也可使用；模型每次调用重算，组件每次 render 重算，支持同对象刷新。

## dot 的可复现验证入口

依赖使用现有 package.json 的 Node>=22.13、TypeScript5.9、React/react-dom19、Vite8、@vitejs/plugin-react6。交接不安装依赖、不创建凭证。

```sh
node tests/personal-insights/run-tests.mjs
```

runner 先严格检查本 feature、真实 types.ts 和合成夹具，再转译真实源码并执行27个 Node 模型/性质/SSR与源码边界案例。
SSR 唯一省略的是组件已存在的 CSS side-effect；不会替换模型、组件或生产依赖。SSR 无法证明真实焦点、键盘或布局行为。

```sh
node node_modules/vite/bin/vite.js --config tests/personal-insights/vite.config.ts
```

在受支持环境打开 http://127.0.0.1:4178/，使用真正的390/768/1280视口分别验收。
夹具只含 TEST ONLY 合成数据，可选0/100/1000/5000条规模，宿主回调只记在测试页面本地状态。
按钮“运行真实浏览器断言”实际调用11个浏览器检查；返回的 passed/failed 只在 dot 真正运行后产生。
另外按 TEST_PLAN.json 人工检查 Tab/Shift+Tab、原生单选方向键、表格横滚、放大和屏幕阅读器。
5000规模提供正确性/DOM有界断言，未报告任何时间或性能实测数字。

所有运行项当前均为 not_run：类型检查、Node、SSR、浏览器、规模、构建、lint、补丁应用与主线回归。
统计契约见 CONTRACT.md，静态审查与修复见 REVIEW.md，逐例合成输入/预期见 TEST_PLAN.json，继续执行位置见 CHECKPOINT.json。
