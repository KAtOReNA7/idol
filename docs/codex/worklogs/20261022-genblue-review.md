# GENBLUE 网页人工验收准备

> 后续用户报告本页交付地址 HTTP 404。发布成功不能证明链接可访问；入口缺口已修复并重新发布，最新状态见 [访问修复记录](20261022-genblue-routefix.md)，线上可达性尚未独立复验。

- 更新：2026-10-22，北京时间。
- 分支：`codex/genblue-native-integration`，承接 PR #3；起始 commit `2a7dd3acc6879a871cdb3a8f610ce063c96b8bd4`。
- 用户最新要求：完成一团、交地址、等待人工确认后再做下一团；公共功能例外。本轮仅 GENBLUE 与必要共享修复。
- 当前阶段：本轮源码与工程验证完成，私有只读页面审阅版已发布；真实浏览器、正式保存与主站包体仍待收尾，不能记整团验收通过，也不能启动 WOOAH 或其他团。

## 本轮改动

- 通用评分控件步长修为 0.1；保存测试 harness 适配已有公开权限组件，不改生产权限或保存协议。
- 《夜市王》MV 的具名六人宣传照及参与展示关系接入 BlueCut 影像、成员浏览；图片保持 800×533 原字节，不称高清截图，不扩展到舞台，不创建个人评分记录。
- 来源：https://www.playmusic.tw/column_info.php?id=28418&type=news ，2026-09-04，资料/照片由天空娱乐提供。图片与 source hash 见 `data/genblue-media-evidence.json`。其他 7 项精确影像图片仍缺。
- 构建资源审计适配经审核的编译文件名变化；仅规范化明确列出的 import hash，其余正文、源文件、原图与字体继续严格校验。未知 JS 拼接旧字体路径的负例被拒绝；不全局豁免、不关闭 guard。
- 新增 `scripts/build-genblue-review.mjs` 与 `review/genblue/`，以正式 BlueCut 和共享 App 组件构建只读审阅包。18 条已核成员/MV 关系只保留 ID，个人分值 null、备注为空，不制造夜市王个人评分记录。

## 交付边界

正式主站在本轮只读确认仍为 v186，未授权以验收替代生产发布。现有私有检查站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 为 owner-only，保留访问范围；验收预览使用实际组件与明确标示的合成资料，不连接或写入正式评分手帐。生产 Site 身份与数据配置不修改。

上一轮 cloud browser 的 URL policy 拒绝尚无恢复证据；本轮不得重试被拒绝动作或用其他浏览器/网络通道绕过。浏览器未验保持未验，工程测试不得写成网页已通过。

## 下一步

1. 在访问限制明确恢复的支持环境补真实浏览器与指定视口/缩放检查；不转移被拒绝观察到另一浏览器绕过。
2. 有界解决主站部署包体的 17.328125 MiB 预算缺口，保护源原图和现用资产，不靠 gzip 体积冒充展开 TAR 通过。
3. 真实保存仅在获准的可恢复环境/记录验收；当前静态审阅版不支持该项。
4. 继续 GENBLUE 剩余 7 张精确影像图与用户反馈修订；未收到用户明确通过前，不开始下一团。公共功能可以继续。

## 最终验证结果

| 项目 | 本轮结果与范围 |
| --- | --- |
| 类型检查 | 通过，最终 `tsc --noEmit --incremental false --pretty false`，0 diagnostics |
| 专项测试 | 10 个文件共 62/62 通过；含评分 0/null/0.1、冲突草稿保留、公开只读、6 种保存状态和 10 个导航场景、MV 来源关系、SSR 26 状态、构建保图与拒绝分支 |
| 正式全站构建 | 通过，tracked-only 发布副本、相同依赖、managed-linux 官方 build-site；未知未跟踪文件留在原工作树，未删除或放行 |
| 完整裁剪 | 全部 guards 的 dry-run 通过；仅在发布副本 dist 内应用明确清单，减少 210208884 B；所有 public 源原图保持原字节 |
| 正式部署容量 | 未通过：gzip 文件 264275312 B，内容文件合计 282534280 B，实际展开 TAR 284508160 B（271.328125 MiB）；高于 256 MiB 上限，距含 2 MiB 余量的目标尚差 18169856 B。未上传或发布主站 |
| 审阅包 | 57 项素材原字节核验，4,228,915 B；8 项 API 隔离检查通过；不转发 fetch，CSP connect-src 'none'，只读 provider。完整展开 TAR 11837440 B（11.2890625 MiB） |
| 浏览器/真实保存 | 未验；没有截图、真实视口、控制台、实际操作或生产写入通过结论 |
| 人工确认 | 待反馈；页面审阅版不等于整团功能与部署均完成 |

测试命令：

```sh
npx tsc --noEmit --incremental false --pretty false
node --test tests/genblue-native-integration.test.cjs tests/genblue-build-assets.test.mjs tests/editor-score-precision.test.cjs tests/editor-flow.test.cjs tests/navigation-save-guard.test.cjs tests/loona-detail.test.cjs tests/built-carrier-audit.test.mjs tests/youngposse-retention-audit.test.mjs tests/unused-unis-font-build-assets.test.cjs tests/udtt-private-build-assets.test.mjs
node scripts/build-genblue-review.mjs --out /absolute/scratch/genblue-review-output
```

## 私有检查站发布回执

- 页面地址：https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue
- Sites source commit：`b79a4ada46db3f9048ae98f33175593ccb5a1ccd`（与 GitHub 产品 commit 是不同仓库）。
- Saved version：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_0980e7c185908191b379dcde33e8b74f`。
- Deployment：`appgdep_6ada26c49f64819190908695e9aced22`；原生工具返回 `succeeded`，北京时间 2026-10-22 23:07:57。
- 审阅包 SHA-256：`fcde5527add3eed1067b86484b99e0d7a0b8013377f7f2e3497f4940461217bb`。
- 对应源指纹：`f2a6a99a47b7281226a3b238ea6d67f5488ea85974652cc3821479b9e1ff2d42`；输出 manifest 记录 143 项实际源码 hash。sourceBaseCommit 是基线，不冒充本轮新代码提交。
- 检查站已部署，访问仍仅 owner。既有 WOOAH bundle/素材不变，旧入口 HTML 保留为 legacy-review，原 `/artists/wooah` 仍映射旧页；未开发其他团。
- 正式主站保留 v186，正式评分/备注/观看状态未改。所有源码与验证结论提交到 GitHub PR #3；本轮产品提交以包含此记录的实际提交为准。
