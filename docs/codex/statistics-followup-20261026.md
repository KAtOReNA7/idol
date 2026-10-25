# 统计缺口后续核查（2026-10-26）

> 整合状态：本研究增量已由主代理核对、接入运行数据并发布v9；下方“尚未整合/验证”的文字保留研究交接时点。当前验证和剩余缺口见[data-gap-followup-report-20261026.md](data-gap-followup-report-20261026.md)。

核查时间：2026-10-25T17:24:50.537464+00:00。分支 `codex/data-gap-followup`，基线 `0801fc366cb385375f6d68e2495a73ee07c13831`。

本轮复查剩余19项：6项社交人数、9团累计销量、4团一位。找到1项可整合更新：XG从“未知，显示0”改为“公开来源快照确认0”。没有新增合格正数；其余18项保持未知0。只产出本报告及JSON delta，没有修改原统计文件、UI或提交。

## 可整合的更新

| slug | 字段 | 原状态 | 建议值/状态 | 口径与来源 | 日期 |
| --- | --- | --- | --- | --- | --- |
| xg | wins | observedValue=null / unavailable / 显示0 | observedValue=0 / confirmed-zero / 显示0 | [Soridata XG艺人页](https://soridata.com/artists/XG.html)，韩国音乐节目一位，不含年末奖 | 页面包含2026-09-03发行；计数未单独注明截至日，asOf=null |

新页明确显示 `Music Show Awards 2006+: 0`，不再依赖上一轮1.4年前的旧awards缓存。该更新确认的是来源记录0，不能称已实时核对所有官方节目。保留本次checkedAt，并把来源计数截至日留空。网页另列的XG销量覆盖与既有数据不同，本轮没有据此覆盖销量。

机器可读变更在 `statistics-followup-20261026.json` 的 `deltas[0]`，包含expectedBefore和完整proposedAfter；来源、日期、证据和缺失语义均保留。整合后，原表一位为27团正数、21团来源确认0、3团未知0；人数与销量数量不变。

## 其余缺口

| 团体/字段 | 核查结果 |
| --- | --- |
| GENBLUE X人数 | 具名J-enta页面仍为0/0且无Last update，不是确认零。新查SocialBlade不可读取；官方公开follow-button端点返回200空体，没有人数。 [来源1](https://www.j-enta.com/en/artist/752/GENBLUE) [来源2](https://socialblade.com/twitter/user/genblue_ten) |
| VVUP X人数 | 新查未得到带时间的账号人数；公开follow-button端点空体。搜索仍落到30K无日期第三方关联卡，不复用。 [来源1](https://linktr.ee/vvup_official) |
| VCHA X人数 | GIRLSETofficial身份继续成立，但没有带日期的可靠人数；公开follow-button端点空体。后续品牌人数不能冒充VCHA历史人数。 [来源1](https://socialcounts.org/youtube-video-live-view-count/iQzBz-JV2zg) |
| EVERGLOW X人数 | 新查询只得到11K无日期Instalker关联卡；公开follow-button端点空体，不将旧官方账号数移植。 [来源1](https://www.instalker.org/mybstrvv) |
| EVERGLOW INS人数 | HypeAuditor/SocialBlade新路径不可读取；Instastatistics搜索缓存89,829已过时且无数值时间。实际公开HTTP200页面仍为加载壳，未包含计数/更新时间。 [来源1](https://hypeauditor.com/instagram/everglow.offcl/) [来源2](https://socialblade.com/instagram/user/everglow.offcl) [来源3](https://instastatistics.com/everglow.offcl) |
| Cherry Bullet X人数 | 新查SocialBlade不可读取，公开follow-button端点空体。Wikidata带日期的记录均属历史；其页面编辑于2026不等于人数在2026更新。 [来源1](https://socialblade.com/twitter/user/cherrybullet) [来源2](https://www.wikidata.org/wiki/Q59325270) |
| BADVILLAIN 累计销量 | ChartMasters是流媒体等价专辑量与流媒体指标；报道仅为早期OVERSTEP单张/首周数据。均不是本团累计实体唱片销量，维持未知。 [来源1](https://chartmasters.org/artist/badvillain/) [来源2](https://www.koreaboo.com/news/kpop-rookie-girl-group-badvillain-surpasses-newjeans-records-fails-impress-fans/) |
| VVUP 累计销量 | 英文检索存在同缩写企业销量噪声；韩文新闻的百万销量属于同场其他男团。没有找到VVUP自身可核查累计。 [来源1](https://news.nate.com/view/20260511n03761) [来源2](https://sports.donga.com/ent/article/all/20260511/133895847/1) |
| BEWAVE 累计销量 | 找到Be your Wave专辑页面及初动表入口，但单张首周/日数据不等于BEWAVE全发行累计；没有合格团体累计。 [来源1](https://namu.moe/w/Be%20your%20Wave) |
| Geenius 累计销量 | 英文结果混入同名媒体公司的营业收入；韩文精确检索未找到本团累计。原Soridata缺销量记录仍不能作真实0。 [来源1](https://soridata.com/artists/Geenius.html) |
| TRACER 累计销量 | 英文检索主要为同名韩剧OST，与本团无关；韩文团名检索只找到艺人资料，没有累计销量。 [来源1](https://www.kpopalbums.com/products/tracer-mbc-drama-ost) [来源2](https://aimcontents.com/) |
| W!TCHX 累计销量 | 英韩文精确团名检索只找到艺人资料及新人品牌排名，未得团体累计；不把其他同文艺人销量移植。 [来源1](https://aimcontents.com/en/) |
| SPIA 累计销量 | 韩文检索得到Soridata艺人页，但没有可信累计数字；未通过缺榜推断真实0。 [来源1](https://soridata.com/ko/artists/SPIA.html) |
| UDTT 累计销量 | 确认School Rush及2026-07-09 VIPER实体发行与零售活动；商品页面说计入榜单，但未提供实际售出数量。售罄/商品价格/单张初动栏均不作团体累计。 [来源1](https://www.makestar.com/product/10385) [来源2](https://www.kpopalbums.com/products/udtt-viper-2nd-single-album) [来源3](https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=396816303) |
| VCHA 累计销量 | 未找到VCHA时期可靠累计实体数字；不将GIRLSET后续CHAT实体产品或其销量归给VCHA历史作品。 [来源1](https://shop.girlset.com/) |
| GENBLUE 一位 | KPopDB有成员/作品页与ACT LIKE THAT节目分数，但空获胜表不是明确0，节目积分不是一位次数；Soridata具名页不可读取。 [来源1](https://www.kpopdb.net/en/artist/752/GENBLUE) [来源2](https://www.kpopdb.net/en/artist/696/song.php?a=752&s=2840) [来源3](https://soridata.com/artists/GENBLUE.html) |
| TRACER 一位 | KPopDB资料页没有可用的一位合计且成立日期出现当前日期异常；Soridata具名页不可读取。未用空表认定0。 [来源1](https://www.kpopdb.net/en/artist/522/TRACER) [来源2](https://soridata.com/artists/TRACER.html) |
| VCHA 一位 | 找到的没有获胜叙述为早期讨论；后续GIRLSET演出不证明获胜或VCHA时期总数；Soridata旧品牌具名页不可读取。 [来源1](https://board.twicehub.com/News/46) [来源2](https://soridata.com/artists/VCHA.html) |

## 新路径、边界与未解决项

- 人数新增检查SocialBlade/HypeAuditor、官方公开follow-button端点与Instastatistics实际页面。公开端点返回HTTP200空体；部分统计站不可读；Instastatistics实际页面仅显示加载壳。没有重复尝试绕过访问限制。
- Wikidata的页面编辑时间不能作为粉丝数日期；GENBLUE J-enta空Last update的0/0不能作为确认零。EVERGLOW旧账号统计继续与新账号分开；GIRLSET统计继续与VCHA时期分开。
- 销量检索加入韩文团名，排除了同名公司营业收入、同名韩剧OST、同文其他艺人销量、流媒体等价销量和单张初动。UDTT 2026-07-09《VIPER》实体发行已查到，但商品存在不等于已知销量。
- KPopDB空获胜表与节目分数不能证明一位为0。TRACER页面的成立日期异常仅记为来源质量问题，没有写回团体资料。gayo.wiki返回robots限制后停止。
- 仍未知：社交6项（GENBLUE X、VVUP X、GIRLSET X、EVERGLOW X/INS、Cherry Bullet X）；累计销量9团（BADVILLAIN、VVUP、BEWAVE、Geenius、TRACER、W!TCHX、SPIA、UDTT、VCHA）；一位3团（GENBLUE、TRACER、VCHA）。
- 0仍按用户要求展示，未知字段的observedValue保持null。本轮不宣称已消除所有资料缺口。

验证：19项覆盖与唯一性检查通过；唯一delta仅把XG确认零状态/来源更新，数值仍显示0；原统计文件SHA记录在JSON，可供主代理核对整合前版本。
