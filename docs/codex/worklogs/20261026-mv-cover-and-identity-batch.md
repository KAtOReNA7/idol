# MV封面遮挡修复与认人图批量补缺

- 用户确认v9并要求继续补齐大量认人图，附作品列表截图：官方MV标记背景扩张，遮住大部分封面。
- 分支`codex/mv-cover-and-identity-batch`，冻结基线`9e46361`；开工工作树干净，fetch后无远端分叉。
- 范围：修复共享作品卡片遮挡；研究高缺口团具名精确MV图库和官方MV拍摄专题，批量补图并检查3:4显示；保留51团风格、当前名册、稳定ID、个人字段、现有成员关系和权限。
- Sites已核对指定站点当前v9、owner-private一位owner。继续使用同站发布，旧v186/main不改。Sites技能允许有界素材研究委派，A/B/C研究分组独立delta，主代理独占共享数据、UI、发布及Git整合。
- 仅无成员真人出镜的精确MV关闭成员评分；不能因缺图关闭。不得通过脸部识别猜姓名或用概念照冒充同MV照；来源不能消歧、受限、低清或文字遮挡时保留缺口。
- Browser plugin not available，使用既有Playwright与系统Chrome；目标流程：作品列表→清晰封面/小标签→作品详情→成员认人图→原图→关闭/返回。线上与本地分别记录，真实个人保存/全量播放/原生缩放不冒称验证。
- 本轮完成并发布v11；长期资料缺口仍开放，具体结果如下。

## 封面修复检查点

已在本地v9同包复现截图问题：`.music-experience .video-badge`设置left/bottom却继承旧`.video-badge`的top/right，绝对定位背景被四边拉伸。改为完整inset重置与内容自适应宽度，保留右下播放按钮空间、长标签省略和点击穿透。没有更换或压暗封面原图。

本地六宽320/390/768/1440/2560/3840、144个卡片标签与作品详情往返通过，控制台warning/error及pageerror均为0；正式构建通过。修复将先更新指定站点，批量认人图完成后再合并本轮增量。证据在本机`C:/Users/61919/.codex/visualizations/2026/10/26/mv-cover-batch/`。


## 最新交付：封面遮挡修复与657条认人图补齐，v11（2026-10-26）

用户已确认v9，要求修复作品列表封面遮挡并尽快批量补齐缺图。指定站点先发布v10封面修复，再发布v11图片增量；均保留owner-private只读权限、51团已认可设计、原图字节、稳定ID和个人记录，旧v186/main不改。分支`codex/mv-cover-and-identity-batch`，冻结`9e46361ef8aa3a112637a997443feb4dafc437ff`。

本轮新增657条已有关系认人图，涉及22团114作品，缺口1579→922；累计1906条、312作品、42团，628精确视频封面保持。657原文件382,619,101 bytes未压缩；无新增card_only，既有47条仍待提升。包含tripleS《Baby Flower》官方具名MV拍摄24图；其余具名MV章节保留版本依据，未冒称独立逐帧验证。低清、遮脸、文字覆盖、版本不明候选不纳入；缺图不能关闭成员评分，5个无真人精确视频规则不变。

封面根因是新左下定位继承旧右上定位，背景被拉伸；完整重置定位与标签宽度后，本地/线上各六宽144卡片通过。13专项、类型、正式构建通过；本地228作品布局/22原图流程，线上84作品布局/22原图流程，657远端HTTP/SHA通过。9个初次TLS连接错误降低并发正常重试后通过，未关闭证书验证。真实保存、全视频完整播放、原生缩放、用户IAB、新Figma及全仓测试未验。

完整结果与仍未解决项：`docs/codex/mv-cover-identity-batch-report-20261026.md`、验证JSON及同名工作日志。复用方法见`docs/codex/mv-identity-batch-method-20261026.md`；最新922条待补CSV与51团完整表在`docs/codex/reports/20261026-v11/`。18项统计未知、个人页统一排版仍保留原决定；下方v9及更早数字为历史。


## 发布身份

```json
{
  "version": 11,
  "projectId": "appgprj_6add2704bc6c81918d3e0e2f13130422",
  "sourceCommit": "c28c945987e22803b81ea266e6aaadf1ce972cb0",
  "deploymentId": "appgdep_6ade4ada7ef08191b35e4a0adf0a4b6d",
  "savedVersionId": "appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_fc0f8a37c5f481919dd2cae7fba98ae4",
  "status": "succeeded",
  "url": "https://idol-all-groups-review-oct25.wuke40758.chatgpt.site"
}
```

源凭证过期后通过同站原生工具正常续期；没有绕过权限。新增原图提交a250a4d已推送。研究JSON/MD只规范化LF行尾，图像字节未改。GitHub初次657项校验648通过、9项SSL连接异常，降至2并发且保留证书验证后9项全过，原始异常保存在验证归档。

最终v11已实际查看桌面作品封面及XG、IVE、BABYMONSTER线上认人图截图，图片解码完成且无封面黑块。`open_in_codex`打开作品页返回queued，未将其视为用户IAB验收。推送前28份新增/修改文本的凭证模式检查无命中，`git diff --check`通过；远端任务分支与本地提交一致，无其他电脑分叉。

GitHub实现与完整报告已推送：`74007464dc10ef1d9b5c41d28c653fcf98044d43`；[draft PR #40](https://github.com/KAtOReNA7/idol/pull/40)，目标分支`codex/data-gap-followup`，未合并main。
