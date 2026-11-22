const assert = require('node:assert/strict');
const test = require('node:test');
const React = require('react');
const {renderToReadableStream} = require('react-dom/server');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, artistCatalog, renderArtist, bundlePages} = require('./fixtures/current-artist-pages.cjs');
const identities = require('../data/shared-artist-member-identities.json');
const renderer = bundlePages();

async function firstResponse(slug, searchParams) {
  const page = React.createElement(renderer.pages[slug], {searchParams: Promise.resolve(searchParams)});
  const stream = await renderToReadableStream(page);
  await stream.allReady;
  return parse(await new Response(stream).text());
}

for (const slug of ['itzy', 'lesserafim']) {
  const group = registry.find(item => item.slug === slug);
  const roster = identities[group.groupId];
  const content = require('../data/' + slug + '-artist.json');

  test(slug + ' sends the selected public identity, exact original and native return in the first route response', async () => {
    const live = artistCatalog(group);
    const actual = live.members.filter(m => m.groupIds.includes(group.groupId) || m.formerGroupIds?.includes(group.groupId));
    assert.deepEqual(roster.map(m => m.id).sort(), actual.map(m => m.id).sort());
    for (const person of roster) {
      const query = {section: 'members', member: person.id};
      const doc = await firstResponse(slug, query);
      const main = doc.querySelector('main');
      const identity = main.querySelector('[data-member-module="identity"]');
      assert.equal(identity.getAttribute('data-member-id'), person.id);
      assert.equal(main.querySelectorAll('h1').length, 1);
      assert.equal(identity.querySelector('h1').text, person.cnName + ' · ' + person.stageName);
      assert.ok(identity.text.includes(person.birthDate));
      assert.equal(doc.querySelector('.iz-hero, .lf-hero'), null);
      assert.match(main.querySelector('[role="status"]').text, /正在加载成员影像与评分/);
      assert.equal(main.querySelector('[data-member-module="scores"], [data-member-module="works"]'), null);
      const back = main.querySelector('.iz-back, .lf-back');
      assert.equal(back.getAttribute('href'), group.path + '?section=members#member-' + person.id);
      const personal = identity.querySelector('a[href*="view=members"]');
      const destination = new URL(personal.getAttribute('href'), 'https://stage.test');
      assert.equal(destination.searchParams.get('member'), person.id);
      assert.equal(destination.searchParams.get('returnTo'), group.path + '?section=members&member=' + person.id);

      const photo = content.memberVisuals[person.stageName];
      if (photo) {
        const expected = content.portraitPreviews?.[photo.image] ?? photo.image;
        assert.equal(identity.querySelector('figure img').getAttribute('src'), expected);
        const links = identity.querySelectorAll('figure a[data-original-photo]');
        assert.deepEqual(links.map(a => a.getAttribute('href')), [photo.image, photo.image]);
        assert.ok(identity.querySelectorAll('figure details a').some(a => a.getAttribute('href') === photo.identitySourceUrl));
      } else {
        assert.equal(person.stageName, 'KIM GARAM');
        assert.match(identity.text, /历史成员/);
        assert.match(identity.text, /FEARLESS · Black Petrol/);
        const old = require('../data/mv-recognition-editions.json')['lsf-fearless'].portraits[person.id];
        assert.equal(identity.querySelector('figure img').getAttribute('src'), old.preview);
        assert.equal(identity.querySelector('a[data-original-photo]').getAttribute('href'), old.original);
        assert.ok(identity.querySelectorAll('figure a').some(a => a.getAttribute('href') === old.sourceUrl));
        assert.doesNotMatch(identity.text, /日本官网成员照/);
      }
    }
  });

  test(slug + ' resolves unknown and other-group links without presenting another identity', async () => {
    const other = Object.entries(identities).find(([groupId]) => groupId !== group.groupId)[1][0];
    for (const id of ['recNotInThisBand', other.id]) {
      const query = {section: 'members', member: id};
      const initial = await firstResponse(slug, query);
      assert.equal(initial.querySelector('[data-member-module="identity"]'), null);
      assert.match(initial.querySelector('main').text, /正在查找成员/);
      const ready = parse(await renderArtist(group, query));
      assert.equal(ready.querySelector('[data-member-module="identity"]'), null);
      assert.match(ready.querySelector('main').text, /这个成员不在/);
      assert.equal(ready.querySelector('main a').getAttribute('href'), group.path + '?section=members');
    }
  });

  test(slug + ' preserves the query and provides a focusable roster link for every current or historical profile', async () => {
    const query = {section:'members', q:'return'};
    const directory = parse(await renderArtist(group, query));
    for (const person of roster) {
      const card = directory.querySelector('#member-' + person.id);
      assert.equal(card.tagName, 'A');
      assert.equal(card.getAttribute('data-artist-member-trigger'), person.id);
      const url = new URL(card.getAttribute('href'), 'https://stage.test');
      assert.equal(url.searchParams.get('member'), person.id);
      assert.equal(url.searchParams.get('q'), 'return');
      const shared = await firstResponse(slug, {...query, member: person.id});
      assert.equal(shared.querySelector('.iz-back, .lf-back').getAttribute('href'), group.path + '?section=members&q=return#member-' + person.id);
    }
  });
}

test('the first-response identity list contains only approved public profile fields', () => {
  const fields = ['id','name','cnName','stageName','groupIds','formerGroupIds','status','birthDate','country','role','profile','officialUrl'].sort();
  for (const member of Object.values(identities).flat()) {
    assert.deepEqual(Object.keys(member).sort(), fields);
  }
});
