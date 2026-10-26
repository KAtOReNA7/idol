# MV认人图与旧图质量接续（2026-10-26）

## 基线与范围

- 用户要求从 `codex/mv-cover-and-identity-batch` 最新远端接续，执行 `NEXT-COMPUTER-HANDOFF`；v11已确认并上线，继续合理批次补图、提质和核实统计，沿用已有指定站点发布授权。
- fetch 后冻结 `3d36849735767b374075e03779a35b61ba5b900e`，主审计 SHA256 `f43a12f2ba88348d25856ff9300bb5ddaa4324f5f27c2e72334a5a689b7b9c68`；开工基线为1906绑定、922缺图、47旧低清图、18未知统计。
- 正式工程 `apps/idol-site/`；本任务分支 `codex/mv-identity-quality-followup`。已核对最新AGENTS、STATUS、RESUME、设计要求、协作手册、首次执行和v11报告。旧逐团等待记录已被最新全团确认取代。
- 本机原 `E:/project/idol` 在旧izna分支有22个未提交文件；原位保留，并在仓库外另存tracked binary patch与5份untracked文件。独立托管worktree实施，无reset/clean/强推。
- 只改公开图片证据、原字节、公开运行投影、必要导入工具及报告。保护51团设计、Apple Music主站、所有稳定ID/成员关系、个人评分/备注/观看状态、访问与保存权限；个人页统一排版仍待用户决定。

## 环境和发布身份

- 代码、服务及浏览器在本机Windows。浏览器插件未提供，按前端验证技能使用既有Playwright；实际验证结果后补，不继承v11。
- Sites实时核对：项目 `appgprj_6add2704bc6c81918d3e0e2f13130422`、v11、current_user_role=owner，custom策略仅owner、0外部访客。只读站点 `https://idol-all-groups-review-oct25.wuke40758.chatgpt.site/`。
- 已按Sites技能恢复该项目源码，HEAD `c28c945987e22803b81ea266e6aaadf1ce972cb0`，hosting.json身份相符，工作树干净。Lu原图SHA符合交接值。原工程旧v186 hosting.json不得使用。
- 首次fetch停止流量超过5分钟；终止该停滞请求后，用HTTP/1.1和明确低速超时成功取到最新分支（1.57GiB）。原图/认证均未改。Sites恢复工具首次只回通用错误；加诊断的工具副本随后成功，未改站点代码或访问策略。

## 本批实施中

- D批：ifeye《r u ok?》3、ODD YOUTH《I Like You》4；官方具名MV拍摄现场，保留唯一现有版本消歧和非逐帧验证限制。
- E批：GENBLUE《ACT LIKE THAT》《BADASS》各6；官方具名MV拍摄现场，保留源未嵌YouTube ID限制。
- 旧图候选10张中只接受Jisun《WE GO》与《TOMBOY》小娟/Minnie/雨琦4张；其余Kaede/LOONA6张有柔糊或切脸问题，不按像素机械提升。
- 统计研究未得到合格新增证据，18未知继续保留null及原显示语义；不把旧时点、局部销量或空表变成当前事实。
- 原图、3:4显示、严格三元组、字节/SHA、单测/类型/构建、浏览器、发布与线上复验将在完成后逐项补充。

## 停止条件与接续

身份/精确版本无法确认、质量不足、输入缺失、远端分叉或权限拒绝时保留候选/未知并具体记录；不猜、不越权重试。当前主代理负责整合、验证、GitHub提交与同站发布；研究子任务已交付D/E材料，质量工具仍在实现。

## 接入与工程验证

19新增和4提质已apply，累计1925绑定/316作品/44团；缺图903、card_only43。6导入边界+9提质边界+8公开图片/评分规则专项，共23通过；运行投影check、npx tsc --noEmit及npm run build通过。构建保留既有大chunk/插件耗时提示。原快照、成员评分策略、统计源、全部app与lib源码无diff；生成tsbuildinfo恢复为冻结版本。当前为可共享WIP，浏览器与发布尚待完成。

## 发布上传超时后的恢复

首份259,681,549-byte静态输出已用Sites原生helper推送源2b95b94e并打包242,168,264 bytes；原生保存/私密部署调用在archive上传层300,003ms超时，没有版本/部署ID。随后get_site及list_site_versions确认最新仍v11，没有新保存版本。没有盲目重发同一包，也没有改权限或跳过本地打包。

为降低上传负担，build-all-review新增可选--portrait-budget-mib，默认230不变；本批选138。695份封面/索引/必要修复图143,354,239 bytes仍强制同站，不允许预算将它们移出。其余认人图按原有不可变GitHub地址交付，原字节不压缩。新静态输出163,153,529 bytes，724同站公开原图，735份全部同站原文件SHA/长度通过；588份从同站改为GitHub传输的原图正进行额外HTTP/SHA/解码验证。无效预算和低于必要封面/索引预算两种CLI实测拒绝。此为有具体包体变化的单次恢复尝试，不将上传超时根因推定为包体大小。

52路由CSS仅固定资源引用与行尾规范化后相同。公开payload哈希原先不同，经AST提取两份实际bundle深比证明只有52个catalog.loadedAt构建时间戳不同，其他值和关系完全相同；记录在catalog-preservation与preflight。
