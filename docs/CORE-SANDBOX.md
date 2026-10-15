# 女团网站：隔离核心逻辑工作区

这是现有网站中纯函数模块的最小可构建副本，用于 Codex 云环境协作。它不是生产站点副本，不能部署或访问生产数据。

需要 Node.js 22.13.0 或更新版本。运行 `npm ci --ignore-scripts`，随后 `npm run verify`。唯一开发依赖为 TypeScript 5.9.3，精确锁定。

若云环境默认 npm 缓存目录 `/home/agent/.npm` 不可用，可改用临时缓存：`npm ci --ignore-scripts --cache /tmp/idol-core-sandbox-npm-cache`。无需修改源码、锁文件或创建凭证。

本轮整合基线为工具集成 `3e7c678e5b0f650231d956eeb4d3dda70af8fb2b` 与重复评分修复 `551e81cd441aa59dac58bf5b4d74522e2b6edf05`，本地合并提交为 `a141367e1496e7e038a40748e34ea1742f16d8ff`。`npm run verify` 先运行 `tsc --noEmit`，再统一运行 `tests/*.test.cjs` 和 `tests/*.test.mjs`；当前合计 84 项测试，须以实际执行结果为准。路径检查另用 `node scripts/repo-hygiene.mjs`，它只查询已跟踪路径，不读取文件内容。核心工具包已在 `codex/core-tools-reviewed` 创建草稿 PR #1。本轮成员作品附件消歧基于其精确 head `1a3b8629de688a9aca844eac309bfb5056c7f5be`，修复提交为 `ca61ff4aed67c419479b9a41ad8bf875a0fda6ec`，经授权交付到独立开发分支 `codex/member-photo-consensus`；不改 PR #1，不合并 main，不部署，尚未发布。

`docs/FILE-MANIFEST.json` 记录当前全部 Git 跟踪文件（清单自身除外）的字节数与 SHA-256；`baseCommit` 为本轮文档复核前的附件消歧修复提交，不是这些哈希对应的历史树。哈希对应当前提交中的实际文件内容。

附件消歧先汇总同评分 ID 的全部关系；附件引用、身份或明确视频证据冲突时返回 `photo:null`，一致重复合并。显式身份矛盾不能被旧文字规则或资格标志覆盖；输出与输入排列无关且不修改输入，每维评分规则保留。14 项新增合成测试随包交付；最终成员作品回归集在旧 head 上为 24 通过、10 失败，在修复后全部通过。

包含首页轮换、待看/重温筛选、团体作品统计、成员表现/造型均分、图片资格判断、类型与合成测试。不含真实用户评分、备注、照片文件、账号凭证、令牌值、快照或数据迁移记录。测试评分与照片元数据均为内联合成对象，不含图片字节；公开媒体名称、具名文字模板和视频标识用于兼容逻辑与测试。`fileToken` 字段声明及测试中的占位字符串不含真实附件令牌。

保持此仓库现有 README 和 .gitignore。建议仅独立分支提交补丁；云任务不可发布网站或读取生产凭证。不覆盖并行任务的 repo-hygiene 和 validate-image-manifest 文件。

网站 API、鉴权、数据库、存储、连接器、部署脚本和真实艺人图集暂不加入，避免把主应用改成大量 stub。后续移植完整前端时应另审静态导入边界和合成数据契约。
