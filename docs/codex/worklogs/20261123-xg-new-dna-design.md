# XG《NEW DNA》发行详情画稿

项目 Figma 的新画稿列出 XG 首张迷你专辑的六首曲目、2023 年 9 月 27 日发行日期与 X 版官方包装。紫色来自发行期 X 版的盒面，与其他团体的专辑页保持各自的视觉。手机先显示专辑名和封面，桌面封面与曲目并列。两幅画稿的可编辑文字、图像和四个同版 MV 入口已读取上下文并查看截图。[桌面稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1646-2013) · [手机稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1646-2047)

XGALX 官网列出的正式曲序为 HESONOO、X-GENE、GRL GVNG、TGIF、NEW DANCE、PUPPET SHOW。后四首各连到已收录的原版 MV。NEW DANCE 使用 2023 年 8 月 23 日版本，10 月 6 日的另一个版本独立保留。包装照片沿用项目中 XGALX 商店的 640 × 641 已核原件。Figma 使用同像素的 PNG，站内继续使用既有的 WebP 资产。[官方发行目录](https://xgalx.com/en/xg/discography/) · [发行专题](https://xg-newdna.com/en/) · [X 版包装出处](https://shop.xgalx.com/products/nfcc-00005)

v252 的正式 XG 唱片卡打开 XGALX 发行目录。在 v253 开发版，从同一张卡可直接打开本站专辑详情，读到的曲目从 0/6 增至 6/6，从曲目进入准确版本 MV 的入口由 0/4 增至 4/4。正式目录组件渲染的 25 张团体、个人和演唱会影像卡均已核对，其余 24 张保留各自原有入口。《NEW DANCE》的两种剪辑在作品搜索中各自可见。

标题复用 49,256 B 的 Space Grotesk。正文两种字重沿用站内授权的 Noto Sans CJK，各取界面使用的 62 个码位，两份 WOFF2 合计 26,704 B。X 版原封面为 21,198 B。XGALX 发行目录和英文专题在本次 HTTP 读取中均返回 200，包装商店对自动读取返回 429。[字体、官方版本与逐项核对](../evidence/20261123-v253/xg-new-dna-and-track-return.json)

v252 正式复验发现，手机和桌面从《Live My Life》返回都能打开《Armageddon》，但原曲目没有获得键盘焦点。两团七条原版 MV 的发行入口现已在首份 HTML 中标记具体曲目。鼠标点击或按 Enter 打开后，从作品返回或按浏览器后退可定位原曲目。直接分享作品时，返回按钮也携带具体曲目。保存未确认或用户取消离开时，沿用原有保护。[v252 双宽正式诊断](20261123-v252-release.md)

本机类型检查通过。两张发行详情、导航、字体及作品卡的七套定向测试共 79/79 通过，包含七条链接各两种首次激活、浏览器恢复页面和来源缺失时的返回。正式站两团从作品返回曲目 8/8 成功，从专辑返回原封面 4/4 成功。[正式读数](../evidence/20261123-v253/formal-album-journeys.json)[本批本机验证](../evidence/20261123-v253/xg-new-dna-and-track-return.json)
