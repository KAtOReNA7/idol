"""One new exact program interval, preserving both live sources and unpublished Password."""
import copy,datetime,hashlib,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
RID='recvxyH5pzoMAf'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 export=Path(sys.argv[1]);fresh=load(export)
 assert (fresh['source'],fresh['formatVersion'])==('native','idol.native-data-export.v1')
 age=(datetime.datetime.now(datetime.timezone.utc)-datetime.datetime.fromisoformat(fresh['capturedAt'].replace('Z','+00:00'))).total_seconds()
 assert -60<=age<900,'Fresh owner export required; do not change capture time'
 vp,sp,up=APP/'data/stage-videos.json',APP/'data/stages/status.json',APP/'data/stages/supplements.json'
 before,status,supplements=load(vp),load(sp),load(up)
 password=load(HERE/'password-formal-adoption.json')
 assert len(before)==498 and before[password['workId']]==password['stageVideos']['afterRow']
 assert {k:v for k,v in before.items() if k!=password['workId']}==fresh['siteMetadata']['stageVideos']
 assert RID not in before and RID not in fresh['siteMetadata']['stageVideos']
 target=next(r for r in fresh['tables']['works']['records'] if r['recordId']==RID)
 score=target['fields'].get('fld641ausT');assert score is None or isinstance(score,str) and not score.strip()
 assert len(fresh['journal'])==206 and not any(r['record_id']==RID for r in fresh['journal'])
 hashes={'stageVideos':sha(vp),'stageStatuses':sha(sp)}
 batch=HERE/'stayc-teddy-bear-formal-20261029.json'
 result=subprocess.run([sys.executable,str(APP/'scripts/merge-stage-batch.py'),str(batch),str(export)],capture_output=True,encoding='utf-8',check=True)
 merged=json.loads(result.stdout);assert merged['newSources']==1 and merged['sourceIds']==[RID] and not merged['retainedExistingSources']
 videos,afterstatus=load(vp),load(sp)
 assert len(videos)==499 and {k:v for k,v in videos.items() if k!=RID}==before
 videos[RID]['verificationNote']=videos[RID]['verificationNote'].replace('采用前须核新鲜owner空分、完整日志与线上原绑定。','采用前已核新鲜owner舞台分为空、完整206条保存日志无目标、线上无旧绑定及全部497条线上既有来源一致。')
 write(vp,videos)
 oldnote=copy.deepcopy(supplements['works'][RID]['searchReview']);note=supplements['works'][RID]['searchReview']
 summary='东京电视台Premium MelodiX!节目档案与同期NanteJapan转载链接相符。已采用B站BV1bo4y1x7LV／CID1115512650／第1P中18:05–21:13完整日语原版区间，内容与第1P总长24:29由用户确认，精确媒体身份来自公开分享代码。代理未独立完整播放；B站仅外链，需手动定位并在21:13停止，评分仅对应该区间。'
 note['summary']=note['publicNote']['summary']=summary
 note['limitations']=['人工看片与公开分享代码确认；代理未独立完整播放或逐句比对。B站外链不自动裁切或跳转，18:05–21:13以外内容不属于评分范围。']
 for src in note['scope']+note['publicNote']['sources']:
  if 'BV1bo4y1x7LV' in src['url']:src.update(url=videos[RID]['url'],label='B站：日语原版节目转载（已核精确分P／18:05–21:13区间）')
 write(up,supplements)
 receipt={'checkedDate':'2026-10-29','workId':RID,'mergeResult':merged,'privateWrites':0,'deployment':'none',
  'ownerPreimage':{'capturedAt':fresh['capturedAt'],'usedAgeSeconds':age,'sha256':sha(export),'bytes':export.stat().st_size,'journalRows':206,'targetSaveRows':0,'targetStageScoreEmpty':True,'all497PublishedSourcesMatchLocal':True,'unpublishedPasswordPreserved':True,'storedOutsideRepository':True},
  'stageVideos':{'path':'apps/idol-site/data/stage-videos.json','beforeFileSha256':hashes['stageVideos'],'afterFileSha256':sha(vp),'beforeRow':None,'afterRow':videos[RID],'beforeCount':498,'afterCount':499},
  'stageStatuses':{'path':'apps/idol-site/data/stages/status.json','beforeFileSha256':hashes['stageStatuses'],'afterFileSha256':sha(sp),'beforeRow':status['works'][RID],'afterRow':afterstatus['works'][RID],'beforeUpdatedAt':status['updatedAt'],'afterUpdatedAt':afterstatus['updatedAt']},
  'supplementChange':{'workId':RID,'expectedBefore':oldnote,'after':copy.deepcopy(note),'afterFileSha256':sha(up)},
  'posterLimitation':'No independent stage-cover original retrieved; no fabricated or wrong-part poster.'}
 write(HERE/'stayc-formal-adoption.json',receipt)
 print(json.dumps({'adopted':RID,'localStageSources':499,'ownerAgeSeconds':age,'privateWrites':0,'deployed':False}))
if __name__=='__main__':main()
