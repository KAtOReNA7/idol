# NewJeans《Attention》五张首发期成员照

《Attention》的五张默认成员图现采用 2022 年 7 月《New Jeans》首发图集。以前 MINJI、HANNI、HAERIN 和 HYEIN 使用较晚的《OMG》照片；DANIELLE 已经使用本套照片，本次为她增补与四位队友相同尺寸的手机预览。五张卡都显示「New Jeans · 本次发行概念照」，绑定作品 `recvxyOz5X2J0A` 和 HYBE 原版 MV `js1CtxSY38I`。[作品绑定与逐图出处](../../../apps/idol-site/data/mv-recognition-editions.json) · [NewJeans 日本官网发行曲目](https://www.newjeans.jp/discography/kidbwk)

2022 年 7 月 24 日的韩国官网在相册中将编号 1 至 32 的 `0722_0_N.jpg` 列为「new jeans Day 1」。下表序号指向其中的单张原图。人物名另按 KProfiles 的《New Jeans》发行图集核对，同组照片也见于出道当天的报道。四张既有摄影原件与官网图按完整画面同尺寸对照，平均每通道像素差依次为 MINJI 0.12、HANNI 0.11、DANIELLE 0.16、HAERIN 0.16（范围 0–255）。新增 HYEIN 原件取自官网存档，其与具名图集中 HYEIN 第三张的平均差为 1.06。官网公开宣传和项目既有规则支持本次认人图选用，本次未取得额外的开放再分发许可。[首发期官网](https://web.archive.org/web/20220724172456/https://newjeans.kr/) · [当期官网相册程序](https://web.archive.org/web/20220724172456id_/https://newjeans.kr/static/js/main.981d0251.chunk.js) · [逐人具名图集](https://kprofiles.com/newjeans-concept-photos-archive/) · [同期照片报道](https://www.soompi.com/article/1537211wpp/hybe-adors-new-girl-group-newjeans-unveils-solo-group-teasers-ahead-of-1st-ep) · [项目选图决定](../identity-photo-selection-policy-20261027.md)

卡图均为 480 × 640 WebP。下表裁切在完整原件上以左、上、右、下像素坐标表示。复核时将五张预览放在同一画布上逐一检查，原图入口仍展示整张摄影画面。

| 成员 | 官网图序 | 原件宽 × 高 | 裁切坐标 | 卡图字节 |
| --- | ---: | --- | --- | ---: |
| MINJI | 2 | 2000 × 2999 | 0, 60, 1986, 2708 | 31,920 |
| HANNI | 16 | 2000 × 2999 | 175, 120, 1771, 2248 | 31,018 |
| DANIELLE | 12 | 2000 × 1334 | 632, 0, 1631, 1332 | 29,202 |
| HAERIN | 18 | 2000 × 2665 | 1, 0, 1999, 2664 | 23,330 |
| HYEIN | 11 | 2000 × 2999 | 640, 550, 1840, 2150 | 34,992 |

四张旧 MV 截图及原出处可以从各自卡片的「查看原作品图」打开。DANIELLE 的完整照片和原有摄影文件是同一份，直接从该卡的「查看原图」打开即可。既有四张摄影原件继续由原投递清单提供，HYEIN 的 643,858 字节原件和五张小图随本站静态文件提供。[固定原件清单](../../../apps/idol-site/data/production-asset-delivery.json) · [成员原图交互](../../../apps/idol-site/components/mv-identity-photo.tsx)

## 前后比较与验收

对同一《Attention》作品和同五条现有成员关系，用完整作品详情分别渲染访客只读与本人入口。比较 v213 和本次选图清单时只替换清单，读取每张卡首次展示的实际 `img src`。两种访问方式均从五张合计 717,023 字节降至 150,462 字节，减少 566,561 字节（79.02%）。其中 DANIELLE 原来在缩略位置加载 595,785 字节的完整 JPEG，现在先展示 29,202 字节的预览。此处按每张图各取一次的文件大小统计，网络耗时和缓存节省量需另行实测。访客五张卡分别含本人的只读记录，本人视图五张卡分别含本人评分入口。[作品详情渲染](../../../apps/idol-site/components/catalog/work-detail.tsx) · [专项回归](../../../apps/idol-site/tests/mv-recognition-editions.test.cjs)

全表按每个「作品、视频、成员」实际采用的图注重算，明确标注跨期的卡位从 198 个降为 194 个。此前前四个优先团中，IVE、ADYA 与 W!TCHX 各为 0 个，NewJeans 为《Attention》的这 4 个。本批之后这四团各为 0 个，其他团的 194 个位置仍有明确的跨期图注。这个数字仅覆盖已标注的跨期认人照。[先前 529 个位置的逐图口径](../evidence/20261121-mv-release-portraits/review.md)

Windows 定向运行 `node --test tests/mv-recognition-editions.test.cjs tests/newjeans-detail.test.cjs`，13 项全部通过。实际尺寸、五人具名来源、旧作品图、不同作品或不同剪辑不套用该套照片均有覆盖。既有测试还核对五个成员评分对象、零分、舞台切换、草稿恢复与详情返回。正式页面、手机裁切与原图打开另按发布后的实页结果记录。[NewJeans 详情用例](../../../apps/idol-site/tests/newjeans-detail.test.cjs)
