# W!TCHX 官网风格原生页与 v31 私有审阅（2026-10-24）

用户确认 TRACER v30，本轮仅推进 W!TCHX。现已发布v31，等待网页确认；确认前不开始下一团，公共功能例外。正式主站仍v186，未合并main。

## 源码与范围

正式工程 `apps/idol-site/`，分支 `codex/witchx-review-completion`，冻结起点 `7b9bcdb32a1c589e4cf0cfd9a8d10c1852edfa07`，PR base为 `codex/tracer-review-completion`。收尾显式fetch确认base远端仍一致，无同任务现有PR。仓库PUBLIC，沿用已有代码/公开素材授权，不扩展未来私有数据或凭证。

代码、4188静态服务与Playwright均在用户本机Windows，不是云端localhost。允许修改W!TCHX专属实现及按groupId/memberId共同限定的共享照片映射；原图、稳定ID、评分/备注/观看、权限、其他团和正式主站保持。

入口为 `components/witchx-artist.{tsx,css}`、`data/witchx-{native-design,review-editorial,review-assets,source-evidence}.json`、`lib/idol/witchx-photos.ts`、`review/witchx/`、`scripts/build-witchx-review.mjs`。原图/字体固定SHA，保留9API隔离、CSP、外部输出目录守卫。

## 设计来源与复用披露

实际查看 https://kpopmedia.co.kr/#artists 。黑底、青色#00e5ec、品红#ff1493、Orbitron/Rajdhani字体、线框模块和五张完整具名横向成员卡来自公司官网语言。弃用旧夜场节目单、OPEN THE CIRCLE等视觉。

复用 **TRACER v30冻结版本**的路由、原图查看器、只读审阅和共享成员手帐布局/功能；手帐配色调整为黑青品红，团页组件和CSS独立重写。成员/发行/视频详情、搜索、时间轴和手帐为项目扩展，并非官网具有同样的完整产品流程。团照沿用仓库已有Bugs原图。

独立团站 https://www.witchxofficial.com/ 连接关闭/502，不能称已查看。公司官网Beautiful槽位误用周年演唱会海报，发行使用Bugs正式封面。中文名为既有艺名转写，不是官方中文本名；官网档案不证明当前合同或活动状态。

## 内容与功能

五成员：Lucia/露西亚、Mago/玛戈、Mari/玛丽、Niaa/妮娅、Mew/缪。中文/艺名搜索、详情、原图、下一成员、个人手帐往返接通，档案卡保持原始比例。

三发行六曲：BLALA（2024-11-06）、Beautiful Story (Highlight)（2024-12-31）、Run Baby Run（2025-07-07）。六精确视频：歌词版、moving mix、Beautiful MV、RUN编舞版、Show Champion EP.569、Simply K-Pop EP.640。六事件区分公司出道、音源发行、节目播出和海报预告。

原生只有空白作品 `rec28ldfRTrHvz`，不赋名、不展示、不制造作品/评分关系。审阅catalog投影五真实成员、0作品、0评分，私有字段清空。视频注明“仅供浏览，尚未接入评分手帐”；仅两支具备逐人依据的视频列示成员，其余不猜测关系。

## 验证与限制

- 44专项/导航回归通过：`node --test tests/witchx-*.test.mjs tests/tracer-review-routing.test.mjs tests/artist-navigation.test.cjs`。
- `node node_modules/typescript/bin/tsc --noEmit`、`npm run build`通过；tsbuildinfo恢复基线。
- Browser plugin not available，按frontend-testing-debugging技能使用本机已有Playwright/Chrome。9类页面×320/390/1440/2048/2560真实顶层视口，共45布局，无横溢、坏图、pageerror。
- 主流程：中文搜索→成员详情→原图→Escape关闭与焦点恢复→手帐→返回保留member/q，通过。
- 8额外场景：空搜索清除、无效视频恢复、原图失败重试、EasyList规则下五宽各16图片可见，通过。
- 16补查：五成员×桌面/手机10组照片比例及手帐往返，六精确视频URL/只浏览提示/无评分入口，通过。
- 补查首次测试把空作品提示限定在`.member-detail`，实际提示在其后的作品区；修正定位器后16场景全过，未修改产品或放宽业务断言。
- 线上IAB导航40秒超时，恢复后inventory显示W!TCHX标题/正式URL，读取再次40秒超时。只能确认tab地址，不宣称渲染或交互通过。open_in_codex交付打开已排队。
- **真实保存、真实播放、80%/125%原生浏览器缩放未验**。只读审阅不验证真实保存。

证据：[45布局/主流程](20261024-witchx-browser.json)、[恢复/广告规则](20261024-witchx-additional-qa.json)、[成员/视频](20261024-witchx-member-video-qa.json)。

## Figma

[W!TCHX画板页](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1093-1095)：27可编辑画板，9类页面×1440/390/320；原生文本、auto-layout、变量、离散图片和复用UI组件。16图片组件，字体仅Orbitron/Rajdhani/Noto Sans SC。上传所需WebP无损转PNG，不改变网页原图。

已取成员详情390、手帐390、发行详情320和首页390九子区，共12节点完整上下文及截图。首页根节点稀疏返回后拆分取稿；已补渐变线/标题辉光/返回箭头/时间轴节点，修复手帐同行文字、页头大小写及外链字形。临时capture节点1096:1095已移除。关键画板目视检查，**全部27板逐字间距/像素完全一致未验**，小字号度量仍需继续对照。见[节点索引](20261024-witchx-figma-frames.json)。

## 私有发布

[W!TCHX v31](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/witchx/index.html)，project `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`。owner-private/custom、1位owner、0外部访客，范围未变。

source `73c28b2a0664b1e7901858007325d433a1482a1a`；部署 `appgdep_6adc7113e3d88191975f31c19ec471f8` succeeded；get_site确认版本31。452旧文件SHA不变，新增31，总483文件/263,839,289 bytes；最大25,354,489 bytes，低于25MiB。[增量证明](20261024-witchx-site-proof.json)、[部署记录](20261024-witchx-deployment.json)。v31已发布，不要重复发布。

helper首次受失效全局代理10808阻断，进程级7877后成功，未改全局Git。额外裸Git远端检查触发认证窗口，已停止并关闭残留credential-manager子进程，未输入或保存凭证。Sites短期凭证只经隐藏stdin，不入文件/命令行/仓库。

临时Figma capture HTML只在外部输出目录，未进入manifest或发布包；只读fetch边界未放宽。

## 下一步

代码与本日志共同提交/推送任务分支，最终commit/PR见RESUME补录。等待W!TCHX网页确认后再推进下一团；线上浏览器、真实保存/播放、原生缩放和完整Figma细节仍待验。接续先查工作树、显式fetch任务分支，不从旧main开工。
