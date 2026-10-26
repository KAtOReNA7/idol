# 图片呈现与恢复：独立合成验证

本目录只提供测试内容与本地工具。没有真实照片、私人 snapshot、业务事实、生产 API、上传、凭证、遥测或依赖安装。

## 可复现命令

使用已有 React、React DOM、esbuild 依赖。外部只读运行时可用 `NODE_PATH=/absolute/existing/node_modules` 指定，不运行安装命令。

```bash
node --test tests/image-core-state.test.cjs tests/image-core-react.test.cjs tests/image-host-matrix.test.cjs
node tests/fixtures/image-reliability/preview.cjs /absolute/image-preview
python3 tests/fixtures/image-reliability/serve.py /absolute/image-preview --port 4183
```

打开 `http://127.0.0.1:4183/`。它是实际 React 开发构建的 StrictMode 树，加载实际 ReliableImage、CSS 和 PhotoLightbox。只有宿主草稿／父级激活计数是明确标示的合成状态，不能代表真实 Editor 或导航／保存守卫。

## 执行证据与边界

| 验证 | 实际执行范围 |
| --- | --- |
| 图片状态 | 实际生产 helper：missing/loading/loaded/error、同 src 不同身份、attempt、迟到事件、节流与重复点击、缩略图／原图独立状态 |
| 代次生命周期 | 实际生产 lease：cleanup／卸载令牌失效、Strict 重放逻辑门、A→B→A；不是已执行 React DOM 挂载重放 |
| 冷／暖缓存 | 实际生产 cachedImageResult：未 complete、complete 且有 naturalWidth、complete 且 0、异常数值；不是浏览器缓存命中实测 |
| SSR | 实际 React 与组件：原始 src、alt、eager/high、lazy/async、尺寸、contain、缺图和父级 button／a 结构 |
| 重试事件 | 真实 ImageRetryControl 的事件 handler，通过有限 event ports 验证 preventDefault／stopPropagation 及 Tab/Escape 继续传播；不是 DOM 事件冒泡实测 |
| 51 宿主 | 实际 51 个 Page、14 artist 实现、37 design：overview、works、两位不同成员详情，共 204 场景，再加导入来源证明 |
| App 适配器 | 实际 CatalogPhotoImage／WorkCoverImage／ConceptPhotoImage 的独立 SSR；真实 App 四处入口仍由 dot 合入 |
| 真浏览器 | 本轮性能 owner 对已有 Playwright 做一次启动，因 Chromium executable 缺失未运行；布局、网络、焦点、滚动锁、Back/Forward、Strict 实际副作用及性能数字均不得称已通过 |

没有用纯 Node 时间代替 LCP／CLS／真实可见时间。before／after 性能 fixture 及记录由 `performance-*` 工具单独负责，不与本目录交互演示的开发构建比较体积或时间。

## 合成输入和替代清单

`ALIAS_MANIFEST.json` 逐项列出替代：51 份缺失团体 JSON、既有测试姓名与 routeUrl 字符串 formatter，以及有限公开签名的非图片 timeline-host、history-state、MemberPhysicalFacts。esbuild 仅按这些精确路径替代；任何其它未知 import 仍失败。metafile 和 aliases 证明随构建输出。

真实 artist 源码、Picture／Thumb 接线、ReliableImage、PhotoLightbox、portrait 选择、memberWorks、滚动 hook 和图片 CSS 不被 mock。通用 App 主体未提供，未创建替代 App。

Catalog 的团体 ID 仅使用已给公开 51 路由映射；成员、作品、评分、关联和图片身份均为 recFixture 合成值。0.0 分专门验证真实数字零不会被图片分支吞掉；所有备注／观看为空。MV 图片通过明确单成员＋单作品的合成关系提供，不推测图片归属。KATSEYE 仍走原档案照片分支，没有换成别人的概念图。

## 可点击场景

- 成功、缺失、永久失败、同一 URL 首次失败后手动恢复、延迟 1200 ms、既有 ratings retry 协议。
- 同 src 切换身份 A/B、显式 attempt、卸载／重挂；宿主草稿不重置。
- button／link 内图片的外置重试；点击重试不应激活父级目标。
- 缩略图成功和原图失败彼此独立；大图重试、Tab／Shift+Tab、Escape、遮罩关闭、连续开关、只重建 onClose 回调。
- 手动检查 320／390／桌面的预留尺寸、长标签和减少动态效果偏好。

`serve.py` 仅绑定 localhost。`/image-fixture/*` 是固定 600×400 SVG 合成传输；`/api/media` 是在本测试服务器上模拟已有图片响应，不是业务 API 实现。HTTP POST 拒绝。外部真实来源不访问，合成图不进入任何产品 data 或图片存储。

## 2026-10-18 输入接口迁移复核

本次只调整 tests：增加 runtime 投影、独立设计公开资料、精确导航键和海报 allowlist 的合成输入。`aliases.cjs` 的相对路径 resolver 仍要求 manifest 的完整 specifier 与 importer 同时匹配；不是通配替代。真实 data 导入的 fail-closed 检查未改。新增 `image-fixture-boundaries.test.cjs` 验证未知路径、错误 importer 和真实 data 均不被放行。

三个 Page（tripleS、LOONA、Billlie）现在是接受 Promise searchParams 的 async server component。因此矩阵改用 React 实际 `renderToReadableStream`，传递当前路由的 searchParams 并等待 allReady；不以 Suspense 占位符代替真实页面。career 保真证明更新为实际 runtime mapper + core。全部设计组件继续实际渲染。

执行（仓库根目录，NODE_PATH 用于 /tmp 构建产物解析 React）：

    NODE_PATH="$PWD/node_modules" node --test --test-reporter=spec tests/image-core-state.test.cjs tests/image-core-react.test.cjs tests/image-lightbox-session.test.cjs tests/image-host-matrix.test.cjs tests/image-fixture-boundaries.test.cjs tests/mv-photo-presentation.test.cjs tests/photo-backup-regression.test.cjs

修复前完整 focused 实测：250 tests，228 pass，22 fail，0 skip。host 矩阵为 185/207；其他五套功能测试 40/40；新增输入边界测试 3/3。

13:18 属性修复后仅轻量复跑 BADVILLAIN overview、idle overview、idle works 三项：1 pass / 2 fail。三项的 eager/high/async 属性检查现均已通过；idle works 整项通过，另外两项继续命中后续旧展示契约。未再次执行完整 focused；按前次未变项与本次三项合并计算为 229/250、21 fail（host 186/207），这个合并数不是新的全量运行结果。

### 原 22 条失败及属性修复后的状态

未删除、skip 或放松这些断言；以下是源码核对结论，不是浏览器视觉验收。

1. MEOVV overview hero：`components/candidate/meovv-design.tsx:21,89` 使用 MEOVV_HERO 固定设计资产，而非 content.hero；旧合成 hero 输入已不控制该设计。没有证明图片丢失。
2. MEOVV works 缩略图：同文件 `:36` 使用真实 `meovvVideoArt` 精确身份匹配；合成作品没有已核验图片，因此文本条目。旧“所有作品自动取 YouTube 图”契约过期。
3. tripleS overview 0.0：`components/candidate/triples-design.tsx:230-235` 首页改为公开发行与影像目录，不展示私人均分。works 与两位 member 的 0 分断言仍通过；没有证明评分损失。
4. MADEIN overview 零肖像：`components/candidate/madein-design.tsx:81` 首页 roster 现在显示肖像，旧“历史索引不显示肖像”断言过期。详情保留两位成员各自照片。
5. BADVILLAIN overview：`components/candidate/badvillain-design.tsx:37-38,53` 主线程已令首页团照向 zoom 传 priority=true。复跑已通过 eager/high/async；当前失败推进到 `image branch must preserve real numeric zero`。首页是公开目录、不显示私人分，与第 6 项同类过期契约。尚无浏览器 LCP 实测。
6. BADVILLAIN works 0.0：同文件 `:48` 是公开发行/MV/舞台目录，不输出私人分。两位成员详情的关联图片与 0 分均通过。不能据此判定评分丢失。
7. idle overview：`components/candidate/idle-design.tsx:21` 主线程已给 Art 增加 decoding=async，复跑属性检查通过；当前失败推进到 portrait inline object-fit:contain 断言。`components/candidate/idle-verified-design.css:3` 基础 `.idv-art` 是 contain，但 `.idv-person .idv-art` 明确为正方形 cover，电影卡亦有 16/9 cover。因此这是现有设计的实际卡片裁切规则，不是本次属性修复引入；是否应改需按已批准设计决定，不能为旧统一 contain 断言直接改布局。
8. idle works：同一 Art 的 decoding 修复后，本项完整通过，包括两张图片的源、lazy/async、0 分与无嵌套交互断言。
9. idle member A MV 图：同文件 `:67` 人物详情是公开身份与个人发行，再链接“作品与评分”，不内嵌私人 MV 图。旧统一详情契约过期。
10. idle member B MV 图：同第 9 项，第二个独立成员断言保留。
11. LOONA overview hero：`components/candidate/loona-home.tsx:32-33` 明确使用 loonaHomeAsset('hero.jpg')，有 priority。旧 content.hero 合成路径不再控制首页，未证明真实 hero 缺失。
12. Billlie overview inline contain：`components/candidate/billlie-design.tsx:26,54` 没有内联 objectFit，但 `components/candidate/billlie-figma-design.css:4` 同时规定 `.billlie-figma img` 和 `.bf-square img` 的 object-fit:contain。不是已确认裁切 bug；旧断言只检查 style 属性。
13. Billlie works 缩略图：`components/candidate/billlie-design.tsx:58` format=all 显示发行，format=mv 才显示 MV。旧通用 works 默认值契约过期。
14. Billlie member A MV 图：同文件 `:56` 关联作品输出标题、表现/造型分与链接，没有内嵌私人 MV 图。保留失败，不能为测试重做已批准设计。
15. Billlie member B MV 图：同第 14 项，第二个独立成员断言保留。
16. NewJeans overview 0.0：`components/candidate/newjeans-design.tsx:96` 首页公开目录，私人评分位于 works 的“我的观看记录”和 member 详情；两位成员详情 0 分通过。
17. NewJeans works YouTube 图：同文件 `:40,66,86` 使用设计 assets 中的本地核验图，不自动构造 YouTube 缩略图。合成 assets 同样为本地测试图，旧外部 URL 契约不适用。
18. IVE overview hero：`components/ive-artist.tsx:58` 明确使用 /artist/ive/hero.webp 并传 priority；不是 content.hero。未证明真实主图缺失。
19. Hearts2Hearts overview 0.0：`components/hearts2hearts-artist.tsx:87` 公开首页不展示私人评分；成员详情与 works 分数仍有各自入口。
20. Hearts2Hearts works 缩略图：同文件 `:41-43` WorkCard 明确是编号/标题/评分/链接，完全没有 img；旧通用缩略图契约过期。
21. SAY MY NAME works 缩略图：`components/saymyname-artist.tsx:42-44` 仅在 approvedVideoPoster 精确匹配时显示图片，否则 Play 图标；合成记录不在 allowlist。不能添加伪核验身份强行通过。
22. KATSEYE overview hero：`components/katseye-artist.tsx:86,94` 首屏已采用 roster(true) 肖像拼版，肖像本身 priority=true，没有旧统一团体 hero；旧契约过期。

结论：输入边界与真实 SSR 已修复；不得将保留失败解释成 51 页全绿，也不得将过期通用断言自动算作用户可见故障。BADVILLAIN priority 和 idle decoding 已由主线程窄范围修复并通过属性断言，其余应基于各页已批准设计重新定义断言，保留源身份、0 分及目标链接的有效覆盖。
