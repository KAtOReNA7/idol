# 正式 v239 验收

本次上线的工程是 `ec729b4c`，Sites 源是 `950eae62`。压缩包 98,365,601 字节，实际展开 125,389,824 字节。包内 25 项迁移与源码一致，STAYC 十二个新增文件均按发布版本交付。[实际包记录](package.json)

Windows、WSL 的类型检查、生产构建、素材检查和 1,353 项现行用例均通过。全量各 4,277 项。Windows 4,142 通过、96 失败、39 跳过，WSL 4,146 通过、92 失败、39 跳过。和 v238 逐项比较，两端的 STAYC 旧素材用例恢复通过，旧《Password》回执多报一个全站清单变动。原封面及身份检查通过。补入十二张后来发布的 STAYC 照片以还原 10 月清单后，Windows 和 WSL 分别通过该文件 4/4 项。[冻结版原始结果](tests.json) · [逐项对照](full-suite-failures.csv) · [历史回执修订](password-poster-followup.json)

正式站实取 STAYC《SO BAD》六张预览和六张大图，12 次均同源返回 200。预览完整解码为 480 × 640，原件为 1200 × 1680，每张均与本次发布文件一致。[十二张正式图片](formal-stayc-photos.json)

本目录沿用的 `itzy-lesserafim-*` 三份文件记录此前两团设计的本地浏览、主题和合成评分路径，`kissoflife-original-delivery.json` 记录本地 Worker 及当时正式域名的发布前比对。KISS OF LIFE 八张图片上线后的实际请求另见 v238。[两团开发日志](../../worklogs/20261122-itzy-lesserafim-work-details.md) · [v238 正式图片](../20261122-v238/formal-kissoflife-originals.json)
