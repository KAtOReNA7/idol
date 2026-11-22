# AtHeart 与 W!TCHX 旧作品链接

从团页打开收藏过的《3!4!》或《BLALA》歌词影像链接时，应用会定位到同一剪辑的站内播放与评分页。若浏览器拦下自动导航，旧页仍显示作品名和「播放与评分」链接。访客可点击或用键盘打开，返回时保留团页的 MV 筛选及搜索词。

| 作品 | 桌面 1440 | 手机 390 |
| --- | --- | --- |
| AtHeart《3!4!》 | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1553) | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1560) |
| W!TCHX《BLALA》官方歌词影像 | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1570) | [设计稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1473-1577) |

四幅画板均已在 Figma 渲染核对。作品名沿用各团标题字体，手机按钮至少 44 px 高。Windows 在两个实际团页渲染了历史链接，分别核对原生作品 ID 和筛选返回地址。组件回归覆盖自动跳转成功及浏览器抛出 SecurityError 时保留原链接，两条通过。另三份测试合计 30/30 通过，包含两团的浏览、打包和成员评分回归。[入口回归](../../../apps/idol-site/tests/editorial-work-handoff.test.cjs)

Codex 内置浏览器用实际团页组件渲染了四种布局。AtHeart 手机的纵向滚动条曾把左侧留白压到 8.33 px，改按正文宽度计算后为 16 px。AtHeart 正文实际宽 375 和 1425 px，W!TCHX 为 390 和 1440 px。两团手机标题均为 22 px，桌面 28 px，四个入口均为 44 px 高，返回地址均保留真实团体和 MV 搜索。正式站结果随发布批次登记。[内置浏览器尺寸及链接](../evidence/20261122-editorial-work-handoff/local-fallbacks.json)

发布检查另有一条旧测试按已经移除的状态段落查找链接。改为按作品全名及「播放与评分」查找后，路径测试两团仍能识别准确剪辑、拒绝错误来源、返回原筛选。Windows 的作品目录与手动入口两份回归 24/24 通过。
