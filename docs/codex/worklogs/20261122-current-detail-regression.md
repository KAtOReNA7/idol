# 四个团的作品详情与隔离 D1 保存

v212 的 Hearts2Hearts、Billlie、i-dle、NewJeans 四个旧测试文件在 Windows 和 WSL 都有 27 项失败。原用例从测试源代码拼接已撤下的专题组件，还在查找已淘汰的评分屏、按钮和 CSS 类名。现在使用正式详情渲染的播放器、成员卡、输入框、导航与保存回执。[此前的双平台全量数据](20261122-v212-validation.md) · [四团共用的详情验收](../../../apps/idol-site/tests/helpers/artist-work-detail.cjs)

| 作品 | 具名成员卡 | 特有验证 |
| --- | ---: | --- |
| Hearts2Hearts《The Chase》 | 8 | 发行原版、表演版与歌词版保留独立 ID。现行已审关系只指向表演版。方向键移动焦点，激活后才切换视频。 |
| Billlie《RING X RING》 | 6 | 六位出道期成员逐条核原关系；保留原版 MV 与 Mnet 舞台各自的摄影原件。 |
| i-dle《TOMBOY》 | 5 | 显示经绑定的 STUDIO CHOOM 表演和该视频封面。原先供 KBS Music Bank 使用的照片继续可取。 |
| NewJeans《Attention》 | 5 | 当前 KBS 舞台与《Super Shy》的另一场表演分开。五张获准设计素材仍与原清单的尺寸及字节相符。 |

每团都对照快照中的正反向关系，检查成员 ID、认人图和本人卡内的评分控件，同时核未关联记录、空名单及备注。各团从成员照片下打开评分，将表现分设为 0、造型喜好设为 8.6，检查提交的记录和字段。在作品评分中分别保存 0、9.1 或清空。切换视频和跳回成员草稿不提交数据，旧舞台被换源时继续阻止草稿写到另一场。[共用的详情夹具](../../../apps/idol-site/tests/helpers/current-work-detail.cjs) · [舞台换源保护](../../../apps/idol-site/tests/helpers/assert-rebound-stage-draft.cjs)

另用 Miniflare/workerd 新建独立的本地 D1，执行仓库实际 SQL 迁移。四首作品沿用公开的作品及舞台 ID，所有分数、备注、成员关系和所有者均为合成测试数据。编辑器经真实的原生读取及保存函数操作这套 D1。作品的 0 分和舞台的 9.1 分在同一操作写入后，人为丢弃回执；重试沿用同一操作且数据库只有一条成功日志。四次都从舞台回到原照片的成员草稿、恢复焦点、保存本人 0 分，再清空作品 MV 分数并读回。成员 0、未填的造型分、9.1 的舞台分及备注均正确保留。该测试覆盖编辑器和持久化，未经过正式账号登录或正式站写入。[隔离 D1 的可执行用例](../../../apps/idol-site/tests/work-detail-d1.test.cjs)

Windows 与 WSL Ubuntu 使用同一批源文件。四团现行业务用例 35 项各自全部通过，与 IVE、BADVILLAIN 和 MEOVV 的既有详情用例合跑均为 50/50；两端新加的实际 D1 测试均为 4/4。Windows 再合跑共用的编辑器用例得到 55/55。完整工程及正式站发布结果另行统计。

## v231 复核

原四个详情文件的失败分别为 Hearts2Hearts 9 项、Billlie 7 项、i-dle 6 项、NewJeans 5 项，v212 中缺少 `h.media` 的用例分别为 1、2、1、2 项。v213 消除全部 27 项后，v231 的完整 Windows、WSL 日志里，这四个文件都没有失败。v231 在两端另跑四个详情文件与隔离 D1 文件，均为 41/41。35 项详情之外，四条作品与成员的丢回执读回，以及两条所有者读取验证全部通过。[v213 按文件清单](../evidence/20261122-v213/tests.json) · [v231 重跑](../evidence/20261122-v231/four-work-details.json)

## LOONA 与 tripleS 的评分复核

v234 的完整测试中，两条评分用例都在查找旧组件时中止，未执行保存。现按页面上的「MV 分数」和「作品整体舞台分」操作真实作品详情。LOONA《Butterfly》使用 M COUNTDOWN 第 607 期（`ezA5LkSzEyo`），tripleS《Girls Never Die》使用第 843 期（`y2Zx2JpmUU8`）。两首均在模拟编辑冲突后保留 0 分草稿，来回切换视频不会发起保存。[LOONA 评分用例](../../../apps/idol-site/tests/loona-detail.test.cjs) · [tripleS 评分用例](../../../apps/idol-site/tests/triples-detail.test.cjs)

在隔离 D1 分别保存 MV 0 分、舞台 9.1 分，模拟数据库已提交但页面未收到回执，再点「核对上次保存」。两次请求内容相同，每首数据库均只记一次，回执中的作品和舞台与原选择一致。成员卡的 0 分、未填的造型分和备注均可读回。最后单独清空 MV 分数，舞台仍为 9.1，成员仍为 0。试验使用公开的团体、作品和舞台身份，以及合成的所有者、成员记录和评分，无正式私人写入。[共享详情操作](../../../apps/idol-site/tests/helpers/current-work-detail.cjs) · [隔离 D1 保存与读回](../../../apps/idol-site/tests/work-detail-d1.test.cjs)

Windows 和 WSL 各通过两条此前失败的评分用例，再各通过 44 项相关回归（原四团详情 35 项、六首 D1 保存 6 项及目录读取 3 项），均无跳过。本次共改动测试与工作日志。以上为定向结果，未据此重算全项目历史失败数。
