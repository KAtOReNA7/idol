"""Compile reviewed view-only alternatives into public editorial metadata.
Writes only stdout. It never changes bindings, contacts a provider, or infers source identity.
Usage: python3 scripts/normalize-stage-supplements.py REVIEWED.json ... > PROPOSAL.json
"""
import json,sys,pathlib,datetime,re,urllib.parse
TYPES={'press_concert_recording':'press_concert_recording','audience_original_festival':'concert_stage','audience_original_fansign':'concert_stage','audience_original_concert_segment':'concert_stage','audience_original_event':'concert_stage','audience_stage':'concert_stage','broadcast_full_group_cam':'official_group_fancam','broadcast_medley_excerpt':'broadcast_stage','official_concert_excerpt':'concert_stage','audience_original_concert':'concert_stage','radio_live_session':'studio_performance','staged_live_clip':'produced_dance_performance','dance_performance':'produced_dance_performance','staged_performance':'produced_dance_performance','broadcast_stage':'broadcast_stage','concert_stage':'concert_stage','official_group_fancam':'official_group_fancam','studio_performance':'studio_performance','studio_live_session':'studio_performance','live_clip':'studio_performance','band_live':'studio_performance','staged_dance_performance':'produced_dance_performance','produced_dance_performance':'produced_dance_performance','official_performance_film':'produced_dance_performance','showcase_stage':'showcase_stage'}
LABELS={'press_concert_recording':'原发布媒体现场录像','audience_original_festival':'观众音乐节现场（非官方）','audience_original_fansign':'观众活动现场（非官方）','audience_original_concert_segment':'观众整场曲目章节（非官方）','audience_original_event':'观众活动现场（非官方）','audience_stage':'观众现场原拍（非官方）','broadcast_full_group_cam':'官方全团现场','broadcast_medley_excerpt':'官方节目组曲短版','official_concert_excerpt':'官方演唱会短版','audience_original_concert':'观众现场原拍（非官方）','radio_live_session':'官方电台现场','staged_live_clip':'官方舞台化 Live Clip','dance_performance':'舞台化表演','staged_performance':'舞台化表演','broadcast_stage':'节目舞台','concert_stage':'演唱会现场','official_group_fancam':'官方完整团体现场','studio_performance':'录音棚表演','studio_live_session':'录音棚现场','live_clip':'Live Clip','band_live':'乐队现场','staged_dance_performance':'舞台化表演','produced_dance_performance':'舞台化表演','official_performance_film':'特别表演','showcase_stage':'Showcase 舞台'}
def platform_of(a):
 raw=a.get('platform')
 if raw in ['sbs','TVer']:
  host=urllib.parse.urlsplit(a['url']).hostname
  allowed={'sbs':{'programs.sbs.co.kr','www.sbs.co.kr','m.sbs.co.kr'},'TVer':{'tver.jp'}}
  assert host in allowed[raw],f'Platform/domain mismatch: {raw}'
  return 'official_site'
 return raw
def proof(value,fallback_note=None):
 if isinstance(value,dict) and value.get('note') and value.get('urls'):return {'note':value['note'],'urls':value['urls']}
 if isinstance(value,dict):value=[value]
 value=value or [];urls=list(dict.fromkeys(v['url'] for v in value if v.get('url','').startswith('https://')))
 notes=list(dict.fromkeys(v.get('text') or v.get('finding') or v.get('note') or v.get('basis') for v in value if v.get('text') or v.get('finding') or v.get('note') or v.get('basis')))
 note='；'.join(notes) or fallback_note
 assert urls and note,'Explicit public evidence URLs and descriptive note required'
 return {'note':note,'urls':urls}
works={};origins=[];manifests=[];reviewed_hashes=[]
for filename in sys.argv[1:]:
 doc=json.loads(pathlib.Path(filename).read_text());origins.append(pathlib.Path(filename).name)
 if doc.get('manifestSha256'):manifests.append(doc['manifestSha256'])
 reviewed_hashes.extend(doc.get('reviewedInputs',[]))
 for item in doc['items']:
  raw=item.get('alternatives') or ([item['alternative']] if item.get('alternative') else [])
  leadraw=item.get('watchLeads') or item.get('researchLinks') or []
  if not raw and not leadraw:continue
  rid=item['recordId'];assert rid not in works,f'Duplicate reviewed alternative work {rid}; choose latest immutable batch explicitly'
  alternatives=[]
  for a in raw:
   assert a.get('scorePolicy')=='view_only',f'Alternative must be explicitly view-only: {rid}'
   typ=a.get('type') or a.get('kind');assert typ in TYPES,f'Unreviewed alternative performance type {typ}: {rid}'
   platform=platform_of(a);sid=a.get('videoId') or a.get('sourceId','').removeprefix((a.get('platform') or '')+':')
   assert platform and sid and a.get('sourceClass') and a.get('performerScope') and a.get('completeness'),f'Unverified alternative classification: {rid}'
   match=a.get('versionMatch');assert match in ['exact','different','unconfirmed'],f'Explicit version result required: {rid}'
   reason=a.get('reason') or item.get('reason');assert reason
   differences=[]
   if match!='exact':
    if a.get('label'):differences.append(a['label'])
    if item.get('originalVersion'):differences.append('原条目版本：'+item['originalVersion'])
    differences.extend(x for x in a.get('differences',[]) if re.search(r'[\u4e00-\u9fff]',x))
    if not differences or match=='unconfirmed':differences.append(reason)
   song_proof=a.get('sameSongEvidenceStructured') or a.get('sameSongEvidence')
   if isinstance(song_proof,dict) and song_proof.get('sourceUrls'):song_proof={'note':'；'.join(song_proof['basis']),'urls':song_proof['sourceUrls']}
   source_proof=a.get('sourceEvidence') or a.get('officialEvidence')
   if isinstance(source_proof,str):source_proof={'note':source_proof,'urls':[a['sourceUrl']]}
   evidence=item.get('evidence') or song_proof
   row={'id':f'{platform}-{sid}', 'platform':platform,'sourceId':sid,'sourceClass':a['sourceClass'],'performerScope':a['performerScope'],'completeness':a['completeness'],'url':a['url'],'title':a['title'],'channel':a['channel'],'performanceType':TYPES[typ],'kind':a.get('label') or LABELS[typ],'checkedAt':a.get('checkedAt') or item['checkedAt'],'scorePolicy':'view_only','sourceEvidence':proof(source_proof),'sameSongEvidence':proof(song_proof),'version':{'match':match,'differences':list(dict.fromkeys(differences)),'evidence':proof(evidence,reason)}}
   for key in ['originalPerformerScope','performerNames','originalPerformerNames','eventDate']:
    if a.get(key) is not None:row[key]=a[key]
   for key in ['performerEvidence','eventEvidence']:
    if a.get(key):row[key]=proof(a[key])
   if a.get('durationSeconds') is not None:row['durationSeconds']=a['durationSeconds']
   if a.get('durationScope') is not None:
    scope=a['durationScope'];assert scope in ['single_song','whole_video','documented_target_song_chapter','official_chapter_window'],f'Unreviewed duration scope: {rid}'
    row['durationScope']='single_song' if scope in ['documented_target_song_chapter','official_chapter_window'] else scope
   alternatives.append(row)
  leads=[]
  if leadraw:
   assert item.get('resolutionStatus') in ['watch_lead','watch_lead_only'],f'Viewing lead must be explicitly editorially reviewed as watch_lead: {rid}'
   for a in leadraw:
    assert a.get('sourceClass')=='official' and a.get('completeness')=='unconfirmed' and a.get('scorePolicy')=='view_only',f'Invalid viewing-lead scope: {rid}'
    assert not any(k in a for k in ['clip','scoreBinding','stageSourceKey','sourceKey','startSeconds','endSeconds','likes']),f'Viewing lead cannot have score/clip/ranking data: {rid}'
    typ=a.get('type') or a.get('kind');assert typ in ['official_livestream_song_lead','official_multi_song_live_clip','official_showcase_full_event','official_concert_full_event','official_compilation','official_television_program'],f'Unreviewed compilation/event type: {rid}'
    platform=platform_of(a);sid=a.get('videoId') or a['sourceId'].removeprefix(a['platform']+':');url=a['url']
    if a.get('leadTimeSeconds') is not None:
     seconds=a['leadTimeSeconds'];assert isinstance(seconds,int) and not isinstance(seconds,bool) and 0<=seconds<=86400 and a.get('leadTimeEvidence'),f'Invalid lead time: {rid}'
     if platform=='youtube':
      parts=urllib.parse.urlsplit(url);q=urllib.parse.parse_qs(parts.query);q['t']=[str(seconds)];url=urllib.parse.urlunsplit((parts.scheme,parts.netloc,parts.path,urllib.parse.urlencode(q,doseq=True),parts.fragment))
    row={'id':f'{platform}-{sid}-lead','platform':platform,'sourceId':sid,'sourceClass':'official','performerScope':a['performerScope'],'completeness':'unconfirmed','scorePolicy':'view_only','url':url,'title':a['title'],'channel':a['channel'],'sourceType':typ,'kind':a.get('label') or '官方合集/整场','checkedAt':a.get('checkedAt') or item['checkedAt'],'sourceEvidence':proof(a['sourceEvidence']),'sameSongEvidence':proof(a['sameSongEvidence']),'reason':a.get('reason') or item['reason']}
    if a.get('versionEvidence'):
     version_proof=proof(a['versionEvidence'])
     row['sameSongEvidence']={'note':row['sameSongEvidence']['note']+'；版本依据：'+version_proof['note'],'urls':list(dict.fromkeys(row['sameSongEvidence']['urls']+version_proof['urls']))}
    if a.get('leadTimeSeconds') is not None:row.update(leadTimeSeconds=a['leadTimeSeconds'],leadTimeEvidence=proof(a['leadTimeEvidence']))
    leads.append(row)
  works[rid]={'alternatives':alternatives,**({'watchLeads':leads} if leads else {})}
print(json.dumps({'formatVersion':'idol.stage-supplements.v1','updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewedInputFiles':origins,'researchManifestSha256s':list(dict.fromkeys(manifests)),'reviewedInputHashes':reviewed_hashes,'works':works},ensure_ascii=False,indent=2))
