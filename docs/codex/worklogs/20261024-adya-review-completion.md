# ADYA 原生页面完善与 v26 审阅

## 基线与授权

用户已确认 ODD YOUTH v25并授权继续。按PRD队列推进ADYA；开工fetch、核PR，远端与本地 `4a261051f8e1bccf8865dd3b1d0ca1246d5e6ae7` 一致，无重复接续。分支 `codex/adya-review-completion`，stacked draft PR以 `codex/oddyouth-review-completion` 为base。正式工程 `apps/idol-site`，主站v186未变。

## 已实现

- 独立黑底朱红演出海报设计；大标题、完整团照、侧索引。五人等大4:5真实具名资料照，详情及原图保留完整构图；中文显示名明确为资料库译名。
- 成员搜索、详情、关联作品、原图/Escape/焦点恢复；发行搜索与详情、六个独立影像/舞台、五条按日期排序的发行事件及已有手帐往返。
- 五张发行封面、五张成员原图、六张1280×720精确视频预览。RIZZ同一个视频仅列一次，保留影像/舞台两个既有评分入口。
- 保留10条既有成员作品关系、3个作品及3个stage绑定；不从当前名单或OST录音推断视频出演。0为有效评分，null为未评分；无native记录的OST只浏览。
- 只读审阅打包清空个人评分/备注/观看字段，写入405、外域403、CSP connect-src none，snapshot不进入bundle。

## 来源与边界

[公开证据](../../../apps/idol-site/docs/artist-evidence/adya-review-20261024.json)记录素材、SHA、发行、官方频道与未知项。

五位肖像来自2023-05-09 CBS/Daum具名采访，各图标明Starting House供图；团照来自2024-12-23 CJ ENM Japan官方合作方新闻稿。五发行以Bugs目录核日期和曲目；OST总集仅列ADYA参与的第2轨，不将其他12轨归给ADYA。六视频用YouTube oEmbed核标题/频道，未拿发行日冒充视频发布日期。

历史日本官网adya-aday.jp当前为域名出售页面，入口改为有证据的官方频道。未推断解散、当前合同。2026同名平台条目Your Cheating Still Remains存在版权身份异常且无官方佐证，暂排除。

## 验证

- ADYA专项与已有导航/评分/只读回归共49项通过；TypeScript `tsc --noEmit --incremental false --pretty false` 通过；正式 `npm run build` 通过。
- 8类团页×1440/390/320/2048/2560真视口=40；另共享手帐五宽=5，共45项无溢出、缺图或pageerror。已实看首页、成员、发行和Figma关键图。
- 10综合浏览器场景通过：五图等大、搜索/空态、原图/Escape/焦点、成员→Per→真实共享手帐→返回、发行搜索保留、OST只浏览/RIZZ双槽、页面图片重试、弹窗图片重试、非法ID恢复及只读请求隔离。
- Figma page `798:1095`：24个原生可编辑画板，8类页×1440/390/320；17个单图组件、6色变量、可编辑文字/SVG及自动布局。修正标题换行、团照WebP兼容、05换行、箭头CSS及原图按钮对齐。关键截图和发行320 design context已读回。没有整页截图画板。
- 线上v26首页在IAB实开，完整内容已读到；随后成员点击工具45秒超时并重置，线上交互未全验。未重试已失败路径。
- 真实保存/视频播放、80%/125%原生缩放未验；共享手帐Figma、所有叶子文字间距完整对照仍待同步。部分历史成员关系缺作品专属认人图，审阅手帐明确显示待补，不用资料肖像伪装MV截图。

本机证据根：`C:/Users/61919/.codex/visualizations/2026/10/23/01a1694f-9d8c-7f82-a9a8-1732f12fea0e/adya`，含tests/build/layout/interactions/record-layout与截图；临时研究和构图脚本在ignored `.codex-local`。这些本机路径不是跨电脑已交付文件。

## 发布

- QA：`appgprj_6ad9800421f8819188ffdf3bc8a8e0f3`，owner-private，仅owner、0外部访客；权限未改。
- 正式返回版本 **v26**，deployment `appgdep_6adbc7662f848191b1dd7a0a68e2f57b` 为 succeeded。
- Sites source `537d8e3f14d1fb3365d85c1538877fe7169fe909`；archive SHA `f12c8358f71b551c53947d1ea711b594d9958aacd21fff7bfe157340bf738292`，116858880 bytes、395文件（含hosting manifest）。
- 原366个QA文件逐一SHA不变，增加28文件；保留其他团页面。review fingerprint `8966d0a94a16502d5b866fb274a75dc990bef963bfb0de540d4474499bda184b`，21资源/6630985 bytes、10 sanitized relations、9 isolation checks。
- [ADYA审阅入口](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/adya/index.html)。用户确认前不开始Geenius，公共功能例外。

## GitHub 与接续

本轮代码、公开来源与此交接一起提交到 `codex/adya-review-completion`；实际commit和draft PR在收尾同步。未合并main。接续先核最新远端，不从旧main或旧候选重做。
