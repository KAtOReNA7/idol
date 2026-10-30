"""Adopt one exact X video only after fresh authentic owner preimage checks."""
import copy,datetime,hashlib,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site'
RID='recvxIZRWKy9zg'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 export=Path(sys.argv[1]).resolve();assert not export.is_relative_to(ROOT),'Private export must stay outside the repository'
 fresh=load(export);assert (fresh['source'],fresh['formatVersion'])==('native','idol.native-data-export.v1')
 age=(datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(fresh['capturedAt'].replace('Z','+00:00'))).total_seconds()
 assert -60<=age<900,'Refresh authentic owner export; never change its time'
 vp,sp=APP/'data/stage-videos.json',APP/'data/stages/status.json'
 before,status=load(vp),load(sp)
 unpublished={}
 for name in ['password','stayc']:
  proof=load(HERE.parent/'20261029-pr47-v202-followup'/f'{name}-formal-adoption.json')
  assert before[proof['workId']]==proof['stageVideos']['afterRow'],'Reviewed unpublished source changed'
  unpublished[proof['workId']]=proof['stageVideos']['afterRow']
 assert len(before)==499 and {k:v for k,v in before.items() if k not in unpublished}==fresh['siteMetadata']['stageVideos'],'All published source preimages must match'
 assert RID not in before and RID not in fresh['siteMetadata']['stageVideos']
 assert any(f.get('field_id')=='fld641ausT' for f in fresh['tables']['works']['fields'])
 matches=[r for r in fresh['tables']['works']['records'] if r['recordId']==RID];assert len(matches)==1
 score=matches[0]['fields'].get('fld641ausT');assert score is None or isinstance(score,str) and not score.strip(),'0 is not empty'
 journal=fresh['journal'];assert len(journal)>=206 and all(r.get('id') and r.get('record_id') and r.get('table_key') and r.get('status') for r in journal),'Complete real native save journal required'
 assert len({r['id'] for r in journal})==len(journal) and not any(r['record_id']==RID for r in journal)
 hashes={'stageVideos':sha(vp),'stageStatuses':sha(sp)}
 result=subprocess.run([sys.executable,str(APP/'scripts/merge-stage-batch.py'),str(HERE/'qwer-showdown-x-formal-20261029.json'),str(export)],capture_output=True,encoding='utf-8',check=True)
 merged=json.loads(result.stdout);assert merged['newSources']==1 and merged['sourceIds']==[RID] and not merged['retainedExistingSources']
 videos,afterstatus=load(vp),load(sp)
 assert len(videos)==500 and {k:v for k,v in videos.items() if k!=RID}==before
 assert {k:v for k,v in afterstatus['works'].items() if k!=RID}=={k:v for k,v in status['works'].items() if k!=RID}
 assert videos[RID]['scoreBinding']['sourceKey']=='x:2090845225845747983:video:1'
 receipt={'checkedDate':'2026-10-29','workId':RID,'mergeResult':merged,'privateWrites':0,'deployments':0,
  'ownerPreimage':{'capturedAt':fresh['capturedAt'],'usedAgeSeconds':age,'sha256':sha(export),'bytes':export.stat().st_size,'journalRows':len(journal),'targetSaveRows':0,'targetStageScoreEmpty':True,'all497PublishedSourcesMatchLocal':True,'twoReviewedUnpublishedSourcesPreserved':True,'storedOutsideRepository':True},
  'stageVideos':{'path':'apps/idol-site/data/stage-videos.json','beforeFileSha256':hashes['stageVideos'],'afterFileSha256':sha(vp),'beforeRow':None,'afterRow':videos[RID],'beforeCount':499,'afterCount':500},
  'stageStatuses':{'path':'apps/idol-site/data/stages/status.json','beforeFileSha256':hashes['stageStatuses'],'afterFileSha256':sha(sp),'beforeRow':status['works'][RID],'afterRow':afterstatus['works'][RID],'beforeUpdatedAt':status['updatedAt'],'afterUpdatedAt':afterstatus['updatedAt']}}
 write(HERE/'qwer-formal-adoption.json',receipt)
 print(json.dumps({'adopted':RID,'stageSources':500,'ownerAgeSeconds':age,'journalRows':len(journal),'privateWrites':0,'deployed':False}))
if __name__=='__main__':main()
