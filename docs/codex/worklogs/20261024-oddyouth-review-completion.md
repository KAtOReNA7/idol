# ODD YOUTH 原生页面与私有审阅

用户“同意，继续开发”确认 Candy Shop v23。本轮只推进 ODD YOUTH，分支 `codex/oddyouth-review-completion`，起点 `a1c55190a4c0b2d96bf149f128a62a0e3473868d`。工作树开工前干净，fetch 后与远端相同；没有同任务PR。正式工程是 `apps/idol-site`，不从旧 main 接续。

## 产品与资料

- 新独立蓝白相册页面：首页、五人成员目录/搜索、个人详情、发行库、发行详情、精确视频、单轴时间轴，延续到既有共享手帐。照片等大，中文名完整，原始照片与稳定 ID 保留。
- TOP MEDIA 官网首页及 PROFILE 已实际打开查看；蓝皮卡合照、自然光肖像是构图依据。官网五张2000×2000肖像和1080×1350团照保留，拍摄日期未知；不外推活动/合同状态，不用无标签日期猜生日。
- 五发行12曲目：Best Friendz（2024-11-01）、Best Friendz English（2025-01-15）、I Like You（2025-04-15）、Babyface（2026-03-12）、can't go back（2026-08-19）。英语版发行日不混作01-10公告。
- 11个精确视频预览，五封面1200×1200、11预览1280×720；16张新JPEG保留原字节共3,193,985bytes。原图、尺寸与SHA见应用内资料证据。完整审阅29资源，12,396,467bytes。
- 三个既有作品、两条既有舞台及15条既有成员作品关系。新增发行/视频只浏览，没有伪造native ID、评分或参与关系。Best Friendz Live Clip演唱语种仍待核。
- 评分0有效、null未评分；原有评分、备注、观看状态和用户照片不修改。没有精确MV成员截图时保留缺图，不以资料照冒充。

## 实现与验证

- 原生React组件及独立CSS，不再显示旧ODD候选页；共享手帐只改本团作用域内蓝白主题与等大成员布局。
- 成员和发行搜索、原图/焦点、详情、既有关联、精确MV/舞台与手帐往返。实屏修复首页Syne大字越界，以及320px成员作品名称与评分入口挤压；手机评分入口另起一行。
- 审阅构建使用白名单公共资料投影：清空15关系中的个人值，写入405，CSP connect-src none，原snapshot不进入bundle。新团静态物理路径可刷新与复制。
- 最终49项专项/相关回归通过；TypeScript 0诊断；最终CSS修复后正式Vinext构建成功。不称全库全绿，旧BEWAVE轮13项测试框架问题不属于本轮验证。
- 本机已安装Chrome + bundled Playwright：七类页面×1440/390/320/2048/2560，以及共享手帐五宽，共40布局检查；29项实际交互/恢复检查通过，无pageerror。截图实际检查了完整页面而非只看溢出数。
- 连续路径：首页→成员搜索→具名详情→原图2000px与Esc焦点返回→既有MV→评分与记录→返回精确版本；另外发行曲目/无native版本、舞台身份、无效记录恢复、图片阻断重试均通过。
- IAB起初导航超时，后恢复本地页面；线上v24首页成功打开并读到五成员与五发行。随后点击成员超时30秒且工具reset，未记线上完整交互通过。
- IAB Ctrl+0及两次Ctrl+-后视口/DPR未改变，原生80%/125%缩放未验；没有用CSS zoom或viewport冒充。真实认证保存、视频播放、生产API失败恢复仍未验。

## 设计与Figma

- 四张Image Gen仅为构图参考。网页纠正概念图中的错误人名/照片、英语版年份与假封面，保留官网原图；未将概念图当资料依据或用户批准稿。
- [ODD YOUTH Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1022-1095)：24原生可编辑画板，六色变量、动作组件、文字、自动布局和156个真实图像填充实例。临时采集节点已清除，不是整页截图。
- 主要内页和窄屏已取得实际get_design_context及截图，修正标题/按钮、成员关联行、影像操作和时间轴连续线。最终24画板无右侧越界。
- Figma仍有网页响应式留白、首页出血与共享stage壳控件细节差异，不声称逐像素或完整Figma保真验收通过。详情见 `../evidence/oddyouth-20261024/design-fidelity.md`。

## 发布与交接

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，复核仅owner、0外部访问者。官方source helper打开既有源，逐一保护331旧文件，新增35文件。凭证仅经隐藏stdin传递；一次过期后正常刷新，未落盘或入仓。主站仍v186，未改hosting manifest、访问权限或合并main。

v24 已成功发布，source `73abd2d319ba2d26d504d4f294297ff6149d78eb`，部署 `appgdep_6adbbc0b64388191b1dd363b49e40caf`。最终手机修复只更新本团 `review-oddyouth/app.css` 与manifest，旧331文件再次校验不变；修正版v25已发布，source `500e091b92597b4cf0db33fbccf7bf4d24c02c10`，version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_9473d40a2de4819199ee096370cabd2c`，部署 `appgdep_6adbbe4987008191bbeeb3bde817f898` succeeded。

最终审阅 fingerprint：`3f3d129dd65a32da8cc47c7d9c766e8ac850eba3f6a9d7176d07a859eaee68ed`。

[打开ODD YOUTH](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/oddyouth/index.html)。等待用户确认本团网页后再开始下一团，公共功能例外。后续优先处理审美反馈、线上交互、Figma共享壳细节与真实保存/播放环境。

代码已推送 `54a9eedaf246be2d00cc0cae3fb3573f30f06224`；draft [PR #16](https://github.com/KAtOReNA7/idol/pull/16) 基于Candy Shop分支并已附加当前会话。后续文档提交以最新远端HEAD为准，工作树交接时保持干净。
