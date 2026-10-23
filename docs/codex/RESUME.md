# 新电脑接续：女团网站

更新：北京时间2026-10-24。当前入口独立于上一台电脑和聊天长度。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/bewave-review-completion` 最新远端HEAD** |
| 正式工程 | `apps/idol-site/`；根目录为历史Next sandbox |
| 基线 | `81a572d8944c6604a08e5302c77e4cafbfb950c7`，`codex/youngposse-review-completion` |
| GitHub交付 | draft [PR #14](https://github.com/KAtOReNA7/idol/pull/14)，代码提交 `2d46a530aa78b2e686fdba18299911ac838563f3`；后续文档以最新远端HEAD为准 |
| 当前阶段 | YOUNG POSSE v21及此前页面已确认；BEWAVE v22已发布，等待人工确认 |
| QA线上 | **v22 owner-private 已发布**；[打开BEWAVE](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/bewave/index.html) |
| 证据 | [本轮日志](worklogs/20261024-bewave-review-completion.md)、[验证目录](evidence/20261024-bewave-review-completion/) |
| 正式主站 | 仍v186；未覆盖、未合并main |

分支链：handoff → GENBLUE → WOOAH → izna → izna-followup → ifeye → Hearts2Hearts → KiiiKiii → SAY MY NAME → VVUP → YOUNG POSSE → **BEWAVE**。

本轮用户“可以 继续开发”已确认YOUNG POSSE。现在仍只做BEWAVE；已恢复发布，获得页面确认前不开始Candy Shop，公共功能例外。用户原图、评分、备注、观看状态和owner-only边界不变。

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

Figma page `977:1095` 有7类×1440/390/320可编辑画板，21板均已填入内容；8板目视，首页1440与成员390取得含截图context。本次补齐6处搜索控件、3尺寸知言已有作品区与来源链接，另取得成员320/知言390含截图context；修复窄屏换行高度。完整逐板精确对照、其余控件与共享手帐仍待同步，不冒称完整设计通过。

## 发布恢复完成（v22）

QA project `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 观众仍仅owner、0外部用户。Sites source `b1db595f6fa843e5e7cba6ab56ec42b0e75ad160` 与远端一致，272旧out文件SHA复核不变。2026-10-23 18:08:24 UTC恢复发布成功；正式主站仍v186。

- version：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_70febd76c1ac8191b347bd5d1eca7a0d`（v22）
- deployment：`appgdep_6adba28bacc88191b53bc7e0eaab9900`，`succeeded`
- 页面：https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/bewave/index.html
- 证据：[恢复记录](evidence/20261024-bewave-review-completion/publication-recovery.json)

原归档 `C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/bewave-v22.tar.gz` 为71,764,963 bytes，SHA未变。此前上传TLS失败已恢复；检查上传主机可完成TLS后，使用原归档单次发布成功。无证据可归因于具体应用代码；未改代理、TLS校验或观众。服务端返回的tar归档元数据与本地gzip各自记录，不将两者hash混用。不要重复上传已成功版本。

应用内浏览器getTab读取30秒超时；独立Chrome使用Sites返回的授权头请求得到401后停止，没有完成线上交互验证。可继续本团独立设计/资料工作；下轮有恢复证据后补线上检查。不要改权限或绕过认证。

真实保存/播放、原生80%/125%缩放、精确视频图、全部Figma逐板对照/共享手帐、当前阵容实际变更仍待验/待核。交网页后等待BEWAVE确认，不开始下一团。
