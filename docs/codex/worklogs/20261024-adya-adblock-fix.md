# ADYA 内容被广告拦截规则误隐藏

## 反馈与复现

用户反馈v26缺失大量内容，截图中首页直接从成员照片开始，发行封面消失、标题挤进窄列。继续在 `codex/adya-review-completion` / PR #17 修复，基线 `d8b7105bcbbcb5dba0c942001cb1c96a4bdf649b`；未开始下一团。

原因是页面把ADYA缩写成`ad-`类名前缀，命中EasyList通用元素隐藏规则。核对的是EasyList `202610232042`、commit `cff668d197ce893b808693570f919c5377c4d71f`（来源 https://easylist.to/easylist/easylist.txt）。直接冲突的8个类：`.ad-caption`、`.ad-cover`、`.ad-footer`、`.ad-group`、`.ad-heading`、`.ad-masthead`、`.ad-poster`、`.ad-text-link`。

本地浏览器加载该列表中的简单`.ad-`元素隐藏规则后复现用户截图：20张图片已加载，只有14张可见，所有五个首页栏目标题均隐藏；封面退出grid布局后，发行文字落入160px封面列。无运行错误。这不是请求慢或缺少图片文件。未读取或修改用户扩展配置；具体扩展订阅列表未取证，不能称已运行用户的完整ABP配置。

## 修复

- 所有团页CSS类、局部变量、作用域属性和搜索输入ID统一使用`idol-adya-`命名空间，避开通用广告命名。视觉、文案、素材、稳定ID、评分和保存逻辑不变。
- 审阅HTML的JS/CSS引用增加内容哈希版本参数，降低重新发布后新旧脚本/样式混用缓存的风险。
- 更新已有样式作用域测试。没有关闭广告拦截、添加高优先级反拦截覆盖或更改访问权限。

## 验证

- Browser插件未列出，沿用已安装Playwright/Chrome进行本地验证，无新增依赖。路径：`http://127.0.0.1:4185/artists/adya/index.html`。
- 同一EasyList规则下，修复后命中0个冲突类，20/20图片可见，首屏、导航、成员/发行/影像/时间轴标题恢复；2560、2048、1440、390、320真视口均无横向溢出。
- 成员目录→中文搜索延秀→详情→查看原图→Escape关闭通过；URL/标题符合目标，无框架错误页或pageerror，桌面和手机截图已实看。
- ADYA现有20项专项测试通过，TypeScript检查与正式构建通过。之前49项是更广回归，本次不把旧结果计为重跑。
- 本机证据在 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/adya-adblock`，含before/after JSON、截图、实际EasyList及验证脚本；不作为跨电脑已提交附件。
- 只替换QA中ADYA的6个入口/脚本/样式/清单文件，另外388文件SHA不变。
- 新审阅fingerprint：`d430539be9adabdc88c33f8ad21d1a021525654043316b3b7f9a5c343cb1cd92`。v27已发布成功。

用户原始浏览器的完整扩展组合仍需刷新后确认。真实保存/播放、80%/125%原生缩放、共享手帐Figma等上一轮待验项保留，本修复不改变其状态。

## 发布与接续

私有QA **v27** 已发布，deployment `appgdep_6adbcad7f450819186e0fa82699c292e` 为succeeded；Sites source `48c86e664d524442a2165c8ca007079cb2b23099`；archive SHA `28f0cc8fddd126f7faf8fe1f7e0324d41f08baaf3fbeb41864d7373a447faf9a`，116858880 bytes、395文件。权限仍仅owner。

部署后的IAB标签读取30秒超时并重置，未继续重试，不能宣称用户完整扩展环境已实测通过。修复已加入同一draft PR #17；主站v186不变，ADYA尚未获用户页面确认。
