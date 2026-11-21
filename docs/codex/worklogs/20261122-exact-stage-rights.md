# 四场电视舞台的站内高清来源

2026-11-22。正式页保留原片、原始分 P / CID、节目日期、音乐版本和已有关联。使用已登录 B 站账号在《Magnetic》选档时，播放器打开了 B 站页面，本站嵌入停在 0 秒、640 × 360。正式 v213 逐场读回，四个舞台页面均可打开原片出处，均显示暂无站内高清片源。[B 站选档实测](../evidence/20261122-v212/bilibili-quality.json) · [四条精确绑定及正式页面](../evidence/20261122-v213/formal-exclusive-stages.json)

| 作品及所需的表演 | 已找到的节目方渠道 |
|---|---|
| IVE《CRUSH》，with MUSIC，2024-09-14，原视频 P2 | 日本电视台提供素材申请指南；当场可供本站嵌入的完整演出尚待取得。[日本电视台](https://www.ntv.co.jp/sozaiteikyo/) |
| tripleS《Password》，PLAYLIST，2025-11-26 | TBS 的素材渠道面向机构，音乐表演另涉权利人许可。[TBS](https://www.tbs.co.jp/tbs-sozai-teikyou/) |
| STAYC《Teddy Bear》日版，Premium MelodiX!，原节目 18:05–21:13 | 东京电视台 MEDIANET 提供节目授权业务的咨询入口。[TV TOKYO MEDIANET](https://www.medianet.co.jp/contact/) |
| IVE《ELEVEN》日版，MUSIC STATION，2022-10-14 | 朝日电视台提供节目使用说明与咨询入口。[朝日电视台](https://www.tv-asahi.co.jp/contact/faq/) |

## B 站开放平台与合作授权

B 站开放平台的公开视频管理接口支持稿件发布、删除和查询。账号授权、授权用户的数据统计、直播及移动端登录 SDK 也各有文档。外链播放器可指定 BV、CID 和起播时间，同时传入 `cid` 和 `p` 时以 `cid` 为准。文档中的 `kind` 用于特定群组，`refer` 用于合作方统计从嵌入站跳往 B 站的次数。公开接口未列出本站读取原片与账号可用最高档、锁定该档并阻止降档的能力。[开放平台能力目录](https://open.bilibili.com/doc/) · [外链播放器参数](https://player.bilibili.com/)

开放平台提供定制合作咨询。B 站公开的《商业合作授权协议》将相关稿件的推广使用限定在 B 站站内。本次公开资料核查未找到可由本站自助开通、同时覆盖这四场电视表演和站内最高画质播放的授权，站内高清通过数仍为 **0/4**。本轮对外联系次数为 0。[官方合作说明](https://open.bilibili.com/doc/4) · [商业合作授权协议](https://www.bilibili.com/blackboard/activity-aJxmmsBdjy.html)

取得节目或发行方允许本站嵌入的同场完整高清发布、获准在本站播放的高清母版，或取得明确覆盖本站及相应表演的 B 站合作授权与高清播放接口后，逐场复验。先核对节目日期、表演画面、音轨版本、分 P 或片段区间及原评分归属。再在正式详情静音短播，记录两个递增的进度读数和实际解码宽高。B 站线路还须验证账号与原片可用的最高档，确认选档后留在本站且不降档。独立码率读不到时记录「未测得」。[四场节目与原片区间](20261122-exact-playback-sources.md)
