# GENBLUE 首轮真实工程接入

更新：2026-10-22（北京时间日期）。任务分支：`codex/genblue-native-integration`。

## 版本与开发阶段

- 从 `handoff/codex-20261022` 的 `253633c5bcf2b58c06a54c4d817df9d168182fcf` 开始；提交前 fetch 并快进吸收 Sol 收官补遗 `498cf80c065030f84240b240d9e502fde4e3e04b`。该补遗未改变正式工程子树。
- 正式工程仅为 `apps/idol-site/`。基线子树 `a1fbe5d034b23be8a88572a3ab25e4d68d67734e`；3,954 文件的 bytes/SHA-256/Git blob/mode 逐项核验通过，642,362,678 B。
- 阶段：**真实源码接入与工程验证完成，浏览器、打包发布及人工验收未完成**。不是生产上线，不是整团产品验收完成。
- 本 worklog 与代码一并提交；实际提交可用 `git log -1 -- apps/idol-site/components/genblue/bluecut-experience.tsx` 定位。

## 本轮网页增量

1. 将冻结 GENBLUE BlueCut v2.2 的 33 个专属源码/素材/字体文件接入正式工程，替换 `/artists/genblue` 的旧候选入口。保留其独立蓝白版式、六人资料卡、八项发行、八个影像版本和单轴时间轴。
2. 在共享导航注册表仅追加 GENBLUE；原四团和顶层元数据保持原值。WOOAH 保持隔离，未接入本轮。
3. 既有 `/api/catalog?artist=genblue&shape=display-v1`、真实 work/member ID、精确 YouTube ID、stage sourceKey 和评分/返回路径通过现有模块连接，未新增评分模型或写入接口。
4. 新增 MV 详情的“本 MV 成员”入口，使用现有单成员/单作品关系；与成员详情的关联作品形成双向浏览。COCOCO、ACT LIKE THAT、BADASS 各有六人关系；夜市王没有已入库关系，保持明确空态。舞台不借用 MV 阵容。
5. GENBLUE 构建裁剪改为精确文件清单：保留仍使用的七张 JPG（912,978 B），只规划移除七张没有运行引用的构建副本原图（26,445,081 B）。public 原件不删；缺图、字节变化、新引用、未知文件均拦截。本轮未执行删除。

主要路径：

- `apps/idol-site/app/artists/genblue/page.tsx`
- `apps/idol-site/components/genblue/bluecut-experience.tsx`、`bluecut.css`
- `apps/idol-site/lib/idol/genblue-bluecut.ts`、`data/genblue-bluecut.json`
- `apps/idol-site/data/public-artist-navigation-keys.json`
- `apps/idol-site/public/artist/genblue/bluecut-originals-20261022/`、`public/fonts/genblue/`
- `apps/idol-site/scripts/audit-genblue-build-assets.mjs`、`genblue-build-assets-manifest.json`、`prune-unused-build-assets.mjs`
- `apps/idol-site/tests/genblue-native-integration.test.cjs`、`genblue-build-assets.test.mjs`

## 当前版本验证结果

| 检查 | 结果与边界 |
| --- | --- |
| 干净检出安装 | 通过：正式工程、原锁文件、managed-linux installer，npm ci 安装 687 包；未修改依赖声明或锁文件 |
| TypeScript | 通过：最终源码 `tsc --noEmit --incremental false --pretty false`，exit 0、0 diagnostics |
| 全站构建 | 通过：最终源码 `npm run build`，Vinext 正常完成；构建产物及内部密钥全部忽略，未入仓 |
| GENBLUE 专项 | 9/9 通过：既有快照身份/关联只读核验、错误版本/重复 ID 拦截、0/null、舞台绑定、返回路由、真实 React SSR、图片保留/异常拦截 |
| SSR 页面覆盖 | 26 个状态：4 个主页面、6 个成员、8 个发行、8 个影像；用 synthetic catalog 和实际组件，不是浏览器验收 |
| 既有数据核验 | 6 个成员 ID、4 个 work ID、8 个精确影像绑定成立；读取已有 snapshot，未输出评分/备注、未写入真实记录 |
| 素材 | 49 项、4,112,028 B 均匹配交接 SHA/bytes；15 张图片可解码。缺失的 8 张精确视频预览仍缺失，没有使用发行封面代替 |
| GENBLUE 裁剪审计 | 对当前源码及构建的 2,179 个文本文件只读审计通过，7 张当前 JPG 均在 build 中且完整；未实际裁剪 |
| 共享回归 | 6 个测试文件合跑：51 通过、1 失败。失败是 `navigation-save-guard.test.cjs` 的旧 VM harness 不支持 `@/components/public-access`，尚未进入保存交互断言。该测试、其 editor-flow harness、app/page、public-access 与基线字节相同；不宣称保存守卫本轮已验通过 |
| 真实浏览器 | 受阻：cloud browser 在获取已创建的 tab 7 时拒绝 URL policy authority；后续 goto 未执行。未用替代浏览器/CDP等绕过；无 DOM、截图、控制台或交互通过证据 |
| 视口/缩放 | 320/390/1440/2048/2560 真视口及 80%/100%/125% 原生缩放均未测；旧候选测试不计入本轮 |
| 整站归档 | 受阻：旧 YOUNG POSSE compiled carrier pins 仍绑定旧构建文件；完整 pruner 在该保护检查处失败，未删除文件、未刷新 pin、未关闭 guard |
| 真实保存/上线 | 未测/未发布；owner-only、白名单、冲突与保存实现未改动 |

完整 pruner 的当前首个错误：`YOUNG POSSE retained integrity mismatch: dist/client/_next/static/chunks/youngposse-design-CJvfgQ_F.js`。本轮构建生成的是另一文件名；仅凭新文件存在或源码未变，不能推定完整 carrier 字节等价。完整 Sites TAR 尚未产生，256 MiB 上限和 2 MiB 余量未验。

## 四项验收

| 项目 | 当前状态 |
| --- | --- |
| 设计 | 沿用 GENBLUE v2.2 源稿与素材；新网页实看、多尺寸、Figma证据复核及用户审美反馈待补 |
| 功能 | 实际源码、类型、构建、身份/返回/SSR专项通过；真实浏览器连续操作和 owner 保存未验 |
| 资料 | 快照身份、视频与成员关系、素材字节已核；8 张视频预览、夜市王成员关系缺口保留；未重新核验全部外部事实 |
| 上线 | 未上线，未合入 main；未产生可给用户打开的本轮部署地址 |

## 预览与复现

当前服务由 `sites-preview start <正式工程绝对目录>` 启动，supervisor 报告 `http://terminal.local:4173/` 运行中。此地址仅内部 QA，**不提供给用户作为可打开预览**；本轮没有浏览器可访问证明。旧 `idol-billlie-qa-oct22` 地址是上一轮候选，也不是本轮增量。

其他电脑从本任务分支恢复，不从 main 启动：

```sh
git -c core.autocrlf=false clone --branch codex/genblue-native-integration https://github.com/KAtOReNA7/idol.git idol
cd idol
git status --short
git fetch origin
cd apps/idol-site
npm run install:ci
npx tsc --noEmit --incremental false --pretty false
node --test tests/genblue-native-integration.test.cjs tests/genblue-build-assets.test.mjs
npm run dev
```

普通 Windows/macOS/Linux 的 portable dev 默认端口为 5173；启动后访问 `/artists/genblue`。不要把本地端口当已发布地址。未配置 native D1/R2 的本地 catalog 可能读取失败；页面保留公开资料、明确提示记录入口不可用，不能放宽生产读取权限或把 synthetic 数据导入真实库。

## 下一步（已按优先级排列）

1. 在允许的浏览器环境运行本分支，先验证首页→成员→关联 MV→既有观看/评分入口→返回，并做所有指定视口和缩放；包括搜索、队列、焦点、图片恢复、离开守卫。不要重复当前已拒绝的 browser policy 路径。
2. 修复旧导航保存测试 harness 的 `public-access` 适配后，实测保存守卫；真实写入仍只在获准环境及合成/可恢复记录上验，不用真实评分试写。
3. 独立审核 YOUNG POSSE 新旧编译 carrier 的内容差异和保留规则，解决跨版本构建 pin；继续执行全部 pruner guards，再核完整 TAR 上限及至少 2 MiB 余量。当前 GENBLUE 专项审计已通过，不等于整站可打包。
4. 在许可的预览发布流程交付本轮真实地址；未获得当前生产发布授权不覆盖 v186 主站。用户人工确认保持“待反馈”。
5. 仅依据具名/精确版本证据补 8 张视频预览及夜市王成员关联；随后接 WOOAH native v1.2，不用 Sol Photo v1 旧源码覆盖它。

## 共享与保护

推送前再次确认 GitHub 仓库 public；本轮只有产品代码、现有公开资料和测试/进度，没有新增用户快照、凭证、认证令牌或构建产物。已有无关未跟踪文件保留且未暂存。未 force push、未改 main、未部署、未动用户评分备注观看状态。任务提交/PR 后的实际 SHA 与入口在下一条回执中补记。
