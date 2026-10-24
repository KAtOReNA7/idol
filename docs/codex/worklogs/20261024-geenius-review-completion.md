# Geenius 原生页面与 v28 审阅（2026-10-24）

## 范围与起点

用户在 ADYA v27 修复后回复“同意，继续开发”，确认 ADYA 并授权按 PRD 推进 Geenius。正式工程 `apps/idol-site`，分支 `codex/geenius-review-completion`，起点 `ea9baa90132ee0020594e0b6b26377800b8985b8`。开工已 fetch、检查工作树及活动 PR，无重复任务；交付前再次 fetch，ADYA远端仍为该起点。主站 v186 和 main 未改。

本轮仅 Geenius 页面、公开资料、精确预览接线、只读审阅及进度文档。共享修改仅公开导航allowlist与严格视频预览映射；评分、保存、权限和原始快照逻辑未改。保留原图、稳定ID与全部用户记录。需求以design-requirements、collaboration-playbook最新决定为准。

## 网页与资料增量

- 保留Geenius自有纸色、蓝灰墨色、Instrument Serif书名与竖向团照图版；实际查看HOMe官网和Bugs正式发行页，借鉴肖像与留白结构，不复制其他团视觉。
- 五人成员等大真实照片，桌面五列、手机两列；成员搜索、详情、原图、下一位、个人档案和手帐往返。中文名明确为转写，生日与当前活动状态未冒称官方确认。
- 三项发行：Voyage、芮英Daydream OST Part.6、电视剧OST总集。总集明确46曲，本团相关曲仅第1碟6/12轨；不是第三张团体单曲。
- 七个精确视频：Voyage MV、it's Live、五个单成员I.L.Y版本。每个有真实预览，五版本分别对应既有work ID和单个成员，未新增虚假全员关系。
- 四事件组成单根时间轴。搜索返回保持同目录条件，跨目录清理无关查询；舞台与手帐按精确ID往返。
- 样式均用 `idol-geenius-` 命名空间；脚本/样式带内容版本参数，图片失败可重试，原图按钮打开源文件。
- 审阅使用真实原生组件与共享手帐，仅GET白名单，写入405；个人评分、备注和观看字段清空，0/null语义保持，正式快照未改。

来源：[HOMe官网](https://www.geeniushome.com/geenius)、[官方频道](https://www.youtube.com/@geenius_official)。成员姓名和肖像由官网同一内嵌对象绑定，未凭脸推断。Bugs发行 `20615423`（2024-01-05）、`20648097`（2024-06-08）、`20654296`（2024-07-03）已核。新增3张1200²封面、7张1280×720精确预览，源字节和I.L.Y内置黑边保留。

七视频官方oEmbed标题/频道已核。I.L.Y的2026-01-05日期由芮英/米卡元数据确认，其他三个版本未新增确认日期，原快照日期未擅改。Daydream官方独立视频未查实，未制造视频。Spoiler Book只有QR器乐预公开/零售日期证据，不把《Love don’t change》写成已确认完整人声发行。

公开证据：`apps/idol-site/docs/artist-evidence/geenius-review-20261024.json`；素材地址、真实尺寸、SHA见 `data/geenius-review-assets.json`。

## 本地验证

代码、Chrome/Playwright、Python静态服务器均在用户Windows；本地端口4186，不是云端localhost。依赖复用现有安装。Browser插件未提供，按frontend-testing-debugging使用已有Playwright；IAB本地首页也已成功读取，应用warn/error为空。

| 层级 | 本轮结果 |
| --- | --- |
| 专项/导航回归 | 39通过：`node --test tests/geenius-*.test.mjs tests/artist-navigation.test.cjs tests/artist-navigation-scroll.test.cjs` |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit --incremental false` 通过 |
| 正式构建 | `npm run build`，Vinext构建通过 |
| 真实视口 | 320/390/1440/2048/2560，各8类原生页加共享手帐，共45项；无横向溢出、坏图或应用异常 |
| 连续交互 | 3场景：成员搜索→原图→Escape焦点恢复→I.L.Y→手帐→返回；发行搜索→个人署名→返回/刷新；舞台筛选→精确stage |
| 恢复/映射 | 4场景：无结果清除、非法版本恢复、单图失败重试、五个I.L.Y版本精确成员与work绑定 |
| 广告规则 | 五宽注入曾导致ADYA缺失的同组EasyList规则，首页16/16图和标题可见 |
| 播放入口 | 点击播放产生正确 `youtube-nocookie.com/embed/NLa_eJYKcfQ`；只证明入口，未验证实际音视频播放 |

最终审阅构建：23图片资源、7,655,337字节、10条公开关系、9项API隔离检查。源码指纹 `3e337781969116c4747f405360b87ba058530aa1bb6baedef1980f4b5920ed9b`。捕捉脚本已移除；`script-src 'self'`、`connect-src 'none'`保持。

截图与本地JSON证据：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/geenius/`；`browser.json`、`additional-qa.json`、`records-qa.json`分别记录布局、交互/广告规则和手帐。可重复构建脚本、素材与测试已入仓，不依赖临时目录接续。

## Figma 与设计状态

[本轮专页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1047-1095)。27画板覆盖首页、成员目录/详情、发行目录/详情、影像详情、舞台详情、时间轴、共享手帐的1440/390/320。桌面首页 `1054:1095`，手机 `1055:4722`，320px `1055:9364`。索引见 `20261024-geenius-figma-frames.json`。

先查Code Connect、已有屏幕、团队库和变量/字体样式，未找到Geenius可用组件；建立7颜色变量与16真实图片组件。原生自动布局、可编辑文字、SVG向量和图片实例组成页面，没有完整UI截图填充。网页capture完成后临时稿与两个不完整首屏草稿已删除。

关键长页与内页已截图比对；修正手机成员列数、正文溢出、返回箭头、手帐关闭字幕帮助时的错误展开内容。读取9处内页/手机设计上下文，检查字体和图片。320px成员简介因可用CJK字体比Windows网页多一行，已留足空间；列表标记、双线、局部控件和完整逐字间距仍待逐板对照，不能宣称像素级全一致。共享手帐现有MV认人截图仍缺，如实显示“暂无MV截图”，未用概念照冒充。

## 私有发布

- 同一Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，owner-private、0外部访客；未扩大访问。
- **v28**，2026-10-24 05:59 UTC发布成功；[实际Geenius页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/geenius/index.html)。
- Sites source commit：`4d7baa39a48dc3c670b92a2efe45c6c72acbef78`。
- 版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_8a1a07a40cc88191b729cb9b46332822`；deployment `appgdep_6adc491c0ba48191bf1eee6962374b1e`，终态succeeded，已读回确认v28。
- TAR 125,593,600字节、424文件（423静态文件+hosting清单），SHA256 `1e9835153285649ddff0f8741e396be15ce6eb6ad0e9c7969ead6bdef6827974`。
- 新增29文件、1个已有共享字体SHA相同；原394个QA文件SHA全部不变，正式主站未覆盖。
- IAB线上导航和随后读取均超时。清单显示Geenius标题及线上地址，但没有可靠线上内容/交互证据；已将实际URL排入用户面板。不能宣称线上交互全过。

## 交接与待办

GitHub已复核PUBLIC，本轮仅公开素材/代码/文档，没有扩大既有私有快照分享授权。代码与首轮交接提交 `48672554f2b9de6a6bbd22969aff7f7b16838737` 已推送；draft [PR #18](https://github.com/KAtOReNA7/idol/pull/18)，base为 `codex/adya-review-completion`。后续文档以本分支最新远端HEAD为准。 未合并main。

复现审阅：在 `apps/idol-site` 运行 `node scripts/build-geenius-review.mjs --out <仓库外独立目录>`，静态服务打开 `/artists/geenius/index.html`。正式开发使用现有工程脚本。

待办分层：Geenius网页人工确认；线上已登录浏览器交互；真实保存/播放；80%/125%原生浏览器缩放；Figma剩余字体/标记/控件细节；MV个人截图与未证实发行素材。不能用本轮测试或发布成功推定这些项目通过。**Geenius确认后才推进TRACER，公共功能例外。**
