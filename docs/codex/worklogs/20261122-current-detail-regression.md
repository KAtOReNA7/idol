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
