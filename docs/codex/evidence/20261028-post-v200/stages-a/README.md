# v200 后舞台研究 A：56 新缺口与 11 旧来源替换

本轮完成分配的 67 项有界公开研究，共 127 条实际检索，20 条为空；逐项均保留原作品、版本、既有理由、查询ID和真实发现。两项形成官方资料支持的表演后备候选，另 65 项仍有具体证据缺口。研究员没有导入舞台或读写私人资料，正式采用数量仍由主代理的独立回执确定。

## 提交采用核对的两项

| 作品 | 精确候选 | 资料范围与限制 |
|---|---|---|
| MADEIN DADARIDA | [Gm0apElS0sY](https://www.youtube.com/watch?v=Gm0apElS0sY) | 官方 CHOREO Ver 174秒，Bugs 授权曲目 172秒；同频道、同月与原MV相连。05:29Z旧同日原页精确4863赞；没有新鲜watch可播/点赞核对。|
| XG IYKYK | [mU8adPiwpm4](https://www.youtube.com/watch?v=mU8adPiwpm4) | [XGALX原公告](https://xgalx.com/en/xg/news/detail.php?id=1120313)当前HTTP200、直接iframe精确ID，并同页指向原MV及AWE同曲；187秒视频、授权曲目180秒。05:29Z旧同日原页精确91310赞。|

二者按用户最新规则列为 **official_performance / 专门拍摄表演后备**，不冒称练习室、固定机位或现场人声。目录时长和原发布关联支持资料范围，未完整播放、逐句听辨或逐人出镜核对。`candidates.json`保留全部元数据、证据日期和采用前检查；需主代理核对当前精确来源及新鲜owner空分/完整日志/线上原值，不得把0分视为空。

## 新补强但不能直接采用的路线

- QWER FAKE IDOL：官方 [Weverse合集页](https://weverse.io/qwer/media/3-188265753)补强既有 `PkEl_Z9B2y4`。它已是只读lead，不是新增发现。真实录制场合、目标歌曲的完整首尾时间码未闭合，不能把两曲整片当单曲绑定。
- QWER SHOW DOWN：[NTV 2026-08-21原节目页](https://www.ntv.co.jp/buzzrhythm/oa/20260821.html)明确Studio Live及本曲，未给当前完整版权方单曲视频。旧粉丝转传仍不采用。
- Rocket Punch ドキドキLOVE：明确定位 **Lemino let me Know K-POP! S1E4，2023-05-18**。[Kstyle节目介绍](https://kstyle.com/article.ksn?articleNo=2220632)与[电视节目表](https://bangumi.org/tv_events/AmHAEJgt4AE)均列出本曲；搜索所得 `aw2hcpeRd08`是预告，未取得完整原片或合法可用单曲章节。
- IVE WAVE：[TV Asahi原始文章](https://post.tv-asahi.co.jp/post-218906/)确认2023-05-26 Music Station本曲；节目公告不证明当前可用完整视频，也不能仅以“六人团”介绍推定实际出场人数。
- IZ*ONE Buenos Aires：补强2019-06-01 NHK ShibuyaNote路线，未取得当前完整版权方来源。镜像不是官方候选。

其余具体排除理由见`research-ledger.json`。新政策只放宽独立官方表演类型，不放宽语言、混音、节选、参与者范围、演唱会/活动排除或评分保护。未把原MV重复当新舞台；没有把搜索词出现在邻接条目当成目标歌曲证据。

## 文件与复算

- `query-ledger.json`：127条执行查询、结果标题/URL与工具ref。列表包含噪声结果，逐项finding说明证据真正用途；不保存大段来源正文。
- `research-ledger.json`：56项新缺口＋11项旧替换，各有查询覆盖；不证明表演不存在。
- `candidates.json`：两项完整候选proposal，采用前要求与核验范围。
- `first-party-candidate-reads.json`：XGALX当前原页、Bugs403及Apple200通用壳分别记录；后两者没有被冒称成功曲目直读。
- `route-failures.json`：3次YouTube generic fetch failure与1次缩略图TLS EOF；不等同于用户播放失败，不重复绕过。
- `validation.json`：67/67覆盖、稳定ID无重复、查询引用完整、私人读写0、应用修改0、完整播放/音轨等同/固定机位主张0。

复算：`python -X utf8 docs/codex/evidence/20261028-post-v200/stages-a/build-research-ledger.py`。范围只写此目录；GitHub提交与正式部署不由本研究回执声明。

## 后续两项专项（13:50Z）

`focused-followup.json` 另外记录 19 条实际查询（9 条为空），不混入上述 127 条初始研究。原始工具缓存留在被忽略的 `.codex-local/stage-a-focused-search-raw.json`，公开证据仅保留查询、短标题、URL、事实摘要与 SHA。

- Rocket Punch：新取得 [BSよしもと第一方第 4 集归档](https://bsy.co.jp/programs/by0000020476?page=3)，直接证实目标曲节目。页面 2024-05-26 是 BS 播出档期，不覆盖 Lemino 2023-05-18 首发。节目回放按钮回到原页；当前回放站和 TVer 域检索未取得完整目标集。[官方迁移公告](https://video.bsy.co.jp/?idx=1&info=)说明 10-05 起内容迁 TVer、旧站 10-30 正午结束，但不证明本集可播。保留待核，不能拿预告当整曲。
- QWER：社区索引将目标片列为 Special Clip，并记有早期成员短预告；未补齐第一方录制场合及 FAKE IDOL 首尾时间码。动态粉丝目录实际打开后未检出目标条目，未冒称复核成功。IAB 不可用，未打开 Chrome、未重试已失败的原页/缩略图路线。两曲总时长不能用于猜切单曲。

本研究员新增采用仍为 0。主代理已另行采用 DADARIDA 与 IYKYK，并完成新鲜 owner 保护核查；以上候选旧时间点赞与待采用说明保留为研究时点记录，最终采用元数据以 `../stages-b/watch-metadata.json` 和主代理回执为准。

## 合作曲成员版后备核查（14:24Z 后）

用户随后允许完整、同语种且含本团的官方成员版后备，并要求标明“成员版／客串范围不同”。`member-version-candidates.json` 对 9 项合作范围缺口记录 28 条新查询（7 条为空），形成 1 项可交由主代理核 owner 保护条件的 proposal，8 项仍有具体缺证。不得将其写成已采用或已部署。

- SPAGHETTI：`OsPt0BY1_Wk` 官方 Member ver. 练习，146 秒、当前精确 129442 赞；官方 Weverse 精确嵌入及授权 137 秒 Member 曲目支持资料范围。`versionMatch=false`，仅通过独立 `memberVersionFallback` 标注 guest_scope。KBS `jygGZMvtf0c` 主舞台的成员版／音轨范围未证，不因节目优先或点赞而绕过资格。Clean Member 独立发行，实际 clean/explicit 音轨未独立核验；两次公开自动字幕请求均返回 200 空体，没有逐句比对结果。
- aespa Welcome To MY World：JTBC 正常 K-909 主舞台 241 秒；主视频 `_plU9O_4Pn8` 新鲜读取 TLS 失败后停止，全景 `0TeYnotdeoE` 与主舞台分开。nævis 保留与替唱只有互相矛盾的网友线索，主代理决定暂不采用。
- YOUNG POSSE UP 的 152 秒编舞片相比 200 秒合作发行仍有完整范围疑问；UNFORGIVEN 日语定位 CDTV 完整节目报道但未取得当前合法原片；ILLIT、Caution、Like Magic、Be Who You Are 仍缺合格独立表演。MEXE 仅客串者与舞者的影片不含 NMIXX，不能使用新政策放宽。

`member-version-reviewed.json` 是 1 项候选审核输入，`member-version-normalized.json` 已通过当前归一化程序；稳定 groupId 与 inventory 核对通过。10 项证据结构检查见 `member-version-validation.json`。公开查询只保留查询／URL／事实摘要，全文缓存位于已忽略 `.codex-local/` 并留 SHA。无完整播放、逐句音轨或固定机位主张，本研究员私人读写／应用变更／舞台导入均为 0；主代理须在全部候选准备后单独取得新鲜 owner 导出，0 分不为空。
