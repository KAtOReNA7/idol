"""Reconcile the frozen 871 tuples with checked research and actual imported images."""
from pathlib import Path
import json, collections, re, csv, hashlib

folder=Path(__file__).resolve().parent
repo=folder.parents[3]
load=lambda p:json.loads(Path(p).read_text(encoding='utf-8'))
key=lambda p:(p['workId'],p['videoId'],p['memberId'])
baseline=load(folder.parent/'20261026-gap-remediation/ledger.json')
audit=load(repo/'docs/codex/mv-identity-asset-audit-20261025.json')
images={key(p):p for p in audit['identityImages']}
missing={key({'workId':w['workId'],'videoId':w['videoId'],**m}) for w in audit['workCoverage'] for m in w['missingIdentityRelationships']}

categories={
 'resolved':'已补齐对应关系图',
 'source_has_no_target_image':'已读来源没有目标作品图',
 'source_access':'选定入口失效或访问受阻',
 'insufficient_pixels':'原生有效像素不足',
 'not_mv_shoot':'现有素材不是目标MV拍摄',
 'identity_unproven':'照片或视频已有，逐图姓名未证',
 'wrong_version':'版本不符或尚未消歧',
 'obscured_composition':'画质、遮挡或构图未通过',
 'research_incomplete':'新来源或具名帧待实际审查',
 'provenance_mismatch':'原文件证据需重新核对',
}
mapping={
 'target_chapter_absent_in_current_member_article':'source_has_no_target_image',
 'known_member_profile_has_no_target_chapter_image':'source_has_no_target_image',
 'source_entry_retired':'source_access',
 'insufficient_native_portrait_pixels':'insufficient_pixels',
 'native_pixels_below_540_effective_portrait':'insufficient_pixels',
 'source_resolution_insufficient':'insufficient_pixels',
 'insufficient_facial_detail':'obscured_composition',
 'face_obscured_in_source_frame':'obscured_composition',
 'face_obstruction_and_native_softness':'obscured_composition',
 'face_obstruction_at_mouth_and_chin':'obscured_composition',
 'quality_rejected':'obscured_composition',
 'composition_rejected':'obscured_composition',
 'source_heading_conflicts_with_image_metadata':'identity_unproven',
 'cross_group_guest_named_mapping_missing':'identity_unproven',
 'subunit_guest_named_mapping_missing':'identity_unproven',
 'official_gallery_named_mapping_pending':'identity_unproven',
 'official_mv_photos_unnamed':'identity_unproven',
 'edited_version_sparse_named_evidence':'wrong_version',
 'target_version_missing_chapter':'wrong_version',
 'source_chapter_does_not_establish_exact_requested_version':'wrong_version',
 'same_title_multi_part_version_unresolved':'wrong_version',
 'selected_image_part1_not_proven_in_target_part2':'wrong_version',
 'wrong_video_version_confirmed':'wrong_version',
 'named_frame_review_pending':'research_incomplete',
 'public_named_source_pending_commercial_extra':'research_incomplete',
 'fresh_release_named_source_pending':'research_incomplete',
 'exact_collaboration_named_frame_pending':'research_incomplete',
 'candidate_ready':'research_incomplete',
 'resolved_source_and_quality_pending_import':'research_incomplete',
}
research={}
for filename in ['research-same-video.json','research-official.json','research-profiles.json','research-followup.json']:
 data=load(folder/filename)
 rows=data.get('entries',data.get('solutions',data.get('rows',[])))
 for row in rows:
  assert key(row) not in research
  research[key(row)]={'file':filename,'row':row}
assert len(research)==862 # 868 open before this batch, minus six parent-reviewed AtHeart rows.

def links(value):
 if isinstance(value,dict):
  for k,v in value.items():
   if isinstance(v,str) and v.startswith('https://') and not any(host in v for host in ['i.ytimg.com','cdnimg.melon','wevpstatic.net']):yield v
   elif isinstance(v,(dict,list)):yield from links(v)
 elif isinstance(value,list):
  for v in value:yield from links(v)

entries=[]
for old in baseline['entries']:
 entry=dict(old);k=key(entry);p=images.get(k);r=research.get(k)
 entry['previousPrimaryCategory']=old['primaryCategory'];entry['previousProblemEvidence']=old['problemEvidence']
 if r:
  row=r['row'];c=row.get('primaryCategory',row.get('newCategory',row.get('newPrimaryProblem',row.get('currentCategory','research_incomplete'))))
  entry['primaryCategory']=mapping.get(c,c);assert entry['primaryCategory'] in categories,c
  entry['detailedProblem']=c;entry['researchEvidenceFile']=r['file']
  entry['problemEvidence']=row.get('problemEvidence',row.get('reason',row.get('finding',old['problemEvidence'])))
  entry['steps']=row.get('nextSteps',row.get('steps',[row.get('solution','继续执行已登记精确作品来源路线。')]))
  entry['validationStage']=row.get('validationStage','已记录本次来源/原件核查；尚未通过全部采用条件')
  entry['sources']=[{'url':u,'label':'本次来源或明确的下一步入口','depth':'具体已执行范围见研究记录；入口不等于采用证据'} for u in dict.fromkeys(links(row))]
  entry['researchExhausted']=False
 if p:
  entry.update(status='resolved',primaryCategory='resolved',validationStage='已导入；发布状态见本表release字段',problemEvidence='具名来源、精确视频归属及实际裁切已复核，原文件SHA与尺寸通过；已补入既有关系。',resolution={'src':p['src'],'sha256':p['sha256'],'label':p['label'],'evidenceLevel':p['evidenceLevel'],'sourcePageUrl':p['sourcePageUrl']},steps=['保持当前已验证来源与原字节；后续发现更清晰来源时单独复核替换。'])
  entry['sources']=[{'url':p['sourcePageUrl'],'label':'实际采用来源','depth':'身份与视频来源证据见审计行'},*entry.get('sources',[])]
 else:
  entry['status']='open'
  assert k in missing
 # A collaboration/ad music video is eligible when it is the exact catalog target.
 entry['acceptanceCriteria']=[s.replace('不以概念照、封套、广告、舞台或其他语言版本代替。','不以无关概念照、封套、广告、舞台或其他语言版本代替；目录目标本身为合作广告MV时按该精确视频审核。') for s in old['acceptanceCriteria']]
 entries.append(entry)
assert len(entries)==871 and len({key(p) for p in entries})==871
assert {key(e) for e in entries if e['status']=='open'}==missing
counts=dict(collections.Counter(e['primaryCategory'] for e in entries))
resolved=sum(e['status']=='resolved' for e in entries)
previous=load(folder/'ledger.json') if (folder/'ledger.json').exists() else {}
output={**{k:v for k,v in baseline.items() if k not in ['entries','categories','summary','implementationCommit']},'checkedAt':'2026-10-26','currentAuditSha256':hashlib.sha256((repo/'docs/codex/mv-identity-asset-audit-20261025.json').read_bytes()).hexdigest(),'release':previous.get('release',{'status':'not_yet_published','version':None}),'categories':[{'id':k,'label':v} for k,v in categories.items()],'summary':{'frozen':871,'resolved':resolved,'remaining':871-resolved,'newSinceJ':resolved-3,'works':196,'groups':45,'byCategory':{c:counts.get(c,0) for c in categories},'openByCategory':{c:counts.get(c,0) for c in categories if c!='resolved'}},'entries':entries}
(folder/'ledger.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
with (folder/'ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 columns=['group','song','videoId','memberName','stageName','status','primaryCategory','problemEvidence','steps','workId','memberId','ratingId'];w=csv.DictWriter(f,fieldnames=columns);w.writeheader()
 for e in entries:w.writerow({k:' | '.join(e[k]) if isinstance(e.get(k),list) else e.get(k,'') for k in columns})
print(json.dumps(output['summary'],ensure_ascii=False))
