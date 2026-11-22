# KiiiKiii《UNCUT GEM》出道官网与成员照

首页采用 STARSHIP 于 2025 年 3 月推出的 KiiiKiii 官网字标、五人团照和《I DO ME》果酱插画。官网当时以浅灰为底、蓝色标明操作，拉丁文字使用 Inter。团照可点开 1350 × 1800 的原图。原有日本官方横幅可从团体信息打开。作品入口先展示 MV，再展示专辑。[出道官网存档](https://web.archive.org/web/20250326113641/https://kiiikiii.kr/) · [来源、素材尺寸和八张画稿](../evidence/20261122-kiiikiii-uncut-gem/official-and-design.json)

团体名册继续使用出道时的白衣肖像。《I DO ME》MV 中 JIYU、LEESOL、SUI、HAUM 和 KYA 各使用同期官网 Staff 页中的具名成员照。预览均为 480 × 640，点图可查看官网原件和原作品图。首支 MV、2 月 24 日数字发行与 3 月 24 日 EP 发售分别保留了对应日期。舞台页展示 2 月 27 日 1theK 的同版封面，使用已有的舞台评分。[官网成员图页](https://web.archive.org/web/20250326113641/https://kiiikiii.kr/staff.html) · [桌面 Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=211-1182) · [手机 Figma](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=211-1320)

在本机隔离预览的 Codex 自带浏览器内，正文宽 375 和 1425 像素时均从团页打开原图、关闭回焦、进入 JIYU、返回并进入《I DO ME》。两档分别解码了全部五张成员照及五张 1350 × 1800 原件，切换到舞台显示正确封面。两档宽度均无横向溢出。作品页的计算背景均为 `rgb(236, 236, 236)`，操作色均为 `#203992`。访客看到的每张成员卡都有表现、造型两项。隔离库为这次复核准备了五个空分关联，正式私人记录沿用原值。[双宽逐人读数](../evidence/20261122-kiiikiii-uncut-gem/local-two-widths.json) · [实页色值与评分项数](../evidence/20261122-kiiikiii-uncut-gem/local-work-palette.json)

以相同本地文件输入计算，首页首显团照由 286,616 降至 74,474 字节。计入新字标与果酱图，首显三项合计 110,339 字节，减少 61.50%。同一支 MV 的五张默认成员照合计由 2,851,496 降至 193,042 字节，减少 93.23%。完整原图按需加载。文件大小仅衡量图片传输量，页面访问耗时和正式站操作另见发布实测。

类型检查通过。KiiiKiii 与成员照片相关专项首次 59/59 通过。加入《I DO ME》的五组作品、视频和成员精确绑定回归并更新作品页色值后，核心两组测试 44/44 通过。[逐人回归](../../../apps/idol-site/tests/mv-recognition-editions.test.cjs) · [正常入口浏览脚本](../qa/kiiikiii-debut.mjs)

首轮双平台回归发现，团页首访会引入全站成员照清单。现在由团页入口只传这次发行的五组绑定，作品详情和团员详情共用同一个精确匹配函数。相同 esbuild、压缩设置及客户端入口下，gzip 脚本由 449,814 减为 421,052 字节，减少 28,762 字节。两套矩阵的 310 项均通过，涵盖 51 团的图像和时间轴。额外逐一渲染五个成员地址，每位成员都显示本人的同期图及旧作品图入口。[同一客户端入口的构建测量](../evidence/20261122-kiiikiii-uncut-gem/client-entry.json)
