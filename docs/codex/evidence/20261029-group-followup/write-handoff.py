"""Generate the task report and update continuation entries; never write human CSVs."""
import collections
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).parent
p=json.loads((OUT/'progress.json').read_text(encoding='utf-8'))
report='''# 逐团补缺与版本范围续作（2026-10-29，未部署）

用户已要求按团持续推进，并决定 ILLIT《It’s Me》另行整理完整歌曲版本。本轮从最新 main 创建 `codex/group-evidence-followup-20261029`，普通合入包含 PR45／PR44 的 PR46 `cef1765801ce62739c44308292a680b16e681597`，没有重新导入历史批次。正式站保持 v201；本轮代码、来源记录与交接保存在 GitHub 分支，不能当作已上线。

## 实际增量

- MADEIN《PUNG!》：CDJapan 的 CD／KiT 具名个人封套及当期发行报道支持 MASHIRO、MiU、SERINA、NAGOMI 四人发行参考。新增一个有限范围公开记录／四个既有原图槽，累计 103 作品／531 槽；原 102 作品／527 槽与顶层元数据完全保持。不声称逐人录音或目标 MV 出镜，不新增私人关系或评分。通用参考历史集合仍为 24 作品／119 槽，实际回退展示为 23 作品／113 槽。569×854 原图清晰度限制保留，没有放大图片。
- NMIXX《Hey Gabby!》：Bugs 把 2022-05-09 Dance Video 与原 MV 分列，Newsis 引述发行商的独立 Performance 发布。修正旧 searchReview 中仅凭标题含 MV／Performance 直接排除的过时结论，恢复为待核候选；没有填写完整性通过或新增正式舞台。原 MV 与加工重传的排除保留。页面新增默认折叠的“待核说明与来源”，仅公开本条审核摘要与三个链接；其余 136 条原始研究记录继续隐藏。来源目录不是全片播放证明。
- ILLIT《It’s Me》：完整原曲 `rec28ldfRTrKtW`（MV `bMhDJ0S0OBA`）及 Music Bank `00IPFnp2Tdg` 已存在；短 Performance `rec28ldfRTrKy2`（MV `el7A_SI7sxs`）有独立旧记录。复用既有关系，明确“完整歌曲版”与“约 60 秒短版表演”入口。用户的范围决定已记录，不再询问；两个记录的原舞台、评分与观看历史不互换，不新增重复作品。

## 逐团覆盖与仍待证范围

45 团、161 个分类键全部与冻结清单逐项对齐，遗漏／重复／额外条目均为 0。这是逐项队列复核与有界新来源研究；部分条目只复核旧证据限制，不称每一项都重新取得全文、完整视频或全网穷尽。161 项事实全部仍保留，其中 1 项得到有限范围补强，完整事实关闭为 0。三个应用改动不等于关闭三个舞台或人物缺口。

| 团体 | 分类项 | 本轮研究记录 |
| --- | ---: | --- |
'''
for group in sorted({r['group'] for r in p['records']},key=str.casefold):
 rows=[r for r in p['records'] if r['group']==group]
 files=sorted({r['researchFile'] for r in rows})
 links='、'.join(f'[{f}](evidence/20261029-group-followup/{f})' for f in files)
 report+=f'| {group} | {len(rows)} | {links} |\n'
report+='''
ADYA、BADVILLAIN、Billlie、Cherry Bullet、EVERGLOW、RESCENE 没有当前队列项，没有把它们算作新研究或新验收。

剩余集合仍为 109 新增舞台、11 旧来源替换、24 作品人物参与、7 未知统计、7 实际生效日期、tripleS 销量差额 350,635、2 照片限制；这些是不同分类，不能相加当独立歌曲数。未知统计仍 null，显示 0 不代表事实为零；tripleS 下界仍 2,108,154，不能重复加已计入的年度或周数据。

## 后续需要的具体证据

优先核查新线索：Hey Gabby 官方 Performance 的完整首尾／语种／音轨／本团表演；PURPLE KISS《DOREMI》英文录音幕后具名字幕；WOOAH《SUMMER》与 fromis_9《Touchdown》幕后具名证据；IVE Venue101 目录链接的官方完整可播性。KATSEYE《Gnarly》音轨差异、izna《BEEP》日版合集章节仍需精确时间点。不能把民间转载、搜索片段、发行全员简介或混音署名直接变成逐人出镜事实。

任何正式舞台新增或换绑前，都仍须取得新鲜 owner 目标原值、完整保存日志及线上旧绑定核对。此次只读工具的记录样本被截断，不足以通过该门槛；没有复用旧导出或发布私人原始值。0 分不是空分。当前可完成的公开参考与版本导航已推进，无法核实的事实保留开放，未以猜测补数。

人工 CSV 及原始模板、两份冻结队列均保持；后续人工答案先保护再核查，不能自动写入公开仓库。51 团设计、原图字节、稳定 ID 与私人关系、评分／备注／观看、访问和 owner 保存鉴权保持。个人页统一排版仍待另行决定。

## 验证与交付

专项测试、TypeScript、正式构建、本地公开夹具浏览器验证与 GitHub 回执见[工作记录](worklogs/20261029-group-evidence-followup.md)。MADEIN 桌面／手机原图和成员来回导航已留证于 [ui-madein.json](evidence/20261029-group-followup/ui-madein.json)；[ILLIT 与 Hey Gabby 本地验证](evidence/20261029-group-followup/ui-version-review.json)覆盖两流程各两尺寸，版本跳转、各自原舞台、折叠来源说明和无写入通过，不继承旧版本通过。

正式站只读核实 v201／active，public／1 owner／0 external／0 groups／revision2，未保存新 Sites 版本、未部署、未进行正式浏览器或真实 owner 保存验收。GitHub 提交和既有正式发布分别记录。连接恢复后的备份与远端核对见 [resumed-readback.json](evidence/20261029-group-followup/resumed-readback.json)。
'''
(ROOT/'docs/codex/group-evidence-followup-20261029.md').write_bytes(report.encode('utf-8'))

heading='## 当前续作：逐团证据与完整版本导航（2026-10-29，未部署）'
for relative in ['AGENTS.md','docs/codex/NEXT-COMPUTER-HANDOFF.md','docs/codex/STATUS.md','docs/codex/RESUME.md']:
 path=ROOT/relative
 text=path.read_text(encoding='utf-8')
 if heading in text: continue
 prefix='docs/codex/' if relative=='AGENTS.md' else ''
 block=f'''\n{heading}

用户已要求按团继续，并决定 ILLIT《It’s Me》另行整理完整歌曲版。当前任务分支 `codex/group-evidence-followup-20261029`，基线为已含 `dada774`／PR45／PR44 的 PR46 `cef176580`；接续须显式 fetch 此分支并核最新 PR，不能只接旧 main 或 PR45 而漏掉 PR46 的人工填写保护。恢复后核 PR44／45／46 仍 draft/open/unmerged。旧 stash 不自动应用。

本轮新增 MADEIN《PUNG!》四人具名发行封套参考（103 作品／531 槽；不称 MV 出镜／逐人录音），修正 Hey Gabby 官方 Performance 的过时排除说明，并明确 ILLIT 已有短版／完整原曲的双向导航；不重复创建完整作品或导入已有 Music Bank 舞台，不转移评分。45 团 161 分类项已对齐，仍全部保留事实待证，其中 1 项有限补强，0 完整事实关闭；原 CSV／冻结队列不覆盖。用户已回答 ILLIT 范围问题，不再重复询问。

正式站只读核实仍 v201，访问配置保持；本轮没有保存新版本或部署。新代码与 GitHub 同步不等于上线。51 团设计／原图／ID／私人关系与记录／owner 鉴权保持，个人页统一排版仍待决定。当前事项以[本轮报告]({prefix}group-evidence-followup-20261029.md)及[工作记录]({prefix}worklogs/20261029-group-evidence-followup.md)为准；以下旧章节保留历史状态，不能覆盖此节。\n'''
 first,sep,rest=text.partition('\n')
 path.write_bytes((first+'\n'+block+'\n'+rest).encode('utf-8'))

prompt='''请接续 https://github.com/KAtOReNA7/idol 。

先保护本地未提交和未跟踪文件；未克隆则先克隆。不要 reset、clean、强推或自动恢复旧 stash。显式 fetch origin/main、codex/statistics-relations-followup-20261027、codex/stage-person-followup-v199-20261028、codex/human-help-handoff-sync-20261029、codex/group-evidence-followup-20261029，核 PR44／45／46 及逐团续作分支的最新 PR。分支已删除时查合并记录和 main 完整性，不能用旧本地 ref 顶替。

干净后从最新 origin/main 建新的 codex/任务分支；若尚未包含当前逐团续作成果，比较后普通 merge 最新 codex/group-evidence-followup-20261029（已含 PR46、PR45 dada774、PR44）。不能遗漏人工清单保护和本轮应用增量，不重复导入已完成批次。

依次读 docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/codex/STATUS.md、docs/codex/RESUME.md、docs/codex/group-evidence-followup-20261029.md、对应 worklog，再读 human-help-by-group-20261029.md／CSV 和现行舞台／选图政策。旧模板中的 ILLIT 问题已有用户回答，以当前续作报告为准。

正式工程 apps/idol-site/；正式站 https://idol-lens-private.wuke40758.chatgpt.site/ 仍 v201。本轮后续代码未部署；不要重复部署或把 GitHub 推送当上线。用户希望按每团持续推进，优先核人工新补充，其次有新证据的项目，无可靠新证据的保留。

已完成应用增量：MADEIN PUNG! 四人具名发行封套参考（103作品531槽，精确MV／录音仍待证）；Hey Gabby Performance 改回待核候选，不再仅凭MV标题排除；ILLIT短60秒Performance与已有完整歌曲版明确关联。用户已决定另行整理完整歌曲版，复用 rec28ldfRTrKtW／bMhDJ0S0OBA 及已有00IPFnp2Tdg舞台，不重复建立作品、不替换短版rec28ldfRTrKy2的旧舞台或转移评分。

45团161分类项全部仍保留（其中1项有限补强，0完整事实关闭），6团无当前队列不代表新验收。109新舞台、11旧替换、24人物、7未知统计、7日期、tripleS差350635、2照片限制继续逐项记证。人工CSV三栏此前为空；生成器遇人工填写或结构异常须写入前停止，不清空答案，不自动公开新人工数据。

保护51团设计、Apple Music主站、完整原图、稳定ID和关系、个人评分／备注／观看、访问权限与owner鉴权。个人页统一排版仍待决定。正式舞台新增或换绑须新鲜owner目标数据、完整保存日志与线上旧绑定核对；本次截断样本未通过，不能复用过期导出或把0分视为空。

先简短核远端与线上状态，再实际开发；GitHub提交、测试／浏览器验证、正式部署分别记录。完成或换机前提交并普通push合规结果及worklog。
'''
(ROOT/'docs/codex/RESUME-PROMPT-20261029.txt').write_bytes(prompt.encode('utf-8'))
next_path=ROOT/'docs/codex/NEXT-COMPUTER-HANDOFF.md'
next_text=next_path.read_text(encoding='utf-8')
marker='## 可复制到另一台电脑的指令'
assert marker in next_text
next_path.write_bytes((next_text.split(marker)[0]+marker+'\n\n使用[最新独立续接指令](RESUME-PROMPT-20261029.txt)。本轮须包含逐团续作分支，旧 PR45／PR46 单独均不含全部新应用改动。\n').encode('utf-8'))
print('Wrote report, four latest continuation entries, and standalone prompt; human inputs and frozen queues untouched.')
