# 接续：SPIA v32 待网页确认

用户已确认 W!TCHX v31。本轮 SPIA 已发布 owner-private v32，只推进这一团；等待用户确认后再开始下一团，公共功能例外。主站仍 v186，未合并 main。

- [SPIA v32 审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/spia/index.html)
- draft [PR #21](https://github.com/KAtOReNA7/idol/pull/21)，base `codex/witchx-review-completion`
- [完整交接日志](worklogs/20261024-spia-review-completion.md) · [公开发布证据](worklogs/20261024-spia-public-delivery.json)
- [33个可编辑 Figma 画板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1113-1095) · [画板索引](worklogs/20261024-spia-figma-frames.json)

分支 `codex/spia-review-completion`，基于 `88d9b3e4e40cc0ed3411b2067a1e8e250482108c`，代码提交 `84d0b28ff4920ee82ddf2e7272684d2b1a6274bb` 已推送，交接以本分支最新远端 HEAD 为准。正式工程 `apps/idol-site/`。先检查工作树、fetch 后比较，不 reset/clean/force push。Git 命令级代理 7877，未改失效的全局10808设置。

未找到可访问独立官网；页面是《Deeeep》公司宣传素材的原创延展，五人照片为 Kprofiles 具名转载。复用 TRACER v30 精确绑定/目录投影与 W!TCHX v31 导航、原图、恢复、只读机制；共享手帐保留布局并换 SPIA 配色。交审必须明确披露，不称官网复刻。

五成员、两发行/四曲、四精确视频、五事件。Daddy's Little Girl 原生作品 `rec28ldfRTrPua` 的 MV/舞台分别绑定，五条既有成员关系保留；Deeeep 无原生记录，不编造 ID。37 测试、类型、构建、45 真视口布局、主流程及28补充场景通过。线上导航和读取两次超时，线上渲染/交互不能记通过；真实保存/播放及原生80%/125%缩放待验。Figma 8节点取稿、246处排布修复，完整逐字像素对照待验。

v32 source `7ceaa4124a1bc8fc682db9e8d3ee89a384f0519a`，部署 `appgdep_6adc83d082b88191b7d4348723a34836` succeeded。483旧静态文件SHA不变，最终498文件、266163361字节。五张原PNG通过公开 GitHub 固定提交 `84d0b28ff4920ee82ddf2e7272684d2b1a6274bb` 提供，SHA逐字节复核；无需重复发布。源码默认构建仍复制全部本地原图，线上包使用 `--public-originals-ref` 选项。访问权限仍owner-only。
