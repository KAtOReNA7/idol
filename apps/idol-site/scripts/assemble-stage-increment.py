"""Validate an immutable research manifest; write proposal files only to supplied output folder.
No metadata merge, network, credential, Feishu write, or publication occurs here.
"""
import json,pathlib,sys,hashlib
from stage_source_identity import require_stage

manifest=pathlib.Path(sys.argv[1])
out=pathlib.Path(sys.argv[2])
manifest_bytes=manifest.read_bytes()
m=json.loads(manifest_bytes)
formal={};alt={};leads={};inputs=[]
for f in m['files']:
 p=pathlib.Path(f['path'])
 raw=p.read_bytes()
 require_stage(hashlib.sha256(raw).hexdigest()==f['sha256'],f'Changed frozen research file {p.name}')
 d=json.loads(raw)
 items={i['recordId']:i for i in d['items']}
 require_stage(len(items)==len(d['items']),f'Duplicate record in research file {p.name}')
 inputs.append({'file':p.name,'sha256':f['sha256']})
 for rid in f.get('formalRecordIds',[]):
  if rid not in m['formalRecordIds']:continue # Final manifest explicitly supersedes a provisional classification.
  i=items[rid]
  if rid in formal:
   old=formal[rid]['selected']
   new=i['selected']
   require_stage(old['videoId']==new['videoId'],f'Conflicting formal selection {rid}')
   if f.get('operation')=='replace_existing_item_research_metadata_same_binding':
    require_stage(old.get('clip')==new.get('clip'),f'Metadata-only patch changed clip scope {rid}')
    require_stage(old.get('platform','youtube')==new.get('platform','youtube') and
                  old.get('bilibili')==new.get('bilibili') and old.get('xMedia')==new.get('xMedia'),
                  f'Metadata-only patch changed media identity {rid}')
    formal[rid]=i
   continue # Only an explicit metadata-only same-binding patch supersedes earlier evidence.
  formal[rid]=i
 for rid in f.get('alternativeRecordIds',[]):
  i=items[rid]
  if rid in alt:
   require_stage(i.get('patchOperation')=='replaceAlternativeObjectOnly',f'Ambiguous alternative replacement {rid}')
  alt[rid]=i
 for rid in f.get('watchLeadRecordIds',[]):
  require_stage(rid not in leads,f'Duplicate unresolved viewing lead {rid}')
  leads[rid]=items[rid]
require_stage(set(leads)==set(m.get('watchLeadRecordIds',[])) and not(set(leads)&(set(formal)|set(alt))), 'Viewing leads differ from the manifest')
require_stage(set(formal)==set(m['formalRecordIds']), 'Formal sources differ from the manifest')
require_stage(set(alt)==set(m.get('viewOnlyAlternativeRecordIds',m.get('alternativeRecordIds',[]))), 'Alternatives differ from the manifest')
require_stage(not(set(formal)&set(alt)), 'Formal sources overlap with alternatives')
out.mkdir(parents=True,exist_ok=True)
base={'checkedAt':m['lockedAt'],'manifestSha256':hashlib.sha256(manifest_bytes).hexdigest(),'reviewedInputs':inputs}
for name,data in [('formal-reviewed.json',formal),('alternatives-reviewed.json',alt),('watch-leads-reviewed.json',leads)]:
 (out/name).write_bytes((json.dumps({**base,'items':list(data.values())},ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps({'formal':len(formal),'alternatives':len(alt),'watchLeads':len(leads),'manifest':manifest.name}))
