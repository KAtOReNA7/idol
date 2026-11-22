# Windows 与 WSL 的照片回归

v242 的完整测试中有四项仅在 Windows 失败。照片状态测试用斜杠匹配模块路径，导致 Windows 上的未缓存对照实际也启用了缓存。另三项把本机文件路径与固定的斜杠字符串比较。[此前的逐项结果](../evidence/20261122-v242/full-suite-failures.csv)

| 检查项 | Windows 修正前 | Windows 修正后 | WSL 修正前后 |
| --- | --- | --- | --- |
| 215 个候选的缓存与未缓存 SQL 读取 | 两次均为 385 次 | 未缓存 1,449 次，缓存 385 次，返回内容一致 | 均为 1,449 / 385 次 |
| LOONA 四个构建副本与保留的原件 | 路径断言失败 | 四个计划路径与清单逐个匹配 | 通过 |
| tripleS 时间轴与图片两套独立夹具 | 两项路径断言失败 | 两项通过，均解析至指定夹具文件 | 两项通过 |

Windows 与 WSL Ubuntu 均用 Node 24.16.0 在正式工程运行这三个完整测试文件，每端 62 项，61 项通过、1 项失败、0 项跳过。两端余下同一项既有失败，它把原件投递清单中保留的四条 LOONA 路径也计入页面使用。SQL 数值来自隔离 SQLite 的同一份 215 项输入，涵盖 40 部作品和 122 位成员。[照片状态测试](../../../apps/idol-site/tests/photo-status-reads.test.cjs) · [LOONA 构建测试](../../../apps/idol-site/tests/duplicate-loona-build-assets.test.mjs) · [tripleS 夹具测试](../../../apps/idol-site/tests/triples-fixture-boundaries.test.cjs)
