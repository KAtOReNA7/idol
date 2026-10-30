"""Normalize reviewed research batches into the existing merger contract.
Only emits a local patch; does not bind sources, write source files, or access the network.
Usage: python3 scripts/normalize-stage-patch.py REVIEWED.json [REVIEWED2.json ...] > PATCH.json
"""
import json,sys,copy,datetime,pathlib
from stage_selection_policy import checked_selection, comparison_candidates, version_eligible, checked_comparison, checked_same_song_fallback
from stage_source_identity import SOURCE_CLASSES, checked_identity, checked_likes, comparison_group, source_key
KINDS={'practice_room':'官方练习室','festival_stage':'官方音乐节舞台','staged_live_clip':'官方舞台化 Live Clip','radio_live_session':'官方电台现场表演','staged_performance':'官方舞台化表演','broadcast_stage':'官方节目完整舞台','official_stage':'官方舞台','concert_stage':'官方演唱会完整舞台','studio_performance':'官方录音棚完整表演','studio_live_session':'官方录音棚现场表演','staged_dance_performance':'官方舞台化表演','produced_dance_performance':'官方舞台化表演','official_performance_film':'官方特别表演','showcase_stage':'官方Showcase舞台','live_clip':'官方Live Clip','band_live':'官方乐队现场'}
def likes(c):
 v=c.get('likes')
 if isinstance(v,dict):return v
 return {'value':v,'display':c.get('likesDisplay'),'precision':c.get('likesPrecision')}
def ver(c):return c.get('versionMatch') is True or c.get('versionMatch')=='exact'
def normalize_candidate(c):
 n=copy.deepcopy(c);n['likes']=likes(c);n['versionMatch']=ver(c);n['eligibility']=c.get('eligibility') or ('eligible' if c.get('status')=='qualified' else c.get('status'))
 n['url']=c.get('url') or c.get('sourceUrl');return n
out=[];seen=set();origins=[];manifests=[];reviewed_hashes=[]
for filename in sys.argv[1:]:
 d=json.loads(pathlib.Path(filename).read_text(encoding='utf-8'));origins.append(pathlib.Path(filename).name)
 if d.get('manifestSha256'):manifests.append(d['manifestSha256'])
 reviewed_hashes.extend(d.get('reviewedInputs',[]))
 for item in d['items']:
  if item.get('status')!='verified' and item.get('resolutionStatus')!='verified_youtube':continue
  s=item.get('selected');assert s and s.get('sourceClass') in SOURCE_CLASSES and s.get('platform') in ('youtube','bilibili','x') and s.get('scorePolicy')!='view_only',f'View-only/unclassified source cannot enter formal sources {item.get("recordId")}'
  same_song=checked_same_song_fallback(s)
  checked_selection(s)
  assert version_eligible(s),f'Exact selected version or documented member fallback absent {item.get("recordId")}'
  rid=item['recordId'];assert rid not in seen,f'Duplicate reviewed work {rid}; reconcile batches explicitly first';seen.add(rid)
  pick=copy.deepcopy(s);lk=checked_likes(s)
  label=s.get('label') or KINDS.get(s.get('kind') or s.get('type'))
  if label and s['sourceClass']!='official':label=('转载 · ' if s['sourceClass']=='reupload' else '第三方上传 · ')+label.removeprefix('官方')
  pick.update(likes=lk['value'],likesDisplay=lk['display'],likesPrecision=lk['precision'],sourceUrl=s.get('sourceUrl') or s['url'],publishedAt=s.get('publishedAt') or s.get('publicationDate') or '',label=label)
  if same_song:
   assert same_song['targetWorkId']==rid,f'Same-song fallback targets another work {rid}'
   pick['verificationNote']='同曲后备：'+'；'.join(same_song['differences'])+'。原目标版本的完整演出尚未取得，评分仅对应当前视频。'
  if s['platform']=='bilibili':pick['likesScope']=s.get('likesScope','whole_video')
  if s['platform']=='x':pick['likesScope']='whole_post'
  assert pick['label'],f'Review performance type label {rid}: {s.get("kind") or s.get("type")}'
  ev=s.get('languageVersionEvidence') or s.get('versionEvidence')
  if not ev:
   findings=[e.get('finding') for e in s.get('sameSongEvidence',[]) if e.get('finding') and e.get('url','').startswith('https://')]
   assert findings,f'Version correspondence evidence absent {rid}'
   ev={'basis':'；'.join(findings),'sourceVersion':item.get('originalVersion'),'sourceMVTitle':item.get('originalMV',{}).get('officialTitle'),'candidateTitle':s['title']}
  pick['languageVersionEvidence']=ev
  if pick.get('clip'):
   pick['label']=('转载 · ' if s['sourceClass']=='reupload' else '第三方上传 · ' if s['sourceClass']=='third_party' else '官方 · ')+'整片内单曲区间'
   assert pick.get('likesScope')=='whole_video',f'Concert clip likes must be explicitly whole_video {rid}'
   total=pick.get('fullVideoDurationSeconds');assert isinstance(total,int) and not isinstance(total,bool) and 0<pick['clip']['endSeconds']<=total<=86400,f'Clip needs verified full-video duration {rid}'
   pick['clip']['sourceDurationSeconds']=total
   proof=pick['clip']['evidence'];pick['clip']['evidence']={'note':proof.get('note') or proof.get('basis'),'urls':proof['urls']}
  if same_song:
   if same_song['completeness']=='excerpt':pick['label']=pick['label'].replace('完整','')
   pick['label']='同曲后备 · '+('节选 · ' if same_song['completeness']=='excerpt' else '')+('不同版本 · ' if same_song['version']=='different' else '')+pick['label']
  candidates=[normalize_candidate(c) for c in (item.get('candidates') or [s])]
  selected_key=checked_identity(s)
  matching=[c for c in candidates if c.get('videoId')==s['videoId'] and c.get('platform')==s['platform'] and checked_identity(c)==selected_key];assert len(matching)==1,f'Selected candidate evidence absent or duplicate {rid}'
  eligible=comparison_candidates(candidates)
  assert matching[0].get('memberVersionFallback')==s.get('memberVersionFallback'),f'Selected member fallback evidence differs {rid}'
  assert matching[0].get('sameSongFallback')==same_song,f'Selected same-song fallback evidence differs {rid}'
  assert matching[0] in eligible and matching[0]['selection']==s['selection'],f'Selected not in highest-priority policy-eligible comparison or selection evidence differs {rid}'
  assert checked_likes(matching[0])==lk,f'Selected likes differ from candidate evidence {rid}'
  assert comparison_group(matching[0])==comparison_group(pick),f'Selected likes scope differs from candidate evidence {rid}'
  assert matching[0]['sourceClass']==s['sourceClass'] and matching[0].get('sourceEvidence')==s.get('sourceEvidence'),f'Selected upload provenance differs {rid}'
  comparison=checked_comparison(pick,eligible,item.get('selectionDecision'),candidates)
  note=item.get('reason') or s.get('reason');assert note
  out.append({**copy.deepcopy(item),'recordId':rid,'status':'verified','selectedVideoId':s['videoId'],'selectedSourceKey':selected_key,'selected':pick,'candidates':candidates,'reason':note,'checkedAt':item.get('checkedAt') or d['checkedAt'],'comparisonLimited':bool(item.get('comparisonLimited')) or comparison!='comparable_likes','comparisonLimitation':item.get('comparisonLimitation') or ('跨平台或点赞不可完整比较；依据具名人工选择理由与来源证据采用，不声明最高赞。' if comparison=='manual_evidence' else '本轮仅有一个符合新政策的同优先级候选；其他合格候选仍待比较。' if len(eligible)==1 else '')})
print(json.dumps({'formatVersion':'idol.stage-evidence.v1','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewedInputFiles':origins,'researchManifestSha256s':list(dict.fromkeys(manifests)),'reviewedInputHashes':reviewed_hashes,'items':out},ensure_ascii=False,indent=2))
