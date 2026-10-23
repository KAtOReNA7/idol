# YOUNG POSSE 原生完善与 v21 私有审阅

北京时间2026-10-24。本轮主代理负责页面、Figma、验证、发布；按Sites技能复用既有素材子代理，仅做公开素材核验与清单。

## 基线与范围

- `KAtOReNA7/idol`，正式工程 `apps/idol-site/`。分支 `codex/youngposse-review-completion`，基于 `codex/vvup-review-completion` 的 `75c22b7ec26f53fbbf14db1b253a8cce52a59d81`。开工与提交前均核远端；仓库public，本轮只新增公开资料、清空个人字段的审阅和测试证据。
- 用户“可以 继续开发”确认VVUP v20，下一团YOUNG POSSE。交付后等该团人工确认，不直接开始BEWAVE或其他团，公共功能例外。
- 保留全部既有照片字节、稳定ID、评分、备注、观看状态、owner-only边界。正式主站仍v186，未merge main。

## 可见增量

保留Posse in Frame黑色/酸黄、Inter大字与原团照构图。新增正式 `components/youngposse-artist.tsx` 和作用域CSS，路由使用新组件；旧candidate源、data及照片保留pins。

- 五人等大正方形照片：桌面五列，手机两列，全部中文名/艺名可见。成员目录支持中文和英文搜索、清除、结果数量、无结果与未知ID返回。
- 查看器从旧的display.webp改为真正 `*-original.jpg/png`；页面用已采用webp-v1展示，原图关闭恢复键盘焦点。将内部Link/Picture移到模块层，避免状态变化导致子组件重挂。
- 15发行与22影像槽（14主影像、8舞台）保留既有精确视频身份与标签。筛选数从数据计算；详情→手帐→返回保留成员、媒体、查询与版本。静态index.html规范成逻辑artist路径后再校验returnTo。
- Haze仅关联郑先惠/金徒訚/吉亚娜；39条既有成员作品关系不批量补全。Street Carol主槽和舞台虽然同YouTube ID，仍使用不同评分槽；其现场标签不改称官方MV。
- 14事件单轴升序；手帐样式同步黑色酸黄。当前日期未知显示“发行日期待核实”，不留下无解释空白。

## 素材与 Figma

[data/youngposse-review-assets.json](../../../apps/idol-site/data/youngposse-review-assets.json)记录27资源：6原图+6采用display+15封面，合计7,476,516 bytes。原照片600×600、团照1000×566。21原始图片与本轮公开源下载字节一致，15封面中12来自日本官网、3来自各自Bugs专辑JSON-LD。原图和旧display均未重编码。

Figma文件 `zeLNExz4TbpWRW3uiahef7`，page `850:1132`。实际取得首页1440/390、目录1440/390、成员/作品/发行/影像/时间轴桌面context与截图；四个首页/目录画板同步20照片槽等大布局，保留图像填充，不改共享master。最终成员目录两尺寸重新取context与截图。详情见[figma-evidence.json](../evidence/20261024-youngposse-review-completion/figma-evidence.json)。

网页增加交互搜索输入、清除、结果数、只读审阅提示、照片来源和手帐链接；Figma搜索仍是静态action。完整Figma内页/320与共享手帐画板、官网/Spotify完整视觉研究仍待办，不能称像素一致或整团设计验收通过。

资料边界：Street Carol日本官网/Qobuz为2024-12-13，RBW为12-18，保留null；I know音源参与为Sunhye/Jieun，kawa为Doeun/Jiana，不自动外推MV出演；当前15发行另缺YOUNG POSSE UP与On My Scars，后者6-24/6-26冲突。现有非空发行日期本轮未发现已证实错误。官方具名profile不自动证明当前实时活动阵容。

## 验证

- **138测试全过**：本团图片/pins/精确绑定/0-null/返回与隔离，以及VVUP、SAY MY NAME、KiiiKiii与共享导航回归。TypeScript exit0，正式build exit0。测试与构建日志同证据目录。
- Browser plugin not available；按前端测试技能使用已安装Chrome和bundled Playwright。服务与浏览器在同一Windows机器 `127.0.0.1:4180`。
- **28交互检查**：中英文搜索/清除、原图/封面关闭与焦点、Tab圈定、成员作品切换精确舞台再返回、发行→影像→手帐往返保留查询、现场相同视频不同槽、Haze三人、日期未知、14事件顺序、空结果、未知ID、手机手帐和控制台。
- **3失败恢复检查**：503仍可读作品、retry成功不伪造绑定、指定照片失败后重试恢复同身份。API成功fixture为空白公开目录，非真实后端可用性或保存验证。测试harness最初使用Uint8Array而非Playwright支持的text导致导航超时，修正后可执行；原图分辨率断言由误用Figma展示480修为实际600。
- **35页面真视口**：七类页面×320/390/1440/2048/2560，无横向溢出、破图、空页或框架错误；另测390共享手帐。照片desktop同排同尺寸、mobile同尺寸。发现并修复global `.photo` 最小高度180导致窄屏容器非正方形，最终重跑通过。截图留存首页双尺寸、成员/目录、发行、作品和手帐。
- 旧retention-audit测试在Windows因URL.pathname生成 `D:\D:\` 路径而失败，本轮不放宽旧pins。新测试直接核18旧图片与两个源文件SHA。主站旧剪枝/产物pins问题仍需单独处理，不由本次审阅build推定全量生产包通过。

## 发布与共享

- [YOUNG POSSE v21](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/youngposse/index.html)，owner-private仅owner，外部用户0；get_site复核版本21。
- QA project `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，source `96170679dfbaf679050e25c3ad3e86dfd6cc9d0a`。
- deployment `appgdep_6adb90b451008191adf5fdb5e4b69c91` 返回succeeded；version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_335f830ae98881919e9c9aee83de6a4e`。
- 237旧out文件SHA不变，增35到272；gzip67,451,318 bytes，含hosting常规内容78,496,455 bytes。旧dist保留。最终指纹 `1deb58520f77719079c4f61364d3c7c5c8b14e38bea5ee1e508c0001d62353cd`，155源码输入SHA与发布清单一致。
- `review/youngposse/`通过白名单清空个人字段，只允许本团GET；写入405、其他API404、外部fetch403，原始snapshot和保存模块不进入包。
- 已请求Codex打开线上地址，返回queued；未将其当作已登录线上浏览器验证。真实保存/播放、原生80%/125%缩放、精确视频图/MV个人造型未验或缺失。
- GitHub draft [PR #13](https://github.com/KAtOReNA7/idol/pull/13)已建立并附加，代码提交 `7c517099319cac96c66e29051ed262cd5899ed68` 已推送；文档收尾以远端本分支最新HEAD接续。先处理本团人工反馈，当前不开发下一团。
