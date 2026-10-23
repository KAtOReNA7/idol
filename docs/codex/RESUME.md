# 新电脑接续：女团网站

更新：北京时间2026-10-24。当前入口独立于上一台电脑或聊天长度。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/vvup-review-completion` 最新远端HEAD** |
| 正式工程 | `apps/idol-site/`；根目录为历史Next sandbox |
| 基线 | `06601304be62beff7fea7a5f87fa9e3336e71c64`，`codex/saymyname-review-completion` |
| GitHub交付 | 提交与draft PR收尾补记；最新远端HEAD为准 |
| 当前阶段 | SAY MY NAME v19和前六团页面已确认；**VVUP v20等人工确认** |
| 审阅 | [VVUP页面](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/vvup/index.html) |
| 证据 | [本轮日志](worklogs/20261024-vvup-review-completion.md)、[验证目录](evidence/20261024-vvup-review-completion/) |
| 正式主站 | 仍v186；未覆盖、未合并main |

分支链：handoff → GENBLUE → WOOAH → izna → izna-followup → ifeye → Hearts2Hearts → KiiiKiii → SAY MY NAME → **VVUP**。用户在SAY MY NAME v19后回复“可以 继续开发”，其页面不再等待确认。

一次一团，交网页后等待用户明确确认，当前等VVUP；公共功能例外。页面确认不代表真实保存/全部设计/生产通过。保持稳定ID、原图、个人记录与owner-only写保护。

## 取得与运行

```sh
git -c core.autocrlf=false clone --branch codex/vvup-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

已有检出先保留改动再fetch比较，不reset/clean/force push。Node≥22.13.0，Next路由/API风格+Vinext/Vite+Cloudflare Worker，不能改跑根sandbox或Next CLI。普通电脑portable端口从5173起，打开实际地址的 `/artists/vvup`。D1/R2不随clone出现，不导入真实记录或改权限掩盖缺失。

Windows Sites npm shim曾错找入口，可用已安装Node和npm-cli.js绝对路径执行原package脚本，不改依赖/锁文件。代理按当前机器配置诊断，本机命令局部使用7877；不要照抄端口或更改全局设置。CRLF会破坏源字节校验，clone时禁用转换。

## 本轮与验证

四位官方成员具名图、历史Hyunny档案、七发行/三封面、七影像/六绑定舞台/16关系/九事件，成员/发行搜索与精确手帐往返。旧snapshot五人groupIds不表示现今阵容；官方展示由具名图稳定ID决定，原始关系没改。

新增 `review/vvup/` 和 `scripts/build-vvup-review.mjs`，真实组件静态只读审阅；公开白名单清空个人字段，拒绝写入。13图片2,324,878 bytes保持SHA；字体同包。Figma首页1440/390两个画板共16槽真实图，完整内页仍待办。

PowerShell专项验证：
```powershell
$env:NODE_PATH=(Join-Path $PWD 'node_modules')
node --test tests/vvup-*.test.mjs tests/artist-navigation.test.cjs tests/saymyname-*.test.* tests/kiiikiii-*.test.*
node scripts/build-vvup-review.mjs --out C:/absolute/dedicated/scratch/output
```

POSIX设置 `NODE_PATH="$PWD/node_modules"` 后用同样测试。117项全过、类型0错误、正式构建成功。21项交互/状态、七页×320/390/1440/2048/2560真实CSS视口通过；不是原生缩放或真实手机硬件。Browser插件缺失，使用已安装Chrome+bundled Playwright，详见日志。资料/设计/上线不由测试自动通过。

## 发布与下一步

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，owner-private **v20 succeeded**；Sites source `e4d3aef4882c64e5872ffb16956c194c25c86f25`。原216文件SHA不变，总237文件。该构建仅输出本团增量，须添加到既有QA并核旧文件，不能作为全站替换包。正式主站ID不同，未获覆盖授权。

已请求在Codex打开线上地址，工具返回queued，未把排队打开当成已登录线上浏览器验证。线上浏览器、真实播放/保存、原生80%/125%缩放、完整Figma内页、Hyunny图、四张早期发行封面、七支精确视频预览和MV个人造型仍待办。

先等VVUP反馈并修本团。保留旧izna剪枝引用阻断及ifeye旧审计fixture问题；QA包成功不代表主站全量通过。每轮代码、证据、阶段和下一步同提交并推送GitHub。
