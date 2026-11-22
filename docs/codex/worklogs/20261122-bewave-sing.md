# BEWAVE《SING !》首发表演版、Live Clip 与六人评分

4 月 17 日的首发视频是 BEWAVE 官方标题中的 Performance Video。4 月 22 日的 Live Clip 是另一支录制，使用自己的封面、日期和舞台整体评分。团内作品目录的每张影像卡现在只有一个站内入口。可匹配的舞台直接进入对应版本，旧书签继续可用。[首发表演版](https://www.youtube.com/watch?v=BbcxmtNaesk) · [Live Clip](https://www.youtube.com/watch?v=j1a4xi__JgE) · [出道 EP 发行页](https://music.bugs.co.kr/album/4100178)

六位成员使用 GOLDDUST 提供的 4 月首组概念照，比对了 Genie 出道特辑、具名社交发布图与同期新闻。五张采用同图中更大的社交原片，高云使用 Genie 的 840 × 1258 原图。卡片统一为 480 × 640，仍可打开完整照片、原有的六月具名采访照和两处出处。页面继续标注「公开发行阵容」，六人沿用原成员 ID。相同六张卡的首屏素材总量由 566,885 B 降至 176,694 B，减少 390,191 B，约 68.8%。[首发特辑](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=14192) · [出道概念照原报道](https://sports.khan.co.kr/article/202404092135003) · [原采访](https://www.edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01492406638919424) · [逐图来源、取景和字节](../evidence/20261122-bewave-sing/sources-and-crops.json)

七幅新稿涵盖 1440、390、320 px 的首发表演版和两宽的 Live Clip、杰娜评分展开。页头沿用 b.stage 蓝银团标与出道封套水纹，英文作品标题使用 Instrument Serif。每张人物照片后紧接本人评分，展开显示成员姓名、表现分、造型分和保存按钮。十月另一首作品的 Dance Performance 示意稿继续作为该场的历史资料。[Figma 首发表演版](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1549-1229) · [Figma Live Clip](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1549-1438) · [Figma 手机评分](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1549-1562) · [七幅导出](../evidence/20261122-bewave-sing/figma-screens.webp) · [画板、图层与尺寸](../evidence/20261122-bewave-sing/figma.json)

| 框架 / 实际正文宽 | 六人列数 | 对应版本与交互 |
| --- | ---: | --- |
| 1440 / 1425 px | 3 | 6 个本人按钮均高 44 px，图下间距 8 px，展开后各自获得输入焦点 |
| 390 / 375 px | 2 | 同上。隔离 SQLite 保存杰娜表现 0，重新读取为 0、造型分为空、版本 1 |
| 320 / 305 px | 1 | 同上。完整编辑表单与页面均无横向溢出 |

三个宽度都解码了 1280 × 720 的首发封面、640 × 360 的独立舞台封面和六张 480 × 640 的本地卡片。旧采访原图成功打开，切换舞台后只展示舞台整体评分。返回目录恢复搜索和所选卡焦点，旧舞台书签的主入口亦命中 Live Clip。本次浏览记录覆盖图片和评分交互，视频解码与正式站发布另按版本回执。[内置浏览器逐人数据](../evidence/20261122-bewave-sing/local-browser.json)

源码 `b2f02a67`。Windows 定向 63 项首次通过 62，另 1 项指出历史素材还原遗漏了 VVUP 四张已交付卡。补齐四个精确路径后，同一历史守卫组 4/4 通过。WSL 对该源码重新运行同组测试，63/63 通过，包含六个作品的 D1 断线保存核对。Windows TypeScript 检查通过。完整发布测试及正式站验收随 v243 单独登记。
