# 跨电脑接续：正式站v189 / 原871已补140，剩731

更新：2026-10-26。本轮按用户要求收官并推送，后续继续补缺。正式工程是`apps/idol-site/`，不是根目录sandbox；活动分支`codex/mv-identity-quality-followup`，draft [PR41](https://github.com/KAtOReNA7/idol/pull/41)，未合main。

## 可直接复制给下一台电脑

请接续 https://github.com/KAtOReNA7/idol 的 `codex/mv-identity-quality-followup` 最新远端。先检查git status并保护所有本地未提交/未跟踪修改，再显式fetch活动分支；不要从旧main或codex/mv-cover-and-identity-batch重新开始，不执行强制reset覆盖工作。阅读本文件、AGENTS.md、docs/codex/STATUS.md、RESUME.md和正式v189收官报告，简短汇报核对结果后继续实际开发。

正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 已上线v189，不是旧审阅v11。现有2097认人图绑定/345作品/45团，628精确封面；原871已补140、仍731，另43旧低清和18未知统计开放。A至L已apply，不可重复。以reports/20261026-gap-l/ledger.json逐条缺口为准，K和原871清单保留作历史。

优先接续Hearts2Hearts Butterflies/Pretty Please/RUDE!共24条：已找到官方幕后视频、具名人工字幕及研究帧，仍需检查姓名实际对应镜头、同精确MV版本、原生540px有效3:4裁切和清晰度；候选帧未采用，不计完成。STYLE/FOCUS16已上线，不重复处理。其余缺口按每行已尝试证据与下一步走，不把同专辑概念照、其他语言/剪辑版或猜脸当认人证据。缺图不能关闭评分，5无真人精确视频规则保持。粉丝人数四舍五入整数万、不足万整数人、0/未知X隐藏；51已确认设计、个人评分备注观看状态、ID/关系及原有权限保持。

如继续发布，复用正式项目`appgprj_6acb4fa532b88191ae2588c24b724b17`，先读Sites技能并get_site/取得短时source credential，通过原生source helper在新电脑打开正式源。勿复制token或本机node_modules。保留DB/R2/MCP与owner保存鉴权。原生受众实为public、1owner/无外部/无组，不要因站点名称private自行改权限。原图在GitHub完整保存；仅有限清单的不可变公开原图按原字节同源流式交付，601小资源随包，9私有副本和1同SHA别名排除。完整TAR容量与字节检查通过后，带匹配archive保存/部署；push不等于上线。

## 获取最新代码

新目录：`git clone --branch codex/mv-identity-quality-followup --single-branch https://github.com/KAtOReNA7/idol.git idol`

已有目录先备份未提交/未跟踪内容，然后执行：

```sh
git fetch origin refs/heads/codex/mv-identity-quality-followup:refs/remotes/origin/codex/mv-identity-quality-followup
git log -1 --oneline origin/codex/mv-identity-quality-followup
git switch codex/mv-identity-quality-followup
git merge --ff-only origin/codex/mv-identity-quality-followup
```

若本地分叉或该分支正在其他worktree使用，先保留双方提交并检查，不强制覆盖。默认fetch可能仍只跟踪旧分支，务必用上述显式ref。首次克隆较大，原图保持完整，不用压缩替代。

## 已发布凭据与验证范围

- 正式v189源`aa37ceb91a0a33e2367f72eb2b00b99c5cacb74e`；部署`appgdep_6adf344efd3081919cb96a083e478be6` / succeeded。L原图引用9bab68a；历史v188源f3b295ce5822dc6ea3c9fd95869290d0a8ebe98d。
- [收官报告](formal-release-v189-closeout-20261026.md)、[K报告](identity-gap-k-report-20261026.md)、[L清单](reports/20261026-gap-l/ledger.html)、[正式证据](reports/20261026-formal-v189/)。研究原视频不作为新站资产；跨电脑可凭公开URL/字幕SHA/时间点重新获取，不能依赖旧电脑E盘路径。
- K125新文件152,312,357bytes和L16文件18,699,216bytes线上完整HTTP/字节/SHA通过。4721旧图全量HTTP/SHA在v187已验；v188/v189复核有限清单旧字节连续性，未冒称再次全量请求全部旧图。
- 浏览器为服务身份Chrome（Browser plugin not available），不冒称用户IAB；不测试真实保存、全视频播放、原生缩放或新Figma。公开目录指纹不等于逐项读取私人备注。
- Windows普通Node fetch不会自动使用配置代理；需要`node --use-env-proxy`。正常有限重试，绝不关闭TLS校验。正式源helper、git推送和上传若中断，先核源HEAD/保存版本/部署ID，不重复创建站点。
