# 四条官方舞台采用增量

用户在此前只读研究之后，明确选择按官方资料绑定 IVE《WAVE》《CRUSH》、XG《HOWLING》《MILLION PLACES》，并展示核验范围。此决定覆盖 `formal-candidates-next-check.json` 中这四条暂缓采用的结论；该文件保留为历史研究证据。

| 稳定作品 ID | 曲目 | 精确舞台 ID / sourceKey |
|---|---|---|
| recvxyHuKM2wRG | IVE · WAVE | _rn2nefy610 |
| recvxyHuKMCtUB | IVE · CRUSH | crGAr4NQRa4 |
| recvxDMFHNUJlD | XG · HOWLING | mf4X6i5cm_Q |
| recvxDMFHNSckK | XG · MILLION PLACES | nd2aaJ9AQjA |

根任务已通过真实所有者浏览器检查新绑定前提，检查时间为 **2026-10-27T15:23:43Z（UTC）**；这也是四条 `scoreBinding.initializedAt`。报告不记录私人评分、身份或会话。采用阶段未调用线上私人写入 API。

## 核验口径

- 四条使用官方单曲发布、固定频道、发行资料、节目/活动报道和时长证据；IVE日语由当时报导明确支持，XG原曲英语由发行目录歌词支持。
- `completeness=full` 是本次经用户同意采用的官方单曲及发行时长资料判断，**不是完整音画播放验收**。`fullPlaybackVerified=false` 保留在采用证据中；不声称逐句音轨比对、真唱或全球最高点赞。
- 公共与所有者页面都显示 `verificationNote`，明确“未完整播放及逐句核对音轨，不据此判断真唱”。旧 `typeNote/sourceUrl` 等诊断信息仍按原公共投影规则隐藏；只增加此专用公开说明字段。
- 2026-10-27T15:26:12–15:26:14Z 重新读取四个公开watch页面，固定视频、频道、发布日期、时长、精确可访问点赞与页面SHA；只代表该时刻公开页面证据。

## 数据与封面

- 正式舞台 **478 → 482**；旧478条所有字段按逐条canonical SHA保持，其他状态记录保持。
- 未配正式舞台 **123**：not_found 57、version_mismatch 50、blocked 16；另9条缺歌曲身份占位。inventory614 = 482正式 + 123待解决 + 9占位。该状态来源于现有运行时研究状态，不代表本次重新穷尽搜索123条。
- 原628公共封面保持，另增4张精确舞台封面，合计 **632**。新图均为原始1280×720 JPEG，共566705字节，不裁切、不压缩；四个SHA/来源在 `formal-four-adoption.json` 与 `data/stage-selection-posters-20261027.json`。
- 封面展示只匹配稳定作品ID、精确videoId和stage视图。未修改628原封面登记或原件。
- supplementary研究原文及78条alternative均未删除。页面只过滤已成为当前完整正式舞台的同ID观看卡，避免同一视频同时标记可评分与仅观看；clip仍保留完整视频观看入口。
- ROCK THE BOAT歌词差异和Voltage截短版继续只读。

## 验证

- 当前树19个去重测试文件统一运行 **126项全部通过**，见 `../focused-tests-v194.json`。没有把历史109项或中间19项重复相加。
- 新5项测试覆盖旧478记录、精确绑定/公共核验说明、4原封面SHA和严格tuple、重复观看卡过滤、真实native保存schema及POST路由的内存执行。
- POST路由测试仅替换认证入口和native分派，用真实字段校验、原生保存逻辑及SQLite内存数据库；4新绑定可保存模拟分值且幂等，错视频、错sourceKey、越界分、非owner、异源均拒绝；模拟MV分、备注、观看状态保持。没有生产写入。
- `validate-stages.mjs` 通过，614 inventory / 482 formal；`validate-supplements.mjs` 通过，129作品 / 78 alternatives / 8 watch leads / supplements scoreBindings0。
- 本子任务不commit、不push、不部署；正式构建、原件发布、线上复验由根任务接续。报告不把本地482写成已上线。

## 发布前界面复验

四支舞台在 320 / 390 / 1440 三宽完成 12 项匿名公开布局及 12 项本地模拟编辑者布局。实际切换舞台标签、4 张 1280×720 原封面、核验范围文案及去重复仅观看项通过；模拟评分输入启用且空白，两个保存按钮初态禁用，没有发出保存。发现 XG 舞台播放按钮继承主题大按钮遮图，已仅在 XG 舞台播放器内限制为 44px 圆钮，其他团体设计及按钮保持。

本地编辑者身份在匿名 SSR hydration 后模拟；不是登录或线上 owner 验证。最初夹具 hydration 故障已修正，最终无页面异常；12 个 /api/status 401 来自没有服务器认证的模拟编辑者，未绕过真实鉴权。修复后 18 项相关测试、TypeScript、diff 检查通过；与之前 126 项完整专项不重复累计。详情 `../browser/formal-four-stage-local.json`。
