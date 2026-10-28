"""Offline consistency checks for the unpublished post-v200 increment.

Does not read private exports, query production, write application data or deploy.
Run from any working directory with Python 3.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
APP = ROOT / 'apps/idol-site'
EVIDENCE = ROOT / 'docs/codex/evidence/20261028-post-v200'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


stages = read(APP / 'data/stage-videos.json')
status = read(APP / 'data/stages/status.json')
stage_queue = read(EVIDENCE / 'remaining-stage-ledger.json')
people_queue = read(EVIDENCE / 'remaining-person-statistics.json')
assert len(stages) == 496 == stage_queue['selectedSources']
assert len(stage_queue['records']) == 109 == stage_queue['remaining']
ids = [row['workId'] for row in stage_queue['records']]
assert len(set(ids)) == len(ids) and not set(ids).intersection(stages)
assert sum(stage_queue['counts'].values()) == len(ids)
assert stage_queue['legacyReplacementQueue'] == 11
assert sum(row['status'] == 'missing_song_identity' for row in status['works'].values()) == 9

summary = people_queue['summary']
assert (summary['publicCreditWorks'], summary['publicRecognitionSlots'], summary['remainingPersonWorks'], summary['unknownMetrics'], summary['effectiveDateHolds']) == (102, 527, 24, 9, 7)
for relative in ['stages-b/adoption.json', 'stages-a/member-version-adoption.json']:
    receipt = read(EVIDENCE / relative)
    assert receipt['privateWrites'] == 0 and receipt['published'] is False
    for change in receipt['changes']:
        assert stages[change['recordId']] == change['after']
        assert status['works'][change['recordId']] == change['afterStatus']
        assert change['ownerStageScoreEmpty'] is True
        assert change['ownerSaveJournalHasRecord'] is False

member = stages['recvxyOz5XJWXT']
assert member['memberVersionFallback']['differenceType'] == 'guest_scope'
assert '成员版' in member['kind'] and '客串' in member['verificationNote']
assert member['scoreBinding']['initialScore'] is None

posters = read(APP / 'data/stage-selection-posters-20261027.json')['entries']
added = [row for row in posters if '/stage-post200-20261028/' in row['src']]
assert len(added) == 4
for row in added:
    data = (APP / 'public' / row['src'].lstrip('/')).read_bytes()
    assert len(data) == row['byteLength']
    assert hashlib.sha256(data).hexdigest() == row['sha256']
    assert stages[row['workId']]['videoId'] == row['videoId']

snapshots = read(EVIDENCE / 'queue-validation.json')['sourceSnapshots']
for filename, record in snapshots.items():
    assert hashlib.sha256((ROOT / filename).read_bytes()).hexdigest() == record['sha256'], filename
for ui_file in ['ui/main-flow.json', 'ui/udtt.json']:
    ui = read(EVIDENCE / ui_file)
    assert ui['status'] == 'passed', ui_file
hold = read(EVIDENCE / 'publication-hold.json')
assert hold['version'] == 200 and hold['newVersionSaved'] is False and hold['newDeploymentRequested'] is False
print(json.dumps({'valid': True, 'selectedStages': 496, 'newStageGaps': 109, 'oldStageReplacements': 11, 'personEvidenceGaps': 24, 'unknownMetrics': 9, 'effectiveDateHolds': 7, 'publishedVersion': 200, 'privateExportsRead': 0}))
