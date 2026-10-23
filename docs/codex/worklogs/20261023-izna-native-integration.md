# izna 原生接入与逐团审阅

- task-id：20261023-izna-native-integration；日期：2026-10-23，北京时间。
- 分支：`codex/izna-native-integration`，基于开工时 `codex/wooah-native-integration` 最新远端 `121f4100d31d4f23803cac18dd82df589af9473f`，没有从旧 main 开始。
- 正式工程：`apps/idol-site/`；环境：用户 Windows 电脑、PowerShell、Node 24.19.0。代码、构建和浏览器测试均在本机。
- 当前阶段：izna 实现及本机 QA 完成，用户人工审阅待确认。ifeye 未开发。发布及 GitHub 精确记录见文末。
- [固定网页入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/izna/index.html)：既有 owner-private 审阅站，只有站点所有者可访问，只读。

## 实现与数据边界

本轮把 `handoffs/codex-20261022/astra-izna-ifeye-v3/` 的 izna 独立墨蓝设计接入正式团页。原始 renderer、focus、izna runtime、CSS 和 editorial JSON 按原字节保留；新宿主负责正式查询路由、身份解析、既有手帐及返回。共享手帐的 izna 专属 CSS 延续墨蓝、淡紫、细线和完整图片构图，只影响 `.candidate-izna-experience`。

- 7 份成员档案：6 名现役和历史成员 JI YOON；8 项发行只浏览；9 个 MV 母作品和 6 个舞台槽位；10 项时间线记录。
- 20 张公开图片逐张核对尺寸、字节和 SHA256：8 张复用已有正式素材，12 张原图加入 `public/artist/izna/native-v3/`，不重编码、不借别团图片。
- 仅保留 Mamma Mia / METRONOME 的 12 条有具名来源、已有稳定 ID 的成员/MV 关系。原 snapshot 中其他关系不扩大为已证实参演，不修改真实 records。
- 4 个视频有精确预览图，11 个仍缺失；继续显示缺图状态，不拿发行封面冒充视频截图。MV / STAGE 槽位独立，包括 SASS 的同 videoId 情况。
- 正式入口使用 `/artists/izna?section=...&member/release/media/format/q/event`。补充 izna 的有限有效键，不放宽共享 `safeArtistReturn`。
- 搜索、成员到作品、手帐及返回保留筛选、滚动和准确触发按钮焦点。sessionStorage 只暂存一次有效公开返回状态，真实交互会取消过期自动恢复。
- 时间线标注“相关影像（各视频日期见详情）”，不把同母作品下其他日期的视频说成当日发布。

审阅包复用真实 `IznaEditorial` 和共享 App，专用 catalog 从公开字段重新构造。评分、备注、观看、个人偏好和私有照片全部清空；成员手帐资料照与 MV 个人截图因此可显示缺图，团页公开原图正常显示。只保留已存在且匹配的 stage binding 身份元数据，不初始化真实评分绑定。审阅 fetch 只允许 GET catalog；写入 405、其他 API 404、外部请求 403，CSP 禁止网络连接。未修改权限、保存协议或真实用户数据。

## 资料与设计核查

- [WAKEONE 官方成员页](https://wake-one.com/en/artists/izna/)：六名现役及生日与候选相符。
- [WAKEONE JI YOON 退出公告](https://wake-one.com/cn/notice/izna-%EC%9D%B4%EC%A6%88%EB%82%98-%EC%9C%A4%EC%A7%80%EC%9C%A4-%ED%96%A5%ED%9B%84-%ED%99%9C%EB%8F%99-%EA%B4%80%EB%A0%A8-%EC%95%88%EB%82%B4/)及 [Soompi 报道](https://www.soompi.com/article/1767774wpp/iznas-yoon-ji-yoon-leaves-group)：2025-08-19 历史成员边界。
- [Genie METRONOME 专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=16203)与 [iMBC Mamma Mia 报道](https://enews.imbc.com/News/RetrieveNewsInfo/480532)：具名阵容依据。
- 中文显示名保留现有档案写法，不宣称全部是官方中文法定姓名。官方站 SIGN / BEEP 外层标签与 iframe 的不一致不用于推断配图身份。
- 本轮读取 Figma 文件 `zeLNExz4TbpWRW3uiahef7`、节点 `812:19251` 的实际截图与设计上下文。该节点仍有占位图；网页实图不等于 Figma 实图闭环已完成。用户视觉认可仍待审阅。

## 验证结果

最终审阅构建指纹：`dc2988774adc8ccb1a17089a9186236f7e318a3f05ed18e32ff13a054b6fbe40`。最终浏览器 JSON 均绑定该指纹，完整输入 SHA 和资源清单见 [review-manifest.json](evidence/20261023-izna/review-manifest.json)。22 项资源共 8,891,972 B；JS 965,022 B；基础 CSS 86,366 B；另有 izna 手帐 CSS 13,905 B。

| 层级 | 结果与实际范围 |
| --- | --- |
| 安装 | `npm run install:ci` 通过，682 包，package/lock 无改动 |
| 类型 | `node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false`，exit 0 |
| 正式构建 | `npm run build`，exit 0；运行 Vinext/Vite，未改用根 Next sandbox；动态路由分类提示不是运行错误 |
| izna 专项 | 4 文件 24 项通过：原字节/20 图/稳定身份/返回、catalog、只读 API、物理入口、增量构建与目录保护；[输出](evidence/20261023-izna/final-tests.txt) |
| 已确认页面保护 | GENBLUE/WOOAH 与导航保存保护 8 文件 38 项通过；合入前后既有审阅站 100 个文件 SHA256 全部不变 |
| 正式 dev 路由 | 本机 `127.0.0.1:5173/artists/izna` 返回 200、有标题、无 pageerror；[记录](evidence/20261023-izna/native-dev-smoke.json)。不推断生产 API 或保存成功 |
| 团页矩阵 | 75/75：9 类页面 × 320/390/1440/2048/2560 五种宽度，另逐个检查 7 成员、8 发行、15 视频详情；0 页面错误、0 控制台错误、0 失败 HTTP 请求，无横向溢出或坏图；[结果](evidence/20261023-izna/browser-matrix.json)／[输出](evidence/20261023-izna/final-browser-matrix.txt) |
| 手帐矩阵 | 10/10：作品和成员手帐 × 五种宽度；实际加载墨蓝专属 CSS，无横向溢出、坏图或 pageerror；[结果](evidence/20261023-izna/records-results.json) |
| 完整链路 | 320/1440 共 8 场景：MAI 搜索→成员→Mamma Mia→手帐→原按钮焦点→成员→原筛选；SASS 两槽位；POST 拒绝；[结果](evidence/20261023-izna/journey-results.json) |
| 原图与恢复 | 320/1440 共 4 场景：900×900 原图、Escape/关闭返回焦点、主动阻断图片后的提示/重试/解码及恢复查看；[结果](evidence/20261023-izna/viewer-results.json) |

Browser plugin not available，使用允许的常规 Playwright 与本机 Chromium 1228，原生缩放 100%；没有下载浏览器或使用绕过安全的启动参数。80%/125% 原生浏览器缩放未验，不能用 CSS zoom 替代。

专项复现命令（在 `apps/idol-site/`）：

```sh
node --test tests/izna-native-integration.test.cjs tests/izna-review-catalog.test.mjs tests/izna-review-isolation.test.mjs tests/izna-review-routing.test.mjs
node --test tests/wooah-native-integration.test.cjs tests/wooah-timeline.test.cjs tests/wooah-review-routing.test.mjs tests/wooah-review-isolation.test.mjs tests/genblue-native-integration.test.cjs tests/genblue-review-routing.test.mjs tests/artist-roster-return.test.cjs tests/navigation-save-guard.test.cjs
node scripts/build-izna-review.mjs --out /absolute/dedicated/scratch/output
```

输出必须在仓库外的专用目录；只把新增 izna 文件增量合入官方打开的审阅 Site 源码，保留原 index 和 hosting 配置，不覆盖已确认页面。

[桌面手帐截图](evidence/20261023-izna/records-desktop.png) · [手机成员手帐截图](evidence/20261023-izna/member-records-mobile.png)。照片空白是脱敏 catalog 的明确缺失，并非坏图。

首次完整 clone 的 Windows CRLF 自动转换影响了原字节守卫。逐文件比较 Git blob 与规范化内容，证明只有换行变化后恢复精确 HEAD 字节并刷新 index stat；index tree 未变，未丢弃用户改动。当前仓库 `core.autocrlf=false`，新电脑用 RESUME 中的 clone 命令。一次 dev watcher 的 EBUSY 导致退出，重启后正式 dev smoke 通过；测试脚本选择器/滚动等待问题已按实际 UI 修正，不记为产品缺陷。

## 发布、同步与下一步

发布与 GitHub 读回正在本轮收尾；精确证据将以实际工具结果补齐，不从本机测试推断线上成功。

- 审阅 Site：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，保持 owner-private；主站 `appgprj_6acb4fa532b88191ae2588c24b724b17` 未发布。
- 完整主站展开 TAR 容量与生产上线未完成；本轮审阅包单独测量，不以资源 payload 小计代替完整 TAR。
- 下一步：交付 izna 网页并等待用户明确确认；可按反馈继续改 izna 或公共功能，不提前开发 ifeye/其他下一团。
- 待补：Figma 实图闭环、11 个视频精确预览、80%/125% 原生缩放、真实 owner 保存与主站全量发布。不得由静态审阅、单测或旧团确认代替。
