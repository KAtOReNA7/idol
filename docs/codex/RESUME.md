# 新电脑接续：女团网站

更新：北京时间2026-10-23。当前入口独立于上一台电脑或聊天长度。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/saymyname-review-completion` 最新远端 HEAD** |
| 正式工程 | `apps/idol-site/`；根目录是旧 Next sandbox |
| 本轮基线 | `f91a66ce9466cd12c64ebe9a9b16d84739b45fc9`，`codex/kiiikiii-review-completion` |
| GitHub 交付 | draft [PR #11](https://github.com/KAtOReNA7/idol/pull/11)；代码提交 `5c28500cdeb5920ba3d7640b50065cffebe1d3b4`，文档以最新远端 HEAD 为准 |
| 当前阶段 | 前六团页面已确认；**SAY MY NAME v19待人工验收** |
| 最新交付 | [SAY MY NAME 验收页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/saymyname/index.html) |
| 证据 | [本轮日志](worklogs/20261023-saymyname-review-completion.md)、[验证目录](evidence/20261023-saymyname-review-completion/) |
| 正式主站 | 仍v186；本轮未覆盖、未合并旧main |

分支链：handoff → GENBLUE → WOOAH → izna → izna-followup → ifeye → Hearts2Hearts → KiiiKiii → **SAY MY NAME**。上轮交付后的用户“已确认，继续开发”已在旧会话读取，KiiiKiii不再等待确认。

网站以认识成员、观看具体 MV/舞台、评分和感想及团史探索为目标。每团保留独立视觉，准确中文名、真实具名照片、历史阵容及精确视频身份。**一次一团，交网页后等用户明确确认；当前等 SAY MY NAME，公共功能例外。** 页面确认不等于真实保存、全部设计或生产验收；不改稳定ID、个人记录、原图或owner-only写保护。

## 取得与运行

```sh
git -c core.autocrlf=false clone --branch codex/saymyname-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

读取顺序：本文 → 根AGENTS → STATUS/PRD → 设计要求/协作手册 → ACCEPTANCE → 本轮worklog。已有检出先保留改动再fetch比较，不reset/clean/force push。取得完整文件，测试需要handoffs/fixture；不用旧机器依赖/构建/凭证。

Node≥22.13.0。框架是Next路由/API风格 + Vinext/Vite + Cloudflare Worker；不能改跑根sandbox或Next CLI。普通电脑portable端口从5173起，打开实际终端地址的 `/artists/saymyname`。D1/R2不会随clone出现，不改权限或导入真实记录掩盖缺失。

本机Windows的Sites npm shim曾错找入口；可用已安装Node和npm-cli.js绝对路径执行原 `npm run install:ci` / `npm run build`，不改锁文件或框架。失效代理按新电脑实际配置诊断，不能照抄本机端口。CRLF会破坏按原字节生成校验，clone时就禁用转换。

## 本轮与验证

8张官网PNG原图（2000×3000；共21,215,769 bytes）、成员检索/原图、9发行检索详情、6影像/5绑定舞台/2替代现场/37关系/8时间轴事件。保留官网原构图与淡紫唱片视觉。七发行封面、三视频预览及舞台/MV个人造型图等缺口继续保留。

新增 `review/saymyname/` 和 `scripts/build-saymyname-review.mjs`，正式组件与共享App的静态只读审阅；公开字段白名单清空个人字段，禁止写入。审阅仅筛本团六支视频，不混入HITOMI的IZ*ONE历史个人关联；正式历史数据不改。

PowerShell专项验证：
```powershell
$env:NODE_PATH=(Join-Path $PWD 'node_modules')
node --test tests/saymyname-*.test.* tests/artist-navigation.test.cjs tests/kiiikiii-*.test.* tests/hearts2hearts-review-*.test.mjs
node scripts/build-saymyname-review.mjs --out C:/absolute/dedicated/scratch/output
```

POSIX设置 `NODE_PATH="$PWD/node_modules"` 后运行同样测试。113项过、类型0错误、正式构建成功。9条交互、7页×320/390/1440/2048/2560真浏览器CSS视口通过，非真实手机硬件或80%/125%原生缩放。详见证据，测试不能替代设计/资料/生产验收。

## 发布与下一步

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，owner-private **v19 succeeded**；Sites source `ef1d2082de92fb79e4de3fdf5962d213a4e26a8e`。原192文件SHA不变；展开TAR65,701,376 bytes。Sites提交与GitHub提交分别记录。

此构建只输出本团增量，必须添加到既有QA站并核旧文件SHA，不能当全站替换包。正式主站hosting ID不同，不得拿QA身份覆盖。线上in-app browser本次超时，部署后独立浏览器未验。

先等SAY MY NAME反馈并修本团。剩余：完整Figma实图/内页、官网/Spotify完整视觉研究、缺图、原生缩放、播放/真实owner保存、线上浏览器和主站全量包。旧izna剪枝及ifeye审计fixture阻断保留，不从审阅成功推定生产通过。每轮代码、证据、阶段、下一步同提交并推送GitHub。
