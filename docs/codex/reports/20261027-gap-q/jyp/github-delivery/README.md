# Q–Z 原件 GitHub 交付回执（2026-10-27）

所有新增原件已在 GitHub 辅助分支 `codex/asset-transfer-20261027` 可达，最终提交 `73d6d0d156031e7f2057c28a1a98b0efba921a37`，根树 `6ee5299ccd6bc95e84cc017587a297cdab089380`。此回执只证明 GitHub 素材交付；正式任务分支推送和 Sites 发布由主任务分别记录。

核对范围为 `706754e75cf6a7a88252746616a03a5f8f053b4a..90167e1e71855f36f9b7f1d1fddd71fd35eae309` 的 `apps/idol-site/public/` 实际差异，精确等于 Q–Z 的 486 个新增路径、481 个独立 Git blob、783,093,360 原字节。每个文件本地长度、SHA-256、Git SHA-1、冻结任务提交中的 blob 均一致；远端完整递归树无截断，全部路径及 Git SHA 一致。基线 9,152 个文件和前辅助提交的 9,410 个文件全部保留，无额外 public 变更或删除。

普通全量 push 两次 HTTP 408 后，采用独立 REST blob 上传、独立临时 index 的串行小 Git 包、以及 GitHub 插件原生 create_blob 补传。最终成功回执分布为 REST 448 个路径、Git 小包 32 个路径、原生插件 6 个路径；5 个同内容别名保留各自路径，不重复修改原文件。Q/R/S 首轮 233/268，延长超时及 Session 后 238/268，剩余失败已由后续路径解决，不能把旧 checkpoint 的失败状态当作当前缺失。

小包每批结果保留在 `smallpack-attempts.json`：一次约 15.7 MB 包出现 curl 55，确认远端未前进后，以单次命令级 Content-Length 设置续传成功。此试验耗时较长，后续继续较小包；没有更改全局 Git 网络设置、系统代理、TLS、证书或权限。原生插件补传 6 个此前 REST 难传文件，22,734,692 字节均再次从 GitHub blob API 读回，长度/SHA-256/Git SHA 匹配。另最大 9,874,201 字节文件的 raw HTTP 读回证据保留在小包逐文件回执。完整远端树哈希核验覆盖全部 486 个路径；没有声称逐个重新下载全部 783 MB。

辅助树分批构建 `identities → batch → artist → public → idol-site → apps → root`，避免大型扁平 tree 请求超时。最终辅助提交只新增原件，单父提交为 `22e43927971c85db8391855f16510f29932cae21`，以 `expected_sha` 和 `force=false` 快进。写入后已读回 ref、commit、tree 和父提交；核验时 main 仍为 `c15995737b58c67a25edff2da5ebbdc7b1cd2c93`，任务分支仍为 `706754e75cf6a7a88252746616a03a5f8f053b4a`。子任务未改根工作树代码、index、main 或任务分支。

主任务实测更正：仅fetch后直接push仍把451个已上传原件重新打包，723.31MiB推送触发HTTP408，任务远端确认仍706754。经merge-tree验证，普通合并辅助历史的文件树与当前开发HEAD完全相同（df2210d35f46c1e587746b48da1b9cfabb3b7365）；主线程随后创建7ee8a2d16e53358302ab8000af66a550bbb921cc，首父90167e1e保留真实开发历史，次父73d6d0d1记录已验证的素材历史，没有文件变化。重新生成的包为20.03MiB，已不包含公共原件blob；随后普通push成功，GitHub ref API读回任务HEAD为7ee8a2d16e53358302ab8000af66a550bbb921cc，详见主线程task-push-recovery回执。辅助分支仍不能替代正式工程或开发基线。

交付凭据仅通过既有 gh 登录在进程内读取，未输出或写入仓库；未添加 Actions 工作流。辅助 ref 暂予保留，直到主任务及后续交付确认，不能以删除它替代正式任务推送。

证据入口：`final-delivery-proof.json`、`verified-original-manifest.json`、`final-tree-objects.json`、`native-blob-readbacks.json`、`smallpack-file-receipts.json`、`smallpack-attempts.json`。
