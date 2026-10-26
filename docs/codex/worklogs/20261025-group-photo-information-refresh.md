# 51团照片、信息与首页模块更新

- 冻结基线：afaaa60，分支：codex/group-photo-information-refresh。
- 用户范围：索引重新找团照，51团照片审查、模块排序和公开信息；保持已认可设计语言。
- 环境：用户Windows本机D:/porject/idol，正式源码apps/idol-site；本机4220预览。Sites仍为appgprj_6add2704bc6c81918d3e0e2f13130422，不是旧v186主站。
- 素材：原文件保留，新源按原字节保存，索引3:2裁切逐张视觉核对；成员与历史成员按系列检查。
- 数据：仅有来源累计可展示，韩国Circle汇总明确地域/出货范围，冲突保留null，不扩展为全球累计。已有社媒观察保持guard与原日期。
- 实现完成：React首页源码实际重排；ifeye/izna/UDTT保留原生renderer边界接入信息；补齐原先首页未展示的MV和时间轴。共享记录/保存逻辑不改。
- 统计研究：docs/codex/group-information-research-20261025.md。
- 验证、照片审查、提交与v7发布均已完成，详细证据见下文。用户设计验收待进行，不得据build或加载通过宣称设计通过。

## 实现与本地复验完成

- 51团首页源码实际重排；信息区保留日期与来源，117账号入口/58人数，50团YouTube有值；32团韩国累计销量/23团一位有值。旧sourceHash校验未放宽，146条失配旧观察未重新绑定。
- 索引16团重选来源，其余逐图复查；统一3:2，修复CSS Grid图片天然高度使object-position失效的问题。实际浏览器255图片槽全部加载，图片框与卡片框尺寸一致；51张最终裁切已查看。
- 成员照仅审查，逐团存在的同套/历史/景别/资料卡问题列于交付报告。UDTT既有私密传输范围保持，陆雨婷独立历史原图未入GitHub。LE SSERAFIM现有5肖像/11发行图改为官网原字节本地交付，16源SHA已登记，不更换内容。
- 55项专项/边界/路由测试通过。扩展旧VM测试装载器以实际装载新信息组件，并将LE SSERAFIM远程URL断言改为来源URL+原字节SHA验证；未跳过断言。
- 类型检查通过；正式构建通过。51团×5宽=255首页布局复验（Kep1er/LE SSERAFIM修复后重测覆盖原失败记录），共享站40布局/5交互、索引255图片槽通过，无浏览器脚本错误、无写入请求。
- 仍有部分YouTube缩略图网络超时；INS/X大多缺公开人数，SPIA YouTube缺值，销量9冲突/10缺证，一位4冲突/24缺证。设计、资料、功能和上线仍分开验收。
- 已重新fetch并核对远端前轮分支仍为afaaa601。GitHub当前public，新增内容仅公开资料/原字节图/源码与进度；不扩展私人数据批准。
- 本地复验后已提交并推送代码，发布与线上复验记录见下方v7交付。

交付：[照片与问题总表](../group-photo-information-review-20261025.md) · [验证摘要](../group-photo-information-verification-20261025.json)。

## 线上复查后的图片托管修正

v6已部署成功，Sites源码038de58b、GitHub源码d620aded。67份固定GitHub原图HTTP/SHA核对全部一致。但线上首次索引检查在1秒等待内有多张原图仍在传输，未宣称图片检查通过。随后调整审阅打包：51张索引团照与LE SSERAFIM的16张现用原图（69,920,573字节）随同一站点原字节交付，其他大图库保留固定GitHub源；不压缩、不改图片，不扩大私密资料。

已据此发布v7并重做线上加载检查。线上图片检查等待真实load/解码完成，不以本地快速加载时间替代线上等待。


Sites源仓库拒绝一次性上传全部67张原图（receive-pack request exceeds maximum size），不是部署/访问权限拒绝。失败本地提交dd362901保留于旧Sites checkout，未reset/force push。采用常规生成资源构建：源中保存固定SHA清单与hydrate-review-originals.mjs，67张派生静态资源从固定GitHub原字节重建并逐一核对SHA/长度；它们不进入Sites源码Git上传，但进入同一版本的静态部署归档。新建同Site来源checkout从远端038de58b恢复，既有站点身份、权限和私密资源范围保持。


## 最终交付：v7发布与线上复验完成，待用户验收

- GitHub代码固定版本：`49746f92a8751c72f4928cd3eb7df5ecff5b8c0a`（前序`d620aded`页面与资料、`20df9aa0`同站原图）。本轮draft [PR #37](https://github.com/KAtOReNA7/idol/pull/37)，base为`codex/apple-music-site-redesign`，未合并main。收尾文档另作同分支提交。
- Sites原生返回`succeeded`：v7，deployment `appgdep_6ade1eee95788191b625791af6c94278`，version `appgprj_6add2704bc6c81918d3e0e2f13130422~appgver_65c19e712df88191a7684e8e2da82ec7`；源码`924214c62e5e793e171dc8d1123cc5b4b461b872`。
- [统一验收入口](https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/?view=groups)。确认sole owner、0 groups，保持owner-private只读；本轮无真实保存写入，旧v186站点未改。
- 线上服务身份Chrome：51图×5宽=255索引槽加载/3:2/cover/框尺寸/无溢出通过；51团信息区/117账号入口通过；共享40布局/5主要交互通过，无脚本错误、无写请求。不是用户IAB会话。全页截图Candy Shop曾短暂未绘制，滚入视口等待decode后真实卡片截图与样式核对通过。
- 67份公共原图69,920,573字节按固定GitHub来源/SHA原字节随本站提供；重建脚本验证67份，并实际补回一个缺失图片再次验证SHA/长度。v7静态归档73,627,258字节。打包修改后3项静态边界测试复验通过，它们已属于55项，不重复叠加计数。
- Sites可接续目录：`C:/Users/61919/.codex/visualizations/2026/10/25/group-photo-refresh/site-generated-originals`。使用其`.openai/hosting.json`，不是正式工程中另一个旧站ID；根部`hydrate-review-originals.mjs`按`dist/review-all/manifest.json`从固定publicRef恢复67份被精确gitignore忽略的生成图片，归档包含实际图片。失败checkout与本地提交保留，不从旧失败目录继续发布。
- 完整本地/线上证据：同一scratch目录下`verified-home-layout.json`、`local-index-qa.json`、`local-qa.json`、`public-originals-qa.json`、`online-index-qa.json`、`online-information-qa.json`、`online-qa.json`、`online-candy-render-qa.json`。共享验证JSON与逐团照片审查已入仓，不包含认证信息。
- 仍未解决：大多数INS/X人数、SPIA YouTube；销量9冲突/10缺证，一位4冲突/24缺证；成员照片混套/历史时期/资料卡和景别差异仅审查、未全面替换；部分外部视频缩略图偶有超时。未验：真实生产保存、全视频播放、80%/125%原生缩放、新Figma同步。`open_in_codex`两次返回queued，不能记为用户IAB通过。
- 下一步：用户统一验收本轮图片、信息区和模块顺序；继续补证应保持原图与个人字段边界，不将未知统计填0、不将韩国累计称全球总销量。
