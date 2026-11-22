# 五团成员照片出处与 AtHeart 首图

ODD YOUTH、Geenius、TRACER、HITGS 和 AtHeart 共 26 位成员。打开资料先看到本人和已有作品、履历等信息。在成员身份区域点「照片出处」，可以看到照片发布方、拍摄日期的已知情况及原始网页。展开控件至少高 44 px。点肖像或「查看原图」仍可打开大图。[逐人实际页面](../evidence/20261122-v248/member-photo-sources-local.json) · [手机、桌面 Figma 及原型](20261122-v248-photo-source-design.md)

| 团体 | 成员详情 | 访客仍可看到或查到的资料 |
| --- | ---: | --- |
| ODD YOUTH | 5 | 简介已去掉每人重复的「官方资料页以某某具名列示」和「保留原始资料图与已有作品记录」。需要核对姓名或肖像时，可从出处打开 TOP MEDIA 名册。[TOP MEDIA 名册](https://www.itopgroup.com/bbs/page.php?hid=ODDYOUTH_profile) |
| Geenius | 5 | 五人参与《Voyage》韩语歌词创作的资料、芮英演唱的 OST 均留在人物介绍中。肖像对应 HOMe 官网艺人页。[HOMe 艺人页](https://www.geeniushome.com/geenius) |
| TRACER | 4 | 照片旁标「官网历史资料照」，四人与《365》的参与关系保留。昭垠的照片署名 SOEUN，历史介绍卡署名 SOWON，两张都能打开。[GLEAMMEDIA 艺人页](https://www.gleammedia.co.kr/artist) |
| HITGS | 5 | 本人照片的出处标为 Kprofiles 具名转载。需要维基百科佐证的四人另在页末列出成员资料，五人生日和已有介绍保留。[具名转载页](https://kprofiles.com/project-h-2025-members-profile/) |
| AtHeart | 7 | 七位成员各自的生日、艺名、中文展示名、日本官网出处及原 PNG 都可用。[日本官网 PROFILE](https://atheart.jp/contents/menu/176621) |

同一公开目录输入对 51 团首页、成员名录、作品入口和已登记的成员资料渲染 491 页。v247 的 29 页命中指定的冗余首显文案，其中 26 个是上述成员详情，三个是 RESCENE、ADYA 和 W!TCHX 的首页。v248 在相同 491 页中命中 0 页。此项计算可见文字、图片替代文字与无障碍名称，只读取折叠来源的标题。[v247 逐团基线](../evidence/20261122-v248/photo-caption-before.json) · [v248 同条件结果](../evidence/20261122-v248/photo-caption-after.json)

## 七张单人成员首图

每份 AtHeart 成员详情首显改用仓库已收录的同人 WebP。七张均从 1080 × 1080 PNG 切换到 800 × 800 WebP，原图链接仍指向各自的 1080 × 1080 PNG。将旧原图以 Lanczos 缩到同尺寸后逐像素比对，七张的 RGB 通道平均绝对差介于 2.28 至 2.96，满量程为 255。[逐人路径、像素与字节](../evidence/20261122-v248/member-photo-sources-local.json)

| 成员 | 旧首图（字节） | 新首图（字节） | 文件减小 |
| --- | ---: | ---: | ---: |
| Michi | 1,936,793 | 138,040 | 92.87% |
| Arin | 1,889,661 | 85,244 | 95.49% |
| Katelyn | 2,058,936 | 132,626 | 93.56% |
| Bome | 1,897,630 | 86,086 | 95.46% |
| Seohyeon | 1,998,943 | 74,718 | 96.26% |
| Aurora | 2,050,078 | 123,514 | 93.98% |
| Nahyun | 1,789,685 | 108,292 | 93.95% |
| 七个详情合计 | 13,621,726 | 748,520 | 94.50% |

此表统计分别访问七个成员详情时要显示的本地文件大小，共少 12,873,206 字节。正式 v247 的 Codex 内置浏览器在 375 px 正文打开 Michi，实际响应体为 1,936,793 字节，解码为 1080 × 1080。[Michi 正式改前读数](../evidence/20261122-v248/michi-formal-before.json)

## 本机验证

Windows 上以真实团页组件渲染全部 26 位成员，逐人核对照片、稳定身份、原图入口和默认收起的具名发布页。另验 HITGS 的图源与人物资料链接、TRACER 的历史身份与双署名、两团的生日和 AtHeart 七张原图的准确网址。六个成员、素材及路由测试文件 82/82 通过，图片宿主及作品详情两个测试文件 202/202 通过，TypeScript 检查通过。[执行范围与逐人结果](../evidence/20261122-v248/member-photo-sources-local.json)
