# 团页照片、团标与 UDTT 加载

飞书问题 19、21、22、24、25 涉及一处登录后加载和四个团的首页。对照 v236 的页面、反馈截图和各团当时的官方素材后，原图入口、成员、作品、历史阵容和私人评分继续沿用原有绑定。

| 页面 | 访客现在看到的内容 | 官方参考 |
| --- | --- | --- |
| EVERGLOW | 首页先展示四人横幅，下方使用 CHXXTA 紫色字标。CODE 的 MV 和发行详情各占一条链接。成员区仍可打开 CHXXTA 竖版资料照。 | [CHXXTA 艺人页](https://www.chxxta.com/everglow) · [官方社区](https://everglow.bstage.in/) · [团照原件](https://image.static.bstage.in/everglow/4c97a4e4-16f8-4c29-ab54-ccc90131ccf0/4c94b7a2-d48d-4cfa-947a-141311a89101/ori.jpg) |
| Rocket Punch | 完整教室六人照位于作品链接前。照片旁保留一次 BOOM 年份图注，点击照片可查看原件。手机先看到全体成员。 | [Woollim《BOOM》](https://www.woolliment.com/album/boom) |
| Weeekly | 首页先展示《Bliss》ON 六人合照，使用同期官方频道字标。发行横幅移至《Bliss》详情，仍可打开原件。 | [Weverse 团照](https://weverse.io/weeekly/media/2-144406028) · [官方频道](https://www.youtube.com/@Weeekly) · [Genie 同期专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428) |
| WOOAH | 首页先展示原比例五人团照。日本官网字标取代巨幅普通字体。五人姓名直接进入对应成员档案。 | [2024 年日本官网存档](https://web.archive.org/web/20240618122436/https://wooahjapan.jp/) · [字标出处](../evidence/20261121-official-marks/source-marks.json) |
| UDTT | 登录后，目录与本人可见的图片清单同时请求。首页的 School Rush、VIPER、RETRY 使用一样大的方形封面，手机也能在图片旁看到曲目、进入发行详情。 | [原生页面](../../../apps/idol-site/components/candidate/udtt-native-design.tsx) · [封面样式](../../../apps/idol-site/public/artist/udtt/figma-native.css) |

四个团已在项目 Figma 的桌面 1440 和手机 390、320 画板更新。十二个首页区域均回读了原照片和可编辑文字，所有子图层位于容器内。复看导出的设计图时逐一核对了人数与字标。EVERGLOW 手机展示中心四人的构图，点击可查看包括左右场景的完整原图。

- [EVERGLOW 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1230-1095)
- [Rocket Punch 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1239-1095)
- [Weeekly 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1258-1102)
- [WOOAH 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=945-1662)

## UDTT 首页三张发行封面

第一版首页样式在没有本轮 UDTT 比例稿时先写入了开发分支。发现后已在工作树恢复 v236 的封面样式，保留目录与本人图片清单的并行读取。随后在项目 Figma 中沿用已有三张封面图层，逐档重画 School Rush、VIPER 和 RETRY。桌面、390 和 320 像素稿写入各自的完整首页，1024 像素另有平板画板。四档都回读了卡片的设计上下文，导出核看封面、标题、年份和入口后，重新实现了首页样式。

| Figma 画板 | 三张封面的边长 | 单张卡片高度 | 阅读与点击 |
| --- | ---: | ---: | --- |
| [1440 像素首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=841-1182) | 168 px | 224 px | 年份、封面和曲目从左到右排，详情入口位于曲目下方。 |
| [1024 像素平板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1440-1154) | 128 px | 176 px | 三张卡保持同样的三列，原先该宽度下 VIPER 和 RETRY 的文字会被挤到下一行。 |
| [390 像素首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=841-1304) | 98 px | 152 px | 封面在左，右侧可读年份、标题、曲目并进入详情。 |
| [320 像素首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=902-1513) | 80 px | 152 px | 保持方形封面和四行文字，各发行详情入口至少高 44 px。 |

旧 1440 画板中三张封面边长分别为 280、192、192 px，旧 390 画板均为 310 px。表内是设计尺寸，浏览器正文宽度与页面实测记录另见发布验收。封面沿用本人和访客各自可以访问的作品图片；项目已有的三张 Figma 原件用于排版，未另行投递图片。

v236 正式站在正文宽 1024 px 时，实际三张封面分别为 203、592、592 px，三个原详情与返回都可用。本机隔离库的图单返回 409，因其快照及版本与准入清单不同，浏览器只能看到重试入口。新版同身份对比需在正式环境复验。Windows 启用已有 LinkeDOM 后，UDTT 的加载恢复、图片准入、人物身份、导航和公开文字等 67 项检查全部通过。原审阅页的时间轴断言曾将已获准的「查看发行资料」也判为多余，现逐条核对该按钮的作品、事件及实际地址。

## 同条件指标与专项测试

按首显图文件本身比较，EVERGLOW 从 948,272 字节降至 230,138 字节，减少 718,134 字节（75.7%）。Weeekly 首显团照保留 355,392 字节。将原本同时优先加载的 127,042 字节专辑横幅移入发行详情后，首页优先加载的摄影素材由 482,434 字节降至 355,392 字节（26.3%）。WOOAH 改用已有的同尺寸 799 × 533 WebP，无裁剪，761,234 字节降至 69,454 字节（90.9%），原 PNG 按需打开。这三项统计图片内容的字节数。

Windows 本地地址绑定、UDTT 目录和图片分段故障恢复、51 团 MV 与发行次序、WOOAH 原生路由及旧素材回执的四个专项套件合计 72 项通过。51 团的图片及时间轴矩阵 310 项通过，其中包括四团正式页面渲染器对首图、首页标题和原件链接的检查。UDTT 的隔离测试分别挂起公开和本人目录响应，确认两种身份对应的图片请求均已发出，保留已有失败提示、重试、原作品入口和公开/本人清单差异。

专项脚本记录实际正文宽度、照片和文字面积，点击原图、等解码、关闭并检查焦点归还。UDTT 逐张读取三张封面的解码尺寸、展示宽高和入口点击面积，用鼠标与键盘进入对应发行，核对作品标题和完整地址后返回。浏览器可以提供资源时序时，另记目录与图单请求的重叠时长。正式站浏览器结果随发布回执记录。[浏览器脚本](../qa/group-photo-priority.mjs)
