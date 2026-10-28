"""Offline consistency checks for the frozen post-v200 increment, later published as v201.

Does not read private exports, query production, write application data or deploy.
Run from any working directory with Python 3. --refresh-receipt writes only
the public queue validation receipt after all checks pass.
"""
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
APP = ROOT / 'apps/idol-site'
EVIDENCE = ROOT / 'docs/codex/evidence/20261028-post-v200'
checks = []
sources = set()


def read(path):
    sources.add(path)
    return json.loads(path.read_text(encoding='utf-8'))


def check(name, condition):
    checks.append({'name': name, 'passed': bool(condition)})
    assert condition, name


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


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
check('independent public facts and unresolved counters',
      (summary['publicCreditWorks'], summary['publicRecognitionSlots'], summary['remainingPersonWorks'], summary['unknownMetrics'], summary['effectiveDateHolds']) == (102, 527, 24, 7, 7))
check('stage gap inventory and selected sources', len(stages) == 496 and len(ids) == 109 and stage_queue['legacyReplacementQueue'] == 11)
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

generic = read(APP / 'data/public-group-recognition.json')
generic_receipt = read(EVIDENCE / 'people/generic-reference/adoption.json')
baseline = read(EVIDENCE / 'people/generic-reference/baseline.json')
fact_ids = {row['workId'] for row in people_queue['remainingPersonWorks']}
generic_ids = {row['workId'] for row in generic['works']}
check('generic references exactly cover24 unresolved works without resolving facts',
      len(generic['works']) == len(generic_ids) == 24 and generic_ids == fact_ids == set(baseline['unverifiedWorkIds']))
groups = {row['groupId']: row for row in generic['groups']}
check('eleven reference groups with119 displayed slots',
      len(groups) == 11 and sum(len(groups[row['groupId']]['portraits']) for row in generic['works']) == 119)
check('generic receipt retains independent fact and relationship boundaries',
      generic_receipt['publicCreditWorks'] == 102 and generic_receipt['publicWorkRecognitionSlots'] == 527
      and generic_receipt['factEvidenceUnresolvedWorks'] == 24 and generic_receipt['privateRelationsAdded'] == 0
      and generic_receipt['newImageFiles'] == 0 and generic_receipt['published'] is False)
for row in generic['works']:
    fact = next(item for item in people_queue['remainingPersonWorks'] if item['workId'] == row['workId'])
    check('generic exact tuple ' + row['workId'], row['videoId'] == fact['videoId'] and row['groupId'] == fact['groupId']
          and row['participationStatus'] == 'unverified_for_work' and row['scope'] == 'group_generic_recognition')
originals = set()
for group in groups.values():
    member_ids = [row['memberId'] for row in group['portraits']]
    check('unique named portraits ' + group['groupId'], len(member_ids) == len(set(member_ids)))
    for row in group['portraits']:
        original = APP / 'public' / row['src'].lstrip('/')
        originals.add(row['src'])
        check('original hash ' + row['memberId'], sha(original) == row['sha256'])
        check('portrait is only recognition ' + row['memberId'], row['participationStatus'] == 'unverified_for_work'
              and row['workAssociation'] == 'recognition_reference' and bool(row['sourceUrl']))
check('sixty-three reused originals', len(originals) == 63)
for filename, expected in baseline['protectedFiles'].items():
    check('protected facts and relationships ' + filename, sha(APP / 'data' / filename) == expected)

statistics = read(APP / 'data/group-statistics-completion-evidence.json')
actual_unknown = {slug + '.' + metric for slug, group in statistics['groups'].items()
                  for metric in ['sales', 'wins'] if group[metric]['observedValue'] is None}
check('unknown queue exactly matches application null facts', actual_unknown == {row['key'] for row in people_queue['unknownMetrics']}
      and len(actual_unknown) == 7 and sum(key.endswith('.sales') for key in actual_unknown) == 4)
for slug in ['triples', 'vvup', 'udtt']:
    receipt = read(EVIDENCE / ('statistics/' + slug + '-followup-adoption.json'))
    check(slug + ' exact adopted statistic object', statistics['groups'][slug]['sales'] == receipt['after'])
    check(slug + ' remains unpublished', receipt['applied'] is True and receipt['published'] is False)
diff = people_queue['independentSalesDifference']
check('tripleS remaining difference is not closed', diff['lowerBound'] == 2108154 and diff['remainingDifference'] == 350635
      and diff['lowerBound'] + diff['remainingDifference'] == 2458789 and diff['completeReconciliation'] is False)
wins = read(EVIDENCE / 'statistics/win-archive-followup.json')
check('bounded archive absence does not become verified zero', wins['recordCount'] == len(wins['rows']) == 930
      and wins['matchingRows'] == [] and wins['adoptedNumericMetrics'] == 0)
for row in people_queue['unknownMetrics']:
    check('unavailable remains null, display fallback only ' + row['key'], row['observedValue'] is None and row['displayValue'] == 0)
    if row['key'].endswith('.wins'):
        check('archive research attached ' + row['key'], row['archiveFollowup']['adoptedNumericMetric'] is False)
for record in read(EVIDENCE / 'source-protection.json')['records']:
    check('protected application source ' + record['path'], sha(ROOT / record['path']) == record['sha256'])

for ui_file in ['ui/main-flow.json', 'ui/udtt.json', 'ui/statistics-followup.json', 'ui/generic-recognition.json']:
    ui = read(EVIDENCE / ui_file)
    check('public fixture browser validation ' + ui_file, ui['status'] == 'passed')
hold = read(EVIDENCE / 'publication-hold.json')
check('historical pre-release hold receipt is preserved', hold['version'] == 200 and hold['newVersionSaved'] is False and hold['newDeploymentRequested'] is False)

counts = {'newStageGaps': 109, 'legacyStageReplacements': 11, 'selectedLocalSources': 496,
          'remainingPersonWorks': 24, 'genericReferenceWorks': 24, 'genericReferenceGroups': 11,
          'genericReferenceSlots': 119, 'genericUniqueExistingOriginals': 63, 'unknownMetrics': 7,
          'effectiveDateHolds': 7, 'tripleSLowerBound': 2108154, 'tripleSRemainingDifference': 350635}
receipt_file = EVIDENCE / 'queue-validation.json'
if '--refresh-receipt' in sys.argv:
    receipt = {'schemaVersion': 2, 'checkedAt': datetime.now(timezone.utc).isoformat(),
               'scope': 'Current offline check of local public queues, exact adoptions, image originals, protected source bytes and separately receipted public-fixture UI. Not production QA or private record readback.',
               'counts': {'checks': len(checks), 'passed': len(checks), 'failed': 0},
               'checks': checks, 'queueCounts': counts,
               'sourceSnapshots': {str(path.relative_to(ROOT)).replace('\\', '/'): {'sha256': sha(path)} for path in sorted(sources)},
               'previousReceipt': 'queue-validation-before-20261029.json',
               'privateReads': 0, 'privateWrites': 0, 'published': False}
    receipt_file.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
else:
    receipt = read(receipt_file)
    assert receipt['queueCounts'] == counts
    for filename, record in receipt['sourceSnapshots'].items():
        assert sha(ROOT / filename) == record['sha256'], filename
print(json.dumps({'valid': True, 'checks': len(checks), **counts, 'publicationBaselineVersion': 200, 'privateExportsRead': 0}))
