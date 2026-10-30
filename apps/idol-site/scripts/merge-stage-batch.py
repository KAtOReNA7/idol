"""Merge a reviewed public evidence batch. No network, Feishu write, or publication.
Usage: python3 scripts/merge-stage-batch.py EVIDENCE_JSON FRESH_PRIVATE_EXPORT_JSON
Rated, saved or uncertain bindings are retained. Documented replacements require
a fresh empty score, complete journal and exact published source preimage.
"""
import json,sys,datetime,pathlib,re,hashlib
from stage_selection_policy import checked_selection, comparison_candidates, replacement_preference, checked_member_fallback, checked_same_song_fallback, version_eligible, checked_comparison
from stage_source_identity import SOURCE_CLASSES, source_key, checked_identity, checked_likes, comparison_group
root=pathlib.Path(__file__).resolve().parent.parent
now=datetime.datetime.now(datetime.timezone.utc)
def dt(v):return datetime.datetime.fromisoformat(v.replace('Z','+00:00'))
def load(p):return json.loads(pathlib.Path(p).read_text(encoding='utf-8'))
def public(v):
 if isinstance(v,dict):return {k:public(x) for k,x in v.items() if k!='evidenceFile'}
 if isinstance(v,list):return [public(x) for x in v]
 return v
def shares_same_song_source_root(rid,source,other_id,other,inventory,sources):
 # Sibling version targets may share a performance only through the same
 # explicit, non-fallback original work. Never follow a fallback reference.
 try:
  current=checked_same_song_fallback(source);existing=checked_same_song_fallback(other)
 except (AssertionError,TypeError,ValueError):
  return False
 if not current or not existing:return False
 original_id=current.get('sourceWorkId')
 if not original_id or original_id!=existing.get('sourceWorkId') or original_id in (rid,other_id):return False
 original=sources.get(original_id);original_work=inventory.get(original_id)
 if not original or not original_work or original.get('sameSongFallback') is not None:return False
 key=source_key(source)
 if not key or source_key(other)!=key or source_key(original)!=key:return False
 if not(original_work['groupIds']==inventory[rid]['groupIds']==inventory[other_id]['groupIds']):return False
 song=lambda value:str(value or '').strip().casefold()
 for work_id,fallback in ((rid,current),(other_id,existing)):
  if fallback['targetWorkId']!=work_id or fallback['groupId'] not in inventory[work_id]['groupIds']:return False
  if song(fallback['targetSong'])!=song(inventory[work_id].get('song')) or song(fallback['performedSong'])!=song(original_work.get('song')):return False
 if current['performerScope']!=existing['performerScope']:return False
 if any(original.get(field) not in (None,current['performerScope']) for field in ('performerScope','originalPerformerScope')):return False
 return True
batch=load(sys.argv[1]);fresh=load(sys.argv[2]);assert batch['formatVersion']=='idol.stage-evidence.v1'
assert (fresh.get('source'),fresh.get('formatVersion')) in {
 ('feishu','idol.live-backup.v1'),('native','idol.native-data-export.v1')
},'Use an authenticated original export; never relabel a snapshot or public projection'
if fresh['source']=='native':
 assert isinstance(fresh.get('journal'),list) and isinstance(fresh.get('siteMetadata',{}).get('stageVideos'),dict),'Native export must include its save journal and published stage metadata'
assert -60<=(now-dt(fresh['capturedAt'])).total_seconds()<900,'Refresh authenticated score preimage before binding sources'
freshworks={w['recordId']:w for w in fresh['tables']['works']['records']}
inv={w['recordId']:w for w in load(root/'data/stages/inventory.json')['works']}
status=load(root/'data/stages/status.json');videos=load(root/'data/stage-videos.json')
allowed={'pending','verified','likes_unverified','not_found','version_mismatch','blocked','missing_song_identity'}
journal=load(sys.argv[3]) if len(sys.argv)>3 else None
if fresh['source']=='native':
 # The authenticated native export already contains the complete owner journal.
 # Do not accept an unrelated hand-crafted journal in place of these rows.
 rows=fresh['journal']
 assert all(isinstance(r,dict) and isinstance(r.get('record_id'),str) and r['record_id'] and isinstance(r.get('table_key'),str) and isinstance(r.get('status'),str) for r in rows),'Native save journal rows must identify record, table and status'
 journal={'complete':True,'capturedAt':fresh['capturedAt'],'records':[{'recordId':r['record_id']} for r in rows]}
needs_replacement=any(i.get('selected') and i['recordId'] in videos and source_key(videos[i['recordId']])!=source_key(i['selected']) for i in batch['items'])
if journal and (len(sys.argv)>3 or needs_replacement):assert journal.get('complete') and -60<=(now-dt(journal['capturedAt'])).total_seconds()<300,'Fresh complete save journal required for source replacements'
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
 assert s.get('sourceClass') in SOURCE_CLASSES and s.get('platform') in ('youtube','bilibili','x') and s.get('scorePolicy')!='view_only',f'Formal source must have an explicit platform and upload provenance, never view-only {rid}'
 same_song=checked_same_song_fallback(s)
 if same_song:
  assert previous is None,f'Same-song fallback is allowed only for an empty new stage slot {rid}'
  assert same_song['targetWorkId']==rid and same_song['groupId'] in inv[rid]['groupIds'],f'Same-song fallback work/group mismatch {rid}'
  assert same_song['targetSong'].strip().casefold()==str(inv[rid].get('song','')).strip().casefold(),f'Same-song fallback target song identity mismatch {rid}'
  assert '同曲后备' in s.get('label','') and all(d in s.get('verificationNote','') for d in same_song['differences']),f'Same-song fallback needs visible differences {rid}'
  if same_song.get('sourceWorkId') is not None:
   other_id=same_song['sourceWorkId'];other=videos.get(other_id)
   assert other_id in inv and other and inv[other_id]['groupIds']==inv[rid]['groupIds'] and source_key(other)==source_key(s),f'Fallback source work must identify an exact already-bound same-group video {rid}'
   assert other.get('sameSongFallback') is None,f'Fallback source work must not itself be a same-song fallback {rid}'
   assert str(inv[other_id].get('song','')).strip().casefold()==same_song['performedSong'].strip().casefold(),f'Fallback performed song differs from referenced source work {rid}'
 selected_key=checked_identity(s)
 if s['platform'] in ('bilibili','x'):assert item.get('selectedSourceKey')==selected_key,f'Bilibili selection needs the complete source key {rid}'
 if 'selectedSourceKey' in item:assert item['selectedSourceKey']==selected_key,f'Selected source key differs from full identity {rid}'
 selection=checked_selection(s)
 candidates=comparison_candidates(item['candidates'])
 exact=[c for c in candidates if checked_identity(c)==selected_key];assert len(exact)==1,f'Selection not verified/comparable {rid}'
 picked=exact[0];clip=s.get('clip')
 assert picked['selection']==selection,f'Selected occasion/camera evidence differs from candidate evidence {rid}'
 assert picked['sourceClass']==s['sourceClass'] and picked.get('sourceEvidence')==s.get('sourceEvidence'),f'Selected upload provenance differs {rid}'
 if clip:
  a,b,total=clip.get('startSeconds'),clip.get('endSeconds'),clip.get('sourceDurationSeconds');ev=clip.get('evidence',{})
  assert isinstance(a,int) and not isinstance(a,bool) and isinstance(b,int) and not isinstance(b,bool) and isinstance(total,int) and not isinstance(total,bool) and 0<=a<b<=total<=86400,f'Invalid clip bounds {rid}'
  assert ev.get('note') and ev.get('urls') and all(u.startswith('https://') for u in ev['urls']) and s.get('likesScope')=='whole_video',f'Clip needs full boundary evidence and whole-video like label {rid}'
 assert version_eligible(picked) and version_eligible(s) and s.get('languageVersionEvidence'),f'Exact version or documented member fallback evidence missing {rid}'
 fallback=checked_member_fallback(s)
 assert picked.get('memberVersionFallback')==fallback,f'Selected member fallback evidence differs from candidate {rid}'
 assert picked.get('sameSongFallback')==same_song,f'Selected same-song fallback evidence differs from candidate {rid}'
 if fallback:
  assert fallback['groupId'] in inv[rid]['groupIds'],f'Member fallback group differs from target {rid}'
  assert '成员版' in s.get('label','') and '客串' in s.get('verificationNote',''),f'Member fallback must visibly disclose its scope {rid}'
 reuse=s['platform']=='youtube' and s['videoId']==inv[rid]['mv']['videoId']
 if reuse:
  assert s.get('reusesExistingVideo') is True and re.search(r'performance|special stage|live clip|showcase|dance practice|choreography practice',inv[rid]['mv']['officialTitle'] or '',re.I) and not re.search(r'official (?:music video|mv)',inv[rid]['mv']['officialTitle'] or '',re.I),f'Original MV cannot be relabelled stage without explicit performance evidence {rid}'
 selected_likes=checked_likes(s)
 assert selected_likes==checked_likes(picked),f'Selected likes differ from candidate evidence {rid}'
 assert comparison_group(picked)==comparison_group(s),f'Selected likes scope differs from candidate evidence {rid}'
 comparison=checked_comparison(s,candidates,item.get('selectionDecision'),item['candidates'])
 assert not re.search(r'RELAY\s+DANCE|FANCAM',s['title'],re.I),f'Excluded type {rid}'
 assert s.get('channel') and s.get('sourceUrl','').startswith('https://')
 if s.get('publishedAt'):assert re.match(r'^\d{4}-\d{2}-\d{2}(?:T|$)',s['publishedAt']),f'Invalid known publication date {rid}'
 source_at=s['checkedAt'];assert dt(source_at)<=now+datetime.timedelta(minutes=5)
 old=freshworks[rid]['fields'].get('fld641ausT');empty=old is None or (isinstance(old,str) and not old.strip())
 # A public or incomplete projection cannot establish an empty owner score.
 assert 'fld641ausT' in {f.get('field_id') for f in fresh['tables']['works'].get('fields',[])} or fresh['source']=='feishu','Native work schema must include the stage score field'
 if fallback and (not empty or not journal or any(r.get('recordId')==rid for r in journal.get('records',[]))):
  held.append({'recordId':rid,'reason':'Member-version fallback held: existing score or save history, or journal not confirmed.'});continue
 if not previous and (s['platform'] in ('bilibili','x') or s['sourceClass']!='official' or same_song):
  assert rid not in fresh.get('siteMetadata',{}).get('stageVideos',{}),f'Published source preimage differs from absent local source {rid}'
  if not empty or not journal or any(r.get('recordId')==rid for r in journal.get('records',[])):
   held.append({'recordId':rid,'reason':'New platform/upload source held: existing score or save history, or complete journal not confirmed.'});continue
 bind={'videoId':s['videoId'],'sourceKey':source_key(s),'initializedAt':fresh['capturedAt'],'initialScore':None} if empty else None
 history=previous.get('previousSources',[]) if previous else []
 if previous:
  if source_key(previous)==source_key(s):
   bind=previous.get('scoreBinding');metadata_updated.append(rid)
  else:
   if previous.get('clip') or clip:
    held.append({'recordId':rid,'reason':'Existing source retained: a changed clip scope is never silently rebound or ranked against a single-song video.'});continue
   saved=not journal or any(r.get('recordId')==rid for r in journal.get('records',[]))
   preference=replacement_preference(previous,s,item.get('previousOccasionReview'),item.get('replacementDecision') or item.get('selectionDecision'))
   published=fresh.get('siteMetadata',{}).get('stageVideos',{}).get(rid)
   assert published==previous,'Published source preimage differs from local source; reconcile before replacement'
   if not(empty and not saved and preference):
    # Preserve an existing source byte-for-byte when an incomparable proposal
    # has no reviewed preference; do not label it a higher-like candidate.
    if comparison=='manual_evidence' or selected_likes['precision']!='exact' or checked_likes(previous)['precision']!='exact' or comparison_group(s)!=comparison_group(previous) or s['platform']=='bilibili' and s['videoId']==previous['videoId']:
     held.append({'recordId':rid,'reason':'Source retained: cross-platform/unknown-like choice or owner protection is unresolved.'});continue
    previous['higherCandidate']={'videoId':s['videoId'],'url':s['url'],'title':s['title'],'likes':selected_likes,'checkedAt':s['checkedAt']}
    if s['platform']=='bilibili':previous['higherCandidate'].update(platform='bilibili',bilibili=s['bilibili'])
    held.append({'recordId':rid,'reason':'Source retained: scored, saved, unconfirmed journal or no documented policy/like preference.'});continue
   history=history+[{k:v for k,v in previous.items() if k!='previousSources'}|{'changedAt':now.isoformat(),'reason':'按已确认节目／练习室／官方表演后备政策更新；更新前舞台分为空且完整保存日志无该作品记录。','preference':preference,'previousOccasionReview':item.get('previousOccasionReview')}]
   replaced.append(rid)
 equiv=s.get('audioEquivalence');audio_equivalence=None
 if equiv:
  original=equiv.get('originalBoundWorkId');proof_urls=[e['url'] for e in equiv.get('evidence',[]) if e.get('url','').startswith('https://')]
  assert equiv.get('sameAudio') is True and equiv.get('basis') and proof_urls and original in videos and original in inv and not videos[original].get('audioEquivalence'),f'Uncorroborated audio equivalence {rid}'
  assert inv[original]['groupIds']==inv[rid]['groupIds'] and source_key(videos[original])==source_key(s),f'Audio equivalence must reference the same-group exact already-bound performance {rid}'
  audio_equivalence={'originalBoundWorkId':original,'sameAudio':True,'basis':equiv['basis'],'evidenceUrls':proof_urls}
 display=selected_likes['display']
 language_evidence=s.get('languageVersionEvidence')
 if isinstance(language_evidence,dict):language_evidence='；'.join(str(language_evidence.get(k)) for k in ['basis','sourceVersion','sourceMVTitle','candidateTitle'] if language_evidence.get(k))
 note=' · '.join(str(v) for v in [s.get('label'),s.get('arrangement'),language_evidence,'依据公开标题、频道和说明核验，未逐句核对音轨；不据此判定真唱。'] if v)
 ranknote='同曲后备；完整性与版本差异见说明' if same_song else '已核整场内对应片段' if clip else '已核同曲同版本同优先级候选中点赞最高' if comparison=='comparable_likes' else '依据人工选择理由与来源证据采用；点赞不可完整比较' if comparison=='manual_evidence' else '本次唯一已核同优先级合格候选'
 if clip:candidates=[picked]
 videos[rid]={'sourceClass':s['sourceClass'],'platform':s['platform'],'completeness':s['completeness'],'videoId':s['videoId'],'url':s['url'],'title':s['title'],'channel':s['channel'],'kind':s.get('label') or s.get('type'),'publishedDate':(s.get('publishedAt') or '')[:10],'typeNote':note,'sourceUrl':s['sourceUrl'],'scoreBinding':bind,'likes':selected_likes,'checkedAt':source_at,'selectionNote':ranknote,'comparisonNote':item['reason'],'reusesOriginalVideo':reuse,'comparisonLimited':bool(item.get('comparisonLimited')) or comparison!='comparable_likes','comparisonLimitation':item.get('comparisonLimitation') or '', 'previousSources':history,'candidateCount':len(candidates),'candidates':[{'title':c['title'],'url':c['url'],'likesDisplay':f"{checked_likes(c)['value']:,}" if checked_likes(c)['precision']=='exact' else checked_likes(c)['display'],'kind':c.get('label') or c.get('kind') or '合格候选（见标题）',**({'platform':'bilibili','videoId':c['videoId'],'bilibili':c['bilibili']} if c['platform']=='bilibili' else {'platform':'x','videoId':c['videoId'],'xMedia':c['xMedia']} if c['platform']=='x' else {})} for c in candidates]}
 if s['platform']=='bilibili':videos[rid].update(bilibili=s['bilibili'],likesScope=s.get('likesScope','whole_video'))
 if s['platform']=='x':videos[rid].update(xMedia=s['xMedia'],likesScope='whole_post')
 if s.get('sourceEvidence'):videos[rid]['sourceEvidence']=s['sourceEvidence']
 if s['platform']=='bilibili' and clip:
  videos[rid]['candidates'][0]['clip']=clip
 videos[rid]['selection']=selection
 if fallback:videos[rid]['memberVersionFallback']=fallback
 if same_song:videos[rid]['sameSongFallback']=same_song
 if s.get('verificationNote'):
  assert isinstance(s['verificationNote'],str) and s['verificationNote'].strip()
  videos[rid]['verificationNote']=s['verificationNote']
 if len(candidates)==1:
  videos[rid]['comparisonLimited']=True
  videos[rid]['comparisonLimitation']=item.get('comparisonLimitation') or '本轮仅有一个符合新政策的同优先级候选；其他合格候选仍待比较。'
 if audio_equivalence:videos[rid]['audioEquivalence']=audio_equivalence
 if clip:videos[rid].update(clip=clip,likesScope='whole_video')
 # A BV alone is not a reusable source: sharing/equivalence uses the whole
 # platform + part identity, just as legacy YouTube clips include their bounds.
 target_identity=(inv[rid]['groupIds'],str(inv[rid].get('song','')).strip().casefold())
 for other_id,other in videos.items():
  if other_id==rid or source_key(other)!=selected_key:continue
  other_identity=(inv[other_id]['groupIds'],str(inv[other_id].get('song','')).strip().casefold())
  assert target_identity==other_identity or audio_equivalence and audio_equivalence['originalBoundWorkId']==other_id or same_song and same_song.get('sourceWorkId')==other_id or shares_same_song_source_root(rid,s,other_id,other,inv,videos),f'Exact source reused for a different group/song without corroborated audio equivalence or same-song fallback reference {rid}'
 status['works'][rid]={'status':'verified','reason':item['reason'],'checkedAt':observation}
 if not previous:added.append(rid)
status['updatedAt']=now.isoformat()
# Stage writes occur only after all identities, evidence, matching and preimage checks pass.
artifact=public(batch);name=pathlib.Path(sys.argv[1]).name;dest=root/'data/stages/evidence'/name
if dest.exists():assert load(dest)==artifact,'Evidence batch names are immutable; use a new batch ID for a corrected/researched revision.'
for path,obj in [(dest,artifact),(root/'data/stage-videos.json',videos),(root/'data/stages/status.json',status)]:
 path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_suffix(path.suffix+'.tmp');tmp.write_bytes((json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode('utf-8'));tmp.replace(path)
print(json.dumps({'retiredUnpublishedUnverifiedSources':retired_unpublished,'newSources':len(added),'sourceIds':added,'replacedUnscoredSources':replaced,'updatedSameVideoMetadata':metadata_updated,'updatedOtherStates':len(changed),'retainedExistingSources':held,'freshPreimageAt':fresh['capturedAt'],'batch':name},ensure_ascii=False,indent=2))
