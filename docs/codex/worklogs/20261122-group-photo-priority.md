# 团页照片、团标与 UDTT 加载

飞书问题 19、21、22、24、25 涉及一处登录后加载和四个团的首页。对照 v236 的页面、反馈截图和各团当时的官方素材后，原图入口、成员、作品、历史阵容和私人评分继续沿用原有绑定。

| 页面 | 访客现在看到的内容 | 官方参考 |
| --- | --- | --- |
| EVERGLOW | 首页先展示四人横幅，下方使用 CHXXTA 紫色字标。CODE 的 MV 和发行详情各占一条链接。成员区仍可打开 CHXXTA 竖版资料照。 | [CHXXTA 艺人页](https://www.chxxta.com/everglow) · [官方社区](https://everglow.bstage.in/) · [团照原件](https://image.static.bstage.in/everglow/4c97a4e4-16f8-4c29-ab54-ccc90131ccf0/4c94b7a2-d48d-4cfa-947a-141311a89101/ori.jpg) |
| Rocket Punch | 完整教室六人照位于作品链接前。照片旁保留一次 BOOM 年份图注，点击照片可查看原件。手机先看到全体成员。 | [Woollim《BOOM》](https://www.woolliment.com/album/boom) |
| Weeekly | 首页先展示《Bliss》ON 六人合照，使用同期官方频道字标。发行横幅移至《Bliss》详情，仍可打开原件。 | [Weverse 团照](https://weverse.io/weeekly/media/2-144406028) · [官方频道](https://www.youtube.com/@Weeekly) · [Genie 同期专题](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14428) |
| WOOAH | 首页先展示原比例五人团照。日本官网字标取代巨幅普通字体。五人姓名直接进入对应成员档案。 | [2024 年日本官网存档](https://web.archive.org/web/20240618122436/https://wooahjapan.jp/) · [字标出处](../evidence/20261121-official-marks/source-marks.json) |
| UDTT | 登录后，目录与本人可见的图片清单同时请求。首页两张发行卡在中等宽度使用相同的小方封面，手机上也可同时阅读标题和进入发行。 | [原生页面](../../../apps/idol-site/components/candidate/udtt-native-design.tsx) · [封面样式](../../../apps/idol-site/public/artist/udtt/figma-native.css) |

四个团已在项目 Figma 的桌面 1440 和手机 390、320 画板更新。十二个首页区域均回读了原照片和可编辑文字，所有子图层位于容器内。复看导出的设计图时逐一核对了人数与字标。EVERGLOW 手机展示中心四人的构图，点击可查看包括左右场景的完整原图。

- [EVERGLOW 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1230-1095)
- [Rocket Punch 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1239-1095)
- [Weeekly 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1258-1102)
- [WOOAH 首页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=945-1662)

## 同条件指标与专项测试

按首显图文件本身比较，EVERGLOW 从 948,272 字节降至 230,138 字节，减少 718,134 字节（75.7%）。Weeekly 首显团照保留 355,392 字节。将原本同时优先加载的 127,042 字节专辑横幅移入发行详情后，首页优先加载的摄影素材由 482,434 字节降至 355,392 字节（26.3%）。WOOAH 改用已有的同尺寸 799 × 533 WebP，无裁剪，761,234 字节降至 69,454 字节（90.9%），原 PNG 按需打开。这三项统计图片内容的字节数。

Windows 本地地址绑定、UDTT 目录和图片分段故障恢复、51 团 MV 与发行次序、WOOAH 原生路由及旧素材回执的四个专项套件合计 72 项通过。51 团的图片及时间轴矩阵 310 项通过，其中包括四团正式页面渲染器对首图、首页标题和原件链接的检查。UDTT 的隔离测试分别挂起公开和本人目录响应，确认两种身份对应的图片请求均已发出，保留已有失败提示、重试、原作品入口和公开/本人清单差异。

正式站需要用 Codex 内置浏览器复验。专项脚本记录实际宽度、照片和文字面积，点击原图、等解码、关闭并检查焦点归还。UDTT 另读两张封面尺寸及本人请求时序，进入发行后再返回首页。正式数据不在此处写入。[浏览器脚本](../qa/group-photo-priority.mjs)
