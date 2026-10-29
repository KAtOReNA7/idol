# 20261029-group-evidence-followup

## 范围与基线

用户已要求按团继续缺口研究与开发，并明确 ILLIT《It’s Me》另行整理完整歌曲版本。本轮仍不部署。正式工程 `apps/idol-site/`，活动分支 `codex/group-evidence-followup-20261029`。

开工从最新 `origin/main` 创建分支并普通合入 PR46 `cef1765801ce62739c44308292a680b16e681597`，已包含 PR45 `dada774ba79aba8e9863a88822e71644669ce7cb`、PR44 与人工填写保护。2026-10-29 连接恢复后再次显式 fetch main／PR44／PR45／PR46，四个远端 SHA 均未变化；PR44／45／46 仍 draft/open/unmerged。新 PR 将以 PR46 分支为 base，不把堆叠的旧增量重复审阅。

原机 17 修改＋5 未跟踪文件已保存在 `E:\project\idol-local-backups\20261029-human-handoff-103333`，stash `2d1acc90331c12ba56d339418a3295a063327fe3` 不应用。连接恢复后，当前任务另存 27 文件到 `E:\project\idol-local-backups\20261029-resumed-group-checkpoint-132144`，SHA-256 逐文件相同。没有 reset、clean、强推、覆盖旧 stash 或恢复过期私人导出。

## 实现与来源

1. MADEIN《PUNG!》新增四个具名发行封套参考；公开资料集合 102／527 → 103／531，复用原图。旧 102 完整对象与元数据不变，24 作品通用参考归档不删。只认发行封套范围，不外推逐人录音、MV 出镜、私人关系或当前团体全员；569×854 限制保留。
2. NMIXX《Hey Gabby!》以 Bugs 独立 Dance Video 目录和 Newsis 的发行商报道修正旧研究说明，不再仅因 `[MV]`／Performance 标题排除。原 MV／加工重传仍排除；候选完整范围与音轨未核，正式舞台不变。浏览器核查发现原组件没有展示 searchReview，随后补用户可见的待核说明与来源，验证另列。
3. ILLIT 已有完整原曲 `rec28ldfRTrKtW`、短版 `rec28ldfRTrKy2` 和双方关系。仅加“完整歌曲版”／“约 60 秒短版表演”标签和定向导航标签；71 identities／37 edges 保持。严格 12 字段与双端匹配、native live 投影保持。完整舞台 `00IPFnp2Tdg`、短版旧舞台 `a2AvaSdqN28` 全对象保持，不重复导入、不转移记录。

详见 [逐团报告](../group-evidence-followup-20261029.md)、[完整范围证据](../evidence/20261029-group-followup/illit-full-version.json)、[MADEIN采用回执](../evidence/20261029-group-followup/adoption.json)、[Hey Gabby前后回执](../evidence/20261029-group-followup/heygabby-review-update.json)。

45 团 161 分类键全部对齐，未解决 161（含 1 部分补强），0 完整事实关闭。范围审计修正了 Nitepunk 来源仅支持 Spicy、Dork 署名不可靠、Jessica 仅复核旧证据等表述；不把有界研究冒称全网穷尽。6 个无当前任务团不计新验收。人工 CSV／原模板与冻结队列原样保留；新决定在增量报告记载，不自动填入人工答复栏。

## 验证记录

- 初次最终专项共 85 项通过：MADEIN／历史公开参考／Hey Gabby数据／舞台选源／ILLIT身份守卫与双向导航。生成器人工填写保护 6 测试／18 场景通过；161 分类键校验通过。
- 历史两套舞台测试 9 项中 4 项失败：continuous 旧 stage-videos cohort hash，formal 的 493／496 数量、Right Now 旧源 hash、已换绑旧 videoId 保存返回 409／原断言 200。Hey Gabby 的本轮差异先严格核完整 after 后，在克隆中还原 before 再核历史 hash；没有跳过目标或弱化 hash。上述旧基线失败独立比较后记录，不能称全仓测试通过。
- MADEIN 本地 1440／390 两布局、8 原图查看、8 成员跳转及回链通过，错误 0，私人写入 0；使用公开身份和空个人字段夹具，截图在仓外，见 `ui-madein.json`。
- 最后应用改动后的核心专项 91 项全部通过；扩大公共目录／导航相关检查后合计 133 项、130 过／3 失败。新增 3 失败为两个旧源码正则（bmExperience 和旧 hidden section 结构）及目录 <24KB 的旧门槛（现基线 45,655 bytes）；在 cef 原始源码及原始数据下独立复现相同失败。连同上述 9 项历史舞台检查，主进程两组记录共 142 个互不重复 Node 测试，135 通过、7 个已独立复现的基线失败。未修改旧设计或放宽这些断言以造全绿。
- 最后 TypeScript 与正式构建均 exit 0；既有代理、chunk 大小、插件耗时和静态路由分类警告保留，未当作部署。13 份保护文件逐字节一致，原 102 条完整集合保持，496 舞台绑定保持，diff-check 通过。汇总见 `validation.json`／`preservation-validation.json`。没有由构建成功推断线上通过。
- ILLIT 短→完整→返回与两侧原舞台、Hey Gabby 默认折叠／展开收起／3 来源可操作性，均在 1440／390 两尺寸真实本地浏览器通过，8 张截图已目视；横溢出／console／pageerror／failed request／POST 均 0。通过实际 native live 公开身份投影链生成夹具，空个人字段，非手填 versionDisplay。见 `ui-version-review.json`。
- 新研究说明经显式 publicNote → researchNote，只允许摘要和来源标签／HTTPS 链接；匿名输出剥离原始 searchReview 和嵌套未知字段，其他 136 行不自动公开。没有新 API、鉴权、保存路由或评分绑定。独立审阅另有 46/46 专项（与主端有重叠，不重复相加）；非法 URL／秘密 canary／精确历史还原验证见 `independent-audit.json`。

## 发布与私人数据边界

恢复后只读 Sites 核实仍 v201／active；public／1 owner／0 external／0 groups／revision2，既有源 `374ebe6de70a2e51641361740dde68246aed8b1c`，本轮新版本保存 0、部署 0。正式浏览器、真实 owner 保存、全量个人字段与全视频音轨未验。本地构建或公开夹具不替代这些验收。

一次有界 DB 读取只取得 native／epoch6 和截断的保存／原生记录样本，不能证明目标空分、完整日志或线上旧绑定；因此正式舞台变更 0，私人写入 0，原始私人样本不入仓。未来换绑重新取真实新鲜 owner 数据，0 分不是空分。51 团设计、原图、稳定 ID、私人记录、访问和 owner 鉴权保护；个人页统一排版待另行决定。

## 运行、交付与下一步

本地在 `apps/idol-site/` 使用现有 Node／依赖，`node node_modules/typescript/bin/tsc --noEmit`、`npm run build`；预览用项目既有 dev 命令。本次未安装依赖或部署。QA 服务使用 127.0.0.1:5189 与独立浏览器，公开 fixture 原始文件不含私人字段；截图／完整执行日志保存在 `E:\project\idol-local-backups\20261029-group-qa`，不上传 GitHub。

GitHub 推送与 PR 读回在执行后记录到 `evidence/20261029-group-followup/github-delivery.json`。仓库 public；仅现有批准范围、公开来源和脱敏证据进入提交，不增加秘密、凭证或新私人答案。接续先读 NEXT／最新报告，不只接旧 main／PR45，不重复已有完整歌曲、舞台或图片批次。

剩余推进依赖：完整视频／音轨／具名字幕、同套原图或统计原出处；真正采用舞台还需新鲜 owner 数据和完整日志。ILLIT 的作品范围决定已经落实，不再重复询问。
