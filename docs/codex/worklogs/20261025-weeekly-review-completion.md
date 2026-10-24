# Weeekly 页面接续（2026-10-25）

用户本轮“同意，继续开发”已确认 Cherry Bullet v15，仅推进 Weeekly，下一团等待网页确认。冻结基线 b8baf83c763328dbc6465e6655b18accf329d893，分支 codex/weeekly-review-completion。正式工程 apps/idol-site/；旧审阅站 v33/v15 与主站 v186 保持。

## 本轮交付与官方参考

- 新的 [Weeekly v1 owner-private 只读审阅页](https://idol-weeekly-review-oct25.wuke40758.chatgpt.site/artists/weeekly/index.html)已发布。本轮网页待用户确认；不开始下一团，公共功能例外。
- 实际查看 [官方 Weverse Highlight](https://weverse.io/weeekly/highlight) 和 [Genie《Bliss / LIGHTS ON》官方发行专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428)。弃用旧周历便签视觉，采用白底轻导航、灰粉官方 Bliss 原横幅、黑色文字、完整校园团照与等大成员照片。
- IST 当前公司首页可以访问，但本轮未找到有效 Weeekly 专页。这是官方社区与发行语言的项目扩展，不是独立官网复刻。研究、具名来源、日期与发行证据见 `docs/codex/evidence/20261025-weeekly/`。
- **复用 Cherry Bullet v15 的路由、只读公开投影、搜索、原图恢复和部分目录/详情结构；共享手帐沿用布局并换灰粉白黑配色。** 团页重新编排；搜索、时间轴、手帐是项目功能。交审必须披露这些复用及官网差异。

## 资料、资产与业务边界

- 七份历年成员档案；首页与默认目录展示 Bliss 六人时期，申智阭保留于完整七人历史名册。不能由2024照片推定2026当前活动阵容。保留仓库中文姓名与七个稳定成员 ID，团体 ID 为 `recvxyEBDZPbu5`。
- 22 项发行、58 条本团署名曲目行，包含版本、伴奏、合作及重收，不等于58首独立歌曲；以Bugs艺人目录及22个实际读取的详情页为据。合辑排除其他艺人曲目；联合署名保留。
- 14 条既有具名作品、24 个精确影像槽（14 MV、10舞台）、73 条既有关联。两条 Stranger 保留不同语种及稳定 ID；不赋名原生空白作品，不制造评分关系。
- 14 条公开时间轴事件。2022-06-01 申智阭离团是媒体全文转载公司声明明确的生效日；2025-02-26 六人合约结束只作为公告日，实际生效日 null、状态 announced，不推定解散。2025-05-01 Weverse公告与2025-05-08 15:00 KST服务结束分开记录，频道保留。旧 `data/artist-timelines/weeekly.json` 未改。
- 55 个原字节资源，共 38,303,867 bytes：六张2000×2800官方具名 Bliss ON 照、申智阭2000×3000 AWAKE历史照、2800×2000完整团照、1368×456原横幅、22个Bugs原封面与24个精确YouTube缩略图。生产没有用生成图片，也没有缩放、转码或二次压缩；SHA与字节数全部核对。
- 既有评分、备注、观看状态及用户快照未改；审阅公开投影移除个人值。原 owner-only 保存边界保持，静态审阅拒绝写入。

## 实现范围

- 重写 `components/candidate/weeekly-design.tsx`、本团 artist/experience CSS 与本团公共资料；新增 review 构建、路由键、只读投影、公开时间轴和照片映射。
- 共享 `app/page.tsx`、`lib/idol/artist-navigation.ts`、`member-affiliation.ts` 仅添加合法 Weeekly 历史上下文。照片和主题只在合法本团往返生效，不覆盖其他团人物归属。
- 成员/发行/影像搜索，历史名册，发行曲目详情，MV/舞台筛选，原图与Escape焦点返回，未知详情，图片失败恢复，搜索/筛选/历史名册/时间轴与手帐精确往返均已实现。
- 修复公开发行credit类型、公告事件枚举以及手帐文字对比度和缺图提示；现有缺图事实仍明确呈现，不用团图冒充个人造型。

## Figma 与保真记录

- 文件 [Weeekly 设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1258-1095)，页面 `1258:1095`。33个原生可编辑画板：11页面 × 1440/390/320，包括首页、成员/历史名册/详情、发行/详情、影像、时间轴及成员/MV/舞台手帐。
- 55个原图组件均上传成功并核对 imageHash；可编辑文字、图标、auto layout与颜色变量齐备。1440画板 `1258:1102`–`1258:1112`；390画板 `1258:1113`–`1258:1123`；320画板 `1258:1124`–`1258:1134`。
- 完整取稿的五个页面节点：`1258:1102`、`1258:1113`、`1258:1107`、`1258:1120`、`1258:1116`。成员手帐 `1258:1121` 返回稀疏metadata，已另取截图，并完整取页头 `1260:7136`、主要资料 `1260:7194`、已关联作品卡 `1260:7344`；`1260:7184`仍稀疏，不算完整取稿。
- 三个时间轴画板已修复标记重复占位造成的40px右移及标题2px宽度溢出。每板14事件，最终文字X分别为200/76/76，与DOM几何一致；三个最终截图实际检查，390重新完整取稿。没有修改正常网页或缩小字号掩盖问题。
- 原生capture完成但未带入image fills，仅作参考；参考frame `1256:1095`已删除，保留独立真实图片组件及可编辑画板。临时capture.html未进发布白名单。
- Georgia→Noto Serif、Arial→Inter、Microsoft YaHei→Noto Sans SC。完整字体、逐字间距及全量像素保真仍未通过，不由画板数量推出设计通过。

### 概念图与最终网页差异

生成概念图仅用于版式探索；已实际查看概念、官方参考、最终网页与Figma截图。生产素材均来自有出处的真实原图。

| 项目 | 最终处理与差异 |
| --- | --- |
| 首屏横幅 | 使用Weverse原1368×456灰粉Bliss横幅和原花体，不重画字标；不使用概念中的虚构纹理。 |
| 团照 | 使用Genie/Weverse同系列完整2800×2000校园团照，保留原始构图；不照搬概念裁切，首屏因此更长。 |
| 成员 | 六张同系列具名原照替代概念示意脸，姓名以既有ID对应资料为准；历史第七人与当前摄影系列明确分开。 |
| 导航与目录 | 保留轻白导航、黑字和细灰粉边界；增加中文目录、搜索、完整历史名册和索引返回，这是项目功能。 |
| 发行与曲目 | 22个真实Bugs封面及58条署名曲目替代概念示意封面、标题和错误曲目，不将概念文字视为证据。 |
| 手机布局 | 图片保持原比例，成员等大框，目录按可读宽度排布；不为凑首屏压缩/裁掉照片。 |
| 首屏文案 | Weeekly、Bliss · ON concept / 2024和发行/原图入口为最终内容；“示例资料 · 评分不写入正式手帐”为项目审阅说明，官网没有。 |
| 手帐 | 承接Cherry Bullet v15共享布局，换本团灰粉白黑；不宣称其为官方社区原页面。 |

## 验证

- 最终代码 **36项专项/回归、TypeScript、正式vinext build通过**。构建只有项目已有代理/静态分析提示。
- 本机Windows源码和 `http://127.0.0.1:4200` 静态服务；Browser plugin未提供，按frontend-testing-debugging技能使用已安装Playwright/Chrome，IAB另验。不能把此localhost作为其他电脑可访问地址。
- **90项布局**：10页面 × 320/390/700/1100/1440/2048/2560/2926/3840，图片decode、横向溢出、内容坍缩、手帐缺图提示与品牌对比度检查通过，console/pageerror均为0。
- **55项连续交互**：七人×两宽原图/焦点恢复/手帐往返、完整历史名册、成员/发行搜索与清除、全部发行详情、MV/舞台精确ID、时间轴、托管无扩展名跳转、刷新、未知内容与失败重试，通过。
- **线上13项**通过：服务身份Chrome，390×1000和1440×1000；在线manifest与最终源码指纹一致。两宽首页六人/图片/无溢出、团照原图、申智阭历史档案→手帐→搜索/roster精确返回、Bliss五曲→搜索返回、十舞台→手帐→筛选返回、14事件→作品→时间轴返回；最终pageerror为0。
- 线上结果原日志“seven members”只是标签错误，实际首页断言始终是6、历史名册7；归档只修正标签，没有修改断言或测试结果。
- 用户IAB见到“登录后即可访问”；点击“使用ChatGPT继续”35秒超时并重置。**不能称用户IAB完整流程通过**，服务身份验证不代替用户登录会话。
- 真实保存、真实视频播放、80%/125%原生缩放、线上逐素材SHA及完整Figma字体/像素保真仍未验。设计、资料、功能、上线分别判断。

命令（工作目录 `apps/idol-site/`）：

```powershell
node --test tests/weeekly-review-boundary.test.mjs tests/cherrybullet-review-boundary.test.mjs tests/rocketpunch-review-boundary.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
node scripts/build-weeekly-review.mjs --out <本机临时目录>
```

归档证据：`layout-qa.json`、`interaction-qa.json`、`online-qa.json`、`figma-qa.json`、`package-proof.json`、`deployment.json`。截图与临时Playwright脚本在仓库外 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/weeekly/`；官方原始研究响应在同级 `weeekly-research/`。这些目录不是跨电脑依赖；正式素材及来源清单已入库。

## 发布与接续

- 旧Sol v15仅余约4.85 MiB，本轮新建独立站，不压缩原图。新站 `appgprj_6add128c9a6881918a04a100e8782460`，**v1部署succeeded**；权限回读owner/custom，仅owner一人、external0、groups0。
- 站点地址 `https://idol-weeekly-review-oct25.wuke40758.chatgpt.site/artists/weeekly/index.html`。新root提供本团与此前审阅站入口；旧v33/v15和正式主站v186均未发布或修改。
- Sites source commit `7202ac315a388cef5d981c03bc3931f677642a25`；version `appgprj_6add128c9a6881918a04a100e8782460~appgver_485bf17b53b081919bbba924a868779f`；deployment `appgdep_6add16d5c584819183aae6ca1097b61c`。
- 最终source fingerprint `91cf99e673098c009a489c48ead0a0788b2d4892254aa57bfcc3079ace2c07a1`；白名单63文件，共39,698,685 bytes。仅独立source checkout的hosting配置指向新站，**不可使用正式工程现有 `.openai/hosting.json` 发布，它指向主站**。
- GitHub仓库已重新核实PUBLIC，本次只增加公开资料、原图与去个人值的审阅投影，没有新增个人快照；凭证只在内存/隐藏stdin，不入仓。
- 本轮仅完成Weeekly审阅候选；等待用户网页确认后再推进下一团。不要合并main或将只读审阅视为生产保存/播放验收。
