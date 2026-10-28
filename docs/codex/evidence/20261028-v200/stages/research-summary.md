# v199 后舞台来源有界复核（2026-10-28）

本次为研究记录，不修改应用、评分绑定或线上来源。基线为 `21b12a6f0d49f355ee639ae87bb2b294ba58513f`；493 个正式来源、112 个新增缺口及11个旧来源替换保持。没有新合格来源被认定可直接采用，不代表这些作品不存在合格表演。

本轮重点复核12个较可能出现常规节目或官方完整练习室的作品。来源搜索按节目优先、练习室其次；表演版MV、幕后、音频、演唱会、巡演及未证原发的第三方练习室题名不充当正式来源。实际音轨、完整播放和逐人出镜均未核验；未使用用户Chrome、owner会话或私人导出。

新增能够收窄问题的证据：

- **KiiiKiii · DEBUT SONG**：[KBS WORLD 2025-02-28报道](https://world.kbs.co.kr/service/contents_view.htm?board_seq=456104&id=&lang=k&menu_cate=)明确说明前一日M Countdown实际上表演的是 I DO ME；DEBUT SONG 仅在登场VCR/蛋糕场景的报道中提及。不能将含有歌名的节目报道或首次出道舞台检索结果配给本曲。
- **KATSEYE · Gameboy**：[艺人官方视频目录](https://www.katseye.world/videos/)可核的同曲条目为MV与不同版本音频；相邻的 Performance / Dance Practice 条目属于 Gabriela / Gnarly，不能因同专辑或相邻标题而误配。目录不是全网穷尽证明，后续仍可查节目权利方原档。
- **STAYC · MEOW**：[官方录音幕后](https://www.youtube.com/watch?v=LZfaAxp7i5Q)是 Recording Behind，不能当完整练习室或打歌片源。官方说明将MEOW与另一首Cheeky Icy Thang日语版区分，后者舞台不可代替。
- **IZ*ONE · Buenos Aires**：[2019-06-01同期报道](https://spice.eplus.jp/articles/240115/amp)给出NHK《シブヤノオト》精确播出线索（6月1日24:05），但当前没有取得可访问的完整权利方原片。报道和电视播出事实不等于可导入视频。
- **ITZY · Boys Like You**：新搜索出现两个题名为Dance Practice的精确ID `QA83BdN4iOw`、`w-WEZoiVs_E`，但原页读取被检索服务限流，上传者、原发链与完整范围没有证实。保留为低优先级未证线索，不升格官方，不改旧来源。

其余 ITZY Voltage、STAYC LIT、Hearts2Hearts Moonride、NMIXX Caution、XG IYKYK / IN THE RAIN、KISS OF LIFE Painting 的新检索只返回既有MV/制作表演、幕后、音频、非本人或活动路线。详细搜索范围、原队列指针和各项下一步见 `research.json`。本轮没有把这些搜索结果写成“没有表演”。

YouTube原页工具返回 `Online fetch throttled` 后，没有继续请求该路线、切换身份、取用登录Cookie或绕过限制。可独立读取的KBS、艺人目录与发行公司资料继续核验。既有图片批次、原始图片、稳定ID、关系、私人数据和访问授权均未修改。
