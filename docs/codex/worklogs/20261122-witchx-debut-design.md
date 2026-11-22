# W!TCHX 团页、成员与作品目录

飞书第 17 条反馈涉及视觉、播放和评分。视觉改版以经纪公司发布的团标、具名档案卡和出道单曲《BLALA》的发行封面为依据。炭黑底和暖橙来自封面的火焰与黑色画面，英文标题使用 Orbitron，英文副文使用 Rajdhani，中文沿用已有的思源系 Noto Sans SC。首页把正式字标、团体介绍、成员入口和作品入口放在五人合照旁，手机上先读团名及入口，随后可打开完整合照。Bugs 艺人页未注明合照拍摄时期，页面图注保留这一点。[经纪公司艺人页](https://kpopmedia.co.kr/#artists) · [Bugs 艺人照](https://music.bugs.co.kr/artist/20222498) · [《BLALA》发行](https://music.bugs.co.kr/album/20681889)

在项目 Figma 中更新了两个宽度的首页主要内容、成员目录和作品目录。逐图核对了 56 个卡片实例，桌面成员照为 248 × 331、影像为 422 × 237、发行为 422 × 422。手机分别为 170 × 227、170 × 96、170 × 170。五位成员的人像都截自本人的公司具名档案卡，成员详情可打开原卡。目录画板中的输入框与查找按钮高度均为 44，作品先展示影像，再展示发行。首页实现还保留原有的时间轴、资料统计与照片来源。

| 设计宽度 | 首页 | 成员 | 作品 |
| --- | --- | --- | --- |
| 1440 px | [首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9556) | [成员](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9645) | [作品](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9676) |
| 390 px | [首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9732) | [成员](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9825) | [作品](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1427-9858) |

对照改版前 `deb021dc` 与本次代码，两版用同一份公开目录、同一 React 服务端渲染器，分别打开 `/artists/witchx` 和 `/artists/witchx?section=works`。下表计卡片内可聚焦的链接。每张卡片指向的作品、发行或场次，以及详情回到原位置的链接均沿用现有绑定。

| 每个入口的观测项 | 改版前 | 改版后 |
| --- | --- | --- |
| 6 张影像卡的链接 | 12 | 6 |
| 3 张发行卡的链接 | 9 | 3 |
| 卡片指向的独立详情 | 9 | 9 |
| 首页介绍与合照位于同一开场区 | 否 | 是 |
| 首页主标题采用公司原字标 | 否 | 是 |
| 首页可打开的成员档案 | 5 | 5 |

首页和作品目录各减少 12 次重复的键盘停靠。Windows 与 WSL 各通过本团素材与成员、目录顺序、影像封面四个文件的 67 项测试。Windows 类型检查通过。共享测试覆盖 51 团的首页、默认作品目录与 MV 单筛。Figma 的设计宽度与服务器渲染计数均单独记录。正式站在浏览器内的实际宽度、点击、发布时间和播放结果见当批发布回执。[本团回归](../../../apps/idol-site/tests/witchx-portrait-credit.test.cjs) · [全团封面回归](../../../apps/idol-site/tests/artist-home-media-layout.test.cjs)

《BLALA》歌词影像的原生评分及经本人确认的成员评分另有隔离 D1 验收。此前对官方同版 YouTube 的站内短播未取得两次递增进度或解码尺寸，独立码率未测得。198 秒的 Moving Mix 属于另一剪辑。飞书第 17 条仍需正式站验证并解决同版播放。[作品导入与评分范围](20261122-reviewed-editorial-mvs.md)
