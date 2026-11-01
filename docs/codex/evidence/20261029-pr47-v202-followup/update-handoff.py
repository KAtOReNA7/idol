"""Add a current-state overlay without rewriting historical reports or human CSV."""
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
section='''## 最新续作：本地499舞台与105资料作品，正式仍v202（2026-10-29，未部署）

从PR47 `14dfedbdd07f4ac511490d706afd385379be6a0d` 接续同一 `codex/group-evidence-followup-20261029`；PR44—47核查仍draft/open/unmerged。后续须fetch最新PR47 HEAD，不从旧main接续，不reset/clean/强推、不恢复旧stash。普通Git网络连接失败，GitHub交付状态以本轮单独回执为准，不能把本地修改或API尝试当作推送完成。

本地已采用两个用户确认的电视节目来源：tripleS ∞! Password（BV1bhU8BWEso／CID34265369310／P1完整日英混合版、八人分队）和STAYC日版Teddy Bear（BV1bo4y1x7LV／CID1115512650／P1中18:05–21:13，整P24:29）。两次均用真实新鲜owner完整导出核空分、206日志无目标、全部497线上来源一致；私人写入0、旧497对象不变。不要重复确认或导入。B站区间身份现含首尾秒数；仅外链并明确需手动定位/停止，不声称自动裁切、自动跳转或现场真唱。新片源两张专属封面尚未取得，不造封面。

HITGS Gulliver新增4名自述录音人物、其中2名拍摄人物的有限公开资料，105作品／541槽；未推VV或完整MV cast，24项完整人物事实仍保留。同篇逐名采访补齐HITGS现有5图同套依据；MADEIN改用JJ具名同篇6张683×1024原页面写真，PUNG仍限原4名发行封套人物。旧原件与来源全部保留，不证明MV同期或出镜，不增私人关系。通用归档24作品，实际回退21作品／102槽。

当前剩106新增舞台＋11旧替换、24人物事实、7未知统计、7实际日期、tripleS差347956；原161分类项剩156（不能相加当独立缺歌数）。两项照片问题已解决；原人工CSV与冻结事实表保持，当前队列overlay为 `docs/codex/evidence/20261029-pr47-v202-followup/remaining-stage-ledger.json`。ifeye幕后用户未找到所需署名，继续待证，不重复当成新证据。

100项／14文件专项、类型及正式构建通过；旧人工清单SHA失败已定位为既有v202插入说明，测试严格还原该精确插入并同时核新旧全文SHA，未改旧期望。新6原件/构建输出原字节一致。浏览器连接超时，未做新全片/视觉/真实保存验收；51团设计、Apple Music主站、原图、ID/关系、个人字段与owner鉴权保持，个人页排版仍待决定。正式只读核仍v202／497源／public／revision2／1owner／0外部／0组；本轮Sites保存和部署均0。继续剩余有新证据的项目，不因本批或GitHub交付停止；后续暂不自动部署。

详细报告 `docs/codex/pr47-v202-followup-20261029.md`，证据和验证 `docs/codex/evidence/20261029-pr47-v202-followup/`，GitHub与正式发布分别留证。以下段落为历史。

'''
for name in ['AGENTS.md','docs/codex/NEXT-COMPUTER-HANDOFF.md','docs/codex/STATUS.md','docs/codex/RESUME.md']:
 p=ROOT/name;text=p.read_text(encoding='utf-8');assert '## 最新续作：本地499舞台与105资料作品' not in text
 at=text.index('\n\n')+2
 if name=='docs/codex/STATUS.md':text='# 状态：正式v202；PR47本地499舞台未部署'+text[text.index('\n'):];at=text.index('\n\n')+2
 p.write_text(text[:at]+section+text[at:],encoding='utf-8',newline='\n')
p=ROOT/'docs/codex/RESUME-PROMPT-20261029.txt'
text=p.read_text(encoding='utf-8');end=text.rfind('】');assert end>=0
addition='\n最新覆盖状态：PR47本地499舞台/105资料作品541槽，正式仍v202/497源，后续不自动部署。先读docs/codex/pr47-v202-followup-20261029.md和同名证据目录的validation.json、GitHub回执及remaining-stage-ledger.json。Password精确BV1bhU8BWEso/CID34265369310/P1和STAYC日版Teddy Bear精确BV1bo4y1x7LV/CID1115512650/P1@1085-1273已用新鲜owner保护核对采用，不重问、不重导。B站区间只外链手动定位，key包含范围，不自动裁切。HITGS同套已补证；MADEIN新6图/原4名PUNG封套参考提质，旧原件全保留；Gulliver只具名4人有限资料，不推VV/完整cast。当前106新增/11旧替换、24人物事实、7未知统计/7日期、差347956、原161分类剩156，照片项0。原CSV冻结不改。100专项通过，v202插入说明引起的历史SHA测试已严格复原修复。不要把旧108/160当当前本地队列；正式仍用v202发布回执。'
p.write_text(text[:end]+addition+text[end:],encoding='utf-8',newline='\n')
