# 新电脑接续：女团网站

更新：北京时间2026-10-24。GitHub 是共享接续入口；先保留本地改动，再 fetch 当前分支比较。

| 项目 | 当前值 |
| --- | --- |
| 仓库 | https://github.com/KAtOReNA7/idol |
| 应检出分支 | **`codex/candyshop-review-completion` 最新远端 HEAD** |
| 起点 | BEWAVE 分支 `7a9b57bebc306dbe07addb7797255725aec6e05d` |
| GitHub 交付 | draft [PR #15](https://github.com/KAtOReNA7/idol/pull/15)，代码 `ea340901c5992a03199f4853c10d3b204f28adb2`；后续文档以最新远端HEAD为准 |
| 正式工程 | `apps/idol-site/`；根 Next sandbox 为历史样本 |
| 当前阶段 | BEWAVE v22 已获确认；Candy Shop v23 已发布，等待本团页面确认 |
| 私有预览 | [Candy Shop v23](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/candyshop/index.html) |
| QA source | `ba5eaecd55214522e0e418bfed697de71d23ccc5`；299旧文件SHA保持，新增32文件 |
| 正式主站 | 仍v186；未覆盖，未合并main |
| 证据 | [本轮日志](worklogs/20261024-candyshop-review-completion.md)、[证据目录](evidence/candyshop-20261024/) |

用户“好的这个团同意，继续开发”确认的是 BEWAVE。本轮只做 Candy Shop，尚未获得本团确认，不开始 ODD YOUTH。原始照片、稳定 ID、评分、备注、观看状态和 owner-only 边界保持。

## 取得与运行

```sh
git -c core.autocrlf=false clone --branch codex/candyshop-review-completion https://github.com/KAtOReNA7/idol.git idol
cd idol
git config --local core.autocrlf false
git fetch origin codex/candyshop-review-completion:refs/remotes/origin/codex/candyshop-review-completion
git status --short
cd apps/idol-site
npm run install:ci
node node_modules/typescript/bin/tsc --noEmit --incremental false --pretty false
npm run dev
```

Node ≥22.13.0，Vinext/Vite + Cloudflare。页面路径 `/artists/candyshop`；D1/R2 不随 clone 出现。不要以根 Next CLI 代替本工程，不导入私有数据掩盖环境缺失。当前机器 Git 旧全局10808代理无效，本轮只在命令局部使用7877，不改全局。CRLF会影响字节校验。

## 实现与验证

新 `components/candyshop-artist.tsx` 和独立粉紫CSS：四人官网资料照、结菜历史图、三张正式封面、七张精确视频预览、六条单轴事件。三条作品/三条舞台绑定既有ID与12条成员关系。Tumbler 仅浏览，无虚构评分绑定。结菜暂停不等于退团，JULIA采访日不冒充加入日。

```sh
node --test tests/candyshop-*.test.mjs tests/artist-navigation.test.cjs tests/artist-navigation-scroll.test.cjs tests/navigation-save-guard.test.cjs tests/bewave-content.test.mjs tests/bewave-review-catalog.test.mjs tests/bewave-review-isolation.test.mjs
node scripts/build-candyshop-review.mjs --out C:/absolute/dedicated/scratch/output
npm run build
```

50项针对性测试、类型0错误、正式构建成功。八页×五视口无横向溢出；实际成员搜索、原图/焦点、关联MV、手帐返回、舞台精确身份和图片失败重试已验。原生80%/125%缩放、真实登录保存、实际视频播放及线上浏览器尚未验证。之前BEWAVE轮次记录的13项旧测试框架失败未在本轮修复，不称全库全过。

## Figma 与发布

[Candy Shop 设计页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1006-1095)：24个原生可编辑画板（八类页×1440/390/320），实际照片填充、文字、自动布局、组件和六个颜色变量；主要页面截图及9处 get_design_context 已取。映射见证据目录。设计确认仍由用户完成，不以工具成功替代人工认可。

QA项目 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`。v23部署 `appgdep_6adbb1d2b1948191b8f0218a47cc321a` 已 succeeded；只读公开投影，评分/备注/观看清空、写入405。主站项目不得混用。线上 IAB 导航40秒超时并重置，open_in_codex返回queued，不能称线上交互通过。

继续使用 Sites 官方 source helper：刷新 credential，只经隐藏stdin传递；打开既有source，保护全部旧文件，再新增本团包、推精确commit、归档并部署。凭证不可入仓或写文件。

## 下一步

先回应 Candy Shop 反馈，补线上已登录浏览器和原生缩放验证；主站保存与上线需对应环境/授权。用户确认本团后再推进 ODD YOUTH。历史轮次细节见各自worklog；不要从旧main或其他团分支接续。
