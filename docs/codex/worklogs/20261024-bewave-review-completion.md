# BEWAVE 原生海岸相册与只读审阅

北京时间2026-10-24。本轮主代理负责实现、Figma、验证与发布；按Sites技能复用既有素材子代理，仅核公开来源与原图。原上传阻断已于本次接续恢复，v22已发布；下文旧失败为历史，当前状态见文末。

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
- GitHub draft [PR #14](https://github.com/KAtOReNA7/idol/pull/14) 已创建并附加；代码提交 `2d46a530aa78b2e686fdba18299911ac838563f3` 已推送。153源码输入与审阅manifest SHA全部一致；后续文档以本分支最新远端HEAD接续。
- 本机in-app browser已实际打开4181本地首页并取得页面树/截图；这不是线上已登录验证。临时Figma捕获服务4182在收尾关闭。只读审阅构建产物及归档保留在RESUME所列本地目录，可重新启动静态预览。

## 2026-10-24 接续：上传恢复与 Figma 同步

用户要求“解决这个错误，继续推进女团开发”。GitHub fetch确认HEAD与远端均e2bf9c9；Sites源码helper读回b1db595，无多机更新。工作树干净，原gzip归档SHA与已验证记录一致。

上传主机已可在保持证书验证的情况下返回HTTP400（根路径探针），与此前TLS握手失败不同。使用同一Site、同一source和未改变归档，单次save_version_and_deploy_private返回succeeded；后续version读回确认v22，最终get_site确认仅owner、无群组/外部用户。错误属于此前传输阶段失败，本次连接恢复；没有证据证明具体本地配置根因，未改代理/TLS或观众。272旧QA文件逐项复核SHA一致。精确version/deployment、归档和时间见[publication-recovery.json](../evidence/20261024-bewave-review-completion/publication-recovery.json)。

Figma继续补齐9张画板：成员目录和作品库1440/390/320均将静态搜索行改成可编辑输入框与既有按钮组件实例；知言详情三宽补已有作品、未评分状态、下一位入口及真实Edaily来源链接。复用两种产品字体和既有颜色变量；修正变量fallback与320px韩文标题的自适应高度（68px），避免挤压评分行。9板结构读回、5板截图目视，成员320与知言390取得含截图context；最后高度修正另有320截图。其余21板完整对照、共享手帐画板、视频配图仍待办，不计整团设计验收。

线上验证边界：open_in_codex排队后，IAB标签元数据已显示BEWAVE标题/路径，但getTab读取30秒超时。Browser插件不在技能列表，按前端测试技能使用现有Chrome和bundled Playwright，官方Sites授权头请求返回401，停止，不改权限/不重试绕过。未完成线上交互；本地115专项/回归、类型/build、34交互/3失败恢复/35真视口证据对应未变源码，未重复运行冒充本轮新增验证。另13旧测试基线失败保留。

当前交付为[v22私有审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/bewave/index.html)，正式主站v186未动，PR #14仍draft且未合并。等待BEWAVE页面确认后才开始Candy Shop，公共功能例外。
