# 合成测试输入

两份 fixture 保留原测试输入字节，ratings 均为空。作品分数、观看标记等是测试值，不是真实用户状态，不得导入正式数据库。路径为：

- handoffs/codex-20261022/combined-integration/tests/fixtures/genblue.synthetic-catalog.json
- handoffs/codex-20261022/combined-integration/tests/fixtures/wooah.synthetic-catalog.json

原环境的验证范围：GENBLUE 80 项源码/SSR、19 项真实 React 配合最小模拟 DOM 的生命周期断言及目标类型检查；WOOAH 285 项源码/导航/畸形输入断言、8,478 次畸形 SSR 渲染、49 个普通 SSR 路由。模拟 DOM 不等于真实浏览器。

完整测试框架尚未便携化，也未在新仓库运行。此处只归拢输入，不附带旧环境构建器、内部路径或已编译 bundle。后续移植应重新核验共享宿主导入、别名解析、模拟输入和运行源 SHA。当前可执行只读入口是候选根目录的 check-overlay.py，详见候选 README。
