# 新电脑运行 Idol Lens

1. 克隆本仓库或先保护现有未提交改动。运行 `git fetch --prune --tags origin`，核对 `git status -sb` 与 `git branch -vv`。已验收代码在 `origin/main`，正在开发的增量在 `origin/codex/project-optimization-20261121`。
2. 阅读[当前状态](STATUS.md)、[协作约定](../../AGENTS.md)和[本轮记录](worklogs/20261121-repository-and-routes.md)。进入 `apps/idol-site/`，按[正式工程说明](../../apps/idol-site/README.md)安装依赖和运行验证。
3. 用 `npm run preview:synthetic` 启动本机隔离预览。测试、构建、全量回归和页面交互分别记录。GitHub 上的主线、开发提交及正式部署分别核对。

[历史首次运行说明](https://github.com/KAtOReNA7/idol/blob/0e77838a88f9ff9b14fb67f803156534c7c651e1/docs/codex/CODEX-FIRST-RUN.md)
