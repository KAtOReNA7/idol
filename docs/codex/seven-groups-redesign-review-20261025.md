# 七团重设计统一交审（2026-10-25）

七团已按用户批准参考依次完成，统一私密只读审阅 **v3** 已发布。用户于2026-10-25明确确认七团新版全部通过；此确认来自用户，不由技术检查推定。其余44团保持用户已通过版本，正式主站仍为v186。

## 审阅链接与视觉依据

[全部51团索引](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups) · [112个可编辑Figma画板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1266-1095)

| 团体与新版链接 | 已批准的参考 | 本轮实现与资料边界 |
| --- | --- | --- |
| [MADEIN](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/madein/) | [日本官网](https://www.madein-official.net/) | 黑红摄影、白色原字标、Hammersmith One；官网四人首页摄影与六张LOVE, AFRAID具名单人照分开标注，GAEUN历史档案保留。v3交付时BLUE缺封面；后续v4已补Bugs原字节封面，当前登记四项发行封面齐全，历年目录完整性另行核对。 |
| [QWER](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/qwer/) | [日本官网](https://qwerjapan.com/) | 黑底乐队摄影、手写字标、完整四人乐器构图；官网只提供SHOW DOWN发行条目，未宣称韩国唱片目录完整。 |
| [PURPLE KISS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/purplekiss/) | [HIDE & SEEK官方发行专题](https://m.melon.com/musicstory/detail.htm?mstorySeq=11666) | 紫绿、七人时期官方团照与拍立得构图；个人照保留具名档案来源，不猜未具名概念照身份。 |
| [IVE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/ive/) | [I’VE MINE / Baddie官方发行专题](https://www.genie.co.kr/magazine/subMain?mgz_seq=13648) | 冷青摄影、黑色标题与六人官方具名花絮照；目录、详情与时间轴为该视觉语言的项目延展。 |
| [tripleS](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/triples/) | [日本官网](https://www.triples-official.jp/) | 黑白、完整24人摄影、S1–S24具名编号与精确成员ID绑定。 |
| [RESCENE](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/rescene/) | [THE MUZE官方艺人页](https://themuze.kr/rescene) | 白羽毛蕾丝车体五人团照、冷灰蓝；单人照采用具名Kitto照片，未冒称全部来自官网。 |
| [ILLIT](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/artists/illit/) | [SUPER REAL ME官方专题](https://beliftlab.com/artist/discography/ILLIT/8) | REAL ME摄影、像素字与星点，单人照采用具名SUPER ME官方照片；Pixelify Sans为项目延展字体，并非官网同字体。 |

销量选期的来源与口径限制保留在[参考清单](seven-groups-design-references-20261025.md)，不把当前可查榜单比较改写为全球实时销量结论。

## 新实现及保留范围

七个旧团页组件不再渲染，新增 `apps/idol-site/components/seven-redesign/`，重写首页、成员/作品/发行/影像目录、详情、时间轴、搜索筛选、原图与返回，并替换七团索引入口及手帐视觉。七团采用新的渲染结构与各自视觉，不沿用被否决的旧团页布局。

保留此前核实的公开资料、原图、稳定ID、评分/备注/观看状态和访问边界。共享手帐的业务DOM、播放器、编辑器、路由与权限机制继续复用；手帐视觉重写。合法返回路径及当前/曾属团体关联共同决定主题，不影响其他团体。以上为官网/官方宣传语言的应用延展，不称官网逐像素复刻或全部业务从零重写。

新增原图、来源、SHA256、尺寸和身份依据记录于各团 `public/artist/<slug>/redesign-20261025/` manifest。原字节保留，无AI造人或照片压缩。核对源码差异，其余44团路由/素材及数据快照未改。

## 已解决问题

| 问题 | 结果 |
| --- | --- |
| 七团旧视觉与用户批准参考不符 | 七团页面、内页、索引和手帐视觉已重做，旧团页组件退出渲染。 |
| QWER 320px发行标题溢出 | 标题允许正确换行，五宽复验通过。 |
| PURPLE KISS历史成员手帐主题未继承 | 同时核对当前及曾属团体关系，仅合法七团返回路径应用主题。 |
| PURPLE KISS平板手帐页头、索引768px页头溢出 | 对应布局已修复，索引修改限定于团体索引场景。 |
| ILLIT索引/手帐旧字体残留 | 统一为Pixelify Sans与新版视觉。 |
| PURPLE KISS首页文字与七人时期新团照不一致 | 改为HIDE & SEEK七人时期说明。 |
| Figma的MADEIN页头层级、PURPLE KISS照片边距及ILLIT装饰缺失 | 原生节点已修复并查看修后截图；全部112画板均有内容。 |

## 分层验证

| 层级 | 已验证范围 |
| --- | --- |
| 自动化 | 28项专项/回归、TypeScript、正式构建通过。 |
| 本机Chrome | 七团10类页面×五宽（320/390/768/1024/1440）共350项布局、92项交互通过；只读审阅未发出写请求。 |
| 保护回归 | 其余44团桌面/手机首页88项、索引五宽、51卡片及7个新入口通过。 |
| 固定Git ref发布模式 | 42项页面、14项手帐往返、51卡片索引通过。 |
| 实际线上v3 | 服务身份Chrome检查42项页面、14项手帐往返和索引通过；所查页面无破图、横向溢出或JS异常，七团手帐主题对应正确。不是用户IAB完整会话。 |
| Figma | 112个原生可编辑画板、261原图/矢量组件，11491文字节点及805图片实例；七团关键首屏已实际查看。不是全量逐像素通过。 |

可跨电脑读取的摘要和Figma全部节点映射见[验证JSON](seven-groups-redesign-verification-20261025.json)。页面、素材和用户设计验收分开记录。

## 尚未解决或尚未验证

- 历史全团资料：39团共133作品缺少快照参演关系；14个证据不足的hold事件继续隐藏；BADVILLAIN《HURRICANE》精确视频未补。不虚构关系或视频。详细范围见[全团检查](all-groups-audit-20261025.md)。
- 本轮资料边界：QWER日本官网发行目录有限；MADEIN部分发行封面仍缺；部分团体个人照使用明确标注的具名档案/转载来源，不能称全资料完整。
- 真实生产保存、全部视频完整播放、80%/125%原生缩放和用户IAB完整登录会话未验。私密只读审阅的检查不能替代这些项目。
- Figma全量字体、旋转、装饰及像素保真未验；Arial/Impact等使用Roboto/Anton替代。自动capture仍pending，已用原图上传与可编辑原生节点完成设计稿，不把pending记为成功。
- 七团实际网页仍待用户统一审核；主站v186未更新，未合并main。

## 发布记录

- 实现分支：`codex/seven-groups-official-redesign`；冻结基线：`c578183e608c01eb797da0591bf75e7b3b0ea98e`。
- draft [PR #34](https://github.com/KAtOReNA7/idol/pull/34)，目标分支为已批准参考记录 `codex/seven-groups-design-references`，未合并main。
- 已推送网页代码：`4cd279717a25938bedeb543a145204d25e3fa95f`；后续仅交接文档提交不改变线上网页版本。
- Sites项目：`appgprj_6add2704bc6c81918d3e0e2f13130422`，版本3，部署状态`succeeded`；owner-private，无新增用户或组。
- Sites源码提交：`d3b7977f9a2bbf189c663abc9fa353929d250ac0`；归档SHA256：`56040f25316e1829be237c4f846ced78d4231c623d907e200ca7389c38175927`，17,448,960 bytes / 170 files。
- Figma文件：`zeLNExz4TbpWRW3uiahef7`，新页`1266:1095`。网页源、设计稿与资料状态分别交付。
