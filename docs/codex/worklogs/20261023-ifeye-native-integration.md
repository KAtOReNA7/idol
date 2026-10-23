# ifeye 原生接入与 v16 审阅交付

日期：2026-10-23 晚间，北京时间。任务分支 `codex/ifeye-native-integration`，基线 `665fed58554fd83ddbcfc098228c6961943e9ebf`（`codex/izna-review-followup` / draft PR #7）。GitHub提交和Sites source是不同编号；本日志随代码提交，精确GitHub HEAD请查分支最新远端。

## 用户决定与范围

用户本轮明确说“已确认，继续开发”，因此记录 izna v15 页面获认可，并仅推进下一个团 ifeye。GENBLUE v10、WOOAH v12、izna v15继续保护。ifeye交可打开网页后等待人工确认，不提前开始其他团；公共功能除外。页面认可不等于全部历史待办或生产上线通过。

正式源码在 `apps/idol-site/`，不是根旧sandbox。开工与收尾均检查远端；基线仍为665fed5，未见另一台电脑更新该任务。仓库当前为公开，本轮只新增公开编辑资料、原有已授权记录的稳定身份和实现；未改用户评分、备注、观看状态或快照，未扩大分享授权。

## 实际网页增量

- 将 ifeye 自有 v3 候选移入正式原生路由 `/artists/ifeye`：白色纸面、衬线团名、完整团照、唱片圆环、作品文字列表延续该团设计，未复用别团视觉底板。
- 首页、六人目录、成员详情、三个发行详情、作品库、七个精确MV/舞台详情、五事件单轴时间线、原图查看器和既有手帐往返均接通。
- 六份档案直接显示真实照片和中文名，统一尺寸、统一行对齐；修正旧候选偶数卡片30px错位，手机两列和桌面三列保持一致。首屏保留官网五人宣传照的完整构图并注明图片语义；档案仍显示六人，不由宣传照人数推断当前名册。
- 三个发行：ERLUBLUE、sweet tang、As if。四个MV、三个舞台；七个槽位都绑定真实作品/具体视频。发行暂无真实native记录，详情明确只浏览，不伪造ID或评分入口。
- 公开编辑资料有九条具名MV参与关系：r u ok?六条完整、Hazy (Daisy)三条部分关系。既有手帐只有r u ok?六条成员记录，本轮仅保留这六个真实record ID；不为Hazy另造三条个人评分记录。
- 六张具名成员照、官网团照与三张发行封面共十张真实图片，原字节/SHA/尺寸检查。三张封面从既有handoff原图恢复；七个精确视频预览继续缺失，不借用发行封面补位。
- SASHA片段只作2026-03-03暂停公告、2026-06-15计划恢复公告的历史事件；删掉旧候选“在团”即时状态，不把计划当实际复出证明。原“原名”字段误标艺名，已改为“艺名”。

核心文件：`components/ifeye/editorial.tsx`、`lib/idol/ifeye-native.ts`、`lib/idol/ifeye-runtime/`、`data/ifeye-editorial.json`、`data/ifeye-assets.json`、`public/artist/ifeye/native-v3/`、`review/ifeye/`、`scripts/build-ifeye-review.mjs`。非视觉图片/焦点逻辑复用已有runtime，未改它。共享导航只增加ifeye有限键表，未修改sanitizer逻辑。API、权限、保存、依赖和lock均未改。

## 设计与资料依据

- 已阅读仓库设计标准、协作手册和 `docs/design-reference-observations/izna-ifeye-20261021.md` 的官网/Spotify历史视觉记录；本轮未重新浏览官网/Spotify画面，不将历史记录冒充新视觉研究。
- 实际读取 Figma 文件 `zeLNExz4TbpWRW3uiahef7` 的首页 `812:1133`、作品库 `812:1456`，取得get_design_context和截图并查看；会话 `5f035b1e-cfd6-4782-9f5e-be5ccdd07c4a`。保留纸面/衬线/唱片构图；成员对齐调整依据用户先前对照片一致性的要求。
- 受保护ERLUBLUE节点 `821:52` 为416×416 FIT，未写入或覆盖。多数Figma图片仍占位，本轮网页使用仓库真实原图；Figma完整实图闭环、其他内页与多尺寸设计验收仍待完成。
- 两条SASHA公告URL本轮打开返回对应标题，但正文未由检索工具展开；日期/细节来自既有已审阅资料，不声称重新核对全文或确认当前活动状态。

## 工程验证

| 检查 | 本轮结果 |
| --- | --- |
| ifeye原生绑定、净化catalog、路由、只读隔离、原图保留测试 | 20/20通过，见evidence/targeted-tests.txt |
| 共享导航与izna原生/catalog/路由/隔离回归 | 38/38通过，见evidence/navigation-izna-regression.txt |
| TypeScript `--noEmit --incremental false --pretty false` | exit 0，0 diagnostics |
| Sites官方build-site完整正式构建 | 成功；最终CSS修改后重新构建通过 |
| `git diff --check` | 通过 |
| 原有unused-ifeye-original-build-assets测试 | 35通过、3失败；失败均为临时fixture缺YOUNG POSSE有效保留文件，详见legacy-ifeye-audit-tests.txt。未改原测试或YOUNG POSSE生产pins，不能将该套件写为通过 |
| 正式剪枝dry-run | 被已有 `data/izna-assets.json` 引用 `/artist/izna/batch-b-20261016/` 阻断；未执行apply，详见production-prune-dry-run.txt |

58项针对性测试通过不是全库通过。原生ifeye重新引用旧JPEG后，本轮保留该batch全部14文件：两个pruner仅减少删除项，不扩大删除allowlist、不放宽其他团guard。新增保留测试用旧删除计划验证14文件仍在；测试中隔离无关YOUNG POSSE fixture，不修改生产校验。原图保留会增加正式产物字节，完整生产剪枝和实际展开TAR容量仍须独立处理，不能用本审阅包体代替。

复验命令（app目录）：

```sh
node --test tests/ifeye-native-integration.test.cjs tests/ifeye-review-catalog.test.mjs tests/ifeye-review-routing.test.mjs tests/ifeye-review-isolation.test.mjs tests/ifeye-native-retention.test.mjs
node --test tests/artist-navigation.test.cjs tests/izna-native-integration.test.cjs tests/izna-review-catalog.test.mjs tests/izna-review-routing.test.mjs tests/izna-review-isolation.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
```

## 实际浏览器

managed-linux Sites preview + CUA cloud browser，服务入口terminal.local:4173；这不是用户地址。实际桌面1363×936，检查完整首页、十张图片解码、六人统一尺寸和发行详情。完成：首页→Kasia→r u ok?→评分与观看记录→切换舞台→返回，具体MV/舞台身份正确、只有整场舞台评分、回到成员上下文且焦点恢复“评分与观看记录 ↗”。

320/390/1440/2048/2560为iframe内容窗口，五宽均无文档横向溢出；320搜索Sasha、原图放大、Escape关闭、焦点恢复、返回保留搜索已实际操作。不是五种顶层真视口，更不是80%/125%浏览器缩放。外部YouTube缩略图在手帐失败，诚实显示不可用/重试及播放入口；没有换用无关图片。快速批量动作曾因按钮名称/重渲染时机出现locator超时，纠正后分步通过，不把它写成快速连续导航已验。

截图在工具结果内查看，未导出PNG；可读观察记录见 [browser-observations.json](../evidence/20261023-ifeye-native-integration/browser-observations.json)。线上URL浏览器、真实写入、外部视频播放、故障注入、全顶层尺寸/缩放尚未验。

## 发布与保护证据

- [ifeye验收入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/ifeye/index.html)
- 原有审阅站 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，核实owner身份，custom allowlist仍仅owner、无外部访客。
- 发布时间2026-10-23 12:59:33 UTC / 20:59北京时间；返回succeeded，读回版本号 **16**。
- v16 Sites source `52dac6f0d01762482a4bb3a36e1e04ae6154ca91`，从v15 source `fef02183457ff9a79f08cacf605e351fcbe3896d`继续。
- 版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_6590aed27bb88191924f304928048f83`；部署 `appgdep_6adb5a2caa3c8191bb958412a485e3af`。
- ifeye增量sourceFingerprint `264192d9c26a9d54657a49833d6c60330855c83c43e3dd39f812d1e88a9a382a`；13 assets / 2,457,801 B、6净化关系、9API隔离检查；JS934877 B，CSS86366 B。
- 原审阅站全部130文件SHA不变，包括GENBLUE/WOOAH/izna与根入口；临时QA文件未入包。
- 本地上传gzip为27,137,988 B；实际解压TAR为32,778,240 B / 31.259765625 MiB；184 TAR entries；gzip SHA256 `bc0f337ed61f47f30e02ee2c8a901ff9af7efb64eb7211e42ecc6193b0c8d589`。见local-archive.json。
- Sites版本读回的归档统计为32,757,760 B / 150 files（平台归档口径）；与本地TAR含目录/头部的字节口径分别记录，不混用。
- 正式主站 `appgprj_6acb4fa532b88191ae2588c24b724b17` 仍v186 A-only，未覆盖。v16是同一私有审阅站的增量，不是正式主站发布。

## 下一步与交接

1. 等用户确认ifeye或修复其反馈；确认前不开发下一团。继续保护前三团已认可页面。
2. ifeye仍缺七个精确视频预览、同MV成员图、Figma实图/内页闭环、当前版本顶层尺寸/缩放/线上浏览器和真实保存验收；SASHA当前状态未下结论。
3. 正式发布前单独处理izna引用导致的剪枝阻断、旧fixture失败与最终pins/实际展开TAR容量，不能直接apply旧删除计划。无当前生产授权不覆盖主站。
4. 新电脑先查远端/活动PR，再按RESUME安装；用 `node scripts/build-ifeye-review.mjs --out <仓库外专用绝对目录>`重建增量，必须通过Sites source workflow合入现有审阅站，不能将增量独立覆盖站点根。
5. GitHub connector用于无CLI写认证环境，按精确tree和预期parent/ref保存；不创建新凭证，不强推，不改main。PR链接和读回结果将随接续提交保存。
