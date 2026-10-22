# Sol 最终交接补遗

整理日期：2026-10-22 UTC。Sol 本轮工作已收官，本文件是可公开的成果摘要、精确缺口与设计溯源，不是原始会话副本，也不是新的设计或发布任务。

## 1. 先读当前事实，不回退到旧状态

接续基准为仓库 [KAtOReNA7/idol](https://github.com/KAtOReNA7/idol) 的 `handoff/codex-20261022`，主交接已确认提交 `253633c5bcf2b58c06a54c4d817df9d168182fcf`。完整 v186 生产源的 3,954 个文件已归档到 [apps/idol-site](https://github.com/KAtOReNA7/idol/tree/253633c5bcf2b58c06a54c4d817df9d168182fcf/apps/idol-site)。本补遗追加到此基准，不取代首次执行文件。

- 正式生产仍是 v186。GENBLUE/WOOAH combined、MEOVV B、Astra izna/ifeye v3 三组候选均与生产基线隔离。
- WOOAH **Sol Photo v1 已由主会话取得**，本次再次实际核对两份源码的字节数与 SHA-256，结果一致。Sol 收官时未收到取得确认，是当时信息边界，不是当前阻塞。
- WOOAH 后续 **native v1.2 已进入 combined 候选**；其说明明确以已审阅的 Sol Photo v1 画板为设计依据。Sol Photo v1 的旧式独立源码是历史设计溯源，不是要覆盖 native v1.2 的新补丁。
- 私有合成 QA 已通过关键返回、队列、原图交互，普通 80% / 125% 缩放已检查。**真实 catalog、编辑器保存、精确 320/390/1440/2048/2560 视口、窄宿主及生产集成尚未完成验收**。不得写成“网页 QA 全未做”，也不得写成“已生产可用”。人工认可另行记录。
- 保留主会话后修，不能从旧 Sol 包重新恢复 KATSEYE/AtHeart、IZ*ONE/fromis_9、EVERGLOW/Rocket Punch 的旧关系或布局状态。
- HITGS 旧浏览器阻塞、Billlie 旧限额、Cherry Bullet/Weeekly 源码恢复问题已有后续解决记录，不能仅凭旧检查点重新列为当前阻塞。

当前接入材料见 [combined 候选 README](../../handoffs/codex-20261022/combined-integration/README.md)；完整接续与验收以本目录的 CURRENT-STATE、STATUS、PRD、ACCEPTANCE 和首次执行文件为准。本次补遗本身不应用候选、不改生产、不改设计、不上传图，也不改评分、备注或观看状态。

## 2. 原定 15 团：保留成果与接手边界

以下“已验”只表示对应历史版本的记录。它不是对当前 v186 或最新候选的重新整团验收；没有本轮关闭证据的事项保持明确边界。

| 团体 | 可保留成果 | 接手时的边界 |
| --- | --- | --- |
| UDTT | 用户已认可的上线设计；11 图私有读取试验及查看器实测记录 | 冻结已认可设计；受限图片服务不自动推广到其他团。 |
| KATSEYE | 独立页面、详情、时间轴；补丁构建及真实三宽功能复验 | 使用主会话后补发行与时间轴关系的最终版本，不覆盖为旧包。 |
| VCHA | 17 图映射、宿主连接层、隔离候选、四组标题实测 | 尚无完整页面和连续交互终验关闭证据；两项视频为发行封面回退，不可称精确视频图。 |
| HITGS | v1 页面、26 图/59 槽、失败态修复；构建、TS 与真实三宽复验 | 私有读取候选默认不激活；生产身份、准入及存储尚未验。 |
| AtHeart | 独立页面、详情、时间轴；构建与真实三宽功能复验 | 保留主会话后补发行/时间轴关系及最终媒体列修订。 |
| i-dle | 已认可方向、原生 Figma、完整页面源稿、作品库上下文，已由主会话接码 | 认可部分需保护；当前生产整团验收以主交接证据为准。 |
| IZ*ONE | 历史阵容页面；历史记录为三宽各 43 页通过 | COLOR*IZ 影像关系使用主会话后修版本。 |
| fromis_9 | 区分历史/当前时期的页面；历史三宽各 67 页检查 | 主会话曾收尾桌面 30 个影像详情溢出、7 个发行时间轴入口；需核对最终树及关闭证据，不恢复旧缺陷。 |
| EVERGLOW | 页面、原图、精简投影前浏览器检查；主会话补发行资料并联合构建 | 精简后定向复验须按当前树确认；19 项视频图缺口保留。 |
| Rocket Punch | 页面、原图、投影前浏览器检查及联合构建 | 精简后复验须查对应版本证据；合约或平台结束不等于解散。 |
| Cherry Bullet | 大肖像、十人历史分区、精确关系、两项 host 修复；另有目录 v2 | 目录 v2 不等于最终设计已认可；完整原生 Figma 和实图终验尚未完成。 |
| Weeekly | 独立风格、历史时期照片、正确 We Can 封面、精确关系及 host 修复 | 缺 6 张舞台图；历史肖像来源/年代及 Figma 实图终验仍需补齐。 |
| WOOAH | Sol 60 个原生画板（51 个新实图稿、9 个保留稿），Photo v1 两文件增量；另有后续 native v1.2 combined 候选 | 遵循第 1 节最新 QA 边界；保留 24 张视频预览、出演关系、SORA 履历和发行目录完整性缺口。 |
| Billlie | 用户已认可的上线设计；黑红摄影、淡紫衬线、大肖像、完整封面及原生 Figma | 冻结认可成果，不重传旧补丁；静态搜索原型不等于动态功能已验。 |
| NewJeans | 原生设计、页面源稿；早期五类上下文增量已接码上线 | 仍缺 2 张视频图；早期上线不能证明最新整团版本全部通过。 |

## 3. 历史 6 团：归档，不重新启动

| 团体 | 已有成果与保留边界 |
| --- | --- |
| LOONA | 已认可摄影首页及现存内页原生稿；本补遗不重新确认当前生产或内页终验。 |
| tripleS | 整套原生稿、24 人名册及中文名修订；当前生产与窄屏验收须对应主交接记录。 |
| IVE | 保留原生设计；早期首包曾损坏，旧 ZIP 必须另行核验，不能直接采用。 |
| BADVILLAIN | 独立原生页面已存在；Sol 本轮仅确认节点可读，未重新证明实图和上线验收。 |
| RESCENE | 暖纸摄影源稿 v1、5 位成员详情、作品与内容增量；Figma 落地和网页终验未完成。 |
| PURPLE KISS | 深色剧院源稿 v1、7 位历史成员详情、作品与内容增量；Figma 落地和网页终验未完成。 |

RESCENE 的 6 支既有 MV 仍缺精确公开日，本来源没有逐项标题，不补造。PURPLE KISS 仍缺 Zombie、My My、memeM、Breath 四项的精确公开日。两团全球目录完整性、部分成员历史和版本对应尚未认证；录音参与不能推导为视频出演。

## 4. 精确缺图台账

### WOOAH：14 个 MV + 10 个舞台 = 24 张

下表身份来自 Sol 最终交接。舞台的父作品为同一行的 workId，候选键格式为 `wooah:stage:<父作品ID>:<videoId>`。**候选键不是已证实的原生记录 ID**；缺失的 `videoType`、`sourceKey`、`clip` 不得猜成 MV 值。每张图必须绑定准确版本，不能用发行封面或另一版视频图代替。

| 作品 / 版本 | workId / 舞台父作品 ID | MV videoId | 舞台 videoId |
| --- | --- | --- | --- |
| woo!ah! / 韩文 | `recvxyH5pzlG0W` | `X2FB37r4Oyw` | `09uOyeNBJD4` |
| Bad Girl / 韩文 | `recvxyH5pzV8fK` | `xwDmGC2fTfU` | `RPr9ff1N2hU` |
| I Don't Miss U / 韩文 | `recvxyH5pz4VGa` | `hPzz4cRxtco` | `pzXgr-mWw0g` |
| Purple / 韩文 | `recvxyH5pzTgrL` | `UE--H12gl2I` | `ttS52RNH3tM` |
| Catch the Stars / 韩文 | `recvxyH5pzzH06` | `g5B6zCSMrcc` | `1gWGdSpyWWE` |
| Danger / 韩文 | `recvxyH5pz4vBM` | `_X9720wjipE` | `0ujr4IJcJpQ` |
| Rollercoaster / 韩文 | `recvxyH5pzAava` | `KkyUE7TcBcs` | `G8NEGAPdqD4` |
| BLUSH / 韩文 | `recvxyH5pz0vNt` | `yh5W41ANcjo` | `6JSb2MaK4Fk` |
| Secret Princess / 动画合作 | `recvxyH5pzHfj0` | `j3RGtLEZ-PM` | `ZiB9Ld67bpU` |
| POM POM POM / 韩文 | `recvxyH5pzgBlW` | `liuotbjjsHw` | `Z3dO1xEYdqk` |
| Shining On You / 宣传合作 | `recvxyH5pzZfyK` | `jsfsisyG3Vo` | — |
| WXW / 韩文 | `recvxyH5pzrrSO` | `ZtiThQN5ETc` | — |
| SUMMER / 韩文 | `recvxyH5pzQxpW` | `8DwTAa5hPsA` | — |
| VOODOO DOLL / 原版 | `recvxIYG1FSCws` | `nYrezqbjl3E` | — |

8 项已研究发行不是完整历史发行目录；没有原生 release ID 的条目继续保持空值。成员出演关系与 SORA 完整履历仍需可靠来源，不能靠图片或录音署名推定。

### Weeekly：6 个舞台槽位

不得借用 MV 图。这里只给出已确认的父作品 ID 与 videoId，不补造舞台原生记录 ID。

| 作品 / 版本 | 父作品 ID | 舞台 videoId |
| --- | --- | --- |
| Check It Out / 韩文 | `recvxyH5pzj7Wt` | `76_n_Z8loY8` |
| VROOM VROOM / 韩文 | `recvxyH5pzACzD` | `8rVoU3ZJvjE` |
| Stranger / 韩文 | `recvxyH5pzr7Nc` | `Qz3GIjxqaqA` |
| Stranger / 英文 | `recvxyH5pzV22X` | `uCJc4NWM1SI` |
| LIGHTS ON / 韩文 | `recvxyH5pzCrq5` | `XOBKIUbsBuM` |
| Ven para / 韩文 | `recvxyHuKM56Yi` | `_SyZp-P-3tg` |

### 仅有数量的其他缺口

EVERGLOW 19 张、NewJeans 2 张。Sol 最终报告未重新取得逐项台账，本补遗不制造 ID，后续应从已有交付中的缺口记录逐项核对。VCHA 的两项发行封面回退也不能改记为精确视频图已补齐。

## 5. WOOAH Photo v1 设计与源码溯源

完整 Photo v1 原交付：Library `libfile_ce5307ba17fc819181bfb33ab9690f03` v1，22,348,026 字节，原包 SHA-256 `e2589e9028c41ab51599109061290a1b2ee12cd8ca5f0e88b4e16cc7b7a691d1`。此处保留原报告元数据，不宣称本补遗重新校验了原包整体；本次实测的是以下提取文件。

| 原增量路径 | 本次实测字节 | 本次实测 SHA-256 |
| --- | ---: | --- |
| `delta-source/groups/wooah/index.js` | 22,976 | `870d52e388f948e80c7fa2a65fd8bee0a3dcb7fa3bb0b78e85f7e7df5b13209d` |
| `delta-source/groups/wooah/styles.css` | 44,123 | `4a362bc635800213197e8956aaa0afca23bf2c2baf16e485842f42212dbd4daa` |

两文件原字节随本补遗保留在 [sol-wooah-photo-v1-reference](../../handoffs/codex-20261022/sol-wooah-photo-v1-reference/README.md)。旧 Windows 发现的 6,922 字节 index.js 不是此版本，不可替用。此参考不含完整运行依赖、原图或截图，不能单独运行，也不能直接覆盖 `apps/idol-site` 或 combined 的 native React 文件。

原 `photo-v1-audit/CHANGES-from-v0.json` 保留 before/after、历史补丁 SHA 及历史 apply/reverse 结果。本次只校验和归档，未重新执行其历史命令；其 `browserTestPerformed: false` 仅属于 Sol Photo v1 当时的来源记录，不能覆盖后来 native v1.2 的合成 QA 结果。

### 原生 Figma

- 文件 key：`zeLNExz4TbpWRW3uiahef7`。
- [Photo v1 设计页 921:1104](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=921-1104)。共 60 画板：51 新实图稿 + 9 保留稿。
- [15 图权威映射 940:1104](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=940-1104)。源层仍在 `0:1` 页。
- 全部六位个人页与八项发行详情的三宽节点，见随附原字节 [FIGMA-NODES.md](../../handoffs/codex-20261022/sol-wooah-photo-v1-reference/photo-round/FIGMA-NODES.md) 与 [FIGMA-NODES.json](../../handoffs/codex-20261022/sol-wooah-photo-v1-reference/photo-round/FIGMA-NODES.json)。这些是设计节点，不是浏览器视口通过证明。

| 主要页面 | 1440 节点 | 390 节点 | 320 节点 |
| --- | --- | --- | --- |
| 首页 | `945:1662` | `945:1869` | `945:2076` |
| 成员目录 | `945:1789` | `945:1998` | `945:2205` |
| WOOYEON 个人页 | `949:3566` | `949:4096` | `949:4627` |
| 发行目录 | `949:3730` | `949:4260` | `949:4791` |
| UNFRAMED 发行详情 | `949:3937` | `949:4468` | `949:4999` |
| 影像目录 | `921:1105` | `921:1378` | `921:1651` |
| BLUSH 影像详情 | `921:1273` | `921:1546` | `921:1819` |
| 单轴时间线 | `921:1305` | `921:1578` | `921:1851` |

### 15 图身份和原图源节点

身份映射来自原 Figma 940:1104 及 Photo v1；本次不重传原图，不重新主张图片版权许可。`assetKey` 是原始 SHA-256，**不是 Figma imageHash**。文件名、尺寸、字节和两种哈希的完整台账仍在原交付。

| 图片身份 | 稳定身份 / Spotify ID | 源节点 | 原来源类别 |
| --- | --- | --- | --- |
| WOOAH 五人时期团图 | `recvxyEBDZs5Ic` | `936:1095` | 日本官方资料照片，拍摄日未注明 |
| NANA | `recvxyICzHGJek` | `936:1098` | 日本官方成员资料照片 |
| WOOYEON | `recvxyICzHzhWr` | `936:1109` | Singles 发布版摄影 |
| SORA | `recvxyICzHu6mX` | `936:1108` | Singles 发布版摄影 |
| LUCY | `recvxyICzH84mF` | `936:1096` | Singles 发布版摄影 |
| MINSEO | `recvxyICzHi2X6` | `936:1097` | Singles 发布版摄影 |
| SONGYEE，历史成员 | `recvxyICzHxcEJ` | `936:1107` | NV Entertainment 提供，Edaily 2020-06-27 采访配图 |
| QURIOUS | `7IHkMRNQRxK5N0uRytCKA1` | `936:1103` | Spotify 正式发行封面 |
| VOODOO DOLL | `1VX9QyM1VF5Bfh7wP2ZjiG` | `936:1099` | Spotify 正式发行封面 |
| BLUSH | `6wwhS7RzJx0qQS9SOeohZe` | `936:1102` | Spotify 正式发行封面 |
| Wish With W : Vol.3 | `4iHtzmB65LzS88mAtbckKG` | `936:1100` | Spotify 正式发行封面 |
| UNFRAMED | `09fRNZvZnqJqm7024Sa7uP` | `936:1105` | Spotify 正式发行封面 |
| WXW | `13maoZj59uUsJEh99CbCxY` | `936:1106` | Spotify 正式发行封面 |
| Endlessly you | `4wiRKxMEo5agPSLttu18FQ` | `936:1101` | Spotify 正式发行封面 |
| Shining on you | `7t8xBLIkt24xrDwvyfzUJ5` | `936:1104` | Spotify 正式发行封面 |

### 其他已留存 Figma 入口

以下可读性由 Sol 收官记录确认，不等于本次重新视觉验收：

- [Billlie · 596:1167](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=596-1167)
- [i-dle · 252:1116](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=252-1116)
- [NewJeans · 459:1095](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=459-1095)
- [LOONA · 266:1095](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=266-1095)
- [tripleS · 348:1097](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=348-1097)
- [IVE · 159:1095](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=159-1095)
- [BADVILLAIN · 415:10592](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=415-10592)

## 6. 已存 GitHub 历史入口与原交付索引

优先从第 1 节完整 v186 主交接树和隔离候选接续，以下只用于历史溯源，不整体覆盖当前代码。

| 成果范围 | 固定提交入口 | 注意事项 |
| --- | --- | --- |
| WOOAH / Billlie，59 份源码 | [b5fa2ac · START-HERE](https://github.com/KAtOReNA7/idol/blob/b5fa2ac25c7bf277df2f71dfd719bf63c2eea632/handoffs/sol-wooah-billlie-20261021/START-HERE.md) | 不是完整生产工程，也不是最新 native WOOAH。 |
| Billlie 夜间历史修订 | [b9e1012 · candidate-overlay](https://github.com/KAtOReNA7/idol/blob/b9e101262c696c2c77ed6aee62d004370c53cd21/handoffs/billlie-night-20261022/candidate-overlay.json) | 不覆盖已认可 React 实现。 |
| Cherry Bullet / Weeekly，92 份含 host 修复源码 | [a277d1a · START-HERE](https://github.com/KAtOReNA7/idol/blob/a277d1a90661f1652588d03aad349d7016084c7a/handoffs/sol-cw-v1-hostfix-20261021/START-HERE.md) | 仍需区分源码、资料、Figma 与网页终验。 |

以下为原交付的 Library 身份，便于拥有相应访问权的接续者查找；不是公开下载链接，也不代表附件已复制进本补遗。

| 交付 | Library ID / 版本 |
| --- | --- |
| WOOAH Photo v1 | `libfile_ce5307ba17fc819181bfb33ab9690f03` v1 |
| WOOAH 原 15 图 | `libfile_800e3630029c8191a7eb5c4d5f94bf9d` v0 |
| HITGS 已验页面 | `libfile_b851fffa077081919ab1853515a983f3` v1 |
| HITGS 未激活读取候选 | `libfile_f1b7b199f2ec8191959dbf12265a6254` v0 |
| KATSEYE / AtHeart | `libfile_11f5f1c643e48191aa09ab50503706cb` v0，后修优先 |
| IZ*ONE / fromis_9 | `libfile_5f43a3bc8a30819182028a04eefb1778` v0，后修优先 |
| EVERGLOW / Rocket Punch | `libfile_45ede5ca2e1c8191aa6d6c858256d4a7`，来源未在此重申版本，后修优先 |
| Cherry Bullet / Weeekly 目录 v2 | `libfile_7c447bd6ac248191968a96376045df49` v0 |
| 15 团历史总接续说明 | `libfile_174689dcfc208191b79999e0021cc9f6` v5，仅历史溯源 |
| RESCENE / PURPLE KISS 总索引 | `libfile_9626a714456081919584c73a1136a6a5` v3，内含 v1 设计包及两轮增量的 ID / SHA |

历史 Sites source 标识不能当作本仓库可 fetch 的 Git commit。旧文档中“暂不迁移”的阶段性决定已被本次迁移指令替代；仍有效的设计、真实身份、历史阵容、日期精度和 31 张卡片图 240/320 px 限制须继续保留。

## 7. 本补遗的来源与验证范围

- 资料来源：Sol 最终收官报告，创建于 2026-10-22 13:38:10 UTC，更新于 13:40:25 UTC；完整读取 8,647 字，包含末尾“收官索引未写入成功、无新包交付”的边界。这里按项目事实重新整理，不公开原始会话。
- 当前状态校正：主交接提供的已入仓提交、v186 全源与候选隔离状态，以及 combined 候选说明中的最新验证边界。Sol 收官报告不拥有后来主会话工作状态的覆盖权。
- 本次实测：两源码 SHA/字节一致；两份节点文件与 CHANGES 读取、JSON 解析及原字节复制；节点数 51 + 9；发布前检查限定文件中的私有绝对路径、临时链接和常见凭证模式。
- 不在本次范围：重新浏览 Figma、完整应用运行、浏览器 QA、真实 catalog/保存测试、原包整体哈希重算、推送、合并或部署。

接续者只需把本文件与历史参考并入交接文档，无需等待 Sol 再回复。下一步仍是按当前 PRD 从真实基线推进已隔离候选，逐项补齐未验项，不能以重新打包替代网页开发。
