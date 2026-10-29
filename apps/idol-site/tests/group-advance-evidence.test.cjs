const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const load = require('./helpers/public-artist-loader.cjs');
const {beforeGroupAdvanceStatistics, beforeGroupAdvanceTimelineRecords,
  statisticsAdoption, timelineAdoption} = require('./helpers/group-advance-evidence.cjs');

const app = path.resolve(__dirname, '..');
const evidenceRoot = path.resolve(app, '../../docs/codex/evidence/20261029-group-advance');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const evidence = file => read(path.join(evidenceRoot, file));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const statsFile = path.join(app, 'data/group-statistics-completion-evidence.json');
const timelineFile = path.join(app, 'data/timeline-reported-records.json');
const statistics = read(statsFile);
const timelines = read(timelineFile);
const historicalStatistics = beforeGroupAdvanceStatistics(statistics);
const historicalTimelines = beforeGroupAdvanceTimelineRecords(timelines);
const sales = statistics.groups.triples.sales;
const oldSales = historicalStatistics.groups.triples.sales;
const newWeeks = sales.evidence.weeklyAdditions.slice(oldSales.evidence.weeklyAdditions.length);
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
const range = label => {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})~(\d{4})\.(\d{2})\.(\d{2}) \(\d{2}\)$/.exec(label);
  assert.ok(match, 'full chart period including the year boundary');
  return [`${match[1]}-${match[2]}-${match[3]}`, `${match[4]}-${match[5]}-${match[6]}`];
};
const monthRange = row => {
  const month = `${row.year}-${String(row.month).padStart(2, '0')}`;
  return [month + '-01', month + '-' + new Date(Date.UTC(row.year, row.month, 0)).getUTCDate()];
};
const overlaps = (a, b) => a[0] <= b[1] && b[0] <= a[1];
const unknownFields = data => Object.entries(data.groups).flatMap(([slug, group]) =>
  [...group.social.map((row, index) => [slug + '.social.' + index, row]),
    [slug + '.sales', group.sales], [slug + '.wins', group.wins]]
    .filter(([, row]) => row.observedValue === null));

test('the exact adoption restores the frozen statistics baseline and preserves all seven unknown fields', () => {
  assert.equal(sha(fs.readFileSync(statsFile)), statisticsAdoption.afterFileSha256);
  assert.equal(statisticsAdoption.addedContribution, 2679);
  assert.equal(Object.keys(statistics.groups).length, 51);
  assert.deepEqual(statistics.summary, historicalStatistics.summary);
  assert.deepEqual(unknownFields(statistics), unknownFields(historicalStatistics));
  assert.equal(unknownFields(statistics).length, 7);
  assert.equal(unknownFields(statistics).filter(([key]) => key.endsWith('.sales')).length, 4);
  assert.equal(unknownFields(statistics).filter(([key]) => key.endsWith('.wins')).length, 3);
  const current = structuredClone(statistics), previous = structuredClone(historicalStatistics);
  delete current.groups.triples.sales; delete previous.groups.triples.sales;
  assert.deepEqual(current, previous);
  for (const key of ['monthRows', 'annualReplacements', 'previousEvidence', 'officialAnnualReadback20261028']) {
    assert.deepEqual(sales.evidence[key], oldSales.evidence[key], key);
  }
  assert.deepEqual(sales.evidence.weeklyAdditions.slice(0, 8), oldSales.evidence.weeklyAdditions);
  assert.deepEqual(sales.evidence.weeklyOverlapReview.slice(0, 6), oldSales.evidence.weeklyOverlapReview);
});

test('three added weeks match independent official Album_CNT rows rather than cumulative Total_CNT', () => {
  const captures = [...evidence('statistics-dates-circle-targeted.json'), ...evidence('statistics-dates-circle-adjacent.json')];
  const independent = evidence('statistics-circle-root-readback.json').rows;
  assert.deepEqual(newWeeks.map(row => [row.albumId, row.year, row.week, row.sales]), [
    ['74459', 2024, 3, 840], ['78104', 2024, 46, 1126], ['81284', 2026, 1, 713],
  ]);
  for (const row of newWeeks) {
    const capture = captures.find(item => item.sourceUrl === row.sourceUrl);
    const corroboration = independent.find(item => item.url === row.sourceUrl);
    assert.ok(capture); assert.ok(corroboration);
    const original = capture.selectedRows.find(item => item.seq_aoa === row.albumId);
    assert.deepEqual(corroboration.selectedRows.find(item => item.seq_aoa === row.albumId), original);
    if (capture.httpStatus !== undefined) assert.equal(capture.httpStatus, 200);
    else assert.equal(capture.returnedRows, 100);
    assert.equal(corroboration.httpStatus, 200);
    assert.equal(row.metricField, 'Album_CNT');
    assert.equal(row.sales, Number(original.Album_CNT));
    assert.notEqual(row.sales, Number(original.Total_CNT));
    assert.equal(row.album, original.ALBUM_NAME); assert.equal(row.artist, original.ARTIST_NAME);
    assert.equal(row.rank, Number(original.SERVICE_RANKING));
    assert.equal(row.responseSha256, capture.responseSha256);
    assert.equal(row.responseSha256, corroboration.responseSha256);
    assert.equal(row.pageSha256, capture.pageSha256);
    assert.equal(capture.parameters.termGbn, 'week');
    assert.equal(capture.parameters.hitYear, String(row.year));
    assert.equal(capture.parameters.targetTime, String(row.week).padStart(2, '0'));
    assert.ok((capture.periodLabels?.map(item => item.label) ?? capture.dateRanges).includes(row.dateRange));
  }
});

test('standard editions are disjoint from same-edition months, annual replacements and previous weeks across New Year', () => {
  const months = oldSales.evidence.monthRows;
  const standardMonthIndices = {74459: [30], 78104: [21], 81284: [8]};
  const names = {74459: 'EVOLution', 78104: 'Visionary Vision', 81284: 'msnz'};
  const priorMonth = read(path.resolve(evidenceRoot, '../20261028-post-v200/statistics/triples-followup-observations.json'));
  const performante = priorMonth.find(row => row.term === 'month' && row.year === 2024 && row.period === 10);
  assert.equal(Number(performante.selectedRows.find(row => row.seq_aoa === '78104').Album_CNT), months[21].sales);
  assert.equal(Number(performante.selectedRows.find(row => row.seq_aoa === '78113').Album_CNT), months[20].sales);
  const beyond = evidence('statistics-dates-circle-beyond-identity.json');
  assert.equal(Number(beyond.selectedRows.find(row => row.seq_aoa === '81284').Album_CNT), months[8].sales);
  assert.equal(Number(beyond.selectedRows.find(row => row.seq_aoa === '81285').Album_CNT), months[7].sales);
  const annualIds = oldSales.evidence.officialAnnualReadback20261028.observations.map(row => row.albumId);
  assert.deepEqual(annualIds, ['78113', '79676']);
  const covered = oldSales.evidence.weeklyAdditions.map(row => ({id: row.albumId, interval: range(row.dateRange)}));
  for (const row of newWeeks) {
    const period = range(row.dateRange);
    assert.ok(period[0] <= period[1] && period[1] <= '2026-06-30');
    const indices = months.flatMap((month, index) => month.album.includes(names[row.albumId]) && !month.album.includes('Cosmo') ? [index] : []);
    assert.deepEqual(indices, standardMonthIndices[row.albumId]);
    for (const index of indices) assert.equal(overlaps(period, monthRange(months[index])), false);
    assert.equal(annualIds.includes(row.albumId), false);
    for (const previous of covered.filter(item => item.id === row.albumId)) assert.equal(overlaps(period, previous.interval), false);
    covered.push({id: row.albumId, interval: period});
  }
  assert.deepEqual(range(newWeeks[2].dateRange), ['2025-12-28', '2026-01-03']);
  assert.deepEqual(months.filter(row => (row.year === 2025 && row.month === 12) || (row.year === 2026 && row.month === 1))
    .filter(row => row.album.startsWith('msnz')).map(row => row.album), ['msnz (Cosmo)', 'msnz (Cosmo)']);
  // The tempting Cosmo W14 row is rejected because its full interval intersects March.
  const excluded = evidence('statistics-dates-circle-targeted.json').find(row => row.year === 2026 && row.period === 14);
  assert.equal(overlaps(range(excluded.periodLabels[0].label), monthRange(months[3])), true);
  assert.equal(sales.evidence.weeklyAdditions.some(row => row.albumId === '81285' && row.year === 2026 && row.week === 14), false);
});

test('the new lower bound and unresolved difference reconcile without claiming completed coverage', () => {
  const e = sales.evidence;
  assert.equal(sum(newWeeks, 'sales'), 2679);
  assert.equal(e.weeklyAdditions.length, 11); assert.equal(sum(e.weeklyAdditions, 'sales'), 18594);
  assert.equal(sum(e.monthRows, 'sales'), 2087073); assert.equal(sum(e.annualReplacements, 'delta'), 5166);
  assert.equal(2087073 + 5166 + 18594, 2110833);
  assert.equal(sales.observedValue, 2110833); assert.equal(sales.displayValue, 2110833);
  assert.equal(sales.rawDisplay, '2,110,833+'); assert.equal(e.recomputedSum, 2110833);
  assert.equal(e.sourceDifferenceReview.reconciledSum, 2110833);
  assert.equal(e.sourceDifferenceReview.aggregateTotal, oldSales.evidence.sourceDifferenceReview.aggregateTotal);
  assert.equal(e.sourceDifferenceReview.aggregateTotal - sales.observedValue, 347956);
  assert.equal(e.sourceDifferenceReview.remainingDifference, 347956);
  assert.equal(e.sourceDifferenceReview.weeklyContribution, 18594);
  assert.equal(e.sourceDifferenceReview.status, 'partially-resolved');
  assert.equal(sales.asOf, '2026-06'); assert.equal(sales.lowerBound, true);
  assert.match(sales.scope, /11条不重叠官方周榜/); assert.match(sales.scope, /不是全球完整累计/);
  assert.equal(statisticsAdoption.coverageComplete, false); assert.equal(statisticsAdoption.fullFactClosed, false);
});

test('official announcement records retain canonical bytes, event identities and unknown effective dates', () => {
  assert.equal(sha(fs.readFileSync(timelineFile)), timelineAdoption.afterFileSha256);
  const canonicalHashes = {
    atheart: '82dab6b7057818a60acb933f57617877eced2a664b0a64206f9a38a5c3bac853',
    bewave: '3ea86955021317aadf87bb6c8d569d9852b365a16500d323b2cf8c090b2b916d',
  }; // Frozen from c80a60e3, not recalculated from the updated overlay.
  assert.equal(timelines.records.length, 7);
  for (const change of timelineAdoption.changes) {
    const row = timelines.records.find(item => item.eventId === change.eventId);
    const before = historicalTimelines.records.find(item => item.eventId === change.eventId);
    const canonicalBytes = fs.readFileSync(path.join(app, 'data/artist-timelines', row.slug + '.json'));
    assert.equal(sha(canonicalBytes), canonicalHashes[row.slug]);
    const canonical = JSON.parse(canonicalBytes).events.find(item => item.id === row.eventId);
    for (const key of ['eventId', 'slug', 'groupId', 'memberIds', 'legacyNativeIds', 'recordDate']) assert.deepEqual(row[key], before[key]);
    assert.deepEqual(row.memberIds, canonical.memberIds); assert.deepEqual(row.memberIds, []);
    assert.equal(row.eventDate, null); assert.equal(canonical.eventDate, null); assert.equal(canonical.reviewStatus, 'hold');
    assert.equal(row.kind, 'report'); assert.equal(row.dateLabel, '官方公告日期');
    assert.match(row.boundary, /生效日期未确认/);
    for (const source of before.sources) assert.ok(row.sources.some(item => JSON.stringify(item) === JSON.stringify(source)));
    const original = evidence('statistics-dates-' + row.slug + '-primary.json');
    assert.equal(row.sources[0].url, original.sourceUrl);
    assert.equal(row.sources[0].publishedDate, original.publicationDate);
    assert.equal(row.recordDate, original.publicationDate);
  }
  const changedIds = timelineAdoption.changes.map(row => row.eventId);
  assert.deepEqual(timelines.records.filter(row => !changedIds.includes(row.eventId)),
    historicalTimelines.records.filter(row => !changedIds.includes(row.eventId)));
});

test('rendered announcements expose official sources and publication dates while retaining the effective-date boundary', () => {
  const {TimelineReportedRecords} = load('components/timeline-reported-records.tsx');
  for (const change of timelineAdoption.changes) {
    const row = change.after;
    const html = renderToStaticMarkup(React.createElement(TimelineReportedRecords, {
      slug: row.slug, groupId: row.groupId, variant: row.slug === 'bewave' ? 'bewave' : 'shared',
      renderMember: id => React.createElement('a', {href: '/member/' + id}, id),
    }));
    assert.ok(html.includes(`data-reported-record="${row.eventId}"`));
    assert.ok(html.includes(`dateTime="${row.recordDate}"`) || html.includes(`datetime="${row.recordDate}"`));
    assert.match(html, /官方公告日期/); assert.match(html, /生效日期未确认/);
    assert.ok(html.includes(row.sources[0].url)); assert.ok(html.includes(row.sources[0].label));
    assert.ok(!html.includes(change.expectedBefore.summary));
    assert.match(html, /target="_blank" rel="noopener noreferrer"/);
    assert.doesNotMatch(html, /<input|<form|ratingIds|reviewStatus/);
    if (row.slug === 'bewave') {
      assert.match(html, /计划于10月31日/); assert.match(html, /实际执行仍未证实/);
      assert.doesNotMatch(html, /dateTime="2025-10-31"|datetime="2025-10-31"/);
    } else assert.match(html, /不推定实际暂停起始日/);
  }
});

test('historical restoration rejects changed evidence, unrelated records and metadata without mutating its input', () => {
  const source = structuredClone(statistics), snapshot = structuredClone(source);
  beforeGroupAdvanceStatistics(source); assert.deepEqual(source, snapshot);
  const badSales = structuredClone(statistics); badSales.groups.triples.sales.evidence.weeklyAdditions.at(-1).sales++;
  assert.throws(() => beforeGroupAdvanceStatistics(badSales), /complete group-advance sales object/);
  const otherGroup = structuredClone(statistics); otherGroup.groups.vvup.sales.observedValue++;
  assert.throws(() => beforeGroupAdvanceStatistics(otherGroup), /complete pre-advance statistics/);
  const badDate = structuredClone(timelines); badDate.records.find(row => row.slug === 'bewave').eventDate = '2025-10-31';
  assert.throws(() => beforeGroupAdvanceTimelineRecords(badDate), /complete group-advance announcement/);
  const otherRecord = structuredClone(timelines); otherRecord.records.find(row => row.slug === 'geenius').recordDate = '2025-01-01';
  assert.throws(() => beforeGroupAdvanceTimelineRecords(otherRecord), /complete pre-advance timeline/);
  const timelineSnapshot = structuredClone(timelines);
  beforeGroupAdvanceTimelineRecords(timelines); assert.deepEqual(timelines, timelineSnapshot);
});
