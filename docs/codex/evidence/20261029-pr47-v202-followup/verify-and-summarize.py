"""Reconcile the exact new evidence with frozen queues; never rewrites the CSV."""
import collections,datetime,hashlib,json,subprocess
from pathlib import Path
from PIL import Image
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site'
BASE='14dfedbdd07f4ac511490d706afd385379be6a0d'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def git(*args):return subprocess.run(['git',*args],cwd=ROOT,capture_output=True,check=True).stdout
def main():
 oldqueuepath=ROOT/'docs/codex/evidence/20261029-heygabby-complete/remaining-stage-ledger.json'
 queue=load(oldqueuepath)
 removed={'rec28ldfRTrOnV','recvxyH5pzoMAf'}
 assert removed <= {r['workId'] for r in queue['records']}
 records=[{k:r.get(k) for k in ['workId','artist','song','queue','category']} | {'previousRecordIndex':i} for i,r in enumerate(queue['records']) if r['workId'] not in removed]
 for r in records:
  if r['workId']=='recvxyOz5XueI9':r.update(latestUserObservation='INV0y_Cig7M too blurry to identify participants; do not repeat the same face-identification request.',nextAction='Seek clearer footage or independent named participant evidence.')
 counts=collections.Counter(r['queue'] for r in records)
 assert counts['new_gap']==106 and len(records)==106
 replacements=queue['legacyReplacementsRemaining'];assert len(replacements)==11
 write(HERE/'remaining-stage-ledger.json',{'schemaVersion':1,'checkedDate':'2026-10-29',
   'scope':'Current local/PR47 queue; formal production remains v202 / 497 sources until explicit publication.',
   'previousQueue':oldqueuepath.relative_to(ROOT).as_posix(),'previousQueueSha256':sha(oldqueuepath),
   'policyOverride':'Official, third-party and repost sources allowed. Music program then practice (fixed camera preferred) then produced performance. Version, complete song, performer scope and fresh owner guards remain required; do not reapply historical official-upload-only wording.',
   'records':records,'legacyReplacementsRemaining':replacements,'adoptedThisPass':sorted(removed),'remaining':106,'legacyReplacementQueue':11,'selectedSourcesLocal':499,'selectedSourcesPublished':497,
   'sourceDetailRule':'Use previousRecordIndex in the immutable previousQueue for original reason/evidence; this overlay does not overwrite historical facts.'})
 photos=load(HERE/'madein-photo-adoption.json')
 assets=[]
 for a in photos['assets']:
  p=APP/'public'/a['path'].lstrip('/');built=APP/'dist/client'/a['path'].lstrip('/')
  assert sha(p)==a['sha256'] and p.stat().st_size==a['bytes']
  with Image.open(p) as im:assert im.size==(683,1024);im.verify()
  assert built.exists() and built.read_bytes()==p.read_bytes()
  assets.append({'path':a['path'],'bytes':a['bytes'],'sha256':a['sha256'],'dimensions':[683,1024],'buildExactBytes':True})
 for p in photos['expectedBefore']['portraits']:assert sha(APP/'public'/p['src'].lstrip('/'))==p['sha256']
 credits=load(APP/'data/public-work-credits.json');portraits=load(APP/'data/public-work-recognition.json');generic=load(APP/'data/public-group-recognition.json')
 assert len(credits['records'])==len(portraits['records'])==105
 assert sum(len(r['portraits']) for r in portraits['records'])==541
 protected=['docs/codex/human-help-by-group-20261029.csv','docs/codex/human-help-by-group-20261029.md','apps/idol-site/data/production-asset-delivery.json','apps/idol-site/data/mv-public-media.json','apps/idol-site/data/stage-selection-posters-20261027.json','apps/idol-site/.openai/hosting.json','apps/idol-site/data/stages/inventory.json','apps/idol-site/data/stages/selection-policy-baseline-20261028.json']
 for p in protected:assert (ROOT/p).read_bytes()==git('show',BASE+':'+p),p
 lines=(HERE/'targeted-tests.log').read_text(encoding='utf-8');assert 'tests 100' in lines and 'pass 100' in lines and 'fail 0' in lines
 summary={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline':BASE,
   'local':{'stageSources':499,'legacySourcesUnchanged':497,'publicCreditWorks':105,'recognitionSlots':541,'activeGenericWorks':21,'activeGenericSlots':102,'newImageOriginals':6,'newStagePosters':0,'existingStagePosters':28},
   'remaining':{'newStages':106,'oldSourceReplacements':11,'completePersonFactItems':24,'unknownStatistics':7,'effectiveDates':7,'salesDifference':347956,'salesDifferenceItems':1,'photoCollectionItems':0,'classifiedItemsFromOriginal161':156},
   'partiallyImprovedFact':'HITGS Gulliver four named recording accounts and two named filming subjects; VV/complete cast unresolved, so the person item stays open.',
   'resolved':{'stageWorkIds':sorted(removed),'photoItems':['HITGS same-collection evidence','MADEIN higher-resolution named six-photo press collection; same four PUNG release subjects displayed']},
   'validation':{'targetedTests':100,'targetedTestFiles':14,'passed':100,'failed':0,'typescript':'passed --noEmit --incremental false','build':'passed','newOriginals':assets,'protectedFileHashes':{p:sha(ROOT/p) for p in protected},
       'historicalTestRepair':'Existing v202 heading caused the legacy checklist SHA failure. Exact recorded insertion is reversed, current and original full-file hashes both checked; expected old SHA unchanged.',
       'browser':'IAB reconnection timed out twice; no fresh visual interaction/full playback verification claimed. Rendering/scope covered by actual component SSR tests.'},
   'publication':{'newSitesVersions':0,'deployments':0,'productionVersion':202,'publishedSources':497},'privateWrites':0,
   'limitations':['No independent stage-cover originals for the two new Bili sources; no wrong-part thumbnails fabricated.','MADEIN new originals are page-provided 683x1024, not claimed native camera maximum; original framing varies across members.','Bili clips are an external manual interval, not automatic cuts or timed jumps.','ifeye user found no requested credit in the behind; no role or absence fact inferred.']}
 write(HERE/'validation.json',summary)
 print(json.dumps({'stageSources':499,'remainingClassifiedItems':156,'testsPassed':100,'newOriginalBuildChecks':len(assets),'privateWrites':0}))
if __name__=='__main__':main()
