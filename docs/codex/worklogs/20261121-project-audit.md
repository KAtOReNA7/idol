# 2026-11-21 全项目复核记录

开发顺序、发现的用户影响和逐阶段验收条件见[全项目复核与开发路线图](../PROJECT-AUDIT-AND-ROADMAP-20261121.md)。可机读结果包含 137 个失败文件的逐文件计数、51 个团体入口、测试口径、依赖告警和构建图。[检查数据](../evidence/20261121-project-audit/verification.json)

## 基线和环境

- 从干净工作树开始。系统为 Windows，Node 24.16.0，npm 11.13.0。直接 Git fetch 在默认本机代理连接失败后，用单次命令清除失效代理设置成功，显式获取 `origin/main` 和 PR 47 分支。远端 main 为 `852f7506`，PR 47 为 `35ff13d3`。GitHub 连接器交叉确认 PR 44–47 均为开放草稿，仓库可见性为 public。
- 以该提交建立仓库外的独立检出，正式应用从锁文件离线安装成功。根沙盒首次离线安装缺一个包，联网补齐后独立验证成功。两套工程分别构建。测试临时替换运行时数据和生成文件的操作均发生在副本内。
- Sites 只读控制面确认最新版本 203，已知正式部署状态 succeeded，public、revision 2、1 owner、0 外部访问者、0 组。线上 500 来源以 v203 的发布回执与该版本应用源码为依据。源码对比范围为已发布应用 `b616c671` 至 `35ff13d3`，涉及 86 个正式工程路径。[发布回执](../evidence/20261030-v203/release-publication.json)
- 本次交付以 PR 47 为父提交，在单独的规划分支保存报告。应用、业务数据、冻结台账、原图和生产配置均无变更。
- `git fsck --full --no-dangling` 通过。正式工程的 data、Drizzle 和托管配置目录共 490 份受跟踪 JSON，逐份语法解析通过。当前检出的本机研究目录由 `.git/info/exclude` 忽略，在干净克隆中同名的合成 JSON 未命中忽略规则。

## 验证结果与复现

下列正式工程命令从 `apps/idol-site/` 运行。首次执行全量测试使用独立副本，因为现有投影测试会临时改写数据。各组有重叠时单独报告。

| 检查 | 本轮结果 |
|---|---|
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` 与 `npm run build` | 均通过，两个构建前生成投影检查随 build 实际执行 |
| `node scripts/validate-stages.mjs` | 614 个目录条目，527 个有效舞台来源。逐项核对 TS/Python 的 source key，0 个差异，0 个无效评分绑定 |
| `node scripts/validate-supplements.mjs` | 失败。VM 加载器只接纳单一 JSON 导入，遇到 `./stage-source` 即退出 |
| `node scripts/prepare-production-assets.mjs` | dry-run 通过。578 本地、5,418 远端、10 个受限副本，另有别名计数 1。独立用固定提交 Git blob 对比 5,418 项，全部相同。30 个专项封面另以源字节校验 |
| 正式 Node 全量 | 423 个文件并发 4，单独串行跑有写入行为的 `artist-runtime-data.test.cjs`。合计 3,956 项，2,764 通过、1,153 失败、39 跳过、0 取消 |
| 当前采用流程与偏好统计 | 按 CRUSH 回执原列出的 12 个文件重跑，69/69 通过。独立运行 `node tests/personal-insights/run-tests.mjs`，31/31 通过 |
| `npm run lint` | 报告 2,944 错误、1,000 警告，446 个文件含错误。2,637 个错误来自默认的 CommonJS require 规则。测试目录合计 2,725 个错误 |
| 浏览器配套夹具 | CSS HTTP 夹具在生成阶段报预期 37、实际 50，Python handler 套件未启动。旧搜索浏览器脚本使用现有 Chromium 后，在 390 宽度首个断言前超时，未执行其桌面分支 |
| `npm audit --json` 与 `npm audit --omit=dev --json` | 全锁 33 个包被报告，生产范围 6 个。两个范围包含重叠项。数量取自 11 月 21 日登记库响应 |
| 数据库与主应用 | 内存 SQLite 顺序重放 11 个 SQL 迁移，14 张表，完整性通过。单独的本地 D1 用公开目录构造 51 团、51 个合成人物、614 作品、0 条评分关系，经过实际 Worker 返回 527 个舞台 |
| 根沙盒 | 在仓库根目录运行 `npm run verify` 和 `npm run build`，类型检查、100 项测试及 Next 构建均通过 |

正式 Node 全量的文件发现与执行方式如下。TAP 中只把报出的失败数映射回源文件。没有把测试失败数换算成产品缺陷数。

```powershell
$files = Get-ChildItem tests -Recurse -File |
  Where-Object { $_.Name -match '\.test\.(cjs|mjs)$' } |
  ForEach-Object { [IO.Path]::GetRelativePath($PWD.Path, $_.FullName).Replace('\', '/') } |
  Sort-Object
$isolatedFile = 'tests/artist-runtime-data.test.cjs'
$remainingFiles = @($files | Where-Object { $_ -ne $isolatedFile })
node --test --test-concurrency=4 --test-reporter=tap @remainingFiles
node --test --test-concurrency=1 --test-reporter=tap $isolatedFile
```

排查首轮可从 `image-host-matrix.test.cjs` 的 207 次、`catalog-read-deadline.test.cjs` 的 125 次、`timeline-host-matrix.test.cjs` 的 111 次开始。三者共 443 次报告失败。应先修重复的夹具依赖解析，再对剩余断言逐项检查产品行为。独立的正式素材预检通过，旧测试里的个别固定构建载体失败仍保留在统计中。[按文件排序的失败清单](../evidence/20261121-project-audit/verification.json)

## 浏览器与真实 Worker

测试使用 127.0.0.1 上的正式构建和 Wrangler/Miniflare。会话没有专用 Browser 技能，按前端测试流程使用已安装的 Playwright 和独立 headless Chromium 149.0.7827.55。浏览器只访问本地测试服务。

| 检查 | 实测现象 |
|---|---|
| 页面身份及内容 | 全部团页在 390×900、1440×900 共 102 次入口检查均返回 200。48 个 React 团页出现有意义的标题。ifeye／izna 在 Shadow DOM 内有内容，两者的可访问树分别找到 20、26 个标题 |
| 布局和控制台 | 初始页面探针未观察到文档横向溢出、框架错误覆盖层或未捕获页面异常。UDTT 的素材接口在空环境返回 503，填充合成目录后因目标不匹配返回 409，界面提供重试。已核桌面作品库、手机作品库及手机展开菜单的截图 |
| 用户交互 | 使用项目合成目录加载实际首页，进入作品库，打开第一张卡片再返回。两宽都显示首批 24 项，焦点回到同一张作品卡。390 宽度在已完成加载并明确展开菜单后，Escape 未关闭菜单，Tab 能进入遮挡下的正文 |
| 作品库首屏 | 真实 Worker 的 614 作品场景下，390×900 的首卡、歌名、固定底栏顶边分别为 y=739、865、839。1440×900 的歌名顶边为 y≈666，桌面没有固定底栏遮挡。测量前已等待字体就绪并回到页面顶部 |
| 真实目录服务 | 测试初次运行时空数据库使目录返回 502。加载迁移及合成数据后，用未拦截的本地 API 打开首页、作品库、观看记录、偏好统计和 CRUSH 舞台详情。两宽都取得精确的 BV、CID 和 P2 链接。匿名管理页面显示所有者提示，状态 API 返回 401 |
| 验证范围 | 团页批量检查使用合成目录。原生页追加了真实 Worker 和 Shadow DOM 复核。UDTT 有效素材下的完整交互、真实私人保存、正式站逐页目视及外部全片播放均未在本轮执行 |

首页静态依赖的计量来自 `node scripts/report-client-graph.mjs`。合成 D1 全目录和 IVE 范围接口分别返回 1,080,832 与 46,055 个未压缩响应字节。图片、字体、接口和动态导入未计入 579,973 字节的首页静态 gzip 指标。真实浏览器的冷／热加载耗时和线上用户体验指标需要在下一阶段另外采集。[构建图与浏览结果](../evidence/20261121-project-audit/verification.json)

## 数据与交付边界

全量比较 500 个已发布来源与当前 527 个对象，得到 497 个现有对象相同、3 个替换、27 个新增。87 项舞台和 23 项人物建议共涉及 103 个不同作品，两份源队列摘要复算一致。共享忽略规则的检查只使用假文件名，未打开仓库外私人备份。本轮没有真实 owner 导出、生产保存、权限调整、Sites 版本保存或部署。后续采用和发布分别使用当时有效的证据与授权。
