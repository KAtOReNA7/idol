# Cherry Bullet 官方参考重设计与审阅接续

- 用户“同意，继续开发”已确认 Rocket Punch v12；按原 Sol 顺序只推进 Cherry Bullet，本团网页确认前不开始 Weeekly，公共功能例外。
- 分支 `codex/cherrybullet-review-completion`，冻结基线 `255424dc8608ec4f8ab4bf8ce170faad228d2e34`。开工工作树干净，fetch/ls-remote核对远端一致，无同任务分支或PR。正式工程 `apps/idol-site/`，根sandbox不动。
- 任务：依据实际官方视觉重新设计首页、十人历史档案、发行/影像、详情、时间轴与既有手帐往返，保留原图、稳定ID、评分、备注、观看状态与权限。业务可承接Rocket Punch v12；任何共享手帐视觉/结构复用交审明确披露。
- 本机Windows源码与本地服务；只发布既有owner-private审阅站，不修改主站v186或旧站v33。开工get_site核对当前v12、owner一人、external0；source helper opening commit `e34abc2f2b0425e95f581b07b9abbdb93eb8f6ec`。
- Sites技能指示有界研究委派，子代理负责官方参考、具名原图和发行/公告证据；主代理负责判断、实施、Figma、验证、发布与GitHub交接。研究素材与临时脚本放仓库外scratch。
- 阻断边界：不猜照片身份、未证实日期或评分关联；不可达来源明确缺口；不绕过证书/认证，不降低审计pins。设计、资料、功能、上线分别记录。

## 页面与资料

- 实际以本机 Chrome / Playwright 打开并截图 FNC 官方图库 `https://fncent.com/CherryBullet/b/gallery/55485` 和 Cherry Dash 发行页 `https://fncent.com/?bid=album&m=bbs&ma_cate=1&ma_lang=1&mod=view&r=CherryBullet&uid=55694`。采用白底、深灰页头、珊瑚红导航、细线与官网 Nanum Gothic 字库，移除旧 RED FILE 视觉。
- 官网当前 logo 图片失效、介绍页为空列表；以排字品牌代替。目录、详情、搜索、时间轴及手帐为项目扩展，不能称独立官网完整复刻。
- 七人使用 2023 Cherry Dash Fashion House 同系列官网具名照；MIRAE、KOKORO、LINLIN 使用 2019 年 1 月官网出道预告照，明确为早期十人时期。七人时期与完整十人目录切换，不将历史阵容称当前活动阵容。
- 9 项音源发行 / 28 条本团署名曲目：7 项核心录音室发行、1 项现场、1 项节目合辑；合辑剔除其他艺人曲目。不宣称穷尽物理专辑封面版本。
- 7 条既有原生作品、14 个精确影像槽（7 MV、7 舞台）、55 条既有关联，保留稳定 ID。评分、备注、观看字段在审阅投影中清空；原数据与 owner-only 写入边界保持。
- 9 条公开时间轴事件；2019 三人活动结束使用公告日期，实际生效日期保持 null，2024 正式团体活动结束有媒体全文转载官方声明支撑。旧 `data/artist-timelines/cherrybullet.json` SHA `64ff6dba3c46077a618374d39c6d95e77e78938e29674a947f60fbf2a9300889` 不变。
- 36 个原字节资产共 36,531,830 bytes：11 张官网照片、9 张 Bugs 封面、14 张精确 YouTube 缩略图、2 个原 WOFF。没有压缩/生成生产素材。来源、尺寸、SHA 见 `apps/idol-site/data/cherrybullet-review-assets.json`。

## 实现与复用披露

- 重写 `components/candidate/cherrybullet-design.tsx`、本团 CSS 和公共资料；增加本团 review 构建、公开投影、原图清单、路由键与历史照片映射。
- 业务状态、路由、搜索、目录/详情部分结构、公开投影与原图恢复机制承接 **Rocket Punch v12**；共享手帐沿用其布局，改白灰珊瑚红。不可称完全从零或将结构复用说成官网原有功能。
- 共享 `app/page.tsx`、`artist-navigation.ts`、`member-affiliation.ts` 仅增加本团合法历史上下文；其他团人物归属与照片规则不变。
- 成员搜索、发行曲目搜索、MV/舞台筛选、无结果清除、未知详情、图像失败重试、原图 Escape/焦点返回、历史名册及搜索参数精确返回已实现。
- 收尾修复：公告日不再显示未知日期；早期照片说明从误写的 2018 修正为 2019；手帐品牌白字避免被共享 CSS 覆盖；个人造型照缺失使用紧凑且实际可见的提示，保留缺图事实，不用团图冒充个人造型。

## 设计与 Figma

- 文件 `zeLNExz4TbpWRW3uiahef7`，页面 `1246:1095`；33 个原生可编辑画板，11 页面 × 1440/390/320。首页、成员/历史名册/详情、发行/详情、影像、时间轴、成员/MV/舞台手帐；36 个原图组件已上传并核对 imageHash。
- 画板范围：1440 为 `1246:1102`–`1246:1112`，390 为 `1246:1113`–`1246:1123`，320 为 `1246:1124`–`1246:1134`。
- 六个不同页面节点完整 get_design_context：`1246:1102`、`1246:1113`、`1246:1107`、`1246:1120`、`1246:1121`、`1246:1115`。MV 手帐 `1246:1111` 只返回 metadata，另 get_screenshot 后对页头 `1248:4122`、主体 `1248:4206`、返回栏 `1248:5001` 分别完整取稿，不把稀疏响应当完整取稿。
- 时间轴/成员手帐三宽已按最终页面同步；最后成员手帐390完整取稿包含可见缺图提示，品牌对比度已修复。
- 自动 capture `43861e0e-5347-426f-b604-017cc88ea0f5` 曾因只读 fetch 拦截停滞。仅本地临时 capture.html 为 Figma 源恢复专用 fetch，生产只读机制未改。capture 完成，但图片序列化为空，只作布局参考；参考 frame `1249:1095` 已清理，原生画板使用单独上传的真实资产。临时 capture.html 不在发布白名单。
- NanumGothic 匹配；Microsoft YaHei 中文在 Figma 用 Noto Sans SC 替代。完整逐字/全量像素保真仍未验收，不由画板数量推出设计通过。

### 概念图 / 最终网页保真记录

同一 QA 中实际查看生成概念、最终1440首页和Figma截图；概念仅辅助版式，不作事实或生产素材来源。

| 项目 | 最终处理及与概念的差异 |
| --- | --- |
| 页头与导航 | 保留深灰白字与白底珊瑚红活动线；增加已有团体索引与只读审阅提示，未编造官网搜索功能。 |
| 主视觉 | 使用官网2700×1800原团照，保持完整3:2，不沿用概念横裁导致的下半身裁切。 |
| 成员 | 真实具名照片代替概念剪影；使用实际七人姓名和完整十人历史档案，去除概念错误的示意人名。 |
| 手机目录 | 成员、发行采用两列以保留可读文字与图片；未照搬概念过窄三列发行。 |
| 发行与影像 | 采用真实 Bugs 封面、日期、28曲目及精确14影像；纠正概念的错封面/曲目/年份，不复制示意内容。 |
| 详情与文案 | 不填概念中的无来源MBTI、担当和购买链接；明确照片时期、来源与既有手帐入口。 |
| 首屏文案 | 主标题 CHERRY BULLET、Cherry Dash · 2023 保留；加入“示例资料 · 评分不写入正式手帐”。这是项目审阅功能，不冒称官网文案。 |

## 验证与接续

- 最终代码：35 项专项/回归、TypeScript、正式 vinext build 通过。构建包含项目原有代理/静态分析提示，无构建失败。
- 本机 `http://127.0.0.1:4199`，Browser plugin 未提供，依 frontend-testing-debugging 技能使用已安装 Playwright / Chrome；IAB另作实际用户会话检查。
- 最终代码 90 项布局：10 页面 × 320/390/700/1100/1440/2048/2560/2926/3840，图片加载、溢出与主内容检查通过；新增缺图提示高度40–100px及品牌白字断言。51 项连续交互通过，无页面JS错误。截图、脚本在仓库外 scratch。
- 中间 v13/v14 线上服务身份 Chrome 走通52项，最后缺图提示裁切检查失败并修复。该次跨发布过程不作为最终版本全量验收；最终版本线上结果单独补记。
- 主站v186、旧审阅站v33未变。相对Rocket Punch v12的432旧非root文件SHA保持；root只加入口，新增43个本团文件。最终静态文件合计263,346,925 bytes，距256 MiB仅余5,088,531 bytes，下一团须先评估新审阅站，不能压缩原图迁就容量。
- 真实保存、真实视频播放、80%/125%原生浏览器缩放仍未验。设计、功能、资料、上线分别判断；本团网页确认后再开始 Weeekly。
- scratch：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/cherrybullet/`；研究旁目录 `cherrybullet-research/`。运行：`node scripts/build-cherrybullet-review.mjs --out <本机临时目录>`，静态服务本机4199。跨机不能沿用此localhost。

## 发布记录

- 当前同站 **v15** 部署成功：`https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/cherrybullet/index.html`。站点 `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a`；回读确认owner/custom，仅owner一人、external0、groups0。
- Sites source commit `e1957a56e171561418190df2be0711f14e356a18`；deployment `appgdep_6add0f35c5408191950152f3236cc017`；version ID `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_430c827b1ca4819196d885f8f728bc0b`。
- 最终代码指纹 `0388cc3a8f08fe599a952e76da43b1e53ea4e10fbf2a1765bd4435ba3e0add21`；打包tar 263,720,960 bytes、477项，SHA `dcc16806a88e3f83ab150c831973510630fbfc37d8bf0cac1fa11fc16a276e38`。未发布的source中间提交不冒充部署版本。v13/v14为本轮已替代修正过程。
- 最终浏览器实际读到线上manifest并与本地指纹一致，390首页全部图片加载、七人及团照原图打开/关闭已通过；最终两宽流程已复验通过，见下表。
- 直接API资源请求为Cloudflare 403，不据此声称线上36素材HTTP/SHA已验；也不能据此认定token失效。正常Chrome带站点服务凭证可读manifest与页面。IAB曾读到v13完整首页；最终刷新45秒、恢复getTab20秒超时，完整最终IAB流程未验，不跨版本继承。
- 源码仓库已核实public；仅追加公开资料和原图，不新增个人快照。凭证仅内存/stdin，无令牌或认证产物入仓；Windows CRLF检查采用 `git -c core.whitespace=cr-at-eol diff --check`。

- 代码与进度提交 `c43ade79d0842307bd256f06ec55a72be97499d4` 已推送；draft [PR #31](https://github.com/KAtOReNA7/idol/pull/31)，base为已确认Rocket Punch分支。最终文档补充以远端HEAD为准，未合并main。

## 最终 v15 线上验证

2026-10-25，本机Chrome服务身份，390×1000与1440×1000。不是用户IAB会话；只发送同站服务认证头，外站不携带。直接API请求403后，改用正常Chrome加载manifest成功，未绕过证书或安全警告。测试曾在异步导航和主题CSS加载前读取DOM，等待实际页面/样式就绪后完整重跑；最终13项通过、pageerror为0。

| 检查 | 最终结果 |
| --- | --- |
| 身份/版本 | 在线manifest与最终源码指纹完全一致。 |
| 非空白/错误覆盖层 | 两宽首页七人成员、完整团照及主要内容可见，无框架错误覆盖层。 |
| 图片与布局 | 首页所有图片decode成功、无横向溢出；两宽截图已留。 |
| 运行错误 | 最终线上pageerror 0；本地90项布局记录的console error/pageerror均为0。 |
| 连续交互 | 两宽各6组：主页/团照原图，十人名册→MIRAE→手帐→精确返回，发行搜索→5曲详情→返回，舞台筛选→舞台手帐→返回，9事件→作品→时间轴返回；包括2019公告显示及紧凑缺图提示。 |
| 原始字节 | 本地36资产pins与432旧托管文件SHA通过；线上API逐资源SHA受403限制，未宣称通过。 |

证据：`docs/codex/evidence/20261025-cherrybullet/online-qa.json`，最终截图在scratch `online-home-390.png`、`online-home-1440.png`；交审显示1440截图。命令为 `node --test tests/cherrybullet-review-boundary.test.mjs tests/rocketpunch-review-boundary.test.mjs tests/everglow-review-boundary.test.mjs`、`node node_modules/typescript/bin/tsc --noEmit`、`npm run build`，临时Playwright脚本为scratch `qa.mjs`、`interactions.mjs`、`online-final-browser.mjs`。最后一项的凭证仅stdin，不入证据。
