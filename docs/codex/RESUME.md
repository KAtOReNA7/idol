# 新电脑接续：女团网站

更新：北京时间2026-10-24。当前入口独立于上一台电脑和聊天长度。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/bewave-review-completion` 最新远端HEAD** |
| 正式工程 | `apps/idol-site/`；根目录为历史Next sandbox |
| 基线 | `81a572d8944c6604a08e5302c77e4cafbfb950c7`，`codex/youngposse-review-completion` |
| GitHub交付 | draft [PR #14](https://github.com/KAtOReNA7/idol/pull/14)，代码提交 `2d46a530aa78b2e686fdba18299911ac838563f3`；后续文档以最新远端HEAD为准 |
| 当前阶段 | YOUNG POSSE v21及此前页面已确认；BEWAVE等待私有发布恢复及人工确认 |
| QA线上 | 仍v21；BEWAVE上传失败，未形成新版本 |
| 证据 | [本轮日志](worklogs/20261024-bewave-review-completion.md)、[验证目录](evidence/20261024-bewave-review-completion/) |
| 正式主站 | 仍v186；未覆盖、未合并main |

分支链：handoff → GENBLUE → WOOAH → izna → izna-followup → ifeye → Hearts2Hearts → KiiiKiii → SAY MY NAME → VVUP → YOUNG POSSE → **BEWAVE**。

本轮用户“可以 继续开发”已确认YOUNG POSSE。现在仍只做BEWAVE；恢复发布并获得页面确认前，不开始Candy Shop，公共功能例外。用户原图、评分、备注、观看状态和owner-only边界不变。

## 取得与运行

```sh
git -c core.autocrlf=false clone --branch codex/bewave-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin codex/bewave-review-completion:refs/remotes/origin/codex/bewave-review-completion
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

已有检出先保留改动再fetch比较，不reset/clean/force push。当前remote.origin.fetch可能仅指向旧KiiiKiii分支，应显式fetch。Node≥22.13.0；Vinext/Vite+Cloudflare Worker，不运行根sandbox或Next CLI替代。页面路径 `/artists/bewave`。D1/R2不随clone出现，不导入私人数据掩盖缺环境。

Windows的npm shim曾错找入口，可用已安装Node和npm-cli.js绝对路径。代理按当前机器配置，本机仅命令局部使用7877；不更改全局。CRLF会破坏字节校验，clone禁用转换。

## 实现与验证

新 `components/bewave-artist.tsx` 与独立海岸相册CSS；6历史成员、4发行、5影像槽（2主影像、2舞台、1只浏览Special Clip）、2既有成员作品关系、4事件。搜索、原图焦点、精确手帐往返和失败恢复通过。2024历史名册不推断当前阵容；新小分队仅知言/允瑟，个人作品仅知言；音源日期不冒充上传日。

```powershell
$env:NODE_PATH=(Join-Path $PWD 'node_modules')
node --test tests/bewave-*.test.mjs tests/youngposse-content.test.mjs tests/youngposse-review-*.test.mjs tests/vvup-*.test.mjs tests/artist-navigation.test.cjs tests/artist-navigation-scroll.test.cjs tests/artist-preview.test.cjs tests/member-works.test.cjs
node scripts/build-bewave-review.mjs --out C:/absolute/dedicated/scratch/output
```

115专项/回归通过；最终仅改事件来源链接后21项本团测试再过。类型0错误、正式build成功。34交互/3失败恢复、七类页×320/390/1440/2048/2560通过。Browser插件缺失，使用已安装Chrome及bundled Playwright；无新依赖。另跑旧catalog-read-deadline：132项中119过13失败，基线同样失败，详见日志；不能称全库全过。

Figma page `977:1095` 有7类×1440/390/320可编辑画板，21板均已填入内容；8板目视，首页1440与成员390取得含截图context。逐板精确对照、部分网页控件/关联区与共享手帐仍待同步，不冒称完整设计通过。

## 发布恢复

QA project `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` owner-private。Sites source **`b1db595f6fa843e5e7cba6ab56ec42b0e75ad160` 已推送**，272旧out文件SHA不变，新增27，总299。正式主站v186不动。

本机归档 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/bewave-v22.tar.gz` 为71,764,963 bytes；此文件名不是已发布版本号。native save/deploy在上传至sdmntprwestus3.oaiusercontent.com时TLS连接失败；随后get_site仍v21，未得到version/deployment ID。source私有自动发布能力返回false，未启用自动发布。不要重建Site、改变观众或将失败写成v22上线。

网络恢复后先get_site/list版本核对没有别的电脑更新，再按Sites技能从同一source和归档恢复私有发布。若换机，先打开同一Sites source，从当前GitHub代码重建BEWAVE review并对照证据指纹。不得覆盖旧272文件；不上传原始snapshot、不把只读审阅当全量主站。

发布后打开实际页面 `/artists/bewave/index.html`，核已登录线上浏览器。真实保存/播放、原生80%/125%缩放、精确视频图、当前阵容实际变更仍待验/待核。交网页后等待BEWAVE确认，不开始下一团。
