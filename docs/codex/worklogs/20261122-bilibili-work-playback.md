# 《BILLIONAIRE》和《Magnetic》的默认播放器

这两支 MV 从 B 站开始播放，按钮逐次切到同剪辑的 RUTUBE 转载、原 YouTube 视频，再回到 B 站。另 124 支已配置 RUTUBE 的作品可直接切到原 YouTube 视频。每次切换只挂载一个静音播放器，页面标明当前上传者和下一条来源。作品和评分继续使用原视频 ID。[逐项绑定与实播读数](../evidence/20261122-v211/playback-sources.json)

《BILLIONAIRE》沿用 pcyxjy 转载的第一分 P。v209 正式页静音实测从 3.693 秒推进到 11.032 秒，解码为 640 × 294。《Magnetic》选用 ILLIT 官方账号发布的第一分 P，CID 为 1480859605，时长与 HYBE 原片同为 189 秒。上线前在 Codex 内置浏览器的 B 站播放器中，静音进度从 5.449 秒推进到 24.567 秒，实际解码为 640 × 360。[《BILLIONAIRE》历史正式页读数](../evidence/20261122-v210/publication.json) · [《Magnetic》官方投稿](https://www.bilibili.com/video/BV12r421t7nu/?p=1&cid=1480859605) · [HYBE 原片](https://www.youtube.com/watch?v=Vk5-c_v4gMU)

Windows 类型检查和播放器、舞台关联的五个测试文件全部通过，共 39 项。逐项核对了 126 个已有同版来源、原视频和舞台绑定。另行运行的三团旧草稿测试有六项通过、四项仍失败，这四个用例已列在 v208 的失败清单。[专项记录](../evidence/20261122-v211/playback-sources.json) · [历史单测清单](../evidence/20261122-v208/tests.json)
