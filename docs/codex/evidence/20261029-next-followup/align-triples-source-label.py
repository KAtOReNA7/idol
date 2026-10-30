"""Correct the reviewed source-count label, preserving receipt and exact guard."""
import hashlib,json
from pathlib import Path
HERE=Path(__file__).resolve().parent
APP=HERE.parents[3]/'apps/idol-site'
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
r=load(HERE/'triples-adoption.json');p=APP/'data/group-statistics-completion-evidence.json';d=load(p)
assert sha(p)==r['afterFileSha256'] and d['groups']['triples']['sales']==r['after']
s=d['groups']['triples']['sales'];assert '11条' in s['sourceTitle'];s['sourceTitle']=s['sourceTitle'].replace('11条','13条');write(p,d)
gp=APP/'scripts/udtt-private-build-assets-manifest.json';g=load(gp)
assert g['runtimeGuards']['data/group-statistics-completion-evidence.json']==r['guardChange']['after']
newguard={'bytes':p.stat().st_size,'sha256':sha(p)};g['runtimeGuards']['data/group-statistics-completion-evidence.json']=newguard;write(gp,g)
r['after']=s;r['afterFileSha256']=sha(p);r['guardChange'].update(after=newguard,afterFileSha256=sha(gp));write(HERE/'triples-adoption.json',r)
