const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {parse} = require('next/dist/compiled/node-html-parser');
const {registry, nativeSlugs, artistCatalog, renderArtist} = require('./fixtures/current-artist-pages.cjs');
const covers = require('../data/runtime/mv-public-covers.json');
const works = require('../data/stages/inventory.json').works;
const artwork = require('../data/music-index-artwork.json');

const reviewedBySource = new Map(covers.filter(cover => cover.sourceCrop).map(cover => [cover.src, cover]));
const editorialVideos = {
  atheart: require('../data/atheart-review-editorial.json').videos,
  witchx: require('../data/witchx-native-design.json').works,
};
const groupBySlug = new Map(registry.map(group => [group.slug, group]));
const homeAndDirectory = [{}, {section: 'works'}, {section: 'works', format: 'mv'}];

test('Kep1er pairs every listed film and stage with its own picture, title, destination and return', async () => {
  const group=groupBySlug.get('kep1er'), catalog=artistCatalog(group);
  for(const query of [...homeAndDirectory,{section:'works',format:'stage'}]){
    const html=parse(await renderArtist(group,query,catalog));
    const rows=html.querySelectorAll('.kf-work-row');
    const stageOnly=query.format==='stage';
    assert.equal(rows.length,stageOnly?15:query.section?16:3);
    for(const row of rows){
      const id=row.getAttribute('data-work-id'),work=catalog.works.find(item=>item.id===id);
      const main=row.querySelector('a.kf-work-main'), image=main.querySelector('.kf-work-photo img');
      const primary=new URL(main.getAttribute('href'),'https://artist.test');
      const from=group.path+(query.section?'?'+new URLSearchParams(query):'');
      assert.equal(main.querySelector('h3').text,work.song||work.name);
      assert.ok(image.getAttribute('src').startsWith('/artist/'),id);
      assert.ok(fs.existsSync('public'+image.getAttribute('src')),image.getAttribute('src'));
      const videoId=stageOnly?work.stage?.videoId:covers.find(cover=>cover.workId===id)?.videoId;
      assert.ok(videoId&&image.getAttribute('src').includes(videoId),id);
      assert.equal(primary.searchParams.get('work'),id);
      assert.equal(primary.searchParams.get('video'),stageOnly?'stage':null);
      assert.equal(primary.searchParams.get('returnTo'),from);
      const date=main.querySelector('time');
      assert.equal(date?.getAttribute('datetime'),stageOnly?work.stage?.publishedDate:work.releaseDate);
      if(stageOnly&&date) assert.ok(date.text.startsWith('视频发布 '));
      const links=row.querySelectorAll('a[href]');
      assert.equal(new Set(links.map(link=>link.getAttribute('href'))).size,links.length);
      const secondary=row.querySelector('a.kf-work-stage');
      if(secondary){
        const stage=new URL(secondary.getAttribute('href'),'https://artist.test');
        assert.ok(work.stage||work.stageSupplement?.alternatives.length);
        assert.equal(stage.searchParams.get('work'),id);
        assert.equal(stage.searchParams.get('video'),'stage');
        assert.equal(stage.searchParams.get('returnTo'),from);
      }
    }
    if(!query.section){
      assert.deepEqual(rows.map(row=>row.querySelector('img').getAttribute('src').split('/').at(-1)),
        ['AMwK8YGZGnU.jpg','MZm4qcvbvbQ.jpg','3nMOUzBZ0ZI.jpg']);
      assert.equal(html.querySelector('.kf-selected-release .kf-cover img').getAttribute('src'),'/artist/kep1er/editorial-20261018/crack-code-cover.jpg');
      const selected=html.querySelector('.kf-selected-release');
      assert.equal(selected.querySelector('a').getAttribute('href'),'https://kep1er.jp/discography/crackcode/');
      const browse=selected.querySelector('button.kf-release-browse');
      assert.equal(browse.text.trim(),'浏览发行与影像 →');
      assert.equal(browse.querySelector('[aria-hidden="true"]').text,'→');
      assert.equal(browse.querySelector('.kf-control-art'),null);
      assert.equal(html.querySelectorAll('.kf-release-track').length,1);
    }
  }
});

test('every artist group keeps reviewed video artwork inside its own picture and preserves the source', async t => {
  const groups = [];
  const located = new Set();

  for (const group of registry) {
    const groupWorks = works.filter(work => work.groupIds.includes(group.groupId));
    const workIds = new Set(groupWorks.map(work => work.recordId));
    const extraVideos = (editorialVideos[group.slug] ?? []).map(item => item.videoId ?? new URL(item.url).searchParams.get('v'));
    const sources = [...reviewedBySource.values()].filter(cover => workIds.has(cover.workId) || extraVideos.includes(cover.videoId));
    sources.forEach(cover => located.add(cover.videoId));

    const catalog = artistCatalog(group);
    const routes = [];
    for (const query of homeAndDirectory) {
      const page = parse(await renderArtist(group, query, catalog));
      const hasContent = Boolean(page.querySelector('main'));
      assert.equal(hasContent, !nativeSlugs.has(group.slug), group.slug);
      const images = page.querySelectorAll('img[src]');
      const marked = images.filter(image => image.hasAttribute('data-video-cover-cropped'));
      const expected = images.filter(image => reviewedBySource.has(image.getAttribute('src')));
      assert.deepEqual(marked.map(image => image.getAttribute('src')), expected.map(image => image.getAttribute('src')), group.slug);
      for (const image of marked) {
        const style = image.getAttribute('style') ?? '';
        assert.match(style, /object-view-box:inset\(/, image.getAttribute('src'));
        assert.doesNotMatch(style, /transform\s*:/, image.getAttribute('src'));
      }
      routes.push({query: new URLSearchParams(query).toString(), serverContent: hasContent, croppedImages: marked.length});
    }
    groups.push({slug: group.slug, catalogWorks: groupWorks.length, reviewedCrops: sources.map(cover => cover.videoId), routes});
  }

  assert.equal(groups.length, 51);
  assert.deepEqual(located, new Set([...reviewedBySource.values()].map(cover => cover.videoId)));
  assert.ok(groups.find(row => row.slug === 'genblue').routes[0].croppedImages > 0);
  const report = {
    groupCount: groups.length,
    registryCovers: covers.length,
    reviewedCrops: reviewedBySource.size,
    groupsWithReviewedCrops: groups.filter(group => group.reviewedCrops.length).length,
    routeRenders: groups.length * homeAndDirectory.length,
    scope: 'Local React route renders. Native izna, ifeye and udtt render after hydration; their video IDs were checked in the catalog. A source may occur on several routes.',
    groups,
  };
  if (process.env.IDOL_COVER_CROP_REPORT) {
    fs.writeFileSync(process.env.IDOL_COVER_CROP_REPORT, JSON.stringify(report, null, 2) + '\n');
  }
  t.diagnostic(`${report.groupsWithReviewedCrops} groups have ${report.reviewedCrops} reviewed sources; ${report.routeRenders} routes rendered`);
});

test('UNIS gives its first three MVs matching artwork and a direct player before the release covers', async () => {
  const page = parse(await renderArtist(groupBySlug.get('unis')));
  const shelf = page.querySelector('.uf-home-films');
  const releases = page.querySelector('.uf-home-releases');
  assert.ok(shelf && releases);

  const items = shelf.querySelectorAll('.uf-film-grid a');
  assert.equal(items.length, 3);
  for (const item of items) {
    const workId = new URL(item.getAttribute('href'), 'https://test.invalid').searchParams.get('work');
    assert.equal(item.querySelector('img').getAttribute('src'), covers.find(cover => cover.workId === workId).src);
    assert.ok(item.querySelector('h3')?.text.trim());
  }
  const html = page.toString();
  assert.ok(html.indexOf(shelf.toString()) < html.indexOf(releases.toString()));
  assert.ok(releases.querySelector('.uf-featured-release img'));
  assert.ok(releases.querySelector('.uf-home-release-list img'));
});

test('VVUP presents the larger release photo, one viewing action per card and statistics detail on request', async () => {
  const group = groupBySlug.get('vvup');
  const page = parse(await renderArtist(group));
  const hero = page.querySelector('.vu-hero');
  const photo = artwork.find(row => row.slug === group.slug);
  assert.equal(hero.querySelector('figure img').getAttribute('src'), photo.image);
  assert.equal(hero.querySelector('figcaption a').getAttribute('href'), photo.sourceUrl);
  assert.doesNotMatch(hero.text, /认识成员|进入影像/);

  const cards = page.querySelectorAll('.vu-video');
  assert.ok(cards.length > 0);
  for (const card of cards) {
    const watch = card.querySelector('a.vu-watch');
    assert.ok(watch.querySelector('img') && watch.querySelector('h3'));
    assert.equal(card.querySelectorAll('.vu-play').length, 1);
    assert.equal(card.querySelector('.vu-video-type'), null);
    const equivalentLinks = card.querySelectorAll('a').filter(link => link.getAttribute('href') === watch.getAttribute('href'));
    assert.equal(equivalentLinks.length, 1);
  }
  const stats = page.querySelector('.group-information');
  assert.match(stats.querySelector('details').text, /2024-04-21|第.?17.?周/);
  assert.doesNotMatch(stats.querySelector('.group-info-grid').text, /统计周|第.?17.?周/);
});

test('YOUNG POSSE keeps each title beside its own source artwork and opens the corresponding work in one action', async () => {
  const group = groupBySlug.get('youngposse');
  for (const query of [{}, {section: 'works', format: 'mv'}]) {
    const page = parse(await renderArtist(group, query));
    const cards = page.querySelectorAll('.video-row');
    assert.ok(cards.length >= 3);
    for (const card of cards) {
      const links = card.querySelectorAll('a');
      assert.equal(links.length, 1);
      const link = links[0];
      const url = new URL(link.getAttribute('href'), 'https://test.invalid');
      assert.equal(url.origin, 'https://test.invalid');
      assert.ok(link.querySelector('.yp-video-art img') && link.querySelector('.video-copy h3')?.text.trim());
      assert.ok(url.searchParams.has('work') || url.searchParams.has('media'));
    }
  }
});
