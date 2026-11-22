# AtHeart 与 W!TCHX 旧作品链接

从团页打开收藏过的《3!4!》或《BLALA》歌词影像链接时，应用会定位到同一剪辑的站内播放与评分页。若浏览器拦下自动导航，旧页仍显示作品名和「播放与评分」链接。访客可点击或用键盘打开，返回时保留团页的 MV 筛选及搜索词。

| 作品 | 桌面 1440 | 手机 390 |
| --- | --- | --- |
| AtHeart《3!4!》 | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1553) | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1560) |
| W!TCHX《BLALA》官方歌词影像 | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1570) | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1577) |

四幅画板均已在 Figma 渲染核对。作品名沿用各团标题字体，手机按钮至少 44 px 高。Windows 在两个实际团页渲染了历史链接，分别核对原生作品 ID 和筛选返回地址。组件回归覆盖自动跳转成功及浏览器抛出 SecurityError 时保留原链接，两条通过。另三份测试合计 30/30 通过，包含两团的浏览、打包和成员评分回归。[入口回归](../../../apps/idol-site/tests/editorial-work-handoff.test.cjs)

此次子任务的浏览器入口只列出 Chrome。已将可在 Codex 内置浏览器读取尺寸的手机及桌面本地页面交给发布主控，实际像素及正式站结果由发布批次记录。
