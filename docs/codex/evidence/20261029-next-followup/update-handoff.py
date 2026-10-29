"""Prepend the new state; keep every historical batch and frozen CSV intact."""
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
section='''## 最新续作：本地500舞台，正式仍v202（2026-10-29，未部署）

从PR47 `ec9efbc590673b8bbb98e6c98db303303a3b8aa0` 接续同一 `codex/group-evidence-followup-20261029`，远端仍draft/open/unmerged。GitHub交付单独见 `docs/codex/evidence/20261029-next-followup/github-delivery.json`；后续fetch最新PR47 HEAD，不从旧main接续，不reset/clean/强推或恢复旧stash。新增之前已保留本地57文件外部SHA备份；普通Git代理失败时以GitHub连接器精确Git对象快进交付，不冒称shell fetch成功。

QWER SHOW DOWN已用真实新鲜owner导出采用：`x:2090845225845747983:video:1`。用户确认完整日语原版、四人和唯一视频，不再问。使用时33.68秒、206条完整保存日志无目标、舞台空分、全部497线上来源相同及两条已审未发布来源保持；旧499对象不变，私人写入0。X精确视频序号已贯穿导入／外链／匿名投影／owner保存审计；整帖点赞不当单视频最高赞，不做X嵌入或区间。Password与STAYC既有采用不得重导；本轮备份到下一轮仍须检查15分钟有效期。

Password补独立原封面1024×576／41986bytes，29专项舞台封面；STAYC整期OG是AKB48，拒绝误绑，该区间和QWER专属舞台封面仍待补。WOOAH SUMMER增加五名具名发行概念照参考，复用旧同套原图并注明非本期照片，不证明完整录音／MV cast。现106资料作品／546槽，通用归档24、实际回退20作品／97槽；24完整人物事实保持待证，不新建私人关系。

tripleS两条独立Circle Album周数合2396，下界2113229／未解释差345560／13周；原36月行、2年替换、11旧周和2026-06截止保持，不加Total_CNT或Cosmo重叠。四未知销量新路线无合格值，7未知统计继续null。当前105新增舞台＋11旧替换、24人物、7统计、7实际日期、1差额＝155分类项，不能当独立缺歌数；照片原2项已解决。当前overlay为 `docs/codex/evidence/20261029-next-followup/remaining-stage-ledger.json`，原CSV／历史不改。

160专项／21文件、类型／构建、UDTT精确guard及carrier审计通过，7原件与构建字节一致；历史测试按完整采用回执还原，旧全文SHA不放宽。未新做全站浏览器目视、完整播放或真实保存；旧IAB超时不转用日常Chrome。正式只读核仍v202／497源／public／revision2／1owner／0外部／0组，本轮Sites保存和部署0。51团设计、Apple Music主站、原图、ID／关系、私人字段／owner鉴权保持，个人页统一排版待决定。继续有新证据的任务，不以小批次或推送作停工点；后续暂不自动部署。

报告 `docs/codex/next-evidence-followup-20261029.md`，证据 `docs/codex/evidence/20261029-next-followup/`；下方499／105资料／347956等均为历史，不覆盖本节。

'''
for name in ['AGENTS.md','docs/codex/NEXT-COMPUTER-HANDOFF.md','docs/codex/STATUS.md','docs/codex/RESUME.md']:
 p=ROOT/name;text=p.read_text(encoding='utf-8');assert section[:40] not in text,'Do not repeat handoff insertion'
 head,rest=text.split('\n',1)
 if name=='docs/codex/STATUS.md':head='# 状态：正式v202；PR47本地500舞台未部署'
 if name=='docs/codex/RESUME.md':head='# 接续：正式v202与舞台／人物／统计缺口'
 p.write_text(head+'\n\n'+section+rest.lstrip('\n'),encoding='utf-8',newline='\n')
prompt='''请接续 https://github.com/KAtOReNA7/idol 的最新PR47。

先检查并保护本地未提交与未跟踪文件，未克隆则克隆。禁止reset、clean、强推、覆盖本地修改或自动恢复旧stash。
显式fetch origin/main及codex/group-evidence-followup-20261029，核PR44—47；最新接续基线为PR47，不从旧main或PR44/45接续。另核codex/statistics-relations-followup-20261027、codex/stage-person-followup-v199-20261028、codex/human-help-handoff-sync-20261029，确保PR46／dada774及PR47全部成果都在。普通Git网络失败时记录失败，可用GitHub Git对象API普通快进，树SHA／父提交／预期远端HEAD和读回必须核实；不要伪称fetch成功。

先读docs/codex/NEXT-COMPUTER-HANDOFF.md、AGENTS.md、docs/design-requirements.md、docs/collaboration-playbook.md、docs/codex/STATUS.md、docs/codex/RESUME.md，再读docs/codex/next-evidence-followup-20261029.md及evidence/20261029-next-followup/validation.json、github-delivery.json、remaining-stage-ledger.json。

正式工程apps/idol-site/。正式站https://idol-lens-private.wuke40758.chatgpt.site/仍v202／497舞台；PR47本地／远端新成果为500舞台、29专项舞台封面、106资料作品546槽。最新实际GitHub交付看github-delivery回执和远端HEAD，不能把未提交状态称为已推送。后续暂不自动保存Sites版本或部署。

Password BV1bhU8BWEso/CID34265369310/P1，STAYC日版Teddy Bear BV1bo4y1x7LV/CID1115512650/P1@1085-1273，以及QWER SHOW DOWN x:2090845225845747983:video:1均已用各自新鲜owner导出保护采用，不重问、不重导。QWER用户确认全曲日语原版、四人、帖子只有一支视频。X仅外链，Bili区间仅手动定位／停止，不冒称自动裁切；source key必须含精确媒体范围。

当前105新增舞台／11旧替换、24完整人物事实、7未知统计、7实际日期、tripleS345560差额，原161分类项剩155，不等于独立缺歌数。tripleS已核下界2113229、13周、截至2026-06；原行不重加。WOOAH SUMMER五名仅具名发行照参考；HITGS Gulliver四人有限资料不推全员cast。通用归档24、实际回退20作品97槽。Password原封面已补；STAYC整期封面是AKB48已拒绝，QWER也未取得专属海报，不借错图。

按团继续有新证据的缺口。YouTube／B站／X、转载及民间来源均可，核同曲、语种／编配、完整首尾和参与范围。电视音乐节目优先，练习室其次且同条件固定机位优先，再考虑制作表演；演唱会／活动／节选／个人focus不能替代全团范围。成员版后备只放宽客串差异。跨平台／整帖／整BV赞不可当单视频排名。新评分来源须当时15分钟内真实完整owner备份，空分不含0、完整日志无目标、线上原对象核对；私人原始导出只留本机。

保护51团设计、Apple Music主站、全部原图、稳定ID／关系、个人评分／备注／观看、访问和owner鉴权。原CSV和冻结事实不改；个人页统一排版待用户决定。A–Y/Z和其他已导批次禁止重复。LOONA模糊视频、ifeye无署名、BEEP无法确认精确首尾的反馈保持，不重复问同一问题。

160专项／21文件、类型、正式构建、UDTT guard与carrier、7原件构建字节通过；没有新全站浏览器目视／全片音轨／真实保存验收。先简短核对远端和线上，再实际开发；GitHub与部署分别留证，不以推送或小批次为停工点，直到确实需要新人工证据。
'''
(ROOT/'docs/codex/RESUME-PROMPT-20261029.txt').write_text(prompt,encoding='utf-8',newline='\n')
