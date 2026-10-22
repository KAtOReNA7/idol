# Codex 迁移当前状态

> 本次先交付可审核文档；完整源码和候选目录尚待迁入，真实数据入仓范围待用户确认。本文件不表示 Codex 已可直接接手。

状态基准：2026-10-22。生产、私有候选站与 GitHub 开发沙箱是三个不同对象，不能用其中一个的验证代替另一个。

## 已核入口

| 对象 | 当前入口与版本 | 适用边界 |
| --- | --- | --- |
| 正式主站 | https://idol-lens-private.wuke40758.chatgpt.site | 仍为 v186；没有发布本轮 GENBLUE、WOOAH 或 MEOVV B 路线 |
| 正式 v186 源码标识 | Sites source `f0391481cccd85a4eb53cbe9bf63cdd77d30e350` | 这是 Sites 源码标识，不是已核可 fetch 的 GitHub commit |
| 可恢复基线 | v185，Sites source `5857bc86212615af58203b15317d5cd471ef1324` | 保留已认可设计；不是可直接执行的 Git 回滚命令 |
| GitHub 仓库 | https://github.com/KAtOReNA7/idol | 私有仓库；原 main 是 Next 开发沙箱，不是完整生产源码 |
| 迁移前 main | `b9e101262c696c2c77ed6aee62d004370c53cd21` | 2026-10-22 02:04 UTC 核验；迁移提交以实际仓库 HEAD 为准 |
| GENBLUE 候选 | https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/genblue | owner-only 私有设计检查站，非生产 |
| WOOAH 候选 | https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/wooah | owner-only 私有设计检查站，非生产 |
| 两个候选当前站源码 | Sites source `b8e33981597e0d47b214a81ddf3022f28d1e087e` | 2026-10-22 12:13 UTC 发布成功；不能当作 GitHub commit |

候选页人工审阅链接已在 12:27 UTC 交给用户，当前没有用户通过反馈。链接公开列在文档中不改变站点访问权限。

## 整理后的仓库入口

以下为本次交接规定的目录布局。交付提交必须逐项核验真实存在、完整性与读取方式；目录名本身不是已完成迁入的证据。

| 仓库相对路径 | 用途 |
| --- | --- |
| `apps/idol-site/` | 唯一正式开发入口，承载 v186 Sites 源码；是否含真实数据快照及对应变体标识见下方待决事项 |
| `docs/codex/` | 本轮 PRD、状态、Codex 开发入口与验收四份规范 |
| `handoffs/codex-20261022/meovv-b/` | 尚未上线的四图 B 路线增量、保护检查与来源清单 |
| `handoffs/codex-20261022/genblue/` | GENBLUE BlueCut 候选与素材映射 |
| `handoffs/codex-20261022/wooah/` | WOOAH editorial 候选与素材映射 |
| `handoffs/codex-20261022/combined-integration/` | 候选融合的差异、依赖与尚未关闭的验收项 |
| 仓库根目录的原 Next 项目 | 历史合成沙箱，只作参考和限定测试，不是生产开发基线 |

真实评分、备注、观看快照入仓仍待用户明确答复。若允许，应限定在已确认的当前私有仓库与用途内，并继续排除秘密；若不允许，应提供清楚标识的脱敏开发变体。脱敏变体不能同时声称与 v186 原 source 字节完全一致。

## GitHub 沙箱现状

迁移前 main 提供核心工具、已整合 UI 和合成测试，未包含完整生产后端。目录和历史 manifest 不能直接作为最新完整源码清单。

- `package.json` 使用 Next；支持 `dev`、`build`、`typecheck`、`verify`、`test`。
- `/api/catalog` 返回明确标记的合成资料，原 README 记录六团、十二位虚构成员和十八条虚构作品。
- `/api/save` 固定返回 403，不保存数据。没有生产凭证、数据库导出、正式写 API 或可替代生产的部署配置。
- 正式图片与部分字体不在旧沙箱，图片引用已替换为中性 SVG。不能据此验收真实素材、字体或完整设计。
- 旧 `SOURCE-MANIFEST` 与现有树不一致，必须重新生成并验证后才可称为当前完整清单。
- 旧 README、AGENTS 和设计要求中的“不迁移 Codex”已过期，应更新入口但保留有效产品标准与历史依据。

若 `apps/idol-site/` 尚未包含明确标识的完整 source 或已说明的脱敏变体，先补齐该输入，不能声称“已从仓库复现生产”。候选目录与可用素材也须核验，不能把临时机器路径当交接完成。保留根沙箱时，应隔离根 `tsconfig` 的广泛包含规则，避免其误收 `apps/idol-site/` 文件；两个项目各用自己的 package、锁文件与依赖。

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
| GENBLUE BlueCut v2.2 | 独立候选已接入私有检查站；关键实际浏览器合成数据检查完成 | 等待人工反馈；精确视频图片仍缺 8 张，不能冒充全图完成 |
| WOOAH editorial v1.2 | 独立黑色时尚实图候选已接入同一私有站 | 等待人工反馈；精确视频图片仍缺 24 张；8 条发行研究条目未必具有真实 release ID |
| WOOAH 历史成员 SONGYEE | 历史身份需独立表达 | 不混入当前名册，不因当前阵容而删除历史 |
| 其他范围团体 | 以已交源码与证据逐团核实 | 不能按文件存在、历史测试数或旧“完成”状态推定本轮设计通过 |

候选的关键浏览器操作通过不等于所有尺寸或写入链路通过。此次浏览器组织策略禁用了 DevTools，精确 320/390/1440/2048/2560 断点尚不能因此判为通过。普通 80% 和 125% 缩放已检查，但不能代替手机真视口。未完成项必须继续保留。

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
