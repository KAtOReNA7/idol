import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {writeCompletionReport} from '../scripts/build-completion-report.mjs';
import {beforePostV200Statistics} from './helpers/post-v200-statistics.cjs';
import {beforeUserXObservations, userXObservationEvidence as evidence} from './helpers/user-x-observations.cjs';

const data = JSON.parse(fs.readFileSync('data/group-statistics-completion-evidence.json', 'utf8'));
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const expected = [
  ['genblue', 'https://x.com/GENBLUE_ten', '3277', 3277, '3277人'],
  ['vvup', 'https://x.com/vvup_official', '2.9万', 29000, '3万'],
  ['vcha', 'https://x.com/GIRLSETofficial', '3.8万', 38000, '4万'],
  ['everglow', 'https://x.com/everglow_offcl', '1万', 10000, '1万'],
  ['cherrybullet', 'https://x.com/cherrybullet', '18.5万', 185000, '19万'],
];

test('five direct user observations retain their source precision, date and exact account identity', () => {
  assert.equal(evidence.changes.length, 5);
  assert.deepEqual(evidence.changes.map(change => change.key), expected.map(row => row[0] + '.x'));
  for (const [slug, url, raw, value] of expected) {
    const row = data.groups[slug].social.find(item => item.platform === 'x');
    const change = evidence.changes.find(item => item.key === slug + '.x');
    assert.equal(row.url, url);
    assert.equal(row.accountExists, true);
    assert.equal(row.observedValue, value);
    assert.equal(row.displayValue, value);
    assert.equal(row.rawDisplay, raw);
    assert.equal(row.precision, slug === 'genblue' ? 'user-reported-integer' : 'user-reported-rounded');
    assert.equal(row.status, 'observed');
    assert.equal(row.observedAt, '2026-10-28');
    assert.equal(row.checkedAt, '2026-10-28');
    assert.equal(row.observedTimezone, 'Asia/Shanghai');
    assert.equal(row.sourceUrl, url);
    assert.match(row.sourceTitle, /用户人工观察.*未独立抓取/);
    assert.equal(row.identitySourceUrl, change.expectedBefore.identitySourceUrl);
    assert.equal(row.subjectName, change.expectedBefore.subjectName);
    assert.deepEqual(row.sources.slice(0, -1), change.expectedBefore.sources);
    const source = row.sources.at(-1);
    assert.equal(source.kind, 'user-provided-observation');
    assert.equal(source.independentlyFetched, false);
    assert.equal(source.rawDisplay, raw);
    assert.equal(source.url, url);
    assert.equal(hash(change.expectedBefore), change.expectedBeforeSha256Canonical);
    assert.equal(hash(row), change.proposedAfterSha256Canonical);
    assert.doesNotMatch(row.notes.join(' '), /未取得可核实.*人数|按用户设置显示0/);
  }
});

test('restoring precisely five social rows and two summary fields reproduces the complete frozen v199 statistics', () => {
  const v200Data = beforePostV200Statistics(data);
  const original = beforeUserXObservations(data);
  assert.equal(hash(original), '925a0b8ccdf3852197adfa61f522d1427ad9ef8c0b718677e44b1d58ef7362b6');
  assert.equal(hash(original), evidence.expectedBeforeDataSha256Canonical);
  assert.equal(hash(v200Data), evidence.proposedAfterDataSha256Canonical);
  assert.deepEqual(v200Data.summary, {...original.summary, socialObserved: 153, socialFallbackZero: 0});
  const unresolved = Object.values(v200Data.groups).flatMap(group =>
    [...group.social, group.sales, group.wins].filter(row => row.observedValue === null));
  assert.equal(unresolved.length, 10);
  assert.equal(v200Data.summary.salesFallbackZero, 7);
  assert.equal(v200Data.summary.winsFallbackZero, 3);
  assert.equal(v200Data.groups.triples.sales.observedValue, 2092239);
  assert.equal(v200Data.groups.triples.sales.evidence.sourceDifferenceReview.remainingDifference, 366550);
  assert.equal(v200Data.groups.fromis9.sales.observedValue, 1152076);
  assert.deepEqual(v200Data.summary.unresolvedSourceDifferences, ['triples.sales']);
});

test('all five X accounts are visible with established display rounding and user-source labels', async () => {
  const bundle = await build({entryPoints: ['lib/idol/group-information.mjs'], bundle: true, write: false,
    format: 'esm', platform: 'node', logLevel: 'silent'});
  const {groupInformationModel, renderGroupInformation} = await import('data:text/javascript;base64,' +
    Buffer.from(bundle.outputFiles[0].text).toString('base64'));
  for (const [slug, url, raw, , display] of expected) {
    const input = {note: 'private-canary', score: 0, watched: true};
    const original = structuredClone(input);
    const account = groupInformationModel(slug, input).accounts.find(row => row.platform === 'x');
    assert.equal(account.value, display);
    assert.equal(account.fallbackZero, false);
    const html = renderGroupInformation(slug, input);
    assert.ok(html.includes(`href="${url}"`));
    assert.ok(html.includes(`<strong>${display}</strong>`));
    assert.ok(html.includes('原始显示 ' + raw));
    assert.match(html, /用户人工观察/);
    assert.match(html, /2026-10-28/);
    assert.doesNotMatch(html, /private-canary/);
    assert.deepEqual(input, original);
  }
});

test('the generated report uses current statistics while clearly dating its historical image and layout inventory', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'idol-x-stat-report-'));
  fs.mkdirSync(path.join(out, 'review-all'));
  writeCompletionReport(out);
  const html = fs.readFileSync(path.join(out, 'review-all/completion-report.html'), 'utf8');
  assert.match(html, /统计资料更新：2026-10-28/);
  assert.match(html, /图片与个人页排版沿用2026-10-26盘点，不表示本次重新全量审查/);
  assert.match(html, /<strong>当前统计与历史图片盘点<\/strong>/);
  assert.match(html, /图片缺口、图片覆盖与个人页布局数字及下载清单沿用2026-10-26历史快照，不代表当前待办/);
  assert.match(html, /<li>2026-10-26历史图片盘点：628个精确视频封面齐全/);
  assert.match(html, /<h2 id="portraits">MV图片与成员评分（2026-10-26历史盘点）<\/h2>/);
  assert.match(html, /下载2026-10-26历史待补认人图清单（CSV，不代表当前缺口）/);
  assert.match(html, /153个已核实账号：153项人数可用，0项人数待核/);
  assert.match(html, /47团有范围明确的销量数据，4团暂缺/);
  assert.doesNotMatch(html, /147项人数可用|6项未查得可靠数字|42团有范围明确/);
  for (const [slug, url, , , display] of expected) assert.ok(html.includes(`<a href="${url}">${display}</a>`), slug);
});
