const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {load, syntheticCatalog} = require('./helpers/sol-review-loader.cjs');
const model = load('lib/idol/design-review/sol-review-model.ts');
const host = load('components/design-review/sol-visual-review.tsx');
const rejected = /把一瞬|留成余香|留香日记|留香时间轴|a scene to remember|FIVE VOICES, ONE SCENT|SCENE × SCENT|五个名字，一起留香|把场景收藏成唱片|让音乐唤起场景|紫夜留声|每一种不同|都有自己的|不是相同，才有共鸣|声音、奇想|紫色的余韵|幽暗旅馆里的一次出逃|一张唱片，一个奇异世界|以独立的唱片视觉|留下这一时期的声音|从这一段影像，重返|让唱片封面成为入口/;
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const text = html => html.replace(/<[^>]*>/g, '');
for (const slug of ['rescene', 'purplekiss']) {
  const catalog = syntheticCatalog(slug);
  const source = model.solPublicSource(slug);
  const timeline = JSON.parse(fs.readFileSync(`data/artist-timelines/${slug}.json`, 'utf8'));
  const render = fields => renderToStaticMarkup(React.createElement(host.default, {slug, catalogOverride: catalog, timelineOverride: timeline, serverRoute: model.solReviewHref(slug, fields)}));
  test(`${slug}: all views, members and works exclude invented marketing copy`, () => {
    const routes = [{}, {section: 'members'}, {section: 'works'}, {section: 'works', format: 'mv'}, {section: 'works', format: 'stage'}, {section: 'updates'}, ...source.members.map(member => ({section: 'members', member: member.id})), ...source.works.map(model.solWorkFields)];
    for (const route of routes) assert.doesNotMatch(text(render(route)), rejected, JSON.stringify(route));
    const home = render({});
    assert.equal(text(home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]), source.name);
    for (const label of ['首页', '成员', '作品', '时间轴']) assert.ok(home.includes(`>${label}</a>`), label);
  });
  test(`${slug}: canonical research prose stays in source disclosures`, () => {
    const html = render({section: 'updates'});
    const outsideDetails = html.replace(/<details\b[\s\S]*?<\/details>/g, '');
    for (const event of model.solReviewTimeline(slug, timeline, catalog).events) {
      assert.ok(html.includes(esc(event.title)), event.id);
      if (event.summary) {
        assert.ok(html.includes(esc(event.summary)), `source evidence retained: ${event.id}`);
        assert.ok(!outsideDetails.includes(esc(event.summary)), `research prose not in display body: ${event.id}`);
      }
    }
  });
}
test('source labels distinguish media interviews from official and platform records', () => {
  const rescene = model.solPublicSource('rescene');
  assert.ok(rescene.members.every(member => member.sources.some(source => source.label === 'HelloKpop 成员专访')));
  const purplekiss = model.solPublicSource('purplekiss');
  assert.equal(purplekiss.works.filter(work => work.kind === 'release').length, 13);
  assert.ok(purplekiss.works.filter(work => work.kind === 'release').every(work => work.description === ''));
  for (const source of purplekiss.members.flatMap(member => member.sources)) {
    if (source.url.includes('kpopofficial.com')) assert.equal(source.label, 'Kpopofficial 具名肖像报道');
    if (source.url.includes('enews.imbc.com')) assert.equal(source.label, 'iMBC 具名肖像报道');
  }
});
