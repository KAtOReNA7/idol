# 旧认人图提质复核与可恢复提升（2026-10-26）

状态：4条已审提升增量，等待主代理统一apply、浏览器集成与发布；本子任务没有修改主审计、运行数据、关系、评分、备注、观看状态、访问权限或站点。

基线：`codex/mv-cover-and-identity-batch` / `3d36849735767b374075e03779a35b61ba5b900e`，主审计SHA256 `f43a12f2ba88348d25856ff9300bb5ddaa4324f5f27c2e72334a5a689b7b9c68`。冻结审计记录47条card_only；其中10条具有同workId/videoId/memberId的已归档大尺寸备选。本轮重新下载20份before/after原文件，全部SHA/长度与审计一致，实际解码尺寸一致；没有下载新的替代版本或改写原像素。[20份原文件校验](reports/20261026-quality-promotions/original-files-verification.json)可复核。

## 已审可提升的4条

| 团体 / 精确作品 | 成员 | 当前原图 | 提升原图与3:4显示 | 来源 |
| --- | --- | --- | --- | --- |
| fromis_9 · WE GO · `HM6UpQZvbhY` | ROH JISUN / 卢知宣 | 760×508 | 3840×2160；显示裁切1620×2160 | [DBKpop具名精确MV页](https://dbkpop.com/mv/fromis_9-we-go/) |
| i-dle · TOMBOY · `Jh4QFaPmdss` | SOYEON / 田小娟 | 735×490 | 3840×2160；显示裁切1620×2160 | [DBKpop具名精确MV页](https://dbkpop.com/mv/gi-dle-tomboy/) |
| i-dle · TOMBOY · `Jh4QFaPmdss` | MINNIE / 妮查·约塔拉拉克（音译） | 735×490 | 3840×2160；显示裁切1620×2160 | 同上 |
| i-dle · TOMBOY · `Jh4QFaPmdss` | YUQI / 宋雨琦 | 735×490 | 3840×2160；显示裁切1620×2160 | 同上 |

当前来源HTML已重新读取：每条所选图片URL、相邻具名caption与精确YouTube ID均在同页出现。身份依据为文字具名，不按面孔识别。页面SHA/字节数、原图SHA/长度/尺寸、旧新路径及实际裁切见[reviewed delta](mv-quality-promotions-20261026.json)。这是来源内嵌精确视频的第三方截图证据，没有声称逐帧独立核验或相机原片。

实际对照后，4张备选在完整脸部、眼部细节和主体构图上均比当前卡片级素材更适于放大查看。原MV光线、色彩与镜头特性保留；“source_resolution”表示通过本批分辨率门槛，不等于所有面部都可统一称高清。

只提升选择，不新增绑定。计划结果：绑定1906、缺图关系922、封面628均不变；card_only **47→43**。4条旧完整记录交换进alternateIdentityImages，旧原图与旧证据不删除；既有alternate的完整来源保留。历史unboundApprovedCandidates研究注册不覆盖。

## 未采用的6条备选

- Kaede《Girls Never Die》：827×888截图虽大于当前600×412照片，但实际柔糊且一只眼部分闭合，保留当前较清楚照片。
- LOONA《favOriTe》5条：Olivia Hye、Chuu、Heejin、Kim Lip、Haseul。1920×1080截图有效内容仅约807px高，实际较暗、柔软；几张近景在3:4时截断脸部，Haseul尤其明显。未只按尺寸将这些项降为已提质。
- H2H 390px具名拼图、ILLIT柔糊/版本不明候选、AtHeart文字覆盖候选未重新批准。

已实际查看的完整3:4 before/after对照：[1](reports/20261026-quality-promotions/before-after-1.jpg)、[2](reports/20261026-quality-promotions/before-after-2.jpg)、[3](reports/20261026-quality-promotions/before-after-3.jpg)、[4](reports/20261026-quality-promotions/before-after-4.jpg)。10个备选全部计入审查，只有4个通过。

## 安全提升工具与验证

`apps/idol-site/scripts/promote-mv-identity-alternatives.mjs`默认dry-run，只接收1份冻结增量。必须同时通过：主审计SHA、旧新三元组、旧新SHA与路径、既有评分身份、已存在alternate的来源及精确视频证据、明确人工3:4审查、旧新原字节/解码尺寸、有效宽至少540px的严格3:4裁切、原排除边框范围。

纯plan克隆输入；验证失败不写文件。apply前再次核对主审计SHA；只交换选中/备选、重算图片汇总并新增`qualityPromotion20261026`记录，不覆盖batch20261026或历史研究。不创建成员关系，不改变5个已核实无真人精确视频的评分策略。

9项边界测试通过：成功提升且完整保留旧记录/其他字段、冻结SHA变化、错视频、错旧新SHA、元数据被改、重复、错误裁切/边框、未完成人工/来源复核、原字节或尺寸拒绝。对真实审计的纯plan也验证4条旧记录仍完整存在，workCoverage深比较完全相同，绑定总数不变；详见[计划验证](reports/20261026-quality-promotions/quality-plan-verification.json)。CLI真实文件默认dry-run亦通过，输出`applied:false / promoted:4 / cardOnlyImages:43`。主代理apply、浏览器与发布验证另计，不继承旧v11验收。

主代理统一执行（从正式工程目录；先dry-run，再经主代理核图apply）：

```text
node --test tests/promote-mv-identity-alternatives.test.mjs
node scripts/promote-mv-identity-alternatives.mjs ../../docs/codex/mv-quality-promotions-20261026.json
node scripts/promote-mv-identity-alternatives.mjs ../../docs/codex/mv-quality-promotions-20261026.json --apply
```

## 统计边界

本子任务于2026-10-26对现有18项未知中的部分另查新证据，未获得合格数值增量。实际检查范围、层级和来源如下；核查日不是平台计数截至日。

| 实际检查项 | 来源与动作 | 实际结果 / 层级 |
| --- | --- | --- |
| GENBLUE一位 | 正常打开[Soridata具名页](https://soridata.com/artists/GENBLUE.html) | Web工具报告URL不可通过该工具访问；未取得页面正文，不推定真实0或目标站HTTP状态。 |
| TRACER一位 | 正常打开[Soridata具名页](https://soridata.com/artists/TRACER.html) | 同上；不把未读取记为页面确认零。 |
| VCHA一位 | 正常打开[Soridata具名页](https://soridata.com/artists/VCHA.html) | 同上；未用后续GIRLSET成绩替代旧品牌。 |
| GENBLUE X | 正常打开[官方账号](https://x.com/GENBLUE_ten) | Web fetch报告403 Forbidden；未取得计数，停止此路径。搜索[J-enta](https://www.j-enta.com/en/artist/752/GENBLUE)只显示无Last update的0/0，不能确认真实零。 |
| VVUP X | 正常打开[官方账号](https://x.com/vvup_official)；查[Chartmetric](https://chartmetric.com/fr/artist/11653998)搜索结果 | Web fetch报告403；Chartmetric搜索结果的2026-10-23刷新页列INS/TikTok/Spotify/YouTube，没有X计数。不把别平台人数移植到X。 |
| GIRLSET X | 正常打开[后续品牌账号](https://x.com/GIRLSETofficial) | Web fetch报告403；未取得计数。未当作VCHA历史人数。 |
| EVERGLOW当前INS | 正常打开[当前账号](https://www.instagram.com/everglow.offcl/) | Web工具报告`Online fetch throttled`；属于读取工具层限制，没有取得平台人数或平台响应。 |
| EVERGLOW X | 精确账号名+Followers搜索 | 只得到第三方其他账号页中的旧关联卡11K，无计数日期，未采用，也未将旧公司账号数移植。 |
| BADVILLAIN销量 | 查[艺人条目](https://en.wikipedia.org/wiki/Badvillain)与[Overstep条目](https://en.wikipedia.org/wiki/Overstep_%28single_album%29)搜索线索；正常读取[Soridata艺人页](https://soridata.com/artists/BADVILLAIN.html) | 5367线索指向2024年两周OVERSTEP榜单累计，原始Circle两周页本批未读；不足以证明全团完整累计。Soridata正文Physical Sales为0+，已知另有实体发行，不能把缺统计当真实0。未据此改数。 |

上述403为Web工具报告层级，没有额外证明403来自目标平台；不借此推定账号私密、下线或平台封禁。没有继续绕过拒绝路径，也未为无新证据项反复请求。

因此本批不修改统计，18项未知仍开放，显示0与真实确认零继续区分；这不是对18项全部完成新一轮核实的声明。
