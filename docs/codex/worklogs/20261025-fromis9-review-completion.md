# fromis_9 官网风格与完整审阅

- 用户“同意，继续开发”确认 IZ*ONE Panorama v8；本轮仅推进 fromis_9，确认前不开始 EVERGLOW。
- 分支 `codex/fromis9-review-completion`，冻结基线 `6ca25655ae08986a1823b7ca263ac860a2793862`。工作树干净，已 fetch 并检查最新 PR；没有同任务活动远端分支。正式工程 `apps/idol-site/`，本机 Windows 开发、预览和 Chrome 验证。
- 当前官网 https://fromis9.fanpla.jp/ 及具名资料 https://fromis9.fanpla.jp/news/2/；旧 fromis9.jp 为历史页面。已实际查看现官网截图、HTML/CSS：白底、绿字、银色手写标识、Sansita italic 标题、大幅团照与开放列表。弃用仓库旧邮简视觉，目录、搜索、时间轴和手帐作为官网语言下的项目扩展。
- 保留五当前成员与四历史身份、16具名作品/15既有舞台、120既有关联；保持原图、评分、备注、观看状态、稳定 ID 与权限。不把当前阵容应用到历史 MV。
- 复用 IZ*ONE v8 / i-dle v5 的路由、只读投影、原图恢复与手帐业务组件；团页视觉独立实现，交审披露业务复用和官网差异。
- 浏览器路径：IAB 官方页创建读取约45秒无内容返回，按前端测试技能与项目允许的路径改用本机 headless Chrome。Sites source helper 首次被已有 Git 代理10808连接失败阻断；本次命令按现有可用代理7877覆盖，不修改全局代理，随后成功打开同站 v8 源码。
- 发布限定同一 owner-private 审阅站，主站 v186、旧站 v33及其他已确认团体不变。Figma、构建、数据/导航边界、宽屏/手机布局及线上交互分别验证后补记，不把部署/构建当作用户设计确认。

## 最终交付与证据

- 同站v9： https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/fromis9/index.html 。owner一人、external visitor 0，未改变访问策略。
- Sites source commit：`ed413e638509309153b665f7c5473c6a1ce74bee`；version ID：`appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_80812eacca648191ac632d1f47e5a009`；deployment：`appgdep_6adcebd0550881918956c6472d6bc451`，返回 succeeded。
- 最终审阅 fingerprint：`bdee74a7f55aaa638ae2cef22a2bcbeecb41e480059d3deeeb495581cdd95e2c`。70资产 / 41,086,040 bytes；原图未压缩，旧原图未删。253旧非root文件SHA保持，root只新增入口，新增77交付文件，总静态包约188,134,105 bytes。
- 资料：九身份、五当前肖像2000×2500原JPG；三位历史成员来自旧PLEDIS具名资料 https://fromis9.jp/profile ，张圭悧官方演员站遇证书错误未绕过，缺图如实呈现。27项Bugs发行，93条本团署名曲目行（包括重复版本/伴奏，不能称93首独立歌曲）；5项混合艺人发行只列本团曲目。16既有作品、15既有舞台，31影像槽，120既有关联，19事件；未重写历史日期、未新增推测参与关系。
- 来源：现官网 https://fromis9.fanpla.jp/ ，PROFILE https://fromis9.fanpla.jp/news/2/ ，Bugs目录 https://music.bugs.co.kr/artist/20047596/albums 。27封面采用各发行页实际 og:image 原字节，资产来源与SHA见 data/fromis9-review-assets.json。
- 复用披露：从IZ*ONE v8 / i-dle v5继承导航、只读目录、恢复与手帐业务；共享手帐沿用IZ*ONE v8布局并换白绿/Sansita。团页独立重写，完整团照/五当前肖像静态展示。目录、搜索、发行、影像、时间轴、手帐是项目扩展，不是官网逐像素复刻。生成概念未用于资料或页面资产。

## 验证

- `node --test tests/fromis9-review-boundary.test.mjs tests/izone-review-boundary.test.mjs tests/idle-review-boundary.test.mjs`：28通过。实际资产长度/SHA、个人字段清除、重复/跨团关系拒绝、合法历史上下文、未知发行与只读请求隔离通过；builder另执行9个API隔离场景。
- `node node_modules/typescript/bin/tsc --noEmit` 和 `npm run build` 均成功。正式生产构建未发布主站。
- 90布局：10页面×320/390/700/1100/1440/2048/2560/2926/3840真实Chrome视口，检查溢出、坏图、可见零宽图片和脚本错误。首页/成员/详情/发行/时间轴/手帐已查看截图。
- 最终56组本地交互：搜索/空状态/清除、8有图成员×两宽原图与手帐往返、全部27发行详情、精确作品ID、舞台筛选重载、时间轴往返、未知路由、图片失败重试、当前/历史过滤及张圭悧缺图、全部格式筛选返回。初轮测试脚本误用旧专辑6曲断言与未等导航完成导致失败，修正测试前提后最终56通过，非产品缺陷隐藏。
- 线上8组：1440/390各检查首页14图片无坏图/溢出、成员搜索/原图/手帐/精确返回、发行搜索/详情往返、Vitamin ME作品ID/返回。服务身份Chrome同域请求，非用户IAB会话；未测试真实保存和视频播放。IAB打开返回queued。
- 修复：当前目录搜索历史人时显示空提示；“全部影像”不再写非法format=all，保留合法returnTo；影像按日期稳定排序；Glass Shoes / Touchdown / White Memories按已核曲目映射发行；旧fromis9-artist说明与原图路径更新。

## Figma

- [fromis_9 独立页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1219-1095)：33画板（11页面×1440/390/320），70图像组件与可编辑文字/图标/自动布局，非整页截图。节点表见同目录20261025-fromis9-figma-proof.json。
- 8个不同关键节点实际get_design_context含截图：桌面hero/成员、手机hero/成员、发行详情、手机时间轴、成员手帐、MV手帐；时间轴三宽缩进和手机手帐姓名换行已修并重新取稿。
- Sansita Italic可用；Arial/Microsoft YaHei以Inter/Noto Sans SC替代，完整字体度量、伪元素装饰及逐板像素保真仍未通过。自动capture脚本加载但反复poll仍pending；不冒称自动捕获成功，实际交付使用已核DOM结构、原图及原生图层，独立截图验证。

## 接续与限制

- 等待fromis_9网页确认再开始EVERGLOW。设计/功能/资料/上线分层；不把上述自动检查等同用户确认。
- 未验：真实owner保存、真实播放器播放、80%/125%原生缩放、用户IAB会话全流程、Figma全量像素保真、张圭悧官方照片和个别历史日期/当前活动人数。
- 本机scratch：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/fromis9/`；包括qa.json、interactions-hosting.json、live-check.json、increment-proof.json、图片与可重现脚本，无凭证入仓。运行审阅：`node scripts/build-fromis9-review.mjs --out <absolute scratch path>` 后静态服务，托管无扩展名records跳转已覆盖。

- 收尾仅规范化CSS和新增脚本行尾；重新构建 fingerprint 为 `f22504ddeae95536278186d1112c8f8c2974de002f0d7073124b9b45663c1e17`，76个运行时交付文件与v9字节一致（仅manifest来源指纹改变），无需重复发布。
