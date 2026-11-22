# BABYMONSTER《DRIP》发行详情

正式 v257 的团首页和成绩页中，《DRIP》封面前往 YG 发行总目录。此次把同一封面接到站内独立发行详情，从团首页和成绩页分别返回原封面位置。新页保留 YG 专辑出处，沿用现有作品、评分及原版影像记录。[YG《DRIP》发行资料](https://www.ygfamily.com/en/artists/babymonster/discography/1615)

## 项目 Figma

桌面 1440 × 950，手机 390 × 1331。沿用本团 Anton、Noto Sans SC 和项目黑红配色，封面使用 YG 的紫红完整方图。九行由同一可编辑曲目组件组成，每行 60 px。两稿各有五个原版 MV 入口与一个表演视频入口，已检查最终画面和可编辑节点。[桌面](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1711-2165) · [手机](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1711-2185)

## 内容与开发版验收

采用 YG 专辑页的九首原发行顺序。CLIK CLAK 和 DRIP 都标双主打。BILLIONAIRE 对应 2025-02-07 的首发表演视频，曲目使用「看表演视频」。Love, Maybe、Woke Up In Tokyo (RUKA & ASA) 与 BATTER UP (Remix) 只列曲目。站内的早期 BATTER UP 原版没有绑到 Remix。

封面初显使用项目已有的 500 × 500 WebP，13,320 B。原图入口使用 960 × 960 JPG，852,238 B，仓库原件与 YG 专辑页所引用文件逐字节相同。该大小属于文件读数，正式浏览器传输待随发布测量。[YG 封面原件](https://www.ygfamily.com/contents/images/2024/11/album%28960x960%29_2.jpg)

两条来源路径、曲目顺序、六个记录与返回锚点已经通过正式组件定向验证。包含相邻三张唱片和 BABYMONSTER 分享入口在内，共 23 项通过。正式双宽页面、原图与实际焦点待下一批发布时复验。[开发入口](../../../apps/idol-site/app/artists/babymonster/releases/drip/page.tsx) · [定向验证](../../../apps/idol-site/tests/babymonster-drip-release.test.cjs)
