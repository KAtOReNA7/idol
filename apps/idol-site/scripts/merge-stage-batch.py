"""Merge a reviewed public evidence batch. No network, Feishu write, or publication.
Usage: python3 scripts/merge-stage-batch.py EVIDENCE_JSON FRESH_PRIVATE_EXPORT_JSON
Existing selected video bindings are immutable; failures never erase sources.
"""
import json,sys,datetime,pathlib,re,hashlib
root=pathlib.Path(__file__).resolve().parent.parent
now=datetime.datetime.now(datetime.timezone.utc)
def dt(v):return datetime.datetime.fromisoformat(v.replace('Z','+00:00'))
def source_key(s):
 c=s.get('clip');return s['videoId']+(f"@{c['startSeconds']}-{c['endSeconds']}" if c else '')
def load(p):return json.loads(pathlib.Path(p).read_text())
def public(v):
 if isinstance(v,dict):return {k:public(x) for k,x in v.items() if k!='evidenceFile'}
 if isinstance(v,list):return [public(x) for x in v]
 return v
batch=load(sys.argv[1]);fresh=load(sys.argv[2]);assert batch['formatVersion']=='idol.stage-evidence.v1'
assert fresh['source']=='feishu' and fresh['formatVersion']=='idol.live-backup.v1'
assert -60<=(now-dt(fresh['capturedAt'])).total_seconds()<900,'Refresh authenticated score preimage before binding sources'
freshworks={w['recordId']:w for w in fresh['tables']['works']['records']}
inv={w['recordId']:w for w in load(root/'data/stages/inventory.json')['works']}
status=load(root/'data/stages/status.json');videos=load(root/'data/stage-videos.json')
allowed={'pending','verified','likes_unverified','not_found','version_mismatch','blocked','missing_song_identity'}
journal=load(sys.argv[3]) if len(sys.argv)>3 else None
if journal:assert journal.get('complete') and -60<=(now-dt(journal['capturedAt'])).total_seconds()<300,'Fresh complete save journal required for source replacements'
seen=set();added=[];held=[];changed=[];replaced=[];metadata_updated=[];retired_unpublished=[]
for item in batch['items']:
 rid=item['recordId'];assert rid in inv and rid in freshworks and rid not in seen, f'Unknown/duplicate/missing live record {rid}'
 seen.add(rid);state='missing_song_identity' if item['status']=='insufficient_metadata' else item['status'];assert state in allowed,f'Unrecognized status {state}'
 previous=videos.get(rid)
 if previous and state!='verified' and rid not in fresh.get('siteMetadata',{}).get('stageVideos',{}):
  del videos[rid];previous=None;retired_unpublished.append(rid)
 if rid=='rec28ldfRTrArg' or (previous and (state!='verified' or not item.get('selected'))):
  held.append({'recordId':rid,'reason':'Existing fixed source retained; new evidence archived only.'});continue
 assert isinstance(item['reason'],str) and item['reason'].strip()
 observation=item.get('checkedAt') or batch.get('checkedAt');assert observation and dt(observation)<=now+datetime.timedelta(minutes=5)
 if state!='verified':
  if state not in ['pending','missing_song_identity']:assert item.get('searchEvidence'),f'Researched status needs public search evidence {rid}'
  status['works'][rid]={'status':state,'reason':item['reason'],'checkedAt':observation};changed.append(rid);continue
 s=item.get('selected');assert s and s['videoId']==item.get('selectedVideoId'),f'Selection absent {rid}'
 assert s.get('sourceClass')=='official' and s.get('platform')=='youtube' and s.get('completeness')=='full' and s.get('scorePolicy')!='view_only',f'Formal source must be explicit official YouTube full performance, never view-only {rid}'
 candidates=[c for c in item['candidates'] if c.get('eligibility') in ['eligible','qualified'] and c.get('likes',{}).get('precision')=='exact']
 exact=[c for c in candidates if c['videoId']==s['videoId']];assert len(exact)==1,f'Selection not verified/comparable {rid}'
 picked=exact[0];clip=s.get('clip')
 if clip:
  a,b,total=clip.get('startSeconds'),clip.get('endSeconds'),clip.get('sourceDurationSeconds');ev=clip.get('evidence',{})
  assert isinstance(a,int) and not isinstance(a,bool) and isinstance(b,int) and not isinstance(b,bool) and isinstance(total,int) and not isinstance(total,bool) and 0<=a<b<=total<=86400,f'Invalid clip bounds {rid}'
  assert ev.get('note') and ev.get('urls') and all(u.startswith('https://') for u in ev['urls']) and s.get('likesScope')=='whole_video',f'Clip needs full boundary evidence and whole-video like label {rid}'
 assert picked.get('versionMatch') is True and s.get('languageVersionEvidence'),f'Exact version evidence missing {rid}'
 reuse=s['videoId']==inv[rid]['mv']['videoId']
 if reuse:
  assert s.get('reusesExistingVideo') is True and re.search(r'performance|special stage|live clip|showcase',inv[rid]['mv']['officialTitle'] or '',re.I) and not re.search(r'official (?:music video|mv)|dance practice',inv[rid]['mv']['officialTitle'] or '',re.I),f'Original MV cannot be relabelled stage without explicit performance evidence {rid}'
 assert s.get('likesPrecision')=='exact' and isinstance(s.get('likes'),int) and s['likes']>=0,f'Exact likes missing {rid}'
 assert s['likes']==picked['likes']['value'] and (clip or all(s['likes']>=c['likes']['value'] for c in candidates)),f'Selected likes not highest in comparable candidates {rid}'
 assert re.fullmatch(r'[A-Za-z0-9_-]{11}',s['videoId'])
 assert not re.search(r'DANCE\s+PRACTICE|CHOREOGRAPHY\s+PRACTICE|RELAY\s+DANCE|FANCAM',s['title'],re.I),f'Excluded type {rid}'
 assert s.get('channel') and s.get('sourceUrl','').startswith('https://')
 if s.get('publishedAt'):assert re.match(r'^\d{4}-\d{2}-\d{2}(?:T|$)',s['publishedAt']),f'Invalid known publication date {rid}'
 source_at=s['checkedAt'];assert dt(source_at)<=now+datetime.timedelta(minutes=5)
 old=freshworks[rid]['fields'].get('fld641ausT');empty=old is None or (isinstance(old,str) and not old.strip())
 bind={'videoId':s['videoId'],'sourceKey':source_key(s),'initializedAt':fresh['capturedAt'],'initialScore':None} if empty else None
 history=previous.get('previousSources',[]) if previous else []
 if previous:
  if source_key(previous)==source_key(s):
   bind=previous.get('scoreBinding');metadata_updated.append(rid)
  else:
   if previous.get('clip') or clip:
    held.append({'recordId':rid,'reason':'Existing source retained: a changed clip scope is never silently rebound or ranked against a single-song video.'});continue
   saved=not journal or any(r.get('recordId')==rid for r in journal.get('records',[]))
   higher=previous['likes']['precision']=='exact' and s['likes']>previous['likes']['value']
   if not(empty and not saved and higher):
    previous['higherCandidate']={'videoId':s['videoId'],'url':s['url'],'title':s['title'],'likes':{'value':s['likes'],'display':s.get('likesDisplay') or f"{s['likes']:,}",'precision':'exact'},'checkedAt':s['checkedAt']}
    held.append({'recordId':rid,'reason':'Source retained: scored, saved, unconfirmed journal or no strictly higher comparable likes.'});continue
   history=history+[{k:previous.get(k) for k in ['videoId','url','title','channel','kind','likes','checkedAt','scoreBinding','clip','likesScope'] }|{'changedAt':now.isoformat(),'reason':'本轮补全发现更高赞合格候选；更新前舞台分为空且未出现用户保存记录。'}]
   replaced.append(rid)
 equiv=s.get('audioEquivalence');audio_equivalence=None
 if equiv:
  original=equiv.get('originalBoundWorkId');proof_urls=[e['url'] for e in equiv.get('evidence',[]) if e.get('url','').startswith('https://')]
  assert equiv.get('sameAudio') is True and equiv.get('basis') and proof_urls and original in videos and original in inv and not videos[original].get('audioEquivalence'),f'Uncorroborated audio equivalence {rid}'
  assert inv[original]['groupIds']==inv[rid]['groupIds'] and source_key(videos[original])==source_key(s),f'Audio equivalence must reference the same-group exact already-bound performance {rid}'
  audio_equivalence={'originalBoundWorkId':original,'sameAudio':True,'basis':equiv['basis'],'evidenceUrls':proof_urls}
 display=s.get('likesDisplay') or f"{s['likes']:,}"
 language_evidence=s.get('languageVersionEvidence')
 if isinstance(language_evidence,dict):language_evidence='；'.join(str(language_evidence.get(k)) for k in ['basis','sourceVersion','sourceMVTitle','candidateTitle'] if language_evidence.get(k))
 note=' · '.join(str(v) for v in [s.get('label'),s.get('arrangement'),language_evidence,'依据公开标题、频道和说明核验，未逐句核对音轨；不据此判定真唱。'] if v)
 ranknote='已核整场内对应片段' if clip else '已核同曲同版本候选中点赞最高' if len(candidates)>1 else '本次唯一已核合格候选'
 if clip:candidates=[picked]
 videos[rid]={'sourceClass':'official','platform':'youtube','completeness':'full','videoId':s['videoId'],'url':s['url'],'title':s['title'],'channel':s['channel'],'kind':s.get('label') or s.get('type'),'publishedDate':(s.get('publishedAt') or '')[:10],'typeNote':note,'sourceUrl':s['sourceUrl'],'scoreBinding':bind,'likes':{'value':s['likes'],'display':display,'precision':'exact'},'checkedAt':source_at,'selectionNote':ranknote,'comparisonNote':item['reason'],'reusesOriginalVideo':reuse,'comparisonLimited':bool(item.get('comparisonLimited')),'comparisonLimitation':item.get('comparisonLimitation') or '', 'previousSources':history,'candidateCount':len(candidates),'candidates':[{'title':c['title'],'url':c['url'],'likesDisplay':f"{c['likes']['value']:,}",'kind':c.get('label') or c.get('kind') or '合格候选（见标题）'} for c in candidates]}
 if audio_equivalence:videos[rid]['audioEquivalence']=audio_equivalence
 if clip:videos[rid].update(clip=clip,likesScope='whole_video')
 status['works'][rid]={'status':'verified','reason':item['reason'],'checkedAt':observation}
 if not previous:added.append(rid)
status['updatedAt']=now.isoformat()
# Stage writes occur only after all identities, evidence, matching and preimage checks pass.
artifact=public(batch);name=pathlib.Path(sys.argv[1]).name;dest=root/'data/stages/evidence'/name
if dest.exists():assert load(dest)==artifact,'Evidence batch names are immutable; use a new batch ID for a corrected/researched revision.'
for path,obj in [(dest,artifact),(root/'data/stage-videos.json',videos),(root/'data/stages/status.json',status)]:
 path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');tmp.replace(path)
print(json.dumps({'retiredUnpublishedUnverifiedSources':retired_unpublished,'newSources':len(added),'sourceIds':added,'replacedUnscoredSources':replaced,'updatedSameVideoMetadata':metadata_updated,'updatedOtherStates':len(changed),'retainedExistingSources':held,'freshPreimageAt':fresh['capturedAt'],'batch':name},ensure_ascii=False,indent=2))
