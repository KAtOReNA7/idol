"""Annotate this bounded public research without modifying application data."""
import datetime
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
path = HERE / 'statistics-research.json'
result = json.loads(path.read_text(encoding='utf-8'))
application = ROOT / result['baselinePath']
assert hashlib.sha256(application.read_bytes()).hexdigest() == result['baselineFileSha256']
assert 'reviewCompletedAt' not in result, 'Already finalized; retain the existing research record.'
current = json.loads(application.read_bytes())['groups']['triples']['sales']
assert len(result['circleReadbacks']) == 8
assert all(row['status'] == 'read' and row['rowCount'] == 100
           and row['priorQueryFiles'] == [] for row in result['circleReadbacks'])
matches = [(entry, row) for entry in result['circleReadbacks'] for row in entry['selectedRows']]
assert len(matches) == 1
entry, row = matches[0]
assert (entry['year'], entry['week'], row['seq_aoa'], row['Album_CNT']) == (2025, 7, '78987', '1047')
month = current['evidence']['monthRows'][15]
assert month == {'year': 2025, 'month': 2, 'sales': 6883,
                 'album': 'Acid Angel from Asia < ACCESS > (Cosmo)'}
assert set(result['unknownFieldInventory'][i]['key'] for i in range(7)) == {
    'genblue.wins', 'tracer.sales', 'tracer.wins', 'witchx.sales',
    'spia.sales', 'vcha.sales', 'vcha.wins'}
result['reviewCompletedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
result['status'] = 'bounded_new_routes_completed_no_numeric_adoption'
result['priorEvidenceRead'] = [
    'docs/codex/RESUME-PROMPT-20261030.txt',
    'docs/codex/evidence/20261029-next-followup/statistics-new.json',
    'docs/codex/evidence/20261029-next-followup/triples-reconciliation-new.json',
    'docs/codex/evidence/20261029-group-advance/unknown-statistics-new-routes.json',
    'docs/codex/evidence/20261029-group-advance/statistics-dates-circle-half.json',
    'docs/codex/evidence/20261028-post-v200/statistics/remaining-sales-next-research.json',
    'docs/codex/evidence/20261028-post-v200/statistics/check-win-archive.py'
]
result['excludedCoveredRows'] = [{
    'year': 2025, 'week': 7, 'dateRange': '2025.02.09~2025.02.15 (07)',
    'albumId': row['seq_aoa'], 'album': row['ALBUM_NAME'], 'artist': row['ARTIST_NAME'],
    'metricField': 'Album_CNT', 'sales': 1047, 'rank': 95,
    'sourceUrl': entry['sourceUrl'], 'existingMonthRowIndex': 15,
    'existingMonthRow': month, 'proposedContribution': 0,
    'reason': 'Exact ACCESS Cosmo edition; the complete week is within the already-counted February 2025 month. Total_CNT=7171 is separately excluded and is not a new period contribution.'
}]
result['unknownStatisticsResearch'] = {
    'method': '15 bounded index queries. Broad exact-identity queries were followed by broadcaster/chart-provider/label-specific queries; no claimed complete discography or complete programme archive.',
    'queries': [
        'GENBLUE first win music show 2025 2026 일위 젠블루 첫 1위',
        'TRACER 트레이서 365 음악방송 1위',
        'VCHA music show win first win 2024 2025',
        '"SPIA" "sales" album 2025 2026',
        '"TRACER" "365" "sales" album',
        '"W!TCHX" "RUN BABY RUN" "sales"',
        '"VCHA" "Girls of the Year" "physical sales"',
        'site.sbs.co.kr "젠블루" "1위"',
        'site.kbs.co.kr "비춰" "1위"',
        'site.mnetplus.world "VCHA" "Girls of the Year"',
        'site.hanteonews.com "위치스" OR "수피아" OR "트레이서"',
        'site.jype.com "VCHA" "판매량"',
        'site.hanteonews.com "SPIA"',
        'site.quartermusic.co.kr "위치스"',
        '"트레이서" "365" "초동"'
    ],
    'sourceReadBoundary': 'New external leads below were reviewed as returned search-index excerpts, not full-page reads. They are rejection/context evidence only, not adopted numerical statistics.',
    'items': [
        {'key': 'genblue.wins', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'The index again surfaced THE SHOW nominee reporting rather than a win, plus a separate Taiwan-number-one headline. Neither is a dated Korean music-show victory or a complete zero-wins audit. No new original victory record was located.',
         'leads': [
             {'url': 'https://news.owlting.com/articles/961609', 'kind': 'press-report search excerpt',
              'reasonNotAdopted': 'Reports a 2025-03-11 THE SHOW nomination; the already-reviewed nominee route was not reopened.'},
             {'url': 'https://www.sportsseoul.com/news/read/1462878', 'kind': 'named-news search excerpt',
              'reasonNotAdopted': 'Taiwan number-one headline alongside a Music Bank arrival report is not a Korean music-show first-place result.'}],
         'nextEvidenceNeeded': 'A dated original broadcaster win or a genuinely complete authoritative period tally; unrelated Taiwanese awards and nominations remain excluded.'},
        {'key': 'tracer.wins', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'Exact TRACER/트레이서/365 query produced homonym noise and no new original programme victory or complete cumulative tally. Earlier six-show archive absence is not promoted to zero.',
         'nextEvidenceNeeded': 'Original Korean broadcast result naming the GleamMedia girl group, or a complete authoritative cumulative record.'},
        {'key': 'vcha.wins', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'The available lead is a fan report of M Countdown pre-voting, not an official win. Broadcaster-specific index queries did not reveal an adoptable result. VCHA and later GIRLSET periods remain distinct.',
         'leads': [{'url': 'https://www.reddit.com/r/vcha/comments/1ankcvc',
                    'kind': 'fan-discussion search excerpt',
                    'reasonNotAdopted': 'Pre-voting eligibility/nomination does not establish a win; no participant comments or personal information were retained.'}],
         'nextEvidenceNeeded': 'Original dated victory or a complete authoritative VCHA-period cumulative tally; absence of search results is not zero.'},
        {'key': 'spia.sales', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'A newly indexed profile presents sales columns but only dashes for the known digital singles and duplicates Daddy\'s Little Girl under differing apostrophes. It supplies no chart period or units. Chart-provider-specific query yielded no adoptable original count.',
         'leads': [{'url': 'https://aimcontents.com/en/namu/spia/',
                    'kind': 'secondary-profile search excerpt',
                    'reasonNotAdopted': 'Missing counts and duplicate release labels are not physical-sales evidence; a verified-database label alone is not validation.'}],
         'nextEvidenceNeeded': 'Exact physical audio-carrier identity plus a dated sales/shipments count with stated scope. Existing digital-release evidence does not prove all-history zero.'},
        {'key': 'tracer.sales', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'Exact 365 title plus TRACER/트레이서 and sales/first-week terms yielded no new attributable physical count. Prior GleamMedia identity and four native Retail queries were not rerun.',
         'nextEvidenceNeeded': 'Exact GleamMedia TRACER physical SKU and a dated provider count; television OST, hardware and other artist homonyms remain excluded.'},
        {'key': 'witchx.sales', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'Exact RUN BABY RUN and chart-provider/distributor-specific searches located no new audio-carrier sales count. The previous K-Towns photobook product is not promoted to an album sale or a lower bound.',
         'nextEvidenceNeeded': 'Quarter Music/Artform exact audio-carrier SKU or an original chart row with a dated count. Photobook versions, prices, stock states and digital barcodes are not units sold.'},
        {'key': 'vcha.sales', 'numericProposal': None, 'status': 'unresolved',
         'finding': 'New search results included an unsourced fandom discography claiming 200000 physical sales and analyst tables with dashes for VCHA digital singles. Neither supplies an adoptable VCHA Korean physical-sales tally; later GIRLSET retail products remain out of this unresolved VCHA-period scope.',
         'leads': [
             {'url': 'https://shapes.inc/fandom/girlset/discography',
              'kind': 'unsourced fandom search excerpt',
              'reasonNotAdopted': 'No identifiable chart row, date, SKU or primary citation for the claimed quantity; excerpt also duplicates a member and introduces uncorroborated releases. The 200000 figure is rejected, not a proposal.'},
             {'url': 'https://file.alphasquare.co.kr/media/pdfs/company-report/49434_240320_JYP_4Q23_Earnings_Review.pdf',
              'kind': 'analyst-report mirror search excerpt',
              'reasonNotAdopted': 'Lists 2024-01-26 and 2024-03-15 as digital singles with dashes in Hanteo/Circle sales columns. Missing or nonapplicable table cells are not a factual all-period zero.'}],
         'nextEvidenceNeeded': 'Original VCHA-period physical SKU and dated count with Korean-release/territory scope; no GIRLSET backfill, digital-unit conversion or inferred zero.'}
    ]
}
result['summary'] = {
    'unknownFieldsExamined': 7, 'unknownFieldsClosed': 0,
    'newCirclePeriodsRead': 8, 'officialRowsRead': 800, 'newExactTripleSRowsLocated': 1,
    'rowsExcludedAsAlreadyCoveredByMonth': 1, 'newNumericProposals': 0,
    'confirmedZeroClaims': 0, 'tripleSLowerBoundUnchanged': 2113229,
    'tripleSUnexplainedDifferenceUnchanged': 345560,
    'existingWeeklyAdditionCountUnchanged': 13, 'asOfUnchanged': '2026-06'
}
result['limits'] = [
    'Eight newly queried weekly top100 pages are a bounded follow-up, not all-period coverage. No selected row is not proof of zero sales.',
    'The only selected row is wholly inside an existing same-edition month and contributes zero. No month, year, weekly addition or cutoff was changed.',
    'The retained reference aggregate2458789 was not freshly verified; its unexplained difference remains open. Soridata download/captcha or formerly denied routes were not retried.',
    'Fifteen index queries and reviewed excerpts do not constitute a complete original-source audit. Unverified numbers, missing cells, nominees and unrelated first-place wording are not factual metrics.',
    'All seven fields retain observedValue=null and displayValue=0. No true-zero claim, application edit, private record access, Git commit or deployment was performed.'
]
assert hashlib.sha256(application.read_bytes()).hexdigest() == result['baselineFileSha256']
path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result['summary'], ensure_ascii=False))
