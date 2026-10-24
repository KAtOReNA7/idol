# AtHeart 宽屏发行区零宽修复

## 反馈与范围

用户截图显示首页 DISCOGRAPHY 区域三张封面消失、中文竖排、只余细线。用户未确认本团；本轮仅修复 AtHeart，不开始下一团。工作树干净，显式fetch后本地/远端均为 `75b9bb444ef1299d8068c129945fd6ce36978482`，继续 `codex/atheart-review-completion` / PR #25。

## 根因与证据

`components/atheart-artist.css` 的发行区覆盖了共享section宽度，使用 `padding-inline:max(40px,calc((100vw - 1200px)/2))`；外层继承共享main的1440px限宽（含两侧96px留白），发行区可用宽度只有1248px。留白却继续随窗口变大：2560px时每侧680px，2926px时每侧863px，超过内容宽度，grid被挤成0px。封面已经加载成功但布局为0×0，卡片仅剩2px边框，与用户截图一致。

| 真实viewport | 修复前发行grid宽 | 修复后发行grid宽 | 修复后单封面宽 |
| --- | --- | --- | --- |
| 1440 | 1008px | 1168px | 366px |
| 2048 | 400px | 1168px | 366px |
| 2560 | 0px | 1168px | 366px |
| 2926 | 0px | 1168px | 366px |
| 3840 | 0px（并出现整页横向溢出） | 1168px | 366px |

v3的既有检查仅断言图片naturalWidth和document级横溢出，2560px时两项仍能通过，因此遗漏内部塌缩；这不能算该宽度的视觉验收通过。本次增加实际封面宽高、中文副标题单行高度、与上下区域对齐的检查。

## 修复

删除发行区独有的viewport留白与max-width:none，继承 `.ah-section` 的容器限宽、桌面40px与移动5%内边距；保留原黑白配色、图片字节、ID、资料、所有交互与权限。CSS之外的产品代码未改。构建器的内容hash参数使新HTML请求新CSS。

Figma只同步1440首页现有发行区域，首页画板ID `1168:1095` 保持；新可编辑区域 `1175:1185`，宽1248px、高702.390625px，祖先高度增加53.330627px。保留原图imageHash，完成该区域实际get_design_context取稿及截图检查。移动稿原本继承5%padding，布局无变化；原有字体替代与完整像素保真缺口仍未完成。

## 验证

Browser plugin not available：采用本机现有Playwright/Chrome，无新依赖。验证流程：首页发行卡正常显示 → 点击3!4! → 正确发行详情 → 返回全部九项发行。

- 320/390/700/1100/1440/2048/2560/2926/3840九种真实viewport，首页/发行详情/发行目录共27场景、九次点击返回通过。
- 每张封面解码成功且实际宽高至少100px、正方形；中文副标题高度小于25px；发行grid与成员/影像区左边界对齐；无页面横溢出、框架错误层、pageerror或console error。
- 修复前2926截图复现零宽，与用户截图相符；修复后2926发行区及390手机截图实际查看。
- `npm run build`通过；只改CSS，未重复无关类型或数据测试。审阅构建9项API隔离检查保持通过。
- 本地复现/验证脚本与JSON、截图：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/atheart/width-fix/`。入口脚本位于其上级的 `reproduce-width.mjs`、`verify-width.mjs`。

## 发布

发布到既有owner-private新审阅站，开工get_site确认v3、custom/唯一owner、0外部访客。Sites source-helper先open再编辑/打包，最终source `9f5131fd1e6b5091a3047d3ee4357bc4891f18f3`，fingerprint `7ac675b64ae39f3d7898543a3c53313fe948ae882aa17fab5be0e599330fb478`。

仅变更AtHeart CSS、三个带新CSS内容hash的HTML入口及manifest共5文件；108个旧文件SHA保持，44资产、app.js与root原字节不变，其他团、旧站v33、主站v186未改。真实保存/播放、80%/125%原生缩放保持未验。


- 已发布同站v4：deployment `appgdep_6adcbb3560c881918390d0522742153c`，version `appgprj_6adc93a0d3008191a9ebeb5700dd2d0a~appgver_551fc48032b48191a9b8e87c62af63e8`，native返回succeeded，get_site确认v4且权限保持。
- [打开修复页面](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/atheart/index.html)。IAB未找到ambient中的旧标签，实际列表为空；创建隐藏检查页40秒超时，未再盲重试。不能声称线上渲染/交互已通过；open_in_codex返回queued。本地截图为修复后真实Chrome渲染，不冒充线上截图。
- 同一PR #25继续保存代码与日志，不另开团或合并main。自有本地4192静态服务在交接时关闭。
