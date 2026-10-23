# izna 首屏网页同步

- 日期：2026-10-23；正式目录 `apps/idol-site`，分支 `codex/izna-native-integration`，开工读取并 fetch 的基线为 `2087e3c1f467be1ddaa1efb5526cab632f818b40`，沿用 draft [PR #6](https://github.com/KAtOReNA7/idol/pull/6)。没有从旧 main 开发。
- 用户在 Figma 首屏修改后回复“可以 继续开发”，本轮据此实现已确认的设计；这不等于新的网页或 izna 整团已获确认。
- 范围：izna 首页、它的只读审阅导航与精确索引图片打包。GENBLUE/WOOAH、用户评分/备注/观看记录、正式主站 v186 和下一团均不改。
- 发布状态：私有只读审阅 v14 已部署成功；[打开 izna 新网页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)。等待用户网页确认，不开发 ifeye。

## 页面改动和设计依据

本轮重新取回 Figma 桌面 hero `812:19259` 和手机 hero `812:19348` 的设计上下文及截图，确认与 [已批准稿](20261023-izna-hero-figma.md) 相符。既有文件为 `zeLNExz4TbpWRW3uiahef7`，桌面首页 [812:19251](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=812-19251)。继续使用正式原生组件、样式和精确资产解析，没有另建独立演示首页。

- 删除首页的超大重复团名、两侧索引和装饰圆环，改为小团名/WAKEONE 简洁页头。成员、作品、时间轴和查看原图放在照片下方。
- 1440 宽照片为 1120×746.67，左右各 160；对应原图 `(0,850,1500,1000)` 窗口，六人从头顶到鞋底完整。2048/2560 宽时最多展示原生 1500×1000，不继续放大低清图片。
- 390 宽照片为 358×501.2，320 宽为 288×403.2；手机两侧 16，保持完整 5:7 原图，不拉伸。大屏尺寸按真实宿主容器计算。
- 原图仍为 `public/artist/izna/batch-b-20261016/group-original.png`，1500×2100、5,568,135 B，SHA256 `31139045704dc66a4101af43a9e74bb067f37e403a2d8b6e1d4f753316e9fe2c`。逻辑资产键保持稳定，元数据精确指向原 PNG；身份校验未放宽。查看器沿用已有关闭、Escape、焦点恢复逻辑。
- 首页团名返回现有团体索引；原生内页继续保留既有导航。只读审阅通过当前挂载的 ShadowRoot 安装原有链接适配，卸载时断开 observer。挂载/样式加载失败时仍可返回索引或重试。
- 审阅索引使用自己的正式图片配置，构建精确补入 `batch-b-20261016-webp-v1/group-display.webp`，205,158 B，SHA256 `6109c780964609354a28947f9af7cc2705a53b9c7799ce5bf7a45cbe51037a8a`。没有借用首页原图替换正式索引配置。

## 实际验证

证据目录：[20261023-izna-hero-web](evidence/20261023-izna-hero-web/)。最终构建指纹为 `217e48000f09bf157f781c62062b01f648eac9199dac02ae991e7bd01441fa50`，浏览器 JSON、manifest 和合并记录一致；不使用修复前的失败包作为最终验收证据。

GitHub保存五宽首屏、1440/390整页、320索引/失败/恢复及GENBLUE既有溢出截图。JSON的screenshots字段保留本机完整采集路径，部分重复或中间态截图未入仓；仓库内同名文件才是此次随代码共享的截图。

| 检查 | 本轮结果 |
| --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false` | exit 0，0 diagnostics |
| `npm run build` | exit 0，正式 Vinext 构建完成；路由动态分类提示保留在日志，不视为线上检查 |
| 六份专项测试 | 38/38 通过，覆盖 izna 原生、审阅 catalog/routing/isolation 与 GENBLUE/WOOAH 原生守卫 |
| 发现索引漏图后补跑 `tests/izna-review-routing.test.mjs` | 8/8 通过；新增断言要求索引 WebP 存在，大小/哈希等于正式源，且只复制所需一张 |
| 静态审阅构建 | 23 项资源，14,282,401 B；12 条已净化关联、9 项 API 隔离检查；打包29文件增量 |
| 浏览器 | Windows / 现有 Chromium 1228 / Playwright，原生缩放100%；Browser plugin not available，未安装新浏览器依赖 |
| 五宽首页 | 320/390/1440/2048/2560 全部通过；图片真实解码、人物构图、几何、横向溢出、实际截图已核 |
| 320/1440交互 | 原图按钮与 Escape/关闭后焦点恢复，成员/作品/时间轴往返，小团名→izna索引→团页，索引封面 decode，均通过 |
| 320/1440失败路径 | 每个用例仅阻断样式一次，验证错误状态、返回真实索引及图片、重新打开恢复，均通过 |
| 已确认页面保护 | 100个非izna站点文件逐一SHA保持不变；WOOAH 320/1440与GENBLUE 1440冒烟通过 |

最终浏览器总计13组、12通过。唯一未通过是既有 GENBLUE 在320px视口下 documentWidth=360 的40px横向溢出；本轮该页源码和全部站点资产未变，未将此既有问题记成通过，也未越过保护范围顺手改版。izna 的9组检查全部通过。故障测试中的预期样式阻断单独标记；正常浏览没有意外图片、HTTP、控制台或页面错误。

独立代码复审发现的两处问题（审阅团名链接串到根入口、挂载失败缺少索引出口）均已修复并复审；浏览器进一步发现的索引封面404已精确补资源并在最终包复验。截图采集最初受平滑滚动影响，已改用 instant 滚顶并等待 scrollY=0；保护页选择器也按实际各团包装修正。错误的初期脚本输出不混入此证据目录。`hero-qa.cjs` 保存实际执行脚本，含本机依赖和路径，仅作本轮复现依据；换机须替换环境路径并重新构建、验证，不盲目继承通过。

## 发布和保存

- 使用原私有只读审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，保持原 owner-private 受众；先从 Sites 官方流程打开既有源，再只合入 izna 增量。
- Sites source 开工版本 `a6a8ff71a759de6936a0285a0ebdf18a6a69eb63`；本轮 helper 已推送并核对 source `02191c188af0a0d373581afd89b8e7d292c6d61a`。Sites source 与 GitHub 正式应用源码是不同仓库，不混用提交号。
- 官方 helper 产出的 gzip TAR：24,442,261 B；完整解压 TAR 为29,160,960 B（27.81005859375 MiB），包含目录、头与padding，低于256 MiB并保留2 MiB余量。归档SHA256 `3c713937996003e1e7785f5e65d934db96b4d8d5f6f4ac932b4f84915574df32`；保持归档不变用于保存。
- `save_version_and_deploy_private` 返回终态 `succeeded`，随后 `get_site_version` 读回版本 **14**、同一 source commit 和 deployment ID。版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_cff5858b7cbc8191baf7c02dd741f69e`；部署 `appgdep_6adb28bc8a448191b3d36354713d79b9`。精确返回已脱去临时截图链接，保存在 `deployment.json`。
- 服务端归档存储读回29,153,280 B/131文件；这是服务端口径，容量门槛仍用本地**完整**解压TAR的29,160,960 B，不拿较小小计代替。
- 发布后仅尝试一次 in-app browser 打开此URL，30.1168秒超时并重置kernel，没有取得页面状态；未再换通道重试，线上浏览器仍未独立复验。`open_in_codex` 返回 queued，不把排队打开写成用户已看见或线上验证通过。

## 阶段和下一步

本轮完成的是已确认 Figma 首屏的实际网页同步、本地检查与 v14 私有审阅部署，等待用户网页审阅。审阅页顶部34px的只读提示为审阅环境所需，Figma构图比较已扣除此高度。原图查看器功能与几何已核；320px的Escape截图采到键盘操作后的滚动中间态，因此不入仓作为静态全貌证据。

仍未完成：新部署后的线上浏览器独立复验、80%/125%原生浏览器缩放、真实owner保存、Figma下方成员/发行图片与其他页面落地、11个精确视频预览、整团人工验收及主站全量发布。本轮未修改这些既有边界。

下一步先由用户打开 izna 新网页确认首屏；按反馈继续该团。用户明确确认 izna 前，不开发 ifeye 或其他下一团，公共功能除外。代码、验证证据、开发阶段和下一步随本轮提交推送同一 GitHub 分支。
