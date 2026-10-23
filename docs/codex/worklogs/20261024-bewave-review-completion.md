# BEWAVE 原生海岸相册与只读审阅

北京时间2026-10-24。本轮主代理负责实现、Figma、验证与发布；按Sites技能复用既有素材子代理，仅核公开来源与原图。发布目前受外部上传连接阻断。

## 基线与授权范围

- `KAtOReNA7/idol` public；正式工程 `apps/idol-site/`。`codex/bewave-review-completion` 基于YOUNG POSSE的 `81a572d8944c6604a08e5302c77e4cafbfb950c7`。开工与提交前核远端，无同名分支更新。draft PR目标base为 `codex/youngposse-review-completion`，未merge main。
- 用户在YOUNG POSSE v21后“可以 继续开发”，该页面已确认。本轮只推进BEWAVE；发布并确认前不开始Candy Shop，公共功能例外。
- 旧candidate、BEWAVE原始data、用户snapshot、评分、备注、观看与后端未改。只扩展共享导航键白名单。

## 可见增量

浅海蓝与轻衬线刊头、完整历史团照、同次具名采访的6人相册。桌面3×2、手机2×3等大容器，不拉伸原图。独立海岸相册设计；复用导航/只读契约。

- 首页、历史成员目录/搜索、个人详情/真原图、发行库搜索筛选、发行详情、精确影像/舞台详情、单轴时间轴。
- 4发行：BE;WAVE、Be your Wave、Christmas Eve（知言&允瑟）、I'm so fine（知言）。4张1200×1200正式封面原字节。
- 5影像槽：2既有主影像+2既有舞台+1新Special Clip。新增 `browse-christmas-eve` 不创造业务rec ID/评分绑定，日期空值保持未知；未核solo视频不添加。
- 2既有成员作品关系，不制造全员关系。原生手帐往返保留q/member/release/media/format；只读审阅清空个人字段，写入405，非本团API拒绝，CSP connect-src none，raw snapshot不入浏览器包。
- 4事件：2024保留月精度；2025/2026明确平台音源目录日期。Be your Wave历史回顾来源修正为实际2025新闻，避免把概念图贴文冒充该新闻。
- 实际目视发现 `.bio h2` 误放大“参与发行”；收窄为直属标题并补关联成员链接样式，复验通过。

## 资料与设计证据

见[research.json](../evidence/20261024-bewave-review-completion/research.json)、[素材清单](../../../apps/idol-site/data/bewave-review-assets.json)。六肖像原图670宽（知言1005高，其余1004），本轮Edaily具名caption与远端原字节匹配；团照1170×1539原字节保留，官方贴文可读但团照本轮未重新下载比对。20审阅assets含19图片和字体，共4,105,955 bytes。

2025-10-31为报道中计划的阵容调整，实际执行、当前名册、解散均未证实，不能推断。官网近期作者栏不当合同名册。Christmas Eve平台目录2025-12-09；官网具名Special Clip `ArzJgb9gJZk` 的上传日未知。I'm so fine平台目录2026-08-23，官网本人介绍支持收录；未核精确视频。第二镜像视频仅线索，未采用。X 403/空白、直接bstage 403和YouTube节流均停止，不绕过重试。

Figma文件 `zeLNExz4TbpWRW3uiahef7`，独立page `977:1095`。7类×1440/390/320共21可编辑画板、2本团组件、5颜色变量；使用7张JPEG原图和4封面。原捕获未带图片，最终删除参考节点975:1095和18临时素材框。上传helper初因Windows CR换行等待，修正后成功；WebP填充在渲染端空白，换保留JPEG原图后显示；自动布局固定高度裁剪已修正。

实际目视8板（含首页双尺寸、成员390、成员1440、作品1440、发行390、影像320、时间轴1440），首页1440与成员390取得含截图非稀疏get_design_context。完整节点映射见[figma-evidence.json](../evidence/20261024-bewave-review-completion/figma-evidence.json)。Figma搜索为静态文本、部分来源/关联区/网页控件与共享手帐待同步；21板未全部逐一目视和取context，未宣称像素一致或整团设计通过。官网视觉研究受terms/cookie遮罩限制，Bugs封面及页面实际看过。

## 验证

- 115项BEWAVE/YP/VVUP与导航/成员作品回归全部通过；事件来源链接最终修改后21项本团测试再过。TypeScript exit0，正式 `npm run build` exit0（仅代理环境及vinext路由静态分类提示）。
- 扩展旧 `catalog-read-deadline.test.cjs` 的132项中119通过13失败。IVE 4项依赖旧retry函数名、文案与alert结构；SAY MY NAME 9项因mock未覆盖useLayoutEffect。将唯一相关共享修改导航JSON替换为HEAD版本后，132项仍119/13且失败名称一致；其他被测源码与HEAD相同。本轮未放宽测试或修改旧团。不是全库测试全过。
- Browser plugin not available；同Windows上的已安装Chrome+bundled Playwright，服务127.0.0.1:4181，未安装新依赖。
- 34交互检查：身份/首屏、中文英文搜索/清除/空态、真原图及焦点圈定/恢复、封面原图、成员→已有作品→舞台→返回、发行→精确舞台→手帐→返回保留查询筛选、具名双人/个人作品、新clip未接手帐、未知ID恢复、手机手帐和无写入入口。无控制台warning/pageerror。
- 35页面检查：7类×320/390/1440/2048/2560真视口，无横向溢出、破图或框架错误；另有390共享手帐。3失败恢复：503不挡浏览、重试不造绑定、单图失败重试恢复原身份。fixture为空白公开目录，非真实保存或后端可用性验证。
- 未验：真实保存、视频播放、原生80%/125%缩放、线上已登录BEWAVE浏览器、全部Figma画板精确对照、精确视频配图/MV造型。主站既有全量剪枝/pins事项保留。

## 发布与共享

- QA project `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，get_site核owner-private，仅owner、0外部用户。正式主站仍v186。
- 旧272 out文件SHA不变，新增27，总299/83,712,038 bytes。最终review指纹 `e5e14689c4cafc2946f4a76f3e5dc5eb594165ca98e5241c78c7239c750508be`，JS849678/CSS100075，9隔离检查、2净化关系。
- Sites source `b1db595f6fa843e5e7cba6ab56ec42b0e75ad160` 已由helper提交推送；归档71,764,963 bytes。早先helper凭证过期，按原Site正常续期；未改观众。
- native save/deploy在上传archive到sdmntprwestus3.oaiusercontent.com时连接失败（azure_client_request_id `44a84486-d4f6-4ce5-a25b-8ff975aaf395`）；没有version/deployment ID。随后get_site仍v21，curl同主机TLS握手失败。受支持的source自动私有发布能力返回false，未启用。**BEWAVE没有上线，文件名v22不代表已发布版本。**
- 网络恢复后按RESUME核现状，再从同一推送source/归档恢复。不要重复创建Site、改观众或绕过上传权限。发布完成后打开实际URL并等BEWAVE人工确认。
- GitHub实际提交/PR记录在本日志末尾补充。
