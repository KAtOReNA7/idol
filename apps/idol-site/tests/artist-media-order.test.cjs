const assert = require('node:assert/strict');
const test = require('node:test');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, nativeSlugs, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const groups = require('./fixtures/artist-media-order.cjs');

function cardOrder(document, videoSelector, releaseSelector, route) {
  const cards = document.querySelectorAll(videoSelector + (releaseSelector ? ', ' + releaseSelector : ''));
  const videos = document.querySelectorAll(videoSelector);
  assert.ok(videos.length, route + ' video card ' + videoSelector);
  if (releaseSelector) {
    const releases = document.querySelectorAll(releaseSelector);
    assert.ok(releases.length, route + ' release card ' + releaseSelector);
    assert.equal(cards[0], videos[0], route + ' must present its first MV before its first release');
  }
}

function navigationOrder(document, route) {
  const menus = document.querySelectorAll('nav,.sr-row-links,.nj-library-nav,.bf-tabs');
  for (const menu of menus) {
    const labels = menu.querySelectorAll('a,button').map(link=>link.text.trim());
    const video = labels.findIndex(label=>/^(?:MV(?: 与舞台)?|影像)(?:\s*(?:\d+|↓))?$/.test(label));
    const release = labels.findIndex(label=>/^(?:音乐|发行|唱片发行)(?:\s*(?:\d+|↓))?$/.test(label));
    if (video >= 0 && release >= 0) assert.ok(video < release, route + ' navigation ' + labels.join(' / '));
  }
}

const reactGroups = registry.filter(group=>!nativeSlugs.has(group.slug));
test('the MV order fixtures cover every React group design', () => {
  assert.deepEqual([...groups.keys()].sort(), reactGroups.map(group=>group.slug).sort());
});

for (const group of reactGroups) {
  test(group.slug + ' presents MV cards before releases on its home and works pages', async () => {
    const scope = groups.get(group.slug);
    for (const [query, video, release] of [
      [{}, scope.homeVideo, scope.homeRelease],
      [{section:'works'}, scope.worksVideo, scope.worksRelease],
      ...(scope.recordsVideo ? [[{section:'records'}, scope.recordsVideo, scope.recordsRelease]] : []),
    ]) {
      const document = parse(await renderArtist(group, query));
      const route = group.path + (query.section ? '?section=' + query.section : '');
      cardOrder(document, video, release, route);
      navigationOrder(document, route);
    }
  });
}

const cases = require('../../../docs/codex/evidence/20261122-v211/react-featured-mv-targets.json').cards;

function primaryAction(document, card) {
  if (card.slug === 'idle') return document.querySelector('.idv-hero-mv');
  const selector = card.origin === 'external-before-catalog'
    ? '[data-media-id="' + card.card + '"]'
    : ['data-video-key','data-media-key','data-artist-media'].map(attr=>'[' + attr + '="' + card.card + '"]')
      .concat('[data-genblue-link-trigger="media:' + card.card + '"]').join(', ');
  const item = document.querySelector(selector);
  return item?.getAttribute('href') || item?.tagName === 'BUTTON' ? item : item?.querySelector('a');
}

test('featured MV actions have the same verified destination before and after catalog loading', async () => {
  for (const group of reactGroups) {
    const affected = cases.filter(card=>card.slug === group.slug);
    if (!affected.length) continue;
    for (const document of [
      parse(await renderArtist(group, {}, null, {loading:true})),
      parse(await renderArtist(group)),
    ]) {
      for (const card of affected) {
        const action = primaryAction(document, card);
        assert.ok(action, group.slug + ' ' + card.sourceVideoId);
        const url = new URL(action.getAttribute('href') || '', 'https://example.invalid');
        assert.equal(url.searchParams.get('work'), card.workId, group.slug + ' ' + card.sourceVideoId);
        if (card.workId) {
          assert.equal(url.pathname, '/');
          assert.equal(url.origin, 'https://example.invalid');
          assert.equal(url.searchParams.get('returnTo'), group.path);
        } else if (card.slug === 'atheart' || card.slug === 'witchx') {
          assert.equal(action.tagName, 'A', group.slug + ' ' + card.card + ' can be opened before hydration');
          assert.equal(url.origin, 'https://example.invalid');
          assert.equal(url.pathname, group.path);
          assert.equal(url.searchParams.get('section'), 'works');
          assert.equal(url.searchParams.get('format'), 'mv');
          assert.equal(url.searchParams.get('media'), card.card);
        }
      }
    }
  }
});

test('ambiguous or outdated public MV sources keep their original destination', async () => {
  const group = reactGroups.find(group=>group.slug === 'cherrybullet');
  const {artistCatalog} = require('./fixtures/current-artist-pages.cjs');
  const card = cases.find(card=>card.slug === group.slug);
  const catalog = artistCatalog(group);
  const approved = catalog.works.find(work=>work.id === card.workId);
  assert.ok(approved);
  for (const works of [
    catalog.works.filter(work=>work.id !== card.workId),
    [...catalog.works, {...approved, id:'ambiguous-fixture-id'}],
    catalog.works.map(work=>work.id === card.workId ? {...work, groupIds:[]} : work),
  ]) {
    const document = parse(await renderArtist(group, {}, {...catalog, works}));
    const href = primaryAction(document, card).getAttribute('href');
    assert.equal(new URL(href).searchParams.get('v'), card.sourceVideoId);
  }
});
