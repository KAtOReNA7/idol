"""Freeze this pass's queue, validation and handoff without rewriting old ledgers."""
import collections,datetime,hashlib,json,re,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3];APP=ROOT/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
prior=HERE.parent/'20261029-pr47-v202-followup/remaining-stage-ledger.json';queue=load(prior)
assert sum(r['workId']=='recvxIZRWKy9zg' for r in queue['records'])==1
qwer=load(HERE/'qwer-formal-adoption.json')
queue['records']=[r for r in queue['records'] if r['workId']!=qwer['workId']]
queue.update(previousQueue=prior.relative_to(ROOT).as_posix(),previousQueueSha256=sha(prior),adoptedThisPass=[qwer['workId']],remaining=105,selectedSourcesLocal=500,
 scope='Current local/PR47 queue after exact X source adoption; production stays v202 / 497 sources. Historical records are not rewritten.')
assert sum(r['queue']=='new_gap' for r in queue['records'])==105
assert len(queue['legacyReplacements'])==11 if 'legacyReplacements' in queue else queue['legacyReplacementQueue']==11
write(HERE/'remaining-stage-ledger.json',queue)
stage=load(APP/'data/stage-videos.json');credits=load(APP/'data/public-work-credits.json');recognition=load(APP/'data/public-work-recognition.json')
assert len(stage)==500 and len(credits['records'])==106
slots=sum(len(r['portraits']) for r in recognition['records'])
assert slots==546
log=(HERE/'final-targeted-recheck.log').read_text(encoding='utf-8');assert re.search(r'\btests 160\b',log) and re.search(r'\bpass 160\b',log) and re.search(r'\bfail 0\b',log)
assert 'Build complete.' in (HERE/'build-after-adoption.log').read_text(encoding='utf-8')
assert not (HERE/'typescript-after-adoption.log').read_text(encoding='utf-8').strip()
assets=[]
for src in ['artist/stage-bilibili-20261029/BV1bhU8BWEso-cid-34265369310-p1.jpg']+[f'artist/madein-jj-20250314/{name}.jpg' for name in ['mashiro','miu','nagomi','serina','suhye','yeseo']]:
 p=APP/'public'/src;b=APP/'dist/client'/src;assert p.read_bytes()==b.read_bytes();assets.append({'path':'/'+src,'bytes':p.stat().st_size,'sha256':sha(p),'buildExactBytes':True})
protected=load(HERE.parent/'20261029-pr47-v202-followup/validation.json')['validation']['protectedFileHashes']
for file,digest in protected.items():assert sha(ROOT/file)==digest,file
validation={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline':'ec9efbc590673b8bbb98e6c98db303303a3b8aa0',
 'local':{'stageSources':500,'all499PreviousSourcesPreserved':True,'publicCreditWorks':106,'recognitionSlots':546,'activeGenericWorks':20,'activeGenericSlots':97,'stagePosters':29,'newStagePosterOriginals':1},
 'remaining':{'newStages':105,'oldSourceReplacements':11,'completePersonFactItems':24,'unknownStatistics':7,'effectiveDates':7,'salesDifference':345560,'salesDifferenceItems':1,'photoCollectionItems':0,'classifiedItemsFromOriginal161':155,'newStagePostersWithoutApprovedImage':['STAYC Teddy Bear Japanese interval','QWER SHOW DOWN X video1']},
 'validation':{'targetedTests':160,'targetedTestFiles':21,'passed':160,'failed':0,'typescript':'passed --noEmit --incremental false','build':'passed','udttRuntimeAndBuiltCarrierAudit':'passed; exact guard updated only for statistics','originals':assets,'protectedFileHashes':protected,
 'fixtureRepairs':['Freeze QWER complete reviewed preimages before restoring Password/STAYC/poster cohorts.','Use a distinct synthetic X post ID to avoid actual different-song duplicate-source rejection.','Current statistics rendering checks new reviewed value while old complete cohort hashes remain unchanged.'],
 'browser':'No new full-page visual/full-playback validation; prior IAB timeout retained. Actual player/reference/public-model SSR and synthetic native SQLite save checks passed; no real save was performed.'},
 'publication':{'newSitesVersions':0,'deployments':0,'productionVersion':202,'publishedSources':497},'privateWrites':0,
 'ownerProtection':qwer['ownerPreimage'],
 'limitations':['WOOAH five release-concept-photo subjects are not full recording or MV cast proof. Prior same-set photos reused and explicitly identified.','STAYC whole-program OG depicts AKB48 and was rejected; QWER no source-specific image obtained.','tripleS lower bound is covered Circle Album periods through 2026-06, not global lifetime sales. Seven unknown fields remain null.','User confirmed QWER contents; agent verified program archive and exact backlink but did not independently play X video.']}
write(HERE/'validation.json',validation)
print(json.dumps({'sources':len(stage),'credits':len(credits['records']),'slots':slots,'remainingNewStages':105,'tests':160,'deployments':0}))
