"""One-time reviewed closeout, based on PR47 b3202c2b. Not a recurring migration."""
import copy, hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
APP = ROOT / 'apps/idol-site'
OUT = Path(__file__).resolve().parent
def read(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p, obj): p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
def sha(b): return hashlib.sha256(b).hexdigest()

assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip() .startswith('b3202c2b')
previous = ROOT/'docs/codex/evidence/20261030-access-period-lower-bound'
people = read(previous/'remaining-person-statistics.json')
stages = read(previous/'remaining-stage-ledger.json')
sources = {
 'spia': ('https://music.apple.com/us/album/deeeep-single/1748742139', 'Deeeep release catalog confirms identity and release, no unit sales.'),
 'tracer': ('https://www.mk.co.kr/news/entertain/11140467', 'Gleamedia 365 debut report; no usable cumulative sales quantity.'),
 'witchx': ('https://musicbrainz.org/release/d8f66a16-43ab-4a2f-88e2-41884b85d71b', 'Digital release catalog search; Bugs body unavailable. No unit sales found.'),
 'vcha': ('https://thekrazemag.com/latest-updates/2024/3/19/vcha-releases-second-digital-single-album-only-one', 'Digital single release reporting, not physical sales; no cumulative quantity. GIRLSET not combined.'),
}
closure = {'checkedDate':'2026-11-01','authorization':'User: stop tripleS difference research; analyze dates/statistics once, use available scope, otherwise display 0 and close tasks; then old stage replacements and person facts. No deployment.',
 'tripleS':{'status':'retired-by-user','retainedVerifiedLowerBound':2118570,'asOf':'2026-06','legacyDifference':340219,'differenceResolved':False},
 'statistics':[], 'dates':[], 'previousResolvedMetrics':['genblue.wins','tracer.wins','vcha.wins'],
 'previousResolvedDates':['yuina-hiatus','aurora-first-hiatus-month','sena-predebut-exit','geenius-instrumental-QR','bewave-six-member-phase-end'],
 'limitations':'Bounded new catalog and sales-term searches, not exhaustive web coverage. Digital release existence never proves physical sales zero.'}
for row in people['unknownStatistics']:
 slug=row['group']; closure['statistics'].append({'group':slug,'metric':'sales','displayValue':0,'observedValue':None,'taskStatus':'closed-user-fallback','sourceUrl':sources[slug][0],'finding':sources[slug][1]})
for row in people['effectiveDateHolds']:
 event=row['event']; slug=row['slug']
 closure['dates'].append({'slug':slug,'eventId':event['id'],'eventDate':None,'displayValue':0,'taskStatus':'closed-user-fallback','recordDate':'2026-08-18' if slug=='atheart' else '2025-04-30','sourceUrl':'https://atheart.jp/contents/424319' if slug=='atheart' else 'https://17caratkpop.substack.com/p/feel-the-school-rush-with-udtt','finding':'Primary announcement gives publication date but no separate effective date.' if slug=='atheart' else 'Named self interview establishes participation by publication, not exact join date. May 8 Hellokpop corroborates participation but gives no join day.'})
write(OUT/'closure.json',closure)
people.update(checkedDate='2026-11-01',scope='23 complete person facts remain; four sales and two dates closed by user display-zero policy, not newly proven zero facts.',previousQueue=str((previous/'remaining-person-statistics.json').relative_to(ROOT)).replace('\\','/'),previousQueueSha256=sha((previous/'remaining-person-statistics.json').read_bytes()),unknownStatistics=[],unknownMetricCount=0,effectiveDateHolds=[],effectiveDateCount=0,nonStageTotal=23,resolvedThisPass={'policyClosures':6,'newFacts':0})
stages.update(checkedDate='2026-11-01',scope='112 active classifications after policy closeout; stage and complete-person facts unchanged.',previousQueue=str((previous/'remaining-stage-ledger.json').relative_to(ROOT)).replace('\\','/'),previousQueueSha256=sha((previous/'remaining-stage-ledger.json').read_bytes()),remainingPersonStatistics='docs/codex/evidence/20261101-closeout/remaining-person-statistics.json')
stages['classifiedRemaining'].update(unknownMetrics=0,effectiveDates=0,total=112)
write(OUT/'remaining-person-statistics.json',people);write(OUT/'remaining-stage-ledger.json',stages)

# Limited, named promotional appearance evidence; never a full MV cast claim.
generic=read(APP/'data/public-group-recognition.json')
work=next(r for r in generic['works'] if r['workId']=='recvxyHuKMBHQA')
group=next(r for r in generic['groups'] if r['groupId']==work['groupId'])
note='Dispatch逐名报道KARINA、GISELLE、WINTER、NINGNING出现在《Get Goin’》9秒宣传短片中。仅确认本项目宣传片出镜，不等同完整MV演员表，也未核实逐人录音。照片复用Rich Man同套认人参考，不是本MV同期造型；不生成成员评分关系。'
credit={k:work[k] for k in ['workId','videoId','groupId']}
credit.update(kind='named_promotional_appearance',memberIds=[p['memberId'] for p in group['portraits']],label='具名宣传片出镜参考',note=note,sourceUrl='https://www.dipe.co.kr/2284234',supportingUrls=['https://thekrazemag.com/latest-updates/2024/4/2/the-diverse-worlds-of-aespa-original-soundtracks'],checkedAt='2026-11-01',evidence='Dispatch March 8 names all four in the 9-second Apple TV promotional clip. The Kraze April 2 identifies the released song/MV context; not independent per-person full-MV evidence. No complete playback. Dork lyrics were user-sourced LRCLIB and not adopted as official vocal credits.')
recognition={k:work[k] for k in ['workId','videoId','groupId']}
recognition['portraits']=copy.deepcopy(group['portraits'])
for p in recognition['portraits']:
 p.update(label='Rich Man同套认人参考',note='仅作具名宣传片参与者认人参考；不是Get Goin’同期造型或MV截帧。',participationStatus='promotional_clip_only')
receipt={'checkedDate':'2026-11-01','collections':{},'addedCredit':credit,'addedRecognition':recognition,'fullPersonFactClosed':False,'newImageFiles':0,'newPrivateRelations':0,'newFormalStages':0,'privateWrites':0}
for filename,row in [('public-work-credits.json',credit),('public-work-recognition.json',recognition)]:
 p=APP/'data'/filename; before=p.read_bytes(); obj=read(p)
 assert len(obj['records'])==107 and not any(r['workId']==work['workId'] for r in obj['records'])
 obj['records'].append(row);write(p,obj)
 receipt['collections'][filename]={'beforeSha256':sha(before),'afterSha256':sha(p.read_bytes())}
receipt['protectedFiles']={p:sha((APP/p).read_bytes()) for p in ['data/snapshot.json','data/stage-videos.json','data/group-statistics-completion-evidence.json','data/timeline-reported-records.json','lib/idol/save.ts','lib/idol/native-save.ts']}
write(OUT/'public-adoption.json',receipt)

p=APP/'scripts/udtt-private-build-assets-manifest.json'; before=read(p); after=copy.deepcopy(before)
changed=[]
for relative in after['runtimeGuards']:
 if relative in ['lib/idol/timeline/reported-records.mjs','lib/idol/group-information.mjs']:
  b=(APP/relative).read_bytes();after['runtimeGuards'][relative]={'bytes':len(b),'sha256':sha(b)};changed.append(relative)
assert set(changed)=={'lib/idol/timeline/reported-records.mjs','lib/idol/group-information.mjs'}
write(p,after);write(OUT/'guard-adoption.json',{'before':before,'after':after,'changedPins':changed,'beforeSha256':sha((json.dumps(before,ensure_ascii=False,indent=2)+'\n').encode()),'afterSha256':sha(p.read_bytes())})
print('Closed 6 policy tasks; 112 remain; 108 public works / 557 portraits; stage sources unchanged.')
