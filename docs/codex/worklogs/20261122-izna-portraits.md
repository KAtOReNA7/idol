# izna 成员名录与作品浏览

名录采用六张 WAKEONE 现役成员照，尹智允在「历史成员」下单列，保留当时的具名资料照。七张卡上的流水号已移除。可以用中文名或艺名搜索、清除筛选、进入本人资料，并在个人页放大照片。代表稿采用富冈茉衣（MAI）的官方头像。[WAKEONE 官网](https://wake-one.com/en/artists/izna/) · [素材来源](../../../apps/idol-site/data/izna-editorial.json)

| 页面 | 桌面 Figma | 手机 Figma |
| --- | --- | --- |
| 团页 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19251) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19340) |
| 成员名录 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19431) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19484) |
| 成员详情 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19538) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19569) |
| 作品目录 | [1440](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19600) | [390](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=812-19747) |

本次先移除名录数字栏，再依官方原件重做 Figma。旧稿的历史成员槽实际导出时全黑，已按同一张历史原图重新导入 JPEG，并在导出图查到本人。作品目录的 15 个入口对应 14 张不同视频图，其中两条指向同一剪辑。首页、成员与目录画板共填入 44 个对应的视频缩略图。MAI 个人页的发行成员、发行宣传保留各自的登记关系，影像与舞台提前至发行前。原有的私人手帐入口和照片来源仍可访问。[设计画面](../evidence/20261122-izna-portraits/figma.jpg)

11 月 22 日，Codex 自带浏览器在正式 v236 与本地开发版以相同宽度打开名录、点击 MAI 并读取首张参与影像的位置。实际正文 375 px 时，缩略图顶边由 2348 px 提前至 1251 px，1425 px 时由 3013 px 提前至 1009 px。两版每档均有七人。开发版每档可用 MAI 及尹智允分别找到本人，点开照片并关闭后可进作品目录。目录有十五条影像，手机一列、桌面两列，各宽度无横向溢出。代码、素材及审阅路由定向测试 24/24 通过。新设计仍待发布。[同宽前后读数](../evidence/20261122-izna-portraits/before-after.json) · [操作记录](../evidence/20261122-izna-portraits/local-journeys.json)
