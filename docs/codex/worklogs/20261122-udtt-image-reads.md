# UDTT 首页成员图与 MV 图的间歇性 503

正式站 v245 的一次本人冷开中，首图、三张发行封面和两张成员图成功，理沙子、韩彩熙及《REALLY REALLY》原 MV 三张图片返回 503，每个响应 22 B。正式浏览器留有状态码与字节数，错误正文未采集。[v245 的九个正式响应](../evidence/20261122-v245/udtt-image-responses.json)

在本机对相同九个正式素材版本同时发起有效的只读请求，使用实际的素材服务、现行清单和允许投递的原件，模拟存储只读，无正式写入。旧服务同时收到前两个请求后立即拒绝后七项，七次响应均为 503、22 B，正文错误码为 `ASSET_BUSY`。相同输入在修改后 9/9 返回 200，逐项正文与原图完全相同。两次的实际最高并行原件读取数均为 2。[相同输入下的完整对照](../evidence/20261122-udtt-image-reads/local-queue.json)

本人图片与查看索引可短暂排队。等待在每个请求自己的计时器内进行，取消、等待超时和超出队列容量都会结束等待。原件写入、恢复及备份继续使用原有上限。登录判断每个原件请求执行一次。访客仅能走既有公开读取器，每张图仍要经过归属、目标、版本、大小、类型和原始字节校验。[原件读取](../../../apps/idol-site/lib/idol/editorial-asset-service.ts) · [原件入口](../../../apps/idol-site/app/api/editorial-assets/route.ts)

同一个标签内重新打开团页时，旧图可能仍在传输或解码。新版团页等待旧图实际结束后才读取下一张，关闭期间离开的页面不会再发起请求。旧的观察页面和主动放大所用的单图读取规则继续生效。可见图片失败时展示「部分图片加载失败。」及「重新载入本页」。[图片调度](../../../apps/idol-site/lib/idol/design-review/sol15-runtime/private-images.mjs) · [团页](../../../apps/idol-site/lib/idol/udtt-native/host.mjs)

Windows 与 WSL 使用同一组七份专项测试和同一张经独立校验的陆雨婷 640 × 800 原生照片，共各通过 54/54 项，包含实际 GET、排队取消、等待超时、容量上限、本人和访客边界、路由重挂载、错误提示与按钮、放大、原件保护。历史九份受限静态副本、另外两个共享封面以及正式作品和私人记录均沿用原有归属。开发版修复后的正式站冷开记录由本轮发布回执补充。[原件并发回归](../../../apps/idol-site/tests/udtt-editorial-reads.test.cjs) · [页面加载回归](../../../apps/idol-site/tests/udtt-load-recovery.test.cjs) · [源码保护与原件范围](../../../apps/idol-site/scripts/udtt-private-build-assets-manifest.json)
