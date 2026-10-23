# 接续：ODD YOUTH 女团页面

更新：2026-10-24。用户已确认Candy Shop v23；ODD YOUTH v25已交私有预览，等待本团网页确认，不开始下一团（公共功能例外）。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 分支 | `codex/oddyouth-review-completion` 最新远端HEAD |
| 基线 | Candy Shop `a1c55190a4c0b2d96bf149f128a62a0e3473868d` |
| 正式工程 | `apps/idol-site`，Vinext/Vite + Cloudflare |
| 私有预览 | [ODD YOUTH v25](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/oddyouth/index.html) |
| QA source | `500e091b92597b4cf0db33fbccf7bf4d24c02c10`；331旧文件SHA不变，新增35文件 |
| 正式主站 | v186，未覆盖、未合并main |
| GitHub交付 | 本分支draft PR待创建 |
| 证据 | [本轮日志](worklogs/20261024-oddyouth-review-completion.md)、[证据目录](evidence/oddyouth-20261024/) |

## 运行与验证

先保留本地改动，再fetch分支比较。Node ≥22.13.0；不要运行根目录旧Next sandbox。

```sh
git fetch origin codex/oddyouth-review-completion:refs/remotes/origin/codex/oddyouth-review-completion
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

当前机器Git全局10808代理失效，仅在需要联网的命令局部用 `-c http.proxy=http://127.0.0.1:7877 -c https.proxy=http://127.0.0.1:7877`。不改全局配置。D1/R2不随clone出现，不导出私有数据来掩盖环境缺失。

```sh
node --test tests/oddyouth-*.test.mjs tests/artist-navigation.test.cjs tests/artist-navigation-scroll.test.cjs tests/navigation-save-guard.test.cjs tests/candyshop-content.test.mjs tests/candyshop-review-catalog.test.mjs tests/candyshop-review-isolation.test.mjs
node scripts/build-oddyouth-review.mjs --out C:/absolute/dedicated/scratch/output
npm run build
```

49项检查、类型和正式构建通过；八类页面五个实际视口，29交互/恢复检查通过。首页大字、320px成员作品与评分入口挤压已修。原生80%/125%缩放、真实保存/播放、生产API失败恢复未验；不称全库全绿。

## 实现与资料

原生蓝白相册：五张具名等大肖像、完整原图、成员搜索详情、五发行12曲目、11精确视频、五事件、既有手帐往返。保留三作品、两舞台与15条既有关系；新视频无native记录时只浏览。评分0有效、null未评，用户值未修改。

官网为TOP MEDIA ODD YOUTH页面；英语版发行日是2025-01-15，不是01-10公告。官网生日字段不明不猜；Live Clip语种仍待核；不由资料页外推合同/活动状态。官方概念照不得填入缺失MV成员截图。

## Figma与发布

[Figma设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1022-1095)：八类页×1440/390/320，24个可编辑原生画板；主要页截图和实际设计上下文已取。共享stage壳和部分响应式间距仍有差异，见design-fidelity.md，不称完整保真验收通过。

QA项目 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，仅owner、0外部访问者。v25部署 `appgdep_6adbbe4987008191bbeeb3bde817f898` succeeded。v24首页已由IAB实际打开；点击成员后工具30秒超时，v25线上交互未计通过。

官方source helper先打开既有源再编辑：保护旧331文件，更新范围仅ODD新增包，凭证只能通过隐藏stdin，不能写入文件/日志/仓库。v25修正只改本团app.css和manifest，未覆盖旧团。

## 接续

等待ODD YOUTH网页反馈，优先处理审美反馈、Figma共享壳细节、线上交互与原生缩放；真实保存/主站发布需对应环境及授权。主站v186、评分/备注/观看和访问权限保持。GitHub接续以本分支最新远端HEAD及本轮日志为准，历史团见各自worklog。
