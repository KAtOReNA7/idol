"""Apply exactly one reviewed Bilibili source using a fresh authentic owner export."""
import copy
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
APP = ROOT / 'apps/idol-site'
RID = 'rec28ldfRTrOnV'
def load(p): return json.loads(p.read_text(encoding='utf-8'))
def write(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    export = Path(sys.argv[1])
    fresh = load(export)
    now = datetime.datetime.now(datetime.timezone.utc)
    assert (fresh['source'],fresh['formatVersion']) == ('native','idol.native-data-export.v1')
    age = (now-datetime.datetime.fromisoformat(fresh['capturedAt'].replace('Z','+00:00'))).total_seconds()
    assert -60 <= age < 900
    vpath,spath = APP/'data/stage-videos.json',APP/'data/stages/status.json'
    videos,status = load(vpath),load(spath)
    assert RID not in videos and RID not in fresh['siteMetadata']['stageVideos']
    assert len(videos)==497 and videos == fresh['siteMetadata']['stageVideos'], 'All published source preimages must match'
    record = next(r for r in fresh['tables']['works']['records'] if r['recordId']==RID)
    score=record['fields'].get('fld641ausT')
    assert score is None or isinstance(score,str) and not score.strip(), '0 is not empty'
    assert any(f.get('field_id')=='fld641ausT' for f in fresh['tables']['works']['fields'])
    assert len(fresh['journal'])==206 and not any(r['record_id']==RID for r in fresh['journal'])
    assert all(r.get('record_id') and r.get('table_key') and r.get('status') for r in fresh['journal'])
    beforehash={'stageVideos':sha(vpath),'stageStatuses':sha(spath)}
    command=[sys.executable,str(APP/'scripts/merge-stage-batch.py'),str(HERE/'password-playlist-formal-20261029.json'),str(export)]
    result=subprocess.run(command,capture_output=True,encoding='utf-8',check=True)
    merged=json.loads(result.stdout)
    assert merged['newSources']==1 and merged['sourceIds']==[RID] and not merged['retainedExistingSources']
    after,afterstatus=load(vpath),load(spath)
    assert len(after)==498 and {k:v for k,v in after.items() if k!=RID}==videos
    assert after[RID]['scoreBinding']['sourceKey']=='bilibili:BV1bhU8BWEso:cid:34265369310:p:1'
    assert {k:v for k,v in afterstatus['works'].items() if k!=RID}=={k:v for k,v in status['works'].items() if k!=RID}
    receipt={'checkedDate':'2026-10-29','baseline':'14dfedbdd07f4ac511490d706afd385379be6a0d','workId':RID,
        'mergeResult':merged,'privateWrites':0,'deployment':'none',
        'ownerPreimage':{'format':fresh['formatVersion'],'capturedAt':fresh['capturedAt'],
            'usedAgeSeconds':age,'sha256':sha(export),'bytes':export.stat().st_size,
            'journalRows':len(fresh['journal']),'targetSaveRows':0,'targetStageScoreEmpty':True,
            'all497PublishedSourcesMatchLocal':True,'publishedTargetSourceAbsent':True,'storedOutsideRepository':True},
        'stageVideos':{'path':'apps/idol-site/data/stage-videos.json','beforeFileSha256':beforehash['stageVideos'],
            'afterFileSha256':sha(vpath),'beforeRow':None,'afterRow':after[RID],'beforeCount':497,'afterCount':498},
        'stageStatuses':{'path':'apps/idol-site/data/stages/status.json','beforeFileSha256':beforehash['stageStatuses'],
            'afterFileSha256':sha(spath),'beforeRow':status['works'][RID],'afterRow':afterstatus['works'][RID],
            'beforeUpdatedAt':status['updatedAt'],'afterUpdatedAt':afterstatus['updatedAt']}}
    write(HERE/'password-formal-adoption.json',receipt)
    print(json.dumps({'adopted':RID,'localStageSources':len(after),'ownerAgeSeconds':age,'journalRows':206,'privateWrites':0,'deployed':False}))
if __name__=='__main__':main()
