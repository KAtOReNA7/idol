# 作品播放器与 B 站最高画质

正式工程的 126 支同版作品从 RUTUBE 开始，可切换到目录中的 YouTube 原片。页面每次只挂载一个播放器，标明当前署名和下一个来源。RUTUBE 请求 1080 档，界面显示来源名称。4 条 B 站舞台保留原站入口，用户可在 B 站登录并选择账号可用的最高画质。链接保留 BV、CID 和分 P，其中一个节目片段附上 18:05 的起点与 21:13 的终点提示。[播放来源、分 P 与历史实测](../evidence/20261122-v211/playback-sources.json)

在 Codex 内置浏览器暂停《Magnetic》后，B 站菜单显示「4K 大会员」「1080P 高清（登录即享）」和「自动 360P」。官方点播外链文档提供静音、自动播放、起点和分 P 参数。平台尚未公开供本站锁定最高画质、核对解码尺寸及阻止自动降档的接口。第三方 iframe 能否使用登录态还取决于浏览器的存储权限。本次账户登录后的实际最高档仍待本人验收。[B 站官方外链文档](https://player.bilibili.com/) · [跨站存储访问](https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API)

此前静音实测，《BILLIONAIRE》从 3.693 播到 11.032 秒，解码 640 × 294。《Magnetic》《Who is she》《SHEESH》分别从 5.449 播到 24.567 秒、5.967 播到 51.955 秒、4.730 播到 50.716 秒，均解码 640 × 360。这四条 B 站来源均已从站内播放列表排除。后两曲的官方投稿时长与原片一致，分别为 162 秒和 186 秒，各自三个相隔的画面也与 YouTube 原图匹配。已有历史回执另记各曲 RUTUBE 成功播放时的实际分辨率与进度。[同版逐帧数据](../evidence/20261122-v211/playback-sources.json) · [以往 RUTUBE 实测](../evidence/20261122-work-player-retries-v210/verified.json)

Windows 类型检查通过。八个测试文件的 65 项用例通过，覆盖全部 126 对作品来源、四个 B 站舞台原站地址、片段范围、封面、评分绑定、单播放器切换，以及 izna 的原始候选逐字节校验。[测试命令和结果](../evidence/20261122-v211/playback-sources.json)
