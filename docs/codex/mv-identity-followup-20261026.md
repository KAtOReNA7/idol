# 公开MV认人图补充报告（2026-10-26）

基线0801fc3，本文件为可整合增量；未改v8主审计、运行manifest、共享UI、评分、备注或成员作品关系。公开原图已保存，浏览器集成验证由主代理继续。

## 本轮已补

|团体|新增现有关系图片|覆盖作品|整合后本团仍缺现有关系图|
|---|---:|---:|---:|
|IZ*ONE|103|9|3|
|QWER|4|1|17|
|Geenius|5|5|5|

共112条新增绑定、112个原文件，20,350,347 bytes；没有替换旧图片或新增成员关系。主审计若仅整合本增量，认人图绑定从1137到1249、覆盖作品从205到218、覆盖团体从40到42；仍缺1579条已有关系图、387条作品未有公开认人图。133条无现有关系作品仍不能据此推定全员出演。

- IZ*ONE：《La Vie en Rose》《Violeta》《FIESTA》使用包含精确视频ID及成员图注的[DBKpop图库](https://dbkpop.com/mv/izone-fiesta/)；其余六首使用[具名成员MV章节](https://allaboutkpopgirlgroups.wordpress.com/tag/izone/)。每首在当前目录只有一个原版视频，但博客多数不嵌精确YouTube ID，证据登记为“唯一原版作品＋具名MV章节”，不冒称逐帧独立核验。[Panorama官方Melon专题](https://www.melon.com/musicstory/inform.htm?mstorySeq=10961)亦已看图，最终优先选用1920px具名MV截图以满足认人卡清晰度。
- QWER：四人来自[Melon《Discord》官方MV拍摄现场](https://www.melon.com/musicstory/inform.htm?mstorySeq=14253)，每张相邻文案明确成员姓名，专题同时列正式MV（Melon视频ID 50265866）。《MANITO》专题明确为封面/概念拍摄，不将它冒充《T.B.H》MV认人图。
- Geenius：五人来自各自[《I.L.Y》官方成员版MV](https://www.youtube.com/watch?v=oheqbYaOd3g)的原始1280×720封面。YouTube oEmbed标题分别明确Zoe、Yeyoung、Sion、Andamiro、Mika版本；现有关系与标题一致，图片是单人近景，不依靠脸猜身份。五个精确视频ID和完整元数据见JSON。

## 显示质量与验证

原候选联系表均已看图，选定112条后生成实际3:4展示联系表三页，检查并修正21处靠边构图，再次查看全部三页。所有新增展示矩形均为精确3:4、位于原图范围内；视频黑边仅通过展示矩形去除，不改原文件。逐条矩形与21条调整列表见JSON的identityImages和displayCropReview.adjustments。

112个发布原文件的SHA256/字节数全部核对，精确workId/memberId/videoId无重复且全部属于已有关系。原图柔焦、暗光及镜头本已截断的头顶仍是来源限制；大尺寸不等于面部细节均高清，不统一宣称高清。

## 本轮未解决

- IZ*ONE还缺3条：Sakura《Secret Story of the Swan》、Minju《Suki to Iwasetai》缺独立具名图注；Chaeyeon《Buenos Aires》未找到相应具名章节图。
- QWER还缺17条：本轮未找到其余精确MV版本可用的具名单人图。
- Hearts2Hearts《The Chase》八格保持原来的“清晰度待提升”。新Fandom图库403后未重复访问；Hatchuu说明含身份或拍摄场景猜测，未采用。
- AtHeart《Plot Twist》找到了[精确MV链接下的具名六格](https://kprofiles.com/atheart-who-is-who/)，但单格约520×520且大字姓名覆盖下方，3:4会截文字，六条保留pending、不计作合格新增、不发布该候选原图。《Butterfly Doors》没有已有成员关系，本轮不新增关系。
- Geenius《Voyage》五人仍缺：新找到的是具名概念照与未标成员位置的团体MV截图，均不推定为合格单人认人图。

主审计JSON、manifest与UI未修改；本增量尚未作线上浏览器验收。完整逐图来源、原URL、SHA、尺寸、精确tuple、裁切和未解决记录见同名JSON。
