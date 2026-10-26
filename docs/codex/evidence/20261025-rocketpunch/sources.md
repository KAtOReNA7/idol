# Rocket Punch 官方研究 · 2026-10-25

## 本轮实际查看的官方视觉

- [Woollim《BOOM》发行页](https://www.woolliment.com/album/boom)：IAB 已实际打开、读到完整文字与导航并截图。`woollim-boom-desktop.png` 是实际首屏（1253×705）。黑底、白色粗体无衬线、灰正文、细分割线、左侧大幅鲜黄封面，右侧发行标题和正文。
- IAB computed style：BOOM / ALBUM / GALLERY 为 `Open Sans`, 32px, 700, rgb(255,255,255)。源码加载 Open Sans 300–800、Lato 100–900。源码及 CSS 分别为 `woollim.html`、`woollim.css`。
- 这是一张**公司官方发行详情页**，不是独立团体官网主页。建议以此真实黑白排版和 BOOM 黄色发行艺术扩展；成员目录、搜索、时间轴、手帐不是原官网所有，不应称逐像素复刻。
- [日本旧官网](https://rocketpunchjapan.com/)：本轮 IAB 实际打开并截图，已转为 DHgate 商城，不能把现站风格当团体官网。该截图未保存文件，但实际工具已查看。
- [2023日本官网改版公告](https://prtimes.jp/main/html/rd/p/000000938.000017372.html)：SKIYAKI 2023-05-08 官方发布；其官网设计展示图已下载并实际 view_image：`official-japan-redesign-2023-0.jpg`。白底、黑色小导航、粉红手写字标、左侧蓝气球团照。仅是历史官网展示截图，不能宣称原网页现可访问。可用作辅助历史依据。
- [Woollim 当前艺人目录](https://www.woolliment.com/artists-woolim)：本轮实际请求 HTML，仅列 GOLDEN CHILD / DRIPPIN，未列 Rocket Punch；存档 `woollim-artists.html`。

## 官网原图

`official-assets.json` 记每张来源页、精确原URL、解码韩文文件名、尺寸、字节数及SHA256；全部为下载响应原字节，未裁切、缩放、重压。

首套建议：

- `boom-1-group-original.jpg`：1984×1403 完整六人团照。
- `boom-1-{juri,yeonhee,suyun,yunkyoung,sohee,dahyun}-original.jpg`：同套具名个人照片。除Suyun为1984×1403横幅，其余1403×1984；显示时需完整contain，不能假定六张同一方向。
- 六人身份依据官网原URL中的具名韩文文件名：쥬리/연희/수윤/윤경/소희/다현；不是凭脸识别。
- `boom-official-cover.jpg`：实际1500×1500。URL文件名含3000x3000，但实际响应尺寸是1500，不应夸称3000原图。
- 同时保存了第二套6个人/团体/单元照，`boom-2-*`；若选用需保持同套或清楚说明。
- 素材属于《BOOM》2023发行历史时期；上传CDN路径含2024迁站痕迹，不将CDN上传时间当拍摄日期。
- 不把公司 Woollim 标识当团体 Rocket Punch 字标；当前官网页未找到单独团体字标，使用文字团名是合适做法。

## 历来六人与当前归属边界

六名历史成员由2023官方日本改版发布和2023BOOM官网具名图相互印证：JURI、YEONHEE、SUYUN、YUNKYOUNG、SOHEE、DAHYUN。仅公开历史名册，避免以仓库5个groupIds直接称当前活动五人。

- [JURI官方合同公告](https://weverse.io/rocketpunch/notice/19667)：官方文字确认Juri合同结束，并称之后以五人体制活动。搜索连接器实际读取官方正文；raw HTML本地仅shell，不能说requests读到正文。[Soompi具日期报道](https://www.soompi.com/article/1663731wpp/rocket-punchs-takahashi-juri-to-leave-the-group-and-woollim)为2024-05-24，补足官方文本仅“24日”的年月。
- [四成员官方合同公告](https://weverse.io/rocketpunch/notice/24507)：Yeonhee、Yunkyoung、Sohee、Dahyun合同12月31日结束。[Soompi具日期报道](https://www.soompi.com/article/1712733wpp/4-out-of-5-rocket-punch-members-leave-woollim-entertainment)为2024-12-27，对应2024-12-31。
- [SUYUN官方合同公告](https://weverse.io/rocketpunch/notice/38032)：搜索连接器open已读到官方正文，明确合同结束。[本人官方帖](https://weverse.io/rocketpunch/artist/3-238220157)有2026-08-06日期，确认结束Woollim合同。不能继续称其当前仍属Woollim。
- 合同结束不等于团体解散，未据这些公告推定“已解散”、强行改业务成员归属或改稳定ID。
- 所有原始Weverse HTML只返回shell，`weverse-*.json`的text也只有标题；可靠正文证据来自实际search/open连接器而非这些本地raw文件。

## 发行与曲目

[Bugs官方团体艺人发行目录](https://music.bugs.co.kr/artist/20088588/albums)本轮返回15项发行；ALL/RELEASE请求均15项，JOIN为空。15个详情HTML均已保存。

- `releases.json`：15项发行、源112条曲目、本团署名55条。每项字段 id/url/title/listType/info/tracks/groupTracks/date/type/artists/artist/note/sourceOgImage/coverFile/coverSha256。
- `bugs-covers.json`：15封面逐项原响应字节、SHA256、尺寸和来源。取实际详情页og:image原URL，未猜大图地址。
- 合辑仅显示本团署名：OST SPECIAL 4095270 为1条Paradise（源52曲）；Listen-Up EP.5 4079161为2条Thanks to含Inst.（源8曲）。其他歌手曲目不得挂到本团。
- Ring Ring韩语单曲4045200（2021-05-17）与独立Acoustic Ver.4056281（2021-07-15）分开。不要按相同标题混绑既有作品。
- SODA 20580963曲名和介绍明确 Vocal. 尹景/素姬/多玹，不将团体署名扩展为六人参与。
- 日本版本与韩语版本按源名称保留；此统计是当前Bugs可见目录，不能无限扩大为全球完整发行全集。

15项顺序及本团曲目数：

| Bugs ID | 日期 | 发行 | 本团曲目数 |
|---|---|---|---:|
|4095270|2024-01-17|플레이, 플리 OST SPECIAL|1|
|4093201|2023-11-18|플레이, 플리 OST Part.1|2|
|4090900|2023-09-06|BOOM|3|
|20580963|2023-07-30|SODA|2|
|20495456|2022-10-05|ドキドキLOVE|7|
|4079137|2022-08-29|FLASH|3|
|4079161|2022-08-27|Listen-Up EP.5|2|
|20475675|2022-06-29|Fiore|1|
|4071771|2022-02-28|YELLOW PUNCH|6|
|20407737|2021-08-04|Bubble Up！|5|
|4056281|2021-07-15|Ring Ring (Acoustic Ver.)|1|
|4045200|2021-05-17|Ring Ring|3|
|990810|2020-08-04|BLUE PUNCH|6|
|20305168|2020-02-10|RED PUNCH|7|
|20270095|2019-08-07|PINK PUNCH|6|

## 验证范围

已做公开资料、原图及参考截图研究。未改仓库、未发布、未改私人资料/关系/稳定ID。没有验证正在开发的新页面、真实播放或保存。
