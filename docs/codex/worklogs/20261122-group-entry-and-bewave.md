# 51 团目录、首页简介与 BEWAVE 出道页

## 找团与认识成员

- 改前的索引有 48 张卡片展示公司，三张退回到代际，21 张会额外显示私人均分。改后 51 张卡片都只在团名下展示公司，首页前五张沿用同一规则。LOONA、Rocket Punch 和 Weeekly 以「历史」标明此前所属公司，搜索和公司筛选使用同一写法。公司有更新记录时取新记录。[LOONA 合作发行方](https://www.universal-music.co.jp/loona/news/2022-07-25-2/) · [Rocket Punch 经纪公司公告](https://weverse.io/rocketpunch/notice/24507?hl=ko) · [Weeekly 公开出处](../../../apps/idol-site/data/weeekly-timeline-public.json)
- 51 团首页均有直接可读的团体介绍。保留已经有事实介绍的首屏，缺资料处补写出道作品、时期及艺人资料，来源放在资料区。Candy Shop、ODD YOUTH、ADYA、W!TCHX 和 SPIA 的事实介绍放在原有宣传口号的位置。VCHA、HITGS 和 AtHeart 删去重复页脚口号。照片拍摄年份、来源与中文姓名转写可以从名册展开查看。[简介与出处](../../../apps/idol-site/data/artist-home-introductions.json)
- 作品成绩卡保留数值、累计或单日／单周范围。精确日期、周编号与来源可以在紧邻的说明中展开。UDTT 在图片暂不可用时也能阅读同一份简介、点开当前团已经核实的作品并重试。

## BEWAVE

本轮采用 2024 年 4 月首张专辑《BE;WAVE》的六人草地概念照、艺人平台的蓝银色铬面字标、Bugs 发行封面上的浅绿色水纹。首页标明概念照拍摄宣传期和刊载出处，点图打开原件。旧后台合照退出首页。成员 2024 年采访照的出处移入可展开说明。三个 Figma 画板与实现共用同源图片。[b.stage 艺人平台](https://bewave.bstage.in) · [iMBC 刊载的 GOLDDUST 概念照](https://enews.imbc.com/News/RetrieveNewsInfo/414368) · [Bugs 首张专辑](https://music.bugs.co.kr/album/4100178) · [桌面设计](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1405-1110) · [390 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1405-1124) · [320 宽](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1405-1137)

原首屏照片 195,846 字节，新首屏照片 113,498 字节，减少 42.0%。独立字标和水纹另占 115,394 与 65,926 字节。三幅图合计 294,818 字节，此为文件大小，未测量整个页面的传输时长。

## 验证范围

Windows 定向测试 40 项通过，包含 51 个真实首页渲染器、目录的三种评分输入、历史公司筛选、UDTT 的五类加载失败与重试、图像来源守卫、统计周期回归。内置浏览器可执行目录和逐团介绍脚本。测试库的 UDTT 素材接口因快照不同返回 409，正式受限图片仍由原有来源范围控制；该状态用于验收公开资料降级页。[逐团浏览器脚本](../qa/group-entry-content.mjs) · [服务器渲染回归](../../../apps/idol-site/tests/group-entry-content.test.cjs)
