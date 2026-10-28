import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {beforeUserXObservations} from './helpers/user-x-observations.cjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const root = '../../docs/codex/evidence/20261028-stage-fill/';
const data = read('data/group-statistics-completion-evidence.json');
const proposal = read(root + 'statistics-adoption-proposal.json');
const laterEvidence = read('../../docs/codex/evidence/20261028-continuous/evidence-upgrade-proposal-c.json');
// Evidence-only additions are checked separately; restore their exact preimage for this historical cohort.
const historicalData = beforeUserXObservations(data);
historicalData.groups.triples.sales = laterEvidence.statistics.expectedBefore;
const captures = read(root + 'statistics-primary-observations-c.json');
const research = read(root + 'statistics-followup.json');
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
    : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const beforeHash = '57bf3cb6c825ced3fa3b1abea9d7c0c21918b18c2cdbfd10a4f081af0fc14658';

test('only the two reviewed sales objects and summary counts differ from the frozen baseline', () => {
  const restored = structuredClone(historicalData);
  assert.deepEqual(proposal.items.map(row => row.key), ['badvillain.sales', 'bewave.sales']);
  for (const change of proposal.items) {
    const [slug, field] = change.key.split('.');
    assert.equal(hash(change.expectedBefore), change.expectedBeforeSha256Canonical);
    assert.equal(hash(change.proposedAfter), change.proposedAfterSha256Canonical);
    assert.deepEqual(data.groups[slug][field], change.proposedAfter);
    assert.equal(change.expectedBefore.observedValue, null);
    assert.deepEqual(change.proposedAfter.evidence.previousEvidence, change.expectedBefore.evidence);
    restored.groups[slug][field] = change.expectedBefore;
  }
  restored.summary = proposal.expectedBeforeSummary;
  assert.equal(proposal.expectedBeforeDataSha256Canonical, beforeHash);
  assert.equal(hash(restored), beforeHash);
  assert.equal(hash(historicalData), proposal.proposedAfterDataSha256Canonical);
  const expectedSummary = {...proposal.expectedBeforeSummary,
    salesObserved: proposal.expectedBeforeSummary.salesObserved + 2,
    salesLowerBoundsAdded: proposal.expectedBeforeSummary.salesLowerBoundsAdded + 2,
    salesFallbackZero: proposal.expectedBeforeSummary.salesFallbackZero - 2};
  assert.deepEqual(historicalData.summary, expectedSummary);
  assert.deepEqual(historicalData.summary, proposal.proposedAfterSummary);
  assert.equal(historicalData.summary.socialFallbackZero + historicalData.summary.salesFallbackZero + historicalData.summary.winsFallbackZero, 15);
});

test('three disjoint official Album weekly rows recompute the limited counts without cumulative or Retail fields', () => {
  const expected = {badvillain: {value: 5367, rows: [[23, 2962], [24, 2405]], album: 'OVERSTEP', id: '76819'},
    bewave: {value: 725, rows: [[16, 725]], album: 'BE;WAVE', id: '76300'}};
  for (const [slug, target] of Object.entries(expected)) {
    const sales = data.groups[slug].sales;
    const evidence = sales.evidence;
    assert.deepEqual(evidence.weekRows.map(row => [row.week, row.sales]), target.rows);
    assert.equal(new Set(evidence.weekRows.map(row => [row.year, row.week, row.albumId].join('/'))).size, target.rows.length);
    assert.equal(evidence.weekRows.reduce((n, row) => n + row.sales, 0), target.value);
    assert.equal(sales.observedValue, target.value);
    assert.equal(sales.displayValue, target.value);
    assert.equal(evidence.recomputedSum, target.value);
    assert.equal(evidence.album, target.album);
    assert.equal(evidence.albumId, target.id);
    assert.equal(evidence.metricField, 'Album_CNT');
    assert.equal(evidence.chart, 'Circle Album Chart');
    assert.equal(evidence.coverageComplete, false);
    assert.equal(sales.lowerBound, true);
    assert.match(sales.title, /已核.*周销量下界/);
    assert.match(sales.scope, /不是全团或全球完整累计/);
    assert.match(sales.scope, /其他时期、版本及作品未覆盖/);
    for (const row of evidence.weekRows) {
      const capture = captures.find(item => item.url === row.sourceUrl);
      assert.ok(capture);
      const response = capture.publicChartResponse ?? capture;
      const parameters = capture.publicPageRequestParameters ?? capture.parameters;
      assert.equal(parameters.termGbn, 'week');
      assert.equal(Number(parameters.hitYear), row.year);
      assert.equal(Number(parameters.targetTime), row.week);
      assert.equal(response.sha256, row.responseSha256);
      assert.equal(response.status ?? response.httpStatus, 200);
      assert.match(response.endpoint ?? response.api, /\/data\/api\/chart\/album$/);
      const original = response.matchingRows.find(item => item.seq_aoa === row.albumId);
      assert.equal(original.ALBUM_NAME, row.album);
      assert.equal(Number(original.Album_CNT), row.sales);
      assert.equal(Number(original.SERVICE_RANKING), row.rank);
      assert.notEqual(row.sales, Number(original.Total_CNT));
      assert.ok(!/retail/i.test(row.sourceUrl));
    }
  }
  const grounding = captures.find(row => row.kind === 'album_field_ui_grounding');
  assert.equal(grounding.sourceApi, '/data/api/chart/album');
  assert.match(grounding.uiRenderScriptExcerpt, /termGbn\.toLowerCase\(\) === "week"/);
  assert.match(grounding.uiRenderScriptExcerpt, /Row_Album_CNT/);
});

test('the historical nine-item audit retains its then-unapplied single-day Retail finding', () => {
  assert.equal(research.items.length, 9);
  assert.equal(new Set(research.items.map(item => item.key)).size, 9);
  const retail = research.items.find(item => item.key === 'geenius.sales');
  assert.equal(retail.value, 217);
  assert.equal(retail.status, 'conditional_scoped_retail_lower_bound');
  assert.equal(retail.metric, 'circle_retail_album_daily_count');
  assert.equal(historicalData.groups.geenius.sales.observedValue, null);
  for (const slug of ['vvup', 'tracer', 'witchx', 'spia', 'udtt', 'vcha']) {
    assert.equal(data.groups[slug].sales.observedValue, null);
    assert.ok(research.items.find(item => item.key === slug + '.sales').nextAction);
  }
});

test('public models expose exact integer counts together with visible limited-period labels', async () => {
  const bundle = await build({entryPoints: ['lib/idol/group-information.mjs'], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent'});
  const {groupInformationModel, renderGroupInformation} = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  for (const [slug, value, display, label] of [['badvillain', 5367, '5,367', '已核两周销量下界'], ['bewave', 725, '725', '已核单周销量下界']]) {
    const input = {note: 'private-canary', watched: true, average: 9};
    const before = structuredClone(input);
    assert.equal(groupInformationModel(slug, input).sales.observedValue, value);
    const html = renderGroupInformation(slug, input);
    assert.ok(html.includes(`<strong>${display}<em>张</em></strong>`));
    assert.ok(html.includes(`<small>${label}</small>`));
    assert.match(html, /不是全团或全球完整累计/);
    assert.doesNotMatch(html, /private-canary/);
    assert.deepEqual(input, before);
  }
});
