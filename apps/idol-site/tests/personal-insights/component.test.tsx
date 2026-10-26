/**
 * SSR and source-structure checks only.
 * Mounted keyboard, focus, callbacks, refresh effects and viewport checks are
 * separate browser acceptance work; none are claimed by this file.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';
import { PersonalInsights } from '../../components/personal-insights/PersonalInsights';
import { catalog, deepFreeze, forbidRead, group, member, rating, stage, work } from './fixtures';

function plain(markup: string): string {
  return markup.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
}
function table(html: string, caption: string): string {
  const found = (html.match(/<table\b[^>]*>[\s\S]*?<\/table>/g) ?? [])
    .find((item) => item.includes(caption));
  assert.ok(found, 'missing table caption: ' + caption);
  return found;
}
function bodyRows(markup: string): string[] {
  const body = markup.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
  return body.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/g) ?? [];
}
function cells(row: string): string[] {
  return (row.match(/<td\b[^>]*>[\s\S]*?<\/td>/g) ?? []).map(plain);
}
function zeroCatalog() {
  return catalog({
    groups: [group('g')], members: [member('m', { favorite: 10 })],
    works: [work('w', { groupIds: ['g'], ratingIds: ['r'], score: 0, stage: stage(), stageScore: 10 })],
    ratings: [rating('r', { memberIds: ['m'], workIds: ['w'], score: 0, stylingScore: 0 })],
  });
}
function highCatalog() {
  return catalog({
    groups: [group('g')], members: [member('m')],
    works: [work('w', { groupIds: ['g'], ratingIds: ['r'], score: 9 })],
    ratings: [rating('r', { memberIds: ['m'], workIds: ['w'], score: 0, stylingScore: 10 })],
  });
}

test('SSR leaves private fields and birthdays unread across every input table', () => {
  const input = highCatalog();
  for (const rows of [input.groups, input.members, input.works, input.ratings]) {
    for (const item of rows) forbidRead(item, ['note', 'memory', 'profile', 'birthDate', 'favorite', 'source', 'photo']);
  }
  const html = renderToStaticMarkup(<PersonalInsights catalog={deepFreeze(input)}
    memberLabel={item => item.name}/>);
  assert.ok(html.includes('TEST ONLY Member m'));
  assert.ok(html.includes('TEST ONLY Work w'));
});

test('SSR empty state exposes separate domains and honest empty values', () => {
  const html = renderToStaticMarkup(
    <PersonalInsights catalog={catalog()} memberLabel={(item) => item.stageName}/>,
  );
  assert.match(html, /<h2\b[^>]*>从评分里看看喜欢什么<\/h2>/);
  for (const title of ['MV 观看记录', '作品评分', '团体比较 · MV', '成员表现与造型', 'MV 高分重温']) {
    assert.ok(html.includes(title), 'missing heading: ' + title);
  }
  assert.match(html, /<dt>MV 均分<\/dt><dd>—<\/dd>/);
  assert.ok(html.includes('暂时没有可统计的 MV 观看记录。'));
  assert.ok(html.includes('暂时没有可比较的成员评分'));
  assert.ok(html.includes('暂时没有 MV 高分重温作品。'));
  assert.match(html, /<legend>评分范围<\/legend>/);
  const radios = html.match(/<input\b[^>]*>/g) ?? [];
  const mvRadio = radios.find(tag => /\btype="radio"/.test(tag) && /\bvalue="mv"/.test(tag));
  assert.ok(mvRadio, 'missing MV radio');
  assert.match(mvRadio, /\bchecked=""/);
  assert.ok(radios.some(tag => /\btype="radio"/.test(tag) && /\bvalue="stage"/.test(tag)));
  assert.doesNotMatch(html, /NaN|Infinity/);
});

test('SSR zero appears in the MV summary and independent member cells, not as missing', () => {
  const html = renderToStaticMarkup(
    <PersonalInsights catalog={zeroCatalog()} memberLabel={(item) => item.stageName}/>,
  );
  assert.match(html, /<dt>MV 均分<\/dt><dd>0<\/dd>/);
  assert.ok(html.includes('0 分属于有效评分，不计作未填写。'));
  const groups = bodyRows(table(html, '团体的 MV 评分'));
  const members = bodyRows(table(html, '成员表现和造型的独立均分与样本数'));
  assert.equal(groups.length, 1);
  assert.equal(cells(groups[0])[2], '0');
  assert.equal(members.length, 1);
  assert.deepEqual(cells(members[0]).slice(0, 4), ['0', '1', '0', '1']);
  const histogram = html.match(/<ol\b[^>]*aria-label="MV评分分布"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(histogram);
  assert.equal((histogram[1].match(/<li\b/g) ?? []).length, 11);
});

test('SSR disabled state disables native controls and never calls drilldown callbacks', () => {
  const calls: string[] = [];
  const labels: string[] = [];
  const html = renderToStaticMarkup(<PersonalInsights
    catalog={highCatalog()} disabled
    memberLabel={(item) => { labels.push(item.id); return 'TEST ONLY host member label'; }}
    onGroup={(id) => { calls.push('group:' + id); }}
    onMember={(id) => { calls.push('member:' + id); }}
    onWork={(id) => { calls.push('work:' + id); }}
  />);
  assert.deepEqual(calls, []);
  assert.ok(labels.includes('m'));
  assert.ok(html.includes('TEST ONLY host member label'));
  assert.ok(html.includes('aria-label="打开作品：TEST ONLY Work w"'));
  const buttonTags = html.match(/<button\b[^>]*>/g) ?? [];
  assert.ok(buttonTags.length >= 3);
  for (const tag of buttonTags) {
    assert.match(tag, /\btype="button"/);
    assert.match(tag, /\bdisabled=""/);
  }
  const fieldsets = html.match(/<fieldset\b[^>]*>/g) ?? [];
  assert.ok(fieldsets.length >= 2);
  for (const tag of fieldsets) assert.match(tag, /\bdisabled=""/);
  for (const tag of html.match(/<select\b[^>]*>/g) ?? []) assert.match(tag, /\bdisabled=""/);
  assert.doesNotMatch(html, /<a\b/);
});

test('SSR without host callbacks renders identities as text and invents no navigation URLs', () => {
  const html = renderToStaticMarkup(
    <PersonalInsights catalog={highCatalog()} memberLabel={(item) => item.stageName}/>,
  );
  assert.ok(html.includes('TEST ONLY Group g'));
  assert.ok(html.includes('TEST ONLY m'));
  assert.ok(html.includes('可在作品页查看'));
  assert.doesNotMatch(html, /class="pi-text-button"/);
  assert.doesNotMatch(html, /aria-label="打开作品：/);
  assert.doesNotMatch(html, /<a\b|javascript:|href=/);
});

test('SSR distinguishes wholly invalid member scores from genuinely empty scores', () => {
  const input = catalog({
    members: [member('m')],
    works: [work('invalid-work', { ratingIds: ['invalid'] }), work('empty-work', { ratingIds: ['empty'] })],
    ratings: [
      rating('invalid', { memberIds: ['m'], workIds: ['invalid-work'], score: 11 }),
      rating('empty', { memberIds: ['m'], workIds: ['empty-work'] }),
    ],
  });
  const html = renderToStaticMarkup(
    <PersonalInsights catalog={input} memberLabel={(item) => item.stageName}/>,
  );
  assert.ok(html.includes('1 条记录尚无评分。'));
  assert.ok(html.includes('1 条记录的分数无效，未计入个人均分。'));
  assert.ok(!html.includes('2 条记录尚无评分。'));
});

test('SSR first page bounds all three data lists at ten items without simulating clicks', () => {
  const input = catalog({
    groups: Array.from({ length: 25 }, (_, i) => group('g' + i)),
    members: Array.from({ length: 25 }, (_, i) => member('m' + i)),
    works: Array.from({ length: 25 }, (_, i) => work('w' + i, {
      groupIds: ['g' + i], ratingIds: ['r' + i], score: 9,
    })),
    ratings: Array.from({ length: 25 }, (_, i) => rating('r' + i, {
      memberIds: ['m' + i], workIds: ['w' + i], score: 0, stylingScore: 10,
    })),
  });
  const html = renderToStaticMarkup(
    <PersonalInsights catalog={input} memberLabel={(item) => item.stageName}/>,
  );
  assert.equal(bodyRows(table(html, '团体的 MV 评分')).length, 10);
  assert.equal(bodyRows(table(html, '成员表现和造型的独立均分与样本数')).length, 10);
  const revisit = html.match(/<ol\b[^>]*class="pi-revisit-list"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(revisit);
  assert.equal((revisit[1].match(/<li\b/g) ?? []).length, 10);
  assert.ok(revisit[1].includes('TEST ONLY Work w9'));
  assert.ok(!revisit[1].includes('TEST ONLY Work w10'));
  const next = (html.match(/<button\b[^>]*>/g) ?? [])
    .find((tag) => tag.includes('aria-label="团体比较下一页"'));
  assert.ok(next);
  assert.doesNotMatch(next, /\bdisabled=/);
});

test('source boundary keeps native controls and local analysis; this is not a mounted behavior test', () => {
  const sourceRoot = process.env.PERSONAL_INSIGHTS_SOURCE_ROOT
    ?? fileURLToPath(new URL('../../', import.meta.url));
  const filename = path.join(sourceRoot, 'components/personal-insights/PersonalInsights.tsx');
  const source = ts.createSourceFile(filename, readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const permittedImports = new Set([
    'react', '../../lib/idol/personal-insights/view-state', '../../lib/idol/types', '../../lib/idol/personal-insights', './personal-insights.css',
  ]);
  let buttons = 0;
  let fieldsets = 0;
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      assert.ok(permittedImports.has(node.moduleSpecifier.text),
        'unexpected dependency: ' + node.moduleSpecifier.text);
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (ts.isIdentifier(node.tagName)) {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const attr = (name: string) => attributes.find((item) => item.name.getText(source) === name);
        if (node.tagName.text === 'button') {
          buttons += 1;
          const type = attr('type')?.initializer;
          assert.ok(type && ts.isStringLiteral(type) && type.text === 'button');
          assert.ok(attr('disabled'), 'each native button needs an explicit disabled policy');
        }
        if (node.tagName.text === 'fieldset') {
          fieldsets += 1;
          assert.ok(attr('disabled'), 'radio groups inherit the native disabled state');
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(buttons >= 3);
  assert.ok(fieldsets >= 2);
  // These are dependency boundaries, not proof that any DOM effect has run.
  assert.doesNotMatch(source.text, /\b(?:fetch|localStorage|sessionStorage)\s*(?:\(|\.)/);
});

test('controlled view state renders restored stage domain, pagination and member drilldown', () => {
  const works = Array.from({length: 25}, (_, i) => work('recW' + i, {groupIds: ['recG'], ratingIds: ['recR' + i], score: 1, stage: stage(), stageScore: 9}));
  const input = catalog({groups: [group('recG')], members: [member('recM')], works,
    ratings: works.map((w, i) => rating('recR' + i, {memberIds: ['recM'], workIds: [w.id], score: 8}))});
  const state = {domain: 'stage', groupSort: 'samples', memberMetric: 'styling', revisitKind: 'high-score', pageSize: 10,
    groupsPage: 1, membersPage: 1, revisitPage: 2, tracePage: 2, selectedMemberId: 'recM'} as const;
  const html = renderToStaticMarkup(<PersonalInsights catalog={input} memberLabel={m => '中文 ' + m.id}
    isStageScoreEligible={() => true} viewState={state} onViewStateChange={() => {}} onWork={() => {}}/>);
  assert.match(html, /<dt>舞台 均分<\/dt><dd>9<\/dd>/);
  assert.match(html, /<ol class="pi-revisit-list" start="11">/);
  assert.match(html, /中文 recM · 关联作品/);
  assert.match(html, /data-browse-anchor="insights-trace-recM-recW20"/);
  assert.match(html, /data-browse-anchor="insights-revisit-recW10"/);
  assert.doesNotMatch(html, /均分可作初步参考/);
  assert.match(html, /<details[^>]*>[\s\S]*0 分属于有效评分/);
});
test('restored deleted member and out-of-range pages render honest fallback immediately', () => {
  const state = {domain: 'mv', groupSort: 'mean', memberMetric: 'performance', revisitKind: 'high-score', pageSize: 20,
    groupsPage: 999, membersPage: 999, revisitPage: 999, tracePage: 999, selectedMemberId: 'recDeleted'} as const;
  const html = renderToStaticMarkup(<PersonalInsights catalog={highCatalog()} memberLabel={m => m.name}
    viewState={state} onViewStateChange={() => {}} onWork={() => {}}/>);
  assert.match(html, /<ol class="pi-revisit-list" start="1">/);
  assert.doesNotMatch(html, /class="pi-trace"/);
  assert.match(html, /data-insights-focus="fallback"/);
  assert.match(html, /TEST ONLY Work w/);
});
