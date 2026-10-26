# GENBLUE 验收链接 404 修复

> 后续用户已明确回复“这一版可以 继续开发吧”，本次 v10 页面人工确认通过，允许接续 WOOAH。开发侧浏览器/真实保存/完整生产部署未验事项仍保留。新的接续入口为 [WOOAH worklog](20261022-wooah-native-integration.md)。

- 时间：2026-10-22，北京时间 23:37 发布。
- 分支：`codex/genblue-native-integration` / PR #3，基于 `e5b9ed97ea49d17f139241410a0c357a54b13a7b`；仍承接 `handoff/codex-20261022`，没有从旧 main 开发。
- 用户反馈：`/artists/genblue` 无法打开，提供的浏览器画面为 HTTP 404。人工验收尚未开始，下一团继续暂停。
- 阶段：静态入口缺口已修复并重新发布；用户端可达性和真实浏览器仍未独立验证。不得把部署成功等同于故障已在线消失。

## 已确认的证据与修复

1. 原发布包只有根 `index.html` 和 `review-genblue/index.html`，没有 `artists/genblue/index.html`，依赖 `_redirects`；原 review entry 只接受精确 `/artists/genblue`。
2. 新构建器生成物理 `artists/genblue/index.html`，与根页和已有 review 入口保持相同 HTML，资源使用绝对根路径。
3. review 层在挂载真实组件前，将已列举的尾斜杠、显式 HTML、review 别名规范到原生路由。保留查询参数、hash、history.state，使用 replaceState 而非 pushState。共享记录根路径和未知路径不被误改。
4. 同一私有检查站的 `.openai/hosting.json` 明确增加 `static.not_found_handling: "single-page-application"`，该值已核官方 Sites 打包器支持；保留 project_id 和 `static.directory: "out"`。正式工程的生产 `.openai/hosting.json` 未改。
5. Sites 错误日志及扩大到普通事件的查询均为空，没有请求级证据证明 404 一定由 `_redirects` 或身份层引起；不把该推断当已证实的线上根因，也不改为公开访问。

## 验证

- `node --test tests/genblue-review-routing.test.mjs tests/genblue-native-integration.test.cjs`：10/10，通过物理入口/资源、路径别名、深链参数、历史状态、真实组件关系与 SSR 回归。
- `npx tsc --noEmit --incremental false --pretty false`：通过，0 diagnostics。
- 审阅包重建成功：8 项只读 API 隔离检查通过，57 项素材 hash 保持一致；源指纹 `990132e87ea609653a83789a4436ecaa6906b8ef040c2c7f1980511a1bc13a5e`。
- 对实际提交给发布工具的 TAR 核验：含 `dist/artists/genblue/index.html` 及相应 JS 引用，部署元数据含明确 SPA fallback，91 个文件，文件内容总字节 11750878。压缩归档 SHA256 `7b522ebbe20d4f97cdd19aa52e059f382ebe4bec72cbf0b995f9f47b9536deea`。
- 独立只读代码复审无阻断问题。未把源码测试、SSR、包内资源核验写为在线 HTTP 或浏览器通过。
- 既有浏览器 URL policy 拒绝尚无恢复证据，本轮未重试或另换通道绕过。发布地址 HTTP 状态、资源 MIME、实际布局与操作仍未独立复验。

## 发布与下一步

- 直接页面：https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue/index.html
- 原路由：https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue
- Sites source：`3ef132e03924ce6a63d1711d71e4ae9bf0bc2a3c`。
- Saved version：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_5368259506d081918d24422e1b118009`。
- Deployment：`appgdep_6ada2db5b4c4819180c06bea55e2e2d1`，原生工具返回 `succeeded`，2026-10-22T15:37:33Z。
- 站点维持 owner-only，未改身份、共享范围、正式主站或用户数据。审阅版仍为合成资料、只读。

下次先 fetch 本分支、核对站点当前版本与用户反馈。在支持且访问限制已恢复的环境核对两种入口、尾斜杠和带参数深链，确认 HTML、JS/CSS 响应及实际页面；如仍 404，继续定位托管或身份层，不盲目重复发布。再继续 GENBLUE 原 worklog 中的剩余验收事项；用户明确通过后才开发下一团。

重建使用 `node scripts/build-genblue-review.mjs --out <专用绝对目录>`。在 Sites source helper 打开同一检查站并核对远端后，将生成的 `index.html`、`artists/genblue/index.html` 和 `review-genblue/` 同步到其 `out/`；检查已有素材 hash，不覆盖未知文件；保留历史入口与本站身份。使用上述明确 fallback 配置，通过官方 source helper 打包并保存部署。GitHub 产品源码与 Sites 发布源码分属两个仓库，不混写 commit 身份。
