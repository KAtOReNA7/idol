"""Verify the v201 source/archive without network calls or private reads.

Requires the separately opened Sites Git checkout and unchanged deployment archive.
Read-only except for the public package verification receipt.
"""
import argparse, datetime, gzip, hashlib, json, pathlib, subprocess, tarfile

p=argparse.ArgumentParser()
p.add_argument('--github', required=True)
p.add_argument('--checkout', help='Sites source checkout; defaults to this task local checkout')
p.add_argument('--source', required=True)
p.add_argument('--archive', required=True)
a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[3]
src=pathlib.Path(a.checkout).resolve() if a.checkout else root/'.codex-local/formal-statistics-relations-20261027'
base='aac36bd631ee1a84780fa1dbfb404561bba32dcf'
oldsrc='e27a7adf04140b130cd1d10568100c13f6258bde'
out=root/'docs/codex/evidence/20261028-post-v200'
def git(where,*args): return subprocess.check_output(['git',*args],cwd=where)
def digest(b): return hashlib.sha256(b).hexdigest()
def tree(where,ref,prefix=''):
    result={}
    for line in git(where,'ls-tree','-r',ref).decode().splitlines():
        info,name=line.split('\t',1)
        if name.startswith(prefix): result[name[len(prefix):]]=info.split()[2]
    return result
assert git(src,'rev-parse','HEAD').decode().strip()==a.source
assert not git(src,'status','--porcelain').strip()
gt=tree(root,a.github,'apps/idol-site/'); st=tree(src,a.source)
oldgt=tree(root,base,'apps/idol-site/'); oldst=tree(src,oldsrc)
common=set(gt)&set(st)
diff=sorted(f for f in common if gt[f]!=st[f])
olddiff=sorted(f for f in set(oldgt)&set(oldst) if oldgt[f]!=oldst[f])
assert diff==olddiff, diff
assert all(gt[f]==oldgt[f] and st[f]==oldst[f] for f in diff)
changed=git(root,'diff','--name-only',base,a.github,'--','apps/idol-site').decode().splitlines()
changed=[f[len('apps/idol-site/'):] for f in changed]
sitechanged=git(src,'diff','--name-only',oldsrc,a.source).decode().splitlines()
assert sorted(changed)==sorted(sitechanged),(changed,sitechanged)
for f in changed: assert gt[f]==st[f],f
manifest=json.loads((src/'data/production-asset-delivery.json').read_bytes())
assert (src/'data/production-asset-delivery.json').read_bytes()==git(src,'show',oldsrc+':data/production-asset-delivery.json')
assert manifest['publicRef']=='b8eac29b77eebf12103f0f5174d41c73744a3ba3'
local=[r for r in manifest['assets'] if r['delivery']=='local']
remote=[r for r in manifest['assets'] if r['delivery']=='remote']
assert len(local)==578 and len(remote)==5418
missing=sorted(set(gt)-set(st))
remotepaths={'public'+r['path'] for r in remote}
assert all(f in remotepaths for f in missing),[f for f in missing if f not in remotepaths]
protected=[f for f in st if f.startswith(('app/api/','drizzle/')) or f.endswith('.css') or f in ['.openai/hosting.json','data/mv-public-media.json','data/mv-member-appearance.json']]
for f in protected: assert st[f]==oldst[f],f
policy=json.loads((src/'scripts/udtt-private-build-assets-manifest.json').read_bytes())
oldpolicy=json.loads(git(src,'show',oldsrc+':scripts/udtt-private-build-assets-manifest.json'))
assert policy['files']==oldpolicy['files'] and policy['builtContractCarriers']==oldpolicy['builtContractCarriers']
assert len(policy['runtimeGuards'])==42
for name,pin in oldpolicy['runtimeGuards'].items():
    if name not in ['lib/idol/udtt-native/host.mjs','data/timeline-reported-records.json']: assert pin==policy['runtimeGuards'][name],name
timeline=json.loads((src/'data/timeline-reported-records.json').read_bytes())
oldtimeline=json.loads(git(src,'show',oldsrc+':data/timeline-reported-records.json'))
change=json.loads((out/'statistics/udtt-source-adoption.json').read_bytes())
assert change['canonicalEffectiveDateChanged'] is False and change['identityChanged'] is False
def replace_event(value):
    if isinstance(value,list): return [replace_event(x) for x in value]
    if isinstance(value,dict):
        if value.get('eventId')==change['after']['eventId']:
            assert value==change['after']; return change['expectedBefore']
        return {k:replace_event(v) for k,v in value.items()}
    return value
assert replace_event(timeline)==oldtimeline
for f,pin in policy['runtimeGuards'].items():
    b=(src/f).read_bytes(); assert pin=={'bytes':len(b),'sha256':digest(b)},f
restricted=[r['path'] for r in policy['files']]+['/artist/udtt/batch-b-20261016/group.display.jpg']
hosting=json.loads((src/'.openai/hosting.json').read_bytes())
assert hosting=={'d1':'DB','r2':'BUCKET','project_id':'appgprj_6acb4fa532b88191ae2588c24b724b17','capabilities':['mcp']}
archive=pathlib.Path(a.archive)
checked=[]
with tarfile.open(archive) as tar:
    members=tar.getmembers()
    for m in members:
        assert m.isfile() or m.isdir()
        assert not pathlib.PurePosixPath(m.name).is_absolute() and '..' not in pathlib.PurePosixPath(m.name).parts
    files={m.name:m for m in members if m.isfile()}
    assert len(files)==sum(m.isfile() for m in members)
    dist={f.relative_to(src).as_posix() for f in (src/'dist').rglob('*') if f.is_file()}
    assert set(files)==dist,(sorted(set(files)-dist),sorted(dist-set(files)))
    for name,m in files.items():
        b=tar.extractfile(m).read(); assert b==(src/name).read_bytes(),name
        checked.append({'path':name,'bytes':len(b),'sha256':digest(b)})
    for r in local:
        b=tar.extractfile(files['dist/client'+r['path']]).read()
        assert len(b)==r['bytes'] and digest(b)==r['sha256']
    for r in remote: assert 'dist/client'+r['path'] not in files
    for name in restricted: assert 'dist/client'+name not in files
    assert json.loads(tar.extractfile(files['dist/.openai/hosting.json']).read())==hosting
    migrations=[]
    for f in (src/'drizzle').rglob('*'):
        if f.is_file():
            name=f.relative_to(src).as_posix(); b=f.read_bytes()
            assert b==git(src,'show',oldsrc+':'+name)
            assert tar.extractfile(files['dist/.openai/'+name]).read()==b
            migrations.append(name)
    assert len(migrations)==23
    wrangler=json.loads(tar.extractfile(files['dist/server/wrangler.json']).read())
    assert wrangler['d1_databases'][0]['binding']=='DB' and wrangler['r2_buckets'][0]['binding']=='BUCKET'
    posters=json.loads((src/'data/stage-selection-posters-20261027.json').read_bytes())
    posterrows=posters.get('entries',posters.get('records',[]))
    assert len(posterrows)==27
    localposters=0
    for r in posterrows:
        name=r.get('path',r.get('src'))
        if 'dist/client'+name in files:
            b=tar.extractfile(files['dist/client'+name]).read()
            assert digest(b)==r['sha256']; localposters+=1
        else: assert any(x['path']==name and x['delivery']=='remote' for x in remote)
    assert localposters==23
result={'status':'passed','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'githubImplementation':a.github,'sitesSource':a.source,'archive':str(archive),'archiveSha256':digest(archive.read_bytes()),'archiveBytes':archive.stat().st_size,'expandedTarBytes':len(gzip.decompress(archive.read_bytes())) if archive.read_bytes()[:2]==b'\x1f\x8b' else archive.stat().st_size,'files':len(files),'allArchiveBytesMatchBuild':True,'sourceFilesMatch':len(common)-len(diff),'historicalSourceDifferences':diff,'remoteOriginalsAbsentFromSource':len(missing),'localOriginals':len(local),'remoteOriginalsExcluded':len(remote),'restrictedCopiesExcluded':len(restricted),'migrationFiles':len(migrations),'stagePosters':27,'packagedPosters':23,'protectedSourceFiles':len(protected),'all42RuntimeGuardsExact':True,'changedSourceFiles':changed,'fileHashes':checked,'limitations':['No visual browser QA or private save. No repeated downloading of the unchanged full remote asset inventory.']}
out.mkdir(parents=True,exist_ok=True)
(out/'release-package-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps({k:v for k,v in result.items() if k not in ['fileHashes','changedSourceFiles']},ensure_ascii=False))
