# KATSEYE 浏览与手帐接续（2026-10-24，v33待网页确认）

用户“同意，继续开发”已确认 SPIA v32。Astra 原批次15团已逐团交审，本轮从 Sol 原批次选择尚无本轮网页确认的 KATSEYE；不扩大团体名单。执行者为当前 Codex，无新增子代理。

- 基线：`d1abaf88a1b37101ae7de03326669d4d0073c2f0`，分支 `codex/katseye-review-completion`。开工工作树干净；fetch/ls-remote及PR #21核对无新接续，main未变。
- 工程：`apps/idol-site/`。Windows本机开发与浏览器；正式主站v186保持，发布仅同一owner-private QA。既有498文件保持原字节。
- 范围：成员/发行搜索、原图查看、精确发行到既有视频的导航、共享成员照片与往返、只读审阅包，原生Figma同步及分层验证。
- 禁止：改写评分/备注/观看状态、伪造ID/关系、修改访问权限、覆盖已确认团、合并main或发布主站。
- 需求：`docs/design-requirements.md` 与 `docs/collaboration-playbook.md` 当前逐团规则和官网/复用披露要求。

## 视觉来源与复用决定

已实际查看 https://www.katseye.world/the-members/ 与官网根地址。根地址跳转官方商城；当前成员页是粉红/青绿、衬线字及三列大肖像。现有源码与Figma `241:1095` 是松绿米白、酸黄标记、六人合组摄影，不等同当前官网重做。**本轮沿用v186导入后现存KATSEYE独立设计，交审必须明确披露。** 不复用SPIA视觉；仅复用其只读审阅与导航边界。六张成员照片来自官网同系列，Megan具体拍摄画面与当前目录不同；旧图及身份不改。

官网IAB首次打开30秒超时；Browser plugin not available，按frontend-testing-debugging改用本机Playwright/Chrome取得实际整页截图与DOM。官网参考、浏览器脚本及截图保存在工作区外的katseye scratch目录。

已有Figma页面35个顶层画板/组件区已读，首页、成员目录、WILD详情的get_design_context含截图已取。已有照片/字样可复用；完整逐板保真尚未验，旧节点不自动记通过。

## 完成与验证

已发布 [KATSEYE v33 owner-private 审阅](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/katseye/index.html)。六位成员、十项发行、九条原生作品记录（含跨团合作）、17个MV/舞台槽、11条既有成员关系和14条事件接入只读审阅。成员/发行搜索、空结果恢复、原图弹窗、精确视频到既有手帐及返回搜索上下文已完成。共享成员头像按团体和成员稳定ID共同匹配。

手机旧样式隐藏发行目录/时间轴导航以及两张首页影像卡，已恢复。审阅入口原先未接入正式layout负责注入的时间轴数据，实际浏览器发现空状态后已明确注入同一份14事件文档；正式layout未改，未制造新事实。2027恢复事项保持公告/计划口径，不称已经发生。

原图：32张已有公开图片使用GitHub固定提交 `d1abaf88a1b37101ae7de03326669d4d0073c2f0` 原字节提供，逐张HTTP、字节数和SHA256一致；源码仍保留本地图和默认本地打包。外部交付是为保持整个审阅站256MiB以内，未压缩图片或删除旧文件。页面图片依赖GitHub Raw可达，保留失败重试。新增清单不包含私有记录附件或认证信息。

### 分层验证

Browser plugin not available；本机既有Playwright/Chrome验证 `http://127.0.0.1:4191/artists/katseye/index.html`，线上使用CUA IAB。核心路径：首页→成员搜索→原图→手帐→返回，以及发行搜索→精确视频→手帐→返回。

| 层次 | 结果 |
|---|---|
| 单元与回归 | 43通过：KATSEYE、公开投影隔离、原生评分语义和共享导航；测试临时模块需要NODE_PATH指向工程node_modules |
| 类型与正式构建 | `npx tsc --noEmit --incremental false`、`npm run build`通过；正式构建后仅补审阅入口的时间轴注入，正式依赖图未变；最终类型复验 |
| 真实视口 | 九类页面×320/390/1440/2048/2560，共45检查；无横向溢出、坏图或pageerror |
| 交互与恢复 | 38场景通过：搜索/原图/Escape焦点、六成员×两宽手帐、17视频精确槽位、合作ID、空结果/非法发行/失败图片恢复 |
| 时间轴 | 14事件×五宽，Debut精确记录导航及返回，5场景通过；最终console/pageerror为空 |
| 数据边界 | 11条既有关系清空私人字段，9项API隔离；新增5个隔离/身份测试及1个时间轴注入回归；不保存、不伪造评分 |
| 旧页面保护 | 原498文件SHA全部不变，最终506文件，267479910字节，剩余955546字节 |
| 线上 | Sites succeeded；IAB清单可见KATSEYE标题与URL，但getTab读取35秒超时并重置，未证明线上渲染或交互全过 |
| 未验 | 真实保存、实际播放、80%/125%原生浏览器缩放；不能以只读页或测试数量替代 |

复现：工程目录运行 `node --test tests/katseye-*.test.cjs tests/katseye-review.test.mjs tests/editor-flow.test.cjs tests/artist-navigation.test.cjs`（先设本进程NODE_PATH）、上述类型/构建命令。审阅构建：`node scripts/build-katseye-review.mjs --out <工程外绝对目录> --public-originals-ref d1abaf88a1b37101ae7de03326669d4d0073c2f0`。

### Figma与参考差异

依照 figma-use、figma-generate-design、figma-design-to-code 流程，在原KATSEYE页面建立本轮9类×1440/390/320共27个可编辑画板，原始画板保留；复用Ke/Action组件和既有图片hash，使用原生文字、图片、向量及层级，没有把整页截图作为素材。见[画板索引](20261024-katseye-figma-frames.json)、[首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1128-43318)。首页、成员目录、发行详情、共享成员手帐、时间轴5个最终节点实际get_design_context取稿，修正初次文字坐标和三张空时间轴画板。

Figma字体清单不含网页的Nimbus Sans Narrow/KeDisplay，使用Space Grotesk近似；主要排布与内容已同步，但展示字体、完整逐字间距和像素一致性仍待完善。不能据27个画板或旧稿称设计全通过。本轮网页沿用v186现有独立视觉，官网参考、已使用素材和仓库复用范围必须在交审时披露。

### 发布与接续

Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，实际v33；owner/custom、唯一owner、0外部访客，权限不变。Deployment `appgdep_6adc8f3b59d881919ef850cf8651ccba`，succeeded，2026-10-24T10:58:13.939547+00:00。Version `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_16e7514e53ac8191829c0f58de3f411b`；Sites source `252690e5a36213b370e3389eb09326fa190745f6`。Fingerprint `a3d763b71b7e8d5f1a01f233325f6a32d305ad9cd877abebfd72f15b4320fe47`。

GitHub仍PUBLIC，已核对当前分享边界；推送代码及本工作日志，不合并main、不覆盖正式v186。默认Git代理127.0.0.1:10808不可达，本轮命令临时清空http.proxy恢复直连，未修改用户全局配置。Sites过期凭证通过同站连接器刷新，仅隐藏stdin传入helper，没有持久化凭证。

本机证据根：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/katseye/`，包含browser-public.json、interactions-public.json、timeline-final-qa.json、remote-original-proof.json、site-additive-proof.json、tests-final.log、build-final.log及参考/页面截图。线上超时没有截图，不用本地图冒充线上证据。等待KATSEYE网页确认后再开始下一团，公共功能例外。

## 阻塞边界

实际来源或身份冲突时保留原记录而不猜；线上工具超时只记录未验；256MiB限额需要原字节外部交付时使用公开GitHub固定提交并逐图SHA核对，不删旧资产、不压缩原图。不得用构建结果代替浏览器、真实保存/播放或人工确认。
