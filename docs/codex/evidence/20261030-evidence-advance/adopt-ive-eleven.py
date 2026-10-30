"""Adopt one reviewed P1 only after an authentic, fresh complete owner export."""
import datetime,hashlib,json,pathlib,subprocess,sys
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[3]
APP=ROOT/'apps/idol-site'
RID='recvxyHuKM2Gwu'
def load(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 export=pathlib.Path(sys.argv[1]).resolve();assert not export.is_relative_to(ROOT),'Private export stays outside repository'
 fresh=load(export);assert (fresh.get('source'),fresh.get('formatVersion'))==('native','idol.native-data-export.v1')
 age=(datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(fresh['capturedAt'].replace('Z','+00:00'))).total_seconds();assert -60<=age<900,'Need a fresh real owner export; never relabel timestamps'
 vp,sp=APP/'data/stage-videos.json',APP/'data/stages/status.json';before,status=load(vp),load(sp)
 assert len(before)==500 and before==fresh['siteMetadata']['stageVideos'],'Every published original source must match'
 assert RID not in before and RID not in fresh['siteMetadata']['stageVideos']
 assert any(f.get('field_id')=='fld641ausT' for f in fresh['tables']['works']['fields'])
 matches=[r for r in fresh['tables']['works']['records'] if r['recordId']==RID];assert len(matches)==1
 value=matches[0]['fields'].get('fld641ausT');assert value is None or isinstance(value,str) and not value.strip(),'A zero score is not empty'
 rows=fresh['journal'];assert len(rows)>=206 and all(r.get('id') and r.get('record_id') and r.get('table_key') and r.get('status') for r in rows),'Need complete native journal'
 assert len({r['id'] for r in rows})==len(rows) and not any(r['record_id']==RID for r in rows),'Existing target saves require review; no automatic reassignment'
 prior={'videos':sha(vp),'statuses':sha(sp)}
 run=subprocess.run([sys.executable,str(APP/'scripts/merge-stage-batch.py'),str(HERE/'ive-eleven-formal-candidate-20261030.json'),str(export)],capture_output=True,encoding='utf-8',check=True)
 merged=json.loads(run.stdout);assert merged['newSources']==1 and merged['sourceIds']==[RID] and not merged['retainedExistingSources']
 after,astatus=load(vp),load(sp);assert len(after)==501 and {k:v for k,v in after.items() if k!=RID}==before
 assert {k:v for k,v in astatus['works'].items() if k!=RID}=={k:v for k,v in status['works'].items() if k!=RID}
 assert after[RID]['scoreBinding']['sourceKey']=='bilibili:BV19D4y1r7c6:cid:867429881:p:1'
 receipt={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'workId':RID,'adopted':True,'privateWrites':0,'deployments':0,'owner':{'capturedAt':fresh['capturedAt'],'ageSeconds':age,'bytes':export.stat().st_size,'sha256':sha(export),'completeJournalRows':len(rows),'targetJournalRows':0,'emptyStageScore':True,'all500SourcesMatch':True,'storedOutsideRepository':True},'stageVideos':{'path':'apps/idol-site/data/stage-videos.json','beforeFileSha256':prior['videos'],'afterFileSha256':sha(vp),'afterRow':after[RID]},'stageStatuses':{'path':'apps/idol-site/data/stages/status.json','beforeFileSha256':prior['statuses'],'afterFileSha256':sha(sp),'beforeRow':status['works'][RID],'afterRow':astatus['works'][RID],'beforeUpdatedAt':status['updatedAt'],'afterUpdatedAt':astatus['updatedAt']},'mergeResult':merged}
 (HERE/'ive-eleven-adoption.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 print(json.dumps({'adopted':RID,'localSources':501,'privateWrites':0,'deployments':0}))
if __name__=='__main__':main()
