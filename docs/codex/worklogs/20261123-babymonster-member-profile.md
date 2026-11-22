# BABYMONSTER 成员详情的姓名、原图与照片出处

在正式 v248 上，Codex 内置浏览器以 390 × 844 打开郑雅譞（AHYEON）的成员页，实际正文宽 375 px。未滚动时，姓名出现在距视口顶部 702.4 px 处，页面先展示 335 × 502 的本人肖像。照片已解码为 800 × 1200，当时页面没有「查看原图」或这张写真对应的 YG LIFE 文章入口。[同条件前像与来源](../evidence/20261123-babymonster-member-profile/figma-and-sources.json)

v250 新增一张 390 × 3107 的 AHYEON 手机全页稿。姓名和发行期在照片上方，左右留 20 px，肖像保持 2:3。照片下面有 44 px 高的「查看原图」和可展开的「照片出处」。设计中的 13 张相关作品卡可以返回她的档案，另列《MOON》《LIKE THAT》《BILLIONAIRE》三项公开作品资料。手机稿与既有的 1440 × 1993 桌面代表稿对应。这一对画板的主角均为 AHYEON。[手机全页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=1624-1124) · [既有桌面稿](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7/?node-id=87-533)

RUKA、PHARITA、ASA、AHYEON、RAMI、RORA、CHIQUITA 七人使用同一详情页实现。各自保留 YG 《BABYMONS7ER》同期概念照，点照片或文字均可打开本人原件，展开出处可看该成员的发布时间和原文。七篇 YG LIFE 原文逐页返回 HTTP 200，标题均包含相应成员的艺名。AHYEON 的文章发布于 2024 年 3 月 15 日。[AHYEON 首发文章](https://yg-life.com/archives/187401?lang=en) · [YG 团体官网](https://www.ygfamily.com/en/artists/babymonster/profile) · [七人文章和原图](../evidence/20261123-babymonster-member-profile/figma-and-sources.json)

| 同一快照下的七个正式路由 | 修改前 | 修改后 |
| --- | ---: | ---: |
| 姓名排在照片前 | 0/7 | 7/7 |
| 肖像和独立文字均提供本人原图入口 | 0/7 | 7/7 |
| 照片旁能打开本人 YG LIFE 原文 | 0/7 | 7/7 |

逐人对照成员 ID、原件、关联作品及顺序、原评分模块与名录返回入口。Windows 的七人详情、既有造型图、缺图回退及早于脚本的原图首击等 13 项定向测试通过，类型检查通过。生产构建、全套验收和发布后实测在当批发布记录中汇总。[七人定向测试](../../../apps/idol-site/tests/babymonster-member-profile.test.cjs) · [完整读数与画板坐标](../evidence/20261123-babymonster-member-profile/figma-and-sources.json)
