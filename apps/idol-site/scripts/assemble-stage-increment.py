"""Validate an immutable research manifest; write proposal files only to supplied output folder.
No metadata merge, network, credential, Feishu write, or publication occurs here.
"""
import json,pathlib,sys,hashlib
manifest=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);m=json.loads(manifest.read_text());formal={};alt={};leads={};inputs=[]
for f in m['files']:
 p=pathlib.Path(f['path']);raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()==f['sha256'],f'Changed frozen research file {p.name}'
 d=json.loads(raw);items={i['recordId']:i for i in d['items']};inputs.append({'file':p.name,'sha256':f['sha256']})
 for rid in f.get('formalRecordIds',[]):
  if rid not in m['formalRecordIds']:continue # Final manifest explicitly supersedes a provisional classification.
  i=items[rid]
  if rid in formal:
   assert formal[rid]['selected']['videoId']==i['selected']['videoId'],f'Conflicting formal selection {rid}'
   if f.get('operation')=='replace_existing_item_research_metadata_same_binding':
    assert formal[rid]['selected'].get('clip')==i['selected'].get('clip'),f'Metadata-only patch changed clip scope {rid}'
    formal[rid]=i
   continue # Only an explicit metadata-only same-binding patch supersedes earlier evidence.
  formal[rid]=i
 for rid in f.get('alternativeRecordIds',[]):
  i=items[rid]
  if rid in alt:assert i.get('patchOperation')=='replaceAlternativeObjectOnly',f'Ambiguous alternative replacement {rid}'
  alt[rid]=i
 for rid in f.get('watchLeadRecordIds',[]):
  assert rid not in leads,f'Duplicate unresolved viewing lead {rid}'
  leads[rid]=items[rid]
assert set(leads)==set(m.get('watchLeadRecordIds',[])) and not(set(leads)&(set(formal)|set(alt)))
assert set(formal)==set(m['formalRecordIds']);assert set(alt)==set(m.get('viewOnlyAlternativeRecordIds',m.get('alternativeRecordIds',[])));assert not(set(formal)&set(alt))
out.mkdir(parents=True,exist_ok=True)
base={'checkedAt':m['lockedAt'],'manifestSha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'reviewedInputs':inputs}
for name,data in [('formal-reviewed.json',formal),('alternatives-reviewed.json',alt),('watch-leads-reviewed.json',leads)]:
 (out/name).write_text(json.dumps({**base,'items':list(data.values())},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'formal':len(formal),'alternatives':len(alt),'watchLeads':len(leads),'manifest':manifest.name}))
