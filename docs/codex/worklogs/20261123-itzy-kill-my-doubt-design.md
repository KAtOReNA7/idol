# ITZY《KILL MY DOUBT》发行详情画稿

JYP 的发行目录和完整 1200 × 1200 封面用于本次设计。项目中已有的完整 WebP 为 264,334 B，画稿导入同像素 PNG。深蓝底、红色提示与封面相呼应，标题沿用团页的 Space Grotesk，正文使用 Noto Sans SC。桌面将封面与曲单并排，手机先读专辑名和日期，再看完整封面与曲单。[JYP 发行页](https://itzy.jype.com/discography/r4uyqzku) · [官方封面](https://d1meds70430yck.cloudfront.net/artist/itzy/651dfb33f55248dd87339ba5d51d90ed-d05a2169be8b4462b1a7520964c1ff9c-KILL%20MY%20DOUBT.jpg)

两幅画稿位于项目 Figma 的 ITZY 页面，桌面 1440 × 755，手机 390 × 1044。均回读真实封面、六个可编辑曲目实例、正确字体与零横向越界。封面图层在桌面为 474 × 474，手机为 354 × 354。两个完整构图均已查看。[桌面稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1669-1491) · [手机稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1669-1527)

| 发行曲序 | 曲名 | 已收录原版 MV |
| --- | --- | --- |
| 1 | BET ON ME | `recvxyOz5XJvBE` |
| 2 | CAKE（主打） | `recvxyOz5X64xs` |
| 3 | None of My Business | `recvxyOz5Xk9CH` |
| 4 | Bratty (나쁜 애) | — |
| 5 | Psychic Lover | — |
| 6 | Kill Shot | — |

两档画稿均包含封面原图和三支原版 MV 的入口。落地时复用站内发行曲目返回，保留 JYP 原出处，将返回目标定位到打开 MV 前的曲目或唱片封面。站内发行详情已按稿实现。唱片原封面可在页内打开，三个原版 MV 各带自己的曲目返回地址。

开发版的完整封面仍为 1200 × 1200。首次显示使用无裁切的 480 px 或 720 px 预览，分别为 38,220 B 和 67,024 B。正文两份 Noto Sans SC 字体子集沿用仓库 OFL 字体，共 43,680 B，标题复用 Space Grotesk。ITZY、LE SSERAFIM、XG 及共享曲目返回定向 32/32 通过，类型检查通过。[开发回归](../../../apps/idol-site/tests/itzy-kill-my-doubt-release.test.cjs)

正式 v255 实测原封面两宽均可返回，三条 MV 各回到原曲目。手机目录实取 38,220 B 的默认预览。[正式验收](20261123-v255-release.md)
