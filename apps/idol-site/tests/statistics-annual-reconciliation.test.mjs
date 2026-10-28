import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const evidenceRoot = '../../docs/codex/evidence/20261028-continuation/statistics/';
const data = read('data/group-statistics-completion-evidence.json');
const laterSales = read('../../docs/codex/evidence/20261028-stage-fill/statistics-adoption-proposal.json');
const laterEvidence = read('../../docs/codex/evidence/20261028-continuous/evidence-upgrade-proposal-c.json');
// Restore only the reviewed later changes when checking this historical cohort.
const historicalData = structuredClone(data);
historicalData.groups.triples.sales = laterEvidence.statistics.expectedBefore;
for (const change of laterSales.items) {
  const [slug, field] = change.key.split('.');
  historicalData.groups[slug][field] = change.expectedBefore;
}
historicalData.summary = laterSales.expectedBeforeSummary;
const proposal = read(evidenceRoot + 'triples-sales-proposal.json');
const sourceEvidence = read(evidenceRoot + 'source-evidence.json');
const officialEvidence = read(evidenceRoot + 'official-index-check.json');
const sources = new Map(sourceEvidence.captures.map(row => [row.id, row]));
const sales = data.groups.triples.sales;
const evidence = sales.evidence;
const sum = rows => rows.reduce((total, row) => total + row.sales, 0);
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
    : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

// Frozen from git show 4f2a57bd659db608c89dec173717f50f0dd2cc02:
// apps/idol-site/data/group-statistics-completion-evidence.json.
// CI need not have the historical git object available to verify these boundaries.
const baseline = {
  beforeSales: 'cd5d1bfdb747be185d4d19c8c5b26aee110c83b44e4c00d75a1311ed938525c8',
  other50Groups: 'e3fd9139cdc20f46ce9f759e04e08c0ba484d16d3c69078d240d5f7e78d639f6',
  triplesOtherFields: '174882e9abdb39df82c4f88030b6245040fe3756dc7ca9fd4e017a1fd9812ca3',
  summary: '81c7708d2973c549fd72dc391cba35426540767d56568487f673246821b12c4f',
};

test('tripleS applies the reviewed sales object and preserves all 36 original monthly rows', () => {
  assert.equal(hash(proposal.expectedBefore), baseline.beforeSales);
  assert.equal(hash(proposal.expectedBefore), proposal.expectedBeforeSha256Canonical);
  assert.equal(hash(proposal.proposedAfter), proposal.proposedAfterSha256Canonical);
  assert.deepEqual(historicalData.groups.triples.sales, proposal.proposedAfter);
  assert.deepEqual(evidence.monthRows, proposal.expectedBefore.evidence.monthRows);
  assert.deepEqual(evidence.previousEvidence, proposal.expectedBefore.evidence.previousEvidence);
  assert.equal(evidence.monthRows.length, 36);
  assert.equal(new Set(evidence.monthRows.map(row => JSON.stringify([row.year, row.month, row.album]))).size, 36);
  assert.equal(sum(evidence.monthRows), 2087073);
  assert.equal(evidence.monthlyRecomputedSum, 2087073);
  assert.ok(evidence.monthRows.every(row => Number.isSafeInteger(row.sales) && row.sales >= 0));
  assert.ok(evidence.monthRows.every(row => `${row.year}-${String(row.month).padStart(2, '0')}` <= '2026-06'));
});

test('two annual totals replace five disjoint monthly contributions exactly once', () => {
  const replaced = new Set();
  let annualSum = 0;
  for (const adjustment of evidence.annualReplacements) {
    let monthly = 0;
    for (const {rowIndex, ...original} of adjustment.replacedMonthlyRows) {
      assert.ok(!replaced.has(rowIndex), `monthly row ${rowIndex} counted in two annual replacements`);
      replaced.add(rowIndex);
      assert.deepEqual(evidence.monthRows[rowIndex], original);
      assert.equal(original.year, adjustment.year);
      assert.match(original.album, /\(Cosmo\)$/);
      monthly += original.sales;
    }
    assert.equal(adjustment.monthlySum, monthly);
    assert.equal(adjustment.delta, adjustment.annual - monthly);
    annualSum += adjustment.annual;
  }
  assert.deepEqual([...replaced].sort((a, b) => a - b), [9, 10, 11, 12, 20]);
  assert.deepEqual(evidence.annualReplacements.map(row => [row.year, row.annual, row.monthlySum, row.delta]), [
    [2024, 289224, 286809, 2415],
    [2025, 406744, 403993, 2751],
  ]);
  const retained = evidence.monthRows.filter((_, index) => !replaced.has(index));
  assert.equal(retained.length, 31);
  assert.equal(sum(retained), 1396271);
  assert.equal(annualSum, 695968);
  assert.equal(sum(retained) + annualSum, 2092239);
  assert.equal(sum(retained) + annualSum, sales.observedValue);
  assert.equal(sales.observedValue, sales.displayValue);
  assert.equal(sales.observedValue, evidence.recomputedSum);
  assert.equal(sales.observedValue - sum(evidence.monthRows), 5166);
});

test('truncated monthly titles resolve by exact year, month, album version and source quantity', () => {
  const expected = new Map([
    [20, [2024, 10, 286809, 'Visionary Vision <Performante> (Cosmo)', 'Performante']],
    [9, [2025, 11, 22316, '<ASSEMBLE25> (Cosmo)', 'ASSEMBLE25']],
    [10, [2025, 9, 15127, '<ASSEMBLE25> (Cosmo)', 'ASSEMBLE25']],
    [11, [2025, 8, 15134, '<ASSEMBLE25> (Cosmo)', 'ASSEMBLE25']],
    [12, [2025, 5, 351416, '<ASSEMBLE25> (Cosmo)', 'ASSEMBLE25']],
  ]);
  for (const adjustment of evidence.annualReplacements) {
    assert.equal(adjustment.titleMappings.length, adjustment.replacedMonthlyRows.length);
    for (const mapping of adjustment.titleMappings) {
      const [year, month, quantity, album, titleToken] = expected.get(mapping.rowIndex);
      const original = evidence.monthRows[mapping.rowIndex];
      assert.deepEqual(mapping.expectedBefore, original);
      assert.deepEqual([original.year, original.month, original.sales], [year, month, quantity]);
      assert.equal(mapping.resolvedAlbum, album);
      assert.equal(adjustment.album, album);
      const source = sources.get(mapping.sourceId);
      assert.ok(source);
      assert.equal(source.chartPeriod, `${year}-${String(month).padStart(2, '0')}`);
      assert.equal(source.url, mapping.sourceUrl);
      assert.ok(source.exactRelevantRows.includes(mapping.exactSourceRow));
      assert.ok(mapping.exactSourceRow.includes(titleToken));
      assert.match(mapping.exactSourceRow, /tripleS.*\(Cosmo\)/);
      assert.ok(mapping.exactSourceRow.includes(quantity.toLocaleString('en-US')));
    }
  }
});

test('ASSEMBLE24, standard editions and Beyond Beauty retain separate release, version and year contributions', () => {
  const replaced = new Set(evidence.annualReplacements.flatMap(row => row.replacedMonthlyRows.map(month => month.rowIndex)));
  for (const index of [3, 4, 5, 6, 7, 8, 13, 14, 16, 21]) assert.ok(!replaced.has(index));
  assert.deepEqual(evidence.monthRows[16], {year: 2025, month: 1, sales: 9888, album: '(Cosmo)'});
  assert.ok(sources.get('assemble24-month-2025-01').exactRelevantRows.some(row => /ASSEMBLE24.*\(Cosmo\).*9,888/.test(row)));
  assert.equal(sum([13, 14, 21].map(index => evidence.monthRows[index])), 93486);
  assert.equal(evidence.monthRows[14].album, '(WITHVUU)');
  assert.equal(evidence.monthRows[21].album, 'Visionary Vision');
  assert.equal(sum([6, 7].map(index => evidence.monthRows[index])), 310273);
  assert.equal(sum([3, 4, 5].map(index => evidence.monthRows[index])), 37723);
  assert.ok(evidence.annualReplacements.every(row => !/Beyond Beauty|ASSEMBLE24|WITHVUU/.test(row.album)));
  assert.equal(evidence.annualReplacements.filter(row => /Visionary Vision/.test(row.album)).length, 1);
  assert.match(sales.scope, /子团.*韩国Circle/);
  assert.equal(sales.asOf, '2026-06');
});

test('source records distinguish readable reproductions from official search indexes and retained observations', () => {
  assert.equal(sources.get('performante-annual-2024').chartPeriod, '2024');
  assert.ok(sources.get('performante-annual-2024').exactRelevantRows.some(row => /Performante.*Cosmo.*289,224/.test(row)));
  assert.equal(sources.get('cosmo-annual-2025').chartPeriod, '2025');
  assert.equal(sources.get('cosmo-annual-2025').publishedAt, '2026-01-14');
  assert.ok(sources.get('cosmo-annual-2025').exactRelevantRows.some(row => /ASSEMBLE25.*Cosmo.*406,744/.test(row)));
  assert.ok(sourceEvidence.captures.every(row => row.publishedAt <= '2026-10-28' && row.httpStatus === 200));
  assert.ok(sourceEvidence.captures.every(row => row.access === 'full-page-read-via-public-https'));
  assert.ok(officialEvidence.observations.every(row => row.access === 'official-search-index-only'));
  assert.equal(sourceEvidence.restrictions.soridataRequests, 0);
  assert.equal(sourceEvidence.restrictions.captchaBypass, false);
  const sourceUrls = new Set(sales.sources.map(row => row.url));
  assert.ok(officialEvidence.excludedSearchResults.every(row => !sourceUrls.has(row.url)));
  assert.deepEqual(sales.sources.slice(0, proposal.expectedBefore.sources.length), proposal.expectedBefore.sources);
  assert.ok(!sales.sources.some(row => /soridata\.com/.test(row.url) && row.checkedAt === '2026-10-28'));
});

test('partial reconciliation leaves the aggregate discrepancy and unknown metrics open', () => {
  const review = evidence.sourceDifferenceReview;
  assert.equal(review.monthlySum, 2087073);
  assert.equal(review.annualNetAdjustment, 5166);
  assert.equal(review.reconciledSum, 2092239);
  assert.equal(review.aggregateTotal, 2458789);
  assert.equal(review.remainingDifference, review.aggregateTotal - review.reconciledSum);
  assert.equal(review.remainingDifference, 366550);
  assert.equal(review.status, 'partially-resolved');
  assert.ok(sales.observedValue < review.aggregateTotal);
  assert.equal(sales.lowerBound, true);
  assert.equal(evidence.lowerBound, true);
  assert.match(sales.scope, /来源覆盖下界.*不是全球完整累计/);
  assert.ok(data.summary.unresolvedSourceDifferences.includes('triples.sales'));
  assert.ok(!data.summary.resolvedSourceDifferences.includes('triples.sales'));
  assert.equal(historicalData.summary.socialFallbackZero + historicalData.summary.salesFallbackZero + historicalData.summary.winsFallbackZero, 17);
});

test('the other 50 groups and tripleS non-sales fields match the pre-change git baseline', () => {
  const otherGroups = Object.fromEntries(Object.entries(historicalData.groups).filter(([slug]) => slug !== 'triples'));
  assert.equal(Object.keys(otherGroups).length, 50);
  assert.equal(hash(otherGroups), baseline.other50Groups);
  assert.equal(hash(Object.fromEntries(Object.entries(data.groups.triples).filter(([field]) => field !== 'sales'))), baseline.triplesOtherFields);
  assert.equal(hash(historicalData.summary), baseline.summary);
});

test('the public group model renders the reconciled integer and retains the unresolved scope', async () => {
  const bundle = await build({entryPoints: ['lib/idol/group-information.mjs'], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent'});
  const {groupInformationModel, renderGroupInformation} = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  const input = {note: 'private-canary', watched: true, average: 9};
  const before = structuredClone(input);
  const model = groupInformationModel('triples', input);
  const html = renderGroupInformation('triples', input);
  assert.equal(model.sales.observedValue, 2092239);
  assert.match(html, /<strong>2,092,239<em>张<\/em><\/strong>/);
  assert.match(html, /366,550/);
  assert.match(html, /来源差异继续开放/);
  assert.match(html, /不是全球完整累计/);
  assert.doesNotMatch(html, /<strong>2,087,073<em>/);
  assert.doesNotMatch(html, /private-canary/);
  assert.deepEqual(input, before);
});
