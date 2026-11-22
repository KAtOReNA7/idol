# 飞书第 10–13 项 · 团页视频封面与发行内容

用 v235 已发布的 `55130817` 和本轮代码分别渲染四个团的实际首页。两组使用相同的公开目录快照、封面与 628 个片源。两种预览和原图也按相同输入逐个渲染。[同输入对照](../evidence/20261122-v236/artist-media-baseline.json)

| 页面及操作 | v235 | 本轮 |
|---|---|---|
| GENBLUE《COCOCO》及其他需要裁黑边的封面 | 18 团的 39 张封面在作品卡和播放器上放大整个图片元素 | 两处均只裁图像内部像素，放大图片元素的数量从 39 张降到 0 张 |
| UNIS 首页认作品、进播放页 | 3 个 MV 入口均只显示歌名 | 3 个均显示自己对应的封面且可进入作品，MV 在发行之前 |
| VVUP 首页认成员 | 团照原图 670 × 223，两枚大按钮重复顶栏操作 | 1032 × 582 四人团照可放大，团照下有发行来源，大按钮降至 0 枚 |
| VVUP 选视频 | 2 张卡分别设有独立灰色播放面板，每卡有 2 个相同作品链接 | 每卡在自己的封面上显示观看入口；灰色面板降至 0 个，保留每卡 1 个作品链接及独立舞台入口 |
| YOUNG POSSE 首页与 MV 目录 | 首页 3 张卡每卡有 3 个链接，图片、歌名、原站按钮分散 | 每卡 1 个站内链接，包含对应封面、歌名、版本和日期 |

UNIS 首页的《SWICY》封面与发行资料并列，其他发行随窄屏调整到下一行。VVUP 使用已有 Genie《VVON / Super Model》发行图片，统计周可在资料详情展开查看。YOUNG POSSE 使用同一套视频卡展示首页精选和 MV 目录。视觉沿用已验收设计和官方时期材料。[UNIS 日本官方发行页](https://www.unv-jp.com/ja/articles/dJPdStB6njkXP8nwfksZmE) · [Genie 的 VVUP 发行照片](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=15751) · [YOUNG POSSE 日本官方资料](https://youngposseofficial.jp/profile) · [VVUP 设计记录](../evidence/20261024-vvup-review-completion/figma-evidence.json) · [YOUNG POSSE 设计记录](../evidence/20261024-youngposse-review-completion/figma-evidence.json)

逐团核查了 51 团首页、作品目录、MV 筛选三种路由，共 153 次服务端响应。izna、ifeye、UDTT 的实页在浏览器取得数据后出现，此处查到三个加载壳及其目录片源。全目录有 39 张审核过的裁边封面和 589 张全帧封面，逐张对照两个预览和原图；39 张另用 Sharp 解码核对来源宽高。628 个原图地址及原图观看状态一致。[逐团与逐页结果](../evidence/20261122-v236/artist-cover-crops.json)

Windows 和 WSL 各通过 98 项定向测试，包含封面、播放器、三团内容、首页与目录的 MV/专辑顺序及设计边界。Windows 类型检查通过。浏览器的实际宽度、点击结果和正式发布情况见当批发布回执。
