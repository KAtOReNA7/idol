# BABYMONSTER 的三个分享入口

BABYMONSTER 的成员名录、作品目录和大事时间轴现在从分享链接直接打开。正式 v254 的三个链接在第一份 HTML 都选中「概览」，展示首页团照和等待提示。本机新版本把七位成员、十九支作品和十一条事件分别放进对应页面。作品筛选和部分个人状态仍从本团目录读取。[逐项证据](../evidence/20261123-v255/babymonster-share-directories.json)

## 官方资料与设计

YG 官网用 BABYMONSTER 文本团名标识艺人。成员名录沿用 2024 年 3 月 YG LIFE 逐人发布的《BABYMONS7ER》七张具名概念照，按原顺序显示艺名、中文显示名和活动状态。RAMI 的「暂停活动」在名录中直接可见。桌面七人并列，手机两列。作品目录每行使用对应视频封面和日期，有可看的现场时单独给出入口。时间轴保留事件的真实日期、分类和可点的关联人物或作品。[YG 官方团页](https://www.ygfamily.com/en/artists/babymonster/profile) · [逐人出处](../evidence/20261123-babymonster-member-profile/figma-and-sources.json)

项目 Figma 新增六个可编辑画板。六个画板分别读取过设计上下文和完整截图。作品双宽各有十九张与记录相符的视频封面，时间轴双宽各有十一条事件。黑底、红色观看入口、团名和网站字标取自现有设计。桌面稿宽 1440 px，手机稿宽 375 px。[六稿所在分区](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1676-1485)

| 栏目 | 桌面画稿 | 手机画稿 |
| --- | --- | --- |
| 成员名录 | [1440 × 660](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-1478) | [375 × 1729](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-1545) |
| 作品与舞台 | [1440 × 1984](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-1615) | [375 × 1955](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-1811) |
| 大事时间轴 | [1440 × 1253](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-2007) | [375 × 1279](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1678-2206) |

## 首份内容与原图

| 分享链接 | v254 正式站首份 HTML | 新版本本机首份 HTML |
| --- | --- | --- |
| 成员名录 | 0 位，选中概览 | 7 位，含本人名录链接和当期照片 |
| 作品与舞台 | 0 支，选中概览 | 19 支各一个 MV 主入口，16 支另有对应现场 |
| 大事时间轴 | 0 条，选中概览 | 11 条按日期排列，18 个关联均有真实链接 |
| 搜索 BILLIONAIRE | 等待目录 | 1 个作品及其对应舞台 |
| 访客共享高分重温筛选 | 等待目录 | 显示个人观看记录仅本人可见 |

七张 800 × 1200 原图共 1,016,692 B。名录按设备像素密度选图，七张 360 × 540 文件共 188,850 B，较原件减少 81.43%；540 × 810 的一组合计 353,636 B，减少 65.22%。这些数值来自同七张照片的实际编码文件。七张原图和十四张预览均已完整解码，成员详情仍可查看原图。[原图与每人预览字节](../evidence/20261123-v255/babymonster-share-directories.json)

## 验证范围

匿名 HTTP 使用同一组五个请求，正式 v254 和本机开发服务各得到五个 200。本机服务没有向匿名 HTML 投递私人评分、备注或时间轴研究记录。相同目录快照另验证了目录加载后的人员、曲目、图像、日期和返回链接。本人隔离夹具显示 0.0 分，访客读不到所注入的私人信息。TypeScript 通过，十三组定向测试共 512/512 通过，含本次新增八项。时间轴链接经实际 React 回调确认，普通点击将原事件和目标传给既有返回控制，尚未接管或带修饰键的点击保留原生链接。[实测明细](../evidence/20261123-v255/babymonster-share-directories.json)

主控使用 Codex 内置浏览器在本机 5173 端口核对了三个直达标题，打开 AHYEON 后退回本人卡，也从《BILLIONAIRE》详情回到原搜索。该服务客户端仍请求一份上批已移除的开发模块，目录请求计数和作品卡回焦留给干净构建。另开 5194 端口的独立开发服务、编译缓存及公开测试数据库已验证匿名目录返回七人、十九支作品和十六个舞台。正式站浏览器复验由主控随合批发布记录。

正式 v255 已实测 7／19／11 个首份位置、手机七张预览、本人返回、桌面作品卡和时间轴事件回焦。冷打开带搜索词链接时的首击清空待本批后的原生搜索修订。[正式验收](20261123-v255-release.md)
