# Kep1er 的作品封面、舞台日期和发行入口

飞书第 27 条反馈的截图来自 Kep1er 首页。原来的三行只列日期和歌名。下方「浏览发行与影像」按钮的装饰跟随外层发行区域缩放，黑底和箭头遮盖了《CRACK CODE》封面。根据用户对设计流程的要求，已先撤下初版布局，再在项目原有的 Kep1er 页面重做六张 Figma 画板，以定稿尺寸重新实现作品行、发行封面和按钮。素材取自对应 MV 和场次的官方视频封面、Mnet Plus 节目图与日本官网正式发行页。[WAKEONE 艺人资料](https://wake-one.com/en/artists/kep1er/) · [《CRACK CODE》](https://kep1er.jp/discography/crackcode/) · [《Kep1going On》](https://kep1er.jp/discography/kep1going-on/) · [《BUBBLE GUM》](https://kep1er.jp/discography/kep1er-the-7th-mini-album/)

| 设计宽度 | 首页的影像与精选发行 | 作品目录 | 舞台单筛 |
| --- | --- | --- | --- |
| 1440 px | [3 支 MV 与《CRACK CODE》](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1109) | [16 支作品与发行目录](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1150) | [15 个场次](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1332) |
| 375 px | [3 支 MV 与《CRACK CODE》](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1461) | [16 支作品与发行目录](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1502) | [15 个场次](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1441-1686) |

六板使用了 16 份 MV 图、15 份舞台图和 3 张发行封面。作品图和标题共用一个入口，有另一场演出时单独保留「舞台」。桌面作品图为 160 × 90，手机为 96 × 54。发行封面为完整方形，两个宽度分别展示为 320 × 320 和 120 × 120。发行按钮采用普通文本与同一按钮内的箭头，桌面 192 × 48、手机 140 × 44。首页两处重复的《Shooting Star》链接合并为一处。舞台列表显示该视频的发布日期，例如《KILLA》MV 的发行日期是 2026.03.31，Mnet 节目视频的发布日期是 2026.04.02。[设计原图](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1439-1556) · [《KILLA》官方 MV](https://www.youtube.com/watch?v=AMwK8YGZGnU) · [Mnet 场次](https://www.youtube.com/watch?v=tdw1XfMImmg)

使用 `ffcc04d9` 和本次实现、同份公开目录及同一个 React 服务端渲染器，按每行对应片源的本地图片地址逐项比较。图片和歌名均可进入对应详情，返回地址包含访客原来的筛选与页面。

| 可核对项 | 修复前 | 按 Figma 重做后 |
| --- | --- | --- |
| 首页代表 MV 的同版封面 | 0/3 | 3/3 |
| 默认作品目录的同版封面 | 0/16 | 16/16 |
| MV 单筛的同版封面 | 0/16 | 16/16 |
| 舞台单筛的同场次预览图 | 0/15 | 15/15 |
| 舞台单筛显示该视频的发布日期 | 0/15 | 15/15 |
| 首页影像和精选发行中前往《Shooting Star》MV 的链接 | 2 | 1 |

初版在 Windows、WSL 各通过 5 项测试，另检查了 51 团的 153 个路由入口和 18 团的 39 处已有裁切。Figma 重做后的 Kep1er 作品、次级舞台入口、发行原件及 MV 先于专辑等 6 项专项回归两端均通过，覆盖表中四个入口的 50 个卡片实例，Windows 类型检查通过。复跑共享裁切用例时，另团片源 `pTycfmVzdl8` 仍处在按 Figma 重做前的临时旧实现，双端均报告 `transform:scale`。全团合并结果、实际浏览器宽度与点击及发布结果见当批正式验收。[专项回归](../../../apps/idol-site/tests/artist-home-media-layout.test.cjs)
