# 从成员档案打开同一个 MV

v239 的裴秀珉档案在《SO BAD》作品卡上显示第三方截图，打开 MV 后才看到 High Up 2020 年出道写真。本批让个人档案与作品详情按作品 ID、视频 ID、成员 ID 取得同一张发行照、图注及出处。点击照片可打开本人完整原图，卡上还可打开原作品图并追溯原出处。Hearts2Hearts 的《The Chase》原版、歌词版、表演版保留各自的作品与人物关系。原有评分和私人附件仍由原记录提供。[High Up 发行页](https://www.highup-ent.com/en/stayc/star-to-a-young-culture/) · [STELLA 官方预告](https://x.com/Hearts2Hearts/status/1890415999565869187)

核查 51 团，26 团的 89 组发行资料覆盖 206 个视频版本、1,303 个成员位置。按现任及历史成员核对后，28 团的成员至少有一个已登记位置，包含 MADEIN、SAY MY NAME 成员在原团的作品。16 个原生团页接入按本团成员裁剪的登记，NMIXX、KiiiKiii 原有的精确选图也复核通过。另有 10 团的原生入口展示作品链接或独立发行图集，访客从这些入口进入通用个人档案时也能看到同一组成员照。其余 23 团本次无对应位置。16 团按页传入的登记最大为 17,411 B，全量登记同样采用紧凑 JSON 时为 204,983 B。[51 团逐项](../evidence/20261122-member-profile-editions/coverage.json)

| 本人在成员档案中的作品卡 | 桌面组件 | 手机组件 | 本批双宽实点 |
| --- | --- | --- | --- |
| STAYC · 裴秀珉 SUMIN ·《SO BAD》 | [Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1516-1109) | [Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1516-1119) | 480 × 640 预览，1200 × 1680 发行原图，1920 × 1080 原作品图 |
| Hearts2Hearts · 金多绚 STELLA ·《The Chase》 | [Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1516-1678) | [Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1516-1689) | 480 × 640 预览，4096 × 2731 发行原图，2926 × 4096 原作品图 |

Figma 的四个可编辑组件使用与页面一致的两张 480 × 640 实际预览。以同一批成员在旧版档案卡和新版档案卡默认取用的本地文件比较，《SO BAD》六张从 1,137,749 B 降至 247,942 B，减少 78.2%。《The Chase》八张从 10,002,056 B 降至 249,666 B，减少 97.5%。数字为逐成员文件大小之和，首次点开原图时再读取该成员的大图。[两组文件对照](../evidence/20261122-member-profile-editions/coverage.json)

Codex 内置浏览器在隔离的真实 React 成员页和作品详情，按实际正文宽 375、1425 px 完成四次往返照片操作。四次均读到正确预览、两套出处及原图。两张灯箱分别关闭后的焦点均回到原按钮，点进 MV 后小图和出处与成员卡一致。每个视口横向溢出为 0。此次仅核成员和作品的图像路径；专项六个文件在 Windows 与 WSL 各 96/96，通过全体登记、跨团成员、无登记时原裁切、0 分和私人附件隔离的回归。正式站结果随本批发布另记。[本机双宽回执](../evidence/20261122-member-profile-editions/local-browser.json)
