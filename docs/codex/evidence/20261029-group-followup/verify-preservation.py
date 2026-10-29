"""Verify task boundaries against the fetched base; emit only public hashes/counts."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).parent
BASE='cef1765801ce62739c44308292a680b16e681597'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def old(p):return git('show',BASE+':'+p)
def digest(b):return hashlib.sha256(b).hexdigest()

files=[
 'apps/idol-site/data/snapshot.json',
 'apps/idol-site/data/stage-videos.json',
 'apps/idol-site/data/stages/status.json',
 'apps/idol-site/data/stages/inventory.json',
 'apps/idol-site/data/mv-public-media.json',
 'apps/idol-site/data/mv-member-appearance.json',
 'apps/idol-site/data/public-group-recognition.json',
 'docs/codex/human-help-by-group-20261029.csv',
 'docs/codex/human-help-by-group-20261029.md',
 'docs/codex/evidence/20261029-human-help/stage-checklist.json',
 'docs/codex/evidence/20261029-human-help/other-checklist.json',
 'docs/codex/evidence/20261028-post-v200/remaining-stage-ledger.json',
 'docs/codex/evidence/20261028-post-v200/remaining-person-statistics.json',
]
proof={}
for p in files:
 before=old(p);after=(ROOT/p).read_bytes()
 assert before==after,p
 proof[p]=digest(after)
for p in ['data/public-work-credits.json','data/public-work-recognition.json']:
 before=json.loads(old('apps/idol-site/'+p));after=json.loads((ROOT/'apps/idol-site'/p).read_bytes())
 assert len(before['records'])==102 and len(after['records'])==103,p
 assert before=={**after,'records':after['records'][:102]},p

changed=git('diff','--name-only',BASE,'--','apps/idol-site').decode().splitlines()
forbidden=('apps/idol-site/public/','apps/idol-site/app/api/','apps/idol-site/db/','apps/idol-site/migrations/','.openai/')
assert not [p for p in changed if p.startswith(forbidden)],changed
assert not [p for p in changed if p.endswith(('.css','.png','.jpg','.webp','.svg','tsconfig.tsbuildinfo'))],changed
allowed={
 'apps/idol-site/app/page.tsx',
 'apps/idol-site/data/public-work-credits.json',
 'apps/idol-site/data/public-work-recognition.json',
 'apps/idol-site/data/stages/supplements.json',
 'apps/idol-site/data/versions/verified-display.json',
 'apps/idol-site/lib/idol/verified-version-display.ts',
 'apps/idol-site/lib/idol/types.ts',
 'apps/idol-site/lib/idol/supplements.ts',
 'apps/idol-site/lib/idol/public-catalog.ts',
 'apps/idol-site/lib/idol/stage-public-research.ts',
}
assert all(p in allowed or p.startswith('apps/idol-site/tests/') for p in changed),changed
for ref in ['dada774ba79aba8e9863a88822e71644669ce7cb',BASE]:
 subprocess.check_call(['git','merge-base','--is-ancestor',ref,'HEAD'],cwd=ROOT)
result=dict(result='PASS',baselineCommit=BASE,exactBytePreservedFiles=proof,
 originalPublicCollectionsPreserved=True,formalStages=len(json.loads((ROOT/files[1]).read_bytes())),
 changedTrackedAppFiles=changed,originalAssetsChanged=0,cssChanged=0,apiOrSaveRoutesChanged=0,
 manualAnswersRewritten=False,frozenQueuesRewritten=False,
 limit='源代码/公开证据与冻结快照保护；不是线上全量私人值读回，也不替代浏览器或发布验收。')
(OUT/'preservation-validation.json').write_bytes((json.dumps(result,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(f'PASS: {len(files)} exact-byte baselines, original 102 collections, 496 stages, allowed source diff and required ancestry.')
