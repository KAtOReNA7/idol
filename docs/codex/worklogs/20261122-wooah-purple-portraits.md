# WOOAH《Purple》发行期成员照

2021 年 5 月 27 日发行的《WISH》以《Purple》为主打。Genie 当天的发行专题标明了官方照片所在的图组。NANA、WOOYEON、SORA、LUCY、MINSEO 各有一张紫底黄纸布景的个人海报，每张底部均印有本人的英文姓名。作品保留韩文原版 MV 及原有五名成员的评分关系。[Genie 发行专题](https://www.genie.co.kr/magazine/subMain?mgz_seq=10231) · [逐人出处与原图](../evidence/20261122-member-release-portraits/wooah-purple.json)

五张完整照片均为 840 × 1260。每张均与同期具名报道中的照片核对。把五位成员的两套画面全部缩到 64 × 96 对照，同名同构图每通道平均像素差为 0.88–0.94，下一张最接近的不同画面均超过 28，范围为 0–255。实际 3:4 裁切保留了头顶、眼睛和肩部。作品页以 480 × 640 的预览呈现，点开可看见完整海报和原片上的姓名。[选图数据](../../../apps/idol-site/data/mv-recognition-editions.json) · [项目选图决定](../identity-photo-selection-policy-20261027.md)

| 成员 | 原默认卡图字节 | 新默认卡图字节 |
|---|---:|---:|
| NANA | 31,140 | 30,084 |
| WOOYEON | 38,600 | 22,862 |
| SORA | 35,588 | 26,348 |
| LUCY | 23,348 | 30,652 |
| MINSEO | 15,778 | 32,448 |
| 合计 | 144,454 | 142,394 |

五张各计算一次，首显文件合计减少 2,060 字节（1.43%）。五份完整照片合计 578,350 字节，由 Genie 在打开原图时提供。本地用正式站作为来源头访问五个图片地址，均返回 HTTP 200 并成功解码。[尺寸、字节与 HTTP 结果](../evidence/20261122-member-release-portraits/wooah-purple.json)

按作品、视频和成员三个 ID 对照，前后同有 1,290 个选图绑定，其中只有本曲的五个成员位置换图。原台账的 194 个跨期位置已有 59 个核过本人原件和裁切，实际仍采用跨期照片的 135 个位置与台账逐项一致。WOOAH 由 29 个降为 24 个。其余待核位置中，全项目有 113 个可从同次发行图集接续，22 个仍待补具名同期依据。[194 项台账](../evidence/20261122-member-release-portraits/remaining-194.csv)

Windows 定向运行选图、私人评分与 WOOAH 原生页面测试，共 32 项通过。v230 正式站在 375 px 和 1265 px 正文逐人实点新旧原图，20 次关闭均回到各自入口，10 张卡均能在本人照片下展开双项评分。手机的正式图片响应与上表逐张一致。[选图专项](../../../apps/idol-site/tests/mv-recognition-editions.test.cjs) · [正式双宽验收](20261122-v230-release.md) · [复测脚本](../qa/everglow-slay-portraits.mjs)
