# 全团资料补齐交付 · 2026-10-25

51团页面设计已全部获用户认可。本轮沿用这些已认可设计与共享手帐布局，继续补公开资料、图片、精确视频和时间轴，不宣称全团按官网重新设计。

[打开v4团体索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups) · [HURRICANE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=works&work=rec28ldfRTrEng&returnTo=%2Fartists%2Fbadvillain%3Fsection%3Dworks) · [BLUE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/madein/?section=works&release=madein-s-blue)

七团设计沿用已确认v3，其余44团沿用各自已确认版本；新增资料区承接现有字体与颜色。原官网参考及项目扩展差异见[七团参考表](seven-groups-redesign-review-20261025.md)和[全团来源记录](all-groups-audit-20261025.md)。

线上服务身份Chrome已验证40项手机/桌面布局和5条操作流程，51团索引正常；无应用写请求或页面JS错误。它不等同用户IAB会话或生产保存验证。

## 本轮解决

| 项目 | 已交付内容 | 证据与范围 |
|---|---|---|
| BADVILLAIN《HURRICANE》 | 用户确认正式MV绑定、高清原图、精确手帐入口 | `00tUzCOPI6g`；保留原评分/备注；读取展示补齐，未写生产存储 |
| MADEIN S《BLUE》 | 正版封面和可打开原图 | [Bugs](https://music.bugs.co.kr/album/4125263)，1200×1200原字节；MADEIN当前登记四发行封面齐全 |
| ifeye《Hazy (Daisy)》 | 3位具名参与者在作品/成员页互通 | [Genie MV幕后](https://www.genie.co.kr/magazine/subMain?ctid=1&mgz_seq=16054)；只列明确出现的三位，不推全员 |
| tripleS《Password》 | 8位分队成员恢复共享详情关联 | [Sony发行页](https://www.sonymusic.co.jp/artist/tripleS/discography/SECL-3170)；录音阵容，不冒称MV出镜证明 |
| ILLIT两首合作作品 | 2+2位官方署名艺人接入详情 | See U Tonight：YUNAH、MINJU；I Got Your Back韩语版：HANA JISOO、MOMOKA；不复制其他语言版关系 |
| i-dle时间轴 | 全员续约确认至2024年12月 | [CUBE日本官方稿](https://prtimes.jp/main/html/rd/p/000000059.000124555.html)；不补具体签约或生效日 |
| NewJeans时间轴 | Attention首支MV于2022-07-22公开 | [HYBE JAPAN官方稿](https://prtimes.jp/main/html/rd/p/000000148.000045862.html)；MV、音源、实体日期分开 |
| 旧测试夹具 | 修复6项基线已有的目录/并发测试失败 | 适配既有只读访问与canEdit；个人记录和权限断言保持 |

## 尚未解决或未验证

- 旧快照133项无个人评分关联：不能用公开名单生成个人评分行，也不能用本轮15条公开资料直接相减。历史Billlie ZAP/KATSEYE Touch的10条native关系仍待实时读回，不能重复新建。
- 14条旧hold中：2条本轮有新官方证据；4条已在现有页面以ready/报道/公告/计划形式展示；8条仍待核（AtHeart2、BEWAVE1、Geenius1、GENBLUE2、UDTT2）。[逐项证据与日期限制](evidence/20261025-data-completion/timeline-hold-research.md)。不是所有公告都证明实际执行。
- QWER日本官网目录范围有限；MADEIN四封面齐全不等于所有历史发行完整。
- 旧时间轴SSR套件仍8过44失败，冻结输入复核相同；需适配后来已认可的团页DOM。本轮77项专项/回归、正式类型/构建、70项真实浏览器布局和5流程通过，不能称全仓测试全过。
- 真实生产保存、全部视频完整播放、原生80%/125%缩放、用户IAB完整会话未验。Figma沿用上一轮112画板，本轮新增公开资料区和封面尚未同步。

审阅站保持owner-private、只读，正式主站v186未改；上线验证记录见[工作日志](worklogs/20261025-all-groups-data-completion.md)。

代码与交接已推送至 [draft PR #35](https://github.com/KAtOReNA7/idol/pull/35)。
