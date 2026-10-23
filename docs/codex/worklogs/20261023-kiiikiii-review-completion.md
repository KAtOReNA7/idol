# KiiiKiii 原生完善与 v18 审阅

更新：2026-10-23。负责人：当前 Codex 主会话；未派生子代理。本轮用户“已确认，继续开发”确认 Hearts2Hearts v17，只推进下一团 KiiiKiii。

## 基线与交付

- 仓库 `KAtOReNA7/idol`，正式工程 `apps/idol-site/`；任务分支 `codex/kiiikiii-review-completion`。
- 基于 `codex/hearts2hearts-review-completion` 的 `62ca3f61e3059c60a4b0558bc73b12e624ca2e1c`，不是旧 main。开工 fetch/远端 HEAD 比较完成；上游 draft PR #9 保留。
- [KiiiKiii v18 验收页](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/kiiikiii/index.html)。当前 **等待用户人工验收**；确认前不开发下一团，公共功能除外。
- GitHub 代码提交和 draft PR 将在推送成功后回填。正式主站仍 v186，未覆盖。

## 实际网页增量

保留 KiiiKiii 自己的酸绿网格、深墨色和 Syne 字体，以完整 Universal 官方团体横幅开场。首页先展示全体五人的中文名和真实资料照，再进入观看与评分区。五人统一 3:4 容器、等宽同行（手机两列），原始人物构图不裁切；最后一人不再特殊放大或单独居中。照片本身的取景不同，容器统一不代表人为改成同样景别。

成员支持中文/艺名搜索、空结果、固定编号、个人详情、原图查看和 Escape 焦点恢复。发行目录支持六项精选发行搜索、独立详情、封面查看和精确作品入口；保留搜索条件往返。发行封面为原有 display derivative，按钮不冒称原图。内页省去首页大横幅，保留团体导航和视觉语言。修正全局 main 最大宽度与团页 padding 叠加造成的超宽屏收窄。

接入既有 9 个视频身份（7 MV、1 歌词视频、1 Track Film）、8 个舞台绑定、7 个单轴事件、30 条既有成员/作品关系。关系按原有稳定 ID 读取，未为所有成员/作品补造笛卡尔积。DEBUT SONG 没有既有舞台，不生成假入口。I DO ME 的 MV 上线日期和音源发行日期分别保留。

两张既有 Bugs 视频预览图通过 workId+videoId+view 精确匹配接通，明示来源，不用发行封面冒充 MV。其他外部缩略图失败时如实回退；尚缺七项本地精确视频预览及舞台图，不计图片全部完成。

## 素材、Figma 与资料边界

新增五张 2025-02-17 出道时期资料照，取自 [allkpop 具名报道](https://www.allkpop.com/photo/2025/02/starships-new-girl-group-kiiikiii-unveils-profile-photos)。每人姓名段落与紧随图片一一对应，具名 HTML 片段、URL、尺寸和 SHA256 见 `data/kiiikiii-portraits.json`，未凭人脸猜身份。文件为该刊载版本原字节，共366539字节；不称相机源文件或最新造型。五张已逐一视觉检查和解码。原私有图片引用留在 previousImage，用户快照和私有附件未改。STARSHIP CDN 已有拒绝记录，未绕过或重复探测。

Figma 实际读取 `zeLNExz4TbpWRW3uiahef7 / 211:1102` 的 get_design_context 和截图；它是1440×2209的旧结构稿，图片仍占位。当前网页用具名实图和3:4完整构图替换，新增搜索/发行内页尚无完整Figma验收，不宣称整团原生Figma完成。差异账本见 verification.json。官网/Universal/kiiikiii.kr 与 Spotify 做过来源和结构检索，不等同完整浏览器视觉研究。六项发行沿用2026-10-15已核目录，不宣称当前所有发行/OST齐全；销量和一位未知保留未知。

## 工程与只读隔离

- 正式修改：KiiiKiii组件、其路由CSS、资料JSON、本地成员照片；共享 `safeArtistReturn` 仅增加 KiiiKiii 六项合法 release 白名单，其余校验保留。
- 新增 `review/kiiikiii/`、`scripts/build-kiiikiii-review.mjs`、公开编辑白名单。复用非视觉审阅管线，不复制 Hearts2Hearts 的视觉模板。
- 构建时读取已有快照核对稳定ID；浏览器只获得明确列举的公开字段。评分/备注/观看/私人照片/收藏净化，原始快照和服务器模块不进入浏览器包。
- GET仅允许本团catalog；写入405、其他API404、外部fetch403，CSP connect-src none。九类隔离检查通过，不以成功toast伪造写入。
- 静态审阅使用物理 `index.html` 保留查询串；仅此包适配URL表达，保留原生history/dirty/save/返回安全约束。
- 构建只写仓库外专用空目录；加入现有QA站时保护171个旧文件SHA，新增21文件，临时浏览器fixture已移除。

## 验证结果

最终代码：43项 KiiiKiii专项 + 71项导航/Hearts2Hearts回归，合计114过0失败。TypeScript 0错误；Sites正式构建 exit0。测试、摘要、素材和构建输入指纹见 [证据目录](../evidence/20261023-kiiikiii-review-completion/)。初期测试发现动态JSON加载不兼容，已改为有限内联白名单并完成最终整轮测试。

真实浏览器在 managed Sites preview `terminal.local:4173`：LEESOL搜索→个人→原图→MV→舞台→返回保留状态/焦点；UNCUT搜索→发行→DEBUT SONG→返回；时间轴→作品→返回；查询页刷新保留结果，均实际操作通过。浏览器发现成员顶边不齐及2560收窄，修复后复验。

首页、成员目录、成员详情、发行目录、发行详情、作品库、时间轴共7页，各以320/390/1440/2048/2560的 **iframe CSS宽度** 测量，无横向溢出。不是顶层真设备/原生浏览器缩放。成员卡片同尺寸；快速加载时的false测量保留原始证据，最终首页五宽及成员390复查均解码成功。截图为真实桌面视图；console无terminal.local匹配错误，观察到独立chrome-extension错误。播放器、真实owner保存及线上部署后浏览器访问仍未测试。

## 发布

QA Site `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3` 继续 owner-private，v18 succeeded。Sites source `3b6233d7537e92830e393f7e167007717daf2c21`；版本 `appgprj_6ad9800421f8819188ffdf3bc8a8e0f3~appgver_bb6567f344fc8191836449163282ad9e`。本地gzip33390159字节、展开TAR40939520字节、193文件；服务器标准化存储40919040字节。GitHub提交与Sites源码提交分别记录。URL由成功部署返回的源站加实际物理入口提供，未宣称线上浏览器独立复验。

## 下一步

1. 等待用户 KiiiKiii v18 人工反馈；先修本团，不提前开发下一团。Hearts2Hearts v17 已确认，其他已认可页面继续保护。
2. KiiiKiii剩余项：Figma实图/主要内页、官网与Spotify完整视觉研究、七项精确视频图和同MV成员图、真视口/80%与125%缩放、线上浏览器及真实owner保存、正式主站集成发布。
3. 保留既有其他团待办；旧izna生产剪枝引用阻断和ifeye旧审计fixture3失败未修，未执行prune apply或放宽pins。审阅包成功不代表主站全量包通过。
4. 新电脑先fetch最新任务分支，读RESUME/STATUS和本日志。普通电脑 `npm run install:ci` 后 `npm run dev`；审阅构建 `node scripts/build-kiiikiii-review.mjs --out /absolute/dedicated/output`。不能将这份增量当全站替换包。
