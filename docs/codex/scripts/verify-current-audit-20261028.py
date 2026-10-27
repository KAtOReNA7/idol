"""Validate saved public-only audit inputs; no network, application edits or imports."""
import collections
import datetime
import hashlib
import json
import pathlib
import subprocess
from urllib.parse import parse_qs, urlparse

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'docs/codex/evidence/20261028-current-audit'
DATA = ROOT / 'apps/idol-site/data'
inputs = []

def read(path):
    inputs.append(path)
    return json.loads(path.read_text(encoding='utf-8'))

def video(url):
    p = urlparse(url or '')
    return p.path.strip('/') if p.netloc == 'youtu.be' else parse_qs(p.query).get('v', [''])[0]

catalog = read(OUT / 'catalog-audit-projection.json')
people = read(OUT / 'work-members.json')
stats = read(OUT / 'statistics.json')
stages = read(OUT / 'stages-timeline.json')
media = read(DATA / 'mv-public-media.json')
credits = read(DATA / 'public-work-credits.json')['records']
portraits = read(DATA / 'public-work-recognition.json')['records']
absence = read(DATA / 'mv-member-appearance.json')['entries']
metrics = read(DATA / 'group-statistics-completion-evidence.json')['groups']
release = read(OUT / 'publication-repository-verification.json')
works = {r['id']: r for r in catalog['works']}
members = {r['id']: r for r in catalog['members']}
groups = {r['id']: r for r in catalog['groups']}
assert len(works) == len(catalog['works']) == 614
assert len(members) == len(catalog['members']) == 338
assert len(groups) == len(catalog['groups']) == 51
named = {k: v for k, v in works.items() if not v['placeholder']}
tuples = []
native = set()
for r in catalog['relations']:
    if not r['workIds'] and not r['memberIds']:
        continue
    assert len(r['workIds']) == len(r['memberIds']) == 1
    pair = (r['workIds'][0], r['memberIds'][0])
    assert pair[0] in works and pair[1] in members
    tuples.append(pair)
    if r['nativePhotoPresent']:
        native.add(pair)
assert len(tuples) == len(set(tuples)) == 2840
assert len(catalog['relations']) - len(tuples) == 5
for r in [*works.values(), *members.values()]:
    assert set(r.get('groupIds') or []) | set(r.get('formerGroupIds') or []) <= groups.keys()
public = {(r['workId'], r['memberId']) for r in media['portraits']
          if r['workId'] in works and r['videoId'] == video(works[r['workId']]['url'])}
assert len(public & set(tuples)) == 2828
assert len(set(tuples) - public) == 12
assert not set(tuples) - public - native
cover = {(r.get('workId'), r['videoId']) for r in media['covers']}
assert len(cover) == 628
assert all((k, video(w['url'])) in cover for k, w in named.items())
assert all(w.get(field) for w in named.values() for field in ('releaseDate', 'officialTitle', 'channel'))
bound = {w for w, m in tuples}
unbound = set(named) - bound
cids = {r['workId'] for r in credits}
aids = {r['workId'] for r in absence}
remaining = {r['workId'] for r in people['remainingWorks']}
assert len(cids) == len(credits) == 42 and len(aids) == 6
assert cids & aids == {'recvxyH5pzr7Nc'}
assert unbound == cids | aids | remaining and len(unbound) == 131
assert not remaining & (cids | aids) and len(remaining) == 84
for r in credits + absence + portraits:
    assert r['videoId'] == video(works[r['workId']]['url'])
assert collections.Counter(r['materialCategory'] for r in people['remainingWorks']) == people['classificationCounts']
assert sum(len(r['portraits']) for r in portraits) == 263
assert len({p['src'] for r in portraits for p in r['portraits']}) == 123
unknown = set()
for slug, row in metrics.items():
    unknown.update((slug, x['platform']) for x in row['social'] if x.get('accountExists') and x.get('observedValue') is None)
    unknown.update((slug, f) for f in ('sales', 'wins') if row[f].get('observedValue') is None)
assert unknown == {tuple(r['key'].split('.', 1)) for r in stats['unknown']}
assert len(unknown) == 17
stage_missing = {k for k, w in named.items() if not w['stagePresent']}
assert stage_missing == {r['workId'] for r in stages['records']} and len(stage_missing) == 123
assert collections.Counter(r['auditRoute'] for r in stages['records']) == stages['counts']['actionableAuditRoutes']
assert sum(w['stagePresent'] for w in named.values()) == 482
holds = {e['id'] for p in sorted((DATA / 'artist-timelines').glob('*.json'))
         for e in read(p)['events'] if e['reviewStatus'] == 'hold'}
assert holds == {r['eventId'] for r in stages['timeline']} and len(holds) == 7
assert all(r['reportedDisplayComplete'] and r['actualEventDate'] is None for r in stages['timeline'])
forbidden = {'score', 'stageScore', 'stylingScore', 'note', 'memory', 'watched', 'favorite'}
def check_safe(value):
    if isinstance(value, dict):
        assert not set(value) & forbidden
        for v in value.values(): check_safe(v)
    elif isinstance(value, list):
        for v in value: check_safe(v)
check_safe(catalog)
assert release['site']['version'] == 196 and release['site']['deploymentStatus'] == 'succeeded'
assert not subprocess.check_output(['git', 'diff', '--name-only', 'ec13cce54daf3df0274f0fc1e9f86b17da554be7', '--', 'apps/idol-site'], cwd=ROOT).strip()
summary = {'status': 'passed', 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'siteVersion': 196, 'namedWorks': len(named), 'validRelations': len(tuples),
           'relationImageGaps': 0, 'namedWorkMetadataGaps': 0, 'namedWorkCoverGaps': 0,
           'memberMissingFields': {f: sum(not r[f + 'Present'] for r in members.values()) for f in ('profile', 'birthDate', 'photo', 'officialUrl')},
           'unknownStatistics': 17, 'salesDifference': 1, 'unprovenWorks': 84, 'unmatchedStages': 123,
           'timelineFactHolds': 7, 'workPlaceholders': 9, 'emptyRelations': 5,
           'applicationUnchangedSincePublishedImplementation': True, 'projectionExcludesPrivateValues': True,
           'limits': ['Structural coverage, not a new full image HTTP/visual scan.', 'Categories overlap; do not add issue dimensions.', 'Candidate sources are not applied.', 'No actual private save or full-video playback performed.'],
           'inputs': [{'path': str(p.relative_to(ROOT)).replace('\\', '/'), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in inputs]}
(OUT / 'verification.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps({k: v for k, v in summary.items() if k != 'inputs'}))
