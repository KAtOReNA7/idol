const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const design = require('../data/candyshop-native-design.json');
const content = require('../data/candyshop-artist.json');
const group = registry.find(row => row.slug === 'candyshop');
const render = async query => parse(await renderArtist(group,query));

test('Candy Shop keeps each video on a single card and places every MV before stage and release cards', async () => {
  const page = await render({section:'works'});
  assert.deepEqual(page.querySelectorAll('.cs-related h2').map(h=>h.text), ['MV','舞台','唱片']);
  const cards = page.querySelectorAll('article.cs-video-row,article.cs-record');
  assert.equal(cards.length,10);
  assert.ok(cards.every(card => card.querySelectorAll('a').length === 1));
  assert.deepEqual(cards.slice(0,7).map(card=>card.getAttribute('data-video-key')), [
    ...design.works.filter(work=>work.type==='MV'), ...design.works.filter(work=>work.type==='STAGE'),
  ].map(work=>work.key));
  for (const card of cards.slice(0,7)) assert.ok(card.querySelector('a[href^="/"]'));
});

test('Candy Shop exposes all five portraits and preserves each album original on demand', async () => {
  const members = await render({section:'members'});
  assert.deepEqual(members.querySelectorAll('.cs-member [data-artist-member-trigger]').map(a=>a.getAttribute('data-artist-member-trigger')), design.members.map(m=>m.id));
  const sources = members.querySelector('.group-roster-source');
  assert.ok(sources.querySelector('a[href="https://candy-shop.jp/about"]'));
  assert.ok(sources.querySelector('a[href="'+content.portraits.recvxAPQCFyiww.sourceUrl+'"]'));
  for (const release of design.releases) {
    const page = await render({section:'works',release:release.key});
    const picture = page.querySelector('.cs-release-detail [data-original-photo]');
    assert.equal(picture.getAttribute('href'),release.cover);
    assert.equal(picture.querySelector('img').getAttribute('src'),release.displayCover);
    const size = resource=>fs.statSync(path.join(__dirname,'../public',resource)).size;
    assert.ok(size(release.displayCover)<size(release.cover));
  }
});
