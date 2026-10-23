# 新电脑接续：女团网站

更新：北京时间2026-10-24。当前入口独立于上一台电脑和聊天长度。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/youngposse-review-completion` 最新远端HEAD** |
| 正式工程 | `apps/idol-site/`；根目录为历史Next sandbox |
| 基线 | `75c22b7ec26f53fbbf14db1b253a8cce52a59d81`，`codex/vvup-review-completion` |
| GitHub交付 | 提交与draft PR收尾补记；最新远端HEAD为准 |
| 当前阶段 | VVUP v20及前七团页面已确认；**YOUNG POSSE v21等人工确认** |
| 审阅 | [YOUNG POSSE页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/youngposse/index.html) |
| 证据 | [本轮日志](worklogs/20261024-youngposse-review-completion.md)、[验证目录](evidence/20261024-youngposse-review-completion/) |
| 正式主站 | 仍v186；未覆盖、未合并main |

分支链：handoff → GENBLUE → WOOAH → izna → izna-followup → ifeye → Hearts2Hearts → KiiiKiii → SAY MY NAME → VVUP → **YOUNG POSSE**。

用户在VVUP v20后回复“可以 继续开发”，VVUP页面现已确认。一次一团，交网页后等用户明确确认，当前等YOUNG POSSE；公共功能例外。保持原图、稳定ID、用户记录和owner-only写保护。

## 取得与运行

```sh
git -c core.autocrlf=false clone --branch codex/youngposse-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin codex/youngposse-review-completion:refs/remotes/origin/codex/youngposse-review-completion
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

已有检出先保留改动再fetch比较，不reset/clean/force push；本机remote.origin.fetch仅指向旧KiiiKiii分支，普通fetch不会更新其他跟踪引用，需显式目标。Node≥22.13.0，Vinext/Vite+Cloudflare Worker与Next路由/API约定。不能跑根sandbox或Next CLI替代。portable端口通常5173，以实际服务地址为准，打开 `/artists/youngposse`。D1/R2不随clone出现，不导入用户数据掩盖缺环境。

Windows Sites npm shim曾错找入口，用已安装Node与npm-cli.js绝对路径运行package脚本即可。代理仅按当前机器配置诊断，本机局部使用7877；不更改全局。CRLF会破坏字节校验，clone禁用转换。

## 本轮实现与检查

正式路由改用新 `components/youngposse-artist.tsx`，保留旧byte-pinned candidate源。原Posse in Frame设计、五位官方具名成员、真正原图、15发行、22影像槽（14主影像+8舞台）、39既有关系、14事件；搜索、详情、精确手帐往返。27图片原字节保留，21个原图/封面与本轮公开源响应相同。照片原始600×600、团照1000×566；Figma480px是旧展示上限，不是源图分辨率。

新增 `review/youngposse/` 和 `scripts/build-youngposse-review.mjs`：真实组件只读审阅，Node中从公开白名单导出并清空个人字段。写入405、非本团API拒绝，raw snapshot不进浏览器包。

```powershell
$env:NODE_PATH=(Join-Path $PWD 'node_modules')
node --test tests/youngposse-content.test.mjs tests/youngposse-review-catalog.test.mjs tests/youngposse-review-isolation.test.mjs tests/youngposse-review-routing.test.mjs tests/vvup-*.test.mjs tests/artist-navigation.test.cjs tests/saymyname-*.test.* tests/kiiikiii-*.test.*
node scripts/build-youngposse-review.mjs --out C:/absolute/dedicated/scratch/output
```

POSIX设置 `NODE_PATH="$PWD/node_modules"` 再运行同样测试。138项通过、类型0错误、正式build成功；28交互和3失败恢复、七页×320/390/1440/2048/2560真实CSS视口通过。Browser插件缺失，使用已安装Chrome+bundled Playwright，未装新依赖。原生80%/125%缩放、真实保存/播放、线上已登录浏览器未验。

旧 `youngposse-retention-audit.test.mjs` 的 `.pathname` 在Windows产生 `D:\D:\` 路径错误，本轮未将其记为通过或放宽production pins。新测试直接复核18旧图片及两个源文件pins；主站全量剪枝仍保留既有阻断。

## 发布与下一步

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`：owner-private **v21 succeeded**；Sites source `96170679dfbaf679050e25c3ad3e86dfd6cc9d0a`。原237静态文件SHA不变，总272文件。仅本团增量，不能当全站替换包。线上地址交给Codex打开返回queued，未冒称已登录浏览器复验。正式主站仍v186。

先处理YOUNG POSSE反馈；确认前不启动下一团。资料待办：Street Carol发行日12-13/12-18冲突保留null；目录另缺YOUNG POSSE UP与On My Scars，后者有6-24/6-26分歧；小分队音源参与不外推MV出演。精确视频截图、MV个人造型、完整Figma内页/320画板及官网/Spotify完整视觉研究仍待补。每轮代码、证据、阶段与下一步同提交并push。
