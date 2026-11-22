# AtHeart《3!4!》和 W!TCHX《BLALA》的作品与评分

原目录中，两张团页卡片没有对应的原生作品。直接打开旧分享地址时只能看到介绍。新增的资料把 AtHeart 正式 MV 与《3!4!》的 Moving、Fix 两支舞蹈版分开，也把 W!TCHX 官方歌词影像与 Moving Mix 和电视表演分开。精确版本现使用本地原视频封面。

| 团体与版本 | 原生作品 | 来源与成员处理 |
| --- | --- | --- |
| AtHeart《3!4!》Official MV | `recNativeMvb6bSGu1YdRM` · `b6bSGu1YdRM` | 发行方在 2026-08-19 的稿件中逐名列出七人。七张日本官网资料照分别对应各自成员，800 × 800 的预览可打开 1080 × 1080 原图。页内标明发行阵容和官网资料照。[发行方](https://prtimes.jp/main/html/rd/p/000000013.000184970.html) · [日本官网成员页](https://atheart.jp/contents/menu/176621) · [原 MV](https://www.youtube.com/watch?v=b6bSGu1YdRM) |
| W!TCHX《BLALA》Official Lyric Video | `recNativeMvDYigxyW8Oiw` · `DYigxyW8Oiw` | 发布者将该片标为歌词版。官方视频三个不同时间点的预览均为歌词及火焰图案。全片逐人出镜资料待核。所有者可在确认某位成员后从五人名册选择本人，在照片下记录。公司资料可核 2024-11-06 的发片日期，原视频上传日继续留空。[原视频](https://www.youtube.com/watch?v=DYigxyW8Oiw) · [公司](https://kpopmedia.co.kr/#artists) · [发行页](https://music.bugs.co.kr/album/20681889) |

原生 owner 可在本站对 `/api/manage/works/reviewed` 发起 GET 预览。POST 接受同源请求和 UUID 格式的 `Idempotency-Key`，由服务器使用固定的两条资料。仅补缺失作品及各自团体的反向关系。遇到相同视频已有其他 ID、反向关系不符或目录代际变化，会停止写入并提示核对。旧目录和旧分享地址继续按实际有无记录显示相应入口。

Windows 与 WSL 分别通过这批覆盖目录、读回、个人评分及真实 D1 的四个测试文件，共 96 项。以同一隔离目录比较，能写入并刷新读回 MV 评分的指定作品从 0/2 到 2/2。AtHeart 能在本人照片下直接评分的发行成员从 0/7 到 7/7。测试保留同名另一剪辑的 7 分、验证独立作品分 0、成员表现分 0 和造型分 8.5、重试后不重复，并核对只有所有者能写及导出记录与保存日志。测试只用隔离数据。

站内高清播放仍须单列。Codex 内置浏览器在两支普通 YouTube iframe 上没有解码。隐私增强域对 AtHeart 提示需要前往 YouTube，对《BLALA》静音点击后停在零秒。AtHeart 官方 B 站单 P 为 `BV1yDb66aEGg`、CID `41017018633`、278 秒。已登录的最高菜单档为 4K，选档打开了 B 站原页，本站仍在零秒、640 × 360。三条线路均未取得独立码率。公开搜索另见同名舞蹈、游戏、电视剧预告、节目表演和双语字幕版，均不作为这两支剪辑的合格替代。正式环境的应用版本、实际导入及正式复验由相应发布回执记录。[官方 B 站投稿](https://www.bilibili.com/video/BV1yDb66aEGg)
