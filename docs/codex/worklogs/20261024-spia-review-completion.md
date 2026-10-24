# SPIA 原生页面与 v32（2026-10-24，待网页确认）

## 决定、环境与边界
用户确认 W!TCHX v31 后继续下一团，本轮仅推进 SPIA。分支 `codex/spia-review-completion`，起点 `88d9b3e4e40cc0ed3411b2067a1e8e250482108c`；GitHub 为 `KAtOReNA7/idol` PUBLIC。开工和结束前已 fetch/比较，未覆盖他人未提交改动，未 force push。正式工程 `apps/idol-site/`，代码、服务和浏览器均在本机 Windows。主站 v186/main 未改，现有原图、稳定 ID、评分、备注、观看状态与权限保持。

本轮代码提交 `84d0b28ff4920ee82ddf2e7272684d2b1a6274bb` 已正常推送，draft [PR #21](https://github.com/KAtOReNA7/idol/pull/21) 已附到本会话，base 为 `codex/witchx-review-completion`。本日志补录后以任务分支最新远端 HEAD 接续。等待 SPIA 网页确认后再开始下一团，公共功能例外。

## 交付与设计参考
[打开 SPIA v32](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/spia/index.html)。首页、成员目录/详情、发行目录/详情、MV/舞台详情、时间轴和共享成员/作品手帐可往返。

未找到可访问独立官网。`https://campusent.co.kr` 的 HTTPS TLS 失败、HTTP 502，未作为实际视觉参考。实际查看 [KBS 刊载的公司供图及 Deeeep 发行介绍](https://world.kbs.co.kr/service/contents_view.htm?board_seq=451476&id=&lang=k&menu_cate=enternews)，依据树林绿、淡黄与白色作原创页面延展；弃用仓库旧 SPIA 蓝色期刊视觉，不能称官网复刻。

复用边界：TRACER v30 精确视频评分绑定及公开目录投影；W!TCHX v31 导航、原图查看、图片失败恢复与只读审阅机制。共享手帐继续使用既有布局/功能，换 SPIA 配色、字体及准确成员图。目录、详情、搜索、时间轴都是本项目扩展。字体使用本地 Playfair Display、DM Sans、Noto Sans SC。

实现位于 components/spia-artist、lib/idol/candidate/spia-native、lib/idol/spia-photos、data/spia-*、review/spia 和 scripts/build-spia-review.mjs。共享 app/page.tsx 仅添加同时匹配团体和成员稳定 ID 的头像选择；approved-video-poster 仅添加已核实的作品/视频/槽三元组。

## 资料与原图
- 五人成员按2024出道阵容：娜熙 Nahee、卡雅 Kaya、比妮 Beeney、世拉 Sera、哈娜 Hana。中文名是本页转写；未推断未核实生日、身体数据、退团/解散日期或合同状态。
- 五张640×800同系列照片来自 [Kprofiles 具名转载](https://kprofiles.com/spia-members-profile/)，身份与具名段落对应；原始发布文件保留，不称官方高清原件，后者待补。现有 Newsen Nahee 和历史团照未删除。团页明确说明出处，查看原图保留原文件。
- 两发行/四曲：Daddy's Little Girl（2024-04-02，主曲与 Inst.）和 Deeeep（2024-06-05，主曲与 Inst.）。依据 [Bugs 首单](https://music.bugs.co.kr/album/4099720) / [第二单](https://music.bugs.co.kr/album/4102374)及 Genie 实际列表，未沿用 KBS 对第二曲的冲突表述。
- 四个视频已核对 oEmbed 标题和频道，预览图本地化：`FxDq3bqngzQ` 1theK MV，`Da6A05TZR2Y` THE SHOW 240409，`hD1SF0Kvnzc` 1theK MV，`qJ_YiTwk0Vg` THE SHOW 240604。Deeeep 节目6/4先于6/5发行，日期分开。失效官方频道上传 `9TJJFzNnl5Q` 未使用。
- 原生作品 `rec28ldfRTrPua` 的 Daddy MV/舞台各自绑定，五条既有成员关系保留。空白作品 `rec28ldfRTrHzF` 排除；Deeeep 无原生记录，不编造记录/评分关系。认人图缺失如实呈现，未将宣传头像冒充 MV 截图。
- 12张图片原字节、3字体有 manifest。五张原 PNG 为突破整个审阅站256 MiB上限，由公开GitHub固定提交 `84d0b28ff4920ee82ddf2e7272684d2b1a6274bb` 提供；其余图片本地托管。五张远端HTTP与SHA/字节数全部复核，未压缩、裁切或重编码。网页访问依赖 GitHub Raw 图片可达，失败时保留重试。正式源码仍保留本地原文件及默认本地构建。

## 验证
Browser plugin not available；本地采用既有 Playwright/Chrome，线上 CUA IAB。测试入口是 SPIA 首页→成员搜索→原图→成员手帐→返回，以及精确MV/舞台→对应手帐→返回。

```powershell
cd apps/idol-site
node --test tests/spia-*.test.mjs tests/tracer-content.test.mjs tests/witchx-content.test.mjs tests/tracer-review-catalog.test.mjs
npx tsc --noEmit
npm run build
node scripts/build-spia-review.mjs --out <独立绝对目录>
node scripts/build-spia-review.mjs --out <独立绝对目录> --public-originals-ref 84d0b28ff4920ee82ddf2e7272684d2b1a6274bb
```

| 层次 | 实际结果 |
|---|---|
| 单元/回归 | 37通过，包括固定SHA外部原图模式、公开投影、精确绑定、路由及隔离 |
| 类型/正式构建 | 通过；最后正式构建覆盖Playfair字体；随后仅修改审阅打包选项及文档，37测试复验通过 |
| 布局 | 9类页面×320/390/1440/2048/2560，共45真视口；图片完整、无横向溢出、页面非空，无框架错误覆盖 |
| 主流程 | 成员搜索→原图→Escape关闭+焦点还原→成员手帐→返回保留搜索/member，通过 |
| 补充 | 28场景：空搜索/3非法详情/图片失败重试/5宽已知EasyList规则、5成员×2宽手帐往返、4视频×2宽精确绑定；原图改为固定GitHub交付后全部重验 |
| 共享作品手帐 | MV与舞台在390/1440加载、准确槽位/预览、返回media身份及无溢出已验；未实际播放或写入 |
| 页面错误 | 最终本地 pageerrors=[]；测试中主动中断图片请求为预期失败恢复场景 |
| 隔离 | 5条脱敏关系、9项API隔离；私有评分/备注/观看字段不进入审阅；connect-src/form-action均none |
| 线上 | Sites succeeded。IAB goto与后续getTab读取各30秒超时；open_in_codex为queued。没有证明线上已渲染或交互通过 |
| 未验 | 真实保存、真实播放、80%/125%原生浏览器缩放、完整线上流程；不将只读审阅冒充生产保存验收 |

## Figma
[本轮页面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1113-1095)，[索引](20261024-spia-figma-frames.json)：11类页面×1440/390/320共33可编辑画板。12个单独照片组件，原生文字/auto-layout/vector，颜色变量与文字样式；没有把整页截图作为画板资产。

8个不同节点实际取稿，关键首页、成员、共享手帐已查看截图；修复246处同行文字/箭头及共享页头的分组/大小写，最终舞台手帐截图确认排布恢复。完整逐字间距、字体度量及所有画板像素对照仍待验。辅助HTML capture持续pending，未将它算完成；最终使用已建立的原生可编辑画板。capture脚本/临时HTML没有进入发布清单。

## 发布结果
- Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，实际 **v32**；owner/custom，1 owner、0外部访客，权限未改。
- Deployment `appgdep_6adc83d082b88191b7d4348723a34836`，succeeded，`2026-10-24T10:09:34.083389+00:00`。
- Version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_c3414207883c8191a4d60b884127c55d`。
- Sites source `7ceaa4124a1bc8fc682db9e8d3ee89a384f0519a`，不是GitHub工程提交；fingerprint `ed7e82798b0d3f992a4b3a79ed31387ca3fe83619525b22fba865422cf88e2ae`。
- 483个旧文件SHA不变，最终498文件，266163361字节。第一次本地包含全部原图的269989173字节包超过256 MiB，上传被拒绝、没有生成已发布版；`87c2b95177b6df68ea1563634bb3ae9617276ef0` 是失败上传源。随后仅移除尚未发布SPIA包中的五份PNG副本，改用固定GitHub原文件，旧483文件再次校验不变。未修改既有团体或压缩原图。
- GitHub已正常push；不保存短期凭证。过期Sites凭证通过同站连接器刷新、隐藏stdin传入helper，没有新建凭证文件或改变授权范围。

## 证据与下一步
公开结果：[发布证据](20261024-spia-public-delivery.json)。本机证据根 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/spia/`，包含 browser.json、extra-qa.json、remote-original-proof.json、site-additive-proof.json、tests-final.log、build-final.log、首页/详情/手帐截图及Figma图稿。线上工具超时没有截图，不借本地图冒充线上证据。

等待用户网页确认；继续时先fetch本分支最新HEAD、读STATUS/RESUME。任何沿用仓库设计仍需披露版本与范围。原生保存/播放、原生缩放、完整Figma像素对照及官方高分辨率成员原件属于明确待办，不能被当前自动化结果覆盖。

收尾：本轮临时 capture.html 已移除，自己的4189静态服务已停止；线上打开请求已排队，交审以永久链接为准。工作树生成文件 tsconfig.tsbuildinfo 已恢复到本轮基线原字节。最终文档补录提交与源码分支一并推送，不重复部署文档变更。
