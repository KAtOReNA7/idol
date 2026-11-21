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

const heroWorks = [
  ['ive', 'LOVE DIVE', 'recvxyHuKMaCIP', 'ive-release-love-dive'],
  ['geenius', 'Voyage', 'rec28ldfRTrPmh', 'voyage'],
  ['spia', 'Daddy’s Little Girl', 'rec28ldfRTrPua', 'deeeep'],
  ['everglow', 'CODE', 'recvxyH5pznMiW', 'everglow-bugs-4141746'],
  ['rocketpunch', 'BOOM', 'recvxyH5pzPAfy', 'rocketpunch-bugs-4090900'],
  ['cherrybullet', 'P.O.W! (Play On the World)', 'recvxyH5pza4kq', 'cherrybullet-bugs-4084323'],
  ['weeekly', 'LIGHTS ON', 'recvxyH5pzCrq5', 'weeekly-bugs-4104137'],
];

test('home hero links open the exact MV before the original release in reading and tab order', async () => {
  for (const [slug, title, workId, releaseId] of heroWorks) {
    const group = reactGroups.find(item=>item.slug===slug);
    const hero = groups.get(slug).hero;
    const query = {section:'overview'};
    const pages = [await renderArtist(group,query,null,{loading:true}),await renderArtist(group,query)];
    for (const html of pages) {
      const document = parse(html);
      const mv = document.querySelector(hero.video);
      const release = document.querySelector(hero.release);
      assert.ok(mv && release, slug+' must offer both destinations');
      const firstWork = document.querySelector('main').querySelectorAll('a[href]').find(link=>{
        const url = new URL(link.getAttribute('href'),'https://site.invalid');
        return ['work','media','release'].some(key=>url.searchParams.has(key));
      });
      assert.equal(firstWork,mv,slug+' first individual work or release action');
      const links = document.querySelectorAll('a[href],button');
      assert.ok(links.indexOf(mv) >= 0 && links.indexOf(mv) < links.indexOf(release), slug+' hero order');
      for (const link of [mv,release]) {
        assert.equal(link.tagName,'A');
        assert.equal(link.getAttribute('target'),undefined);
        assert.equal(link.getAttribute('tabindex'),undefined);
      }
      assert.ok(mv.text.includes(title) && mv.text.includes('MV'), slug+' identifies its video');
      assert.equal(mv.querySelector('img'),null, slug+' keeps the album art on the release');
      const watch = new URL(mv.getAttribute('href'),'https://site.invalid');
      assert.equal(watch.origin,'https://site.invalid');
      assert.equal(watch.pathname,'/');
      assert.equal(watch.searchParams.get('work'),workId);
      assert.equal(watch.searchParams.get('returnTo'),group.path+'?section=overview');
      const album = new URL(release.getAttribute('href'),'https://site.invalid');
      assert.equal(album.pathname,group.path);
      assert.equal(album.searchParams.get('release'),releaseId);
    }
  }
});

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

test('IZ*ONE Panorama hero and film card share the verified work and source fallback', async () => {
  const group = reactGroups.find(item => item.slug === 'izone');
  const panorama = cases.find(card => card.slug === 'izone' && card.sourceVideoId === 'G8GaQdW2wHc');
  const {artistCatalog} = require('./fixtures/current-artist-pages.cjs');
  const catalog = artistCatalog(group);
  const work = catalog.works.find(item => item.id === panorama.workId);
  const source = require('../data/izone-public.json').media.find(film => film.id === panorama.card).url;
  for (const [data, expected] of [
    [null, panorama.initial],
    [catalog, panorama.ready],
    [{...catalog, works: catalog.works.filter(item => item.id !== work.id)}, source],
    [{...catalog, works: [...catalog.works, {...work, id: 'recDuplicate'}]}, source],
  ]) {
    const document = parse(await renderArtist(group, {}, data, {loading: data === null}));
    const hero = document.querySelector('.iz-screen-rail a');
    const card = primaryAction(document, panorama);
    for (const link of [hero, card]) {
      assert.equal(link.getAttribute('href'), expected);
      assert.equal(link.getAttribute('target'), expected === source ? '_blank' : undefined);
    }
  }
});
