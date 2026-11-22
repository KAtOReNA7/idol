# ADYA《Per》五人首发片场照与本人评分

5 月 9 日首发《Official S#3 MV》的五张默认认人照原先来自红色球衣写真，拍摄时期未知。韩国发行方 Genie 的出道专题按姓名刊出每人两张在《Per》片场拍摄的照片。新版逐人采用第 2 张竖幅，保留手部动作、道具和自然表情。能从卡片同时打开现场原图、原红色球衣写真与旧 MV 截图。五条作品成员绑定沿用。5 月 26 日 KBS Music Bank 是该曲独立的舞台入口。[Genie 首发专题与五人配文](https://genie.co.kr/magazine/subMain?ctid=1&mgz_seq=13145) · [Bugs 的 5:09 完整版与 0:19 预告](https://music.bugs.co.kr/album/20563938) · [此前球衣写真](https://kprofiles.com/adya-members-profile/) · [旧 MV 截图](https://dbkpop.com/mv/adya-per/)

| 成员 | Genie 片场内容 | 原图 |
| --- | --- | --- |
| 延秀 · Yeonsu | 操作台上准备点心 | [刊发原图](https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/13145/Mgz_Sub_IMG_20230508115719.jpg) |
| 书媛 · Seowon | 坐在摊开画册的书桌前 | [刊发原图](https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/13145/Mgz_Sub_IMG_20230508115753.jpg) |
| 世娜 · Sena | 站在红色键盘和麦克风前 | [刊发原图](https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/13145/Mgz_Sub_IMG_20230508115845.jpg) |
| 采恩 · Chaeeun | 手持白红球衣 | [刊发原图](https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/13145/Mgz_Sub_IMG_20230508115917.jpg) |
| 胜彩 · Seungchae | 穿粉色上衣，抬起手看向镜头侧方 | [刊发原图](https://image.genie.co.kr/Y/IMAGE/IMG_MUZICAT/IV2/Genie_Magazine/13145/Mgz_Sub_IMG_20230508115952.jpg) |

四幅 Figma 画稿沿用 Starting House 团标、黑底橙红与 Archivo Narrow 标题，首发 MV 和书媛本人展开的四项评分各一对。桌面三列、手机一列。画稿按正式站既有顺序摆放采恩、世娜、书媛、胜彩、延秀，并已读回图层与截图。《RIZZ》及 Music Bank 舞台的旧稿分别留存。[桌面 MV](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1599) · [手机 MV](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1676) · [桌面本人评分](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1751) · [手机本人评分](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1594-1843)

开发提交 `dee65a74` 中五张 480 × 640 默认图合计 157,570 B，原五张同尺寸预览为 173,464 B，节省 15,894 B（9.16%）。五份 840 × 1260 完整原件合计 1,416,549 B。默认加载只需预览，点开才取本人原件。375 px 正文中照片与本人评分从 305 px 加宽到 335 px，1425 px 正文中从 317 px 加宽到 350 px。两宽均逐个验证新原图、旧红色球衣照、旧 MV 截图和四个评分字段。本人按钮高 44 px，紧接照片下方 8 px。[来源、裁切与成员记录](../evidence/20261122-adya-per-set/design-and-sources.json) · [前后四组浏览器读数](../evidence/20261122-adya-per-set/local-browser.json)

内置后台浏览器通过隔离 SQLite 的实际记录和保存接口检验书媛的表现分。手机写入 0 后模拟回执丢失，再次提交只增加一个版本及一条日志。桌面重新进入后读回 0，清空为 null，再次保存 0。其余四人一直为空。Windows 与 WSL 各通过七个文件 105/105 项，含 51 团、599 支 MV 的 4,195 张作品成员卡均有本人图与入口。本次交互检查覆盖首发 MV 和 KBS 舞台封面及返回。首发《Per》播放仍待可嵌的完整片源。[隔离保存及全团覆盖](../evidence/20261122-adya-per-set/local-browser.json) · [播放候选核验](20261122-additional-mv-playback.md)
