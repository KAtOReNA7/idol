"""Recompute open queues from the preserved v199 universe and current public data."""
import collections, datetime, json, pathlib
root=pathlib.Path(__file__).resolve().parents[4]
out=pathlib.Path(__file__).resolve().parent
def read(p):return json.loads((root/p).read_text(encoding='utf8'))
def write(name,obj):(out/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
prior=read('docs/codex/evidence/20261028-continuous/remaining-person-statistics.json')
credits=read('apps/idol-site/data/public-work-credits.json')
portraits=read('apps/idol-site/data/public-work-recognition.json')
absence=read('apps/idol-site/data/mv-member-appearance.json')
stats=read('apps/idol-site/data/group-statistics-completion-evidence.json')
ids={r['workId'] for r in credits['records']}
remaining=[r for r in prior['remainingPersonWorks'] if r['workId'] not in ids]
unknown=[]
for row in prior['unknownMetrics']:
    group,kind=row['key'].split('.')
    metric=next(x for x in stats['groups'][group]['social'] if x['platform']==kind) if kind in ['x','instagram','youtube'] else stats['groups'][group][kind]
    if metric['observedValue'] is None:unknown.append(row)
union=ids|{r['workId'] for r in absence['entries']}
assert len(ids)==91 and len(remaining)==35 and len(unknown)==10 and len(union)==96
summary={'publicCreditWorks':len(ids),'publicRecognitionSlots':sum(len(r['portraits']) for r in portraits['records']),'uniqueOriginals':len({p['src'] for r in portraits['records'] for p in r['portraits']}),'personEvidenceUnion':len(union),'remainingPersonWorks':len(remaining),'unknownMetrics':len(unknown),'unknownByMetric':dict(collections.Counter(r['key'].split('.')[1] for r in unknown)),'effectiveDateHolds':len(prior['effectiveDateHolds']),'selectedStages':493,'newStageGaps':112,'legacyStageReplacements':11,'existingRelationImageGaps':0,'oldLowResolutionGaps':0}
assert summary['publicRecognitionSlots']==488 and summary['uniqueOriginals']==229
write('remaining-person-statistics.json',{'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Open queues derived from v199 and the precisely reviewed v200 increment. Public reference coverage does not mean complete MV cast evidence.','previousQueue':'docs/codex/evidence/20261028-continuous/remaining-person-statistics.json','summary':summary,'remainingPersonWorks':remaining,'unknownMetrics':unknown,'effectiveDateHolds':prior['effectiveDateHolds'],'statisticalScope':prior['statisticalScope'],'independentSalesDifference':{'group':'triples','lowerBound':stats['groups']['triples']['sales']['observedValue'],'remainingDifference':stats['groups']['triples']['sales']['evidence']['sourceDifferenceReview']['remainingDifference']},'newAdoptedCanonicalDates':0,'privateRelationshipAction':'none','limits':['Remaining rows retain their v199 source observations; not all were freshly searched this round.','Current partial public credits are not exhaustive individual MV-appearance verification.','No private write, full-video playback or owner-export reuse.']})
stage=read('docs/codex/evidence/20261028-continuous/remaining-stage-ledger.json')
stage['previousQueue']='docs/codex/evidence/20261028-continuous/remaining-stage-ledger.json'
stage['latestResearch']='docs/codex/evidence/20261028-v200/stages/research.json'
stage['scope']='112新增缺口与11旧来源替换保持；本轮只对12作品/21精确查询补充有界研究，新增正式绑定0，不冒称全部重搜或完整播放。'
write('remaining-stage-ledger.json',stage)
print(json.dumps(summary,ensure_ascii=False))
