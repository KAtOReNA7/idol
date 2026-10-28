# 2026-10-28 作品人物证据续查候选

本目录是供主任务审阅集成的独立增量。未改应用 JSON、私人关系、评分、权限或原件；没有提交、推送或部署。下列“可采用”仅表示证据候选准备完成，不表示正式站已增加。

## 两条公开署名候选：6＋1人

- **NMIXX《FEIFEI》6人录音署名**：The Kraze 2024-08-06文章有作者Jacob Aron Leung及编辑Clark Royandoyan，目标曲段落明确描述听到六人演唱；其HTML实际嵌入 `zrYC3LEpc6w`。文章区分更早香港现场与7月31日录音发行。采用既有 `documented_project_lineup` 类型并显示“公开录音署名”，不标成官方唱片内页，也不声称逐人出镜核验。
- **BADVILLAIN《+82》Emma部分表演署名**：OSEN 2024-05-08目标视频报道明确描述Emma的表现，Sports Kyunghyang同日报道可交叉核对。这两文可能来自同一BPM供稿，不当作两个独立演员调查。主文没有视频ID；6月4日Annyeong Oppa发行文章实际嵌入 `jKdANBLxj2U`，在后来所述6月5日另一Performance上传之前，配合精确曲名、发布事件桥接5月版本。保守仅列Emma，不按7人名册补齐其余。主任务应复核该跨来源版本链后采用。

`public-work-credits.delta.json` 与 `public-work-recognition.delta.json` 可用于集成；`public-credit-candidates.json` 保留更详细的证据范围、稳定ID与限制。生成增量时已经检查两作品未存在于原38公开署名、作品ID/videoID/groupID/memberID对应正确。

7张均复用已审完整原件，原SHA/字节/尺寸验证通过，展示裁切严格3:4、在原件边界内；没有增加新原图。实际裁切目视见 `recognition-seven-crop-review.png`。NMIXX选择官方具名Fe3O4: FORWARD概念系列：背景在同一系列内有区别，优先清晰近景。另对比Blue Valentine与Heavy Serenade系列，因部分暗光、远景或头部裁切，未替换到这些候选。Emma沿用ZOOM概念照；均明确是认人后备，不是FEIFEI/+82同期妆造证明。

## 三个无真人候选仍开放

- **Rich Man Yellow Claw Remix**：Blognone明确无成员报道及精确嵌入已重新核对，205秒官方页恢复，仍缺完整视频画面检查；没有新增规则。
- **Supernova Grimes Remix**：新找到创作者Park Sohee（박소희）的Coloso专业简历，明确列本remix导演署名，后续可沿GSFT/个人制作档案寻找完整画面证据。其简历未给精确视频ID，不与Other World版本混同；233秒目标视频元数据恢复不等于已看片。
- **BANG BANG MINIVE**：精确官方页恢复，视频实际74秒。既有角色宣传报道只能证角色项目；本次没有找到足以独立排除所有真人插入的材料。后续优先完整核74秒及片尾。

`no-member-exact-page-check.json` 记录三页的HTTP200、精确标题/频道/时长/播放器OK与HTML SHA；这是元数据读取，不能写成完整播放。`no-member-followup.json` 保存新增制作方入口与后续步骤。新增无真人规则0，未向用户提出凭脸猜人或代替事实的选择。
