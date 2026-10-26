# 18项未知统计续查与旧图候选（2026-10-26）

本轮从正式工作区`HEAD 6c409262b3172f90fb561cf1508b48250334d11b`读取精确18项未知：6项社媒、9项销量、3项打歌一位。**0条合格统计增量，18项仍未知；没有改正式数据、commit或部署。**

18字段均做了针对性检索/来源对照，其中2字段读取了当前相关来源正文，16字段仍停留于检索层，没有取得可采用的数字正文。研究覆盖不等于事实已经核实。逐字段动作、来源、排除理由、expectedBefore与原统计SHA在[统计JSON](statistics-followup-next-20261026.json)；`deltas`为空。

## 本轮实际发现

- GENBLUE一位：当前[KPopDB单曲页](https://www.kpopdb.net/en/artist/696/song.php?a=752&s=2840)明确写ACT LIKE THAT的Total wins为0，但[团体页](https://www.kpopdb.net/en/artist/752/GENBLUE)没有团体合计。只核实到单曲，不升级为团体全部时期确认零。
- TRACER一位：[团体页](https://www.kpopdb.net/en/artist/522/TRACER)成立日仍异常显示2026-10-25，成员/发行空表，没有一位合计，不能作确认零。
- 9团销量：新查Korean Sales目录及英/韩精确团名，仍未得本团完整累计或合格可复算累计表。多人报道中的其他团百万销量、专辑首周、榜单名次、流媒体等价销量、公司收入均排除。Geenius搜索得到2026-01-15实体QR发行[SPOILER BOOK](https://www.kpopalbums.com/products/geenius-spoiler-book-1st-instrumental-album-qr-version)，商品存在/售罄不提供销量，也不能按早期数码发行推定为零。VCHA的JYP IR搜索线索里500K属于NiziU列，不能把PDF扁平文本串列套到VCHA；本轮没有读取该PDF版式，保持待核。
- 6社媒：新查询仍只得到身份入口或无计数日期的关联卡。GENBLUE的J-enta 0/0无Last update；VVUP 30K、GIRLSET 38K、EVERGLOW 11K、Cherry Bullet187K都缺可核实计数日期。来源crawl/编辑日期不能替代计数截至日。EVERGLOW新旧账号、GIRLSET与VCHA历史主体继续分开。本轮没有重复上轮已拒绝的官方X、Instagram统计站或公开follow-button路径。

完整字段范围：GENBLUE X/一位；BADVILLAIN销量；VVUP X/销量；BEWAVE、Geenius、TRACER、W!TCHX、SPIA、UDTT、VCHA销量；TRACER/VCHA一位；GIRLSET X；EVERGLOW X/INS；Cherry Bullet X。

## 旧图续查：未自动采用

没有重做此前4张已提升图片。先查剩余43条中的官方Melon来源：

- KiiiKiii《I DO ME》SUI/LEESOL各3张具名MV现场照，4张其他照片实际解码仍736×491，3:4有效宽不足540。另2张为已在仓库的旧图，下载发生TLS握手失败，没有继续反复请求。页面文字/图片具名关系已读，不把其他概念照区域移来充数。
- BABYMONSTER《WE GO UP》CHIQUITA原页面仍只给相同736×491图，没有发现声明的高分辨率链接。
- Vogue aespa《Dirty Work》Web文本可读，但另一次正常HTML下载返回403，记录层级后停止该下载路径，没有换域绕过。

另找到KiiiKiii一份独立公开粉丝转刊，HTML嵌精确`hAEfi_SKTEU`，图片caption具名左右成员。两张原文件均正常解码、保留原字节；不是通过读取或绕过付费原文取得。原[THR文章](https://www.hollywoodreporter.com/music/music-news/kiiikiii-new-k-pop-group-starship-entertainment-exclusive-1236138451/)Web fetch报告402 Payment Required后即停止该路径。

| 候选 | 真实原尺寸 | 审查结果 |
| --- | --- | --- |
| Leesol左 / Kya右 | 2999×1999，387752 bytes | Leesol左侧脸无遮挡，原图支持1080×1440裁切；公开转刊有精确视频和具名文字。但THR原出版页未读取，此处仅粉丝转刊、并非已验证官方同图高清直链，**仅pending，不自动提升43→42**。 |
| Sui左 / Leesol右 | 1999×2999，641265 bytes | 两人低头，Leesol手遮脸，排除；不因分辨率大替换旧清楚照片。 |

逐图URL、SHA、字节、尺寸、来源页SHA和限制见[候选JSON](quality-candidates-next-20261026.json)。[LEESOL待核before/after](quality-leesol-pending-contact.jpg)仅用于判断，未加入正式审计或发布目录。

本轮结果不关闭统计缺口，不新增认人图绑定或质量通过项；可归档这些实际证据后，继续优先有明确具名、精确版本和足够3:4有效像素的新来源。
