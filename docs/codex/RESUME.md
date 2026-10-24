# 接续：Geenius 官网重设计 v29 待确认

用户否决了 v28 的旧仓库视觉，仅认可图片。现已按 [HOMe 官网](https://www.geeniushome.com/geenius) 重做网页并发布 **v29 owner-private 审阅**，没有沿用旧纸色蓝灰版式。**等待本轮新设计确认，不开始 TRACER。** 主站仍 v186，未合并 main。

- [打开 Geenius v29](https://idol-billlie-qa-oct22.wuke40758.chatgpt.site/artists/geenius/index.html)
- [本轮重设计、验证、发布日志](worklogs/20261024-geenius-official-redesign.md)
- [Figma 可编辑画板](https://www.figma.com/design/zeLNExz4TbpWRW3uiahef7?node-id=1047-1095)
- draft [PR #18](https://github.com/KAtOReNA7/idol/pull/18)，base 为 codex/adya-review-completion。

继续分支 codex/geenius-review-completion；正式工程 apps/idol-site。先 fetch 最新远端并比较工作树，不从旧 main 开工，保留其他电脑未提交改动。起点 ea08240d62974c299e9a690b44d8778384951793，交接以本分支最新远端 HEAD 为准。

v29 官网风格重设计已发布，27 个可编辑 Figma 画板已同步；39 项专项/回归、类型、正式构建和 45 项真实视口布局通过。394 个其他团审阅文件 SHA 不变。线上 IAB 导航超时，真实保存/播放和原生缩放仍未验，等待本轮网页确认。

五成员、三发行、七精确视频、四事件、原图及手帐往返保持；没有修改原始快照、稳定 ID、评分、备注、观看状态和权限。官网没有的目录/手帐按其视觉语言扩展；字体使用 DM Sans / Noto Sans SC 兼容替代，不宣称官网逐像素复制。

长期规则：以后任何团体沿用仓库既有设计，都必须在交审消息中明确说明沿用的版本/部分、实际参考官网与差异。v28 旧验收记录仅作历史，不能覆盖本次否决与重设计决定。新 Figma 索引见 worklogs/20261024-geenius-official-figma-frames.json；字距等细微度量不冒称完全一致。
