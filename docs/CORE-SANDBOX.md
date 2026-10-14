# 女团网站：隔离核心逻辑工作区

这是现有网站中纯函数模块的最小可构建副本，用于 Codex 云环境协作。它不是生产站点副本，不能部署或访问生产数据。

需要 Node.js 22.13.0 或更新版本。运行 `npm ci --ignore-scripts`，随后 `npm run verify`。唯一开发依赖为 TypeScript 5.9.3，精确锁定。

若云环境默认 npm 缓存目录 `/home/agent/.npm` 不可用，可改用临时缓存：`npm ci --ignore-scripts --cache /tmp/idol-core-sandbox-npm-cache`。无需修改源码、锁文件或创建凭证。

本地整合基线为核心包 `d97346e78f144c2d0256cb7540222eacd36515d0` 与工具集 `6e55d36cb052c18e8b7c98f92832c97f539a78b5`。`npm run verify` 先运行 `tsc --noEmit`，再统一运行 `tests/*.test.cjs` 和 `tests/*.test.mjs`；当前合计 62 项测试，须以实际执行结果为准。路径检查另用 `node scripts/repo-hygiene.mjs`，它只查询已跟踪路径，不读取文件内容。此轮仅本地整合审阅，不推送、不创建 PR、不部署。

`docs/FILE-MANIFEST.json` 记录原核心包清单中的文件；整合修改的文件同步更新大小与 SHA-256。工具文件由 Git diff 单独审阅。

包含首页轮换、待看/重温筛选、团体作品统计、成员表现/造型均分、图片资格判断、类型与合成测试。没有真实评分、备注、附件、账号、令牌、快照、迁移记录或 Git 历史。图片资格判断中的公开媒体名称是算法常量。

保持此仓库现有 README 和 .gitignore。建议仅独立分支提交补丁；云任务不可发布网站或读取生产凭证。不覆盖并行任务的 repo-hygiene 和 validate-image-manifest 文件。

网站 API、鉴权、数据库、存储、连接器、部署脚本和真实艺人图集暂不加入，避免把主应用改成大量 stub。后续移植完整前端时应另审静态导入边界和合成数据契约。
