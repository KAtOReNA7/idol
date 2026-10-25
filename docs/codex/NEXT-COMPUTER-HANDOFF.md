# 跨电脑快速接续：已确认并上线的 v11

更新时间：2026-10-26。此文件是另一台电脑的快速入口；开始时仍要 fetch 最新分支并核对 STATUS，不能把本文的提交固定成永久基线。

## 直接交给新电脑 Codex 的指令

【请接续 GitHub 仓库 https://github.com/KAtOReNA7/idol 的当前任务。活动分支为 `codex/mv-cover-and-identity-batch`，不要从旧 main 或根目录 Next sandbox 开始。先检查本地改动并 fetch；保留已有改动，比较远端后接续活动分支最新 HEAD。阅读 `docs/codex/NEXT-COMPUTER-HANDOFF.md`、AGENTS、STATUS、RESUME、设计要求与协作手册的最新决定，正式工程为 `apps/idol-site/`。

用户已确认 v11；全部已完成网页修改已发布至 https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/ ，保持 owner-private 只读。当前累计 1906 条认人图绑定、628 个精确视频封面；下一任务优先补齐仍缺的 922 条认人图关系，同时改善 47 张旧图清晰度、继续核实 18 项未知统计。根据最新审计重新计算缺口，优先可核实具名来源、同一精确 MV 版本和成员的原图，统一 3:4 展示，保留来源与原字节。不要重新导入已完成的 A/B/C 批次，不凭脸猜身份，不跨视频版本套图，不用概念照冒充 MV 图。只有已确认没有成员真人出镜的精确 MV 才能关闭成员评分，缺图不能关闭。

保持 51 团已确认设计、主站 Apple Music 风格、稳定 ID、既有关系和个人数据；个人页统一排版仍待我决定。按合理批次持续完成资料与网页增量、验证、完整报告、GitHub 提交推送及指定站点发布，不需要再次确认已有授权。发布前核对同一 Sites 项目与当前权限；旧 v186 工程的 hosting.json 不是此次站点，不能混用。报告分别说明解决、未解决和未验证项。先简短告知已核对的版本、剩余缺口与首批目标，然后直接开展实际补图与开发，不要停在整理计划。】

推荐：使用 Codex 当前编程主力模型，高推理；资料缺口涉及版本与身份核对，不建议仅凭低成本自动抓取批量入库。

## 1. 在新电脑取代码

新目录可以执行：

```sh
git clone --branch codex/mv-cover-and-identity-batch https://github.com/KAtOReNA7/idol.git idol
cd idol
git status --short
git log -5 --oneline
```

已有仓库先检查 `git status`，再显式 fetch 活动分支。若本地已有分支，比较双方提交后只进行可快进更新；有未提交修改或分叉则先保留、比较，不能 reset/clean/force push。新任务按仓库规则从最新接续点创建 `codex/` 分支，并更新 STATUS/RESUME，避免后续继续使用旧入口。

本文件编写前的已同步 HEAD：`de56a565c068ee0cdeb8068afe886709617c6ed0`。读取时以远端最新 HEAD 为准，不 checkout 回这个旧提交。

当前 [PR #40](https://github.com/KAtOReNA7/idol/pull/40) 为 draft，目标 `codex/data-gap-followup`；未合并 main。主代理已结束本批次，没有需要等待的远程代理或后台研究。

## 2. 先读这些当前资料

1. 根 `AGENTS.md`、[STATUS](STATUS.md)、[RESUME](RESUME.md)、[设计要求](../design-requirements.md)、[协作手册](../collaboration-playbook.md)顶部。下方逐团“待确认”多数属于历史，不能覆盖 v11 最新确认。
2. [完整报告入口](full-completion-report-20261026.md)、[v11报告](mv-cover-identity-batch-report-20261026.md)、[发布确认](worklogs/20261026-v11-publication-confirmation.md)。
3. [主审计JSON](mv-identity-asset-audit-20261025.json)、[922条待补CSV](reports/20261026-v11/missing-mv-identities.csv)、[批量补图方法](mv-identity-batch-method-20261026.md)。CSV是v11快照；修改后由主审计重新生成，不把旧CSV当实时数据。
4. [A批](mv-batch-a-20261026.md)、[B批](mv-batch-b-20261026.md)、[C批](mv-batch-c-20261026.md)及相应JSON，包含已采用来源、精确版本依据、未采用候选和原因。
5. [统计后续](statistics-followup-20261026.md)、[个人页排版盘点](member-page-layout-inventory-20261025.md)。个人页仅盘点与修复缺档，不擅自统一重设计。

## 3. 已完成与当前剩余

- v11：MV卡片标签四边定位拉伸造成的黑块已修复；新增657条认人图，涉及22团114作品。累计1906绑定，312作品、42团；628封面包含MV、舞台等精确版本。
- 剩余922条已有成员关系缺图；293作品无公开认人图，其中133作品原无成员关系，不能猜全员参与。
- 旧47条 `card_only` 图仍待提高质量，本轮没有新增。18项统计未知：6社媒、9团销量、3团一位；按用户要求展示0，证据保持“未知”和“确认零”的区别，没有账号的平台不显示。
- 重点候选限制：Hearts2Hearts五MV40格拼图裁切后仅390px；ILLIT两MV10格实际柔糊，Tick-Tack另5张存在正式/Performance版歧义；AtHeart六张文字覆盖。原候选未发布，要寻找更好来源或解决版本依据，不能直接批准。
- 同歌曲名不等于同一视频；同服装也不能独自消除版本歧义。可采用官方具名MV拍摄现场图，但应明确标注与MV截图的区别。
- 仅原已核实的5个精确视频关闭成员评分；缺图、动画标签或缺关系都不自动触发关闭。

## 4. 代码位置和安全运行

正式工程 `apps/idol-site/`。安装 Node.js >=22.13.0，使用该目录的 lockfile：

```sh
cd apps/idol-site
npm run install:ci
npm run dev
```

只使用命令实际打印的本机地址；不要把另一台电脑的 localhost 或 `D:/porject/idol` 当作新电脑固定路径。原机代理 `127.0.0.1:7877`、系统Chrome路径与临时素材目录均不可照搬。GitHub/Sites凭证通过新机器现有授权取得，不复制旧token。

关键文件：

- `data/mv-public-media.json`：前端公开图片投影。
- `../../docs/codex/mv-identity-asset-audit-20261025.json`：逐条证据与缺口源。
- `scripts/import-mv-identity-batch.mjs`：审核后批量导入，默认dry-run；校验冻结审计SHA、精确关系、来源类型、原图SHA/字节/尺寸、裁切与重复。
- `scripts/build-mv-public-media.mjs`：从审计生成运行数据。
- `scripts/build-completion-report.mjs`：生成完整表与待补CSV。
- `app/music-experience.css`：本次封面标签修复；不要回退。
- `scripts/build-all-review.mjs`、`scripts/hydrate-review-originals.mjs`：当前只读静态站生成与原图恢复。

新批次先冻结当前主审计SHA，再建立新的具名来源记录和原文件。已有A/B/C已apply，不要再执行旧方法文档中的apply示例。导入器当前原图路径白名单只覆盖截至本批的目录；新日期/新批次若需扩展，精确扩展并保持边界测试。旧图替换另行审查，不通过“新增”偷偷覆盖。

修改图片/导入逻辑后，按变更运行：

```sh
node --test tests/mv-identity-batch.test.mjs tests/mv-public-media.test.cjs tests/mv-member-policy.test.cjs
npx tsc --noEmit
npm run build
```

再验证全部本批新增作品的桌面/手机3:4显示、图片解码、原图打开与返回、精确绑定以及线上加载。不要通过真实评分保存测试修改用户数据。

## 5. 换电脑恢复发布工程

GitHub保存可编辑源码、全部采用的公开原图、研究记录与验证报告；当前站点的静态发布源码另在 Sites 管理的源仓库中。另一台电脑发布时先读 Sites 技能，使用同一账号的 Sites 原生工具恢复该项目源仓库，不依赖原机临时目录。

| 项目 | 当前值 |
| --- | --- |
| 指定站点 | https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/ |
| Sites project_id | `appgprj_6add2704bc6c81918d3e0e2f13130422` |
| 最新确认版本 | v11 |
| 保存版本ID | `appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4` |
| 成功部署ID | `appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d` |
| 已发布源提交 | `c28c945987e22803b81ea266e6aaadf1ce972cb0` |
| 公开原图固定提交 | `a250a4d683871624d36b0283499532daea63e9de` |
| 权限 | owner-private、静态只读 |

**注意：`apps/idol-site/.openai/hosting.json`仍属于旧v186项目 `appgprj_6acb4fa532b88191ae2588c24b724b17`，不是上表指定站点。** 不直接用它发布本次站点；恢复Sites专用发布checkout后核对其`.openai/hosting.json`。

恢复源checkout后，根部的 `hydrate-review-originals.mjs` 根据 `dist/review-all/manifest.json` 从固定公开提交恢复精确忽略的图片，并校验长度/SHA。运行 `node hydrate-review-originals.mjs dist`；代理仅按新机器的实际环境配置。当前清单为1314份同站公开原图，源README里的67是旧数字。其余大原图来自固定GitHub提交。保持原图字节，静态包v11为259,580,239 bytes，接近256 MiB限制。

生成新的全团只读输出需要：

```text
node scripts/build-all-review.mjs --out <仓库之外的绝对临时目录> --udtt-portrait <恢复的Sites源checkout>/dist/review-all/udtt/lu-historical.jpg --public-ref <包含全部采用原图且已推送的40位GitHub提交>
```

上述 Lu 原图已跟踪在 Sites 源仓库，SHA256为 `b80720a772b8000518fad7d71e0b3c5867a8dbef7b4c2219dcaf2ec58dba8ca9`。UDTT受限素材只保留原有私有托管范围，不为了换电脑把它们复制进公开GitHub。原机未采用候选与中间联系表部分仅在临时目录，新电脑可按JSON来源重新取得；不能假设它们已上传。

检查生成产物、精确ignore清单和容量后，按Sites技能把源推送、从同一提交打包、保存并部署到同一项目。保留权限与旧站点，不新建替代站、不压缩原图凑容量。新图片必须先在GitHub固定提交可获取，才能把该提交用作public-ref。工具或输入不可用时记录具体阻断，并继续不依赖它的素材/代码工作。

## 6. 验证和交接边界

上轮v11已验：13专项、类型与正式构建；本地228布局/22原图流程；线上84布局/22原图流程；本地/线上各六宽144封面卡片；657远端原图HTTP/长度/SHA通过。详细证据在 `reports/20261026-v11/` 和 `mv-cover-identity-batch-verification-20261026.json`。

线上检查使用服务身份Chrome，不是用户IAB。真实写入、全视频完整播放、80%/125%原生缩放、新Figma与全仓测试未完成。不得把旧版本或构建通过当成新页面/新素材全部通过。

继续时先汇总最新缺口和可落地的第一批，再交付实际图片/数据增量；每批代码、来源、报告与worklog一起提交推送。结束时维护STATUS/RESUME、说明线上版本及仍未解决事项。默认沿用已有授权，不因历史逐团门槛重复等待确认；新权限、无法确认的身份/版本或共享代码分叉应具体说明，保留有效结果。
