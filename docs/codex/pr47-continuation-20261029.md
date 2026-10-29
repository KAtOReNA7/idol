# PR47 第二批逐团续查（2026-10-29，未部署）

从 PR47 最新远端 `b209073909b2f43254d836ffe139eba056582f09` 接续同一分支 `codex/group-evidence-followup-20261029`。先确认工作树干净、显式 fetch main 与 PR44／45／46／47 分支，并核实包含 `dada774` 人工清单及交接。PR44—47 开工时均为 draft／open／未合并；没有 reset、clean、强推或应用旧 stash。正式工程为 `apps/idol-site/`。

这次增加四项可见资料：PURPLE KISS 英文《DOREMI》六人发行概念照参考、izna 日版《BEEP》一条待核观看入口、tripleS∞!《Password》和 STAYC 日版《Teddy Bear》各一条节目档案说明。没有关闭任何完整事实缺口，也没有新增或替换正式舞台。前批 MADEIN、Hey Gabby 与 ILLIT 成果保留，不重复导入。

## 采用的证据与范围

| 团体／对象 | 页面增量 | 仍未证明 |
| --- | --- | --- |
| PURPLE KISS／英文 DOREMI `recvxyH5pzFAPL` | OUR NOW 六位具名概念照作为本发行人物参考，使用既有原图。Genie 对应英文曲目，Kpopdays 保留具名官方贴文；官方概念页摘要另行记录 | 每位成员的具体录音参与、目标 MV 精确出镜；不能把发行阵容推为本作全员出镜 |
| izna／BEEP Japan Edition `rec28ldfRTrNsK` | Kstyle 报道所嵌 `Qfez0Db9Iqc`，作为默认待核的官方企划观看入口 | 491 秒企划含过程内容；完整演出起止、日语音轨、可播放性和完整成员范围尚未逐秒核验，不填伪造章节 |
| tripleS∞!／Password `rec28ldfRTrOnV` | 默认折叠说明：TBS PLAYLIST 2025-11-25 节目档案列出本曲，提供原档案链接 | 文本排期不能证明完整官方视频、音轨、演出起止；没有创建播放器或舞台绑定 |
| STAYC／Teddy Bear Japanese `recvxyH5pzoMAf` | 默认折叠说明：TV Tokyo Premium MelodiX 2023-05-01 档案列出日语版，提供原档案链接 | 仍缺同版完整官方视频及播放核验；没有用韩语舞台顶替 |

主要来源：[Genie 英文发行目录](https://www.genie.co.kr/detail/albumInfo?axnm=86664437)、[六人具名概念照贴文汇集](https://www.kpopdays.com/archives/122872)、[PURPLE KISS 官方概念页](https://www.purplekiss.co.kr/contents/68a81a0423389d55f67c6226)、[Kstyle 日版 BEEP 企划报道](https://kstyle.com/article.ksn?articleNo=2263560)、[TBS 节目档案](https://www.tbs.co.jp/playlist-tbs/archive/20251125/)、[TV Tokyo 节目档案](https://www.tv-tokyo.co.jp/melodix_premium/backnumber/202305.html)。官方概念页由研究分支普通请求读取并保存最小摘要；主验证请求后来遇到 403 即停止，摘要哈希不冒称原响应哈希。YouTube 限流后停止，不把报道／嵌入 ID 当全片播放通过。

人物资料累计 **104 作品／537 图槽**，新增六槽完全复用既有原图，旧 103 作品／531 槽及其顶层元数据保持。历史通用参考库仍是 24 作品／119 槽；本作已有具名发行参考后，实际通用回退展示为 **22 作品／107 槽**，没有重复渲染 DOREMI。原 496 个正式舞台绑定、3 个目标之外的 134 条补充记录，以及所有原替代来源／观看线索保持。

## 逐团覆盖与保留事项

45 团、161 个唯一分类键与人工 CSV／冻结队列全部对齐，遗漏、额外、重复均为 0。研究按旧证据复核、有新线索的定向查找、明确拒绝与待证条件记录；并非每项重新读取全文、全片或全网穷尽。完整事实关闭 **0**。原 CSV、人工栏、两份冻结队列均未修改。

| 研究文件 | 团数 | 分类项 |
| --- | ---: | ---: |
| `groups-root.json` | 6 | 34 |
| `groups-baby-itzy.json` | 9 | 39 |
| `groups-ive-purple.json` | 15 | 43 |
| `groups-qwer-young.json` | 15 | 45 |

以上文件均在 [本轮证据目录](evidence/20261029-pr47-continuation/)。八个研究别名已映射回冻结队列规范键，前后映射见 `coverage-validation.json`；应用稳定 ID 未变。

HITGS 的 15 张候选原件经尺寸、遮挡、服装及来源分组核查，仍不能同时满足同次拍摄与质量条件；保持现有五张清晰原图。候选字节只留本地备份，仓库仅保存公开来源和判断元数据。MADEIN 原图尺寸限制继续保留。tripleS 本次找到的 Korean Sales 数字属于前批已有证据，不重复计为新发现或修改现有销量下界／差额。其余未知销量／一位、事实生效日、混音和精确版本／成员范围继续待证。

## 验证与限制

- 定向测试 **47 项：45 通过、2 失败**；新增 4 项全部通过。两项历史集合哈希断言在不可变基线 `b209073` 复现相同失败，具体原值与复现脚本见 `historical-checks.json` 和 `reproduce-historical-checks.cjs`。没有改旧断言来宣称全部通过。
- `npx tsc --noEmit`、`npm run build` 通过；生成的 tsbuildinfo 已单独备份后恢复为开工字节，不提交构建噪音。
- 独立审计 31 项定向测试通过，与上述 47 项有重叠，不能相加；旧对象、受保护文件和六张原图字节核对通过，见 `independent-audit.json`。
- 本地实际页面 **9 布局／22 张目视截图**：四个本轮对象桌面／手机，加旧 Hey Gabby 桌面回归。六张原图开关与成员往返双端通过，新说明默认折叠，查看入口保持只读。证据 `ui-continuation.json` 使用公开身份目录合成空私人字段，经实际投影链路渲染；不冒称真实 owner 数据测试或生产浏览器验收。
- 浏览器错误、失败请求和非 GET 请求均为 0。外链只验证地址、安全属性与可操作性，没有打开完整外部视频；没有全片／音轨比对，没有真实私人保存测试。独立浏览器及本地 5189 服务已关闭。
- 早期 QA 夹具／定位失败和已修正的 `reviewComplete:false` 模式校验问题保留在证据中；最终验证通过。tripleS 既有“暂无舞台”占位图标／标题对比度偏低未改变，不能将本轮验收扩大为整页设计通过。开发服务器的公共目录 import 提示也已记录。

## GitHub 与正式站分开记录

GitHub 保存到原 [draft PR47](https://github.com/KAtOReNA7/idol/pull/47)，不合并、不强推。实现提交与推送读回见本轮 `github-delivery.json`（交付后写入）；工作日志见 [20261029-pr47-continuation](worklogs/20261029-pr47-continuation.md)。公开仓库只新增公共研究、应用及验证资料，不新增私人记录、凭证或候选图片。

Sites 只读核实正式站仍 **v201／succeeded**，源 `374ebe6de70a2e51641361740dde68246aed8b1c`，部署 `appgdep_6ae2262ced008191a526c05ac512fcf5`；public／1 owner／0 external／0 groups／revision2。见 `remote-live-readback.json`。本轮 **没有保存新 Sites 版本、没有部署、没有私人读写**；GitHub 更新不等于上线。

## 下一步所需的实际输入

先沿当前证据接续，不重查已完成批次。BEEP 日版企划需要能确认整首日语演出的准确起止或完整官方片源；Password、Teddy Bear 日版需要完整官方视频，节目文字不能代替。逐人录音／精确出镜需具名原证或清楚区分的人工听辨／观察；统计和日期需相同口径的原始发布。没有这些新证据时保持待证。

正式舞台新增／换绑另须新鲜 owner 目标空分状态、完整保存日志及线上旧绑定；既有截断导出不能复用，0 分不视为空。本轮没有触发该门槛。保护 51 团设计、完整原图、稳定 ID／关系、个人评分／备注／观看、访问和 owner 鉴权。个人页统一排版仍待用户决定，不在本轮暗中统一。
