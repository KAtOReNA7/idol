# v248 照片出处与原图入口

八团的首页、成员名录或个人档案出现了重复图注。此次在 Figma 为十个场景制作了收起与展开两种状态，各有 1440 px 桌面稿和 390 px 手机稿。五个个人档案示例分别代表 ODD YOUTH 5 人、Geenius 5 人、TRACER 4 人、HITGS 5 人和 AtHeart 7 人。[改前逐页记录](../evidence/20261122-v248/photo-caption-before.json) · [逐稿核验](../evidence/20261122-v248/photo-source-figma.json)

访客可直接看照片，点「照片出处」后再读发布方与拍摄时期，或前往来源原文。ADYA 和 W!TCHX 的名录沿用已有的照片来源名称。点成员卡仍进入本人档案。八个单张照片的场景均可单独打开原图。TRACER 的历史照片标识和 AtHeart 的出生日期放在首显，HITGS 将 Kprofiles 的转载肖像与维基百科的人物资料分开。

五团成员页已接入同一个出处控件。Geenius 芮英的词作与 OST、TRACER 的 SOEUN／SOWON 姓名对照继续保留。AtHeart 七人的默认图用已有的 800 × 800 WebP，点开本人原图可看 1080 × 1080 PNG。[成员页实现](https://github.com/KAtOReNA7/idol/commit/34925e92)

| 团体 | 场景 | 展开入口 | Figma | 照片出处 |
| --- | --- | --- | --- | --- |
| RESCENE | 首页团照 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1603-1162) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1603-1126) | [THE MUZE](https://themuze.kr/rescene) |
| ODD YOUTH | 萨默的成员页 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10476) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10437) | [TOP MEDIA](https://www.itopgroup.com/bbs/page.php?hid=ODDYOUTH_profile) |
| Geenius | 芮英的成员页 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-12307) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-12268) | [HOMe](https://www.geeniushome.com/geenius) |
| TRACER | 希真的成员页 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18040) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18001) | [GLEAMMEDIA](https://www.gleammedia.co.kr/artist) |
| HITGS | 书赈的成员页 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18308) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18267) | [Kprofiles](https://kprofiles.com/project-h-2025-members-profile/) |
| AtHeart | 米奇的成员页 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18475) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-18436) | [AtHeart 日本官网](https://atheart.jp/contents/menu/176621) |
| ADYA | 首页团照 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-1616) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-1580) | [CJ ENM Japan](https://prtimes.jp/main/html/rd/p/000001548.000003711.html) |
| ADYA | 成员名录 | 2023 年成员照片来源 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-1728) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-1646) | [CBS NoCut News／Daum](https://v.daum.net/v/KURjomI9oP) |
| W!TCHX | 首页团照 | 照片出处 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10261) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10225) | [Bugs](https://music.bugs.co.kr/artist/20222498) |
| W!TCHX | 成员名录与官网档案卡 | 成员照片来源 | [手机展开](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10371) · [桌面收起](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1604-10291) | [IN MEDIA A&D](https://kpopmedia.co.kr/#artists) |

40 张 Figma 稿均已读回。20 个收起状态只显示入口，20 个展开状态显示发布方及外链。40 个开关均高 44 px，均处于画框内。独立原图入口覆盖 32 处单张照片，名录覆盖 40 处成员卡。各场景的手机收起和桌面展开另取了 20 份含截图的实现上下文。十个发布方页面均实际返回 HTTP 200，访问结果、页面标题、每张画稿的尺寸与节点可在核验文件中查到。[核验明细](../evidence/20261122-v248/photo-source-figma.json)
