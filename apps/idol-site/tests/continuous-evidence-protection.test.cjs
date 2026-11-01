const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {beforeUserXObservations} = require('./helpers/user-x-observations.cjs');
const {beforeGroupAdvanceTimelineRecords} = require('./helpers/group-advance-evidence.cjs');

const app = path.resolve(__dirname, '..');
const repo = path.resolve(app, '../..');
const evidenceRoot = path.join(repo, 'docs/codex/evidence/20261028-continuous');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const proposal = read(path.join(evidenceRoot, 'evidence-upgrade-proposal-c.json'));
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
    : value;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(canonical(value)));
const omit = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const timelineHashes = {
  candyshop: '480ebf439d9de4824b9d3d2c54c2a6a54e67024c7622c70acd71ac38202b4af2',
  bewave: 'cfed63175dbcf2be685f67c94f5511235e8e1000eff880942e1ecd8d2eab7565',
  geenius: '6827b5a3cbaa18a718854729a86b571b085f1d3251f139e3c21950571b242421',
};

test('source upgrades retain every canonical date, status, stable ID, relation and all seven holds', () => {
  assert.deepEqual(proposal.timelines.map(row => row.slug), ['candyshop', 'bewave', 'geenius']);
  for (const change of proposal.timelines) {
    const before = JSON.parse(change.expectedBeforeText);
    const bytes = fs.readFileSync(path.join(repo, change.sourceFile));
    const after = JSON.parse(bytes);
    assert.equal(sha(change.expectedBeforeText), timelineHashes[change.slug]);
    assert.equal(sha(change.expectedBeforeText), change.expectedBeforeFileSha256);
    assert.equal(hash(before), change.expectedBeforeSha256Canonical);
    assert.equal(sha(bytes), change.proposedAfterFileSha256);
    assert.equal(hash(after), change.proposedAfterSha256Canonical);
    assert.deepEqual(omit(after, ['events', 'gaps']), omit(before, ['events', 'gaps']));
    assert.equal(after.events.length, before.events.length);
    for (let i = 0; i < before.events.length; i++) {
      const original = before.events[i], current = after.events[i];
      if (original.id !== change.eventId) {
        assert.deepEqual(current, original);
        continue;
      }
      assert.deepEqual(omit(current, ['summary', 'scopeNote', 'sources', 'holdReasons']),
        omit(original, ['summary', 'scopeNote', 'sources', 'holdReasons']));
      assert.deepEqual(current.sources.slice(0, original.sources.length), original.sources);
      assert.equal(current.reviewStatus, 'hold');
      assert.equal(current.eventDate, null);
      assert.ok(current.holdReasons.length > 0);
    }
    if (change.slug !== 'bewave') assert.deepEqual(after.gaps, before.gaps);
    else assert.deepEqual(after.gaps.filter((_, i) => i !== 2), before.gaps.filter((_, i) => i !== 2));
  }
  const holds = ['atheart', 'bewave', 'candyshop', 'geenius', 'udtt'].flatMap(slug =>
    read(path.join(app, 'data/artist-timelines', slug + '.json')).events.filter(row => row.reviewStatus === 'hold'));
  assert.equal(holds.length, 7);
  assert.ok(holds.every(row => row.eventDate === null));
});

test('reported records add only scoped sources and prose, leaving all effective dates and member links intact', () => {
  const change = proposal.reported;
  assert.equal(hash(change.expectedBefore), '5400ed1cfefbd9c94d464b7e3facbea3cc8939ea5824eaac470eefe14c37e301');
  assert.equal(hash(change.expectedBefore), change.expectedBeforeSha256Canonical);
  const current = beforeGroupAdvanceTimelineRecords(read(path.join(repo, change.sourceFile)));
  const laterUdtt = read(path.join(repo, 'docs/codex/evidence/20261028-post-v200/statistics/udtt-source-adoption.json'));
  const udttIndex = current.records.findIndex(row => row.eventId === laterUdtt.after.eventId);
  assert.ok(udttIndex >= 0);
  assert.deepEqual(current.records[udttIndex], laterUdtt.after);
  current.records[udttIndex] = structuredClone(laterUdtt.expectedBefore);
  assert.equal(hash(current), change.proposedAfterSha256Canonical);
  assert.deepEqual(omit(current, ['records']), omit(change.expectedBefore, ['records']));
  assert.equal(current.records.length, 7);
  const changed = new Set(['candyshop', 'bewave', 'geenius']);
  current.records.forEach((row, i) => {
    const before = change.expectedBefore.records[i];
    if (!changed.has(row.slug)) return assert.deepEqual(row, before);
    assert.deepEqual(omit(row, ['summary', 'notes', 'sources']), omit(before, ['summary', 'notes', 'sources']));
    assert.deepEqual(row.sources.slice(0, before.sources.length), before.sources);
    assert.equal(row.eventDate, null);
    assert.match(row.boundary, /生效日期未确认/);
    assert.ok(row.sources.length > before.sources.length);
  });
  const candy = current.records.find(row => row.slug === 'candyshop');
  assert.match(candy.notes.join(' '), /所指暂停日为2024-05-09.*canonical实际日期仍为null/);
  assert.ok(candy.sources.some(row => row.label.includes('KIM MIN-YOUNG') && row.publishedDate === '2024-05-14'));
  assert.match(current.records.find(row => row.slug === 'bewave').summary, /计划实际执行仍未证实/);
  assert.match(current.records.find(row => row.slug === 'geenius').summary, /手册未给实际发行日/);
  assert.doesNotMatch(JSON.stringify(current), /"(?:score|note|watched|favorite|ratingIds|reviewStatus)"/);
});

test('tripleS source upgrade preserves every statistic and all original monthly and annual rows', () => {
  const change = proposal.statistics;
  const current = beforeUserXObservations(read(path.join(repo, change.sourceFile)));
  const sales = current.groups.triples.sales;
  assert.equal(hash(change.expectedBefore), '1844749d1a99fd9c4591c6afe66e0631c38cca29679b9f82aaf7fb9f03b90cd0');
  assert.equal(hash(change.expectedBefore), change.expectedBeforeSha256Canonical);
  assert.equal(hash(sales), change.proposedAfterSha256Canonical);
  assert.equal(hash(current), change.proposedAfterDataSha256Canonical);
  const restored = structuredClone(current);
  restored.groups.triples.sales = change.expectedBefore;
  assert.equal(hash(restored), '91f79ea02d5f32228e4a185a4e9342bb5c338ba903212c188ac8314cffd5748b');
  assert.equal(hash(restored), change.expectedBeforeDataSha256Canonical);
  assert.deepEqual(omit(sales, ['sources', 'notes', 'evidence']), omit(change.expectedBefore, ['sources', 'notes', 'evidence']));
  assert.deepEqual(omit(sales.evidence, ['officialAnnualReadback20261028']), change.expectedBefore.evidence);
  assert.deepEqual(sales.sources.slice(0, change.expectedBefore.sources.length), change.expectedBefore.sources);
  assert.equal(sales.evidence.monthRows.length, 36);
  assert.equal(sales.evidence.annualReplacements.length, 2);
  assert.equal(sales.observedValue, 2092239);
  assert.equal(sales.evidence.sourceDifferenceReview.remainingDifference, 366550);
  assert.equal(current.summary.socialFallbackZero + current.summary.salesFallbackZero + current.summary.winsFallbackZero, 15);
  assert.equal(current.groups.vcha.social.find(row => row.platform === 'x').observedValue, null);
  assert.ok(current.summary.unresolvedSourceDifferences.includes('triples.sales'));
});

test('official annual verification uses matching native Album periods and quantities without cumulative addition', () => {
  const data = read(path.join(app, 'data/group-statistics-completion-evidence.json'));
  const evidence = data.groups.triples.sales.evidence;
  const verification = evidence.officialAnnualReadback20261028;
  const captures = read(path.join(evidenceRoot, 'circle-annual-c.json'));
  assert.equal(verification.metricField, 'Album_CNT');
  assert.deepEqual(verification.excludedMetricFields, ['Total_CNT']);
  assert.equal(verification.coverageComplete, false);
  assert.equal(verification.remainingDifferenceResolved, false);
  assert.deepEqual(verification.observations.map(row => [row.year, row.albumId, row.annual]), [[2024, '78113', 289224], [2025, '79676', 406744]]);
  for (const row of verification.observations) {
    const capture = captures.find(item => item.url === row.sourceUrl);
    assert.ok(capture);
    assert.equal(capture.httpStatus, 200);
    assert.equal(capture.pageHttpStatus, 200);
    assert.equal(capture.resultStatus, 'OK');
    assert.equal(capture.sha256, row.responseSha256);
    assert.equal(capture.pageSha256, row.pageSha256);
    assert.equal(capture.endpoint, 'https://circlechart.kr/data/api/chart/album');
    assert.deepEqual(capture.requestParameters, row.parameters);
    assert.equal(row.parameters.termGbn, 'year');
    assert.equal(row.parameters.yearTime, '3');
    assert.equal(row.parameters.hitYear, String(row.year));
    const native = capture.selectedRows.find(item => item.seq_aoa === row.albumId);
    assert.equal(native.ALBUM_NAME, row.album);
    assert.equal(native.ARTIST_NAME, row.artist);
    assert.equal(Number(native.Album_CNT), row.annual);
    assert.equal(Number(native.SERVICE_RANKING), row.rank);
    assert.equal(evidence.annualReplacements.find(item => item.year === row.year).annual, row.annual);
    if (row.year === 2025) assert.notEqual(Number(native.Total_CNT), row.annual);
  }
});

test('official statement and manual links retain the exact viewed image bytes and reading limits', () => {
  const reported = beforeGroupAdvanceTimelineRecords(read(path.join(app, 'data/timeline-reported-records.json')));
  for (const [slug, file] of [['bewave', 'bewave-original-images-receipt-c.json'], ['geenius', 'geenius-manual-original-images-receipt-c.json']]) {
    const row = reported.records.find(item => item.slug === slug);
    const receipts = read(path.join(evidenceRoot, file));
    assert.equal(receipts.length, 2);
    for (const receipt of receipts) {
      const bytes = fs.readFileSync(path.join(repo, receipt.localFile));
      assert.equal(receipt.status, 200);
      assert.equal(bytes.length, receipt.bytes);
      assert.equal(sha(bytes), receipt.sha256);
      assert.ok(row.sources.some(source => source.url === receipt.url));
    }
    assert.match(row.notes.join(' '), /已目视读取/);
    assert.match(row.notes.join(' '), /公开归档定位，未独立读取X原帖正文/);
  }
});
