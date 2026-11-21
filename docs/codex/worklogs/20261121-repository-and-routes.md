# GitHub 主线整理与团页回归

2026-11-21。验收基线与本轮开发分别在 `main` 和 `codex/project-optimization-20261121`。正式 v203 使用 500 个舞台。

## GitHub 与工作树

主线从 `852f7506` 快进 85 个提交至 `0e77838a`。原 11 条分支收为 2 条。7 条旧线的提交全部在主线，另外 2 条独有线分别保存 2 和 9 个独有提交，归档标签已逐条读回。PR 44 在快进后被 GitHub 标记为合并；47、46、45 按依赖顺序关闭。逐分支 SHA、恢复标签、PR 最终状态见[远端回执](../evidence/20261121-repository-and-routes/github-consolidation.json)。

将 AGENTS、STATUS、首次运行和换机入口改为当期说明，历史完整原文链接固定到主线验收提交。作品库旧交接的 9 份日志与 3 份预构建文件共 1,866,772 个 Git blob 字节，已移出当前树。仍有测试调用的接线补丁、历史清单和素材投递提交继续可达。[逐文件恢复索引](../evidence/20261121-repository-and-routes/removed-generated-files.json)

## 内容与页面

110 项研究任务已逐条应用用户决定。10 项定向核验，81 项等待新证据，19 项取消必填，合计 103 件作品。每行回指原始判断与证据。舞台来源、照片、个人评分与保存记录未因处置而变化。[当前清单](../evidence/20261121-repository-and-routes/content-disposition.json)

团页回归覆盖共享时间轴、团体独立时间轴和原生挂载状态，使用 48 个 React 主页的准确首图及两名成员的独立身份。合成输入分别检验实时与快照模式下的条目、零分和图片。浏览器另行验证。七团共享成员页记录原始入口，视频封面重试恢复播放控件的键盘焦点。模拟保存复用原操作 ID，同步重复激活只发一个请求。

设计在原文件的[完整原图](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=76-507)和[观看与保存状态](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=14-165)上调整，使用既有按钮组件。
