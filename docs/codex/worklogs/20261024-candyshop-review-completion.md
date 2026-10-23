# Candy Shop 原生页面完善

## 范围与起点

用户在 BEWAVE v22 后回复“好的这个团同意，继续开发”，本轮只推进 Candy Shop，不开始 ODD YOUTH。BEWAVE 页面已获用户确认，其历史技术待办保留。

- 分支：`codex/candyshop-review-completion`，基于 `7a9b57bebc306dbe07addb7797255725aec6e05d`；开工工作树干净，fetch 确认远端一致，无 Candy 分支。
- 正式工程：`apps/idol-site`；主站 v186 不改，仅同一个 owner-private QA Site 增量。
- 保留所有原图、稳定记录 ID、用户评分/备注/观看状态和现有权限。

## 研究与设计决定

- 已实际用本机 Chrome 看官网首页、PROFILE、DISCOGRAPHY，截图位于本机 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/candyshop/`。Browser 插件未安装；IAB createBrowserTab 30 秒超时并重置，按 frontend-testing-debugging 技能采用已安装 Chrome + bundled Playwright。
- 官网：<https://candy-shop.jp/>；具名照片和生日/定位：<https://candy-shop.jp/about>。四人网页名册只表述为官网列示，不据此断言近期活动情况。
- 唱片：<https://candy-shop.jp/discography>，3 张原始封面已取得。粉色/淡紫、独立大字与照片、开放式唱片栏取自实际视觉研究；不沿用旧米色小头像候选。
- YUINA 保留 2024 出道时期照片及 Good Girl 关系；不写成退团。JULIA 后续加入，既有12条关系保留，不给历史 MV 套现名册。
- Image Gen 仅用于布局概念，网页使用真实照片与正式封面原文件。四张概念在本机 generated_images 目录：`exec-22eeee49-0353-42de-886c-2f621f2a2d01.png`（首页）、`exec-74ee6255-de32-46c4-8f24-b47c64b3e59c.png`（成员）、`exec-da86a9a6-4403-4020-8501-6927d7ab0435.png`（作品/时间轴）、`exec-d383e3f0-bcdb-4af4-9473-6cef702f3fb5.png`（详情/手机）。这是执行方选定的实施参考，未冒称用户已批准概念。
- 实施前纠正概念偏差：删除图中擅自生成的 Former Member（未知退团）；删除虚构 Good Girl 等小封面；手机秀伊使用具名原照；没有手机硬件外框；原图 contain 保全构图；增加必要历史照片和来源披露。
- 设计 tokens：白 `#ffffff`，墨色 `#57364f`，粉 `#f9e5ef`，紫 `#eee7f5`，线 `#d8c7d3`；英文 Bodoni Moda，中文 Songti/宋体与 sans 正文；4px 控件、无大圆角套壳。首页、成员、发行、详情、影像和时间轴延续该语言。

## 进度

原生页面及只读审阅已实现；v23 已发布，等待用户对 Candy Shop 页面确认，不进入 ODD YOUTH。

## 实现及素材

- 公开原图与封面22张，全部记录字节、SHA和真实解码尺寸；7张精确视频预览均1280×720。加上3字体共25素材、10,593,871bytes。新视频来源证据独立归档，不带本机路径或私有值。
- 保留五个成员ID、三个作品ID、三舞台精确videoId和12条既有成员关系。三发行十曲目（含伴奏）、六事件。Tumbler无native记录，明确只浏览。舞台不外推MV个人关系。
- 成员/作品搜索、筛选、详情、完整原图、焦点返回、个人记录和作品手帐往返。修复全局main宽度继承、手机中文标题换行、成员搜索词带入作品目录；手帐同步粉紫主题。
- 审阅包使用真实组件和共享App；构建时白名单投影清空个人评分/备注/观看，CSP connect-src none、写入405。原始snapshot不进入bundle；原用户数据未修改。

## 设计对照与Figma

- 四张Image Gen概念均实际打开对照。保留梅紫大字、白底与粉紫、真实团照、四列等大人物、开放唱片栏、单轴事件。概念与产品的有意差异：结菜保留原始介绍卡及暂停说明；删“Former Member”；删除假封面；替换手机占位图；删手机硬件外框；MV/舞台按精确版本拆成七项；加资料来源和日期口径。
- Figma page `1006:1095`，24原生可编辑画板，完整节点映射见 `../evidence/candyshop-20261024/figma-map.json`。使用保留JPG原图、三封面、精确缩略图、自动布局、文字及6颜色变量；不是整页截图贴入。9处 get_design_context 包含代码与截图，无sparse响应。
- 对每类页面三尺寸截图检查。手帐按实际共享stage入口与只读状态对齐；未用概念照假充MV成员截图。网页的浏览器字体、响应式间距和共享手帐控件以实际实现为准，未宣称逐像素完全一致或用户已认可设计。
- Figma原图导入曾因后台Chrome命令被自动策略拒绝而改用支持的IAB页面捕获；后者成功。原生脚本一次横向hug宽度错误后修正，最终写入1471初始节点，手帐随后按真实状态更新。临时导入节点在收尾删除。

## 工程与浏览器验证

- 50项Candy专项/导航保存回归/BEWAVE保护测试全部通过；TypeScript 0诊断；`npm run build`正式Vinext构建成功。未运行或宣称全库全绿；既有13项旧框架失败见BEWAVE日志。
- 早期Chrome+bundled Playwright完成7页×5视口；后续IAB恢复可用，最终通过CUA对8类页面（含手帐）×1440/390/320/2048/2560检查，未发现横向溢出、框架覆盖层或空白页。截图在外部可视化目录，未将浏览器截图打入源仓库。
- 实际连续路径：首页→成员搜索Soram→素岚详情→Good Girl→评分与记录→切换THE SHOW舞台→返回精确MV详情。跨目录搜索已清除，返回目录保留同类筛选。素岚原图为2240×3360，Esc关闭后焦点回到“查看原图”。Tumbler搜索及详情显示“此版本暂未接入手帐”。
- CDP阻断当前团照请求，看到失败提示与单张重试按钮；解除阻断并点击后恢复1600px真实图。阻断与禁用cache设置已撤销。最终长页截图核查发现首次截图尚未触发部分懒加载；实际滚动后3张封面全部完成解码，未误记为错图。
- 40视口检查为浏览器viewport override，不等同80%/125%原生缩放。真实认证编辑保存、播放、生产后端故障恢复、原生缩放尚未验；审阅只读不伪称保存成功。线上浏览器40秒导航超时，不能继承本地交互验收。

## v23发布

- 同一owner-private QA Site；get_site复核仅owner、0外部访问者。源helper打开v22 `b1db595f6fa843e5e7cba6ab56ec42b0e75ad160`，所有299个旧out文件SHA保持，新增32文件。正式主站v186未动。
- source commit：`ba5eaecd55214522e0e418bfed697de71d23ccc5`；sourceFingerprint：`f0e57502c818bb8738c3d8fc0a8038e8bd00be66abc2750b68ff8db57e8a8f38`。
- 官方helper推送并打包，archive-backed发布；version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_6a6aa8e53fc8819188221e6b67492d1b`，部署 `appgdep_6adbb1d2b1948191b8f0218a47cc321a` succeeded；get_site确认最新v23。
- [Candy Shop私有审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/candyshop/index.html)。线上IAB导航超时并reset；open_in_codex返回queued，仅代表已请求展示。

## 接续

等待本团页面确认，再推进ODD YOUTH。优先处理审美反馈和线上已登录浏览器复验，保留原生缩放、真实保存/播放及MV成员特定截图缺口。不得用官方概念照覆盖缺失MV截图，不擅自升级主站或扩大访问范围。
