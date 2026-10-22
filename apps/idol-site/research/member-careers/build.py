"""Offline, read-only input builder. Never imports a private export into artifacts."""
import argparse, collections, hashlib, json, pathlib
PUBLIC = ['name','stageName','cnName','role','status','profile','officialUrl']
FIELD_IDS = dict(zip(PUBLIC,['fldkWtH5Dl','fld1jPwSAP','fld3ZUEOW4','fldFqUenwo','fld3U12Dow','fld2J3j9r8','fld4QBGQoc']))
def canonical(v): return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':'))
def digest(v): return hashlib.sha256(canonical(v).encode()).hexdigest()
def text(v):
 if v is None:return ''
 if isinstance(v,str):return v
 if isinstance(v,list):return ''.join(map(text,v))
 if isinstance(v,dict):return text(next((v[k] for k in ['text','name','link','url','value'] if v.get(k) is not None),''))
 return str(v) if isinstance(v,(int,float)) else ''
def project(fields):
 out={k:text(fields.get(fid)) for k,fid in FIELD_IDS.items()}
 url=fields.get(FIELD_IDS['officialUrl'])
 if isinstance(url,dict):out['officialUrl']=url.get('link',url.get('url',''))
 return out

def build(package,export,out):
 load=lambda f:json.loads((package/f).read_text())
 raw=package/'extracted'; originals={str(f.relative_to(package)):hashlib.sha256(f.read_bytes()).hexdigest() for f in package.rglob('*.json')}
 baseline=load('extracted/input/public-baseline.json'); members={x['memberId']:x for x in baseline['members']}
 final=load('field-semantic-final-acceptance.json'); revisions=load('field-semantic-minimal-revisions.json'); periodsReview=load('independent-review/member-period-semantic-review.json')
 assert len(final['records'])==192 and len(periodsReview['records'])==369
 exportData=json.loads(export.read_text()); table=exportData['tables']['members']; live={r['recordId']:r['fields'] for r in table['records']}
 roleOptions=next(f['property']['options'] for f in table['fields'] if f['field_id']==FIELD_IDS['role'])
 roleNames={o['name'] for o in roleOptions}
 sourceRows=load('extracted/sources.json')['sources']+periodsReview['newSourcesForReviewedCopy']; sources={s['sourceId']:s for s in sourceRows}
 assert len(sources)==len(sourceRows)
 supplements=json.loads((pathlib.Path(__file__).parent/'source-supplements.json').read_text())
 for evidence in supplements['records']:
  source=next(s for s in sources.values() if s['url']==evidence['url'])
  source.setdefault('evidence',[]).append({k:v for k,v in evidence.items() if k not in ['sourceId','url']})
 normalizations={r['claimId']:r for r in supplements['roleNormalizations']}
 def source_url(url,recordId):
  ids=[s['sourceId'] for s in sources.values() if s['url']==url]
  if not ids:
   sid='source:'+hashlib.sha256(url.encode()).hexdigest()[:16]
   sources[sid]={'sourceId':sid,'url':url,'evidence':[],'supports':[],'origin':'final_semantic_review_supplement','limitations':['Review supplied this source URL; no new body retrieval is claimed by this offline builder.']};ids=[sid]
  for sid in ids:
   if not any(s.get('recordId')==recordId for s in sources[sid].get('supports',[])):
    sources[sid].setdefault('supports',[]).append({'recordId':recordId,'fields':['career_claim'],'supportScopeZh':'最终语义验收补读索引；具体支持范围以验收记录为准。'})
  return ids
 ledger=[]; claims=[]
 revmap={r['patchId']:r for r in revisions['records']}
 for review in final['records']:
  r=load('extracted/'+review['file'])['records'][review['index']]; rid=r.get('patchId',r.get('claimId'));mid=r['memberId'];assert mid==review['memberId']
  decision=review['decision']; after=r['after']
  if decision=='accepted_with_revision':
   change=revmap[rid];assert change['originalAfter']==after and change['revisedAfter']==review['minimalRevisedAfter'];after=change['revisedAfter']
  normalization=normalizations.get(rid)
  if normalization:
   assert after=={'roleLabels':['主唱',normalization['originalLabel']]}
   assert normalization['sourceLabel']=='Main Rapper' and normalization['adoptedLabel'] in roleNames
   after={'roleLabels':['主唱',normalization['adoptedLabel']]}
  sourcesIds=list(r['sourceIds'])
  for url in review.get('sourceUrls',[]):sourcesIds.extend(source_url(url,rid))
  isOverlay=review['file']=='member_display_overlay.json';b=members[mid]
  c={'id':rid,'kind':'display_overlay' if isOverlay else 'member_patch','memberId':mid,'groupIds':r['groupIds'],'field':r['field'],'targetField':r.get('targetField',r['field']),'decision':decision,'after':after,'sourceIds':sorted(set(sourcesIds)),'beforePublicHash':r['beforePublicHash'],'profileExcerptOnly':bool(b.get('profileExcerptOnly')),'expectedGroupIds':sorted(b['currentGroupIds']+b['formerGroupIds']),'expectedCurrentGroupIds':sorted(b['currentGroupIds']),'expectedFormerGroupIds':sorted(b['formerGroupIds']), 'applicationState':'skip' if decision=='skip_no_change' else 'requires_current_target_review' if isOverlay else 'requires_fresh_guard'}
  if not isOverlay:
   assert not(b.get('profileExcerptOnly') and r['field']=='profile')
   c['beforeValueHash']=digest(r['before'])
  if r['field']=='role':
   labels=after if isinstance(after,list) else after.get('roleLabels');assert isinstance(labels,list)
   c['beforeRoleValueHash']=digest(live[mid].get(FIELD_IDS['role']));c['roleLabels']=labels;c['unknownRoleLabels']=[x for x in labels if x not in roleNames]
   if c['unknownRoleLabels']:c['applicationState']='blocked_unknown_role_option'
  claims.append(c)
  ledger.append({'id':rid,'inputFile':review['file'],'inputIndex':review['index'],'decision':decision,'originalClaimHash':digest(r),'originalAfter':r['after'],'adoptedAfter':None if decision=='skip_no_change' else after,'adoptedClaimHash':digest(c),'originalStatus':r['status'],'schemaNormalization':normalization})
 periods=[]; endpointIds=set()
 pr={r['periodId']:r for r in periodsReview['records']}
 allowed=['periodId','memberId','groupId','displayName','relationType','startDate','startPrecision','endDate','endPrecision','announcedDate','effectiveDate','statusAsOf','statusLabelZh','summaryZh','sourceIds','startDateBasis','endDateBasis']
 for original in load('extracted/member_periods.json')['records']:
  rid=original['periodId'];review=pr[rid];changes=review['proposedFieldChanges'];r={k:original.get(k) for k in allowed};assert set(changes)<=set(allowed)
  r.update(changes);r['decision']={'accept_semantics':'accepted','needs_fix':'accepted_with_revision','retain_hold':'hold'}[review['verdict']];r['applicationState']='hold' if r['decision']=='hold' else 'research_only'
  if changes.get('endDateBasis')=='unknown':
   endpointIds.add(rid);assert r['endDate'] is None and r['effectiveDate'] is None
   for source in sources.values():
    for support in source.get('supports',[]):
     if support.get('recordId')==rid:
      support['fields']=[f for f in support.get('fields',[]) if f not in ['endDate','endPrecision','effectiveDate','endDateBasis']]
      support['supportBoundaryZh']='团体活动结束仅支持公告/职业事件叙述，不证明个人团籍或经纪合同终点。'
  evidence=review.get('freshEvidence')
  if evidence:
   for sid in source_url(evidence['url'],rid):
    if sid not in r['sourceIds']:r['sourceIds'].append(sid)
    if evidence.get('shortQuote'):
     e={'excerpt':evidence['shortQuote'],'locator':evidence['locator'],'evidenceType':'reviewed_short_quote','origin':'independent_period_semantic_review','scope':evidence.get('boundary','')}
     if e not in sources[sid].setdefault('evidence',[]):sources[sid]['evidence'].append(e)
  periods.append(r)
  ledger.append({'id':rid,'inputFile':'member_periods.json','decision':r['decision'],'originalClaimHash':digest(original),'originalFields':{k:original.get(k) for k in changes},'adoptedFields':changes,'adoptedClaimHash':digest(r),'originalStatus':original['status']})
 assert len(endpointIds)==13
 candidates=[]
 for r in load('extracted/unmapped_version_rosters.json')['records']:
  c={k:r[k] for k in ['candidateId','groupId','workTitle','version','officialVideoUrl','videoId','participationType','memberIds','memberEvidence','sourceIds']};c['applicationState']='unmapped_candidate_only';assert 'workId' not in c;candidates.append(c)
 checks=[]
 for mid,b in members.items():
  fields=live.get(mid);public=project(fields) if fields else None
  checks.append({'memberId':mid,'expectedBeforePublicHash':b['beforePublicHash'],'observedBeforePublicHash':digest(public) if public else None,'matches':public is not None and digest(public)==b['beforePublicHash'],'profileExcerptOnly':bool(b.get('profileExcerptOnly'))})
 # Source index is metadata + narrowly reviewed career evidence only. No page bodies or private export values.
 sourceFields=['sourceId','url','publisher','title','publishedAt','publishedPrecision','accessedAt','language','evidence','limitations','supports','origin']
 index=[{k:s[k] for k in sourceFields if k in s} for s in sources.values()]
 allIds=[c['id'] for c in claims]+[p['periodId'] for p in periods]+[c['candidateId'] for c in candidates];assert len(set(allIds))==len(allIds)
 assert all(sid in sources for r in claims+periods+candidates for sid in r['sourceIds'])
 result={'schemaVersion':1,'baseCommit':'a3e3be4','researchCutoff':'2026-10-16','scope':'offline_research_only_no_runtime_import','memberClaims':claims,'memberPeriods':periods,'unmappedVersionCandidates':candidates,'newMembers':[]}
 stats={'fieldDecisions':dict(collections.Counter(c['decision'] for c in claims)),'periodDecisions':dict(collections.Counter(p['decision'] for p in periods)),'patches':sum(c['kind']=='member_patch' for c in claims),'overlays':sum(c['kind']=='display_overlay' for c in claims),'excerptOnlyBaselineMembers':sum(c['profileExcerptOnly'] for c in checks),'excerptOnlyOverlays':sum(c['kind']=='display_overlay' and c['profileExcerptOnly'] for c in claims),'activityEndNotMembershipEnd':len(endpointIds),'newMembers':0,'unmappedVersionCandidates':len(candidates),'uniqueStableIds':len(allIds),'duplicateStableIds':len(allIds)-len(set(allIds)),'sourceCount':len(index),'publicHashMatches':sum(c['matches'] for c in checks),'publicHashMismatches':sum(not c['matches'] for c in checks),'schemaNormalizedRoleClaims':len(normalizations),'unknownRoleClaims':sum(bool(c.get('unknownRoleLabels')) for c in claims),'originalHolds':[{'id':l['id'],'adoptedDecision':l['decision']} for l in ledger if l['originalStatus']=='hold']}
 out.mkdir(parents=True,exist_ok=True)
 def save(name,v):(out/name).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 save('canonical.json',result);save('source-index.json',{'sources':index});save('adoption-ledger.json',{'records':ledger});save('statistics.fixture.json',stats)
 save('baseline-guard.fixture.json',{'capturedAt':exportData['capturedAt'],'isLiveAuthorization':False,'roleOptions':[{'id':r['id'],'name':r['name']} for r in roleOptions],'members':checks})
 save('input-lock.json',{'sha256':originals,'exportSha256':hashlib.sha256(export.read_bytes()).hexdigest(),'exportCapturedAt':exportData['capturedAt'],'sourceSupplementSha256':hashlib.sha256((pathlib.Path(__file__).parent/'source-supplements.json').read_bytes()).hexdigest()})
 assert originals=={str(f.relative_to(package)):hashlib.sha256(f.read_bytes()).hexdigest() for f in package.rglob('*.json')},'Input modified'
 print(json.dumps(stats,ensure_ascii=False,indent=2))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--package',type=pathlib.Path,required=True);p.add_argument('--export',type=pathlib.Path,required=True);p.add_argument('--out',type=pathlib.Path,default=pathlib.Path(__file__).parent/'data');a=p.parse_args();build(a.package,a.export,a.out)
