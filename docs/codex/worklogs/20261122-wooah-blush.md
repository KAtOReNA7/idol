# WOOAH《BLUSH》的 MV、Just Dance 舞台与成员评分

首发 MV 是 WOOAH 在 2024 年 4 月 8 日发布的韩文原版。4 月 12 日 GENIE MUSIC 的 Just Dance 表演有另一段剪辑和封面。团内目录和旧书签分别进入对应的站内版本；专辑页继续使用音乐发行封面。[首发 MV](https://www.youtube.com/watch?v=yh5W41ANcjo) · [Just Dance](https://www.youtube.com/watch?v=6JSb2MaK4Fk) · [Bugs 单曲资料](https://music.bugs.co.kr/album/20635181)

| 同一输入 | 改前 | 改后 |
| --- | --- | --- |
| 五名成员卡加载的图片文件总大小 | 3,818,793 字节 | 138,482 字节，减少 96.37%。五张均为 480 × 640 WebP；点开可看 4096 × 2731 的完整宣传照和原作品图。 |
| 同一团内视频卡的链接数 | 歌名和箭头各占一个 Tab 位置 | 整卡一个链接。24 个 MV 和舞台的实际 React 页面均覆盖。旧历史的箭头焦点落回对应卡片。 |
| 旧书签进入准确作品 | 站外视频排在观看记录之前 | 第一个操作进入站内，作品出处可展开，无法精确对应的版本仍提供原视频出处。 |
| 本曲旧 Figma MV 稿的影像空位 | 3 幅 | 0。官方 MV 使用 1280 × 720 五人封面，舞台使用独立 640 × 360 封面。 |

六人出道名册中的历史成员朴松伊（SONGYEE）没有加入这支 2024 年作品。NANA、WOOYEON、SORA、LUCY、MINSEO 五人使用 4 月 4 日公布的同批红色布景照片，未改人物、作品或私人评分的绑定。每张对照 SSQ 给 ETNews 的十图拼版及逐人署名原片索引。NANA 和 MINSEO 另有可定位的官方帖。[SSQ 公司供图](https://www.etnews.com/20240406000018) · [逐人来源、取景与原文件大小](../evidence/20261122-wooah-blush/official-and-crops.json)

站内观看页沿用日本官网字标、本地 Roboto Condensed Black 标题及 Noto Sans SC 中文。桌面并排看封面与作品分，手机将两者上下排列。成员在桌面分三列、常用手机宽度分两列、320 宽分一列。个人评分在对应照片正下方展开表现分、造型喜欢、记忆点和我的备注。[七幅 Figma 导出](../evidence/20261122-wooah-blush/figma-screens.webp) · [七幅画板与独立图层](../evidence/20261122-wooah-blush/figma.json)

Windows 与 WSL Ubuntu 分别通过 41/41 项定向测试，覆盖发布者原片、成员与版本绑定、49 种原生路由状态、旧书签返回和只读构建。Windows TypeScript 检查通过。主控在 Codex 自带浏览器使用真实页面组件与隔离资料，375、1425、305 px 三个实际正文宽度均看到了五人评分卡、一个可导航的作品链接并抵达独立舞台，均未报错。完整浏览明细超过本地接收器的 HTTP 请求头上限，回执只保留现场读到的三行。此次没有私人写入或视频播放测量；正式站验收由对应发布批次记录。[浏览器结果](../evidence/20261122-wooah-blush/local-browser.json)
