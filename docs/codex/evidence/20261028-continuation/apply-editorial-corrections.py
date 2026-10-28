"""Apply the reviewed editorial delta exactly once; no network or private writes."""
from pathlib import Path
import copy, datetime, hashlib, json

root = Path(__file__).resolve().parents[4]
app = root / 'apps/idol-site'
out = Path(__file__).resolve().parent
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def save(p, value): p.write_bytes((json.dumps(value, ensure_ascii=False, indent=2)+'\n').encode('utf-8'))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
data_path = app/'data/stages/supplements.json'
assert sha(data_path) == 'fe03fa889eaf5276bed755b594e27922bf8ce2147174d63ba58103773582265a', 'Baseline changed; review before applying'
d = read(data_path)
baseline = copy.deepcopy(d)
audit = read(root/'docs/codex/evidence/20261028-stage-policy/pending-audit.json')
rows = audit['runtimeCandidates'] + audit['outsidePendingRuntimeCandidates']
seen = set()
for r in rows:
    work = d['works'][r['workId']]
    items = [a for a in work.get('alternatives', [])+work.get('watchLeads', []) if a['sourceId']==r['videoId']]
    assert len(items)==1
    a=items[0]
    key=(r['workId'],a['id']); assert key not in seen; seen.add(key)
    # This is documentary occasion classification, never proof of matching audio.
    occasion = {'music_program':'music_program','excluded_event':'other_event'}.get(r['materialType'], 'unconfirmed')
    a['selection']={'occasion':occasion,'evidence':{'note':r['reason']+' 本次仅整理既有来源的场合分类，不代表全片或音轨已核验。','urls':[a['url']]}}
assert len(seen)==86

corrections=[]
def correction(work_id, source_id, edit):
    a=next(a for a in d['works'][work_id]['alternatives'] if a['sourceId']==source_id)
    before=copy.deepcopy(next(a for a in baseline['works'][work_id]['alternatives'] if a['sourceId']==source_id))
    edit(a)
    after=copy.deepcopy(a); after.pop('selection',None)
    corrections.append({'workId':work_id,'sourceId':source_id,'before':before,'after':after})

correction('recvxyHuKMh5bM','61314532',lambda a:a.update(sourceClass='press_original'))
official_lyrics='https://www.newjeans.jp/fanchant/b3d9fd3da85f'
def right_now(a):
    a['kind']='Music Bank 同曲舞台，具体音轨版本待确认'
    a['sameSongEvidence']={'note':'KBS精确视频和官方预录公告支持Right Now单曲及Music Bank节目身份；不能由Supernatural的报道推断本曲演唱语言。','urls':[a['url'],'https://weverse.io/newjeansofficial/notice/20906']}
    a['version']={'match':'unconfirmed','differences':['原发行包含英语、日语和韩语；本舞台实际音轨与原发行是否一致仍待核对。'],'evidence':{'note':'官方应援页支持原发行多语言歌词；节目标题和预录公告不能证明实际演唱音轨。撤回原来“两个舞台都韩文”的无依据归纳。','urls':[official_lyrics,a['url'],'https://weverse.io/newjeansofficial/notice/20906']}}
correction('recvxyOz5XHEju','7XhRd6cVIyI',right_now)
def supernatural(a):
    for ev in [a['sameSongEvidence'],a['version']['evidence']]:
        ev['note']='同期报道所指韩文版本为Supernatural；KBS精确视频及官方预录公告支持本曲节目身份。此证据不用于推断Right Now的演唱语言。'
correction('recvxyOz5XVlTp','ZmPJyC0eVM8',supernatural)

url='https://www.youtube.com/watch?v=y4Tr8LE5yV4'
official='https://weverse.io/newjeansofficial/media/3-172133538'
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
practice={'id':'youtube-y4Tr8LE5yV4','platform':'youtube','sourceId':'y4Tr8LE5yV4','sourceClass':'official','performerScope':'full_group','completeness':'full','url':url,'title':"NewJeans (뉴진스) 'Right Now' Dance Practice (Fix ver.)",'channel':'NewJeans','performanceType':'practice_room','kind':'官方固定机位练习室，完整性已由用户确认；实际音轨对应待核','checkedAt':now,'scorePolicy':'view_only','sourceEvidence':{'note':'官方Weverse媒体页直接链接该精确YouTube视频，标题明确Dance Practice (Fix ver.)。','urls':[official,url]},'sameSongEvidence':{'note':'官方媒体页明确NewJeans与Right Now；用户已确认此视频为完整表演，不再次要求完整性确认。','urls':[official,url]},'version':{'match':'unconfirmed','differences':['原发行包含英语、日语和韩语；练习室实际音轨尚未与原发行独立比对，不标作英语版或原版。'],'evidence':{'note':'官方练习室页无English Ver标识；官方应援页为多语言原曲。完整性确认不等于实际音轨一致。','urls':[official,official_lyrics]}},'selection':{'occasion':'practice_room','evidence':{'note':'艺人官方页明确标为固定机位练习室；练习室类型不代表现场人声。','urls':[official,url]}}}
d['works']['recvxyOz5XHEju']['alternatives'].append(practice)
d['updatedAt']=now
save(data_path,d)
notes_path=app/'data/ui/alternative-notes.json'
notes=read(notes_path)
notes['recvxyOz5XHEju']['youtube-7XhRd6cVIyI']='原曲包含英语、日语和韩语；这个打歌舞台的具体音轨版本尚待确认。'
notes['recvxyOz5XHEju']['youtube-y4Tr8LE5yV4']='官方固定机位练习室，完整表演已确认；具体音轨版本尚待核对。'
save(notes_path,notes)
save(out/'editorial-corrections.json',{'baselineUpdatedAt':baseline['updatedAt'],'baselineCommit':'4f2a57bd659db608c89dec173717f50f0dd2cc02','baselineSupplementSha256':'fe03fa889eaf5276bed755b594e27922bf8ce2147174d63ba58103773582265a','occasionClassifications':len(seen),'corrections':corrections,'newViewOnlyCandidate':practice,'formalBindingsAdded':0,'privateWrites':0})

proposal=read(out/'statistics/triples-sales-proposal.json')
stats_path=root/proposal['targetFile']; assert sha(stats_path)==proposal['expectedFileSha256']
stats=read(stats_path); assert stats['groups']['triples']['sales']==proposal['expectedBefore']
stats['groups']['triples']['sales']=proposal['proposedAfter']
save(stats_path,stats)
save(out/'statistics/applied.json',{'checkedAt':now,'proposal':'triples-sales-proposal.json','beforeSha256':proposal['expectedFileSha256'],'afterSha256':sha(stats_path),'previous':2087073,'current':2092239,'net':5166,'remainingDiscrepancy':366550,'originalMonthRowsPreserved':True})
print(json.dumps({'classified':len(seen),'corrections':len(corrections),'newViewOnly':1,'salesDelta':5166,'bindings':0}))
