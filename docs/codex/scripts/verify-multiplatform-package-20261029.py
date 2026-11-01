"""Verify the exact published source and archive without private writes."""
import argparse,datetime,gzip,hashlib,json,pathlib,subprocess,tarfile
p=argparse.ArgumentParser();p.add_argument('--github',required=True);p.add_argument('--source',required=True);p.add_argument('--checkout',required=True);p.add_argument('--archive',required=True);a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[3];src=pathlib.Path(a.checkout);archive=pathlib.Path(a.archive);out=root/'docs/codex/evidence/20261029-multiplatform'
oldgithub='7cfba28a24b260163f4c5f7eb55c87a28da731d8';oldsource='374ebe6de70a2e51641361740dde68246aed8b1c'
def git(repo,*args):return subprocess.check_output(['git',*args],cwd=repo)
def sha(b):return hashlib.sha256(b).hexdigest()
def tree(repo,ref,prefix=''):
 result={}
 for row in git(repo,'ls-tree','-r',ref).decode().splitlines():
  info,f=row.split('\t',1)
  if f.startswith(prefix):result[f[len(prefix):]]=info.split()[2]
 return result
assert git(src,'rev-parse','HEAD').decode().strip()==a.source
assert not git(src,'status','--porcelain').strip()
gt=tree(root,a.github,'apps/idol-site/');st=tree(src,a.source);og=tree(root,oldgithub,'apps/idol-site/');os=tree(src,oldsource)
common=set(gt)&set(st);differences=sorted(f for f in common if gt[f]!=st[f]);oldDifferences=sorted(f for f in set(og)&set(os) if og[f]!=os[f]);assert differences==oldDifferences
assert all(gt[f]==og[f] and st[f]==os[f] for f in differences)
changed=sorted(f for f in gt if gt[f]!=og.get(f));sitechanged=sorted(f for f in st if st[f]!=os.get(f));assert changed==sitechanged,(changed,sitechanged)
assert all(gt[f]==st[f] for f in changed)
protected=[f for f in st if f.startswith(('app/api/','drizzle/')) or f.endswith('.css') or f in ['.openai/hosting.json','data/snapshot.json','data/mv-public-media.json','data/mv-member-appearance.json']]
assert all(st[f]==os[f] for f in protected)
manifest=json.loads((src/'data/production-asset-delivery.json').read_bytes());assert (src/'data/production-asset-delivery.json').read_bytes()==git(src,'show',oldsource+':data/production-asset-delivery.json')
local=[r for r in manifest['assets'] if r['delivery']=='local'];remote=[r for r in manifest['assets'] if r['delivery']=='remote'];assert len(local)==578 and len(remote)==5418
assert set(gt)-set(st)<={'public'+r['path'] for r in remote}
policy=json.loads((src/'scripts/udtt-private-build-assets-manifest.json').read_bytes());oldpolicy=json.loads(git(src,'show',oldsource+':scripts/udtt-private-build-assets-manifest.json'));assert policy['files']==oldpolicy['files'] and policy['builtContractCarriers']==oldpolicy['builtContractCarriers'];assert len(policy['runtimeGuards'])==42
for f,pin in policy['runtimeGuards'].items():
 b=(src/f).read_bytes();assert pin=={'bytes':len(b),'sha256':sha(b)},f
restricted=[x['path'] for x in policy['files']]+['/artist/udtt/batch-b-20261016/group.display.jpg']
hosting=json.loads((src/'.openai/hosting.json').read_bytes());assert hosting=={'d1':'DB','r2':'BUCKET','project_id':'appgprj_6acb4fa532b88191ae2588c24b724b17','capabilities':['mcp']}
with tarfile.open(archive) as tar:
 members=tar.getmembers();assert all((m.isfile() or m.isdir()) and not pathlib.PurePosixPath(m.name).is_absolute() and '..' not in pathlib.PurePosixPath(m.name).parts for m in members)
 files={m.name:m for m in members if m.isfile()};assert len(files)==sum(m.isfile() for m in members)
 dist={p.relative_to(src).as_posix() for p in (src/'dist').rglob('*') if p.is_file()};assert set(files)==dist
 for name,m in files.items():assert tar.extractfile(m).read()==(src/name).read_bytes(),name
 for row in local:
  b=tar.extractfile(files['dist/client'+row['path']]).read();assert len(b)==row['bytes'] and sha(b)==row['sha256'],row['path']
 for row in remote:assert 'dist/client'+row['path'] not in files
 for path in restricted:assert 'dist/client'+path not in files
 assert json.loads(tar.extractfile(files['dist/.openai/hosting.json']).read())==hosting
 migrations=[]
 for path in (src/'drizzle').rglob('*'):
  if path.is_file():
   name=path.relative_to(src).as_posix();assert path.read_bytes()==git(src,'show',oldsource+':'+name);assert tar.extractfile(files['dist/.openai/'+name]).read()==path.read_bytes();migrations.append(name)
 assert len(migrations)==23
 posters=json.loads((src/'data/stage-selection-posters-20261027.json').read_bytes())['entries'];assert len(posters)==28;packaged=0
 for row in posters:
  name='dist/client'+row['src']
  if name in files:assert sha(tar.extractfile(files[name]).read())==row['sha256'];packaged+=1
  else:assert any(x['path']==row['src'] and x['delivery']=='remote' for x in remote)
 assert packaged==24
 wrangler=json.loads(tar.extractfile(files['dist/server/wrangler.json']).read());assert wrangler['d1_databases'][0]['binding']=='DB' and wrangler['r2_buckets'][0]['binding']=='BUCKET'
stages=json.loads((src/'data/stage-videos.json').read_bytes());assert len(stages)==497
result={'status':'passed','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'githubImplementation':a.github,'sitesSource':a.source,'archiveSha256':sha(archive.read_bytes()),'archiveBytes':archive.stat().st_size,'files':len(files),'allArchiveBytesMatchBuild':True,'allChangedSourcesMatchGithub':True,'changedFiles':changed,'historicalSourceDifferencesPreserved':differences,'sourceFilesMatch':len(common)-len(differences),'protectedSourceFiles':len(protected),'localOriginals':len(local),'remoteOriginalsExcluded':len(remote),'restrictedCopiesExcluded':len(restricted),'runtimeGuardsExact':42,'unchangedMigrationFiles':len(migrations),'stageSources':497,'stagePosters':28,'packagedStagePosters':packaged,'limitations':['No private writes or full personal-value hash audit.','No new browser layout or full-video playback verification.']}
(out/'release-package-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n');print(json.dumps({k:v for k,v in result.items() if k not in ['changedFiles','historicalSourceDifferencesPreserved']},ensure_ascii=False))
