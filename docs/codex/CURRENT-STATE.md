# Codex 迁移状态快照（2026-10-22）

## 最新执行决定：IZ*ONE 新审阅站 v6 待确认（2026-10-24）

用户“同意，继续开发”已确认 i-dle v5；本轮仅推进 IZ*ONE。已发布同站 **v6 owner-private 只读审阅**：十二位历史成员、18项发行版本/81曲目、10既有作品/17影像槽、108既有关联与12原事件，原图及成员/作品手帐精确往返。181旧非root文件SHA保持，root仅加入口；旧站v33与主站v186未改。

**沿用 v186 引入的旧 IZ*ONE 候选奶油玫瑰、Bodoni字体及展册语言，该候选未曾获用户确认；不是官网复刻。** 日本旧官网只有重定向占位，韩国旧站现为预告镜像。照片来自DBKpop具名转载，发行来自Bugs；不能称官网原图。复用i-dle v5路由/公开投影与共享手帐布局及既有IZ*ONE配色，交审必须披露版本、范围、官网状况和差异。历史头像仅在合法IZ*ONE返回上下文启用，保留成员当前归属。

23专项/导航、类型、正式构建、90项九宽布局、51交互通过。旧timeline-navigation的11失败已在基线字节复现，未放宽pins。Figma30可编辑画板、5个不同关键节点完整取稿；已修隐藏占位与时间轴排布，字体替代和全量像素对照仍待完善。线上部署成功，IAB导航40秒及读取30秒超时；线上完整交互、真实保存/播放与80%/125%原生缩放未验。

分支 `codex/izone-review-completion`，基线 `10fd7beb2e6029783d739c26267b0fad5da3fd4a`；正式工程 `apps/idol-site/`。原图、稳定ID、个人字段与权限保持。[打开IZ*ONE v6](https://idol-sol-review-oct24.wuke40758.chatgpt.site/artists/izone/index.html)。详见 `docs/codex/worklogs/20261024-izone-review-completion.md`。

**等待 IZ*ONE 网页确认后再开始 fromis_9 或下一团，公共功能例外。下方旧门槛均为历史。**

> 这是迁移当时的历史记录。最新接续（2026-10-24）：HITGS新站v2已确认，AtHeart新站v4（宽屏发行区已修复）待网页确认；分支 `codex/atheart-review-completion`、draft PR #25。详见 [RESUME](RESUME.md)、[STATUS](STATUS.md) 和 [AtHeart交接](worklogs/20261024-atheart-review-completion.md)。下文旧“等待人工反馈”和初始Sites source不能作为当前结论。

> 完整 v186 源码已在提交 `f24075fc98893793e82adbc92cadc9e58257728f` 推送并读回核验，工作目录为 `apps/idol-site/`。本次文档和三个隔离候选随当前交接提交提供。用户已批准本次现有评分、备注、观看快照公开入仓；不扩展到未来任意数据、秘密或凭证。

状态基准：2026-10-22。生产、私有候选站与 GitHub 开发沙箱是三个不同对象，不能用其中一个的验证代替另一个。

## 已核入口

| 对象 | 当前入口与版本 | 适用边界 |
| --- | --- | --- |
| 正式主站 | https://idol-lens-private.wuke40758.chatgpt.site | 仍为 v186 A-only；没有发布本轮 GENBLUE、WOOAH 或 MEOVV B 路线 |
| 正式 v186 源码标识 | Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350` | 这是 Sites 源码标识，不是已核可 fetch 的 GitHub commit |
| 可恢复基线 | v185，Sites source `5857bc86212615af58203b15317d5cd471ef1324` | 保留已认可设计；不是可直接执行的 Git 回滚命令 |
| GitHub 仓库 | https://github.com/KAtOReNA7/idol | 13:19 UTC 核验为公开；原 main 是 Next 开发沙箱，不是完整生产源码 |
| 迁移前 main | `b9e101262c696c2c77ed6aee62d004370c53cd21` | 2026-10-22 02:04 UTC 核验；迁移提交以实际仓库 HEAD 为准 |
| GENBLUE 候选 | https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue | owner-only 私有设计检查站，非生产 |
| WOOAH 候选 | https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah | owner-only 私有设计检查站，非生产 |
| 两个候选当前站源码 | Sites source `b8e33981597e0d47b214a81ddf3022f28d1e087e` | 2026-10-22 12:13 UTC 发布成功；不能当作 GitHub commit |

候选页人工审阅链接已在 12:27 UTC 交给用户，当前没有用户通过反馈。链接公开列在文档中不改变站点访问权限。

## 本轮交接准备与验证

- 交接分支 `handoff/codex-20261022` 已核源码提交为 `f24075fc98893793e82adbc92cadc9e58257728f`，包含完整 v186 源、来源清单与根 tsconfig 隔离；main 未改变。本次补齐入口、接续规则与三个隔离候选，以分支实际 HEAD 为准。
- v186 源码已精确重组：3,954 文件、642,362,678 字节，tree `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；1,863 图片共 575,168,413 字节另存原样副本。以上是源码规模，不是正式部署 TAR 体积。
- 13:03 UTC 执行纯 `tsc --noEmit --incremental false`，exit 0、0 diagnostics、47.6 秒。复用已核相同依赖、锁文件和 npm 配置，3,954 文件的 SHA/mode 未变；不代表干净检出的新安装、构建、浏览器或部署通过。
- 完整源码提交 `f24075fc98893793e82adbc92cadc9e58257728f` 已正常 push 并读回，其他电脑可从交接分支取得。

多机接续以 [STATUS](STATUS.md) 的实际共享基线、任务分支/PR 和 `worklogs/` 为准。不能把本地准备、源码 hash 或一句“完成”当成远端已交接。

## 整理后的仓库入口

以下为本次交接规定的目录布局。交付提交必须逐项核验真实存在、完整性与读取方式；目录名本身不是已完成迁入的证据。

| 仓库相对路径 | 用途 |
| --- | --- |
| `apps/idol-site/` | 唯一正式开发入口，精确 v186 源及本次获准公开的既有快照 |
| `docs/codex/` | 本轮 PRD、状态、Codex 开发入口与验收四份规范 |
| `handoffs/codex-20261022/meovv-b/` | 尚未上线的四图 B 路线增量、保护检查与来源清单 |
| `handoffs/codex-20261022/combined-integration/` | GENBLUE v2.2 / WOOAH v1.2 的57文件runtime、差异、素材依赖与验收边界 |
| `handoffs/codex-20261022/astra-izna-ifeye-v3/` | izna/ifeye 隔离 v3 完整本批源码、素材映射与精确恢复的原图；随本次交接提交到位，仍须核实际清单 |
| 仓库根目录的原 Next 项目 | 历史合成沙箱，只作参考和限定测试，不是生产开发基线 |

用户于 2026-10-22 13:22 UTC 明确选择保持仓库公开，并允许本次现有评分、备注、观看快照随源码进入该公开仓库。完整源已在 `f24075fc98893793e82adbc92cadc9e58257728f` 推送并核验。该决定只覆盖明确数据、仓库与本次用途，不推广为未来新增敏感数据或无关导出权限。若最终改交脱敏变体，应明确标识，不能同时声称与 v186 原 source 字节完全一致。

## GitHub 沙箱现状

迁移前 main 提供核心工具、已整合 UI 和合成测试，未包含完整生产后端。目录和历史 manifest 不能直接作为最新完整源码清单。

- `package.json` 使用 Next；支持 `dev`、`build`、`typecheck`、`verify`、`test`。
- `/api/catalog` 返回明确标记的合成资料，原 README 记录六团、十二位虚构成员和十八条虚构作品。
- `/api/save` 固定返回 403，不保存数据。没有生产凭证、数据库导出、正式写 API 或可替代生产的部署配置。
- 正式图片与部分字体不在旧沙箱，图片引用已替换为中性 SVG。不能据此验收真实素材、字体或完整设计。
- 根 `SOURCE-MANIFEST.json` 与 `docs/FILE-MANIFEST.json` 保留为旧 sandbox 历史清单；当前原生基线只用 `docs/codex/SOURCE-MANIFEST.json`，不将旧清单冒称全仓索引。
- 旧 README、AGENTS 和设计要求中的“不迁移 Codex”已过期，应更新入口但保留有效产品标准与历史依据。

若 `apps/idol-site/` 尚未包含明确标识的完整 source 或已说明的脱敏变体，先补齐该输入，不能声称“已从仓库复现生产”。候选目录与可用素材也须核验，不能把临时机器路径当交接完成。保留根沙箱时，应隔离根 `tsconfig` 的广泛包含规则，避免其误收 `apps/idol-site/` 文件；两个项目各用自己的 package、锁文件与依赖。

## 收官反馈

Astra 与 Sol 本轮均已收官。Sol最终反馈13:38形成，主会话13:53已完整读取并归档为 [SOL-HANDOFF](SOL-HANDOFF.md)。完整原生源与隔离候选足以继续，不再等待旧会话回复；各团未完设计、资料、接入与上线仍按补遗和本文件分别记录。

主会话已独立复核通过 `253633c5bcf2b58c06a54c4d817df9d168182fcf` 的有界入口和候选交接，不表示产品验收通过。WOOAH Photo v1已由主会话取得，两源码SHA一致；旧式源码仅作设计参考，不覆盖combined内native v1.2。已过私有合成QA关键返回、队列、原图与普通80%/125%缩放，真实catalog、保存、精确视口和生产集成仍待验。

## 产品与数据边界

正式产品的评分、备注和观看记录按用户要求公开读取，写入仍 owner-only。候选站中的评分与观看均为 synthetic；没有本轮真实数据写入或编辑器验收。

完整生产源码内的关键实现入口如下，均相对于 `apps/idol-site/`。不保证旧沙箱具有同名或等价实现：

- `lib/idol/types.ts`：Group、Member、Work、Rating、Catalog 及影像类型。
- `lib/idol/fields.ts`：现有字段 ID 和可编辑字段白名单。
- `lib/idol/public-catalog.ts`、`public-reader.ts`：公开读取投影与媒体读取边界。
- `lib/idol/native-reader.ts`、`native-save.ts`、`save.ts`：现有读取和保存语义。
- `db/schema.ts`：D1 记录、原生快照、图片、保存日志和相关控制结构。
- `app/artists/`：团体独立页面；`lib/idol/` 与 `data/`：共享功能、显示映射与资料。
- `scripts/build-artist-runtime-data.mjs`、`build-snapshot-fallback.mjs`：构建前的数据一致性检查。
- `scripts/prune-unused-build-assets.mjs`、`verify-sites-expanded-archive.py`：构建资源清理与完整归档容量检查，必须按接入后的真实文件重新审查。

不要根据页面 UI 重新建立评分模型，或把旧 sandbox 的拒绝写入路由误接到生产。

## 已认可设计与待验收候选

| 项目 | 已知状态 | 下一步与限制 |
| --- | --- | --- |
| Billlie、UDTT、YOUNG POSSE、i-dle 已认可部分 | 属于需保护的设计成果 | 新变更做针对性回归，不为了模板统一推翻 |
| GENBLUE BlueCut v2.2 | 独立候选已接入私有检查站；最新 Figma 变化已在原生 v2.2 实现，关键实际浏览器合成检查完成 | 不因旧 v0 包未同步而重复重做；等待人工反馈；精确视频图片仍缺 8 张 |
| WOOAH editorial v1.2 | 独立黑色时尚实图候选已接入同一私有站 | 等待人工反馈；精确视频图片仍缺 24 张；8 条发行研究条目未必具有真实 release ID |
| WOOAH 历史成员 SONGYEE | 历史身份需独立表达 | 不混入当前名册，不因当前阵容而删除历史 |
| izna/ifeye 隔离 v3 | 已找回含 73 项 manifest 的包，本批 15 份源码完整；30 张原图依赖已闭合；当前 v186 不含这组隔离目标文件，未合入 | 15 张复用 v186 原字节，另 15 张已精确恢复；仍待原生宿主/runtime resolver、评分链路接入与上线验收 |
| 其他范围团体 | 以已交源码与证据逐团核实 | 不能按文件存在、历史测试数或旧“完成”状态推定本轮设计通过 |

候选的关键浏览器操作通过不等于所有尺寸或写入链路通过。此次浏览器组织策略禁用了 DevTools，精确 320/390/1440/2048/2560 断点尚不能因此判为通过。普通 80% 和 125% 缩放已检查，但不能代替手机真视口。未完成项必须继续保留。

izna/ifeye v3 的历史 source 标识不是已核可 fetch 的 GitHub commit。本批源码是完整 after，不必重拼旧增量。原 v3 包本身不含运行原图，本次已从三个明确的历史输入精确恢复 15 张共 8,054,282 字节，另 15 张引用 v186 中同 SHA 原图，30 张共 11,044,378 字节。恢复图大小、SHA、尺寸和解码均通过，无重编码。素材闭合不代表原生宿主、runtime resolver、评分链路或上线已验收；最终可取候选路径以实际入仓清单为准。

## MEOVV 四图 B 路线

生产仍停留在 A 路线，B 路线没有上线。已准备的 B 候选只涉及固定四张原始 JPEG：将原字节放入现有项目私有存储，经既有只读读取路径提供图片；不改变整个站点或存储的权限范围。

- 四张源图原始字节均保留。
- owner 读回 SHA-256、图片解码及匿名查看四图已经验证。
- 候选已完成构建及严格远端 prune；相关逻辑源标识为 `7d76d3d42acaed953f3158e659274ced9889b0d5`，不是已核可 fetch 的 GitHub commit。
- 最终 9 项保护检查尚不能视为已经同步到所有待发布源码副本。接续者须以实际交接源码检查，不凭旧结论继承。
- 构建排除数量 198，为原 194 项加固定四图。prune 后记录为 2,373 个文件、257,775,621 字节；此值不是完整 Sites 归档容量通过证据。
- 正式完整 TAR 的 256 MiB 上限及至少 2 MiB 余量尚未验证。因此不能宣称容量问题已解决、可以发布或已经上线。

Sites 预算按完整展开 TAR 口径检查，不能拿 gzip 大小、静态资源小计或 payload 小计替代。新构建会改变 hash，必须审查并更新对应 pin，不能关闭 guard 让构建通过。

融合 GENBLUE 时有一个已知阻塞：旧 pruner 整删 GENBLUE 的旧 batch-b 目录，但新候选仍引用其中 7 张图片。原脚本直接复用会 fail-closed。必须查明这 7 张的实际引用，改为精确删除未引用文件，把保留素材算入真实部署体积，再完整构建和验收。不得为了省空间删原始 source。

## 接续工作顺序

1. 固定 GitHub 的实际完整源码、候选和素材入口，核验清单，排除构建产物与秘密；明确哪条命令属于 sandbox，哪条属于 Sites。
2. 在不接触生产写入的情况下复现基线，保留 v185/v186 可恢复版本与已认可设计。
3. 把 GENBLUE/WOOAH 中至少一个候选接入真实工程，补真实 catalog、稳定 ID、精确关联、既有记录入口和浏览器闭环，提供可打开预览；收集用户反馈、补真实视口与 Figma 证据，不擅自记为人工通过。
4. 容量工作如为接入或发布的必要依赖，先解决 pruner 与 GENBLUE 7 图冲突，再完成正式归档量测及 B 路线最终保护检查；不让资源台账代替页面交付。
5. 按 PRD 对下一批 2–3 团推进完整网页，不以仓库整理或技术审计替代产品开发。

## 不能继承的结论

历史的设计、工程、浏览器和生产结论只能用于对应源码、资产和环境。不能跨候选版本、占位图与实图、合成与真实数据、sandbox 与生产或不同设备继承通过状态。

代码中可能包含生成 prerender、revalidation、draft preview 内部密钥的框架逻辑。生成的密钥和含密钥 server build 产物不得提交 GitHub，更不能进入浏览器 bundle。本次曾批准的部署或短效凭证不构成未来创建、续期或扩大凭证权限的授权。
