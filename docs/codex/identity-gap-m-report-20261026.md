# Hearts2Hearts M 批：24 条认人图核验与补齐

2026-10-26。从 `codex/mv-identity-quality-followup` 远端 `279a1e9f598b2f75ab205e4b0896ebd4f12669ec` 接续；开工工作树干净，显式 fetch 活动分支，未回退 main。A–L 未重复导入。正式站 **v190 / succeeded** 已上线：[打开正式站](https://idol-lens-private.wuke40758.chatgpt.site/)。源提交 `0842a321033152cacd6c5a0c8c6790d654d33ea0`，部署 `appgdep_6adf62e9eed08191bf2bd6c7251af40b`；原public受众、1owner/0外部/0组保持。

## 实际完成

对 Hearts2Hearts《Butterflies》《Pretty Please》《RUDE!》的 24 条既有 work/video/member 关系逐一核验并补图，每首 8 条。全站由 2097 增至 **2121 条绑定 / 348 作品 / 45 团**，628 个精确封面保持；缺图 **731 → 707**。原871条累计解决 **164**，尚余707；另43张既有低清、18项未知统计保持开放。Hearts2Hearts 在当前缺口表内仅余《Lemon Tang》STELLA一条，不能将本轮完成写成该团所有图片问题均已消失。

24 个完整原生 1920×1080 PNG，共 **45,098,917 bytes**。图片从公开官方 MV 拍摄视频原生解码，非发行方原始照片；不裁切文件、不放大、不生成、不修复面孔。显示采用3:4元数据裁切，最小有效宽540px；显示内没有新增黑白留边。保留原生视频灯光、柔和度及少量背景。各成员服装限该MV拍摄现场；官方视频本身含多个场景和造型，不宣称全部同一套服装。

原图固定 GitHub 提交：`9733e6bbddaa989e700090c08eea98ba2a009217`。运行时仅追加M批路径白名单，N批、其他日期、嵌套路径和未审核证据继续拒绝。

## 证据与纠错

- Butterflies：官方 `dFKIabiefsY`，34张旧研究帧SHA全部复现，并审查相邻帧。说明文字链接的是The Chase，不作为Butterflies版本证据；采用官方标题明确的Butterflies MV BH2ND及具名主体语境。
- Pretty Please：官方 `DuaAX0i3U40`、`qL69VSEeL5U`，前者59张旧帧SHA复现；后者本轮完整取得。共112研究帧逐张审查。
- RUDE!：官方 `UZ2Z1w7TRds`，90张旧帧SHA复现，另审32相邻帧；官方说明直接链接正式MV `F7sGJVUrkjQ`。

旧字幕检索存在“提及姓名不等于画面主体”的问题。例如Butterflies 81秒为IAN而非被提及的A-NA，484秒为YUHA而非STELLA；Pretty Please提及IAN/JUUN/CARMEN的部分镜头，实际姓名条分别是A-NA/JIWOO/YUHA；RUDE!提及IAN的907秒画面是YE-ON。已按画内明确姓名条、自我介绍或直接指向当前动作的官方人工字幕纠正，未按脸、发色、服装猜身份。

主任务复核了三首歌的实际3:4裁切、原生完整帧姓名证据及主体语境。**不声称逐帧独立比对正式MV成片**；采用等级是“官方具名MV拍摄视频原生帧”。Butterflies CARMEN帽子上沿、RUDE! YUHA头顶在原始自拍镜头中部分出框，五官和下巴完整；保留此来源限制，不伪造补边，不称完整头冠肖像。其他自然灯光/柔和度在逐条qualityNotes披露。

## 验证与边界

- 24条增量dry-run后一次apply；2097条旧绑定与628封面逐对象一致，作品成员关系、评分策略及稳定ID保持；最新871行表的707条开放tuple集合与主审计完全一致。
- 27项图片导入、精确视频绑定、无真人评分规则、不可变公开素材交付专项通过；TypeScript和正式Worker构建通过。不称全仓测试通过。
- 本地使用正式站**公开只读目录快照夹具**验证3作品×320/390/1440共9布局、72图片槽、24次原图打开/关闭；无横溢出、页面异常或控制台错误。新电脑无正式数据库，本地真实目录API未可用，不能把夹具检查称作真实数据库验证。
- 正式v190真实页面同样完成9布局、72图片槽、24次原图打开/关闭；24张远端原图完整HTTP/45,098,917 bytes/SHA全部通过，未发生重试。5463条旧交付清单记录的字节/SHA/交付方式保持；未重新HTTP下载全部旧图。
- 公开目录51团338成员614作品2845关系的全部投影字段/关系指纹发布前后相同；原生存储epoch6、原快照、done206保持。以上不代表逐项读取或写入私人备注。
- 线上控制台唯一错误为浏览器自动请求`/favicon.ico`返回404；定向复查确认无图片或页面资源失败。本轮未更改图标路由，此非阻断问题保留在`online-diagnostic.json`，不能宣称线上控制台零错误。
- Browser plugin not available，使用系统Chrome/Playwright；不是用户IAB会话。真实保存、全视频播放、原生浏览器缩放、新Figma未验。
- 完整Worker TAR 62,668,288 bytes / 1417文件，全部构建字节匹配；601素材本地随包，4886不可变公开原图同源按原字节交付；9受限副本及1同SHA别名不入发布包。DB/R2/MCP、迁移、owner保存鉴权和原public受众保持。

Windows换行转换造成SVG及3个固定声明文件字节与Git不一致，已仅在换行等价前提下恢复Git原字节，保护原图哈希；没有放宽哈希或权限校验。旧源码与新源码只保留M批相关5文件语义变更，源码工程的README和.gitignore保留原状态。

## 继续工作

当前清单：[M批HTML](reports/20261026-gap-m/ledger.html)、[JSON](reports/20261026-gap-m/ledger.json)、[CSV](reports/20261026-gap-m/ledger.csv)。L和更早清单均留作历史。下一轮不得重导A–M；优先从现有具名精确MV素材和具体未验来源继续，不把同专辑概念照或其他版本当替代。

仍开放：707缺图（来源无目标图292、身份待证89、像素不足77、版本问题70、研究待补56、非目标MV拍摄106、构图遮挡12、选定来源受阻5），43旧低清、18未知统计、133无原成员关系作品不推定全员。个人页统一排版继续等待用户下一步决定。51团已确认视觉与Apple Music公共主站保持，本轮没有重做设计，也未修改个人评分、备注或观看状态。

详细来源：`reports/20261026-gap-m/*-reviewed-delta.json`、各歌曲research文件与姓名/实际裁切联系表；验证：`integration-verification.json`、`local-browser.json`、`online-browser.json`、`online-originals.json`、`catalog-continuity.json`、`package-verification.json`、`source-sync.json`、`native-evidence.json`。
