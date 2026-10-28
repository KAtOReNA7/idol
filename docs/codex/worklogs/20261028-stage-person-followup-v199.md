# v199 接续工作记录（2026-10-28）

## 已核起点

- 本地旧任务的 8 个已修改文件和 8 个未跟踪文件完整保存于 Git stash `7779dd2e08e211b1219c474b16838e9915ee1a0e`；不自动应用旧 v196 补丁，也不删除此恢复点。
- 已显式 fetch main 与 `codex/statistics-relations-followup-20261027`。main 为 `852f7506a4f921fff4e4d24fe70e8d607c7d40f5`；PR44 draft/open/unmerged，远端 HEAD 为 `21b12a6f0d49f355ee639ae87bb2b294ba58513f`。
- 干净后从 origin/main 新建 `codex/stage-person-followup-v199-20261028`，普通 merge PR44 远端，结果 fast-forward 至上述 HEAD。没有 reset、clean 或强推。
- Sites 已核 v199 / succeeded，正式源 `747aa997a7512592a305a5e21161ded078fa519d`，部署 `appgdep_6ae1cb52942c8191b0f93d099994fd3e`；原生 source helper 已打开同项目最新源。
- 受众 public / 1 owner / 0 external / 0 groups / revision2；存储 native / epoch6 / 原快照 / done206。

## 本轮工作范围

补入用户已明确提供但远端仍未采用的五项 X 人工观察；继续剩余舞台、人物公开证据研究。只采用精确来源实际支持的范围，不推定全员，不重复现有批次。保留全部评分、原图、稳定 ID、关系、设计、权限和 owner 鉴权。GitHub 与正式部署独立核验。

Codex 内置页创建本次在 45 秒超时，未操作 Chrome，不沿用已结束的单次 Chrome 导出授权。网页验收与 owner 导出未通过，不用旧备份替换舞台评分来源；其他公开研究与数据工作继续。

## 本地实现与检查

五项X人工观察已采用，统计未知15→10。两批11作品44参考槽已追加，累计91作品488槽/229份既有原件，剩35作品待证。493舞台、112新增缺口、11旧替换保持；12作品21精确查询的舞台研究没有新合格来源。当前队列与采用回执均在 `docs/codex/evidence/20261028-v200/`。

统计34项与联合95项测试通过，共129项互不重复的定向测试；TypeScript通过。独立复核确认5X之外统计不变、旧80人物对象不变、原图和舞台/私人关系/鉴权/设计不变。四团完整HTTP HTML可读新值；VVUP信息依赖客户端，HTTP只读到加载态，不能称五团浏览器验收通过。

GitHub实现 `aac36bd631ee1a84780fa1dbfb404561bba32dcf` 已推送并读回。PR45为本轮增量draft，base是未合并PR44的分支；PR44与PR45均open/unmerged，main保持。Sites源 `e27a7adf04140b130cd1d10568100c13f6258bde` 已保存v200，部署 `appgdep_6ae1efcd18648191bc43e2760bc2f9eb` succeeded，终态时间2026-10-28T12:52:43.228066+00:00。完整1421文件包逐字节核对通过，发布后访问策略与native/epoch6/原快照/done206保持；没有私人写入或全量个人字段hash复验。发布回执见 `../evidence/20261028-v200/publication.json`。后续交接与回执提交不再重复部署。
